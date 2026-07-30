import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface ApplicationMessage {
  id: number;
  applicationId: number;
  senderId: string;
  message: string;
  isRead: boolean | null;
  createdAt: string | null;
}

export function ApplicationChatDialog({
  applicationId,
  otherPartyName,
  jobTitle,
  open,
  onOpenChange,
}: {
  applicationId: number | null;
  otherPartyName: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messagesKey = `/api/applications/${applicationId}/messages`;

  const { data: messages = [], isLoading } = useQuery<ApplicationMessage[]>({
    queryKey: [messagesKey],
    enabled: open && applicationId !== null,
    refetchInterval: open ? 5000 : false,
  });

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", messagesKey, { message });
      return res.json();
    },
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: [messagesKey] });
    },
    onError: (error: Error) => {
      toast({ title: "Message not sent", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, open]);

  // Refresh unread badges when messages are loaded (server marks them read) and when the dialog closes
  useEffect(() => {
    if (applicationId !== null) {
      queryClient.invalidateQueries({ queryKey: ["/api/application-messages/unread-counts"] });
    }
  }, [open, applicationId, messages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sendMessage.isPending) return;
    sendMessage.mutate(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            {otherPartyName}
          </DialogTitle>
          <DialogDescription className="truncate">Regarding: {jobTitle}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[45vh] space-y-3 py-2 pr-1">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading messages…</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation — for follow-ups or a quick briefing on the decision.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === user?.id;
              return (
                <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words ${
                      isMine
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    <p>{m.message}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {m.createdAt ? format(new Date(m.createdAt), "d MMM, h:mm a") : ""}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex items-end gap-2 pt-2 border-t">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message…"
            className="min-h-[44px] max-h-32 resize-none"
            maxLength={2000}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!text.trim() || sendMessage.isPending}
            className="shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Poll unread message counts for a set of application IDs. Returns { [applicationId]: count } */
export function useApplicationUnreadCounts(applicationIds: number[]) {
  const ids = [...applicationIds].sort((a, b) => a - b).join(",");
  return useQuery<Record<number, number>>({
    queryKey: ["/api/application-messages/unread-counts", ids],
    queryFn: async () => {
      if (!ids) return {};
      const res = await fetch(`/api/application-messages/unread-counts?ids=${ids}`, { credentials: "include" });
      if (!res.ok) return {};
      return res.json();
    },
    enabled: applicationIds.length > 0,
    refetchInterval: 30000,
  });
}

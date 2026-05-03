import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-extension";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/use-page-title";
import type { ChatConversation, ChatMessage } from "@/lib/types";
import { MessageCircle, Send, X, Bot, UserRound, RefreshCw, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminChats() {
  usePageTitle("Admin Chats");
  const { user } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<"open" | "closed">("open");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  if (user && user.role !== "admin") return <Redirect to="/dashboard" />;

  const { data: conversations = [], refetch } = useQuery<ChatConversation[]>({
    queryKey: ["/api/admin/chat/conversations", statusFilter],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/chat/conversations?status=${statusFilter}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: detail, refetch: refetchDetail } = useQuery<{
    conversation: ChatConversation;
    messages: ChatMessage[];
  }>({
    queryKey: ["/api/admin/chat/conversations", "detail", selectedId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/chat/conversations/${selectedId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: !!selectedId,
    refetchInterval: 4000,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [detail?.messages.length]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest(
        "POST",
        `/api/admin/chat/conversations/${selectedId}/message`,
        { content },
      );
      return res.json();
    },
    onSuccess: () => {
      setReply("");
      refetchDetail();
      refetch();
    },
    onError: (e: any) => {
      toast({ title: "Failed to send", description: e.message, variant: "destructive" });
    },
  });

  const takeoverMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST",
        `/api/admin/chat/conversations/${selectedId}/takeover`,
      );
      return res.json();
    },
    onSuccess: () => {
      refetchDetail();
      refetch();
      toast({ title: "You're now the human agent for this chat" });
    },
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST",
        `/api/admin/chat/conversations/${selectedId}/close`,
      );
      return res.json();
    },
    onSuccess: () => {
      refetchDetail();
      refetch();
      toast({ title: "Conversation closed" });
    },
  });

  const returnToBotMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST",
        `/api/admin/chat/conversations/${selectedId}/return-to-bot`,
      );
      return res.json();
    },
    onSuccess: () => {
      refetchDetail();
      refetch();
      toast({ title: "Bot is handling this chat again" });
    },
  });

  const totalUnread = conversations.reduce(
    (n, c) => n + (c.unreadForAdmin || 0),
    0,
  );

  return (
    <div>
      <PageHeader
        title="Live Chats"
        description={`Visitor chats with the assistant and human handoffs${
          totalUnread ? ` — ${totalUnread} unread` : ""
        }`}
      />

      <div className="flex gap-2 mb-4">
        <Button
          variant={statusFilter === "open" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("open")}
          data-testid="filter-open"
        >
          Open
        </Button>
        <Button
          variant={statusFilter === "closed" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("closed")}
          data-testid="filter-closed"
        >
          Closed
        </Button>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <Card className="lg:col-span-1 max-h-[75vh] overflow-y-auto">
          <CardContent className="p-2">
            {conversations.length === 0 ? (
              <div className="text-sm text-muted-foreground py-12 text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No {statusFilter} conversations.
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  data-testid={`conversation-${c.id}`}
                  className={`w-full text-left p-3 rounded-lg mb-1 hover:bg-muted/50 transition ${
                    selectedId === c.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-sm truncate">
                      {c.visitorName || c.visitorEmail || `Visitor #${c.id}`}
                    </div>
                    {(c.unreadForAdmin || 0) > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                        {c.unreadForAdmin}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={c.mode === "human" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {c.mode === "human" ? (
                        <>
                          <UserRound className="h-3 w-3 mr-1" /> human
                        </>
                      ) : (
                        <>
                          <Bot className="h-3 w-3 mr-1" /> bot
                        </>
                      )}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {c.lastMessageAt
                        ? format(new Date(c.lastMessageAt), "MMM d, HH:mm")
                        : ""}
                    </span>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Detail */}
        <Card className="lg:col-span-2 flex flex-col max-h-[75vh]">
          {!selectedId || !detail ? (
            <CardContent className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Select a conversation to view messages.
            </CardContent>
          ) : (
            <>
              <div className="border-b p-3 flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm">
                    {detail.conversation.visitorName ||
                      detail.conversation.visitorEmail ||
                      `Visitor #${detail.conversation.id}`}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Session {detail.conversation.sessionId.slice(0, 18)}… ·
                    Mode:{" "}
                    <span className="font-semibold">
                      {detail.conversation.mode}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                  {detail.conversation.mode !== "human" && (
                    <Button
                      size="sm"
                      onClick={() => takeoverMutation.mutate()}
                      disabled={takeoverMutation.isPending}
                      data-testid="button-takeover"
                    >
                      Take over
                    </Button>
                  )}
                  {detail.conversation.mode === "human" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => returnToBotMutation.mutate()}
                      disabled={returnToBotMutation.isPending}
                      data-testid="button-return-to-bot"
                    >
                      Return to bot
                    </Button>
                  )}
                  {detail.conversation.status === "open" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => closeMutation.mutate()}
                      disabled={closeMutation.isPending}
                      data-testid="button-close-chat"
                    >
                      <X className="h-4 w-4 mr-1" /> Close
                    </Button>
                  )}
                </div>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/20"
              >
                {detail.messages.map((m) => (
                  <AdminMessageBubble key={m.id} m={m} />
                ))}
              </div>

              {detail.conversation.status === "open" ? (
                <div className="border-t p-2 flex items-end gap-2">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (reply.trim()) sendMutation.mutate(reply.trim());
                      }
                    }}
                    placeholder={
                      detail.conversation.mode === "human"
                        ? "Reply to the visitor…"
                        : "Type to take over and reply…"
                    }
                    rows={1}
                    data-testid="input-admin-reply"
                    className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 max-h-28"
                  />
                  <Button
                    size="icon"
                    onClick={() => reply.trim() && sendMutation.mutate(reply.trim())}
                    disabled={!reply.trim() || sendMutation.isPending}
                    data-testid="button-send-admin-reply"
                  >
                    {sendMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <div className="border-t p-3 text-center text-xs text-muted-foreground">
                  Conversation closed.
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function AdminMessageBubble({ m }: { m: ChatMessage }) {
  if (m.sender === "system") {
    return (
      <div className="text-center text-[11px] text-muted-foreground italic py-1">
        {m.content}
      </div>
    );
  }
  const isVisitor = m.sender === "user";
  const isAdmin = m.sender === "admin";
  return (
    <div className={`flex ${isVisitor ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
          isVisitor
            ? "bg-white border rounded-bl-sm"
            : isAdmin
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-emerald-100 text-emerald-950 border border-emerald-200 rounded-br-sm"
        }`}
      >
        <div className="text-[10px] uppercase tracking-wide opacity-70 mb-0.5">
          {isVisitor ? "Visitor" : isAdmin ? "You / Team" : "Assistant"}
          {m.createdAt
            ? ` · ${format(new Date(m.createdAt), "HH:mm")}`
            : ""}
        </div>
        {m.content}
      </div>
    </div>
  );
}

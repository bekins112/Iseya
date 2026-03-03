import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    refetchInterval: 30000,
  });

  const { data: notifications = [], isLoading } = useQuery<NotificationItem[]>({
    queryKey: ["/api/notifications"],
    enabled: open,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const markRead = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const unreadCount = unreadData?.count || 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-notification-bell">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center" data-testid="badge-unread-count">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" data-testid="popover-notifications">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[360px]">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground text-sm">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm" data-testid="text-no-notifications">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50 ${!notif.isRead ? "bg-primary/5" : ""}`}
                  onClick={() => {
                    if (!notif.isRead) markRead.mutate(notif.id);
                  }}
                  data-testid={`notification-item-${notif.id}`}
                >
                  <div className="flex items-start gap-2">
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-tight ${!notif.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {notif.createdAt && formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          markRead.mutate(notif.id);
                        }}
                        data-testid={`button-mark-read-${notif.id}`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

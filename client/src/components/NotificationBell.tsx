import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const ref = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    refetchInterval: 30000,
  });
  const unreadCount = unreadData?.count || 0;

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(!open)}
        data-testid="button-notification-bell"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            data-testid="badge-unread-count"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[100] md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 flex items-end md:items-start justify-center md:justify-end"
          data-testid="dropdown-notifications"
        >
          <div
            className="fixed inset-0 bg-black/30 md:hidden"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full md:w-96 max-h-[85vh] md:max-h-[480px] bg-background border rounded-t-2xl md:rounded-xl shadow-2xl flex flex-col z-[101] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <h3 className="font-semibold text-base">Notifications</h3>
              <div className="flex items-center gap-1">
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 md:hidden"
                  onClick={() => setOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm" data-testid="text-no-notifications">
                  <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notif) => {
                    const isExpanded = expandedId === notif.id;
                    return (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50 ${!notif.isRead ? "bg-primary/5" : ""}`}
                        onClick={() => {
                          if (!notif.isRead) markRead.mutate(notif.id);
                          setExpandedId(isExpanded ? null : notif.id);
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
                            <p className={`text-xs text-muted-foreground mt-1 break-words whitespace-pre-wrap ${isExpanded ? "" : "line-clamp-2"}`}>
                              {notif.message}
                            </p>
                            {!isExpanded && notif.message && notif.message.length > 80 && (
                              <span className="text-[10px] text-primary font-medium">Tap to read more</span>
                            )}
                            <p className="text-[10px] text-muted-foreground/70 mt-1">
                              {notif.createdAt && formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          {!notif.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
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
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-extension";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Ticket, Clock, AlertCircle, CheckCircle2, XCircle, MoreVertical, MessageSquare, User, Mail, Send, Shield, Paperclip, FileText, Image, X, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Ticket as TicketType, TicketMessage } from "@shared/schema";
import { format } from "date-fns";
import { usePageTitle } from "@/hooks/use-page-title";

type TicketWithSender = TicketType & { senderName?: string; senderEmail?: string; senderRole?: string };

export default function AdminTickets() {
  usePageTitle("Admin Tickets");
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<TicketWithSender | null>(null);
  const [editForm, setEditForm] = useState({
    status: "open" as string,
    priority: "medium" as string,
  });
  const [replyText, setReplyText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: tickets = [], isLoading } = useQuery<TicketWithSender[]>({
    queryKey: ["/api/admin/tickets", statusFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      const qs = params.toString();
      const res = await fetch(`/api/admin/tickets${qs ? `?${qs}` : ""}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tickets");
      return res.json();
    },
  });

  const { data: unreadCounts = {} } = useQuery<Record<number, number>>({
    queryKey: ["/api/tickets/unread-counts"],
    refetchInterval: 15000,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery<TicketMessage[]>({
    queryKey: ["/api/tickets", selectedTicket?.id, "messages"],
    queryFn: async () => {
      if (!selectedTicket) return [];
      const res = await fetch(`/api/tickets/${selectedTicket.id}/messages`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!selectedTicket,
    refetchInterval: selectedTicket ? 10000 : false,
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedTicket) {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets/unread-counts"] });
    }
  }, [selectedTicket]);

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<TicketType> }) => {
      return apiRequest("PATCH", `/api/admin/tickets/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      toast({ title: "Ticket updated successfully" });
      setShowSettings(false);
    },
    onError: () => {
      toast({ title: "Failed to update ticket", variant: "destructive" });
    },
  });

  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendReply = useMutation({
    mutationFn: async ({ text, file }: { text: string; file: File | null }) => {
      if (!selectedTicket) throw new Error("No ticket selected");
      const formData = new FormData();
      if (text) formData.append("message", text);
      if (file) formData.append("attachment", file);
      const res = await fetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to send");
      }
      return res.json();
    },
    onSuccess: () => {
      setReplyText("");
      setAttachedFile(null);
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["/api/tickets/unread-counts"] });
    },
    onError: (err) => {
      toast({ title: "Failed to send reply", description: err.message, variant: "destructive" });
    },
  });

  if (user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const filteredTickets = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      t.subject?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.senderName?.toLowerCase().includes(q) ||
      t.senderEmail?.toLowerCase().includes(q) ||
      String(t.id).includes(q);
    return matchesSearch;
  });

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;
  const externalCount = tickets.filter(t => t.isExternal).length;

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "open": return <Clock className="w-4 h-4" />;
      case "in_progress": return <AlertCircle className="w-4 h-4" />;
      case "resolved": return <CheckCircle2 className="w-4 h-4" />;
      case "closed": return <XCircle className="w-4 h-4" />;
      default: return <Ticket className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "in_progress": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "resolved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "closed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const openTicketDialog = (ticket: TicketWithSender) => {
    setSelectedTicket(ticket);
    setEditForm({
      status: ticket.status || "open",
      priority: ticket.priority || "medium",
    });
    setReplyText("");
    setShowSettings(false);
  };

  const handleSaveSettings = () => {
    if (!selectedTicket) return;
    updateTicketMutation.mutate({
      id: selectedTicket.id,
      updates: editForm,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets"
        description="Manage user support requests"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Open</span>
            </div>
            <p className="text-2xl font-bold">{openCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-muted-foreground">In Progress</span>
            </div>
            <p className="text-2xl font-bold">{inProgressCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Resolved</span>
            </div>
            <p className="text-2xl font-bold">{resolvedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">External</span>
            </div>
            <p className="text-2xl font-bold">{externalCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-tickets"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]" data-testid="select-ticket-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]" data-testid="select-ticket-priority">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No tickets found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTickets.map((ticket) => {
                const unread = unreadCounts[ticket.id] || 0;
                return (
                  <div
                    key={ticket.id}
                    className={`flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer ${unread > 0 ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}
                    onClick={() => openTicketDialog(ticket)}
                    data-testid={`ticket-row-${ticket.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">#{ticket.id}</span>
                        <p className="font-medium truncate">{ticket.subject}</p>
                        <Badge className={getStatusColor(ticket.status)} variant="secondary">
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1 capitalize">{ticket.status}</span>
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)} variant="secondary">
                          <span className="capitalize">{ticket.priority}</span>
                        </Badge>
                        {ticket.isExternal && (
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" variant="secondary">
                            <Mail className="w-3 h-3 mr-1" />
                            External
                          </Badge>
                        )}
                        {unread > 0 && (
                          <Badge className="bg-red-500 text-white text-[10px] animate-pulse">
                            {unread} new
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {ticket.senderName || "Unknown"}
                          {ticket.senderRole && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 ml-1 capitalize">{ticket.senderRole}</Badge>
                          )}
                        </span>
                        {ticket.senderEmail && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {ticket.senderEmail}
                          </span>
                        )}
                        <span>Category: {ticket.category || "General"}</span>
                        {ticket.createdAt && (
                          <span>Created: {format(new Date(ticket.createdAt), "MMM d, yyyy")}</span>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" data-testid={`button-ticket-menu-${ticket.id}`}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openTicketDialog(ticket); }}>
                          View / Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            updateTicketMutation.mutate({ id: ticket.id, updates: { status: "in_progress" } });
                          }}
                        >
                          Mark In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            updateTicketMutation.mutate({ id: ticket.id, updates: { status: "resolved" } });
                          }}
                        >
                          Mark Resolved
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Conversation Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => { setSelectedTicket(null); setReplyText(""); setShowSettings(false); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          {selectedTicket && (
            <>
              <div className="px-6 pt-6 pb-3 border-b shrink-0">
                <DialogHeader>
                  <DialogTitle className="text-base">Ticket #{selectedTicket.id}: {selectedTicket.subject}</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge className={`${getStatusColor(selectedTicket.status)} gap-1 text-[10px]`}>
                    {getStatusIcon(selectedTicket.status)}
                    <span className="ml-1 capitalize">{selectedTicket.status}</span>
                  </Badge>
                  <Badge className={`${getPriorityColor(selectedTicket.priority)} text-[10px]`}>
                    {selectedTicket.priority}
                  </Badge>
                  {selectedTicket.isExternal && (
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-[10px]">
                      <Mail className="w-3 h-3 mr-1" />
                      External (Contact Form)
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {selectedTicket.isExternal ? selectedTicket.externalName || "External Contact" : selectedTicket.senderName || "Unknown"}
                  </span>
                  {(selectedTicket.isExternal ? selectedTicket.externalEmail : selectedTicket.senderEmail) && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {selectedTicket.isExternal ? selectedTicket.externalEmail : selectedTicket.senderEmail}
                    </span>
                  )}
                  {selectedTicket.senderRole && !selectedTicket.isExternal && (
                    <Badge variant="outline" className="capitalize text-[10px]">{selectedTicket.senderRole}</Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] ml-auto"
                    onClick={() => setShowSettings(!showSettings)}
                    data-testid="button-toggle-ticket-settings"
                  >
                    {showSettings ? "Hide Settings" : "Status / Priority"}
                  </Button>
                </div>

                {showSettings && (
                  <div className="mt-3 p-3 border rounded-lg bg-muted/30 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Status</Label>
                        <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                          <SelectTrigger className="h-8 text-xs" data-testid="select-edit-ticket-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Priority</Label>
                        <Select value={editForm.priority} onValueChange={(v) => setEditForm({ ...editForm, priority: v })}>
                          <SelectTrigger className="h-8 text-xs" data-testid="select-edit-ticket-priority">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="h-7 text-xs w-full"
                      onClick={handleSaveSettings}
                      disabled={updateTicketMutation.isPending}
                      data-testid="button-save-ticket-settings"
                    >
                      {updateTicketMutation.isPending ? "Saving..." : "Update Status / Priority"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-[200px] max-h-[50vh]">
                {/* Original description */}
                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-semibold text-muted-foreground">{selectedTicket.senderName || "User"}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">{selectedTicket.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {selectedTicket.createdAt && format(new Date(selectedTicket.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>

                {/* Conversation messages */}
                {messages.map((msg) => {
                  const isAdmin = msg.senderRole === "admin";
                  const isImage = msg.attachmentName && /\.(jpg|jpeg|png|webp|gif)$/i.test(msg.attachmentName);
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        isAdmin
                          ? "bg-primary/10 rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      }`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          {isAdmin ? (
                            <>
                              <Shield className="w-3 h-3 text-primary" />
                              <span className="text-[10px] font-semibold text-primary">You (Admin)</span>
                            </>
                          ) : (
                            <>
                              <User className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] font-semibold text-muted-foreground">
                                {selectedTicket.isExternal ? (selectedTicket.externalName || "External Contact") : (selectedTicket.senderName || "User")}
                              </span>
                              {msg.senderRole === "external" && (
                                <span className="text-[9px] text-purple-600 dark:text-purple-400">(via Contact Form)</span>
                              )}
                            </>
                          )}
                        </div>
                        {msg.message && !msg.message.startsWith("Attached: ") && (
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        )}
                        {msg.attachmentUrl && (
                          <div className="mt-1">
                            {isImage ? (
                              <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={msg.attachmentUrl}
                                  alt={msg.attachmentName || "Attachment"}
                                  className="max-w-[200px] max-h-[200px] rounded-lg object-cover border cursor-pointer hover:opacity-90"
                                  data-testid={`img-attachment-${msg.id}`}
                                />
                              </a>
                            ) : (
                              <a
                                href={msg.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-background/60 rounded-lg border text-xs hover:bg-background/80 transition-colors"
                                data-testid={`link-attachment-${msg.id}`}
                              >
                                <FileText className="w-4 h-4 text-primary shrink-0" />
                                <span className="truncate">{msg.attachmentName}</span>
                                <Download className="w-3 h-3 text-muted-foreground shrink-0" />
                              </a>
                            )}
                          </div>
                        )}
                        <p className={`text-[10px] text-muted-foreground mt-1 ${isAdmin ? "text-right" : ""}`}>
                          {msg.createdAt && format(new Date(msg.createdAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              <div className="px-6 py-3 border-t shrink-0">
                {selectedTicket?.isExternal && (
                  <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg text-xs text-purple-700 dark:text-purple-300">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span>Replies will be sent via email to <strong>{selectedTicket.externalEmail}</strong></span>
                  </div>
                )}
                {attachedFile && (
                  <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-muted rounded-lg text-xs">
                    {/\.(jpg|jpeg|png|webp|gif)$/i.test(attachedFile.name) ? (
                      <Image className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                    )}
                    <span className="truncate flex-1">{attachedFile.name}</span>
                    <span className="text-muted-foreground shrink-0">
                      {(attachedFile.size / 1024).toFixed(0)}KB
                    </span>
                    <button
                      onClick={() => setAttachedFile(null)}
                      className="shrink-0 hover:text-destructive"
                      data-testid="button-remove-admin-attachment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        toast({ title: "File too large", description: "Maximum file size is 10MB", variant: "destructive" });
                        return;
                      }
                      setAttachedFile(file);
                    }
                    e.target.value = "";
                  }}
                  data-testid="input-admin-file-attachment"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 h-[44px] w-[44px]"
                    data-testid="button-admin-attach-file"
                    title="Attach file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={selectedTicket?.isExternal ? "Type your reply (will be sent via email)..." : "Type your reply to the user..."}
                    className="min-h-[44px] max-h-[100px] resize-none text-sm"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (replyText.trim() || attachedFile) sendReply.mutate({ text: replyText.trim(), file: attachedFile });
                      }
                    }}
                    data-testid="textarea-admin-reply"
                  />
                  <Button
                    size="icon"
                    onClick={() => sendReply.mutate({ text: replyText.trim(), file: attachedFile })}
                    disabled={(!replyText.trim() && !attachedFile) || sendReply.isPending}
                    className="shrink-0 h-[44px] w-[44px]"
                    data-testid="button-send-admin-reply"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

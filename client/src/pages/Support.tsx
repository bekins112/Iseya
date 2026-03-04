import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/ui-extension";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  HelpCircle,
  Send,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Mail,
  Plus,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion } from "framer-motion";
import type { Ticket, TicketMessage } from "@shared/schema";

const ticketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(20, "Please describe your issue in detail (at least 20 characters)"),
  category: z.string().min(1, "Please select a category"),
  priority: z.string().default("medium"),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

const categories = [
  { value: "general", label: "General Inquiry" },
  { value: "account", label: "Account Issues" },
  { value: "payment", label: "Payment & Billing" },
  { value: "job", label: "Job Listings" },
  { value: "technical", label: "Technical Problem" },
];

function getStatusInfo(status: string | null) {
  switch (status) {
    case "open":
      return { label: "Open", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Clock };
    case "in_progress":
      return { label: "In Progress", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: AlertCircle };
    case "resolved":
      return { label: "Resolved", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle2 };
    case "closed":
      return { label: "Closed", color: "bg-muted text-muted-foreground", icon: XCircle };
    default:
      return { label: "Open", color: "bg-blue-100 text-blue-800", icon: Clock };
  }
}

function getPriorityColor(priority: string | null) {
  switch (priority) {
    case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default: return "bg-muted text-muted-foreground";
  }
}

export default function Support() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets/my"],
  });

  const { data: unreadCounts = {} } = useQuery<Record<number, number>>({
    queryKey: ["/api/tickets/unread-counts"],
    refetchInterval: 15000,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery<TicketMessage[]>({
    queryKey: ["/api/tickets", viewingTicket?.id, "messages"],
    queryFn: async () => {
      if (!viewingTicket) return [];
      const res = await fetch(`/api/tickets/${viewingTicket.id}/messages`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!viewingTicket,
    refetchInterval: viewingTicket ? 10000 : false,
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (viewingTicket) {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets/unread-counts"] });
    }
  }, [viewingTicket]);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      description: "",
      category: "",
      priority: "medium",
    },
  });

  const createTicket = useMutation({
    mutationFn: async (data: TicketFormValues) => {
      const res = await apiRequest("POST", "/api/tickets", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets/my"] });
      form.reset();
      setShowForm(false);
      toast({ title: "Ticket submitted", description: "We've received your support request. You'll be notified of any updates." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit your ticket. Please try again.", variant: "destructive" });
    },
  });

  const sendReply = useMutation({
    mutationFn: async () => {
      if (!viewingTicket || !replyText.trim()) return;
      const res = await apiRequest("POST", `/api/tickets/${viewingTicket.id}/messages`, { message: replyText.trim() });
      return res.json();
    },
    onSuccess: () => {
      setReplyText("");
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["/api/tickets/unread-counts"] });
    },
    onError: () => {
      toast({ title: "Failed to send reply", variant: "destructive" });
    },
  });

  const onSubmit = (data: TicketFormValues) => {
    createTicket.mutate(data);
  };

  const openCount = tickets.filter(t => t.status === "open" || t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;
  const totalUnread = Object.values(unreadCounts).reduce((sum, c) => sum + c, 0);

  return (
    <div className="space-y-8 pb-10" data-testid="support-page">
      <PageHeader
        title="Support"
        description="Get help or report an issue"
        actions={
          <Button className="gap-2" onClick={() => setShowForm(true)} data-testid="button-new-ticket">
            <Plus className="w-4 h-4" /> New Ticket
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{tickets.length}</p>
              <p className="text-xs text-muted-foreground">Total Tickets</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{openCount}</p>
              <p className="text-xs text-muted-foreground">Open / In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{resolvedCount}</p>
              <p className="text-xs text-muted-foreground">Resolved / Closed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-dashed border-2 border-muted-foreground/20 bg-muted/20">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-semibold text-sm">Need urgent help?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Email us directly at <a href="mailto:support@iseya.com" className="text-primary font-medium hover:underline">support@iseya.com</a> or submit a ticket below and we'll get back to you as soon as possible.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Your Tickets
          {totalUnread > 0 && (
            <Badge className="bg-red-500 text-white text-[10px] ml-1">{totalUnread} new</Badge>
          )}
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-16 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-bold mb-2">No tickets yet</h3>
              <p className="text-muted-foreground mb-4 text-sm">Have a question or need help? Submit a support ticket.</p>
              <Button className="gap-2" onClick={() => setShowForm(true)} data-testid="button-first-ticket">
                <Plus className="w-4 h-4" /> Submit Your First Ticket
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket, idx) => {
              const statusInfo = getStatusInfo(ticket.status);
              const StatusIcon = statusInfo.icon;
              const unread = unreadCounts[ticket.id] || 0;
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className={`hover:shadow-md transition-all cursor-pointer ${unread > 0 ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}
                    onClick={() => setViewingTicket(ticket)}
                    data-testid={`ticket-item-${ticket.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-mono text-muted-foreground">#{ticket.id}</span>
                            <p className="font-semibold text-sm truncate">{ticket.subject}</p>
                            <Badge className={`${statusInfo.color} text-[10px] gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </Badge>
                            <Badge className={`${getPriorityColor(ticket.priority)} text-[10px]`}>
                              {ticket.priority}
                            </Badge>
                            {unread > 0 && (
                              <Badge className="bg-red-500 text-white text-[10px] animate-pulse">
                                {unread} new {unread === 1 ? "reply" : "replies"}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{ticket.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                            <span className="capitalize">{ticket.category || "General"}</span>
                            {ticket.createdAt && (
                              <span>{format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Submit a Support Ticket
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief summary of your issue" {...field} data-testid="input-ticket-subject" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-ticket-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-ticket-priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your issue in detail. Include any relevant information like error messages, steps to reproduce, etc."
                        className="min-h-[120px] resize-none"
                        {...field}
                        data-testid="textarea-ticket-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTicket.isPending} data-testid="button-submit-ticket">
                  {createTicket.isPending ? "Submitting..." : "Submit Ticket"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Ticket Conversation Dialog */}
      <Dialog open={!!viewingTicket} onOpenChange={() => { setViewingTicket(null); setReplyText(""); }}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
          {viewingTicket && (() => {
            const statusInfo = getStatusInfo(viewingTicket.status);
            const StatusIcon = statusInfo.icon;
            return (
              <>
                <div className="px-6 pt-6 pb-3 border-b shrink-0">
                  <DialogHeader>
                    <DialogTitle className="text-base">Ticket #{viewingTicket.id}: {viewingTicket.subject}</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className={`${statusInfo.color} gap-1 text-[10px]`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </Badge>
                    <Badge className={`${getPriorityColor(viewingTicket.priority)} text-[10px]`}>
                      {viewingTicket.priority}
                    </Badge>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {viewingTicket.category || "General"}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-[200px] max-h-[50vh]">
                  {/* Original description as first message */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] bg-primary/10 rounded-2xl rounded-tr-sm px-4 py-2.5">
                      <p className="text-sm whitespace-pre-wrap break-words">{viewingTicket.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 text-right">
                        {viewingTicket.createdAt && format(new Date(viewingTicket.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>

                  {/* Admin notes as legacy reply */}
                  {viewingTicket.adminNotes && messages.length === 0 && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Shield className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-semibold text-primary">Support Team</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">{viewingTicket.adminNotes}</p>
                      </div>
                    </div>
                  )}

                  {/* Conversation messages */}
                  {messages.map((msg) => {
                    const isUser = msg.senderRole === "user";
                    return (
                      <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                          isUser
                            ? "bg-primary/10 rounded-tr-sm"
                            : "bg-muted rounded-tl-sm"
                        }`}>
                          {!isUser && (
                            <div className="flex items-center gap-1.5 mb-1">
                              <Shield className="w-3 h-3 text-primary" />
                              <span className="text-[10px] font-semibold text-primary">Support Team</span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                          <p className={`text-[10px] text-muted-foreground mt-1 ${isUser ? "text-right" : ""}`}>
                            {msg.createdAt && format(new Date(msg.createdAt), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply input */}
                {viewingTicket.status !== "closed" && (
                  <div className="px-6 py-3 border-t shrink-0">
                    <div className="flex gap-2">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        className="min-h-[44px] max-h-[100px] resize-none text-sm"
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (replyText.trim()) sendReply.mutate();
                          }
                        }}
                        data-testid="textarea-ticket-reply"
                      />
                      <Button
                        size="icon"
                        onClick={() => sendReply.mutate()}
                        disabled={!replyText.trim() || sendReply.isPending}
                        className="shrink-0 h-[44px] w-[44px]"
                        data-testid="button-send-reply"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {viewingTicket.status === "closed" && (
                  <div className="px-6 py-3 border-t text-center text-xs text-muted-foreground">
                    This ticket is closed. Create a new ticket if you need further help.
                  </div>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

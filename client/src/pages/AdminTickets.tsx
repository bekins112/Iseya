import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-extension";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Ticket, Clock, AlertCircle, CheckCircle2, XCircle, MoreVertical, MessageSquare } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Ticket as TicketType } from "@shared/schema";
import { format } from "date-fns";

export default function AdminTickets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [editForm, setEditForm] = useState({ 
    status: "open" as string, 
    priority: "medium" as string,
    adminNotes: "" 
  });

  const { data: tickets = [], isLoading } = useQuery<TicketType[]>({
    queryKey: ["/api/admin/tickets", { 
      status: statusFilter !== "all" ? statusFilter : undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined 
    }],
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<TicketType> }) => {
      return apiRequest("PATCH", `/api/admin/tickets/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      toast({ title: "Ticket updated successfully" });
      setSelectedTicket(null);
    },
    onError: () => {
      toast({ title: "Failed to update ticket", variant: "destructive" });
    },
  });

  if (user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = !search || 
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;
  const urgentCount = tickets.filter(t => t.priority === "urgent" || t.priority === "high").length;

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

  const openTicketDialog = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setEditForm({ 
      status: ticket.status || "open",
      priority: ticket.priority || "medium",
      adminNotes: ticket.adminNotes || ""
    });
  };

  const handleSaveTicket = () => {
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
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-muted-foreground">Urgent/High</span>
            </div>
            <p className="text-2xl font-bold">{urgentCount}</p>
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
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => openTicketDialog(ticket)}
                  data-testid={`ticket-row-${ticket.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{ticket.subject}</p>
                      <Badge className={getStatusColor(ticket.status)} variant="secondary">
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1 capitalize">{ticket.status}</span>
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)} variant="secondary">
                        <span className="capitalize">{ticket.priority}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
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
                        View Details
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground">Subject</Label>
                <p className="font-medium">{selectedTicket.subject}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-lg mt-1">
                  {selectedTicket.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                    <SelectTrigger data-testid="select-edit-ticket-status">
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
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={editForm.priority} onValueChange={(v) => setEditForm({ ...editForm, priority: v })}>
                    <SelectTrigger data-testid="select-edit-ticket-priority">
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
              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  value={editForm.adminNotes}
                  onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                  placeholder="Add internal notes about this ticket..."
                  rows={3}
                  data-testid="textarea-admin-notes"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTicket} 
              disabled={updateTicketMutation.isPending}
              data-testid="button-save-ticket"
            >
              {updateTicketMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

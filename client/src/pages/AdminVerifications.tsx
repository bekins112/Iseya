import { useState } from "react";
import { PageHeader } from "@/components/ui-extension";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  User,
  FileText,
  Camera,
  Loader2,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type VerificationRequest = {
  id: number;
  userId: string;
  idType: string;
  idNumber: string;
  idDocumentUrl: string | null;
  selfieUrl: string | null;
  status: string;
  adminNotes: string | null;
  reviewedBy: string | null;
  createdAt: string;
  userName: string;
  userEmail: string;
  userProfileImage: string | null;
};

const idTypeLabels: Record<string, string> = {
  nin: "NIN",
  voters_card: "Voter's Card",
  drivers_license: "Driver's License",
  international_passport: "Int'l Passport",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  under_review: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export default function AdminVerifications() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: requests = [], isLoading } = useQuery<VerificationRequest[]>({
    queryKey: ["/api/admin/verification-requests", statusFilter],
    queryFn: async () => {
      const url = statusFilter !== "all"
        ? `/api/admin/verification-requests?status=${statusFilter}`
        : "/api/admin/verification-requests";
      const res = await fetch(url, { credentials: "include" });
      return res.json();
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/verification-requests/${id}`, {
        status,
        adminNotes: notes,
      });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verification-requests"] });
      setReviewDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes("");
      toast({
        title: variables.status === "approved" ? "Applicant Verified" : "Verification Rejected",
        description: variables.status === "approved"
          ? "The applicant is now verified and will receive a verified badge."
          : "The applicant's verification has been rejected.",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const openReview = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || "");
    setReviewDialogOpen(true);
  };

  const pendingCount = requests.filter(r => r.status === "pending" || r.status === "under_review").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification Requests"
        description={`Review and manage applicant identity verification requests. ${pendingCount} pending.`}
      />

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No verification requests found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover-elevate" data-testid={`card-verification-${request.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 shrink-0">
                      {request.userProfileImage && <AvatarImage src={request.userProfileImage} />}
                      <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm truncate">{request.userName || "Unknown"}</h3>
                        <Badge className={`text-xs ${statusColors[request.status] || ""}`}>
                          {request.status === "under_review" ? "Under Review" : request.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{request.userEmail}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {idTypeLabels[request.idType] || request.idType}
                        </span>
                        <span>{request.idNumber}</span>
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 shrink-0"
                      onClick={() => openReview(request)}
                      data-testid={`button-review-${request.id}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Review Verification
            </DialogTitle>
            <DialogDescription>
              Review {selectedRequest?.userName}'s identity verification documents.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">ID Type</p>
                  <p className="font-medium text-sm">{idTypeLabels[selectedRequest.idType] || selectedRequest.idType}</p>
                </div>
                <div className="p-3 rounded-md bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">ID Number</p>
                  <p className="font-medium text-sm">{selectedRequest.idNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {selectedRequest.idDocumentUrl && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <FileText className="w-3 h-3" /> ID Document
                    </p>
                    <a href={selectedRequest.idDocumentUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={selectedRequest.idDocumentUrl}
                        alt="ID Document"
                        className="w-full h-32 object-cover rounded-md border cursor-pointer hover:opacity-80 transition"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </a>
                  </div>
                )}
                {selectedRequest.selfieUrl && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Camera className="w-3 h-3" /> Selfie
                    </p>
                    <a href={selectedRequest.selfieUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={selectedRequest.selfieUrl}
                        alt="Selfie"
                        className="w-full h-32 object-cover rounded-md border cursor-pointer hover:opacity-80 transition"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this verification (optional)"
                  rows={3}
                  data-testid="textarea-admin-notes"
                />
              </div>

              {(selectedRequest.status === "pending" || selectedRequest.status === "under_review") && (
                <div className="flex items-center gap-2">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => reviewMutation.mutate({
                      id: selectedRequest.id,
                      status: "approved",
                      notes: adminNotes,
                    })}
                    disabled={reviewMutation.isPending}
                    data-testid="button-approve-verification"
                  >
                    {reviewMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => reviewMutation.mutate({
                      id: selectedRequest.id,
                      status: "rejected",
                      notes: adminNotes,
                    })}
                    disabled={reviewMutation.isPending}
                    data-testid="button-reject-verification"
                  >
                    {reviewMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject
                  </Button>
                </div>
              )}

              {selectedRequest.status === "approved" && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                </Badge>
              )}

              {selectedRequest.status === "rejected" && (
                <Badge className="bg-red-100 text-red-800">
                  <XCircle className="w-3 h-3 mr-1" /> Rejected
                </Badge>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

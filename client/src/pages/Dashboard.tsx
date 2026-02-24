import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useJobs, useMyApplications, useUpdateUser, useJobHistory, useCreateJobHistory, useUpdateJobHistory, useDeleteJobHistory, useUploadCV, useUploadProfilePicture, useUploadCompanyLogo } from "@/hooks/use-casual";
import { PageHeader, StatusBadge } from "@/components/ui-extension";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { PlusCircle, Calendar, Briefcase, TrendingUp, Users, CheckCircle2, Building2, Tag, Pencil, Check, X, Upload, FileText, Trash2, Camera, UserCircle, AlertCircle, Lock, Phone, Mail, MapPin, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { JobCard } from "@/components/JobCard";
import { motion } from "framer-motion";

const businessCategories = [
  "Restaurant & Food Service",
  "Hospitality & Hotels",
  "Retail & Sales",
  "Construction & Labour",
  "Cleaning & Maintenance",
  "Logistics & Delivery",
  "Agriculture & Farming",
  "Event Management",
  "Domestic & Household",
  "Manufacturing",
  "Security Services",
  "Healthcare & Wellness",
  "Education & Tutoring",
  "Transportation",
  "Other",
];

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

function ApplicantProfile() {
  const { user } = useAuth();
  const updateUser = useUpdateUser();
  const { data: jobHistoryData, isLoading: historyLoading } = useJobHistory();
  const createHistory = useCreateJobHistory();
  const updateHistory = useUpdateJobHistory();
  const deleteHistory = useDeleteJobHistory();
  const uploadCV = useUploadCV();
  const uploadPicture = useUploadProfilePicture();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editGender, setEditGender] = useState(user?.gender || "");
  const [editPhone, setEditPhone] = useState((user as any)?.phone || "");
  const [editAge, setEditAge] = useState(user?.age?.toString() || "");
  const [editSalaryMin, setEditSalaryMin] = useState(user?.expectedSalaryMin?.toString() || "");
  const [editSalaryMax, setEditSalaryMax] = useState(user?.expectedSalaryMax?.toString() || "");
  const [editBio, setEditBio] = useState(user?.bio || "");

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to change password");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Password changed successfully" });
      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: Error) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  const [showAddHistory, setShowAddHistory] = useState(false);
  const [editingHistoryId, setEditingHistoryId] = useState<number | null>(null);
  const [historyTitle, setHistoryTitle] = useState("");
  const [historyCompany, setHistoryCompany] = useState("");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");
  const [historyIsCurrent, setHistoryIsCurrent] = useState(false);
  const [historyDescription, setHistoryDescription] = useState("");

  const cvInputRef = useRef<HTMLInputElement>(null);
  const pictureInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = () => {
    updateUser.mutate(
      {
        id: user!.id,
        gender: editGender || undefined,
        phone: editPhone || undefined,
        age: editAge ? parseInt(editAge) : undefined,
        expectedSalaryMin: editSalaryMin ? parseInt(editSalaryMin) : undefined,
        expectedSalaryMax: editSalaryMax ? parseInt(editSalaryMax) : undefined,
        bio: editBio || undefined,
      } as any,
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "New passwords do not match", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadCV.mutate(file);
  };

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadPicture.mutate(file);
  };

  const resetHistoryForm = () => {
    setHistoryTitle("");
    setHistoryCompany("");
    setHistoryStartDate("");
    setHistoryEndDate("");
    setHistoryIsCurrent(false);
    setHistoryDescription("");
    setEditingHistoryId(null);
    setShowAddHistory(false);
  };

  const startEditHistory = (entry: any) => {
    setEditingHistoryId(entry.id);
    setHistoryTitle(entry.jobTitle);
    setHistoryCompany(entry.company);
    setHistoryStartDate(entry.startDate || "");
    setHistoryEndDate(entry.endDate || "");
    setHistoryIsCurrent(entry.isCurrent || false);
    setHistoryDescription(entry.description || "");
    setShowAddHistory(false);
  };

  const handleSaveHistory = () => {
    if (!historyTitle.trim() || !historyCompany.trim()) return;
    const data = {
      jobTitle: historyTitle.trim(),
      company: historyCompany.trim(),
      startDate: historyStartDate || undefined,
      endDate: historyIsCurrent ? undefined : (historyEndDate || undefined),
      isCurrent: historyIsCurrent,
      description: historyDescription.trim() || undefined,
    };

    if (editingHistoryId) {
      updateHistory.mutate({ id: editingHistoryId, ...data }, { onSuccess: resetHistoryForm });
    } else {
      createHistory.mutate(data, { onSuccess: resetHistoryForm });
    }
  };

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="space-y-6">
      <Card className="border-border/40 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="relative group">
              <Avatar className="w-20 h-20 border-2 border-border">
                <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "Profile"} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">{initials || <UserCircle className="w-8 h-8" />}</AvatarFallback>
              </Avatar>
              <button
                onClick={() => pictureInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                data-testid="button-change-photo"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
              <input
                ref={pictureInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handlePictureUpload}
                data-testid="input-profile-picture"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold" data-testid="text-applicant-name">
                  {user?.firstName} {user?.lastName}
                </h3>
                {user?.isVerified ? (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-500 bg-green-50 dark:bg-green-950/30">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Link href="/verification">
                    <Badge variant="outline" className="text-xs text-primary border-primary/50 cursor-pointer hover:bg-primary/10 transition">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Get Verified
                    </Badge>
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Mail className="w-3 h-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground" data-testid="text-applicant-email">{user?.email}</p>
              </div>
              {(user as any)?.phone && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground" data-testid="text-phone">{(user as any).phone}</p>
                </div>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {user?.gender && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-md text-muted-foreground" data-testid="text-gender">{user.gender}</span>
                )}
                {user?.age && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-md text-muted-foreground" data-testid="text-age">{user.age} years old</span>
                )}
                {user?.location && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-md text-muted-foreground" data-testid="text-location">{user.location}</span>
                )}
              </div>
              {user?.bio && (
                <p className="text-sm mt-2 text-muted-foreground" data-testid="text-bio">{user.bio}</p>
              )}
              {(user?.expectedSalaryMin || user?.expectedSalaryMax) && (
                <p className="text-sm mt-1 text-muted-foreground" data-testid="text-salary-range">
                  Expected salary: {user.expectedSalaryMin ? `₦${user.expectedSalaryMin.toLocaleString()}` : "Any"} - {user.expectedSalaryMax ? `₦${user.expectedSalaryMax.toLocaleString()}` : "Any"}
                </p>
              )}
            </div>

            <Button
              size="icon"
              variant="ghost"
              data-testid="button-edit-applicant-profile"
              onClick={() => {
                setEditGender(user?.gender || "");
                setEditPhone((user as any)?.phone || "");
                setEditAge(user?.age?.toString() || "");
                setEditSalaryMin(user?.expectedSalaryMin?.toString() || "");
                setEditSalaryMax(user?.expectedSalaryMax?.toString() || "");
                setEditBio(user?.bio || "");
                setIsEditing(true);
              }}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>

          {isEditing && (
            <div className="mt-4 pt-4 border-t border-border/40 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="e.g. 08012345678"
                    data-testid="input-edit-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    min={16}
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    placeholder="e.g. 25"
                    data-testid="input-edit-age"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={editGender} onValueChange={setEditGender}>
                    <SelectTrigger data-testid="select-edit-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bio / About</Label>
                  <Textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell employers about yourself..."
                    className="resize-none"
                    data-testid="input-edit-bio"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expected Salary Min (₦)</Label>
                  <Input
                    type="number"
                    value={editSalaryMin}
                    onChange={(e) => setEditSalaryMin(e.target.value)}
                    placeholder="e.g. 5000"
                    data-testid="input-salary-min"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expected Salary Max (₦)</Label>
                  <Input
                    type="number"
                    value={editSalaryMax}
                    onChange={(e) => setEditSalaryMax(e.target.value)}
                    placeholder="e.g. 50000"
                    data-testid="input-salary-max"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveProfile} disabled={updateUser.isPending} data-testid="button-save-applicant-profile">
                  <Check className="w-4 h-4 mr-1" />
                  {updateUser.isPending ? "Saving..." : "Save"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} data-testid="button-cancel-applicant-edit">
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!isEditing && (
            <div className="mt-4 pt-4 border-t border-border/40">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChangePassword(!showChangePassword)}
                data-testid="button-toggle-change-password"
              >
                <Lock className="w-4 h-4 mr-1" />
                Change Password
              </Button>
              {showChangePassword && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Current Password</Label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current password"
                        data-testid="input-current-password"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">New Password</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (min 6 chars)"
                        data-testid="input-new-password"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Confirm New Password</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        data-testid="input-confirm-password"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleChangePassword}
                      disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
                      data-testid="button-save-password"
                    >
                      {changePasswordMutation.isPending ? "Changing..." : "Update Password"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowChangePassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      data-testid="button-cancel-password"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/40 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            CV / Resume
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => cvInputRef.current?.click()} disabled={uploadCV.isPending} data-testid="button-upload-cv">
            <Upload className="w-4 h-4 mr-1" />
            {uploadCV.isPending ? "Uploading..." : "Upload CV"}
          </Button>
          <input
            ref={cvInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleCVUpload}
            data-testid="input-cv-file"
          />
        </CardHeader>
        <CardContent>
          {user?.cvUrl ? (
            <a href={user.cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline" data-testid="link-view-cv">
              <FileText className="w-4 h-4" />
              View uploaded CV
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">No CV uploaded yet. Upload a PDF or DOC file (max 5MB).</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/40 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Job History
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => { resetHistoryForm(); setShowAddHistory(true); }} data-testid="button-add-history">
            <PlusCircle className="w-4 h-4 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(showAddHistory || editingHistoryId !== null) && (
            <div className="p-4 bg-muted/30 rounded-md border border-border/40 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Job Title *</Label>
                  <Input value={historyTitle} onChange={(e) => setHistoryTitle(e.target.value)} placeholder="e.g. Delivery Rider" data-testid="input-history-title" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Company *</Label>
                  <Input value={historyCompany} onChange={(e) => setHistoryCompany(e.target.value)} placeholder="e.g. Jumia" data-testid="input-history-company" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Start Date</Label>
                  <Input type="month" value={historyStartDate} onChange={(e) => setHistoryStartDate(e.target.value)} data-testid="input-history-start-date" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End Date</Label>
                  <Input type="month" value={historyEndDate} onChange={(e) => setHistoryEndDate(e.target.value)} disabled={historyIsCurrent} placeholder={historyIsCurrent ? "Present" : ""} data-testid="input-history-end-date" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer" data-testid="label-is-current">
                <input
                  type="checkbox"
                  checked={historyIsCurrent}
                  onChange={(e) => { setHistoryIsCurrent(e.target.checked); if (e.target.checked) setHistoryEndDate(""); }}
                  className="rounded border-border"
                  data-testid="checkbox-is-current"
                />
                <span className="text-xs text-muted-foreground">I currently work here</span>
              </label>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input value={historyDescription} onChange={(e) => setHistoryDescription(e.target.value)} placeholder="Brief description of your role" data-testid="input-history-description" />
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveHistory} disabled={createHistory.isPending || updateHistory.isPending} data-testid="button-save-history">
                  <Check className="w-4 h-4 mr-1" />
                  {createHistory.isPending || updateHistory.isPending ? "Saving..." : editingHistoryId ? "Update Entry" : "Add Entry"}
                </Button>
                <Button size="sm" variant="ghost" onClick={resetHistoryForm} data-testid="button-cancel-history">
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-16 bg-muted/40 rounded-md animate-pulse" />)}
            </div>
          ) : jobHistoryData && jobHistoryData.length > 0 ? (
            <div className="space-y-3">
              {jobHistoryData.map((entry: any) => (
                <div key={entry.id} className="flex items-start gap-3 p-3 bg-muted/20 rounded-md border border-border/30" data-testid={`history-entry-${entry.id}`}>
                  <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" data-testid={`text-history-title-${entry.id}`}>{entry.jobTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.company}
                      {entry.startDate && (
                        <span className="ml-1">
                          ({entry.startDate}{" - "}{entry.isCurrent ? <span className="text-primary font-medium">Present</span> : (entry.endDate || "N/A")})
                        </span>
                      )}
                    </p>
                    {entry.isCurrent && (
                      <span className="inline-block mt-1 text-xs text-primary font-medium" data-testid={`badge-current-${entry.id}`}>Currently working here</span>
                    )}
                    {entry.description && <p className="text-xs text-muted-foreground mt-1">{entry.description}</p>}
                  </div>
                  <div className="flex flex-shrink-0 gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEditHistory(entry)}
                      data-testid={`button-edit-history-${entry.id}`}
                    >
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteHistory.mutate(entry.id)}
                      disabled={deleteHistory.isPending}
                      data-testid={`button-delete-history-${entry.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No job history added yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isEmployer = user?.role === "employer";
  const isApplicant = user?.role === "applicant";
  const updateUser = useUpdateUser();
  const uploadLogo = useUploadCompanyLogo();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editCompanyName, setEditCompanyName] = useState(user?.companyName || "");
  const [editBusinessCategory, setEditBusinessCategory] = useState(user?.businessCategory || "");
  const [editCompanyAddress, setEditCompanyAddress] = useState((user as any)?.companyAddress || "");
  const [editCompanyCity, setEditCompanyCity] = useState((user as any)?.companyCity || "");
  const [editCompanyState, setEditCompanyState] = useState((user as any)?.companyState || "");
  const [editIsRegistered, setEditIsRegistered] = useState((user as any)?.isRegisteredCompany || false);
  const [editRegNo, setEditRegNo] = useState((user as any)?.companyRegNo || "");

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadLogo.mutate(file);
  };

  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: myApplications } = useMyApplications();

  const myJobs = jobs?.filter(j => j.employerId === user?.id) || [];
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <PageHeader 
          title={`Welcome back, ${user?.firstName || "User"}!`} 
          description={isEmployer ? "Manage your job listings and applicants." : "Find your next casual opportunity today."}
          actions={
            isEmployer && (
              <Link href="/post-job">
                <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20" data-testid="button-post-job">
                  <PlusCircle className="w-4 h-4" /> Post a Job
                </Button>
              </Link>
            )
          }
        />
      </motion.div>

      {(() => {
        const missingItems: string[] = [];
        if (isApplicant) {
          if (!user?.gender) missingItems.push("gender");
          if (!(user as any)?.phone) missingItems.push("phone number");
          if (!user?.age) missingItems.push("age");
          if (!user?.bio) missingItems.push("bio");
          if (!user?.expectedSalaryMin && !user?.expectedSalaryMax) missingItems.push("expected salary");
          if (!user?.cvUrl) missingItems.push("CV");
          if (!user?.profileImageUrl) missingItems.push("profile picture");
        }
        if (isEmployer) {
          if (!user?.companyName) missingItems.push("company name");
          if (!user?.businessCategory) missingItems.push("business category");
          if (!user?.companyLogo) missingItems.push("company logo");
          if (!(user as any)?.companyAddress) missingItems.push("company address");
          if (!(user as any)?.companyCity) missingItems.push("city");
          if (!(user as any)?.companyState) missingItems.push("state");
        }
        if (missingItems.length === 0) return null;
        return (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-primary/30 bg-primary/5 shadow-md" data-testid="card-profile-prompt">
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm" data-testid="text-profile-prompt-title">Complete your profile</p>
                    <p className="text-xs text-muted-foreground" data-testid="text-profile-prompt-missing">
                      Missing: {missingItems.join(", ")}. A complete profile helps you {isEmployer ? "attract better applicants" : "stand out to employers"}.
                    </p>
                  </div>
                </div>
                <a href="#profile-section">
                  <Button size="sm" className="flex-shrink-0" data-testid="button-complete-profile">
                    Update Profile
                  </Button>
                </a>
              </CardContent>
            </Card>
          </motion.div>
        );
      })()}

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={item}>
          <Card className="bg-primary text-primary-foreground overflow-hidden relative group border-none shadow-xl shadow-primary/10">
            <TrendingUp className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider opacity-80">
                {isEmployer ? "Active Jobs" : "Applications Sent"}
              </CardTitle>
              <Briefcase className="w-4 h-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold" data-testid="text-stat-primary">
                {isEmployer ? (jobs?.filter(j => j.employerId === user?.id).length || 0) : (myApplications?.length || 0)}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card className="bg-accent text-accent-foreground overflow-hidden relative group border-none shadow-xl shadow-accent/10">
            <CheckCircle2 className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider opacity-80">
                {isEmployer ? "Total Applicants" : "Pending Reviews"}
              </CardTitle>
              <Users className="w-4 h-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold" data-testid="text-stat-secondary">
                {isEmployer ? (jobs?.filter(j => j.employerId === user?.id).reduce((acc) => acc + 1, 0) || 0) : 0}
              </div>
              <p className="text-xs opacity-70">
                {isEmployer ? "Across all your job postings" : "Analytics coming soon"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-card overflow-hidden relative group border-border/40 shadow-xl shadow-black/5">
            <Calendar className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-5 group-hover:scale-110 transition-transform text-green-500" />
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Subscription</CardTitle>
              <Users className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold capitalize" data-testid="text-subscription-status">{user?.subscriptionStatus}</span>
                <StatusBadge status={user?.subscriptionStatus || "free"} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {isEmployer && (
        <motion.div
          id="profile-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="border-border/40 shadow-md">
            {isEditingProfile ? (
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">Edit Business Profile</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Company / Business Name</Label>
                  <Input
                    id="edit-company"
                    placeholder="e.g. Lagos Catering Services"
                    value={editCompanyName}
                    onChange={(e) => setEditCompanyName(e.target.value)}
                    data-testid="input-edit-company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Business Category</Label>
                  <Select value={editBusinessCategory} onValueChange={setEditBusinessCategory}>
                    <SelectTrigger data-testid="select-edit-category">
                      <SelectValue placeholder="Select your business category" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Company Address</Label>
                  <Input
                    id="edit-address"
                    placeholder="e.g. 12 Broad Street"
                    value={editCompanyAddress}
                    onChange={(e) => setEditCompanyAddress(e.target.value)}
                    data-testid="input-edit-address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-city">City</Label>
                    <Input
                      id="edit-city"
                      placeholder="e.g. Lagos"
                      value={editCompanyCity}
                      onChange={(e) => setEditCompanyCity(e.target.value)}
                      data-testid="input-edit-city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-state">State</Label>
                    <Select value={editCompanyState} onValueChange={setEditCompanyState}>
                      <SelectTrigger data-testid="select-edit-state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {nigerianStates.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id="edit-registered"
                    checked={editIsRegistered}
                    onCheckedChange={(v) => setEditIsRegistered(!!v)}
                    data-testid="checkbox-registered"
                  />
                  <Label htmlFor="edit-registered" className="text-sm cursor-pointer">
                    This company is officially registered (CAC)
                  </Label>
                </div>
                {editIsRegistered && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-regno">CAC Registration Number</Label>
                    <Input
                      id="edit-regno"
                      placeholder="e.g. RC-123456"
                      value={editRegNo}
                      onChange={(e) => setEditRegNo(e.target.value)}
                      data-testid="input-edit-regno"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    disabled={updateUser.isPending}
                    data-testid="button-save-profile"
                    onClick={() => {
                      if (!editCompanyName.trim()) return;
                      updateUser.mutate(
                        {
                          id: user!.id,
                          companyName: editCompanyName.trim(),
                          businessCategory: editBusinessCategory,
                          companyAddress: editCompanyAddress.trim() || null,
                          companyCity: editCompanyCity.trim() || null,
                          companyState: editCompanyState || null,
                          isRegisteredCompany: editIsRegistered,
                          companyRegNo: editIsRegistered ? (editRegNo.trim() || null) : null,
                        } as any,
                        { onSuccess: () => setIsEditingProfile(false) }
                      );
                    }}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {updateUser.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    data-testid="button-cancel-edit"
                    onClick={() => {
                      setEditCompanyName(user?.companyName || "");
                      setEditBusinessCategory(user?.businessCategory || "");
                      setEditCompanyAddress((user as any)?.companyAddress || "");
                      setEditCompanyCity((user as any)?.companyCity || "");
                      setEditCompanyState((user as any)?.companyState || "");
                      setEditIsRegistered((user as any)?.isRegisteredCompany || false);
                      setEditRegNo((user as any)?.companyRegNo || "");
                      setIsEditingProfile(false);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="relative group flex-shrink-0">
                  <Avatar className="w-12 h-12 border-2 border-border">
                    <AvatarImage src={user?.companyLogo || undefined} alt={user?.companyName || "Company"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Building2 className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    data-testid="button-change-logo"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                    data-testid="input-company-logo"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-lg font-bold truncate" data-testid="text-company-name">
                      {user?.companyName || "No company name set"}
                    </CardTitle>
                    {(user as any)?.isRegisteredCompany && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-md" data-testid="badge-registered">
                        <ShieldCheck className="w-3 h-3" />
                        Registered{(user as any)?.companyRegNo ? ` (${(user as any).companyRegNo})` : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {user?.businessCategory ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md" data-testid="text-business-category">
                        <Tag className="w-3 h-3" />
                        {user.businessCategory}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No category set</span>
                    )}
                    {((user as any)?.companyCity || (user as any)?.companyState) && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md" data-testid="text-company-location">
                        <MapPin className="w-3 h-3" />
                        {[(user as any)?.companyCity, (user as any)?.companyState].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                  {(user as any)?.companyAddress && (
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-company-address">
                      {(user as any).companyAddress}
                    </p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  data-testid="button-edit-profile"
                  onClick={() => {
                    setEditCompanyName(user?.companyName || "");
                    setEditBusinessCategory(user?.businessCategory || "");
                    setEditCompanyAddress((user as any)?.companyAddress || "");
                    setEditCompanyCity((user as any)?.companyCity || "");
                    setEditCompanyState((user as any)?.companyState || "");
                    setEditIsRegistered((user as any)?.isRegisteredCompany || false);
                    setEditRegNo((user as any)?.companyRegNo || "");
                    setIsEditingProfile(true);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </CardHeader>
            )}
          </Card>
        </motion.div>
      )}

      {isApplicant && (
        <motion.div
          id="profile-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <ApplicantProfile />
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            {isEmployer ? "Your Recent Postings" : "Recent Opportunities"}
          </h2>
          <Link href={isEmployer ? "/my-jobs" : "/jobs"}>
            <Button variant="ghost" className="text-primary font-bold group" data-testid="button-view-all-jobs">
              View All <TrendingUp className="ml-2 w-4 h-4 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {jobsLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-72 bg-muted/40 rounded-3xl animate-pulse border border-border/20" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {(isEmployer ? myJobs : jobs)?.slice(0, 3).map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
              >
                <JobCard job={job} isEmployer={isEmployer} />
              </motion.div>
            ))}
            {((isEmployer ? myJobs : jobs)?.length === 0) && (
              <div className="col-span-3 text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-border/40">
                <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-xl font-bold text-muted-foreground">No jobs found.</p>
                {isEmployer && (
                  <Link href="/post-job">
                    <Button variant="ghost" className="mt-2 text-primary font-bold" data-testid="button-create-first-job">Create your first job post</Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

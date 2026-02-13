import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, errorSchemas } from "@shared/routes";
import { insertUserSchema, insertJobSchema, insertApplicationSchema, type InsertJob, type InsertApplication, type User, type JobHistory } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// === USER HOOKS ===
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<z.infer<typeof insertUserSchema>>) => {
      const url = buildUrl(api.users.update.path, { id });
      const res = await fetch(url, {
        method: api.users.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("User not found");
        throw new Error("Failed to update profile");
      }
      return api.users.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data);
      toast({ title: "Profile Updated", description: "Your information has been saved." });
    },
    onError: (error) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
  });
}

// === JOB HOOKS ===
export function useJobs(filters?: { category?: string; location?: string }) {
  const queryKey = filters ? [api.jobs.list.path, filters] : [api.jobs.list.path];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = filters 
        ? `${api.jobs.list.path}?${new URLSearchParams(filters as any).toString()}` 
        : api.jobs.list.path;
        
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return api.jobs.list.responses[200].parse(await res.json());
    },
  });
}

export function useJob(id: number) {
  return useQuery({
    queryKey: [api.jobs.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.jobs.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch job");
      return api.jobs.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertJob) => {
      const validated = api.jobs.create.input.parse(data);
      const res = await fetch(api.jobs.create.path, {
        method: api.jobs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
           const err = await res.json();
           throw new Error(err.message || "Validation failed");
        }
        throw new Error("Failed to create job");
      }
      return api.jobs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.jobs.list.path] });
      toast({ title: "Job Posted", description: "Your job listing is now live." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.jobs.delete.path, { id });
      const res = await fetch(url, { 
        method: api.jobs.delete.method,
        credentials: "include"
      });
      
      if (!res.ok) throw new Error("Failed to delete job");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.jobs.list.path] });
      toast({ title: "Job Deleted", description: "The job posting has been removed." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

// === APPLICATION HOOKS ===
export function useCreateApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertApplication) => {
      const validated = api.applications.create.input.parse(data);
      const res = await fetch(api.applications.create.path, {
        method: api.applications.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to submit application");
      return api.applications.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-applications"] });
      toast({ title: "Application Sent", description: "Good luck! The employer will be notified." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useMyApplications() {
  return useQuery({
    queryKey: [api.applications.listForApplicant.path],
    queryFn: async () => {
      const res = await fetch(api.applications.listForApplicant.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch applications");
      return api.applications.listForApplicant.responses[200].parse(await res.json());
    },
  });
}

export function useJobApplications(jobId: number) {
  return useQuery({
    queryKey: [api.applications.listForJob.path, jobId],
    queryFn: async () => {
      const url = buildUrl(api.applications.listForJob.path, { jobId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch applications");
      return api.applications.listForJob.responses[200].parse(await res.json());
    },
    enabled: !!jobId,
  });
}

// === EMPLOYER SPECIFIC HOOKS ===
export function useEmployerJobs() {
  return useQuery({
    queryKey: [api.jobs.listByEmployer.path],
    queryFn: async () => {
      const res = await fetch(api.jobs.listByEmployer.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch your jobs");
      return api.jobs.listByEmployer.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertJob & { isActive: boolean }>) => {
      const url = buildUrl(api.jobs.update.path, { id });
      const res = await fetch(url, {
        method: api.jobs.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update job");
      return api.jobs.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.jobs.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.jobs.listByEmployer.path] });
      toast({ title: "Job Updated", description: "Your changes have been saved." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'pending' | 'accepted' | 'rejected' | 'offered' }) => {
      const url = buildUrl(api.applications.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.applications.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update application");
      return api.applications.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.applications.listForJob.path] });
      const statusMsg = variables.status === 'accepted' ? 'accepted' : 
                        variables.status === 'rejected' ? 'rejected' :
                        variables.status === 'offered' ? 'offered the position' : 'updated';
      toast({ title: "Application Updated", description: `The applicant has been ${statusMsg}.` });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

// === JOB HISTORY HOOKS ===
export function useJobHistory() {
  return useQuery<JobHistory[]>({
    queryKey: ["/api/job-history"],
    queryFn: async () => {
      const res = await fetch("/api/job-history", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch job history");
      return res.json();
    },
  });
}

export function useCreateJobHistory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { jobTitle: string; company: string; startDate?: string; endDate?: string; isCurrent?: boolean; description?: string }) => {
      const res = await fetch("/api/job-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add job history");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-history"] });
      toast({ title: "Added", description: "Job history entry added." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateJobHistory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; jobTitle?: string; company?: string; startDate?: string; endDate?: string | null; isCurrent?: boolean; description?: string }) => {
      const res = await fetch(`/api/job-history/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update job history");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-history"] });
      toast({ title: "Updated", description: "Job history entry updated." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteJobHistory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/job-history/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete entry");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-history"] });
      toast({ title: "Removed", description: "Job history entry removed." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUploadCV() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("cv", file);
      const res = await fetch("/api/upload/cv", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to upload CV");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "CV Uploaded", description: "Your CV has been saved." });
    },
    onError: (error) => {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    },
  });
}

export function useApplicantProfile(applicantId: string | null) {
  return useQuery({
    queryKey: ["/api/applicant-profile", applicantId],
    queryFn: async () => {
      const res = await fetch(`/api/applicant-profile/${applicantId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!applicantId,
  });
}

export function useUploadProfilePicture() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("picture", file);
      const res = await fetch("/api/upload/profile-picture", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to upload picture");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Photo Updated", description: "Your profile picture has been saved." });
    },
    onError: (error) => {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    },
  });
}

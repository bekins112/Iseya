export const errorSchemas = {
  validation: { message: "", field: "" },
  notFound: { message: "" },
  internal: { message: "" },
  unauthorized: { message: "" },
};

export const api = {
  users: {
    me: {
      method: "GET" as const,
      path: "/api/auth/user",
    },
    update: {
      method: "PATCH" as const,
      path: "/api/users/:id",
    },
  },
  jobs: {
    list: {
      method: "GET" as const,
      path: "/api/jobs",
    },
    get: {
      method: "GET" as const,
      path: "/api/jobs/:id",
    },
    create: {
      method: "POST" as const,
      path: "/api/jobs",
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/jobs/:id",
    },
    update: {
      method: "PATCH" as const,
      path: "/api/jobs/:id",
    },
    listByEmployer: {
      method: "GET" as const,
      path: "/api/employer/jobs",
    },
  },
  applications: {
    create: {
      method: "POST" as const,
      path: "/api/applications",
    },
    listForJob: {
      method: "GET" as const,
      path: "/api/jobs/:jobId/applications",
    },
    listForApplicant: {
      method: "GET" as const,
      path: "/api/my-applications",
    },
    updateStatus: {
      method: "PATCH" as const,
      path: "/api/applications/:id/status",
    },
    get: {
      method: "GET" as const,
      path: "/api/applications/:id",
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

import { z } from 'zod';
import { insertUserSchema, insertJobSchema, insertApplicationSchema, jobs, applications, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  users: {
    me: {
      method: 'GET' as const,
      path: '/api/auth/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/users/:id',
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  jobs: {
    list: {
      method: 'GET' as const,
      path: '/api/jobs',
      input: z.object({
        category: z.string().optional(),
        location: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof jobs.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/jobs/:id',
      responses: {
        200: z.custom<typeof jobs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/jobs',
      input: insertJobSchema,
      responses: {
        201: z.custom<typeof jobs.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/jobs/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  applications: {
    create: {
      method: 'POST' as const,
      path: '/api/applications',
      input: insertApplicationSchema,
      responses: {
        201: z.custom<typeof applications.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    listForJob: {
      method: 'GET' as const,
      path: '/api/jobs/:jobId/applications',
      responses: {
        200: z.array(z.custom<typeof applications.$inferSelect>()),
      },
    },
    listForApplicant: {
      method: 'GET' as const,
      path: '/api/my-applications',
      responses: {
        200: z.array(z.custom<typeof applications.$inferSelect>()),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
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

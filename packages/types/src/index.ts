// Tipos y schemas compartidos para HotSpot SaaS
// Validaciones con Zod para toda la aplicación

import { z } from 'zod';

// Esquemas para Tenant
export const TenantSchema = z.object({
  id: z.string().cuid().optional(),
  slug: z.string().min(3).max(50),
  name: z.string().min(1).max(100),
  businessType: z.enum(['restaurante', 'hotel', 'oficina', 'tienda', 'colegio', 'otro']),
  logoUrl: z.string().url().optional(),
  status: z.enum(['trial', 'active', 'suspended', 'cancelled']).default('trial'),
  trialEndsAt: z.date().optional(),
  billingEmail: z.string().email(),
  planId: z.string().cuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Esquemas para User
export const UserSchema = z.object({
  id: z.string().cuid().optional(),
  tenantId: z.string().cuid(),
  email: z.string().email(),
  passwordHash: z.string().min(8),
  role: z.enum(['admin', 'user', 'readonly']).default('user'),
  name: z.string().min(1).max(100),
  lastLoginAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  passwordHash: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(8),
});

// Esquemas para Plan
export const PlanSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(50),
  priceMonthly: z.number().min(0),
  maxPortals: z.number().min(1),
  maxBranches: z.number().min(1),
  maxVisitorsMo: z.number().min(0),
  aiRequestsMo: z.number().min(0),
  features: z.record(z.any()),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Esquemas para Branch
export const BranchSchema = z.object({
  id: z.string().cuid().optional(),
  tenantId: z.string().cuid(),
  name: z.string().min(1).max(100),
  address: z.string().min(1).max(255),
  timezone: z.string().default('America/Guayaquil'),
  routerType: z.enum(['mikrotik', 'ubiquiti', 'cisco', 'tp-link', 'otro']),
  routerIp: z.string().ip(),
  routerUser: z.string().min(1),
  routerPassEnc: z.string().min(1),
  portalId: z.string().cuid().optional(),
  isOnline: z.boolean().default(false),
  lastSeenAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Esquemas para Portal
export const PortalSchema = z.object({
  id: z.string().cuid().optional(),
  tenantId: z.string().cuid(),
  name: z.string().min(1).max(100),
  template: z.enum(['modern', 'classic', 'corporate', 'minimal']),
  subdomain: z.string().min(3).max(50),
  config: z.record(z.any()),
  sessionMinutes: z.number().min(1).max(1440).default(60),
  speedKbps: z.number().min(0).optional(),
  quotaMb: z.number().min(0).optional(),
  isPublished: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Esquemas para Visitor
export const VisitorSchema = z.object({
  id: z.string().cuid().optional(),
  tenantId: z.string().cuid(),
  branchId: z.string().cuid().optional(),
  name: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/),
  visitCount: z.number().min(0).default(1),
  firstSeenAt: z.date().optional(),
  lastSeenAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Esquemas para Campaign
export const CampaignSchema = z.object({
  id: z.string().cuid().optional(),
  tenantId: z.string().cuid(),
  name: z.string().min(1).max(100),
  type: z.enum(['banner', 'popup', 'email', 'sms']),
  assetUrl: z.string().url().optional(),
  clickUrl: z.string().url().optional(),
  weight: z.number().min(1).max(100).default(1),
  schedule: z.record(z.any()),
  branchIds: z.array(z.string().cuid()),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Esquemas para Subscription
export const SubscriptionSchema = z.object({
  id: z.string().cuid().optional(),
  tenantId: z.string().cuid(),
  planId: z.string().cuid(),
  mpPreapprovalId: z.string().optional(),
  status: z.enum(['pending', 'active', 'cancelled', 'paused']).default('pending'),
  currentPeriodEnd: z.date().optional(),
  amountUsd: z.number().min(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Esquemas para autenticación
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tenantSlug: z.string().min(1),
});

export const RegisterSchema = z.object({
  tenantName: z.string().min(1).max(100),
  businessType: z.enum(['restaurante', 'hotel', 'oficina', 'tienda', 'colegio', 'otro']),
  billingEmail: z.string().email(),
  userName: z.string().min(1).max(100),
  userEmail: z.string().email(),
  userPassword: z.string().min(8),
});

// Tipos exportados
export type Tenant = z.infer<typeof TenantSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type Branch = z.infer<typeof BranchSchema>;
export type Portal = z.infer<typeof PortalSchema>;
export type Visitor = z.infer<typeof VisitorSchema>;
export type Campaign = z.infer<typeof CampaignSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type Login = z.infer<typeof LoginSchema>;
export type Register = z.infer<typeof RegisterSchema>;

// Enums y constantes
export const BusinessTypes = ['restaurante', 'hotel', 'oficina', 'tienda', 'colegio', 'otro'] as const;
export const UserRoles = ['admin', 'user', 'readonly'] as const;
export const TenantStatus = ['trial', 'active', 'suspended', 'cancelled'] as const;
export const RouterTypes = ['mikrotik', 'ubiquiti', 'cisco', 'tp-link', 'otro'] as const;
export const PortalTemplates = ['modern', 'classic', 'corporate', 'minimal'] as const;
export const CampaignTypes = ['banner', 'popup', 'email', 'sms'] as const;
export const SubscriptionStatus = ['pending', 'active', 'cancelled', 'paused'] as const;

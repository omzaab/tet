import z from "zod";

// User schemas
export const UserTypeSchema = z.enum(['landlord', 'tenant', 'both']);

export const UserSchema = z.object({
  id: z.number(),
  mocha_user_id: z.string(),
  full_name: z.string().nullable(),
  bio: z.string().nullable(),
  avatar_url: z.string().nullable(),
  user_type: UserTypeSchema,
  trust_score: z.number().int(),
  total_reviews: z.number().int(),
  average_rating: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateUserSchema = z.object({
  full_name: z.string().min(1),
  bio: z.string().optional(),
  user_type: UserTypeSchema,
});

export const UpdateUserSchema = z.object({
  full_name: z.string().min(1).optional(),
  bio: z.string().optional(),
  user_type: UserTypeSchema.optional(),
});

// Property schemas
export const PropertySchema = z.object({
  id: z.number(),
  owner_id: z.number(),
  name: z.string(),
  address: z.string(),
  description: z.string().nullable(),
  property_type: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreatePropertySchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  description: z.string().optional(),
  property_type: z.string().optional(),
});

export const UpdatePropertySchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  description: z.string().optional(),
  property_type: z.string().optional(),
});

// Review schemas
export const ReviewSchema = z.object({
  id: z.number(),
  reviewer_id: z.number(),
  reviewee_id: z.number(),
  property_id: z.number().nullable(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string(),
  issue_types: z.string().nullable(),
  evidence_image_url: z.string().nullable(),
  is_valid: z.boolean(),
  ai_validation_reason: z.string().nullable(),
  trust_score_impact: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateReviewSchema = z.object({
  reviewee_id: z.number(),
  property_id: z.number().optional(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().min(15),
  issue_types: z.array(z.string()).optional(),
  evidence_image_url: z.string().optional(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserType = z.infer<typeof UserTypeSchema>;

export type Property = z.infer<typeof PropertySchema>;
export type CreateProperty = z.infer<typeof CreatePropertySchema>;
export type UpdateProperty = z.infer<typeof UpdatePropertySchema>;

export type Review = z.infer<typeof ReviewSchema>;
export type CreateReview = z.infer<typeof CreateReviewSchema>;

// Issue types for reviews
export const ISSUE_TYPES = [
  'property_damage',
  'late_payment',
  'cleanliness_issues',
  'noise_complaints',
  'lease_violations',
  'maintenance_issues',
  'communication_problems',
  'unfair_treatment',
  'other'
] as const;

export type IssueType = typeof ISSUE_TYPES[number];

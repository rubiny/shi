import { z } from 'zod';

// Common validators
const ethAddress = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');
const positiveNumber = z.number().positive('Must be positive');
const uuid = z.string().uuid('Invalid UUID');

// Withdraw
export const withdrawSchema = z.object({
  amount: positiveNumber.min(25, 'Minimum withdrawal is 25 $SHIT'),
  network: z.enum(['base', 'ethereum', 'polygon', 'arbitrum', 'optimism']),
  address: ethAddress,
  idempotency_key: z.string().min(8).max(64),
});
export type WithdrawInput = z.infer<typeof withdrawSchema>;

// Convert PTS → $SHIT
export const convertSchema = z.object({
  points: z.number().int().positive().min(100, 'Minimum 100 points to convert'),
});
export type ConvertInput = z.infer<typeof convertSchema>;

// Stake
export const stakeSchema = z.object({
  amount: positiveNumber.min(10, 'Minimum stake is 10 $SHIT'),
  lock_days: z.enum(['7', '14', '30', '90']).transform(Number),
});
export type StakeInput = z.infer<typeof stakeSchema>;

// Unstake
export const unstakeSchema = z.object({
  position_id: uuid,
});
export type UnstakeInput = z.infer<typeof unstakeSchema>;

// Daily claim
export const dailyClaimSchema = z.object({
  streak_day: z.number().int().min(1).max(365),
});

// Offer start
export const offerStartSchema = z.object({
  offer_id: z.string().min(1),
});

// Offer claim
export const offerClaimSchema = z.object({
  user_offer_id: uuid,
});

// Admin: update user
export const adminUpdateUserSchema = z.object({
  user_id: uuid,
  action: z.enum(['ban', 'unban', 'adjust_balance', 'set_general', 'remove_general', 'reset_kyc']),
  amount: z.number().optional(),
  reason: z.string().max(500).optional(),
});

// Admin: process withdrawal
export const adminProcessWithdrawalSchema = z.object({
  withdrawal_ids: z.array(uuid).min(1).max(100),
  action: z.enum(['approve', 'reject']),
  reason: z.string().max(500).optional(),
});

// Profile update
export const profileUpdateSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, _ and -').optional(),
  bio: z.string().max(200).optional(),
  discord: z.string().max(50).optional(),
  twitter: z.string().max(50).optional(),
  telegram: z.string().max(50).optional(),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// Helper: parse and validate request body
export async function parseBody<T>(request: Request, schema: z.ZodSchema<T>): Promise<{ data: T } | { error: z.ZodError }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return { error: result.error };
    }
    return { data: result.data };
  } catch {
    return { error: new z.ZodError([{ code: 'custom', message: 'Invalid JSON body', path: [] }]) };
  }
}

// Helper: format Zod errors for API response
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    errors[path] = issue.message;
  }
  return errors;
}

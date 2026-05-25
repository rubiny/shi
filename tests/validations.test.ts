import { describe, it, expect } from 'vitest';
import { withdrawSchema, convertSchema, stakeSchema, profileUpdateSchema, adminUpdateUserSchema, adminProcessWithdrawalSchema, formatZodErrors } from '@/lib/validations/schemas';

describe('withdrawSchema', () => {
  it('accepts valid withdrawal', () => {
    const result = withdrawSchema.safeParse({
      amount: 100,
      network: 'base',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      idempotency_key: 'unique-key-123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects amount below minimum', () => {
    const result = withdrawSchema.safeParse({
      amount: 10,
      network: 'base',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      idempotency_key: 'key123456',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid Ethereum address', () => {
    const result = withdrawSchema.safeParse({
      amount: 100,
      network: 'base',
      address: 'not-an-address',
      idempotency_key: 'key123456',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid network', () => {
    const result = withdrawSchema.safeParse({
      amount: 100,
      network: 'solana',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      idempotency_key: 'key123456',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = withdrawSchema.safeParse({
      amount: -50,
      network: 'base',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      idempotency_key: 'key123456',
    });
    expect(result.success).toBe(false);
  });
});

describe('convertSchema', () => {
  it('accepts valid conversion', () => {
    const result = convertSchema.safeParse({ points: 500 });
    expect(result.success).toBe(true);
  });

  it('rejects points below minimum', () => {
    const result = convertSchema.safeParse({ points: 50 });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer points', () => {
    const result = convertSchema.safeParse({ points: 150.5 });
    expect(result.success).toBe(false);
  });

  it('rejects zero', () => {
    const result = convertSchema.safeParse({ points: 0 });
    expect(result.success).toBe(false);
  });
});

describe('stakeSchema', () => {
  it('accepts valid stake with string lock_days', () => {
    const result = stakeSchema.safeParse({ amount: 100, lock_days: '30' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.lock_days).toBe(30);
  });

  it('rejects amount below minimum', () => {
    const result = stakeSchema.safeParse({ amount: 5, lock_days: '30' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid lock period', () => {
    const result = stakeSchema.safeParse({ amount: 100, lock_days: '60' });
    expect(result.success).toBe(false);
  });
});

describe('profileUpdateSchema', () => {
  it('accepts valid update', () => {
    const result = profileUpdateSchema.safeParse({ username: 'degen_lord', bio: 'I love $SHIT' });
    expect(result.success).toBe(true);
  });

  it('rejects username with spaces', () => {
    const result = profileUpdateSchema.safeParse({ username: 'has spaces' });
    expect(result.success).toBe(false);
  });

  it('rejects username too short', () => {
    const result = profileUpdateSchema.safeParse({ username: 'ab' });
    expect(result.success).toBe(false);
  });

  it('accepts empty partial update', () => {
    const result = profileUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('adminUpdateUserSchema', () => {
  it('accepts ban action', () => {
    const result = adminUpdateUserSchema.safeParse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      action: 'ban',
      reason: 'fraud',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid action', () => {
    const result = adminUpdateUserSchema.safeParse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      action: 'delete',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID', () => {
    const result = adminUpdateUserSchema.safeParse({
      user_id: 'not-a-uuid',
      action: 'ban',
    });
    expect(result.success).toBe(false);
  });
});

describe('adminProcessWithdrawalSchema', () => {
  it('accepts valid withdrawal processing', () => {
    const result = adminProcessWithdrawalSchema.safeParse({
      withdrawal_ids: ['550e8400-e29b-41d4-a716-446655440000'],
      action: 'approve',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty withdrawal_ids', () => {
    const result = adminProcessWithdrawalSchema.safeParse({
      withdrawal_ids: [],
      action: 'approve',
    });
    expect(result.success).toBe(false);
  });
});

describe('formatZodErrors', () => {
  it('formats errors into key-value pairs', () => {
    const result = withdrawSchema.safeParse({ amount: -1 });
    if (!result.success) {
      const formatted = formatZodErrors(result.error);
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('object');
    }
  });
});

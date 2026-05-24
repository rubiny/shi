import { describe, it, expect } from 'vitest';
import { jsonError, jsonSuccess } from '@/lib/api-helpers';

describe('jsonError', () => {
  it('returns error response with status', async () => {
    const res = jsonError('Not found', 404);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Not found');
  });

  it('includes details when provided', async () => {
    const res = jsonError('Validation failed', 400, { name: 'Required' });
    const body = await res.json();
    expect(body.details.name).toBe('Required');
  });
});

describe('jsonSuccess', () => {
  it('returns success response', async () => {
    const res = jsonSuccess({ balance: 1000 });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.balance).toBe(1000);
  });

  it('supports custom status code', async () => {
    const res = jsonSuccess({ created: true }, 201);
    expect(res.status).toBe(201);
  });
});

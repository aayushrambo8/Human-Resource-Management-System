import { describe, expect, it } from 'vitest';
import { ALL_PERMISSIONS, can, gates, type Permission } from '@/lib/permissions';

// Expected grants transcribed from the authoritative seed
// backend/src/main/resources/db/migration/V3__authentication_and_leave.sql
// (ADMIN = all permissions; HR = all except company:write and account:write;
//  EMPLOYEE = leave:write only). If the backend ever changes a grant, this
// table is the contract the UI must be re-checked against.
const EXPECTED: Record<string, { granted: Permission[]; denied: Permission[] }> = {
  ADMIN: { granted: ALL_PERMISSIONS, denied: [] },
  HR: {
    granted: [
      'employee:read',
      'employee:write',
      'department:read',
      'department:write',
      'company:read',
      'attendance:read',
      'biometric:read',
      'leave:read',
      'leave:write',
      'leave:review',
    ],
    denied: ['company:write', 'account:write'],
  },
  EMPLOYEE: { granted: ['leave:write'], denied: ALL_PERMISSIONS.filter((p) => p !== 'leave:write') },
};

describe('role → permission model', () => {
  for (const [role, { granted, denied }] of Object.entries(EXPECTED)) {
    describe(role, () => {
      for (const permission of granted) {
        it(`grants ${permission}`, () => {
          expect(can([role], permission)).toBe(true);
        });
      }
      for (const permission of denied) {
        it(`denies ${permission}`, () => {
          expect(can([role], permission)).toBe(false);
        });
      }
    });
  }

  it('grants nothing for an unknown role', () => {
    for (const permission of ALL_PERMISSIONS) {
      expect(can(['SUPERUSER'], permission)).toBe(false);
    }
  });

  it('grants nothing when no roles are present', () => {
    expect(can([], 'leave:write')).toBe(false);
  });

  it('unions permissions across multiple roles', () => {
    // EMPLOYEE alone cannot read the directory; adding HR unlocks it.
    expect(can(['EMPLOYEE'], 'employee:read')).toBe(false);
    expect(can(['EMPLOYEE', 'HR'], 'employee:read')).toBe(true);
  });
});

describe('page gates', () => {
  it('offers employee writes only to ADMIN and HR', () => {
    expect(gates.canWriteEmployees(['ADMIN'])).toBe(true);
    expect(gates.canWriteEmployees(['HR'])).toBe(true);
    expect(gates.canWriteEmployees(['EMPLOYEE'])).toBe(false);
  });

  it('offers leave review only to ADMIN and HR', () => {
    expect(gates.canReviewLeaves(['ADMIN'])).toBe(true);
    expect(gates.canReviewLeaves(['HR'])).toBe(true);
    expect(gates.canReviewLeaves(['EMPLOYEE'])).toBe(false);
  });

  it('offers leave submission to every role', () => {
    expect(gates.canSubmitLeaves(['ADMIN'])).toBe(true);
    expect(gates.canSubmitLeaves(['HR'])).toBe(true);
    expect(gates.canSubmitLeaves(['EMPLOYEE'])).toBe(true);
  });

  it('offers account creation to ADMIN only', () => {
    expect(gates.canCreateAccounts(['ADMIN'])).toBe(true);
    expect(gates.canCreateAccounts(['HR'])).toBe(false);
    expect(gates.canCreateAccounts(['EMPLOYEE'])).toBe(false);
  });

  it('hides directory reads from EMPLOYEE', () => {
    expect(gates.canReadDirectory(['EMPLOYEE'])).toBe(false);
    expect(gates.canReadDepartments(['EMPLOYEE'])).toBe(false);
    expect(gates.canReadBiometric(['EMPLOYEE'])).toBe(false);
    expect(gates.canReadDirectory(['HR'])).toBe(true);
  });
});

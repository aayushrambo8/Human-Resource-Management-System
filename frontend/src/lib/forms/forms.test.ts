import { describe, expect, it } from 'vitest';
import { employeeToRequest, emptyEmployeeValues, validateEmployee } from '@/lib/forms/employee';
import { departmentToRequest, emptyDepartmentValues, validateDepartment } from '@/lib/forms/department';
import { leaveToSubmission, emptyLeaveValues, validateLeave } from '@/lib/forms/leave';
import { accountToRequest, validateAccount } from '@/lib/forms/account';

/** True when every value in `errors` is falsy (i.e. the form is valid). */
function isValid(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).every((value) => !value);
}

describe('employee form validation', () => {
  it('rejects the empty form', () => {
    const errors = validateEmployee(emptyEmployeeValues);
    expect(isValid(errors)).toBe(false);
    expect(errors.employeeCode).toBe('Employee code is required.');
    expect(errors.firstName).toBe('First name is required.');
    expect(errors.lastName).toBe('Last name is required.');
  });

  it('accepts a minimal valid employee', () => {
    const errors = validateEmployee({
      ...emptyEmployeeValues,
      employeeCode: 'EMP999',
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
    expect(isValid(errors)).toBe(true);
  });

  it('rejects an invalid email but allows it to be blank', () => {
    expect(validateEmployee({ ...emptyEmployeeValues, employeeCode: 'E1', firstName: 'A', lastName: 'B' }).email)
      .toBeUndefined();
    expect(
      validateEmployee({ ...emptyEmployeeValues, employeeCode: 'E1', firstName: 'A', lastName: 'B', email: 'not-an-email' })
        .email,
    ).toBe('Enter a valid email address.');
  });

  it('enforces the backend size limits', () => {
    const errors = validateEmployee({
      ...emptyEmployeeValues,
      employeeCode: 'x'.repeat(41),
      firstName: 'x'.repeat(81),
      lastName: 'x'.repeat(81),
      phone: 'x'.repeat(33),
    });
    expect(errors.employeeCode).toBe('Employee code must be 40 characters or fewer.');
    expect(errors.firstName).toBe('First name must be 80 characters or fewer.');
    expect(errors.lastName).toBe('Last name must be 80 characters or fewer.');
    expect(errors.phone).toBe('Phone must be 32 characters or fewer.');
  });

  it('sends empty optional fields as null, never as empty strings', () => {
    const request = employeeToRequest({
      ...emptyEmployeeValues,
      employeeCode: 'EMP002',
      firstName: 'Grace',
      lastName: 'Hopper',
    });
    expect(request.email).toBeNull();
    expect(request.phone).toBeNull();
    expect(request.departmentId).toBeNull();
    expect(request.joiningDate).toBeNull();
    // Jackson would fail to parse "" as a UUID or LocalDate, so this matters.
    expect(request.status).toBe('ACTIVE');
  });

  it('trims the values it sends', () => {
    const request = employeeToRequest({
      ...emptyEmployeeValues,
      employeeCode: '  EMP003  ',
      firstName: '  Alan ',
      lastName: ' Turing ',
    });
    expect(request.employeeCode).toBe('EMP003');
    expect(request.firstName).toBe('Alan');
    expect(request.lastName).toBe('Turing');
  });
});

describe('department form validation', () => {
  it('requires a company, code and name', () => {
    const errors = validateDepartment(emptyDepartmentValues);
    expect(errors.companyId).toBe('Select a company.');
    expect(errors.code).toBe('Department code is required.');
    expect(errors.name).toBe('Department name is required.');
  });

  it('enforces the backend size limits', () => {
    const errors = validateDepartment({ companyId: 'c1', code: 'x'.repeat(33), name: 'x'.repeat(121) });
    expect(errors.code).toBe('Code must be 32 characters or fewer.');
    expect(errors.name).toBe('Name must be 120 characters or fewer.');
  });

  it('builds the DepartmentRequest payload', () => {
    expect(departmentToRequest({ companyId: 'c1', code: ' ENG ', name: ' Engineering ' })).toEqual({
      companyId: 'c1',
      code: 'ENG',
      name: 'Engineering',
    });
  });
});

describe('leave form validation', () => {
  const valid = { startDate: '2026-11-02', endDate: '2026-11-06', reason: 'Annual leave' };

  it('accepts a well-formed request', () => {
    expect(isValid(validateLeave(valid))).toBe(true);
  });

  it('requires both dates and a reason', () => {
    const errors = validateLeave(emptyLeaveValues);
    expect(errors.startDate).toBe('Start date is required.');
    expect(errors.endDate).toBe('End date is required.');
    expect(errors.reason).toBe('A reason is required.');
  });

  it('rejects an end date before the start date (chk_leave_request_dates)', () => {
    const errors = validateLeave({ startDate: '2026-11-06', endDate: '2026-11-02', reason: 'x' });
    expect(errors.endDate).toBe('End date must be on or after the start date.');
  });

  it('allows a single-day request (end == start)', () => {
    expect(isValid(validateLeave({ ...valid, endDate: valid.startDate }))).toBe(true);
  });

  it('rejects malformed dates', () => {
    const errors = validateLeave({ startDate: '02/11/2026', endDate: '06/11/2026', reason: 'x' });
    expect(errors.startDate).toBe('Enter a valid date (yyyy-MM-dd).');
  });

  it('enforces the 1000-character reason limit', () => {
    expect(validateLeave({ ...valid, reason: 'x'.repeat(1001) }).reason).toBe(
      'Reason must be 1000 characters or fewer.',
    );
  });

  it('builds a payload with no employeeId (the backend derives it from the principal)', () => {
    const submission = leaveToSubmission({ ...valid, reason: '  Family event  ' });
    expect(submission).toEqual({
      startDate: '2026-11-02',
      endDate: '2026-11-06',
      reason: 'Family event',
    });
    expect(Object.keys(submission)).not.toContain('employeeId');
  });
});

describe('account form validation', () => {
  const valid = {
    email: 'hr@northstar.local',
    password: 'CorrectHorse9x',
    roles: ['HR'],
    employeeCode: '',
  };

  it('accepts a well-formed account', () => {
    expect(isValid(validateAccount(valid))).toBe(true);
  });

  it('requires at least one role (@NotEmpty roles)', () => {
    expect(validateAccount({ ...valid, roles: [] }).roles).toBe('Select at least one role.');
  });

  it('requires a valid email', () => {
    expect(validateAccount({ ...valid, email: '' }).email).toBe('Email is required.');
    expect(validateAccount({ ...valid, email: 'nope' }).email).toBe('Enter a valid email address.');
  });

  it('enforces the 12-character password minimum', () => {
    expect(validateAccount({ ...valid, password: 'short' }).password).toBe('Password must be at least 12 characters.');
  });

  it('enforces the 72 UTF-8 byte bcrypt limit, not just 72 characters', () => {
    // 40 multi-byte characters = 120 UTF-8 bytes but only 40 JS characters,
    // so a length-only check would wrongly accept it.
    const multiByte = 'é'.repeat(40);
    expect(multiByte.length).toBe(40);
    expect(validateAccount({ ...valid, password: multiByte }).password).toBe(
      'Password must be at most 72 UTF-8 bytes (bcrypt limit).',
    );
    expect(validateAccount({ ...valid, password: 'x'.repeat(73) }).password).toBe(
      'Password must be 72 characters or fewer.',
    );
  });

  it('builds the CreateAccountRequest payload', () => {
    expect(
      accountToRequest({ email: ' a@b.co ', password: 'pw', roles: ['ADMIN', 'HR'], employeeCode: ' EMP001 ' }),
    ).toEqual({
      email: 'a@b.co',
      password: 'pw',
      roles: ['ADMIN', 'HR'],
      employeeCode: 'EMP001',
    });
  });

  it('sends a null employeeCode when it is left blank', () => {
    expect(accountToRequest(valid).employeeCode).toBeNull();
  });
});

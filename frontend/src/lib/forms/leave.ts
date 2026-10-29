import type { LeaveSubmission } from '@/lib/types';

export interface LeaveFormValues {
  startDate: string;
  endDate: string;
  reason: string;
}

export type LeaveFormErrors = Partial<Record<keyof LeaveFormValues, string>>;

export const emptyLeaveValues: LeaveFormValues = { startDate: '', endDate: '', reason: '' };

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Mirrors LeaveSubmission (@NotNull startDate/endDate, @NotBlank @Size(max=1000)
 * reason) plus the table's `chk_leave_request_dates` check that end >= start.
 * The employee is resolved server-side from the principal — no employeeId here.
 */
export function validateLeave(values: LeaveFormValues): LeaveFormErrors {
  const errors: LeaveFormErrors = {};

  if (!values.startDate) errors.startDate = 'Start date is required.';
  else if (!DATE_ONLY.test(values.startDate)) errors.startDate = 'Enter a valid date (yyyy-MM-dd).';

  if (!values.endDate) errors.endDate = 'End date is required.';
  else if (!DATE_ONLY.test(values.endDate)) errors.endDate = 'Enter a valid date (yyyy-MM-dd).';

  // Compare as calendar dates (string compare is safe for yyyy-MM-dd) so the
  // end date can never precede the start date.
  if (!errors.startDate && !errors.endDate && values.endDate < values.startDate) {
    errors.endDate = 'End date must be on or after the start date.';
  }

  if (!values.reason.trim()) errors.reason = 'A reason is required.';
  else if (values.reason.length > 1000) errors.reason = 'Reason must be 1000 characters or fewer.';

  return errors;
}

export function leaveToSubmission(values: LeaveFormValues): LeaveSubmission {
  return {
    startDate: values.startDate,
    endDate: values.endDate,
    reason: values.reason.trim(),
  };
}

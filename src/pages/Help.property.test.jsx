// Feature: synthesized-ether-full-functionality, Property 5: Support ticket form rejects empty required fields

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateTicketFields } from './Help';

/**
 * Validates: Requirements 11.3
 *
 * Property 5: Support ticket form rejects empty required fields
 * For any submission where `subject` or `description` is empty or whitespace-only,
 * the form does not submit and displays at least one validation message.
 *
 * We test the exported `validateTicketFields` function directly, which is the
 * pure validation logic extracted from the DirectSupportSection component.
 * This avoids the need for DOM rendering while still verifying the invariant.
 */

describe('Help – support ticket form property-based tests', () => {
  // ── Case 1: empty / whitespace-only subject ──────────────────────────────
  it('Property 5a: rejects when subject is empty or whitespace-only (any description)', () => {
    fc.assert(
      fc.property(
        // subject: empty string or string that trims to empty (whitespace-only)
        fc.oneof(
          fc.constant(''),
          fc.string({ minLength: 1, maxLength: 20 }).map((s) => s.replace(/[^\s]/g, ' '))
        ),
        // description: any string (including valid non-empty ones)
        fc.string({ minLength: 0, maxLength: 200 }),
        (subject, description) => {
          const errors = validateTicketFields({ subject, description });
          // Must have at least one validation error
          expect(Object.keys(errors).length).toBeGreaterThanOrEqual(1);
          // The subject field specifically must have an error
          expect(errors.subject).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  // ── Case 2: empty / whitespace-only description ──────────────────────────
  it('Property 5b: rejects when description is empty or whitespace-only (any subject)', () => {
    fc.assert(
      fc.property(
        // subject: any string (including valid non-empty ones)
        fc.string({ minLength: 0, maxLength: 200 }),
        // description: empty string or string that trims to empty (whitespace-only)
        fc.oneof(
          fc.constant(''),
          fc.string({ minLength: 1, maxLength: 20 }).map((s) => s.replace(/[^\s]/g, ' '))
        ),
        (subject, description) => {
          const errors = validateTicketFields({ subject, description });
          // Must have at least one validation error
          expect(Object.keys(errors).length).toBeGreaterThanOrEqual(1);
          // The description field specifically must have an error
          expect(errors.description).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  // ── Case 3: both fields empty / whitespace-only ──────────────────────────
  it('Property 5c: rejects when both subject and description are empty or whitespace-only', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.string({ minLength: 1, maxLength: 20 }).map((s) => s.replace(/[^\s]/g, ' '))
        ),
        fc.oneof(
          fc.constant(''),
          fc.string({ minLength: 1, maxLength: 20 }).map((s) => s.replace(/[^\s]/g, ' '))
        ),
        (subject, description) => {
          const errors = validateTicketFields({ subject, description });
          // Both fields must have errors
          expect(errors.subject).toBeTruthy();
          expect(errors.description).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  // ── Inverse: valid inputs produce no errors ───────────────────────────────
  it('Property 5d: accepts when both subject and description have non-whitespace content', () => {
    fc.assert(
      fc.property(
        // subject: string with at least one non-whitespace character
        fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
        // description: string with at least one non-whitespace character
        fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0),
        (subject, description) => {
          const errors = validateTicketFields({ subject, description });
          // No errors expected for valid inputs
          expect(Object.keys(errors).length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

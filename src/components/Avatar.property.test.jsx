// Feature: synthesized-ether-full-functionality, Property 1: Avatar initials are always visible for any non-empty name
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { expect } from 'vitest';
import { getInitials } from './Avatar';

/**
 * Validates: Requirements 15.7, 14.1
 *
 * Property 1: Avatar initials are always visible for any non-empty name
 * For any non-empty string `name`, getInitials(name) returns a string of length >= 1.
 */
describe('Avatar – property-based tests', () => {
  it('Property 1: getInitials returns a non-empty string for any non-empty name', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (name) => {
        const initials = getInitials(name);
        expect(initials.length).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: 100 }
    );
  });
});

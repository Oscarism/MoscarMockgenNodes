// ============================================
// Shared API Validation Helpers
// ============================================

import { json } from '@sveltejs/kit';

/**
 * Return a JSON error response in the app's standard format.
 */
export function apiError(message: string, status: number = 400) {
  return json({ code: status, msg: message }, { status });
}

/**
 * Validate that a prompt exists, is a string, and within a max length.
 * Returns an error response if invalid, or null if valid.
 */
export function validatePrompt(
  prompt: unknown,
  maxLength: number,
  required: boolean = true
): Response | null {
  if (required && (!prompt || typeof prompt !== 'string')) {
    return apiError('Prompt is required');
  }
  if (prompt && typeof prompt === 'string' && prompt.length > maxLength) {
    return apiError(`Prompt exceeds ${maxLength} character limit`);
  }
  return null;
}

/**
 * Validate that an aspect ratio is in the allowed list.
 * Returns an error response if invalid, or null if valid.
 */
export function validateAspectRatio(
  ratio: unknown,
  validRatios: readonly string[]
): Response | null {
  if (!validRatios.includes(ratio as string)) {
    return apiError(`Invalid aspect ratio. Must be one of: ${validRatios.join(', ')}`);
  }
  return null;
}

/**
 * Validate a required string field.
 * Returns an error response if invalid, or null if valid.
 */
export function validateRequiredString(
  value: unknown,
  fieldName: string
): Response | null {
  if (!value || typeof value !== 'string') {
    return apiError(`${fieldName} is required`);
  }
  return null;
}

/**
 * Validate that a value is in an allowed set.
 * Returns an error response if invalid, or null if valid.
 */
export function validateOneOf(
  value: unknown,
  allowed: readonly string[],
  fieldName: string
): Response | null {
  if (!allowed.includes(value as string)) {
    return apiError(`Invalid ${fieldName}. Must be one of: ${allowed.join(', ')}`);
  }
  return null;
}

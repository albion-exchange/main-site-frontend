/**
 * Date validation utilities using Zod
 * Provides runtime validation for ISO date string formats
 */

import { z } from 'zod';
import type { ISODateTimeString, ISODateOnlyString, ISOYearMonthString } from '$lib/types/sharedTypes';

// Zod schemas for date validation
export const ISODateTimeSchema = z.string()
  .datetime({ offset: true })
  .transform(val => val as ISODateTimeString);

export const ISODateOnlySchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Expected YYYY-MM-DD')
  .refine((val) => {
    const date = new Date(val + 'T00:00:00.000Z');
    return !isNaN(date.getTime()) && date.toISOString().startsWith(val);
  }, 'Invalid date')
  .transform(val => val as ISODateOnlyString);

export const ISOYearMonthSchema = z.string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid year-month format. Expected YYYY-MM')
  .refine((val) => {
    const [year, month] = val.split('-').map(Number);
    return year >= 1900 && year <= 2100 && month >= 1 && month <= 12;
  }, 'Invalid year or month')
  .transform(val => val as ISOYearMonthString);

// Type guards
export function isISODateTimeString(value: unknown): value is ISODateTimeString {
  return ISODateTimeSchema.safeParse(value).success;
}

export function isISODateOnlyString(value: unknown): value is ISODateOnlyString {
  return ISODateOnlySchema.safeParse(value).success;
}

export function isISOYearMonthString(value: unknown): value is ISOYearMonthString {
  return ISOYearMonthSchema.safeParse(value).success;
}

// Validation functions that throw on invalid input
export function validateISODateTime(value: string): ISODateTimeString {
  return ISODateTimeSchema.parse(value);
}

export function validateISODateOnly(value: string): ISODateOnlyString {
  return ISODateOnlySchema.parse(value);
}

export function validateISOYearMonth(value: string): ISOYearMonthString {
  return ISOYearMonthSchema.parse(value);
}

// Safe validation functions that return results
export function safeValidateISODateTime(value: string) {
  return ISODateTimeSchema.safeParse(value);
}

export function safeValidateISODateOnly(value: string) {
  return ISODateOnlySchema.safeParse(value);
}

export function safeValidateISOYearMonth(value: string) {
  return ISOYearMonthSchema.safeParse(value);
}

// Utility functions
export function formatDateToISOString(date: Date): ISODateTimeString {
  return date.toISOString() as ISODateTimeString;
}

export function formatDateToISODateOnly(date: Date): ISODateOnlyString {
  return date.toISOString().split('T')[0] as ISODateOnlyString;
}

export function formatDateToISOYearMonth(date: Date): ISOYearMonthString {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}` as ISOYearMonthString;
}

// Example usage in data validation
export const AssetMetadataDateFieldsSchema = z.object({
  createdAt: ISODateTimeSchema,
  updatedAt: ISODateTimeSchema,
  firstPaymentDate: ISOYearMonthSchema,
  expectedEndDate: ISOYearMonthSchema,
  firstOil: ISOYearMonthSchema,
  tokenPayout: z.object({
    date: ISODateTimeSchema,
  }),
  lastIncidentDate: ISODateTimeSchema.optional(),
});
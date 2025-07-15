/**
 * Examples of using date validation utilities
 */

import {
  validateISODateTime,
  validateISODateOnly,
  validateISOYearMonth,
  safeValidateISODateTime,
  isISODateTimeString,
  formatDateToISOString,
  formatDateToISODateOnly,
  formatDateToISOYearMonth
} from './dateValidation';

// Example 1: Validating user input (throws on invalid)
try {
  const validatedDateTime = validateISODateTime('2025-07-15T10:30:45.000Z');
  console.log('Valid datetime:', validatedDateTime);
} catch (error) {
  console.error('Invalid datetime:', error);
}

// Example 2: Safe validation (returns result object)
const dateResult = safeValidateISODateTime('2025-07-15T10:30:45.000Z');
if (dateResult.success) {
  console.log('Valid date:', dateResult.data);
} else {
  console.error('Validation errors:', dateResult.error.errors);
}

// Example 3: Type guards
const unknownValue: unknown = '2025-07-15';
if (isISODateTimeString(unknownValue)) {
  // TypeScript now knows unknownValue is ISODateTimeString
  console.log('Is valid ISO datetime');
}

// Example 4: Formatting helpers
const now = new Date();
const isoDateTime = formatDateToISOString(now);
const isoDateOnly = formatDateToISODateOnly(now);
const isoYearMonth = formatDateToISOYearMonth(now);

// Example 5: Validating data from API/JSON
import { AssetMetadataDateFieldsSchema } from './dateValidation';

const apiResponse = {
  createdAt: '2025-07-15T10:30:45.000Z',
  updatedAt: '2025-07-15T10:30:45.000Z',
  firstPaymentDate: '2025-03',
  expectedEndDate: '2030-12',
  firstOil: '2019-06',
  tokenPayout: {
    date: '2025-07-15T00:00:00.000Z'
  },
  lastIncidentDate: '2023-12-15T00:00:00.000Z'
};

try {
  const validatedDates = AssetMetadataDateFieldsSchema.parse(apiResponse);
  console.log('All dates are valid:', validatedDates);
} catch (error) {
  console.error('Date validation failed:', error);
}
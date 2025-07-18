import { expect } from "@playwright/test";

export function assertTimestamp(timestamp, fieldName) {
  expect(timestamp).toBeDefined();
  expect(typeof timestamp).toBe('string');
  expect(new Date(timestamp).toString()).not.toBe('Invalid Date');
  console.log(`${fieldName} is a valid timestamp`);
}








import { test, expect } from "@playwright/test";

test("should true to be true", async ({ request }) => {
  expect(true).toBe(true);
});

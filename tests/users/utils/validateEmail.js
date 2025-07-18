import { expect } from "@playwright/test";


export function assertEmail(email) {
    expect(typeof email).toBe("string");
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
}
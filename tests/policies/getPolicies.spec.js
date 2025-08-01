import { test, expect } from "@playwright/test";
import { getAccessToken } from "../utils/getAccessToken";
import { validateUUID } from "../utils/validateUUID";
let accessToken;

test.beforeAll(async ({ request }) => {
  accessToken = await getAccessToken({ request });
});

test.describe("Get Policies", () => {
  test("should test without token and response tobe 401", async ({
    request,
  }) => {
    // arrange
    //act
    const response = await request.get("http://localhost:3000/api/policies");
    //assert
    expect(response.status()).toBe(401);
    const body = await response.json();
    const { error, success } = body;
    expect(success).toBeFalsy();
    expect(error).toBe("No authorization header provided");
  });

  test("should response 200 when we give valid Token", async ({ request }) => {
    //arrange
    //act
    const response = await request.get("http://localhost:3000/api/policies", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    //assert
    expect(response.status()).toBe(200);

    const body = await response.json();
    const { success, data } = body;

    expect(success).toBeTruthy();
    expect(Array.isArray(data)).toBeTruthy();

    for (const policy of data) {
      const { id, name, permissions, createdAt, updatedAt } = policy;

      expect(Array.isArray(permissions)).toBeTruthy();
      expect(permissions.length).toBeGreaterThan(0);

      expect(typeof id).toBe("string");
      expect(validateUUID).toBeTruthy();

      expect(typeof name).toBe("string");
      expect(name.length).toBeGreaterThan(0);

      expect(Array.isArray(permissions)).toBeTruthy();

      for (const permission of permissions) {
        const { resource, action } = permission;
        const validResources = [
          "users",
          "groups",
          "policies",
          "access-requests",
        ];
        const validActions = ["create", "read", "update", "delete"];

        expect(typeof resource).toBe("string");
        expect(validResources.includes(resource)).toBeTruthy();

        expect(typeof action).toBe("string");
        expect(validActions.includes(action)).toBeTruthy();
      }

      expect(typeof createdAt).toBe("string");
      expect(new Date(createdAt).toString()).not.toBe("Invalid Date");

      expect(typeof updatedAt).toBe("string");
      expect(new Date(updatedAt).toString()).not.toBe("Invalid Date");
    }
  });
});

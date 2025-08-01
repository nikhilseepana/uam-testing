import { test, expect } from "@playwright/test";
import { getAccessToken } from "../utils/getAccessToken";

import { validateUUID } from "..//utils/validateUUID";
let accessToken;
let newPolicyId;

test.beforeAll(async ({ request }) => {
  accessToken = await getAccessToken({ request });
  //arrange
  const payload = {
    name: "Anusha Policy",
    permissions: [
      {
        resource: "users",
        action: "delete",
      },
      {
        resource: "users",
        action: "update",
      },
    ],
  };
  //act
  const response = await request.post("http://localhost:3000/api/policies", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: payload,
  });
  //assert
  const body = await response.json();
  const { data } = body;
  const { id } = data;
  newPolicyId = id;
});

test.describe("Put Policies By Id", () => {
  test("should get response as 401 without token", async ({ request }) => {
    //arrange
    //act
    const response = await request.put(
      `http://localhost:3000/api/policies/${newPolicyId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    //assert
    const body = await response.json();
    expect(response.status()).toBe(401);

    const { success, error } = body;
    expect(success).toBeFalsy();
    expect(error).toBe("No authorization header provided");
  });

  test("should update the body and response is 200/Policy updated successfully", async ({
    request,
  }) => {
    //arrange
    const payload = {
      name: "Tanush Policy",
      permissions: [
        {
          resource: "users",
          action: "read",
        },
      ],
    };
    //act
    const response = await request.put(
      `http://localhost:3000/api/policies/${newPolicyId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        data: payload,
      }
    );
    //assert
    const body = await response.json();
    expect(response.status()).toBe(200);

    const { success, data } = body;
    expect(success).toBeTruthy();
    const { id, name, permissions, createdAt, updatedAt } = data;
    //iD check
    expect(typeof id).toBe("string");
    expect(validateUUID(id)).toBeTruthy();
    //name check
    expect(typeof name).toBe("string");
    //permissions check
    expect(Array.isArray(permissions)).toBeTruthy();

    for (const permission of permissions) {
      const { resource, action } = permission;
      const validResources = ["users", "groups", "policies", "access-requests"];
      const validActions = ["create", "read", "update", "delete"];
      //resource check
      expect(typeof resource).toBe("string");
      expect(validResources.includes(resource)).toBeTruthy();
      //action check
      expect(typeof action).toBe("string");
      expect(validActions.includes(action)).toBeTruthy();
      //ValidDate check
      expect(typeof createdAt).toBe("string");
      expect(new Date(createdAt).toString()).not.toBe("Invalid Date");

      expect(typeof updatedAt).toBe("string");
      expect(new Date(updatedAt).toString()).not.toBe("Invalid Date");
    }
  });

  test("should response as 404 if policyId is Invalid", async ({ request }) => {
    //arrange
    const invalidPolicyId = "123-invalid-id"; // Fake ID
    const payload = {
      name: "Tanush Policy",
      permissions: [
        {
          resource: "users",
          action: "read",
        },
      ],
    };
    //act
    const response = await request.put(
      `http://localhost:3000/api/policies/${invalidPolicyId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        data: payload,
      }
    );
    //assert
    expect(response.status()).toBe(404);
    const body = await response.json();
    const { success, error } = body;

    expect(success).toBeFalsy();
    expect(error).toContain("Policy not found");
  });
});

test.afterAll(async ({ request }) => {
  const response = await request.delete(
    `http://localhost:3000/api/policies/${newPolicyId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  expect(response.status()).toBe(200);
});

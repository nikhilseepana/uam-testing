import { test, expect } from "@playwright/test";
import { getAccessToken } from "../utils/getAccessToken";
import { validateUUID } from "../utils/validateUUID";

let accessToken;
let newPolicyId;

test.beforeAll(async ({ request }) => {
  accessToken = await getAccessToken({ request });
  //arrange
  const payload = {
    name: "Gayatri Policy",
    permissions: [
      {
        resource: "users",
        action: "read",
      },
      {
        resource: "users",
        action: "create",
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

test.describe("Get Policy By ID", () => {
  test("should return 401 when no token is given", async ({ request }) => {
    //arrange
    //act
    const response = await request.get("http://localhost:3000/api/policies");
    //assert
    expect(response.status()).toBe(401);
    const body = await response.json();
    const { error, success } = body;
    expect(success).toBeFalsy();
    expect(error).toBe("No authorization header provided");
  });
  test("should return 200 when Policy Id is given", async ({ request }) => {
    //arrange
    //act
    const response = await request.get(
      `http://localhost:3000/api/policies/${newPolicyId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
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
  test("should return 404 when policyId is Invalid", async ({ request }) => {
    
    //arrange
    const invalidPolicyId = "123-invalid-id"; //fake group ID
    //act
    const response = await request.get(
      `http://localhost:3000/api/policies/${invalidPolicyId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
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

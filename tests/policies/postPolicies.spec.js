import { test, expect } from "@playwright/test";
import { getAccessToken } from "../utils/getAccessToken";
import { allowedNodeEnvironmentFlags } from "node:process";
let accessToken;
let newPolicyId;

test.beforeAll(async ({ request }) => {
  accessToken = await getAccessToken({ request });
});

test.describe("Post Policies", () => {
  test("should test without token and response tobe 401", async ({
    request,
  }) => {
    //arrange
    //act
    const response = await request.post("http://localhost:3000/api/policies");
    //assert
    expect(response.status()).toBe(401);
    const body = await response.json();
    const { error, success } = body;
    expect(success).toBeFalsy();
    expect(error).toBe("No authorization header provided");
  });
  test("should response 201 with valid token and proper body", async ({
    request,
  }) => {
    //arrange
    const payload = {
      name: "New Policy",
      permissions: [
        {
          resource: "groups",
          action: "read",
        },
        {
          resource: "policies",
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
    expect(response.status()).toBe(201);
    const { success, data } = body;
    const { id } = data;
    newPolicyId = id;
    expect(success).toBeTruthy();
  });

  test("should return 400 Bad request - Invalid input", async ({ request }) => {
    //arrange
    const payload = {
      name: "",
      permissions: [
        {
          resource: "",
          action: "",
        },
        {
          resource: "policies",
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
    expect(response.status()).toBe(400);
    const { success, error } = body;
    expect(success).toBeFalsy();
    expect(error).toContain("Policy name and permissions array are required");
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

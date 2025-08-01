import { test, expect } from "@playwright/test";
import { getAccessToken } from "../utils/getAccessToken";

let accessToken;
let newPolicyId;

test.beforeAll(async ({ request }) => {
  accessToken = await getAccessToken({ request });
  const payload = {
    name: "Nihan Policy",
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

test.describe("Delete policy By ID", () => {
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
  test("Should get response as 200 when policyId is deleted succesfully", async ({
    request,
  }) => {
    //arrange
    //act
    const response = await request.delete(
      `http://localhost:3000/api/policies/${newPolicyId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    //assert
    expect(response.status()).toBe(200);
    const body = await response.json();
    const { success, message } = body;
    expect(success).toBeTruthy();
    expect(message).toBe("Policy deleted successfully");
  });

  test("should return 404 when we give invalid group ID", async ({
    request,
  }) => {
    const invalidGroupId = "123-invalid-id"; // Fake or non-existent ID

    const response = await request.delete(
      `http://localhost:3000/api/groups/${invalidGroupId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    expect(response.status()).toBe(404);
    const body = await response.json();
    const { success, error } = body;
    expect(success).toBeFalsy();
    expect(error).toContain("Group not found");
  });
});

test.afterAll(async ({ request }) => {
  await request.delete(`http://localhost:3000/api/policies/${newPolicyId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
});

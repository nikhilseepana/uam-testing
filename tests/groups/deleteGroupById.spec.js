import { test, expect } from "@playwright/test";
import { getAccessToken } from "../utils/getAccessToken";
let accessToken;
let newGroupId;

test.beforeAll(async ({ request }) => {
  accessToken = await getAccessToken({ request });
  //arrange
  const payload = {
    name: "Delete Group Id",
    policies: ["80a321aa-8d8a-418f-844c-3a8827d105da"],
  };
  //act
  const response = await request.post("http://localhost:3000/api/groups", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: payload,
  });
  //assert
  const body = await response.json();
  const { data } = body;
  const { id } = data;
  newGroupId = id;
});

test.describe("Delete Groups", () => {
  test("should test without token and response tobe 401", async ({
    request,
  }) => {
    const response = await request.delete(
      `http://localhost:3000/api/groups/${newGroupId}`
    );
    expect(response.status()).toBe(401);
  });
  test("Should get response as 200 when groupId is deleted succesfully", async ({
    request,
  }) => {
    const response = await request.delete(
      `http://localhost:3000/api/groups/${newGroupId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    const { success, message } = body;
    expect(success).toBeTruthy();
    expect(message).toBe("Group deleted successfully");
  });

  test("Should get response as 404 not found for invalid group Id is given", async ({
    request,
  }) => {
    //arrange
    const invalidGroupId = "123-invalid-id"; // Fake/Invalid group ID for 404 test
    //act
    const response = await request.delete(`http://localhost:3000/api/groups/${invalidGroupId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    //assert
     expect(response.status()).toBe(404);
    const body = await response.json();
    const { success, error } = body;
    expect(success).toBeFalsy();
    expect(error).toContain("Group not found");
  });
});

test.afterAll(async ({ request }) => {
  await request.delete(`http://localhost:3000/api/groups/${newGroupId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
});



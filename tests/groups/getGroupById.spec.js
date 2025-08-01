import { test, expect } from "@playwright/test";
import { getAccessToken } from "../utils/getAccessToken";
import { validateUUID } from "../utils/validateUUID";
let accessToken;
let newGroupId;

const invalidGroupId = "123-invalid-id"; //fake group ID

test.beforeAll(async ({ request }) => {
  accessToken = await getAccessToken({ request });
  //arrange
  const payload = {
    name: "automation Tester Post",
    policies: ["fc5d7488-6c0f-4a87-ab78-192a266b4641"],
  };
  //act
  const response = await request.post("http://localhost:3000/api/groups", {
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
  newGroupId = id;
});

//Test cases for all responses

test.describe("Get Group by Id", () => {
  test("should get response as 404 for Invalid groupId with valid token", async ({
    request,
  }) => {
    //arrange
    //act
    const response = await request.get(
      `http://localhost:3000/api/groups/${invalidGroupId}`,
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
    expect(error).toContain("Group not found");
  });

  test("When proper Group IDd is given then it should return 200", async ({
    request,
  }) => {
    //arrange
    //act
    const response = await request.get(
      `http://localhost:3000/api/groups/${newGroupId}`,
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
    const { id, name, policies, createdAt, updatedAt } = data;

    expect(typeof id).toBe("string");
    expect(validateUUID(id)).toBeTruthy();

    expect(typeof name).toBe("string");

    expect(Array.isArray(policies)).toBeTruthy();

    expect(typeof createdAt).toBe("string");
    expect(new Date(createdAt).toString()).not.toBe("Invalid Date");

    expect(typeof updatedAt).toBe("string");
    expect(new Date(updatedAt).toString()).not.toBe("Invalid Date");
  });
});

// Cleanup: Delete the group we created

test.afterAll(async ({ request }) => {
  const response = await request.delete(
    `http://localhost:3000/api/groups/${newGroupId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  expect(response.status()).toBe(200);
});

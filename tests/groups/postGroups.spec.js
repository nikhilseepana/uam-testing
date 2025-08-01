import { test, expect } from "@playwright/test";
import { getAccessToken } from "../utils/getAccessToken";
import { validateUUID } from "../utils/validateUUID";
let accessToken;
let newGroupId;

test.beforeAll(async ({ request }) => {
  accessToken = await getAccessToken({ request });
});

test.describe("Post Groups", () => {
  test("When no token is given response should be 401", async ({ request }) => {
    //arrange
    //act
    const response = await request.post("http://localhost:3000/api/groups");
    //assert
    const body = await response.json();
    expect(response.status()).toBe(401);
    const { success, error } = body;
    expect(success).toBeFalsy();
    expect(error).toBe("No authorization header provided");
  });
  test("should response 201 with valid token and proper body", async ({
    request,
  }) => {
    //arrange
    const payload = {
      name: "automation Tester1",
      policies: ["80a321aa-8d8a-418f-844c-3a8827d105da"],
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
    expect(response.status()).toBe(201);
    const { success, data } = body;
    expect(success).toBeTruthy();
    const { id, name, policies, createdAt, updatedAt } = data;
    newGroupId = id;

    expect(typeof id).toBe("string");
    expect(validateUUID(id)).toBeTruthy();

    expect(typeof name).toBe("string");

    expect(Array.isArray(policies)).toBeTruthy();

    expect(typeof createdAt).toBe("string");
    expect(new Date(createdAt).toString()).not.toBe("Invalid Date");

    expect(typeof updatedAt).toBe("string");
    expect(new Date(updatedAt).toString()).not.toBe("Invalid Date");
  });

  test("should get response as 409 if we same group name", async ({
    request,
  }) => {
    //arrange
    const payload = {
      name: "automation Tester",
      policies: ["80a321aa-8d8a-418f-844c-3a8827d105da"],
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
    expect(response.status()).toBe(409);
    const { success, error } = body;
    expect(success).toBeFalsy();
    expect(error).toBe("Group name already exists");
  });

  test("should response as 400 bad request if group name is not given", async ({
    request,
  }) => {
    //arrange
    const payload = {
      name: "",
      policies: ["80a321aa-8d8a-418f-844c-3a8827d105da"],
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
    expect(response.status()).toBe(400);
    const { success, error } = body;
    expect(success).toBeFalsy();
    expect(error).toContain("Group name is required");
  });
});

test.afterAll(async ({ request }) => {
  const response = await request.delete(
    `http://localhost:3000/api/groups/${newGroupId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  console.log(response.status());
  expect(response.status()).toBe(200);
});

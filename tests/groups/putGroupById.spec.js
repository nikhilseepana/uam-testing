import { test, expect } from "@playwright/test";
import { getAccessToken } from "../utils/getAccessToken";
import { validateUUID } from "../utils/validateUUID";
let accessToken;
let newGroupId;

test.beforeAll(async ({ request }) => {
  accessToken = await getAccessToken({ request });
  //arrange
  const payload = {
    name: "Api Tester",
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

test.describe("Put GroupById/", () => {
  test("should get response as 401 without token", async ({ request }) => {
    //arrange
    //act
    const response = await request.put(
      `http://localhost:3000/api/users/${newGroupId}`,
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

  test("should get response as 200 ok when body is updated", async ({
    request,
  }) => {
    //arrange
    const payload = {
      name: "Playwright tester",
      policies: ["fc5d7488-6c0f-4a87-ab78-192a266b4641"],
    };
    //act
    const response = await request.put(
      `http://localhost:3000/api/groups/${newGroupId}`,
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

  test("Should return 404 for invalid group ID", async ({ request }) => {
    //arrange
    const payload = {
      name: "Playwright tester",
      policies: ["fc5d7488-6c0f-4a87-ab78-192a266b4641"],
    };
    // act
    const response = await request.put(
      "http://localhost:3000/api/groups/485bd810-5568-4e30-a55b-0985e000ddc2",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        data: payload,
      }
    );
    // assert
    expect(response.status()).toBe(404);
    const body = await response.json();

    const { success, error } = body;
    expect(success).toBeFalsy();
    expect(error).toContain("Group not found");
  });

  test("Should return 400 for invalid name/Policy ID", async ({ request }) => {
    //arrange
    const payload = {
      name: "Invalid automation Tester",
      policies: ["80a321aa-8d8a-418f-844c-3a8827d105ik"],
    };
    // act
    const response = await request.put(
      `http://localhost:3000/api/groups/${newGroupId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        data: payload,
      }
    );
    // assert
    expect(response.status()).toBe(400);
    const body = await response.json();

    const { success, error } = body;
    expect(success).toBeFalsy();
    expect(error).toContain(
      "Invalid policy IDs: 80a321aa-8d8a-418f-844c-3a8827d105ik"
    );
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
  expect(response.status()).toBe(200);
});

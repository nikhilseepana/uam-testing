import { test, expect } from "@playwright/test";
import { response } from "express";
import { assertEmail } from "../users/utils/validateEmail";
let accessToken;
let newUserId;

test.beforeAll(async ({ request }) => {
  const response = await request.post("http://localhost:3000/api/auth/login", {
    data: {
      username: "admin@example.com",
      password: "pa$$w0rd",
    },
  });
  const body = await response.json();
  const { data } = body;
  const { token } = data;
  accessToken = token;
});

test.describe("Put Users", () => {
  test("should response 401 if token is missing", async ({ request }) => {
    //arrange
    const newUserId = "550e8400-e29b-41d4-a716-446655440000";
    const payload = {
      firstName: "John Updated",
      lastName: "Doe Updated",
    };
    //act
    const response = await request.put(
      "http://localhost:3000/api/users/e497cc5b-23c9-4ab4-863d-dd932ca2e0fb",
      {
        headers: {
          "Content-Type": "Application/json",
        },
        data: payload,
      }
    );
    //assert
    expect(response.status()).toBe(401);

    const body = await response.json();

    const { success, error } = body;

    expect(success).toBeFalsy();
    expect(error).toContain("No authorization header provided");
  });

  test("when user is successfully updated with proper body then response should be 200 OK", async ({
    request,
  }) => {
    //arrange
    const newUserId = "550e8400-e29b-41d4-a716-446655440000";
    const payload = {
      firstName: "John Updated",
      lastName: "Doe Updated",
    };
    //act
    const response = await request.put(
      "http://localhost:3000/api/users/e497cc5b-23c9-4ab4-863d-dd932ca2e0fb",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "Application/json",
        },
        data: payload,
      }
    );
    //assert
    const availbleRoles = ["admin", "maintainer", "user"];

    const body = await response.json();
    expect(response.status()).toBe(200);
    const { success, data } = body;
    expect(success).toBeTruthy();
    expect(Array.isArray(data)).toBeFalsy();
    const {
      id,
      username,
      email,
      firstName,
      lastName,
      role,
      groups,
      createdAt,
      updatedAt,
    } = data;

    expect(id).toBeDefined();
    expect(typeof id).toBe("string");
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    ); // check for UUID

    expect(username).toBeDefined();
    expect(typeof username).toBe("string");

    assertEmail(email, expect);

    expect(typeof firstName).toBe("string");
    expect(typeof lastName).toBe("string");

    expect(role).toBeDefined();
    expect(typeof role).toBe("string");
    expect(availbleRoles.includes(role)).toBeTruthy();

    expect(Array.isArray(groups)).toBeTruthy();
    for (const groupId of groups) {
      expect(groupId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    }

    expect(createdAt).toBeDefined();
    expect(typeof createdAt).toBe("string");
    expect(new Date(createdAt).toString()).not.toBe("Invalid Date");

    expect(updatedAt).toBeDefined();
    expect(typeof updatedAt).toBe("string");
    expect(new Date(updatedAt).toString()).not.toBe("Invalid Date");
  });

  test("should return 400 bad request if missing proper body", async ({
    request,
  }) => {
    //arrange
    const newUserId = "550e8400-e29b-41d4-a716-446655440000";
    const payload = {
      username: "john_doe_updated",
      email: "john@example.com",
      firstName: "John Updated",
      lastName: "Doe Updated",
      role: "maintainer",
      groups: ["group-id-1", "group-id-3"],
    };
    //act
    const response = await request.put(
      `http://localhost:3000/api/users/e497cc5b-23c9-4ab4-863d-dd932ca2e0fb`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        data: payload,
      }
    );
    //assert
    expect(response.status()).toBe(400);
    const body = await response.json();

    const { success, error } = body;

    expect(success).toBeFalsy();
    expect(error).toContain("Invalid group IDs: group-id-1, group-id-3");
  });

  test("should return 404 if user is not found", async ({ request }) => {
    //arrange
    const newUserId = "550e8400-e29b-41d4-a716-446655440003";
    const payload = {
      firstName: "John Updated",
      lastName: "Doe Updated",
    };
    //act
    const response = await request.put(
      "http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440003",
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
    expect(error).toContain("User not found");
  });

});

import { test, expect } from "@playwright/test";
import { getAccessToken } from "../utils/getAccessToken";
import { validateEmail } from "../utils/validateEmail";

let accessToken;
let newUserId;

test.beforeAll(async ({ request }) => {
  accessToken = await getAccessToken({ request });
});

test.describe("postUsers", () => {
  test("should test without token and response to be 401", async ({
    request,
  }) => {
    const response = await request.post("http://localhost:3000/api/users", {
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status()).toBe(401);
    const { error, success } = await response.json();
    expect(success).toBeFalsy();
    expect(error).toBe("No authorization header provided");
  });

  test("with token and proper body/post response should be 201", async ({
    request,
  }) => {
    //arrange
    const payload = {
      username: "Gayatri_Konni",
      email: "gayatri.konni@example.com",
      firstName: "gayatri",
      lastName: "konni",
      password: "securePassword@123",
      role: "user",
    };
//act
    const response = await request.post("http://localhost:3000/api/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: payload,
    });

    expect(response.status()).toBe(201);
    const { success, data } = await response.json();
    expect(success).toBeTruthy();

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

    newUserId = id;
//assert
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(typeof id).toBe("string");

    expect(username).toBeDefined();
    expect(typeof username).toBe("string");

    expect(validateEmail(email)).toBeTruthy();

    expect(firstName).toBeDefined();
    expect(typeof firstName).toBe("string");

    expect(lastName).toBeDefined();
    expect(typeof lastName).toBe("string");

    const validRoles = ["admin", "maintainer", "user"];
    expect(validRoles.includes(role)).toBeTruthy();

    expect(Array.isArray(groups)).toBe(true);

    expect(createdAt).toBeDefined();
    expect(new Date(createdAt).toString()).not.toBe("Invalid Date");

    expect(updatedAt).toBeDefined();
    expect(new Date(updatedAt).toString()).not.toBe("Invalid Date");
  });

  test("should return 409 when same email is used", async ({ request }) => {
    const payload = {
      username: "Gayatri_Konni2",
      email: "gayatri.konni@example.com",
      firstName: "gayatri",
      lastName: "konni",
      password: "securePassword@123",
      role: "user",
    };

    const response = await request.post("http://localhost:3000/api/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: payload,
    });

    expect(response.status()).toBe(409);
    const { success, error } = await response.json();
    expect(success).toBeFalsy();
    expect(error).toBe("Email already exists");
  });

  test("should return 400 with invalid password", async ({ request }) => {
    const payload = {
      username: `Gayatri_konnii${Date.now()}`,
      email: `gayatri.konni${Date.now()}@example.com`,
      firstName: "gayatri",
      lastName: "konni",
      password: "securePassword123", // missing special char
      role: "user",
    };

    const response = await request.post("http://localhost:3000/api/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: payload,
    });

    expect(response.status()).toBe(400);
    const { success, error } = await response.json();
    expect(success).toBeFalsy();
    expect(error).toContain(
      "Password must contain at least one special character (!@#$%^&*)"
    );
  });

  test("should return 400 when mandatory fields are missing", async ({
    request,
  }) => {
    const payload = {
      username: "Gayatri_konni",
      firstName: "Gayatri",
      lastName: "Konni",
      role: "user",
    };

    const response = await request.post("http://localhost:3000/api/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: payload,
    });

    expect(response.status()).toBe(400);
  });
});

test.afterAll(async ({ request }) => {
  const response = await request.delete(
    `http://localhost:3000/api/users/${newUserId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  expect(response.status()).toBe(200);
});











import { test, expect } from "@playwright/test";
import { getAccessToken } from "../utils/getAccessToken";

let accessToken;
let newUserId;

test.beforeAll(async ({ request }) => {
  accessToken = await getAccessToken({request});
});

test.describe("postUsers", () => {
  test("should test without token and response tobe 401", async ({
    request,
  }) => {
    // arrange
    const payload = {
      username: "Gayatri_konni",
      email: "gayatri.konni@example.com",
      firstName: "gayatri",
      lastName: "konni",
      password: "securePassword123",
      role: "user",
    };
    //act
    const response = await request.post("http://localhost:3000/api/users", {
      headers: { "Content-Type": "application/json" },
    });
    //assert
    expect(response.status()).toBe(401);
    const body = await response.json();
    const { error, success } = body;
    expect(success).toBeFalsy();
    expect(error).toBe("No authorization header provided");
  });

  test("with token and proper body/post response should be 201", async ({
    request,
  }) => {
    //arrange
    const payload = {
      username: `Gayatri_Konni`,
      email: `gayatri.konni@example.com`,
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
    //assert
    const availbleRoles = ["admin", "maintainer", "user"];

    const body = await response.json();
    expect(response.status()).toBe(201);
    const { success, data } = body;
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

    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    ); // UUID format
    expect(typeof id).toBe("string");
    newUserId = id;

    expect(username).toBeDefined();
    expect(typeof username).toBe("string");

    expect(email).toBeDefined();
    expect(typeof email).toBe("string");
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

    expect(firstName).toBeDefined();
    expect(typeof firstName).toBe("string");

    expect(lastName).toBeDefined();
    expect(typeof firstName).toBe("string");

    expect(role).toBeDefined();
    expect(typeof role).toBe("string"); // check for enum [ admin, maintainer, user ]
    expect(availbleRoles.includes(role)).toBeTruthy();

    expect(Array.isArray(groups)).toBe(true);

    expect(createdAt).toBeDefined();
    expect(typeof createdAt).toBe("string");
    expect(new Date(createdAt).toString()).not.toBe("Invalid Date");

    expect(updatedAt).toBeDefined();
    expect(typeof updatedAt).toBe("string");
    expect(new Date(updatedAt).toString()).not.toBe("Invalid Date");
  });

  test("should return 409 status code when same email is given", async ({
    request,
  }) => {
    //arrange
    const payload = {
      username: `Gayatri_Konni2`,
      email: `gayatri.konni@example.com`,
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
    //assert
    const body = await response.json();
    expect(response.status()).toBe(409);
    const { success, error } = body;
    expect(success).toBeFalsy();
    expect(error).toBe("Email already exists");
  });

  test("should return 400 with invalid password", async ({ request }) => {
    //arrange
    const timestamp = Date.now();
    const payload = {
      username: `Gayatri_konnii${Date.now()}`,
      email: `gayatri.konni${Date.now()}@example.com`,
      firstName: "gayatri",
      lastName: "konni",
      password: "securePassword123",
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
    //assert
    expect(response.status()).toBe(400);

    const body = await response.json();
    const { success, error } = body;

    expect(success).toBeFalsy();
    expect(error).toContain(
      "Password must contain at least one special character (!@#$%^&*)"
    );
  });

  test("should return 400-Bad request when mandatory fields missing in body", async ({
    request,
  }) => {
    //arrange
    const payload = {
      username: `Gayatri_konni`,
      firstName: "Gayatri",
      lastName: "Konni",
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
    //assert
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

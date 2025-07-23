import { test, expect } from "@playwright/test";
import { getAccessToken } from "../utils/getAccessToken";
import { validateUUID } from "../utils/validateUUID";
import { validateEmail } from "../utils/validateEmail";
let accessToken;
let newUserId;

test.beforeAll(async ({ request }) => {
  accessToken = await getAccessToken({ request });

  const payload = {
    username: "nikhilseepana",
    email: "nikhil.seepana@example.com",
    firstName: "nikhil",
    lastName: "seepana",
    password: "securePassword@123",
    role: "user",
  };

  const response = await request.post("http://localhost:3000/api/users", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: payload,
  });
  const body = await response.json();
  const { data } = body;
  const { id } = data;
  newUserId = id;
});

test.describe("putUsers", () => {
  test("should get response as 401 without token", async ({ request }) => {
    //arrange
    //act
    const response = await request.put(
      `http://localhost:3000/api/users/${newUserId}`,
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

  test("should get response as 200 when body is updated", async ({
    request,
  }) => {
    //arrange
    const payload = {
      username: "nikhilseepana",
      email: "nikhil.seepana@example.com",
      firstName: "Gayatri",
      lastName: "konni",
      password: "securePassword@123",
      role: "user",
    };
    //act
    const response = await request.put(
      `http://localhost:3000/api/users/${newUserId}`,
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

    const availbleRoles = ["admin", "maintainer", "user"];

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

    expect(typeof id).toBe("string");
    expect(validateUUID(id)).toBeTruthy();

    expect(username).toBe("nikhilseepana");

    expect(validateEmail(email)).toBeTruthy();

    expect(firstName).toBe("Gayatri");
    expect(lastName).toBe("konni");

    expect(role).toBeDefined();
    expect(typeof role).toBe("string"); // check for enum [ admin, maintainer, user ]
    expect(availbleRoles.includes(role)).toBeTruthy();

    expect(Array.isArray(groups)).toBeTruthy();
    
    expect(createdAt).toBeDefined();
    expect(new Date(createdAt).toString()).not.toBe("Invalid Date");

    expect(updatedAt).toBeDefined();
    expect(new Date(updatedAt).toString()).not.toBe("Invalid Date");

  });

  test("should get 400 for invalid or missing fields", async ({ request }) => {
    //arrange
    const payload = {
      username: "",
      email: "anusha.gmail.com",
      password: "123",
    };
    //act
    const response = await request.put(
      `http://localhost:3000/api/users/${newUserId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        data: payload,
      }
    );
    //assert
    const body =await response.json()
    expect(response.status()).toBe(400);

    const{success, error}=body;

    expect(success).toBeFalsy();
    expect(error).toBe("Username must be 3-50 characters long and contain only letters, numbers, and underscores");
    
  });

  test("should return 404 when userId is invalid", async ({ request }) => {
    //arrange
    const fakeId = "00000000-0000-0000-0000-000000000000";
    //act
    const response = await request.put(
      `http://localhost:3000/api/users/${fakeId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const body = await response.json();
    expect(response.status()).toBe(404);

    const { success, error } = body;
    expect(success).toBeFalsy();
    expect(error).toBe("User not found");
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

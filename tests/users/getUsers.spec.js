import { test, expect } from "@playwright/test";
import { validateEmail } from "../utils/validateEmail";
import { getAccessToken } from "../utils/getAccessToken";

let accessToken;

test.beforeAll(async ({ request }) => {
  accessToken = await getAccessToken({ request });
});

test.describe("Get Users", () => {
  test("should test without token and response tobe 401", async ({
    request,
  }) => {
    // arrange

    //act
    const response = await request.get("http://localhost:3000/api/users");
    //assert
    expect(response.status()).toBe(401);
    const body = await response.json();
    const { error, success } = body;
    expect(success).toBeFalsy();
    expect(error).toBe("No authorization header provided");
    console.log(body);
  });

  test("Get users with valid token , response 200 and validate the user fields", async ({
    request,
  }) => {
    //arrange
    //act
    const response = await request.get("http://localhost:3000/api/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    //assert
    const body = await response.json();
    console.log(body);
    expect(response.status()).toBe(200);

    const availbleRoles = ["admin", "maintainer", "user"];

    const { success, data } = body;
    expect(success).toBeTruthy();
    expect(Array.isArray(data)).toBeTruthy();
    for (const user of data) {
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
      } = user;
      expect(id).toBeDefined();
      expect(typeof id).toBe("string");
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      ); // check for UUID

      expect(username).toBeDefined();
      expect(typeof username).toBe("string");

      expect(email).toBeDefined();
      expect(typeof email).toBe("string");
      expect(validateEmail(email)).toBeTruthy();

      expect(firstName).toBeDefined();
      expect(typeof firstName).toBe("string");

      expect(lastName).toBeDefined();
      expect(typeof lastName).toBe("string");

      expect(role).toBeDefined();
      expect(typeof role).toBe("string"); // check for enum [ admin, maintainer, user ]
      expect(availbleRoles.includes(role)).toBeTruthy();

      expect(Array.isArray(groups)).toBeTruthy();
      for (const group of groups) {
        expect(group).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        ); // check for UUID
      }

      expect(createdAt).toBeDefined();
      expect(typeof createdAt).toBe("string");
      expect(new Date(createdAt).toString()).not.toBe("Invalid Date");

      expect(updatedAt).toBeDefined();
      expect(typeof updatedAt).toBe("string");
      expect(new Date(updatedAt).toString()).not.toBe("Invalid Date");
    }
  });
});

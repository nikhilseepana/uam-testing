import { test, expect } from "@playwright/test";

test("should test without token response to be 401 ", async ({ request }) => {
  // arrange
  // act
  const response = await request.get("http://localhost:3000/api/users");

  // assert
  expect(response.status()).toBe(401);

  const body = await response.json();
  const { message, success } = body;
  expect(success).toBeFalsy();
  expect(message).toBe("No authorization header provided");
});

//with token assertion
test.only("GET users with valid token,response 200 and validate the user fields", async ({
  request,
}) => {
  // arrange
  const Token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlNDk3Y2M1Yi0yM2M5LTRhYjQtODYzZC1kZDkzMmNhMmUwZmIiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzUyMDU0Mzk3LCJleHAiOjE3NTIxNDA3OTd9.FB0rzdZ1kMblAStYfB5LGWXH2txcBYm8OdDqeZYIzdc";

  // act
  const response = await request.get("http://localhost:3000/api/users", {
    headers: { Authorization: `Bearer ${Token}` },
  });

  // assert
  expect(response.status()).toBe(200);

  const body = await response.json();
  const { data, success } = body;
  expect(Array.isArray(data)).toBeTruthy();
expect(success).toBeTruthy();

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
    expect(typeof id).toBe("string"); // check for UUID

    expect(username).toBeDefined();
    expect(typeof username).toBe("string");

    expect(email).toBeDefined();
    expect(typeof email).toBe("string");
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

    expect(firstName).toBeDefined();
    expect(typeof firstName).toBe("string");

    expect(lastName).toBeDefined();
    expect(typeof lastName).toBe("string");

    expect(role).toBeDefined();
    expect(typeof role).toBe("string"); // check for enum [ admin, maintainer, user ]

    expect(Array.isArray(groups)).toBeTruthy();
    expect(groups).toEqual(expect.arrayContaining([expect.any(String)]));

    expect(createdAt).toBeDefined();
    expect(typeof createdAt).toBe("string");
    expect(new Date(createdAt).toString()).not.toBe("Invalid Date");

    expect(updatedAt).toBeDefined();
    expect(typeof updatedAt).toBe("string");
    expect(new Date(updatedAt).toString()).not.toBe("Invalid Date");
  }
});

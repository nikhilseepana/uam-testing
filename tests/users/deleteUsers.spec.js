import { test, expect } from "@playwright/test";
import { getAccessToken } from "../utils/getAccessToken";

let accessToken;
let newUserId;

test.beforeAll(async ({ request }) => {
  accessToken = await getAccessToken({ request });

  const payload = {
    username: "Anusha_Konni",
    email: "anusha.konni@example.com",
    firstName: "anusha",
    lastName: "konni",
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
  const{data}=body;
  const{id} = data;
  newUserId = id;
});

test.describe("Delete Users", () => {
  test("should test without token and response tobe 401", async ({ request }) => {
    const response = await request.delete(
      `http://localhost:3000/api/users/${newUserId}`
    );
    expect(response.status()).toBe(401);
  });

  test("Should get response as 200 when userId is deleted succesfully", async ({ request }) => {
    const response = await request.delete(
      `http://localhost:3000/api/users/${newUserId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    const{success, message}= body;
    expect(success).toBeTruthy();
    expect(message).toBe("User deleted successfully");
  });
});

test.afterAll(async ({ request }) => {
  await request.delete(`http://localhost:3000/api/users/${newUserId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
});

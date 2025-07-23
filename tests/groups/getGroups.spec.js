import { test, expect } from "@playwright/test";
import { getAccessToken } from "../utils/getAccessToken";

let accessToken;

test.beforeAll(async ({ request }) => {
  accessToken = await getAccessToken({ request });
});

test.describe("Get Groups", () => {
  test("should test without token and response tobe 401", async ({
    request,
  }) => {
    // arrange

    //act
    const response = await request.get("http://localhost:3000/api/groups");
    //assert
    expect(response.status()).toBe(401);
    const body = await response.json();
    const { error, success } = body;
    expect(success).toBeFalsy();
    expect(error).toBe("No authorization header provided");
    console.log(body);
  });
});

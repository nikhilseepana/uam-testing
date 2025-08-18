export const getAccessToken = async ({ request }) => {
  const response = await request.post("http://localhost:3000/api/auth/login", {
    data: { username: "admin@example.com", password: "pa$$w0rd" },
  });
  const body = await response.json();
  const { data } = body;
  const { token } = data;
  return token;
};



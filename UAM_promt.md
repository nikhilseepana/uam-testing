Create a complete Express.js + TypeScript API project for a User Access Management (UAM) system.

📌 Requirements:

🔐 Authentication:
- Implement `POST /auth/login` endpoint.
- Use hardcoded credentials: username `admin`, password `pa$$w0rd`.
- On successful login, return a JWT access token (1-day expiry).
- Add JWT middleware to protect private routes.

👤 Users:
- Each user has: `id`, `username`, `password`, `role` (admin | maintainer | user), and `groups` (array of group IDs).

👥 Groups:
- Groups have: `id`, `name`, and assigned `policies` (array of policy IDs).

📜 Policies:
- Policies define access control via `{ resource: string; action: string }[]` structure.
- Example: `{ resource: "users", action: "edit" }`.

📩 Access Requests:
- Users can request access to groups via `POST /access-requests`.
- Model: `id`, `userId`, `groupId`, `status` (pending/approved/denied), and `reason`.

🔐 Permission Middleware:
- Implement a helper to check if the current user (via group → policy chain) has permission to perform a specific `{ resource, action }`.

🧪 CRUD Routes:
- Provide full CRUD endpoints for: Users, Groups, Policies, and Access Requests.
- Protect these routes with proper role/permission middleware.

💾 Data Persistence:
- Use **local file-backed storage** (e.g., `lowdb`, `node-persist`, `express-session-sqlite`, or a simple JSON-based local storage system).
- Ensure all changes (e.g., user creation, policy update) are persisted between server restarts.

📚 API Documentation:
- Generate Swagger/OpenAPI docs using `swagger-ui-express` and `swagger-jsdoc`.

📦 Tech Stack:
- Express.js
- TypeScript
- `jsonwebtoken` for JWT
- File-based local persistence (no external database)
- `swagger-ui-express` + `swagger-jsdoc` for docs
- Clean structure: `routes`, `controllers`, `services`, `middleware`, `types`

🎯 Goal:
Build a realistic, modular UAM backend with real-world patterns to help test API flows in Postman or integration test suites, using JWT, access control, and local persistence.
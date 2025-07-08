# User Access Management (UAM) API

A comprehensive User Access Management system built with Express.js, TypeScript, and JWT authentication. This API provides role-based access control, group management, policy-based permissions, and access request workflows.

## 🚀 Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin, Maintainer, and User roles
- **Group Management**: Organize users into groups
- **Policy-Based Permissions**: Fine-grained access control
- **Access Request Workflow**: Users can request access to groups
- **File-Based Persistence**: Local storage using LowDB
- **API Documentation**: Swagger/OpenAPI documentation
- **Security**: Helmet, CORS, rate limiting

## 📦 Tech Stack

- **Express.js**: Web framework
- **TypeScript**: Type-safe JavaScript
- **JWT**: JSON Web Tokens for authentication
- **LowDB**: File-based JSON database
- **Swagger**: API documentation
- **Bcrypt**: Password hashing
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd uam-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 🔧 Configuration

The application uses environment variables for configuration:

- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: Secret key for JWT tokens

## 📚 API Documentation

Once the server is running, you can access the API documentation at:
- **Swagger UI**: `http://localhost:3000/api/docs`

## 🔐 Default Credentials

The system initializes with a default admin user:
- **Username**: `admin`
- **Password**: `pa$$w0rd`

## 🛡️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Groups
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group by ID
- `POST /api/groups` - Create new group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Policies
- `GET /api/policies` - Get all policies
- `GET /api/policies/:id` - Get policy by ID
- `POST /api/policies` - Create new policy
- `PUT /api/policies/:id` - Update policy
- `DELETE /api/policies/:id` - Delete policy

### Access Requests
- `GET /api/access-requests` - Get access requests
- `GET /api/access-requests/:id` - Get access request by ID
- `POST /api/access-requests` - Create access request
- `PUT /api/access-requests/:id/process` - Process access request
- `DELETE /api/access-requests/:id` - Delete access request

## 🔑 Authentication

All API endpoints (except login) require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🏗️ Project Structure

```
src/
├── controllers/         # Route handlers
├── middleware/         # Custom middleware
├── routes/            # Route definitions
├── services/          # Business logic
├── types/            # TypeScript types
├── config/           # Configuration files
└── index.ts          # Application entry point
```

## 📝 Data Models

### User
- `id`: Unique identifier
- `username`: User's username
- `password`: Hashed password
- `role`: User role (admin, maintainer, user)
- `groups`: Array of group IDs

### Group
- `id`: Unique identifier
- `name`: Group name
- `policies`: Array of policy IDs

### Policy
- `id`: Unique identifier
- `name`: Policy name
- `permissions`: Array of permission objects

### Permission
- `resource`: Resource name (e.g., "users", "groups")
- `action`: Action name (e.g., "read", "write", "delete")

### Access Request
- `id`: Unique identifier
- `userId`: Requesting user ID
- `groupId`: Target group ID
- `status`: Request status (pending, approved, denied)
- `reason`: Request reason

## 🧪 Testing

You can test the API using:
- **Postman**: Import the API collection
- **curl**: Command-line testing
- **Swagger UI**: Interactive documentation

### Example Login Request

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "pa$$w0rd"
  }'
```

## 📊 Monitoring

- **Health Check**: `GET /health`
- **API Status**: Monitor API availability and response times

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt for password security
- **Rate Limiting**: Prevent abuse
- **CORS**: Cross-origin security
- **Helmet**: Security headers
- **Input Validation**: Request validation

## 🚀 Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

3. **Environment Variables:**
   - Set `NODE_ENV=production`
   - Configure `JWT_SECRET`
   - Set appropriate `PORT`

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for secure user access management**

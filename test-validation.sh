#!/bin/bash

# UAM API Validation Test Script
# This script specifically tests mandatory parameter validation for User endpoints

BASE_URL="http://localhost:3000/api"
echo "🧪 Testing UAM API Validation at $BASE_URL"
echo "========================================="

# Get authentication token
echo "1. Getting authentication token..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@example.com",
    "password": "pa$$w0rd"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "Token acquired: ${TOKEN:0:20}..."
echo ""

# Test 1: Missing all required fields
echo "2. Testing missing all required fields..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
echo ""

# Test 2: Missing username
echo "3. Testing missing username..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "password": "TestPass123!",
    "role": "user"
  }' | jq .
echo ""

# Test 3: Missing email
echo "4. Testing missing email..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User",
    "password": "TestPass123!",
    "role": "user"
  }' | jq .
echo ""

# Test 4: Missing firstName
echo "5. Testing missing firstName..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "lastName": "User",
    "password": "TestPass123!",
    "role": "user"
  }' | jq .
echo ""

# Test 5: Missing lastName
echo "6. Testing missing lastName..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "firstName": "Test",
    "password": "TestPass123!",
    "role": "user"
  }' | jq .
echo ""

# Test 6: Missing password
echo "7. Testing missing password..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "user"
  }' | jq .
echo ""

# Test 7: Missing role
echo "8. Testing missing role..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "password": "TestPass123!"
  }' | jq .
echo ""

# Test 8: Invalid email format
echo "9. Testing invalid email format..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "invalid-email",
    "firstName": "Test",
    "lastName": "User",
    "password": "TestPass123!",
    "role": "user"
  }' | jq .
echo ""

# Test 9: Invalid username (too short)
echo "10. Testing invalid username (too short)..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "x",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "password": "TestPass123!",
    "role": "user"
  }' | jq .
echo ""

# Test 10: Invalid firstName (too short)
echo "11. Testing invalid firstName (too short)..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "firstName": "T",
    "lastName": "User",
    "password": "TestPass123!",
    "role": "user"
  }' | jq .
echo ""

# Test 11: Invalid lastName (too short)
echo "12. Testing invalid lastName (too short)..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "U",
    "password": "TestPass123!",
    "role": "user"
  }' | jq .
echo ""

# Test 12: Invalid password (too short)
echo "13. Testing invalid password (too short)..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "password": "123",
    "role": "user"
  }' | jq .
echo ""

# Test 13: Invalid role
echo "14. Testing invalid role..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "password": "TestPass123!",
    "role": "invalid_role"
  }' | jq .
echo ""

# Test 14: Valid user creation (should succeed)
echo "15. Testing valid user creation..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "valid_test_user",
    "email": "validtest@example.com",
    "firstName": "Valid",
    "lastName": "TestUser",
    "password": "ValidPass123!",
    "role": "user"
  }' | jq .
echo ""

echo "✅ Validation testing completed!"
echo "📚 Check the Swagger documentation at: http://localhost:3000/api/docs"
echo "🔍 All mandatory parameter validations have been tested"

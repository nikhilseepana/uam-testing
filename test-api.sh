#!/bin/bash

# UAM API Test Script
# This script tests the main endpoints of the User Access Management API

BASE_URL="http://localhost:3000/api"
echo "🧪 Testing UAM API at $BASE_URL"
echo "================================="

# Test 1: Health Check
echo "1. Testing health endpoint..."
curl -s -X GET http://localhost:3000/health | jq .
echo ""

# Test 2: Login with email
echo "2. Testing login with email..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@example.com",
    "password": "pa$$w0rd"
  }')

echo $LOGIN_RESPONSE | jq .

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"
echo ""

# Test 2.1: Login with username
echo "2.1. Testing login with username..."
LOGIN_RESPONSE_USERNAME=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "pa$$w0rd"
  }')

echo $LOGIN_RESPONSE_USERNAME | jq .
echo ""

# Test 3: Get current user
echo "3. Testing /auth/me..."
curl -s -X GET $BASE_URL/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 4: Get all users
echo "4. Testing get all users..."
curl -s -X GET $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 5: Get all groups
echo "5. Testing get all groups..."
curl -s -X GET $BASE_URL/groups \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 6: Get all policies
echo "6. Testing get all policies..."
curl -s -X GET $BASE_URL/policies \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 7: Create a new user
echo "7. Testing create user..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "password": "TestPass123!",
    "role": "user"
  }' | jq .
echo ""

# Test 7.1: Get group IDs for user assignment test
echo "7.1. Getting group IDs for user assignment test..."
GROUPS_RESPONSE=$(curl -s -X GET $BASE_URL/groups \
  -H "Authorization: Bearer $TOKEN")
echo $GROUPS_RESPONSE | jq .

# Extract the first group ID
GROUP_ID=$(echo $GROUPS_RESPONSE | jq -r '.data[0].id')
echo "First Group ID: $GROUP_ID"
echo ""

# Test 7.2: Create a new user with group assignment
echo "7.2. Testing create user with group assignment..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"test_user_with_group\",
    \"email\": \"testgroup@example.com\",
    \"firstName\": \"Test\",
    \"lastName\": \"GroupUser\",
    \"password\": \"TestPass123!\",
    \"role\": \"user\",
    \"groups\": [\"$GROUP_ID\"]
  }" | jq .
echo ""

# Test 7.3: Test invalid group ID validation
echo "7.3. Testing create user with invalid group ID..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user_invalid_group",
    "email": "testinvalid@example.com",
    "firstName": "Test",
    "lastName": "InvalidGroup",
    "password": "TestPass123!",
    "role": "user",
    "groups": ["invalid-group-id"]
  }' | jq .
echo ""

# Test 8: Create a new group
echo "8. Testing create group..."
curl -s -X POST $BASE_URL/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Group",
    "policies": []
  }' | jq .
echo ""

# Test 8.1: Get policy IDs for group assignment test
echo "8.1. Getting policy IDs for group assignment test..."
POLICIES_RESPONSE=$(curl -s -X GET $BASE_URL/policies \
  -H "Authorization: Bearer $TOKEN")
echo $POLICIES_RESPONSE | jq .

# Extract the first policy ID
POLICY_ID=$(echo $POLICIES_RESPONSE | jq -r '.data[0].id')
echo "First Policy ID: $POLICY_ID"
echo ""

# Test 8.2: Create a new group with policy assignment
echo "8.2. Testing create group with policy assignment..."
curl -s -X POST $BASE_URL/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Group with Policy\",
    \"policies\": [\"$POLICY_ID\"]
  }" | jq .
echo ""

# Test 8.3: Test invalid policy ID validation
echo "8.3. Testing create group with invalid policy ID..."
curl -s -X POST $BASE_URL/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Group Invalid Policy",
    "policies": ["invalid-policy-id"]
  }' | jq .
echo ""

# Test 9: Create a new policy
echo "9. Testing create policy..."
curl -s -X POST $BASE_URL/policies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Policy",
    "permissions": [
      {"resource": "users", "action": "read"},
      {"resource": "groups", "action": "read"}
    ]
  }' | jq .
echo ""

# Test 10: Update a user
echo "10. Testing update user..."
USER_ID=$(curl -s -X GET $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id')
echo "Updating user ID: $USER_ID"

curl -s -X PUT $BASE_URL/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated System",
    "lastName": "Updated Administrator"
  }' | jq .
echo ""

# Test 11: Create access request
echo "11. Testing create access request..."
# Get the first regular user group (Users group)
USERS_GROUP_ID=$(curl -s -X GET $BASE_URL/groups \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[1].id')
echo "Users Group ID: $USERS_GROUP_ID"

curl -s -X POST $BASE_URL/access-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"groupId\": \"$USERS_GROUP_ID\",
    \"reason\": \"Need access to user management features\"
  }" | jq .
echo ""

# Test 12: Get all access requests
echo "12. Testing get all access requests..."
curl -s -X GET $BASE_URL/access-requests \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 13: Delete a user (test deletion)
echo "13. Testing delete user..."
# Get all users and delete the test user if exists
ALL_USERS=$(curl -s -X GET $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN")
echo "All users before deletion:"
echo $ALL_USERS | jq .

# Find test user to delete
TEST_USER_ID=$(echo $ALL_USERS | jq -r '.data[] | select(.username == "test_user_validation") | .id')
if [ "$TEST_USER_ID" != "null" ] && [ "$TEST_USER_ID" != "" ]; then
  echo "Deleting test user ID: $TEST_USER_ID"
  curl -s -X DELETE $BASE_URL/users/$TEST_USER_ID \
    -H "Authorization: Bearer $TOKEN" | jq .
else
  echo "No test user found to delete"
fi
echo ""

echo "✅ API testing completed!"
echo "📚 View full documentation at: http://localhost:3000/api/docs"

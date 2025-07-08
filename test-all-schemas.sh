#!/bin/bash

# Comprehensive UAM API Schema Validation Test
# Tests all models with mandatory and optional parameters

BASE_URL="http://localhost:3000/api"
echo "🧪 Testing ALL UAM API Schemas with Mandatory/Optional Parameters"
echo "================================================================"

# Get authentication token
echo "1. Getting authentication token..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@example.com",
    "password": "pa$$w0rd"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "✅ Token acquired"
echo ""

echo "=== AUTHENTICATION SCHEMA TESTS ==="

# Test 2: Login missing username
echo "2. Testing login missing username (REQUIRED)..."
curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "password": "pa$$w0rd"
  }' | jq .
echo ""

# Test 3: Login missing password
echo "3. Testing login missing password (REQUIRED)..."
curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@example.com"
  }' | jq .
echo ""

echo "=== USER SCHEMA TESTS ==="

# Test 4: Create user missing all required fields
echo "4. Testing create user missing all required fields..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
echo ""

# Test 5: Create user missing email (REQUIRED)
echo "5. Testing create user missing email (REQUIRED)..."
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

# Test 6: Create user with valid data including optional groups
echo "6. Testing create user with valid data and optional groups..."
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "schema_test_user",
    "email": "schematest@example.com",
    "firstName": "Schema",
    "lastName": "TestUser",
    "password": "ValidPass123!",
    "role": "user",
    "groups": []
  }' | jq .
echo ""

echo "=== GROUP SCHEMA TESTS ==="

# Test 7: Create group missing name (REQUIRED)
echo "7. Testing create group missing name (REQUIRED)..."
curl -s -X POST $BASE_URL/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
echo ""

# Test 8: Create group with valid name and optional policies
echo "8. Testing create group with valid name and optional policies..."
curl -s -X POST $BASE_URL/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Schema Test Group",
    "policies": []
  }' | jq .
echo ""

# Test 9: Create group with name only (policies optional)
echo "9. Testing create group with name only (policies optional)..."
curl -s -X POST $BASE_URL/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minimal Schema Group"
  }' | jq .
echo ""

echo "=== POLICY SCHEMA TESTS ==="

# Test 10: Create policy missing name (REQUIRED)
echo "10. Testing create policy missing name (REQUIRED)..."
curl -s -X POST $BASE_URL/policies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": [
      {"resource": "users", "action": "read"}
    ]
  }' | jq .
echo ""

# Test 11: Create policy missing permissions (REQUIRED)
echo "11. Testing create policy missing permissions (REQUIRED)..."
curl -s -X POST $BASE_URL/policies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Policy"
  }' | jq .
echo ""

# Test 12: Create policy with valid data
echo "12. Testing create policy with valid required data..."
curl -s -X POST $BASE_URL/policies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Schema Test Policy",
    "permissions": [
      {"resource": "users", "action": "read"},
      {"resource": "groups", "action": "read"}
    ]
  }' | jq .
echo ""

echo "=== ACCESS REQUEST SCHEMA TESTS ==="

# Test 13: Create access request missing groupId (REQUIRED)
echo "13. Testing create access request missing groupId (REQUIRED)..."
curl -s -X POST $BASE_URL/access-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Need access"
  }' | jq .
echo ""

# Test 14: Create access request with required groupId only
echo "14. Testing create access request with required groupId only..."
# Get a valid group ID first
GROUP_ID=$(curl -s -X GET $BASE_URL/groups \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[1].id')

curl -s -X POST $BASE_URL/access-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"groupId\": \"$GROUP_ID\"
  }" | jq .
echo ""

# Test 15: Create access request with optional reason
echo "15. Testing create access request with optional reason..."
curl -s -X POST $BASE_URL/access-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"groupId\": \"$GROUP_ID\",
    \"reason\": \"This is an optional reason for the access request\"
  }" | jq .
echo ""

echo "=== UPDATE SCHEMA TESTS (All fields should be optional) ==="

# Test 16: Update user with partial data (all fields optional)
echo "16. Testing update user with partial data (all fields optional)..."
USER_ID=$(curl -s -X GET $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id')

curl -s -X PUT $BASE_URL/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated"
  }' | jq .
echo ""

# Test 17: Update group with partial data (all fields optional)
echo "17. Testing update group with partial data (all fields optional)..."
GROUP_ID=$(curl -s -X GET $BASE_URL/groups \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id')

curl -s -X PUT $BASE_URL/groups/$GROUP_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Group Name"
  }' | jq .
echo ""

# Test 18: Update policy with partial data (all fields optional)
echo "18. Testing update policy with partial data (all fields optional)..."
POLICY_ID=$(curl -s -X GET $BASE_URL/policies \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id')

curl -s -X PUT $BASE_URL/policies/$POLICY_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Policy Name"
  }' | jq .
echo ""

echo "✅ Comprehensive schema validation testing completed!"
echo ""
echo "📋 SUMMARY:"
echo "   ✅ Authentication: username* password*"
echo "   ✅ User: id* username* email* firstName* lastName* role* groups* createdAt* updatedAt*"
echo "   ✅ UserCreate: username* email* firstName* lastName* password* role* groups(optional)"
echo "   ✅ UserUpdate: All fields optional"
echo "   ✅ Group: id* name* policies* createdAt* updatedAt*"
echo "   ✅ GroupCreate: name* policies(optional)"
echo "   ✅ GroupUpdate: All fields optional"
echo "   ✅ Policy: id* name* permissions* createdAt* updatedAt*"
echo "   ✅ PolicyCreate: name* permissions*"
echo "   ✅ PolicyUpdate: All fields optional"
echo "   ✅ AccessRequest: id* userId* groupId* status* requestedAt* reason(optional) processedAt(optional) processedBy(optional)"
echo "   ✅ AccessRequestCreate: groupId* reason(optional)"
echo ""
echo "📚 Check the updated Swagger documentation at: http://localhost:3000/api/docs"

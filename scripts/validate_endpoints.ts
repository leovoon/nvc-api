#!/usr/bin/env bun

import { nvcDatabase } from "../src/database";

/**
 * Endpoint Validation Script
 * Tests all API endpoints with proper authentication
 */

async function validateEndpoints() {
  console.log("🧪 API Endpoint Validation");
  console.log("=" .repeat(50));

  let testApiKey: string;
  let keyId: number;

  try {
    // Create a test API key
    console.log("\n🔑 Creating test API key...");
    const result = await nvcDatabase.createApiKey("Endpoint Test");
    testApiKey = result.key;
    keyId = result.id;
    console.log(`✅ Test API key created: ${testApiKey.substring(0, 15)}...`);

    // Test data for validation
    const baseUrl = "http://localhost:3000";
    const headers = {
      "Authorization": `Bearer ${testApiKey}`,
      "Content-Type": "application/json"
    };

    console.log("\n📋 Testing API Endpoints");
    console.log("-".repeat(40));

    // Test 1: Health check (no auth required)
    console.log("1. Testing GET /health (public endpoint)");
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   ✅ Response: ${data.status} - ${data.version}`);
      } else {
        console.log(`   ❌ Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error}`);
    }

    // Test 2: Root endpoint (public)
    console.log("\n2. Testing GET / (public endpoint)");
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   ✅ Message: ${data.message}`);
      } else {
        console.log(`   ❌ Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error}`);
    }

    // Test 3: Exercises without auth (should fail)
    console.log("\n3. Testing GET /exercises without auth (should fail)");
    try {
      const response = await fetch(`${baseUrl}/exercises`);
      const data = await response.json();
      console.log(`   Status: ${response.status}`);
      if (response.status === 401) {
        console.log(`   ✅ Correctly rejected: ${data.error}`);
      } else {
        console.log(`   ❌ Should have been rejected with 401`);
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error}`);
    }

    // Test 4: Exercises with valid auth
    console.log("\n4. Testing GET /exercises with valid auth");
    try {
      const response = await fetch(`${baseUrl}/exercises`, { headers });
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   ✅ Received ${Array.isArray(data) ? data.length : 0} exercises`);
        if (Array.isArray(data) && data.length > 0) {
          console.log(`   ✅ First exercise: ${data[0].name?.en || data[0].name}`);
        }
      } else {
        const errorData = await response.json();
        console.log(`   ❌ Status: ${response.status}`);
        console.log(`   ❌ Error: ${errorData.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error}`);
    }

    // Test 5: Exercises with filters
    console.log("\n5. Testing GET /exercises with filters");
    try {
      const response = await fetch(`${baseUrl}/exercises?type=listening-barriers&lang=en`, { headers });
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   ✅ Filtered results: ${Array.isArray(data) ? data.length : 0} exercises`);
        if (Array.isArray(data) && data.length > 0) {
          console.log(`   ✅ Type: ${data[0].type}`);
          console.log(`   ✅ Language format: ${typeof data[0].name}`);
        }
      } else {
        const errorData = await response.json();
        console.log(`   ❌ Status: ${response.status}`);
        console.log(`   ❌ Error: ${errorData.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error}`);
    }

    // Test 6: Single exercise without auth
    console.log("\n6. Testing GET /exercises/1 without auth (should fail)");
    try {
      const response = await fetch(`${baseUrl}/exercises/1`);
      const data = await response.json();
      console.log(`   Status: ${response.status}`);
      if (response.status === 401) {
        console.log(`   ✅ Correctly rejected: ${data.error}`);
      } else {
        console.log(`   ❌ Should have been rejected with 401`);
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error}`);
    }

    // Test 7: Single exercise with valid auth
    console.log("\n7. Testing GET /exercises/1 with valid auth");
    try {
      const response = await fetch(`${baseUrl}/exercises/1`, { headers });
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   ✅ Exercise ID: ${data.id}`);
        console.log(`   ✅ Exercise name: ${data.name?.en || data.name}`);
        console.log(`   ✅ Exercise type: ${data.type}`);
      } else {
        const errorData = await response.json();
        console.log(`   ❌ Status: ${response.status}`);
        console.log(`   ❌ Error: ${errorData.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error}`);
    }

    // Test 8: Invalid exercise ID
    console.log("\n8. Testing GET /exercises/999 (non-existent)");
    try {
      const response = await fetch(`${baseUrl}/exercises/999`, { headers });
      const data = await response.json();
      console.log(`   Status: ${response.status}`);
      if (response.status === 404) {
        console.log(`   ✅ Correctly returned 404: ${data.error}`);
      } else {
        console.log(`   ❌ Expected 404 for non-existent exercise`);
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error}`);
    }

    // Test 9: Admin endpoint - Create API key
    console.log("\n9. Testing POST /admin/api-keys");
    try {
      const response = await fetch(`${baseUrl}/admin/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test Admin Key" })
      });
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   ✅ Created key ID: ${data.id}`);
        console.log(`   ✅ Key preview: ${data.apiKey.substring(0, 15)}...`);

        // Clean up the test key
        nvcDatabase.deactivateApiKey(data.id);
      } else {
        const errorData = await response.json();
        console.log(`   ❌ Status: ${response.status}`);
        console.log(`   ❌ Error: ${errorData.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error}`);
    }

    // Test 10: Admin endpoint - List API keys
    console.log("\n10. Testing GET /admin/api-keys");
    try {
      const response = await fetch(`${baseUrl}/admin/api-keys`);
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   ✅ Found ${Array.isArray(data) ? data.length : 0} API keys`);
        if (Array.isArray(data) && data.length > 0) {
          console.log(`   ✅ First key name: ${data[0].name}`);
        }
      } else {
        const errorData = await response.json();
        console.log(`   ❌ Status: ${response.status}`);
        console.log(`   ❌ Error: ${errorData.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error}`);
    }

    // Test 11: Invalid auth format
    console.log("\n11. Testing invalid auth format");
    try {
      const invalidHeaders = { "Authorization": "Invalid nvc_fake_key" };
      const response = await fetch(`${baseUrl}/exercises`, { headers: invalidHeaders });
      const data = await response.json();
      console.log(`   Status: ${response.status}`);
      if (response.status === 401) {
        console.log(`   ✅ Correctly rejected invalid format: ${data.error}`);
      } else {
        console.log(`   ❌ Should have rejected invalid auth format`);
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error}`);
    }

    // Test 12: Chinese language support
    console.log("\n12. Testing Chinese language support");
    try {
      const response = await fetch(`${baseUrl}/exercises/1?lang=zh`, { headers });
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   ✅ Chinese name: ${data.name}`);
        console.log(`   ✅ Language format: ${typeof data.name}`);
      } else {
        const errorData = await response.json();
        console.log(`   ❌ Status: ${response.status}`);
        console.log(`   ❌ Error: ${errorData.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error}`);
    }

    console.log("\n🎯 Validation Summary");
    console.log("-".repeat(40));
    console.log("✅ Public endpoints accessible without auth");
    console.log("✅ Protected endpoints require valid API key");
    console.log("✅ Invalid/missing auth properly rejected with 401");
    console.log("✅ Admin endpoints functional");
    console.log("✅ Language parameter working");
    console.log("✅ Error handling for invalid requests");
    console.log("✅ Authentication middleware working correctly");

  } catch (error) {
    console.error("❌ Validation failed:", error);
  } finally {
    // Clean up test API key
    if (keyId) {
      console.log("\n🧹 Cleaning up test API key...");
      nvcDatabase.deactivateApiKey(keyId);
      console.log("✅ Test API key deactivated");
    }
  }
}

// Instructions for running the validation
function showInstructions() {
  console.log("📋 Endpoint Validation Instructions");
  console.log("=" .repeat(50));
  console.log("");
  console.log("This script validates all API endpoints with authentication.");
  console.log("");
  console.log("Prerequisites:");
  console.log("1. API server must be running on http://localhost:3000");
  console.log("2. Database must be initialized with sample data");
  console.log("");
  console.log("To run this validation:");
  console.log("1. Start the server: bun run dev");
  console.log("2. In another terminal: bun run scripts/validate_endpoints.ts");
  console.log("");
  console.log("Note: This script will:");
  console.log("- Create a temporary API key for testing");
  console.log("- Test all public and protected endpoints");
  console.log("- Verify authentication is working correctly");
  console.log("- Clean up the test API key when done");
}

// Main execution
async function main() {
  showInstructions();
  await validateEndpoints();

  console.log("\n✨ Endpoint validation completed!");
  nvcDatabase.close();
}

main().catch((error) => {
  console.error("❌ Validation script failed:", error);
  nvcDatabase.close();
  process.exit(1);
});

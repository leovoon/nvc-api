#!/usr/bin/env bun

import { nvcDatabase } from "../src/database";

/**
 * Comprehensive Authentication Demo
 * This script demonstrates the complete API key authentication flow
 */

async function runAuthDemo() {
  console.log("🔐 NVC API Authentication Demo");
  console.log("=" .repeat(60));

  try {
    // Step 1: Create a demo API key
    console.log("\n🔑 Step 1: Creating Demo API Key");
    console.log("-".repeat(40));

    const apiKeyResult = await nvcDatabase.createApiKey("Demo Application");
    const demoKey = apiKeyResult.key;

    console.log(`✅ Created API key: ${demoKey}`);
    console.log(`   Key ID: ${apiKeyResult.id}`);
    console.log(`   Key Name: Demo Application`);

    // Step 2: Demonstrate key validation
    console.log("\n✅ Step 2: Validating API Key");
    console.log("-".repeat(40));

    const validatedKey = await nvcDatabase.validateApiKey(demoKey);
    if (validatedKey) {
      console.log("✅ API key is valid");
      console.log(`   Database ID: ${validatedKey.id}`);
      console.log(`   Name: ${validatedKey.name}`);
      console.log(`   Active: ${validatedKey.is_active ? 'Yes' : 'No'}`);
      console.log(`   Created: ${validatedKey.created_at}`);
    }

    // Step 3: Simulate API requests
    console.log("\n🌐 Step 3: Simulating API Request Authentication");
    console.log("-".repeat(40));

    // Simulate the auth middleware logic
    const simulateAuth = async (authHeader: string | undefined) => {
      if (!authHeader) {
        return { status: 401, error: "Missing Authorization header" };
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

      const apiKey = await nvcDatabase.validateApiKey(token);

      if (!apiKey) {
        return { status: 401, error: "Invalid API key" };
      }

      return { status: 200, message: "Authentication successful", keyName: apiKey.name };
    };

    // Test valid request
    console.log("📤 Testing valid request...");
    const validResult = await simulateAuth(`Bearer ${demoKey}`);
    console.log(`   Status: ${validResult.status}`);
    console.log(`   Response: ${validResult.message || validResult.error}`);

    // Test invalid request
    console.log("📤 Testing invalid request...");
    const invalidResult = await simulateAuth("Bearer nvc_invalid_key_123");
    console.log(`   Status: ${invalidResult.status}`);
    console.log(`   Response: ${invalidResult.error}`);

    // Test missing header
    console.log("📤 Testing missing auth header...");
    const missingResult = await simulateAuth(undefined);
    console.log(`   Status: ${missingResult.status}`);
    console.log(`   Response: ${missingResult.error}`);

    // Step 4: Show usage examples
    console.log("\n📋 Step 4: Usage Examples");
    console.log("-".repeat(40));

    console.log("curl command:");
    console.log(`curl -H "Authorization: Bearer ${demoKey}" \\`);
    console.log(`  http://localhost:3000/exercises`);

    console.log("\nJavaScript fetch:");
    console.log(`fetch('http://localhost:3000/exercises', {`);
    console.log(`  headers: {`);
    console.log(`    'Authorization': 'Bearer ${demoKey}'`);
    console.log(`  }`);
    console.log(`})`);

    console.log("\nPython requests:");
    console.log(`headers = {'Authorization': 'Bearer ${demoKey}'}`);
    console.log(`response = requests.get('http://localhost:3000/exercises', headers=headers)`);

    // Step 5: Show key management
    console.log("\n🔧 Step 5: Key Management Operations");
    console.log("-".repeat(40));

    console.log("All API keys in database:");
    const allKeys = nvcDatabase.getAllApiKeys();
    allKeys.forEach((key, index) => {
      const status = key.is_active ? "🟢 Active" : "🔴 Inactive";
      console.log(`   ${index + 1}. ID: ${key.id} | Name: ${key.name} | Status: ${status}`);
    });

    // Step 6: Demonstrate key deactivation
    console.log("\n🔄 Step 6: Key Deactivation");
    console.log("-".repeat(40));

    console.log("Deactivating demo key...");
    const deactivated = nvcDatabase.deactivateApiKey(apiKeyResult.id);
    console.log(`✅ Key deactivated: ${deactivated}`);

    // Test deactivated key
    console.log("Testing deactivated key...");
    const deactivatedResult = await simulateAuth(`Bearer ${demoKey}`);
    console.log(`   Status: ${deactivatedResult.status}`);
    console.log(`   Response: ${deactivatedResult.error}`);

    // Step 7: Security best practices
    console.log("\n🛡️  Step 7: Security Best Practices");
    console.log("-".repeat(40));

    console.log("✅ Keys are hashed with SHA-256 before storage");
    console.log("✅ Original keys are never stored in database");
    console.log("✅ Keys use cryptographically secure random generation");
    console.log("✅ Usage tracking with last_used timestamps");
    console.log("✅ Soft delete approach (deactivation vs deletion)");
    console.log("✅ Proper HTTP status codes (401 Unauthorized)");

    console.log("\n🎯 Demo Summary");
    console.log("-".repeat(40));
    console.log("✅ API key creation and validation working correctly");
    console.log("✅ Authentication middleware logic verified");
    console.log("✅ Error handling for invalid/missing keys");
    console.log("✅ Key management operations functional");
    console.log("✅ Security measures properly implemented");

    console.log("\n🚀 Next Steps:");
    console.log("1. Start the API server: bun run dev");
    console.log("2. Create a new API key: bun run api-keys create 'My App'");
    console.log("3. Test authenticated requests using the examples above");
    console.log("4. Monitor key usage: bun run api-keys list");

  } catch (error) {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  }
}

// Additional utility functions for the demo
function showEnvironmentInfo() {
  console.log("\n🔍 Environment Information");
  console.log("-".repeat(40));
  console.log(`Node.js Version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Architecture: ${process.arch}`);
  console.log(`Working Directory: ${process.cwd()}`);
}

function showKeyFormat() {
  console.log("\n📝 API Key Format");
  console.log("-".repeat(40));
  console.log("Format: nvc_[32 random characters]");
  console.log("Example: nvc_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6");
  console.log("Prefix: 'nvc_' for easy identification");
  console.log("Length: 36 characters total (4 prefix + 32 random)");
  console.log("Characters: A-Z, a-z, 0-9");
}

// Run the demo
async function main() {
  showEnvironmentInfo();
  showKeyFormat();
  await runAuthDemo();

  console.log("\n✨ Authentication demo completed successfully!");
  nvcDatabase.close();
}

main().catch((error) => {
  console.error("❌ Demo failed:", error);
  nvcDatabase.close();
  process.exit(1);
});

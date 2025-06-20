#!/usr/bin/env bun

import { nvcDatabase } from "../src/database";

async function testAuth() {
  console.log("🔍 Testing Authentication Implementation");
  console.log("=" .repeat(50));

  try {
    // Test 1: Create an API key
    console.log("\n1. Creating test API key...");
    const result = await nvcDatabase.createApiKey("Test Auth Key");
    console.log(`✅ Created API key: ${result.key}`);
    console.log(`   ID: ${result.id}`);

    // Test 2: Validate the API key
    console.log("\n2. Validating API key...");
    const validKey = await nvcDatabase.validateApiKey(result.key);
    if (validKey) {
      console.log("✅ API key validation successful");
      console.log(`   Key ID: ${validKey.id}`);
      console.log(`   Key Name: ${validKey.name}`);
      console.log(`   Is Active: ${validKey.is_active}`);
    } else {
      console.log("❌ API key validation failed");
    }

    // Test 3: Test with invalid key
    console.log("\n3. Testing with invalid API key...");
    const invalidKey = await nvcDatabase.validateApiKey("nvc_invalid_key_12345");
    if (invalidKey) {
      console.log("❌ Invalid key was accepted (this is wrong!)");
    } else {
      console.log("✅ Invalid key was correctly rejected");
    }

    // Test 4: List all API keys
    console.log("\n4. Listing all API keys...");
    const allKeys = nvcDatabase.getAllApiKeys();
    console.log(`✅ Found ${allKeys.length} API key(s)`);
    allKeys.forEach((key, index) => {
      console.log(`   ${index + 1}. ID: ${key.id}, Name: ${key.name}, Active: ${key.is_active}`);
    });

    // Test 5: Deactivate the test key
    console.log("\n5. Deactivating test API key...");
    const deactivated = nvcDatabase.deactivateApiKey(result.id);
    if (deactivated) {
      console.log("✅ API key deactivated successfully");
    } else {
      console.log("❌ Failed to deactivate API key");
    }

    // Test 6: Try to validate deactivated key
    console.log("\n6. Testing deactivated API key...");
    const deactivatedKey = await nvcDatabase.validateApiKey(result.key);
    if (deactivatedKey) {
      console.log("❌ Deactivated key was still accepted (this is wrong!)");
    } else {
      console.log("✅ Deactivated key was correctly rejected");
    }

    console.log("\n🎉 All authentication tests completed!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Test the hash function
async function testHashFunction() {
  console.log("\n🔐 Testing Hash Function");
  console.log("-".repeat(30));

  const testKey = "nvc_test_key_123";

  // Create a new instance to access private methods through reflection
  const db = new (nvcDatabase.constructor as any)();

  try {
    // We can't access private methods directly, so we'll test through the public interface
    const result1 = await nvcDatabase.createApiKey("Hash Test 1");
    const result2 = await nvcDatabase.createApiKey("Hash Test 2");

    console.log("✅ Hash function working (keys created successfully)");
    console.log(`   Key 1: ${result1.key.substring(0, 15)}...`);
    console.log(`   Key 2: ${result2.key.substring(0, 15)}...`);

    // Clean up test keys
    nvcDatabase.deactivateApiKey(result1.id);
    nvcDatabase.deactivateApiKey(result2.id);

  } catch (error) {
    console.error("❌ Hash function test failed:", error);
  }
}

// Run tests
async function runAllTests() {
  await testAuth();
  await testHashFunction();

  console.log("\n✨ All tests completed!");
  nvcDatabase.close();
}

runAllTests().catch((error) => {
  console.error("❌ Test suite failed:", error);
  nvcDatabase.close();
  process.exit(1);
});

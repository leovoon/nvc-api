#!/usr/bin/env bun

import { nvcDatabase } from "../src/database";

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case "create":
      await createApiKey();
      break;
    case "list":
      await listApiKeys();
      break;
    case "deactivate":
      await deactivateApiKey();
      break;
    case "help":
    default:
      showHelp();
      break;
  }
}

async function createApiKey() {
  const name = args[1];

  if (!name) {
    console.error("❌ Error: API key name is required");
    console.log("Usage: bun run scripts/manage_api_keys.ts create <name>");
    process.exit(1);
  }

  try {
    const result = await nvcDatabase.createApiKey(name);
    console.log("✅ API key created successfully!");
    console.log(`Name: ${name}`);
    console.log(`ID: ${result.id}`);
    console.log(`Key: ${result.key}`);
    console.log("\n⚠️  Important: Save this key securely. It won't be shown again!");
  } catch (error) {
    console.error("❌ Error creating API key:", error);
    process.exit(1);
  }
}

async function listApiKeys() {
  try {
    const apiKeys = nvcDatabase.getAllApiKeys();

    if (apiKeys.length === 0) {
      console.log("📝 No API keys found");
      return;
    }

    console.log("📋 API Keys:");
    console.log("─".repeat(80));

    apiKeys.forEach((key) => {
      const status = key.is_active ? "🟢 Active" : "🔴 Inactive";
      const lastUsed = key.last_used ? new Date(key.last_used).toLocaleString() : "Never";

      console.log(`ID: ${key.id}`);
      console.log(`Name: ${key.name}`);
      console.log(`Status: ${status}`);
      console.log(`Created: ${new Date(key.created_at).toLocaleString()}`);
      console.log(`Last Used: ${lastUsed}`);
      console.log("─".repeat(80));
    });
  } catch (error) {
    console.error("❌ Error listing API keys:", error);
    process.exit(1);
  }
}

async function deactivateApiKey() {
  const idArg = args[1];

  if (!idArg) {
    console.error("❌ Error: API key ID is required");
    console.log("Usage: bun run scripts/manage_api_keys.ts deactivate <id>");
    process.exit(1);
  }

  const id = parseInt(idArg);
  if (isNaN(id)) {
    console.error("❌ Error: Invalid API key ID");
    process.exit(1);
  }

  try {
    const success = nvcDatabase.deactivateApiKey(id);

    if (success) {
      console.log(`✅ API key ${id} deactivated successfully`);
    } else {
      console.log(`❌ API key ${id} not found`);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error deactivating API key:", error);
    process.exit(1);
  }
}

function showHelp() {
  console.log("🔑 NVC API Key Management");
  console.log("═".repeat(40));
  console.log("");
  console.log("Commands:");
  console.log("  create <name>     Create a new API key");
  console.log("  list              List all API keys");
  console.log("  deactivate <id>   Deactivate an API key");
  console.log("  help              Show this help message");
  console.log("");
  console.log("Examples:");
  console.log("  bun run scripts/manage_api_keys.ts create 'Mobile App'");
  console.log("  bun run scripts/manage_api_keys.ts list");
  console.log("  bun run scripts/manage_api_keys.ts deactivate 1");
}

// Run the main function and handle cleanup
main()
  .then(() => {
    nvcDatabase.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Unexpected error:", error);
    nvcDatabase.close();
    process.exit(1);
  });

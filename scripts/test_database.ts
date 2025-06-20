#!/usr/bin/env bun
import { Database } from 'bun:sqlite';
import { existsSync } from 'fs';
import { initializeDatabase, DB_PATH } from './init_database';

async function testDatabase() {
  console.log('🧪 Testing NVC Database Setup...\n');

  try {
    // Test 1: Initialize database
    console.log('1️⃣ Testing database initialization...');
    initializeDatabase();
    console.log('✅ Database initialization successful\n');

    // Test 2: Check if database file exists
    console.log('2️⃣ Checking database file existence...');
    if (existsSync(DB_PATH)) {
      console.log(`✅ Database file exists at: ${DB_PATH}\n`);
    } else {
      throw new Error(`Database file not found at: ${DB_PATH}`);
    }

    // Test 3: Connect to database
    console.log('3️⃣ Testing database connection...');
    const db = new Database(DB_PATH);
    console.log('✅ Database connection successful\n');

    // Test 4: Check table structure
    console.log('4️⃣ Checking table structure...');
    const tables = db.query("SELECT name FROM sqlite_master WHERE type='table'").all();
    const hasExercisesTable = tables.some((table: any) => table.name === 'exercises');

    if (hasExercisesTable) {
      console.log('✅ Exercises table exists');
    } else {
      throw new Error('Exercises table not found');
    }

    // Get table info
    const tableInfo = db.query("PRAGMA table_info(exercises)").all();
    console.log(`   📊 Table has ${tableInfo.length} columns\n`);

    // Test 5: Check data count
    console.log('5️⃣ Checking data count...');
    const countResult = db.query("SELECT COUNT(*) as count FROM exercises").get() as { count: number };
    console.log(`✅ Database contains ${countResult.count} exercises\n`);

    // Test 6: Sample data retrieval
    console.log('6️⃣ Testing data retrieval...');
    const sampleExercises = db.query("SELECT id, type, name_en, name_zh FROM exercises LIMIT 3").all();

    console.log('   📋 Sample exercises:');
    sampleExercises.forEach((exercise: any) => {
      console.log(`   - [${exercise.id}] ${exercise.name_en} (${exercise.name_zh}) - Type: ${exercise.type}`);
    });
    console.log('✅ Data retrieval successful\n');

    // Test 7: Check different exercise types
    console.log('7️⃣ Checking exercise type distribution...');
    const typeDistribution = db.query(`
      SELECT type, COUNT(*) as count
      FROM exercises
      GROUP BY type
      ORDER BY count DESC
    `).all();

    console.log('   📊 Exercise types:');
    typeDistribution.forEach((row: any) => {
      console.log(`   - ${row.type}: ${row.count} exercises`);
    });
    console.log('✅ Type distribution check successful\n');

    // Test 8: Check difficulty levels
    console.log('8️⃣ Checking difficulty distribution...');
    const difficultyDistribution = db.query(`
      SELECT difficulty, COUNT(*) as count
      FROM exercises
      WHERE difficulty IS NOT NULL
      GROUP BY difficulty
      ORDER BY count DESC
    `).all();

    console.log('   📊 Difficulty levels:');
    difficultyDistribution.forEach((row: any) => {
      console.log(`   - ${row.difficulty}: ${row.count} exercises`);
    });
    console.log('✅ Difficulty distribution check successful\n');

    // Test 9: Test database queries with filters
    console.log('9️⃣ Testing filtered queries...');

    // Test beginner exercises
    const beginnerExercises = db.query("SELECT COUNT(*) as count FROM exercises WHERE difficulty = 'beginner'").get() as { count: number };
    console.log(`   - Beginner exercises: ${beginnerExercises.count}`);

    // Test listening-barriers type
    const listeningBarriers = db.query("SELECT COUNT(*) as count FROM exercises WHERE type = 'listening-barriers'").get() as { count: number };
    console.log(`   - Listening barrier exercises: ${listeningBarriers.count}`);

    // Test individual target audience
    const individualExercises = db.query("SELECT COUNT(*) as count FROM exercises WHERE target_audience = 'individual'").get() as { count: number };
    console.log(`   - Individual exercises: ${individualExercises.count}`);

    console.log('✅ Filtered queries successful\n');

    // Test 10: Test data integrity
    console.log('🔟 Testing data integrity...');

    // Check for required fields
    const missingNames = db.query("SELECT COUNT(*) as count FROM exercises WHERE name_en IS NULL OR name_zh IS NULL OR name_en = '' OR name_zh = ''").get() as { count: number };
    const missingDescriptions = db.query("SELECT COUNT(*) as count FROM exercises WHERE description_en IS NULL OR description_zh IS NULL OR description_en = '' OR description_zh = ''").get() as { count: number };

    if (missingNames.count === 0 && missingDescriptions.count === 0) {
      console.log('✅ All exercises have required name and description fields');
    } else {
      console.log(`⚠️  Found ${missingNames.count} exercises with missing names, ${missingDescriptions.count} with missing descriptions`);
    }

    db.close();
    console.log('✅ Database connection closed\n');

    // Summary
    console.log('🎉 All database tests completed successfully!');
    console.log(`📍 Database location: ${DB_PATH}`);
    console.log(`📊 Total exercises: ${countResult.count}`);
    console.log(`🏷️  Exercise types: ${typeDistribution.length}`);
    console.log(`📈 Difficulty levels: ${difficultyDistribution.length}`);

  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

// Run tests if script is executed directly
if (import.meta.main) {
  testDatabase();
}

export { testDatabase };

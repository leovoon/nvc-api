#!/usr/bin/env bun
import { initializeDatabase } from './init_database';

async function start() {
  console.log('🚀 Starting NVC API...');

  try {
    // Initialize database first
    console.log('📊 Initializing database...');
    initializeDatabase();

    // Start the main application
    console.log('🌟 Starting server...');
    await import('../src/index');

  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

start();

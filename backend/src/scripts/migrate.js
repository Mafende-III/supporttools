/**
 * Database Migration Script
 * Runs SQL migration files
 */

const fs = require('fs').promises;
const path = require('path');
const { query, testConnection, close } = require('../config/database');

const runMigration = async () => {
  try {
    console.log('🔄 Starting database migration...\n');

    // Test connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }

    // Read migration file
    const migrationPath = path.join(__dirname, '../../migrations/001_initial_schema.sql');
    const sql = await fs.readFile(migrationPath, 'utf8');

    console.log('📝 Executing migration: 001_initial_schema.sql');

    // Execute migration
    await query(sql);

    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Database schema created:');
    console.log('   - users table');
    console.log('   - projects table');
    console.log('   - flows table');
    console.log('   - project_members table');
    console.log('   - audit_log table');
    console.log('   - Helper functions and triggers');
    console.log('   - Views and indexes');
    console.log('\n✅ Default admin user created:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123 (CHANGE THIS!)');
    console.log('\n🎉 Database is ready to use!');

    await close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  }
};

runMigration();

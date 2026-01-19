// Initialize MongoDB with indexes
db = db.getSiblingDB('task_manager');

// Create collections and indexes
if (!db.getCollectionNames().includes('users')) {
  db.createCollection('users');
  db.users.createIndex({ email: 1 }, { unique: true });
}

if (!db.getCollectionNames().includes('tasks')) {
  db.createCollection('tasks');
  db.tasks.createIndex({ userId: 1, status: 1 });
  db.tasks.createIndex({ userId: 1, priority: 1 });
  db.tasks.createIndex({ userId: 1, dueDate: 1 });
}

print('✅ MongoDB initialized with task_manager database');
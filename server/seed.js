const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: __dirname + '/.env' });

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  department: String,
  isActive: Boolean,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const users = [
  {
    email: 'requester@buy2pay.com',
    password: bcrypt.hashSync('password123', 10),
    name: 'Requester',
    role: 'requester',
    department: 'IT',
    isActive: true
  },
  {
    email: 'approver@buy2pay.com',
    password: bcrypt.hashSync('password123', 10),
    name: 'Approver',
    role: 'approver',
    department: 'Finance',
    isActive: true
  },
  {
    email: 'finance@buy2pay.com',
    password: bcrypt.hashSync('password123', 10),
    name: 'Finance',
    role: 'finance',
    department: 'Finance',
    isActive: true
  },
  {
    email: 'admin@buy2pay.com',
    password: bcrypt.hashSync('password123', 10),
    name: 'Admin',
    role: 'admin',
    department: 'Admin',
    isActive: true
  }
];

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    await User.deleteMany({});
    await User.insertMany(users);
    console.log('Demo users seeded!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
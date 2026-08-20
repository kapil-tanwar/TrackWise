// scripts/seed.js  — Run with: node scripts/seed.js
// No extra dependencies needed beyond what's already in the project.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ── Load env file manually (avoids dotenv) ─────────────────────────────────
function loadEnv(filePath) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

// .env.local overrides .env
loadEnv(join(root, '.env'));
loadEnv(join(root, '.env.local'));

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('  MONGODB_URI not found. Make sure .env or .env.local exists.');
  process.exit(1);
}

// ── Inline Schemas (avoid Next.js module resolution issues) ─────────────────
const userSchema = new mongoose.Schema({
  name:                { type: String, required: true },
  email:               { type: String, required: true, unique: true },
  password:            { type: String },
  profilePicture:      { type: String, default: '' },
  currency:            { type: String, default: 'INR' },
  budgetLimit:         { type: Number, default: 50000 },
  xp:                  { type: Number, default: 0 },
  level:               { type: Number, default: 1 },
  streak:              { type: Number, default: 0 },
  lastTransactionDate: { type: Date,   default: null },
  themePreference:     { type: String, default: 'system' },
  createdAt:           { type: Date,   default: Date.now },
  updatedAt:           { type: Date,   default: Date.now },
});

const transactionSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:      { type: String, enum: ['income', 'expense'], required: true },
  category:  { type: String, required: true },
  amount:    { type: Number, required: true, min: 0 },
  date:      { type: Date, required: true, default: Date.now },
  notes:     { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const achievementSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  icon:        { type: String, default: '🏆' },
  earnedAt:    { type: Date, default: Date.now },
  xpReward:    { type: Number, default: 0 },
});

const User        = mongoose.models.User        || mongoose.model('User',        userSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema);

// ── Helpers ──────────────────────────────────────────────────────────────────
const daysAgo  = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const monthAgo = (n, day) => { const d = new Date(); d.setMonth(d.getMonth() - n); d.setDate(day); return d; };

// ── Demo Account ─────────────────────────────────────────────────────────────
const DEMO_EMAIL    = 'demo@trackwise.com';
const DEMO_PASSWORD = 'demo1234';

// ── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🔌  Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('✅  Connected.\n');

  // User
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    console.log('ℹ️   Demo user found — clearing old demo data...');
    await Transaction.deleteMany({ userId: existing._id });
    await Achievement.deleteMany({ userId: existing._id });
  }

  const hashed = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = existing
    ? await User.findOneAndUpdate({ email: DEMO_EMAIL }, { xp: 650, level: 4, streak: 7, budgetLimit: 50000 }, { new: true })
    : await User.create({ name: 'Demo User', email: DEMO_EMAIL, password: hashed, currency: 'INR', budgetLimit: 50000, xp: 650, level: 4, streak: 7, lastTransactionDate: new Date() });

  console.log(`✅  Demo user: ${user.email}\n`);

  // Transactions
  const txList = [
    // Current month
    { type: 'income',  category: 'Salary',       amount: 85000, date: daysAgo(2),    notes: 'Monthly salary' },
    { type: 'expense', category: 'Food',          amount: 2200,  date: daysAgo(1),    notes: 'Groceries from DMart' },
    { type: 'expense', category: 'Transport',     amount: 850,   date: daysAgo(2),    notes: 'Ola/Uber rides' },
    { type: 'expense', category: 'Entertainment', amount: 1500,  date: daysAgo(3),    notes: 'Netflix + Spotify' },
    { type: 'expense', category: 'Food',          amount: 700,   date: daysAgo(4),    notes: 'Zomato orders' },
    { type: 'income',  category: 'Freelance',     amount: 15000, date: daysAgo(5),    notes: 'Web dev project' },
    { type: 'expense', category: 'Shopping',      amount: 3500,  date: daysAgo(6),    notes: 'Myntra shopping' },
    { type: 'expense', category: 'Utilities',     amount: 1200,  date: daysAgo(7),    notes: 'Electricity bill' },
    { type: 'expense', category: 'Healthcare',    amount: 900,   date: daysAgo(8),    notes: 'Pharmacy' },
    { type: 'expense', category: 'Food',          amount: 1100,  date: daysAgo(9),    notes: 'Restaurant dinner' },
    { type: 'expense', category: 'Transport',     amount: 450,   date: daysAgo(10),   notes: 'Petrol' },
    { type: 'income',  category: 'Investment',    amount: 5000,  date: daysAgo(11),   notes: 'Dividend received' },
    // 1 month ago
    { type: 'income',  category: 'Salary',        amount: 85000, date: monthAgo(1,2),  notes: 'Monthly salary' },
    { type: 'expense', category: 'Rent',           amount: 18000, date: monthAgo(1,1),  notes: 'Monthly rent' },
    { type: 'expense', category: 'Food',           amount: 2800,  date: monthAgo(1,5),  notes: 'Groceries' },
    { type: 'expense', category: 'Transport',      amount: 1200,  date: monthAgo(1,10), notes: 'Commute' },
    { type: 'expense', category: 'Entertainment',  amount: 2500,  date: monthAgo(1,15), notes: 'Movie + OTT' },
    { type: 'expense', category: 'Shopping',       amount: 4200,  date: monthAgo(1,20), notes: 'Electronics' },
    { type: 'income',  category: 'Freelance',      amount: 12000, date: monthAgo(1,22), notes: 'Design project' },
    // 2 months ago
    { type: 'income',  category: 'Salary',         amount: 85000, date: monthAgo(2,2),  notes: 'Monthly salary' },
    { type: 'expense', category: 'Rent',            amount: 18000, date: monthAgo(2,1),  notes: 'Monthly rent' },
    { type: 'expense', category: 'Food',            amount: 2600,  date: monthAgo(2,6),  notes: 'Groceries' },
    { type: 'expense', category: 'Healthcare',      amount: 3500,  date: monthAgo(2,8),  notes: 'Doctor visit' },
    { type: 'expense', category: 'Shopping',        amount: 2200,  date: monthAgo(2,18), notes: 'Clothing' },
    { type: 'income',  category: 'Investment',      amount: 8000,  date: monthAgo(2,25), notes: 'SIP returns' },
    // 3 months ago
    { type: 'income',  category: 'Salary',          amount: 85000, date: monthAgo(3,2),  notes: 'Monthly salary' },
    { type: 'expense', category: 'Rent',             amount: 18000, date: monthAgo(3,1),  notes: 'Monthly rent' },
    { type: 'expense', category: 'Food',             amount: 3200,  date: monthAgo(3,7),  notes: 'Groceries + dining' },
    { type: 'expense', category: 'Entertainment',    amount: 1800,  date: monthAgo(3,15), notes: 'Streaming + games' },
    { type: 'income',  category: 'Freelance',        amount: 20000, date: monthAgo(3,20), notes: 'Big project delivery' },
    // 4 months ago
    { type: 'income',  category: 'Salary',           amount: 85000, date: monthAgo(4,2),  notes: 'Monthly salary' },
    { type: 'expense', category: 'Rent',              amount: 18000, date: monthAgo(4,1),  notes: 'Monthly rent' },
    { type: 'expense', category: 'Food',              amount: 2900,  date: monthAgo(4,9),  notes: 'Groceries' },
    { type: 'expense', category: 'Shopping',          amount: 6500,  date: monthAgo(4,20), notes: 'Diwali shopping' },
    // 5 months ago
    { type: 'income',  category: 'Salary',            amount: 80000, date: monthAgo(5,2),  notes: 'Monthly salary' },
    { type: 'expense', category: 'Rent',               amount: 18000, date: monthAgo(5,1),  notes: 'Monthly rent' },
    { type: 'expense', category: 'Food',               amount: 2400,  date: monthAgo(5,7),  notes: 'Groceries' },
    { type: 'expense', category: 'Transport',          amount: 1500,  date: monthAgo(5,15), notes: 'Travel' },
    { type: 'income',  category: 'Investment',         amount: 6000,  date: monthAgo(5,28), notes: 'FD maturity' },
  ];

  await Transaction.insertMany(txList.map(t => ({ ...t, userId: user._id })));
  console.log(`✅  Inserted ${txList.length} transactions.\n`);

  // Achievements
  const achList = [
    { title: 'First Steps',         description: 'Logged your very first transaction',    icon: '👣', xpReward: 50,  earnedAt: daysAgo(30) },
    { title: 'Saver',               description: 'Saved more than you spent in a month',  icon: '💰', xpReward: 100, earnedAt: daysAgo(25) },
    { title: 'Streak Starter',      description: 'Maintained a 3-day logging streak',     icon: '🔥', xpReward: 75,  earnedAt: daysAgo(20) },
    { title: 'Budget Watcher',      description: 'Stayed within budget for a full month', icon: '🎯', xpReward: 150, earnedAt: daysAgo(15) },
    { title: 'Income Diversifier',  description: 'Logged income from multiple sources',   icon: '📈', xpReward: 100, earnedAt: daysAgo(10) },
    { title: 'Level Up!',           description: 'Reached Level 4 — keep going!',         icon: '⭐', xpReward: 200, earnedAt: daysAgo(5) },
    { title: 'Week Warrior',        description: 'Maintained a 7-day logging streak',     icon: '🏅', xpReward: 125, earnedAt: daysAgo(1) },
  ];

  await Achievement.insertMany(achList.map(a => ({ ...a, userId: user._id })));
  console.log(`✅  Inserted ${achList.length} achievements.\n`);

  console.log('═══════════════════════════════════════════════');
  console.log('  🎉  Seed complete!');
  console.log('═══════════════════════════════════════════════');
  console.log(`  📧  Email    : ${DEMO_EMAIL}`);
  console.log(`  🔑  Password : ${DEMO_PASSWORD}`);
  console.log('═══════════════════════════════════════════════');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('  Seed failed:', err.message);
  mongoose.disconnect().then(() => process.exit(1));
});

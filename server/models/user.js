const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const BudgetSchema = new mongoose.Schema({
  category: { type: String, required: true },
  limit: { type: Number, required: true, default: 0 },
  spent: { type: Number, required: true, default: 0 },
  transactions: [TransactionSchema]
});

const BankAccountSchema = new mongoose.Schema({
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifsc: { type: String, required: true }
});

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  budgets: [BudgetSchema],
  bankAccounts: [BankAccountSchema] // Added bank accounts
});

module.exports = mongoose.model('user', UserSchema);


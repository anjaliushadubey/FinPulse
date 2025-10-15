const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user');

// @route   GET /api/budgets
// @desc    Get user's budgets
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('budgets');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ budgets: user.budgets || [] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/budgets/setup
// @desc    Set up initial budgets for a new user
// @access  Private
router.post('/setup', auth, async (req, res) => {
    const { budgets } = req.body;
    if (!budgets || !Array.isArray(budgets)) {
        return res.status(400).json({ msg: 'Invalid budget data provided.' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const newBudgets = budgets.map(b => ({
            category: b.category,
            limit: b.limit,
            spent: 0,
            transactions: []
        }));

        user.budgets = newBudgets;
        await user.save();
        res.json({ budgets: user.budgets });
    } catch (err) {
        console.error("Budget setup error:", err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST /api/budgets/transaction
// @desc    Add a new transaction to a budget
// @access  Private
router.post('/transaction', auth, async (req, res) => {
    const { category, amount, description } = req.body;

    if (!category || !amount || !description) {
        return res.status(400).json({ msg: 'Please provide category, amount, and description' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const budgetToUpdate = user.budgets.find(b => b.category === category);
        if (!budgetToUpdate) {
            return res.status(404).json({ msg: `Budget category '${category}' not found.` });
        }
        
        const newTransaction = { description, amount };
        budgetToUpdate.transactions.push(newTransaction);
        budgetToUpdate.spent += amount;

        await user.save();
        res.json({ budgets: user.budgets });

    } catch (err) {
        console.error("Transaction error:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;


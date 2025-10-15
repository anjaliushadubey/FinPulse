const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user');

// @route   POST /api/accounts
// @desc    Add a bank account for a user
// @access  Private
router.post('/', auth, async (req, res) => {
    const { bankName, accountNumber, ifsc } = req.body;
    if (!bankName || !accountNumber || !ifsc) {
        return res.status(400).json({ msg: 'Please provide all bank account details.' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const newAccount = { bankName, accountNumber, ifsc };
        user.bankAccounts.push(newAccount);

        await user.save();
        res.json(user.bankAccounts);
    } catch (err) {
        console.error("Add account error:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/user'); // Ensure this matches your filename, e.g., 'user.js'

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  console.log('--- REGISTRATION ATTEMPT ---');
  console.log('1. /api/auth/register route hit for email:', email);


  if (!email || !password) {
    console.log('Error: Missing email or password.');
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      console.log('2. User with this email already exists.');
      return res.status(400).json({ msg: 'User already exists' });
    }
    console.log('2. User is new. Proceeding with registration.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('3. Password has been hashed.');

    const defaultBudgets = [
        { category: 'Food', limit: 5000, spent: 0, transactions: [] },
        { category: 'Shopping', limit: 4000, spent: 0, transactions: [] },
        { category: 'Travel', limit: 10000, spent: 0, transactions: [] },
        { category: 'Other', limit: 2000, spent: 0, transactions: [] },
    ];
    console.log('4. Default budgets defined.');

    user = new User({ 
      email, 
      password: hashedPassword,
      budgets: defaultBudgets 
    });
    console.log('5. New User object created in memory.');

    await user.save();
    console.log('6. User saved to database successfully!');

    const payload = {
      user: {
        id: user.id,
      },
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error("FATAL ERROR: JWT_SECRET is not defined in .env file!");
        return res.status(500).send('Server configuration error.');
    }
    console.log('7. Signing JWT token.');

    jwt.sign(
      payload,
      secret,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        console.log('8. Token created. Sending response to client.');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error("!!! SERVER CRASHED DURING REGISTRATION !!!");
    console.error(err); // This will log the full error object for details
    res.status(500).send('Server error');
  }
});

// LOGIN and GET USER routes remain the same...
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;


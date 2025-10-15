require('dotenv').config(); // Make sure this is at the very top
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

// --- CRITICAL CHECK ---
// This code will immediately crash the server if JWT_SECRET is not found.
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in your .env file.');
    process.exit(1); // This stops the process with a failure code.
}
// --------------------

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/accounts', require('./routes/accounts')); // Make sure you have this line

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
const mongoose = require('mongoose');
const
 
dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // These options are no longer needed for recent versions of mongoose
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log('Successfully connected to MongoDB Atlas!');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const admin = await User.findOne({ email: 'admin@college.edu' });
    if (!admin) {
      console.log('❌ Admin user NOT found!');
    } else {
      console.log('✅ Admin user found:', admin.email);
      // Let's manually overwrite the password so we know for sure what it is
      admin.password = 'admin123';
      await admin.save();
      console.log('✅ Admin password reset to: admin123');
    }
    
    // Also list all users just in case
    const allUsers = await User.find({}, 'email name role');
    console.log('All users in DB:', allUsers);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkAdmin();

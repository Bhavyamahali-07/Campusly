import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import College from './src/models/College.js';
import { ROLES } from './src/config/constants.js';

dotenv.config();

const seedStudent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const college = await College.findOne({ code: 'DEMO' });
    if (!college) {
      console.log('❌ Demo college not found!');
      process.exit(1);
    }

    let student = await User.findOne({ email: 'student@college.edu' });
    if (student) {
      console.log('ℹ️ Student user already exists. Resetting password...');
      student.password = 'student123';
      await student.save();
    } else {
      student = await User.create({
        name: 'Alex Student',
        email: 'student@college.edu',
        password: 'student123',
        role: ROLES.STUDENT,
        college: college._id,
        department: 'Computer Science',
        year: '2nd Year',
        skills: ['React', 'JavaScript', 'Node.js'],
        isVerified: true
      });
      console.log('✅ Created demo student!');
    }

    console.log('Credentials -> Email: student@college.edu | Password: student123');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedStudent();

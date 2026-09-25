import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Club from './src/models/Club.js';

dotenv.config();

const updateClubs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Make Literary Club require approval
    const club1 = await Club.findOneAndUpdate(
      { name: 'Literary Club' },
      { type: 'APPROVAL' },
      { new: true }
    );

    // Make Dance Club require approval
    const club2 = await Club.findOneAndUpdate(
      { name: 'Dance Club' },
      { type: 'APPROVAL' },
      { new: true }
    );

    console.log('✅ Literary Club and Dance Club now require admin approval (type: APPROVAL).');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

updateClubs();

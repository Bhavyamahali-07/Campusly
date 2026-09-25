import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from './src/models/College.js';
import User from './src/models/User.js';
import Club from './src/models/Club.js';

dotenv.config();

const seedClubs = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the admin user and college to associate
    const college = await College.findOne({ code: 'DEMO' });
    const admin = await User.findOne({ email: 'admin@college.edu' });

    if (!college || !admin) {
      console.log('❌ College or Admin not found. Please start the server once to seed them.');
      process.exit(1);
    }

    const clubs = [
      {
        name: 'Literary Club',
        description: 'A community for those who love reading, writing, poetry, and literature discussions.',
        category: 'Literature',
      },
      {
        name: 'Fine Arts Club',
        description: 'Express your creativity through painting, sketching, and visual arts.',
        category: 'Arts',
      },
      {
        name: 'Multimedia Club',
        description: 'Explore photography, videography, graphic design, and digital content creation.',
        category: 'Technology',
      },
      {
        name: 'Arts and Crafts Club',
        description: 'Get hands-on with DIY projects, origami, pottery, and crafting.',
        category: 'Arts',
      },
      {
        name: 'Dance Club',
        description: 'Join us to learn new styles, choreograph routines, and perform at events.',
        category: 'Cultural',
      },
      {
        name: 'Singing Club',
        description: 'For vocalists, instrumentalists, and music enthusiasts to collaborate and perform.',
        category: 'Cultural',
      }
    ];

    for (const clubData of clubs) {
      // Check if club already exists
      const existing = await Club.findOne({ name: clubData.name, college: college._id });
      if (!existing) {
        await Club.create({
          ...clubData,
          college: college._id,
          admin: admin._id,
          membersCount: 1, // Admin is a member
          isApproved: true,
          isActive: true,
          logo: `https://api.dicebear.com/7.x/shapes/svg?seed=${clubData.name.replace(/\s+/g, '')}`
        });
        console.log(`✅ Created club: ${clubData.name}`);
      } else {
        console.log(`ℹ️ Club already exists: ${clubData.name}`);
      }
    }

    console.log('🎉 Club seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding clubs:', error);
    process.exit(1);
  }
};

seedClubs();

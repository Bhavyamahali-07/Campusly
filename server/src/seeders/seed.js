import College from '../models/College.js';
import User from '../models/User.js';
import { ROLES } from '../config/constants.js';

/**
 * Seed a default college and admin user if they don't exist.
 */
export const seedDefaultCollege = async () => {
  try {
    const existing = await College.findOne({ code: 'DEMO' });
    if (existing) {
      console.log('✅ Default college already exists');
      return;
    }

    // Create default college
    const college = await College.create({
      name: 'Demo College of Engineering & Technology',
      code: 'DEMO',
      emailDomain: 'college.edu',
      location: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      },
      settings: {
        registrationEnabled: true,
        requireEmailVerification: false,
        allowClubCreation: true,
        maxClubsPerStudent: 5,
      },
    });

    // Create default admin
    const admin = await User.create({
      name: 'College Admin',
      email: 'admin@college.edu',
      password: 'admin123',
      role: ROLES.COLLEGE_ADMIN,
      college: college._id,
      department: 'Administration',
      isVerified: true,
    });

    // Add admin to college
    college.admins.push(admin._id);
    await college.save();

    console.log('✅ Default college seeded: Demo College');
    console.log('✅ Default admin: admin@college.edu / admin123');
  } catch (error) {
    console.error('Seeding error:', error.message);
  }
};

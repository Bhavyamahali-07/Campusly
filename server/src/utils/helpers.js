import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for a user
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Set JWT as HTTP-only cookie on the response
 */
export const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };

  res.cookie('token', token, cookieOptions);
};

/**
 * Clear the JWT cookie
 */
export const clearTokenCookie = (res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
};

/**
 * Calculate profile completion percentage
 */
export const calculateProfileCompletion = (user) => {
  const fields = [
    { key: 'name', weight: 15 },
    { key: 'department', weight: 15 },
    { key: 'year', weight: 10 },
    { key: 'bio', weight: 15 },
    { key: 'skills', weight: 15, isArray: true },
    { key: 'interests', weight: 10, isArray: true },
    { key: 'avatar', weight: 10 },
    { key: 'socialLinks', weight: 10, isObject: true },
  ];

  let completion = 0;
  for (const field of fields) {
    if (field.isArray) {
      if (user[field.key] && user[field.key].length > 0) completion += field.weight;
    } else if (field.isObject) {
      if (user[field.key] && Object.values(user[field.key]).some(v => v)) completion += field.weight;
    } else {
      if (user[field.key]) completion += field.weight;
    }
  }

  return completion;
};

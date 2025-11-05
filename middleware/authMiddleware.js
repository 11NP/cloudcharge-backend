const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Check if the token was sent in the header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Get the token from the header (e.g., "Bearer 12345abcdef")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token is real
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Get the user from the token's ID and attach it to the request
      // We exclude the password when fetching the user
      req.user = await User.findById(decoded.id).select('-password');

      // 5. Call "next()" to let the request continue to its destination
      next();

    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token was sent at all
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
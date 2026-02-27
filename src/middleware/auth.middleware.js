const { verifyToken } = require('../utils/jwt.utils');
const { AuthenticationError } = require('../utils/errors');
const User = require('../models/user.model');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Access token required');
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new AuthenticationError('Access token required');
    }

    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(error);
    }
    next(error);
  }
};

module.exports = authenticate;

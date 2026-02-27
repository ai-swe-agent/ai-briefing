const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const expiresIn = parseInt(process.env.JWT_EXPIRES_IN, 10) || 900;
  
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      username: user.username
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken
};

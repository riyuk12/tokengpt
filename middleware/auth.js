const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  

  if (!token) return res.status(401).json({ message: 'Access denied.' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    req.tokenExpiry = decoded.exp;
    next();
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

module.exports = auth;

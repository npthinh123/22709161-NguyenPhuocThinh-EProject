const jwt = require('jsonwebtoken');
require('dotenv').config();

/**

 * @param {Object} req 
 * @param {Object} res  
 * @param {Function} next 
 */
function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = isAuthenticated;

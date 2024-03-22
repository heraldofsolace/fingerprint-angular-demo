const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function verifyToken(req, res, next) {
    const token = req.header('Authorization').split(' ')[1];

    if (!token) 
        return res.status(401).json({ error: 'Access denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: decoded.email } });
        if (!user) 
            return res.status(401).json({ error: 'Access denied' });
        delete user.dataValues.password;
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Access denied' });
    }
 };

module.exports = verifyToken;
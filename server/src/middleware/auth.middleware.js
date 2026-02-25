const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Handle "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: "Unauthorize user" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
};

module.exports = verifyToken;

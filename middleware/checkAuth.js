import jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
    try {
        const token = req.cookies.sessionid;

        if (!token) {
            req.user = null;
            return next(); // Continue to the next middleware or route handler
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                req.user = null;
                return next();
            }

            req.user = decoded;
            next();
        });
    } catch (error) {
        req.user = null;
        next();
    }
};

export default authenticate;

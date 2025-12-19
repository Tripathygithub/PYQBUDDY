const { verifyAccessToken } = require('./jwt');
const { errorCode } = require('../responsecode/response');

/**
 * Middleware to verify JWT access token
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(errorCode.authError).json({
                success: false,
                message: 'No authorization token provided',
                credentials: false
            });
        }

        // Extract token (format: "Bearer TOKEN")
        let token = authHeader;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }

        // Verify token
        try {
            const decoded = verifyAccessToken(token);
            
            // Attach user info to request
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };
            req.token = token;

            next();
        } catch (error) {
            return res.status(errorCode.authError).json({
                success: false,
                message: 'Invalid or expired token',
                credentials: false
            });
        }

    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(errorCode.serverError).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
};

/**
 * Middleware to check if user has specific role
 * @param {Array} roles - Array of allowed roles
 */
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(errorCode.authError).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(errorCode.dataNotmatch).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next();
        }

        let token = authHeader;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }

        try {
            const decoded = verifyAccessToken(token);
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };
            req.token = token;
        } catch (error) {
            // Token invalid but don't fail
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = {
    middleware: authMiddleware,
    authMiddleware,
    checkRole,
    optionalAuth
};

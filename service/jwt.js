const jwt = require('jsonwebtoken');

// JWT Configuration
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-key';
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '2m'; // 5 minutes
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '1m'; // 7 days
const JWT_ISSUER = process.env.JWT_ISSUER || 'speak-sync-gateway';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'speak-sync-api';

/**
 * Generate access token
 * @param {Object} payload - User data to encode in token
 * @returns {String} - JWT access token
 */
const generateAccessToken = (payload) => {
    const { userId, email, role } = payload;
    
    return jwt.sign(
        { 
            userId, 
            email, 
            role 
        },
        JWT_ACCESS_SECRET,
        {
            expiresIn: JWT_ACCESS_EXPIRATION,
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE
        }
    );
};

/**
 * Generate refresh token
 * @param {Object} payload - User data to encode in token
 * @returns {String} - JWT refresh token
 */
const generateRefreshToken = (payload) => {
    const { userId, email, role } = payload;
    
    return jwt.sign(
        { 
            userId, 
            email, 
            role 
        },
        JWT_REFRESH_SECRET,
        {
            expiresIn: JWT_REFRESH_EXPIRATION,
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE
        }
    );
};

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} - Object containing both tokens
 */
const generateTokens = (user) => {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };

    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload)
    };
};

/**
 * Verify access token
 * @param {String} token - JWT access token
 * @returns {Object} - Decoded token payload
 */
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_ACCESS_SECRET, {
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE
        });
    } catch (error) {
        throw new Error('Invalid or expired access token');
    }
};

/**
 * Verify refresh token
 * @param {String} token - JWT refresh token
 * @returns {Object} - Decoded token payload
 */
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET, {
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE
        });
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

/**
 * Decode token without verification (useful for expired tokens)
 * @param {String} token - JWT token
 * @returns {Object} - Decoded token payload
 */
const decodeToken = (token) => {
    return jwt.decode(token);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateTokens,
    verifyAccessToken,
    verifyRefreshToken,
    decodeToken
};

const User = require('../Models/User');
const { generateTokens, verifyRefreshToken } = require('../service/jwt');
const { errorCode } = require('../responsecode/response');

/**
 * Register a new user
 * @route POST /api/v1/auth/register
 */
const register = async (req, res) => {
    try {
        const { email, name, password, role } = req.body;

        // Validate required fields
        if (!email || !name || !password) {
            return res.status(errorCode.requiredError).json({
                success: false,
                message: 'Email, name, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(errorCode.dataExist).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const user = new User({
            email,
            name,
            password,
            role: role || 'user'
        });

        await user.save();

        // Generate tokens
        const tokens = generateTokens(user);

        // Store refresh token
        await user.addRefreshToken(tokens.refreshToken);

        // Prepare user response (password excluded via toJSON)
        const userResponse = user.toJSON();

        return res.status(errorCode.success).json({
            success: true,
            data: {
                user: userResponse,
                tokens
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        return res.status(errorCode.serverError).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
};

/**
 * Login user
 * @route POST /api/v1/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(errorCode.requiredError).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(errorCode.authError).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(errorCode.authError).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(errorCode.authError).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate tokens
        const tokens = generateTokens(user);

        // Store refresh token
        await user.addRefreshToken(tokens.refreshToken);

        // Prepare user response
        const userResponse = user.toJSON();

        return res.status(errorCode.success).json({
            success: true,
            data: {
                user: userResponse,
                tokens
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(errorCode.serverError).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
};

/**
 * Refresh access token using refresh token
 * @route POST /api/v1/auth/refresh
 */
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(errorCode.requiredError).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (error) {
            return res.status(errorCode.authError).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        // Find user and check if refresh token exists
        const user = await User.findOne({ 
            id: decoded.userId,
            'refreshTokens.token': refreshToken
        });

        if (!user) {
            return res.status(errorCode.authError).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new tokens
        const tokens = generateTokens(user);

        // Remove old refresh token and add new one
        await user.removeRefreshToken(refreshToken);
        await user.addRefreshToken(tokens.refreshToken);

        // Prepare user response
        const userResponse = user.toJSON();

        return res.status(errorCode.success).json({
            success: true,
            data: {
                user: userResponse,
                tokens
            }
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        return res.status(errorCode.serverError).json({
            success: false,
            message: 'Server error during token refresh',
            error: error.message
        });
    }
};

/**
 * Logout user (invalidate refresh token)
 * @route POST /api/v1/auth/logout
 */
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const userId = req.user?.userId; // From middleware

        if (!refreshToken && !userId) {
            return res.status(errorCode.requiredError).json({
                success: false,
                message: 'Refresh token or user authentication required'
            });
        }

        // If userId is available from access token, use it
        if (userId) {
            const user = await User.findOne({ id: userId });
            if (user && refreshToken) {
                await user.removeRefreshToken(refreshToken);
            }
        } else if (refreshToken) {
            // Try to decode and remove token
            try {
                const decoded = verifyRefreshToken(refreshToken);
                const user = await User.findOne({ id: decoded.userId });
                if (user) {
                    await user.removeRefreshToken(refreshToken);
                }
            } catch (error) {
                // Token might be expired, but we still want to respond success
            }
        }

        return res.status(errorCode.success).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        return res.status(errorCode.serverError).json({
            success: false,
            message: 'Server error during logout',
            error: error.message
        });
    }
};

/**
 * Logout from all devices (invalidate all refresh tokens)
 * @route POST /api/v1/auth/logout-all
 */
const logoutAll = async (req, res) => {
    try {
        const userId = req.user?.userId; // From middleware

        if (!userId) {
            return res.status(errorCode.authError).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(errorCode.authError).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.removeAllRefreshTokens();

        return res.status(errorCode.success).json({
            success: true,
            message: 'Logged out from all devices successfully'
        });

    } catch (error) {
        console.error('Logout all error:', error);
        return res.status(errorCode.serverError).json({
            success: false,
            message: 'Server error during logout',
            error: error.message
        });
    }
};

/**
 * Get current user profile
 * @route GET /api/v1/auth/me
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(errorCode.authError).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(errorCode.authError).json({
                success: false,
                message: 'User not found'
            });
        }

        const userResponse = user.toJSON();

        return res.status(errorCode.success).json({
            success: true,
            data: {
                user: userResponse
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(errorCode.serverError).json({
            success: false,
            message: 'Server error fetching profile',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    logoutAll,
    getProfile
};

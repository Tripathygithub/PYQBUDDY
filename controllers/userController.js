const User = require('../Models/User');
const { errorCode } = require('../responsecode/response');

/**
 * Get all users (Admin only)
 * @route GET /api/v1/user/all
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ isActive: true }).select('-password -refreshTokens');

        return res.status(errorCode.success).json({
            success: true,
            data: {
                users,
                count: users.length
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        return res.status(errorCode.serverError).json({
            success: false,
            message: 'Server error fetching users',
            error: error.message
        });
    }
};

/**
 * Get user by ID
 * @route GET /api/v1/user/:id
 */
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findOne({ id }).select('-password -refreshTokens');

        if (!user) {
            return res.status(errorCode.dataNotmatch).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(errorCode.success).json({
            success: true,
            data: {
                user
            }
        });

    } catch (error) {
        console.error('Get user by ID error:', error);
        return res.status(errorCode.serverError).json({
            success: false,
            message: 'Server error fetching user',
            error: error.message
        });
    }
};

/**
 * Update user profile
 * @route PUT /api/v1/user/profile
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, email } = req.body;

        const user = await User.findOne({ id: userId });

        if (!user) {
            return res.status(errorCode.dataNotmatch).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(errorCode.dataExist).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
            user.email = email;
        }

        if (name) user.name = name;

        await user.save();

        const userResponse = user.toJSON();

        return res.status(errorCode.success).json({
            success: true,
            data: {
                user: userResponse
            },
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(errorCode.serverError).json({
            success: false,
            message: 'Server error updating profile',
            error: error.message
        });
    }
};

/**
 * Change password
 * @route PUT /api/v1/user/change-password
 */
const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(errorCode.requiredError).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(errorCode.requiredError).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const user = await User.findOne({ id: userId });

        if (!user) {
            return res.status(errorCode.dataNotmatch).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(errorCode.authError).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Invalidate all refresh tokens for security
        await user.removeAllRefreshTokens();

        return res.status(errorCode.success).json({
            success: true,
            message: 'Password changed successfully. Please login again.'
        });

    } catch (error) {
        console.error('Change password error:', error);
        return res.status(errorCode.serverError).json({
            success: false,
            message: 'Server error changing password',
            error: error.message
        });
    }
};

/**
 * Delete user account
 * @route DELETE /api/v1/user/account
 */
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { password } = req.body;

        if (!password) {
            return res.status(errorCode.requiredError).json({
                success: false,
                message: 'Password is required to delete account'
            });
        }

        const user = await User.findOne({ id: userId });

        if (!user) {
            return res.status(errorCode.dataNotmatch).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(errorCode.authError).json({
                success: false,
                message: 'Password is incorrect'
            });
        }

        // Soft delete - deactivate account
        user.isActive = false;
        await user.removeAllRefreshTokens();
        await user.save();

        return res.status(errorCode.success).json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        return res.status(errorCode.serverError).json({
            success: false,
            message: 'Server error deleting account',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateProfile,
    changePassword,
    deleteAccount
};

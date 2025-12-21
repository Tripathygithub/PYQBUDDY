const errorCode = {
    "success": 200,
    "authError": 401,
    "dataNotmatch": 403,
    "dataExist": 406,
    "requiredError": 419,
    "serverError": 500,
};

// ==================== SUCCESS RESPONSE ====================
const successResponse = (res, message, data = null, statusCode = 200) => {
    const response = {
        success: true,
        message: message || 'Success'
    };
    
    if (data !== null) {
        response.data = data;
    }
    
    return res.status(statusCode).json(response);
};

// ==================== ERROR RESPONSE ====================
const errorResponse = (res, message, errors = null, statusCode = 500) => {
    const response = {
        success: false,
        message: message || 'An error occurred'
    };
    
    if (errors) {
        response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
};

// ==================== NOT FOUND RESPONSE ====================
const notFoundResponse = (res, message = 'Resource not found') => {
    return res.status(404).json({
        success: false,
        message: message
    });
};

// ==================== VALIDATION ERROR RESPONSE ====================
const validationErrorResponse = (res, error) => {
    const errors = {};
    
    if (error.errors) {
        Object.keys(error.errors).forEach(key => {
            errors[key] = error.errors[key].message;
        });
    }
    
    return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
    });
};

// ==================== UNAUTHORIZED RESPONSE ====================
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
    return res.status(401).json({
        success: false,
        message: message
    });
};

// ==================== FORBIDDEN RESPONSE ====================
const forbiddenResponse = (res, message = 'Access forbidden') => {
    return res.status(403).json({
        success: false,
        message: message
    });
};

module.exports = {
    errorCode,
    successResponse,
    errorResponse,
    notFoundResponse,
    validationErrorResponse,
    unauthorizedResponse,
    forbiddenResponse
};
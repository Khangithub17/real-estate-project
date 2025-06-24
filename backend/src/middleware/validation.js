const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Middleware to parse JSON fields from FormData
const parseFormDataJSON = (req, res, next) => {
    // Parse tags if it's a JSON string
    if (req.body.tags && typeof req.body.tags === 'string') {
        try {
            req.body.tags = JSON.parse(req.body.tags);
        } catch (e) {
            req.body.tags = [];
        }
    }
    
    // Parse other JSON fields if needed in the future
    if (req.body.seo && typeof req.body.seo === 'string') {
        try {
            req.body.seo = JSON.parse(req.body.seo);
        } catch (e) {
            req.body.seo = {};
        }
    }
    
    next();
};

// User validation rules
const validateUserRegistration = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
    handleValidationErrors
];

const validateUserLogin = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
      body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
];

// User validation rules (for admin user management)
const validateUser = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
    body('role')
        .optional()
        .isIn(['admin', 'user'])
        .withMessage('Role must be either admin or user'),
    
    handleValidationErrors
];

// Project validation rules
const validateProject = [
    body('title')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    
    body('description')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
    
    body('location.address')
        .trim()
        .notEmpty()
        .withMessage('Address is required'),
    
    body('location.city')
        .trim()
        .notEmpty()
        .withMessage('City is required'),
    
    body('location.state')
        .trim()
        .notEmpty()
        .withMessage('State is required'),
    
    body('location.zipCode')
        .trim()
        .notEmpty()
        .withMessage('Zip code is required'),
    
    body('price')
        .isNumeric()
        .withMessage('Price must be a number')
        .isFloat({ min: 0 })
        .withMessage('Price cannot be negative'),
    
    body('propertyType')
        .isIn(['residential', 'commercial', 'industrial', 'land'])
        .withMessage('Property type must be residential, commercial, industrial, or land'),
    
    body('specifications.area')
        .isNumeric()
        .withMessage('Area must be a number')
        .isFloat({ min: 0 })
        .withMessage('Area cannot be negative'),
    
    body('specifications.bedrooms')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Bedrooms must be a non-negative integer'),
    
    body('specifications.bathrooms')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Bathrooms must be a non-negative integer'),
    
    handleValidationErrors
];

// Blog validation rules
const validateBlog = [
    parseFormDataJSON, // Parse JSON fields first
    
    body('title')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),
    
    body('excerpt')
        .trim()
        .isLength({ min: 10, max: 300 })
        .withMessage('Excerpt must be between 10 and 300 characters'),
    
    body('content')
        .trim()
        .isLength({ min: 50 })
        .withMessage('Content must be at least 50 characters long'),
    
    body('author')
        .trim()
        .notEmpty()
        .withMessage('Author is required'),
    
    body('category')
        .isIn(['market-trends', 'buying-guide', 'selling-tips', 'investment', 'news', 'lifestyle'])
        .withMessage('Invalid category'),
    
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    
    body('seo.metaTitle')
        .optional()
        .isLength({ max: 60 })
        .withMessage('Meta title cannot exceed 60 characters'),
    
    body('seo.metaDescription')
        .optional()
        .isLength({ max: 160 })
        .withMessage('Meta description cannot exceed 160 characters'),
    
    handleValidationErrors
];

// Job validation rules
const validateJob = [
    body('title')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    
    body('description')
        .trim()
        .isLength({ min: 50, max: 5000 })
        .withMessage('Description must be between 50 and 5000 characters'),
    
    body('location.city')
        .trim()
        .notEmpty()
        .withMessage('City is required'),
    
    body('location.state')
        .trim()
        .notEmpty()
        .withMessage('State is required'),
    
    body('department')
        .isIn(['sales', 'marketing', 'operations', 'finance', 'hr', 'it', 'legal', 'administration'])
        .withMessage('Invalid department'),
    
    body('employmentType')
        .isIn(['full-time', 'part-time', 'contract', 'internship', 'temporary'])
        .withMessage('Invalid employment type'),
    
    body('experienceLevel')
        .isIn(['entry-level', 'mid-level', 'senior-level', 'executive'])
        .withMessage('Invalid experience level'),
    
    body('contactEmail')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid contact email')
        .normalizeEmail(),
      body('requirements')
        .optional()
        .isArray()
        .withMessage('Requirements must be an array'),
    
    body('responsibilities')
        .optional()
        .isArray()
        .withMessage('Responsibilities must be an array'),
    
    body('salary.min')
        .optional()
        .isNumeric()
        .withMessage('Minimum salary must be a number'),
    
    body('salary.max')
        .optional()
        .isNumeric()
        .withMessage('Maximum salary must be a number'),
    
    handleValidationErrors
];

// Query validation rules
const validateQueryParams = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    
    query('sort')
        .optional()
        .isIn(['createdAt', '-createdAt', 'title', '-title', 'price', '-price', 'views', '-views'])
        .withMessage('Invalid sort field'),
    
    handleValidationErrors
];

// ID validation rules
const validateId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid ID format'),
    
    handleValidationErrors
];

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validateUser,
    validateProject,
    validateBlog,
    validateJob,
    validateQueryParams,
    validateId,
    handleValidationErrors,
    parseFormDataJSON
};

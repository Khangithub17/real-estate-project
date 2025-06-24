const express = require('express');
const { 
    register, 
    login, 
    getProfile, 
    updateProfile, 
    changePassword, 
    refreshToken 
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { 
    validateUserRegistration, 
    validateUserLogin,
    handleValidationErrors
} = require('../middleware/validation');
const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

// Protected routes (require authentication)
router.use(authMiddleware); // Apply auth middleware to all routes below

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.post('/refresh-token', refreshToken);

module.exports = router;
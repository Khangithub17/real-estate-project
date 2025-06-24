const express = require('express');
const router = express.Router();
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserRole,
    getUserStats
} = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { 
    validateUser, 
    validateId, 
    validateQueryParams 
} = require('../middleware/validation');

// Admin routes (require admin authentication)
router.use(adminMiddleware); // Apply admin middleware to all routes

// Get all users with filtering, sorting, and pagination
router.get('/', validateQueryParams, getAllUsers);

// Get user by ID
router.get('/:id', validateId, getUserById);

// Create new user
router.post('/', validateUser, createUser);

// Update user
router.put('/:id', validateId, validateUser, updateUser);

// Update user role
router.patch('/:id/role', validateId, updateUserRole);

// Delete user
router.delete('/:id', validateId, deleteUser);

// Admin statistics
router.get('/admin/stats', getUserStats);

module.exports = router;

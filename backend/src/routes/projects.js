const express = require('express');
const router = express.Router();
const {
    createProject,
    getAllProjects,
    getFeaturedProjects,
    getProjectById,
    updateProject,
    deleteProject,
    getProjectStats
} = require('../controllers/projectController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const { 
    validateProject, 
    validateId, 
    validateQueryParams 
} = require('../middleware/validation');

// Public routes
router.get('/', validateQueryParams, getAllProjects);
router.get('/featured', getFeaturedProjects);
router.get('/:id', validateId, getProjectById);

// Admin routes (require admin authentication)
router.use(adminMiddleware); // Apply admin middleware to all routes below

router.post('/', 
    uploadMultiple('images', 10), 
    validateProject, 
    createProject
);

router.put('/:id', 
    validateId,
    uploadMultiple('images', 10), 
    validateProject, 
    updateProject
);

router.delete('/:id', validateId, deleteProject);

// Admin statistics
router.get('/admin/stats', getProjectStats);

module.exports = router;
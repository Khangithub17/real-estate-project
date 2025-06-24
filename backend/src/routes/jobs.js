const express = require('express');
const router = express.Router();
const {
    createJob,
    getJobs,
    getActiveJobs,
    getFeaturedJobs,
    getJobById,
    getJobBySlug,
    updateJob,
    deleteJob,
    applyToJob,
    getJobStats
} = require('../controllers/jobController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { 
    validateJob, 
    validateId, 
    validateQueryParams 
} = require('../middleware/validation');

// Public routes
router.get('/active', validateQueryParams, getActiveJobs);
router.get('/featured', getFeaturedJobs);
router.get('/slug/:slug', getJobBySlug);
router.get('/:id', validateId, getJobById);
router.post('/:id/apply', validateId, applyToJob);

// Admin routes (require admin authentication)
router.use(adminMiddleware); // Apply admin middleware to all routes below

router.get('/', validateQueryParams, getJobs);

router.post('/', validateJob, createJob);

router.put('/:id', validateId, validateJob, updateJob);

router.delete('/:id', validateId, deleteJob);

// Admin statistics
router.get('/admin/stats', getJobStats);

module.exports = router;
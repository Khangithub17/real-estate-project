const express = require('express');
const router = express.Router();
const {
    createBlog,
    getBlogs,
    getPublishedBlogs,
    getFeaturedBlogs,
    getBlogById,
    getBlogBySlug,
    updateBlog,
    deleteBlog,
    likeBlog,
    getBlogStats
} = require('../controllers/blogController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { 
    validateBlog, 
    validateId, 
    validateQueryParams 
} = require('../middleware/validation');

// Public routes
router.get('/published', validateQueryParams, getPublishedBlogs);
router.get('/featured', getFeaturedBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/:id', validateId, getBlogById);
router.post('/:id/like', validateId, likeBlog);

// Admin routes (require admin authentication)
router.use(adminMiddleware); // Apply admin middleware to all routes below

router.get('/', validateQueryParams, getBlogs);

router.post('/', 
    uploadSingle('featuredImage'), 
    validateBlog, 
    createBlog
);

router.put('/:id', 
    validateId,
    uploadSingle('featuredImage'), 
    validateBlog, 
    updateBlog
);

router.delete('/:id', validateId, deleteBlog);

// Admin statistics
router.get('/admin/stats', getBlogStats);

module.exports = router;
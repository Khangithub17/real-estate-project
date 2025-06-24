const Blog = require('../models/Blog');
const { deleteFile } = require('../middleware/upload');
const path = require('path');

// Helper function to build blog query filters
const buildBlogQuery = (queryParams) => {
    const {
        search,
        category,
        status,
        featured,
        author,
        tags
    } = queryParams;

    let query = {};

    // Text search
    if (search) {
        query.$text = { $search: search };
    }

    // Category filter
    if (category) {
        query.category = category;
    }

    // Status filter
    if (status) {
        query.status = status;
    }

    // Featured filter
    if (featured !== undefined) {
        query.featured = featured === 'true';
    }

    // Author filter
    if (author) {
        query.author = new RegExp(author, 'i');
    }

    // Tags filter
    if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        query.tags = { $in: tagArray };
    }

    return query;
};

// Create a new blog post
exports.createBlog = async (req, res) => {
    try {
        const blogData = { ...req.body };
        
        // Parse JSON fields from FormData
        if (blogData.tags && typeof blogData.tags === 'string') {
            try {
                blogData.tags = JSON.parse(blogData.tags);
            } catch (e) {
                // If parsing fails, treat as empty array
                blogData.tags = [];
            }
        }
        
        // Handle uploaded featured image
        if (req.file) {
            blogData.featuredImage = `/uploads/blogs/${req.file.filename}`;
        }

        const blog = new Blog(blogData);
        await blog.save();

        // Emit real-time update
        if (req.io) {
            req.io.emit('blog_created', {
                blog,
                message: 'New blog post created'
            });
            // Also emit to specific blogs room
            req.io.to('blogs').emit('blog_created', {
                blog,
                message: 'New blog post created'
            });
            console.log('🚀 Emitted blog_created event');
        }

        res.status(201).json({
            success: true,
            message: 'Blog post created successfully',
            data: { blog }
        });
    } catch (error) {
        console.error('Create blog error:', error);
        
        // Clean up uploaded file if blog creation fails
        if (req.file) {
            deleteFile(req.file.path).catch(console.error);
        }

        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating blog post',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get all blog posts with filtering, sorting, and pagination
exports.getBlogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt'
        } = req.query;

        const query = buildBlogQuery(req.query);
        
        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query with pagination and sorting
        const blogs = await Blog.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .lean();

        // Get total count for pagination
        const total = await Blog.countDocuments(query);
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            success: true,
            data: {
                blogs,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalBlogs: total,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            }
        });
    } catch (error) {
        console.error('Get blogs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog posts',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get published blogs for public view
exports.getPublishedBlogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt'
        } = req.query;

        const queryParams = { ...req.query, status: 'published' };
        const query = buildBlogQuery(queryParams);
        
        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query with pagination and sorting
        const blogs = await Blog.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .select('-seo') // Exclude SEO data from public view
            .lean();

        // Get total count for pagination
        const total = await Blog.countDocuments(query);
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            success: true,
            data: {
                blogs,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalBlogs: total,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            }
        });
    } catch (error) {
        console.error('Get published blogs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching published blog posts',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get featured blogs
exports.getFeaturedBlogs = async (req, res) => {
    try {
        const { limit = 3 } = req.query;
        
        const blogs = await Blog.find({ 
            featured: true, 
            status: 'published' 
        })
        .sort('-createdAt')
        .limit(parseInt(limit))
        .select('-seo')
        .lean();

        res.status(200).json({
            success: true,
            data: { blogs }
        });
    } catch (error) {
        console.error('Get featured blogs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured blog posts',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get a single blog post by ID
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        // Increment view count
        blog.views += 1;
        await blog.save();

        res.status(200).json({
            success: true,
            data: { blog }
        });
    } catch (error) {
        console.error('Get blog error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid blog ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error fetching blog post',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get a single blog post by slug
exports.getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ 
            slug: req.params.slug,
            status: 'published'
        });
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        // Increment view count
        blog.views += 1;
        await blog.save();

        res.status(200).json({
            success: true,
            data: { blog }
        });
    } catch (error) {
        console.error('Get blog by slug error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog post',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update a blog post by ID
exports.updateBlog = async (req, res) => {
    try {
        const blogData = { ...req.body };
        
        // Parse JSON fields from FormData
        if (blogData.tags && typeof blogData.tags === 'string') {
            try {
                blogData.tags = JSON.parse(blogData.tags);
            } catch (e) {
                // If parsing fails, treat as empty array
                blogData.tags = [];
            }
        }
        
        // Find existing blog
        const existingBlog = await Blog.findById(req.params.id);
        if (!existingBlog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        // Handle uploaded featured image
        if (req.file) {
            // Delete old image
            if (existingBlog.featuredImage) {
                const fullPath = path.join(__dirname, '../../', existingBlog.featuredImage);
                deleteFile(fullPath).catch(console.error);
            }
            
            blogData.featuredImage = `/uploads/blogs/${req.file.filename}`;
        }

        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            blogData,
            { 
                new: true, 
                runValidators: true 
            }
        );

        // Emit real-time update
        if (req.io) {
            req.io.emit('blog_updated', {
                blog,
                message: 'Blog post updated'
            });
            // Also emit to specific blogs room
            req.io.to('blogs').emit('blog_updated', {
                blog,
                message: 'Blog post updated'
            });
            console.log('🔄 Emitted blog_updated event');
        }

        res.status(200).json({
            success: true,
            message: 'Blog post updated successfully',
            data: { blog }
        });
    } catch (error) {
        console.error('Update blog error:', error);
        
        // Clean up uploaded file if update fails
        if (req.file) {
            deleteFile(req.file.path).catch(console.error);
        }

        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid blog ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating blog post',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Delete a blog post by ID
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        // Delete associated featured image
        if (blog.featuredImage) {
            const fullPath = path.join(__dirname, '../../', blog.featuredImage);
            deleteFile(fullPath).catch(console.error);
        }

        await Blog.findByIdAndDelete(req.params.id);

        // Emit real-time update
        if (req.io) {
            req.io.emit('blog_deleted', {
                blogId: req.params.id,
                message: 'Blog post deleted'
            });
            // Also emit to specific blogs room
            req.io.to('blogs').emit('blog_deleted', {
                blogId: req.params.id,
                message: 'Blog post deleted'
            });
            console.log('🗑️ Emitted blog_deleted event');
        }

        res.status(200).json({
            success: true,
            message: 'Blog post deleted successfully'
        });
    } catch (error) {
        console.error('Delete blog error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid blog ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error deleting blog post',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Like a blog post
exports.likeBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        blog.likes += 1;
        await blog.save();

        res.status(200).json({
            success: true,
            message: 'Blog post liked',
            data: { likes: blog.likes }
        });
    } catch (error) {
        console.error('Like blog error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid blog ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error liking blog post',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get blog statistics for admin dashboard
exports.getBlogStats = async (req, res) => {
    try {
        const stats = await Blog.aggregate([
            {
                $group: {
                    _id: null,
                    totalBlogs: { $sum: 1 },
                    publishedBlogs: {
                        $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
                    },
                    draftBlogs: {
                        $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
                    },
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: '$likes' },
                    averageReadTime: { $avg: '$readTime' }
                }
            }
        ]);

        const categoryStats = await Blog.aggregate([
            { $match: { status: 'published' } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalViews: { $sum: '$views' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: stats[0] || {
                    totalBlogs: 0,
                    publishedBlogs: 0,
                    draftBlogs: 0,
                    totalViews: 0,
                    totalLikes: 0,
                    averageReadTime: 0
                },
                categories: categoryStats
            }
        });
    } catch (error) {
        console.error('Get blog stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
const Project = require('../models/Project');
const { deleteFile } = require('../middleware/upload');
const path = require('path');

// Helper function to build query filters
const buildProjectQuery = (queryParams) => {
    const {
        search,
        propertyType,
        status,
        minPrice,
        maxPrice,
        city,
        state,
        bedrooms,
        bathrooms,
        featured
    } = queryParams;

    let query = {};

    // Text search
    if (search) {
        query.$text = { $search: search };
    }

    // Property type filter
    if (propertyType) {
        query.propertyType = propertyType;
    }

    // Status filter
    if (status) {
        query.status = status;
    }

    // Price range filter
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Location filters
    if (city) {
        query['location.city'] = new RegExp(city, 'i');
    }
    if (state) {
        query['location.state'] = new RegExp(state, 'i');
    }

    // Specification filters
    if (bedrooms) {
        query['specifications.bedrooms'] = Number(bedrooms);
    }
    if (bathrooms) {
        query['specifications.bathrooms'] = Number(bathrooms);
    }

    // Featured filter
    if (featured !== undefined) {
        query.featured = featured === 'true';
    }

    return query;
};

// Create a new project
exports.createProject = async (req, res) => {
    try {
        const projectData = { ...req.body };
        
        // Handle uploaded images
        if (req.files && req.files.length > 0) {
            projectData.images = req.files.map(file => `/uploads/projects/${file.filename}`);
        }

        // Process features array from FormData
        if (projectData.features) {
            if (typeof projectData.features === 'string') {
                try {
                    projectData.features = JSON.parse(projectData.features);
                } catch (e) {
                    // If it's not JSON, treat as single feature
                    projectData.features = [projectData.features];
                }
            } else if (Array.isArray(projectData.features)) {
                // Already an array, keep as is
                projectData.features = projectData.features;
            } else {
                // Convert object with numeric keys to array
                const featuresArray = [];
                Object.keys(projectData.features).forEach(key => {
                    if (!isNaN(key)) {
                        featuresArray[parseInt(key)] = projectData.features[key];
                    }
                });
                projectData.features = featuresArray.filter(f => f); // Remove empty elements
            }
        } else {
            projectData.features = [];
        }

        const project = new Project(projectData);
        await project.save();

        // Emit real-time update
        if (req.io) {
            req.io.emit('project_created', {
                project,
                message: 'New project added'
            });
            // Also emit to specific projects room
            req.io.to('projects').emit('project_created', {
                project,
                message: 'New project added'
            });
            console.log('🚀 Emitted project_created event');
        }

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: { project }
        });
    } catch (error) {
        console.error('Create project error:', error);
        
        // Clean up uploaded files if project creation fails
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                deleteFile(file.path).catch(console.error);
            });
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
            message: 'Error creating project',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get all projects with filtering, sorting, and pagination
exports.getAllProjects = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt'
        } = req.query;

        const query = buildProjectQuery(req.query);
        
        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query with pagination and sorting
        const projects = await Project.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .lean();

        // Get total count for pagination
        const total = await Project.countDocuments(query);
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            success: true,
            data: {
                projects,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalProjects: total,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            }
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching projects',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get featured projects
exports.getFeaturedProjects = async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        
        const projects = await Project.find({ 
            featured: true, 
            status: 'available' 
        })
        .sort('-createdAt')
        .limit(parseInt(limit))
        .lean();

        res.status(200).json({
            success: true,
            data: { projects }
        });
    } catch (error) {
        console.error('Get featured projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured projects',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get a single project by ID
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Increment view count
        project.views += 1;
        await project.save();

        res.status(200).json({
            success: true,
            data: { project }
        });
    } catch (error) {
        console.error('Get project error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid project ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error fetching project',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update a project by ID
exports.updateProject = async (req, res) => {
    try {
        const projectData = { ...req.body };
        
        // Find existing project
        const existingProject = await Project.findById(req.params.id);
        if (!existingProject) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Handle uploaded images
        if (req.files && req.files.length > 0) {
            // Delete old images
            if (existingProject.images && existingProject.images.length > 0) {
                existingProject.images.forEach(imagePath => {
                    const fullPath = path.join(__dirname, '../../', imagePath);
                    deleteFile(fullPath).catch(console.error);
                });
            }
            
            projectData.images = req.files.map(file => `/uploads/projects/${file.filename}`);
        }

        // Process features array from FormData
        if (projectData.features) {
            if (typeof projectData.features === 'string') {
                try {
                    projectData.features = JSON.parse(projectData.features);
                } catch (e) {
                    // If it's not JSON, treat as single feature
                    projectData.features = [projectData.features];
                }
            } else if (Array.isArray(projectData.features)) {
                // Already an array, keep as is
                projectData.features = projectData.features;
            } else {
                // Convert object with numeric keys to array
                const featuresArray = [];
                Object.keys(projectData.features).forEach(key => {
                    if (!isNaN(key)) {
                        featuresArray[parseInt(key)] = projectData.features[key];
                    }
                });
                projectData.features = featuresArray.filter(f => f); // Remove empty elements
            }
        } else {
            projectData.features = [];
        }

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            projectData,
            { 
                new: true, 
                runValidators: true 
            }
        );

        // Emit real-time update
        if (req.io) {
            req.io.emit('project_updated', {
                project,
                message: 'Project updated'
            });
            // Also emit to specific projects room
            req.io.to('projects').emit('project_updated', {
                project,
                message: 'Project updated'
            });
            console.log('🔄 Emitted project_updated event');
        }

        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: { project }
        });
    } catch (error) {
        console.error('Update project error:', error);
        
        // Clean up uploaded files if update fails
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                deleteFile(file.path).catch(console.error);
            });
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
                message: 'Invalid project ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating project',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Delete a project by ID
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Delete associated images
        if (project.images && project.images.length > 0) {
            project.images.forEach(imagePath => {
                const fullPath = path.join(__dirname, '../../', imagePath);
                deleteFile(fullPath).catch(console.error);
            });
        }

        await Project.findByIdAndDelete(req.params.id);

        // Emit real-time update
        if (req.io) {
            req.io.emit('project_deleted', {
                projectId: req.params.id,
                message: 'Project deleted'
            });
            // Also emit to specific projects room
            req.io.to('projects').emit('project_deleted', {
                projectId: req.params.id,
                message: 'Project deleted'
            });
            console.log('🗑️ Emitted project_deleted event');
        }

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Delete project error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid project ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error deleting project',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get project statistics for admin dashboard
exports.getProjectStats = async (req, res) => {
    try {
        const stats = await Project.aggregate([
            {
                $group: {
                    _id: null,
                    totalProjects: { $sum: 1 },
                    availableProjects: {
                        $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
                    },
                    soldProjects: {
                        $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] }
                    },
                    pendingProjects: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    averagePrice: { $avg: '$price' },
                    totalViews: { $sum: '$views' }
                }
            }
        ]);

        const propertyTypeStats = await Project.aggregate([
            {
                $group: {
                    _id: '$propertyType',
                    count: { $sum: 1 },
                    averagePrice: { $avg: '$price' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: stats[0] || {
                    totalProjects: 0,
                    availableProjects: 0,
                    soldProjects: 0,
                    pendingProjects: 0,
                    averagePrice: 0,
                    totalViews: 0
                },
                propertyTypes: propertyTypeStats
            }
        });
    } catch (error) {
        console.error('Get project stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching project statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
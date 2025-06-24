const Job = require('../models/Job');

// Helper function to build job query filters
const buildJobQuery = (queryParams) => {
    const {
        search,
        department,
        employmentType,
        experienceLevel,
        status,
        location,
        remote,
        featured
    } = queryParams;

    let query = {};

    // Text search
    if (search) {
        query.$text = { $search: search };
    }

    // Department filter
    if (department) {
        query.department = department;
    }

    // Employment type filter
    if (employmentType) {
        query.employmentType = employmentType;
    }

    // Experience level filter
    if (experienceLevel) {
        query.experienceLevel = experienceLevel;
    }

    // Status filter
    if (status) {
        query.status = status;
    }

    // Location filters
    if (location) {
        query.$or = [
            { 'location.city': new RegExp(location, 'i') },
            { 'location.state': new RegExp(location, 'i') }
        ];
    }

    // Remote filter
    if (remote !== undefined) {
        query['location.remote'] = remote === 'true';
    }

    // Featured filter
    if (featured !== undefined) {
        query.featured = featured === 'true';
    }

    return query;
};

// Create a new job posting
exports.createJob = async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();

        // Emit real-time update
        if (req.io) {
            req.io.emit('job_created', {
                job,
                message: 'New job posting created'
            });
            // Also emit to specific jobs room
            req.io.to('jobs').emit('job_created', {
                job,
                message: 'New job posting created'
            });
            console.log('🚀 Emitted job_created event');
        }

        res.status(201).json({
            success: true,
            message: 'Job posting created successfully',
            data: { job }
        });
    } catch (error) {
        console.error('Create job error:', error);

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
            message: 'Error creating job posting',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get all job postings with filtering, sorting, and pagination
exports.getJobs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt'
        } = req.query;

        const query = buildJobQuery(req.query);
        
        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query with pagination and sorting
        const jobs = await Job.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .lean();

        // Get total count for pagination
        const total = await Job.countDocuments(query);
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            success: true,
            data: {
                jobs,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalJobs: total,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            }
        });
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching job postings',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get active jobs for public view
exports.getActiveJobs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt'
        } = req.query;

        const queryParams = { ...req.query, status: 'active' };
        const query = buildJobQuery(queryParams);
        
        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query with pagination and sorting
        const jobs = await Job.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .lean();

        // Get total count for pagination
        const total = await Job.countDocuments(query);
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            success: true,
            data: {
                jobs,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalJobs: total,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            }
        });
    } catch (error) {
        console.error('Get active jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching active job postings',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get featured jobs
exports.getFeaturedJobs = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        
        const jobs = await Job.find({ 
            featured: true, 
            status: 'active' 
        })
        .sort('-createdAt')
        .limit(parseInt(limit))
        .lean();

        res.status(200).json({
            success: true,
            data: { jobs }
        });
    } catch (error) {
        console.error('Get featured jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured job postings',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get a single job posting by ID
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job posting not found'
            });
        }

        // Increment view count
        job.views += 1;
        await job.save();

        res.status(200).json({
            success: true,
            data: { job }
        });
    } catch (error) {
        console.error('Get job error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error fetching job posting',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get a single job posting by slug
exports.getJobBySlug = async (req, res) => {
    try {
        const job = await Job.findOne({ 
            slug: req.params.slug,
            status: 'active'
        });
        
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job posting not found'
            });
        }

        // Increment view count
        job.views += 1;
        await job.save();

        res.status(200).json({
            success: true,
            data: { job }
        });
    } catch (error) {
        console.error('Get job by slug error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching job posting',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update a job posting
exports.updateJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            { 
                new: true, 
                runValidators: true 
            }
        );

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job posting not found'
            });
        }

        // Emit real-time update
        if (req.io) {
            req.io.emit('job_updated', {
                job,
                message: 'Job posting updated'
            });
            // Also emit to specific jobs room
            req.io.to('jobs').emit('job_updated', {
                job,
                message: 'Job posting updated'
            });
            console.log('🔄 Emitted job_updated event');
        }

        res.status(200).json({
            success: true,
            message: 'Job posting updated successfully',
            data: { job }
        });
    } catch (error) {
        console.error('Update job error:', error);

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
                message: 'Invalid job ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating job posting',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Delete a job posting
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job posting not found'
            });
        }

        // Emit real-time update
        if (req.io) {
            req.io.emit('job_deleted', {
                jobId: req.params.id,
                message: 'Job posting deleted'
            });
            // Also emit to specific jobs room
            req.io.to('jobs').emit('job_deleted', {
                jobId: req.params.id,
                message: 'Job posting deleted'
            });
            console.log('🗑️ Emitted job_deleted event');
        }

        res.status(200).json({
            success: true,
            message: 'Job posting deleted successfully'
        });
    } catch (error) {
        console.error('Delete job error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error deleting job posting',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Apply to a job (increment application count)
exports.applyToJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job posting not found'
            });
        }

        if (job.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'This job posting is no longer accepting applications'
            });
        }

        job.applications += 1;
        await job.save();

        res.status(200).json({
            success: true,
            message: 'Application submitted successfully',
            data: { applications: job.applications }
        });
    } catch (error) {
        console.error('Apply to job error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error submitting application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get job statistics for admin dashboard
exports.getJobStats = async (req, res) => {
    try {
        const stats = await Job.aggregate([
            {
                $group: {
                    _id: null,
                    totalJobs: { $sum: 1 },
                    activeJobs: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                    pausedJobs: {
                        $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] }
                    },
                    closedJobs: {
                        $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
                    },
                    totalViews: { $sum: '$views' },
                    totalApplications: { $sum: '$applications' }
                }
            }
        ]);

        const departmentStats = await Job.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 },
                    totalApplications: { $sum: '$applications' }
                }
            }
        ]);

        const employmentTypeStats = await Job.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: '$employmentType',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: stats[0] || {
                    totalJobs: 0,
                    activeJobs: 0,
                    pausedJobs: 0,
                    closedJobs: 0,
                    totalViews: 0,
                    totalApplications: 0
                },
                departments: departmentStats,
                employmentTypes: employmentTypeStats
            }
        });
    } catch (error) {
        console.error('Get job stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching job statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
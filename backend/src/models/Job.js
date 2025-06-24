const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Job description is required'],
        trim: true,
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    location: {
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        remote: {
            type: Boolean,
            default: false
        }
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: {
            values: ['sales', 'marketing', 'operations', 'finance', 'hr', 'it', 'legal', 'administration'],
            message: 'Department must be one of: sales, marketing, operations, finance, hr, it, legal, administration'
        }
    },
    employmentType: {
        type: String,
        required: [true, 'Employment type is required'],
        enum: {
            values: ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
            message: 'Employment type must be full-time, part-time, contract, internship or temporary'
        }
    },
    experienceLevel: {
        type: String,
        required: [true, 'Experience level is required'],
        enum: {
            values: ['entry-level', 'mid-level', 'senior-level', 'executive'],
            message: 'Experience level must be entry-level, mid-level, senior-level or executive'
        }
    },
    salary: {
        min: {
            type: Number,
            min: [0, 'Minimum salary cannot be negative']
        },
        max: {
            type: Number,
            min: [0, 'Maximum salary cannot be negative']
        },
        currency: {
            type: String,
            default: 'USD',
            uppercase: true
        },
        period: {
            type: String,
            enum: ['hourly', 'monthly', 'yearly'],
            default: 'yearly'
        }
    },
    requirements: [{
        type: String,
        trim: true
    }],
    responsibilities: [{
        type: String,
        trim: true
    }],
    benefits: [{
        type: String,
        trim: true
    }],
    skills: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    status: {
        type: String,
        enum: {
            values: ['active', 'paused', 'closed', 'draft'],
            message: 'Status must be active, paused, closed or draft'
        },
        default: 'active'
    },
    featured: {
        type: Boolean,
        default: false
    },
    applicationDeadline: {
        type: Date
    },
    contactEmail: {
        type: String,
        required: [true, 'Contact email is required'],
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    views: {
        type: Number,
        default: 0
    },
    applications: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create slug from title before saving
jobSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});

// Virtual for formatted salary range
jobSchema.virtual('salaryRange').get(function() {
    if (this.salary && this.salary.min && this.salary.max) {
        return `${this.salary.currency} ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()} per ${this.salary.period}`;
    }
    return 'Salary not specified';
});

// Index for search optimization
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ department: 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ featured: -1, createdAt: -1 });
// Remove duplicate slug index - it's already unique in schema

module.exports = mongoose.model('Job', jobSchema);
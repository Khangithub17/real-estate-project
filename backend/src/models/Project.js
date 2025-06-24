const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Project description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    images: [{
        type: String
    }],
    location: {
        address: {
            type: String,
            required: [true, 'Address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        zipCode: {
            type: String,
            required: [true, 'Zip code is required']
        },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    propertyType: {
        type: String,
        required: [true, 'Property type is required'],
        enum: {
            values: ['residential', 'commercial', 'industrial', 'land'],
            message: 'Property type must be residential, commercial, industrial or land'
        }
    },
    status: {
        type: String,
        enum: {
            values: ['available', 'sold', 'pending', 'under-construction'],
            message: 'Status must be available, sold, pending or under-construction'
        },
        default: 'available'
    },
    features: [{
        type: String,
        trim: true
    }],
    specifications: {
        area: {
            type: Number,
            required: [true, 'Area is required'],
            min: [0, 'Area cannot be negative']
        },
        bedrooms: {
            type: Number,
            min: [0, 'Bedrooms cannot be negative']
        },
        bathrooms: {
            type: Number,
            min: [0, 'Bathrooms cannot be negative']
        },
        parking: {
            type: Number,
            min: [0, 'Parking spaces cannot be negative'],
            default: 0
        },
        yearBuilt: {
            type: Number,
            min: [1800, 'Year built seems too old'],
            max: [new Date().getFullYear() + 5, 'Year built cannot be too far in the future']
        }
    },
    amenities: [{
        type: String,
        trim: true
    }],
    featured: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    agent: {
        name: String,
        email: String,
        phone: String
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for price per square foot
projectSchema.virtual('pricePerSqFt').get(function() {
    if (this.specifications && this.specifications.area) {
        return Math.round(this.price / this.specifications.area);
    }
    return null;
});

// Index for search optimization
projectSchema.index({ title: 'text', description: 'text', 'location.city': 'text' });
projectSchema.index({ price: 1 });
projectSchema.index({ propertyType: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ featured: -1, createdAt: -1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
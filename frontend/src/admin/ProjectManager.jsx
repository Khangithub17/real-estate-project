import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaImage, 
  FaMapMarkerAlt,
  FaDollarSign,
  FaHome,
  FaBed,
  FaBath,
  FaRuler,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { useSocket } from '../contexts/SocketContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const { socket, on, off } = useSocket();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    propertyType: 'residential',
    specifications: {
      area: '',
      bedrooms: '',
      bathrooms: ''
    },
    status: 'available',
    features: [],
    images: []
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [newFeature, setNewFeature] = useState('');

  const projectTypes = ['residential', 'commercial', 'industrial', 'land'];
  const projectStatuses = ['available', 'sold', 'rented', 'under-construction'];

  useEffect(() => {
    fetchProjects();

    // Set up Socket.IO listeners for real-time updates
    if (socket) {
      on('project_created', (data) => {
        setProjects(prev => [data.project, ...prev]);
        toast.success(data.message || 'Project created successfully');
      });

      on('project_updated', (data) => {
        setProjects(prev => prev.map(project => 
          project._id === data.project._id ? data.project : project
        ));
        toast.info(data.message || 'Project updated');
      });

      on('project_deleted', (data) => {
        setProjects(prev => prev.filter(project => project._id !== data.projectId));
        toast.info(data.message || 'Project deleted');
      });
    }

    // Cleanup listeners on unmount
    return () => {
      if (socket) {
        off('project_created');
        off('project_updated');
        off('project_deleted');
      }
    };
  }, [socket, on, off]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      console.log('Projects API response:', response.data);
      
      // Handle backend response structure
      let projectData = [];
      if (response.data?.success) {
        // Backend returns: { success: true, data: { projects: [...], pagination: {...} } }
        projectData = response.data.data?.projects || [];
      } else if (Array.isArray(response.data)) {
        // Direct array response
        projectData = response.data;
      } else if (response.data?.projects) {
        // Alternative structure
        projectData = response.data.projects;
      } else {
        // Fallback
        projectData = [];
      }
      
      // Always ensure projects is an array
      setProjects(Array.isArray(projectData) ? projectData : []);
    } catch (error) {
      toast.error('Failed to fetch projects');
      console.error('Error fetching projects:', error);
      setProjects([]); // Ensure projects is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      
      // Append basic fields
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('propertyType', formData.propertyType);
      submitData.append('status', formData.status);
      
      // Append location fields
      submitData.append('location[address]', formData.location.address);
      submitData.append('location[city]', formData.location.city);
      submitData.append('location[state]', formData.location.state);
      submitData.append('location[zipCode]', formData.location.zipCode);
      
      // Append specifications
      submitData.append('specifications[area]', formData.specifications.area);
      submitData.append('specifications[bedrooms]', formData.specifications.bedrooms);
      submitData.append('specifications[bathrooms]', formData.specifications.bathrooms);
      
      // Append features array (only if not empty)
      if (formData.features && formData.features.length > 0) {
        formData.features.forEach((feature, index) => {
          submitData.append(`features[${index}]`, feature);
        });
      }

      // Append image files
      imageFiles.forEach(file => {
        submitData.append('images', file);
      });

      let response;
      if (editingProject) {
        response = await api.put(`/projects/${editingProject._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Project updated successfully!');
      } else {
        response = await api.post('/projects', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Project created successfully!');
      }

      if (response.data.success) {
        // fetchProjects(); // Remove this since real-time updates will handle it
        resetForm();
        setShowModal(false);
      }
    } catch (error) {
      toast.error(editingProject ? 'Failed to update project' : 'Failed to create project');
      console.error('Error saving project:', error);
      
      // Log detailed error for debugging
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
        error.response.data.errors.forEach(err => {
          toast.error(`${err.param}: ${err.msg}`);
        });
      }
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      price: project.price || '',
      location: {
        address: project.location?.address || '',
        city: project.location?.city || '',
        state: project.location?.state || '',
        zipCode: project.location?.zipCode || ''
      },
      propertyType: project.propertyType || 'residential',
      specifications: {
        area: project.specifications?.area || '',
        bedrooms: project.specifications?.bedrooms || '',
        bathrooms: project.specifications?.bathrooms || ''
      },
      status: project.status || 'available',
      features: project.features || [],
      images: project.images || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        toast.success('Project deleted successfully!');
        // fetchProjects(); // Remove this since real-time updates will handle it
      } catch (error) {
        toast.error('Failed to delete project');
        console.error('Error deleting project:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      location: {
        address: '',
        city: '',
        state: '',
        zipCode: ''
      },
      propertyType: 'residential',
      specifications: {
        area: '',
        bedrooms: '',
        bathrooms: ''
      },
      status: 'available',
      features: [],
      images: []
    });
    setImageFiles([]);
    setEditingProject(null);
    setNewFeature('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested object updates
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Management</h1>
          <p className="text-gray-600">Manage your real estate projects and properties</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
        >
          <FaPlus />
          <span>Add New Project</span>
        </motion.button>
      </motion.div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Project Image */}
              <div className="relative h-48 bg-gray-200">
                {project.images && project.images.length > 0 ? (
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaImage className="text-4xl text-gray-400" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    project.status === 'available' ? 'bg-green-100 text-green-800' :
                    project.status === 'sold' ? 'bg-red-100 text-red-800' :
                    project.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>

              {/* Project Info */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                
                <div className="space-y-2 mb-4">
                  {project.location && (
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="mr-2 text-red-500" />
                      <span className="text-sm">
                        {project.location.address && project.location.city 
                          ? `${project.location.address}, ${project.location.city}, ${project.location.state} ${project.location.zipCode}`
                          : project.location
                        }
                      </span>
                    </div>
                  )}
                  {project.price && (
                    <div className="flex items-center text-gray-600">
                      <FaDollarSign className="mr-2 text-green-500" />
                      <span className="text-sm font-semibold">${project.price.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Project Details */}
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  {project.bedrooms && (
                    <div className="flex items-center">
                      <FaBed className="mr-1" />
                      <span>{project.bedrooms}</span>
                    </div>
                  )}
                  {project.bathrooms && (
                    <div className="flex items-center">
                      <FaBath className="mr-1" />
                      <span>{project.bathrooms}</span>
                    </div>
                  )}
                  {project.area && (
                    <div className="flex items-center">
                      <FaRuler className="mr-1" />
                      <span>{project.area} sq ft</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-lg transition-colors"
                  >
                    <FaEdit />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg transition-colors"
                  >
                    <FaTrash />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {projects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FaHome className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Projects Yet</h3>
          <p className="text-gray-500 mb-6">Create your first project to get started</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Add First Project
          </button>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProject ? 'Edit Project' : 'Add New Project'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter project title"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Address *
                        </label>
                        <input
                          type="text"
                          name="location.address"
                          value={formData.location.address}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="location.city"
                          value={formData.location.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter city"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          name="location.state"
                          value={formData.location.state}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter state"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Zip Code *
                        </label>
                        <input
                          type="text"
                          name="location.zipCode"
                          value={formData.location.zipCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter zip code"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter price"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Property Type *
                        </label>
                        <select
                          name="propertyType"
                          value={formData.propertyType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {projectTypes.map(type => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Status *
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {projectStatuses.map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Bedrooms
                        </label>
                        <input
                          type="number"
                          name="specifications.bedrooms"
                          value={formData.specifications.bedrooms}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Bathrooms
                        </label>
                        <input
                          type="number"
                          name="specifications.bathrooms"
                          value={formData.specifications.bathrooms}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Area (sq ft) *
                        </label>
                        <input
                          type="number"
                          name="specifications.area"
                          value={formData.specifications.area}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Images
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Features */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Features
                      </label>
                      <div className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Add feature"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        />
                        <button
                          type="button"
                          onClick={addFeature}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.features.map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {feature}
                            <button
                              type="button"
                              onClick={() => removeFeature(feature)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter project description"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <FaSave />
                    <span>{editingProject ? 'Update Project' : 'Create Project'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectManager;
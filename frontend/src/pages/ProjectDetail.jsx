import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import { 
  HiLocationMarker, 
  HiCurrencyDollar, 
  HiHome, 
  HiCalendar,
  HiStar,
  HiArrowLeft,
  HiShare,
  HiHeart,
  HiPhone,
  HiMail,
  HiCheckCircle,
  HiArrowRight
} from 'react-icons/hi';
import { FaBed, FaBath, FaRuler, FaCar, FaWifi, FaSwimmingPool } from 'react-icons/fa';
import { api } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.project);
      
      // Fetch related projects
      if (response.data.project.type) {
        const relatedResponse = await api.get(`/projects?type=${response.data.project.type}&limit=4`);
        setRelatedProjects(relatedResponse.data.projects?.filter(p => p._id !== id) || []);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      if (error.response?.status === 404) {
        navigate('/projects');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    
    try {
      await api.post('/contact', {
        ...contactForm,
        subject: `Inquiry about ${project.title}`,
        projectId: project._id
      });
      
      toast.success('Your inquiry has been sent successfully!');
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error('Failed to send inquiry. Please try again.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: project.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!project) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Project Not Found
          </h2>
          <Link
            to="/projects"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <HiArrowLeft className="mr-2 w-4 h-4" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'features', name: 'Features' },
    { id: 'location', name: 'Location' },
    { id: 'gallery', name: 'Gallery' },
    { id: 'contact', name: 'Contact' }
  ];

  const amenities = [
    { icon: FaWifi, name: 'High-Speed Internet' },
    { icon: FaSwimmingPool, name: 'Swimming Pool' },
    { icon: FaCar, name: 'Parking Space' },
    { icon: HiCheckCircle, name: '24/7 Security' },
    { icon: HiCheckCircle, name: 'Gym & Fitness' },
    { icon: HiCheckCircle, name: 'Playground' }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <HiArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {project.title}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300 mt-2">                  <div className="flex items-center space-x-1">
                    <HiLocationMarker className="w-4 h-4" />
                    <span>
                      {typeof project.location === 'string' 
                        ? project.location 
                        : project.location?.city && project.location?.state
                        ? `${project.location.city}, ${project.location.state}`
                        : project.location?.address || 'Location not specified'
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <HiCalendar className="w-4 h-4" />
                    <span>Listed {new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <HiShare className="w-5 h-5" />
              </button>
              <button
                onClick={toggleWishlist}
                className={`p-3 rounded-lg transition-colors ${
                  isWishlisted 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <HiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {project.price ? `$${project.price.toLocaleString()}` : 'Price on Request'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {project.type} • {project.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="bg-black">
        <div className="max-w-7xl mx-auto">
          <Swiper
            modules={[Navigation, Pagination, Thumbs, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            thumbs={{ swiper: thumbsSwiper }}
            autoplay={{ delay: 5000 }}
            className="h-96 md:h-[500px]"
          >
            {(project.images || []).map((image, index) => (
              <SwiperSlide key={index}>
                <img
                  src={image}
                  alt={`${project.title} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Thumbnails */}
          {project.images && project.images.length > 1 && (
            <Swiper
              modules={[Thumbs]}
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView={6}
              watchSlidesProgress
              className="h-20 mt-2"
            >
              {project.images.map((image, index) => (
                <SwiperSlide key={index} className="cursor-pointer">
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Project Details */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
                <nav className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Project Description
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {project.bedrooms && (
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <FaBed className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {project.bedrooms}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Bedrooms</div>
                        </div>
                      )}
                      {project.bathrooms && (
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <FaBath className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {project.bathrooms}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Bathrooms</div>
                        </div>
                      )}
                      {project.area && (
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <FaRuler className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {project.area}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Sq Ft</div>
                        </div>
                      )}
                      {project.parking && (
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <FaCar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {project.parking}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Parking</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Property Features
                      </h3>
                      {project.features && project.features.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {project.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <HiCheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No specific features listed.</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Amenities
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {amenities.map((amenity, index) => {
                          const Icon = amenity.icon;
                          return (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <Icon className="w-6 h-6 text-blue-600" />
                              <span className="text-gray-700 dark:text-gray-300">{amenity.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'location' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Location Details
                      </h3>                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 mb-6">
                        <HiLocationMarker className="w-5 h-5" />
                        <span className="text-lg">
                          {typeof project.location === 'string' 
                            ? project.location 
                            : project.location?.address && project.location?.city && project.location?.state
                            ? `${project.location.address}, ${project.location.city}, ${project.location.state} ${project.location.zipCode || ''}`
                            : project.location?.city && project.location?.state
                            ? `${project.location.city}, ${project.location.state}`
                            : 'Location not specified'
                          }
                        </span>
                      </div>
                    </div>
                    
                    {/* Map placeholder */}
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
                      <div className="text-center">
                        <HiLocationMarker className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400">Interactive map would be displayed here</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'gallery' && (
                  <div className="space-y-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Photo Gallery
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(project.images || []).map((image, index) => (
                        <div key={index} className="aspect-w-16 aspect-h-12 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-64 object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div className="space-y-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Get In Touch
                    </h3>
                    <form onSubmit={handleContactSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={contactForm.name}
                            onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={contactForm.email}
                            onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="your.email@example.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Your phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Message *
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Tell us about your interest in this property..."
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={contactLoading}
                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
                      >
                        {contactLoading ? 'Sending...' : 'Send Inquiry'}
                      </button>
                    </form>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - Contact Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Quick Contact Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Contact Agent
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        RE
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Real Estate Agent</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Property Specialist</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                      <a
                        href="tel:+1234567890"
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <HiPhone className="w-5 h-5" />
                        <span>Call Now</span>
                      </a>
                      <a
                        href="mailto:agent@realestate.com"
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <HiMail className="w-5 h-5" />
                        <span>Send Email</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Related Projects */}
                {relatedProjects.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Similar Properties
                    </h3>
                    <div className="space-y-4">
                      {relatedProjects.slice(0, 3).map((relatedProject) => (
                        <Link
                          key={relatedProject._id}
                          to={`/projects/${relatedProject._id}`}
                          className="block group"
                        >
                          <div className="flex space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <img
                              src={relatedProject.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}
                              alt={relatedProject.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600">
                                {relatedProject.title}
                              </h4>                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {typeof relatedProject.location === 'string' 
                                  ? relatedProject.location 
                                  : relatedProject.location?.city && relatedProject.location?.state
                                  ? `${relatedProject.location.city}, ${relatedProject.location.state}`
                                  : relatedProject.location?.address || 'Location not specified'
                                }
                              </p>
                              <p className="text-sm font-bold text-blue-600">
                                {relatedProject.price ? `$${relatedProject.price.toLocaleString()}` : 'Price on Request'}
                              </p>
                            </div>
                            <HiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    <Link
                      to="/projects"
                      className="block mt-4 text-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    >
                      View All Projects
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectDetail;

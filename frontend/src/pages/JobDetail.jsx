import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiLocationMarker, 
  HiCurrencyDollar, 
  HiClock, 
  HiCalendar,
  HiArrowLeft,
  HiShare,
  HiHeart,
  HiMail,
  HiPhone,
  HiCheckCircle,
  HiBriefcase,
  HiAcademicCap,
  HiUsers,
  HiOfficeBuilding
} from 'react-icons/hi';
import { 
  FaLinkedin, 
  FaTwitter, 
  FaFacebook, 
  FaWhatsapp,
  FaCopy,
  FaMapMarkerAlt,
  FaDollarSign,
  FaClock,
  FaBuilding
} from 'react-icons/fa';
import { api } from '../utils/api';
import { formatLocation, formatSalaryRange, formatDate, formatArray } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Application form state
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    experience: '',
    resume: null
  });

  useEffect(() => {
    if (id) {
      fetchJobDetail();
      fetchRelatedJobs();
    }
  }, [id]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${id}`);
      const jobData = response.data?.data?.job || response.data?.job || response.data;
      setJob(jobData);
      
      // Increment view count
      if (jobData?._id) {
        api.patch(`/jobs/${jobData._id}/view`).catch(console.error);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
      navigate('/career');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedJobs = async () => {
    try {
      const response = await api.get(`/jobs?limit=5&department=${job?.department || ''}`);
      const jobs = response.data?.data?.jobs || response.data?.jobs || response.data || [];
      setRelatedJobs(jobs.filter(relatedJob => relatedJob._id !== id).slice(0, 3));
    } catch (error) {
      console.error('Error fetching related jobs:', error);
    }
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    if (!applicationForm.name.trim() || !applicationForm.email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsApplying(true);
    try {
      const formData = new FormData();
      Object.keys(applicationForm).forEach(key => {
        if (applicationForm[key]) {
          formData.append(key, applicationForm[key]);
        }
      });
      formData.append('jobId', job._id);
      formData.append('jobTitle', job.title);

      // Simulate application submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Application submitted successfully! We will contact you soon.');
      setApplicationForm({
        name: '',
        email: '',
        phone: '',
        coverLetter: '',
        experience: '',
        resume: null
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleShare = async (platform) => {
    const jobUrl = window.location.href;
    const shareText = `Check out this job opportunity: ${job.title} at ${job.department}`;
    
    const shareUrls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(jobUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + jobUrl)}`
    };

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(jobUrl);
        toast.success('Job link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    
    setShowShareModal(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The job you're looking for doesn't exist.</p>
          <Link
            to="/career"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/career')}
              className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <HiArrowLeft className="w-5 h-5 mr-2" />
              Back to Jobs
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <HiShare className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>

          {/* Job Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {job.title}
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <HiOfficeBuilding className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="capitalize">{job.department}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <HiLocationMarker className="w-4 h-4 mr-2 text-green-600" />
                    <span>{formatLocation(job.location)}{job.location?.remote && ' (Remote)'}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <HiClock className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="capitalize">{job.employmentType}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <HiAcademicCap className="w-4 h-4 mr-2 text-orange-600" />
                    <span className="capitalize">{job.experienceLevel}</span>
                  </div>
                </div>

                {job.salary && (job.salary.min || job.salary.max) && (
                  <div className="mt-4">
                    <div className="flex items-center text-lg font-semibold text-green-600">
                      <HiCurrencyDollar className="w-5 h-5 mr-1" />
                      {formatSalaryRange(job.salary)}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Quick Apply Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 lg:mt-0 lg:ml-8"
            >
              <a
                href="#apply"
                className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <HiBriefcase className="w-5 h-5 mr-2" />
                Apply Now
              </a>
            </motion.div>
          </div>

          {/* Job Status & Deadline */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              job.status === 'active' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              <HiCheckCircle className="w-4 h-4 mr-1" />
              {job.status === 'active' ? 'Actively Hiring' : 'Closed'}
            </span>
            
            {job.applicationDeadline && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <HiCalendar className="w-4 h-4 mr-1" />
                <span>Apply by {formatDate(job.applicationDeadline)}</span>
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Posted {formatDate(job.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job Description</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            </motion.div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <HiCheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Responsibilities</h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start">
                      <HiCheckCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Benefits & Perks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {job.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <HiCheckCircle className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Apply Card */}
            <motion.div
              id="apply"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Apply for this position</h3>
              
              <form onSubmit={handleApplicationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicationForm.name}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={applicationForm.email}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={applicationForm.phone}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cover Letter
                  </label>
                  <textarea
                    rows={4}
                    value={applicationForm.coverLetter}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Tell us why you're interested in this position..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isApplying}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  {isApplying ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <HiMail className="w-5 h-5 mr-2" />
                      Submit Application
                    </>
                  )}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Or contact us directly at{' '}
                  <a href={`mailto:${job.contactEmail}`} className="text-blue-600 hover:text-blue-700">
                    {job.contactEmail}
                  </a>
                </p>
              </div>
            </motion.div>

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Related Jobs</h3>
                <div className="space-y-4">
                  {relatedJobs.map((relatedJob) => (
                    <Link
                      key={relatedJob._id}
                      to={`/career/${relatedJob._id}`}
                      className="block group"
                    >
                      <div className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 mb-1">
                          {relatedJob.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {formatLocation(relatedJob.location)}
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          {formatSalaryRange(relatedJob.salary)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to="/career"
                  className="block w-full text-center mt-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All Jobs
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Share this job</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <HiArrowLeft className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center justify-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FaLinkedin className="w-5 h-5 text-blue-600 mr-2" />
                LinkedIn
              </button>
              
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center justify-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FaTwitter className="w-5 h-5 text-blue-400 mr-2" />
                Twitter
              </button>
              
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center justify-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FaFacebook className="w-5 h-5 text-blue-600 mr-2" />
                Facebook
              </button>
              
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center justify-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FaWhatsapp className="w-5 h-5 text-green-500 mr-2" />
                WhatsApp
              </button>
              
              <button
                onClick={() => handleShare('copy')}
                className="col-span-2 flex items-center justify-center p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <FaCopy className="w-4 h-4 mr-2" />
                Copy Link
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;

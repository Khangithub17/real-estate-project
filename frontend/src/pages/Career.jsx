import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  HiSearch, 
  HiLocationMarker, 
  HiClock, 
  HiCurrencyDollar,
  HiArrowRight,
  HiUsers,
  HiTrendingUp,
  HiHeart,
  HiLightBulb,
  HiAcademicCap,
  HiStar
} from 'react-icons/hi';
import { FaBriefcase, FaGraduationCap, FaHandshake } from 'react-icons/fa';
import { api } from '../utils/api';
import { useSocket } from '../contexts/SocketContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Career = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const { socket, on, off } = useSocket();

  const [heroRef, heroInView] = useInView({ threshold: 0.1 });
  const [benefitsRef, benefitsInView] = useInView({ threshold: 0.1 });
  const [valuesRef, valuesInView] = useInView({ threshold: 0.1 });
  const [jobsRef, jobsInView] = useInView({ threshold: 0.1 });

  useEffect(() => {
    fetchJobs();

    // Set up Socket.IO listeners for real-time updates
    if (socket) {
      // Join jobs room for targeted updates
      socket.emit('join_jobs_room');
      
      on('job_created', (data) => {
        console.log('New job created:', data);
        // Only add active jobs to the list
        if (data.job.status === 'active') {
          setJobs(prev => [data.job, ...prev]);
        }
      });

      on('job_updated', (data) => {
        console.log('Job updated:', data);
        setJobs(prev => prev.map(job => 
          job._id === data.job._id ? data.job : job
        ).filter(job => job.status === 'active')); // Keep only active jobs
      });

      on('job_deleted', (data) => {
        console.log('Job deleted:', data);
        setJobs(prev => prev.filter(job => job._id !== data.jobId));
      });
    }

    // Cleanup listeners on unmount
    return () => {
      if (socket) {
        off('job_created');
        off('job_updated');
        off('job_deleted');
      }
    };
  }, [socket, on, off]);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchTerm, selectedLocation, selectedType]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs?status=active');
      console.log('Jobs response:', response.data);
      
      // Handle different response structures
      let jobData = [];
      if (response.data?.success) {
        jobData = response.data.data?.jobs || [];
      } else if (response.data?.jobs) {
        jobData = response.data.jobs;
      } else if (Array.isArray(response.data)) {
        jobData = response.data;
      }
      
      setJobs(jobData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter(job => 
        job.location?.city?.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        job.location?.state?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter(job => job.employmentType === selectedType);
    }

    setFilteredJobs(filtered);
  };

  const getUniqueLocations = () => {
    const locations = jobs.map(job => {
      if (job.location?.city && job.location?.state) {
        return `${job.location.city}, ${job.location.state}`;
      } else if (job.location?.city) {
        return job.location.city;
      } else if (job.location?.state) {
        return job.location.state;
      }
      return null;
    }).filter(Boolean);
    return [...new Set(locations)];
  };

  const getUniqueTypes = () => {
    return [...new Set(jobs.map(job => job.employmentType).filter(Boolean))];
  };

  const benefits = [
    {
      icon: HiCurrencyDollar,
      title: 'Competitive Salary',
      description: 'We offer competitive compensation packages with performance-based bonuses and regular salary reviews.'
    },
    {
      icon: HiAcademicCap,
      title: 'Professional Development',
      description: 'Continuous learning opportunities, training programs, and certifications to advance your career.'
    },
    {
      icon: HiHeart,
      title: 'Health & Wellness',
      description: 'Comprehensive health insurance, dental, vision, and wellness programs for you and your family.'
    },
    {
      icon: HiClock,
      title: 'Work-Life Balance',
      description: 'Flexible working hours, remote work options, and generous vacation policies.'
    },
    {
      icon: HiTrendingUp,
      title: 'Career Growth',
      description: 'Clear career progression paths with mentorship programs and leadership development opportunities.'
    },
    {
      icon: HiUsers,
      title: 'Team Culture',
      description: 'Collaborative, inclusive work environment with team-building activities and social events.'
    }
  ];

  const values = [
    {
      icon: HiLightBulb,
      title: 'Innovation',
      description: 'We embrace new ideas and technologies to stay ahead in the real estate industry.'
    },
    {
      icon: HiStar,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do and exceed expectations.'
    },
    {
      icon: FaHandshake,
      title: 'Integrity',
      description: 'We conduct business with honesty, transparency, and ethical practices.'
    },
    {
      icon: HiUsers,
      title: 'Collaboration',
      description: 'We believe in the power of teamwork and collective success.'
    }
  ];

  const stats = [
    { icon: FaBriefcase, number: '500+', label: 'Employees Worldwide' },
    { icon: FaGraduationCap, number: '95%', label: 'Employee Satisfaction' },
    { icon: HiTrendingUp, number: '40%', label: 'Internal Promotions' },
    { icon: HiStar, number: '4.8', label: 'Glassdoor Rating' }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section ref={heroRef} className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Join Our Team
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-blue-100">
              Build your career with a leading real estate company. We're looking for passionate 
              individuals who want to make a difference in the industry.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <Icon className="w-12 h-12 mx-auto mb-4" />
                    <div className="text-4xl font-bold mb-2">{stat.number}</div>
                    <div className="text-blue-200">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section ref={benefitsRef} className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Why Work With Us?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We offer more than just a job – we provide a platform for growth, learning, 
              and making a meaningful impact in the real estate industry.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section ref={valuesRef} className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              These core values guide everything we do and shape our company culture.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-full mb-6">
                    <Icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section ref={jobsRef} className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={jobsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Open Positions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Explore our current job openings and find the perfect role to advance your career.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Locations</option>
                {getUniqueLocations().map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Types</option>
                {getUniqueTypes().map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-gray-600 dark:text-gray-300">
              {filteredJobs.length} of {jobs.length} positions
            </div>
          </div>

          {/* Job Cards */}
          {filteredJobs.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl text-gray-300 dark:text-gray-600 mb-4">💼</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Jobs Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLocation('');
                  setSelectedType('');
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={jobsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-300 mb-4">
                            {(job.location?.city || job.location?.state) && (
                              <div className="flex items-center space-x-1">
                                <HiLocationMarker className="w-4 h-4" />
                                <span>
                                  {job.location.city && job.location.state 
                                    ? `${job.location.city}, ${job.location.state}`
                                    : job.location.city || job.location.state}
                                  {job.location.remote && ' (Remote)'}
                                </span>
                              </div>
                            )}
                            {job.employmentType && (
                              <div className="flex items-center space-x-1">
                                <HiClock className="w-4 h-4" />
                                <span className="capitalize">
                                  {job.employmentType.replace('-', ' ')}
                                </span>
                              </div>
                            )}
                            {job.department && (
                              <div className="flex items-center space-x-1">
                                <FaBriefcase className="w-4 h-4" />
                                <span className="capitalize">{job.department}</span>
                              </div>
                            )}
                            {(job.salaryRange?.min || job.salaryRange?.max) && (
                              <div className="flex items-center space-x-1">
                                <HiCurrencyDollar className="w-4 h-4" />
                                <span>
                                  {job.salaryRange.min && job.salaryRange.max
                                    ? `$${job.salaryRange.min} - $${job.salaryRange.max}`
                                    : job.salaryRange.min
                                    ? `From $${job.salaryRange.min}`
                                    : `Up to $${job.salaryRange.max}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                        {job.description}
                      </p>

                      {/* Requirements */}
                      {job.requirements && job.requirements.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Key Requirements:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {job.requirements.slice(0, 3).map((req, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                              >
                                {req}
                              </span>
                            ))}
                            {job.requirements.length > 3 && (
                              <span className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                                +{job.requirements.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:ml-8">
                      <Link
                        to={`/career/${job._id}`}
                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                      >
                        <span>View Details</span>
                        <HiArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                      <button className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-semibold transition-all duration-300">
                        Quick Apply
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Don't See the Right Role?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              We're always looking for talented individuals to join our team. 
              Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="px-8 py-4 bg-white text-purple-600 hover:bg-gray-100 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Send Your Resume
              </Link>
              <button className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-purple-600 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                Set Job Alert
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Career;
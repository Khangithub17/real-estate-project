import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  HiSearch, 
  HiCalendar, 
  HiUser, 
  HiTag,
  HiEye,
  HiArrowRight,
  HiClock
} from 'react-icons/hi';
import { api } from '../utils/api';
import { useSocket } from '../contexts/SocketContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { socket, on, off } = useSocket();

  const [heroRef, heroInView] = useInView({ threshold: 0.1 });
  const [blogsRef, blogsInView] = useInView({ threshold: 0.1 });

  useEffect(() => {
    fetchBlogs();    // Set up Socket.IO listeners for real-time updates
    if (socket) {
      // Join blogs room for targeted updates
      socket.emit('join_blogs_room');
      
      on('blog_created', (data) => {
        console.log('New blog created:', data);
        // Only add published blogs to the list
        if (data.blog.status === 'published') {
          setBlogs(prev => [data.blog, ...prev]);
        }
      });

      on('blog_updated', (data) => {
        console.log('Blog updated:', data);
        setBlogs(prev => prev.map(blog => 
          blog._id === data.blog._id ? data.blog : blog
        ).filter(blog => blog.status === 'published')); // Keep only published blogs
      });

      on('blog_deleted', (data) => {
        console.log('Blog deleted:', data);
        setBlogs(prev => prev.filter(blog => blog._id !== data.blogId));
      });
    }

    // Cleanup listeners on unmount
    return () => {
      if (socket) {
        off('blog_created');
        off('blog_updated');
        off('blog_deleted');
      }
    };
  }, [socket, on, off]);

  useEffect(() => {
    applyFilters();
  }, [blogs, searchTerm, selectedCategory]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/blogs?status=published');
      console.log('Blogs response:', response.data);
      
      // Handle different response structures
      let blogData = [];
      if (response.data?.success) {
        blogData = response.data.data?.blogs || [];
      } else if (response.data?.blogs) {
        blogData = response.data.blogs;
      } else if (Array.isArray(response.data)) {
        blogData = response.data;
      }
      
      setBlogs(blogData);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...blogs];

    if (searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(blog => 
        blog.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredBlogs(filtered);
  };

  const getUniqueCategories = () => {
    return [...new Set(blogs.map(blog => blog.category).filter(Boolean))];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0, y: 20 }}
        animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 text-white py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Our <span className="text-yellow-400">Blog</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Stay updated with the latest trends, insights, and news in real estate
            </p>
          </div>
        </div>
      </motion.section>

      {/* Search and Filters */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-center md:justify-end">
                <span className="text-gray-600 dark:text-gray-300">
                  {filteredBlogs.length} blog{filteredBlogs.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blogs Grid */}
      <motion.section
        ref={blogsRef}
        initial={{ opacity: 0, y: 20 }}
        animate={blogsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="pb-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog, index) => (
                <motion.article
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Blog Image */}
                  {blog.featuredImage && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={`http://localhost:5000${blog.featuredImage}`}
                        alt={blog.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {blog.category && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                            {blog.category}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Blog Content */}
                  <div className="p-6">
                    {/* Meta Info */}
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <HiCalendar className="h-4 w-4 mr-1" />
                      <span className="mr-4">{formatDate(blog.publishDate || blog.createdAt)}</span>
                      <HiUser className="h-4 w-4 mr-1" />
                      <span className="mr-4">{blog.author || 'Admin'}</span>
                      {blog.readTime && (
                        <>
                          <HiClock className="h-4 w-4 mr-1" />
                          <span>{blog.readTime} min read</span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                      {blog.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {blog.excerpt || truncateContent(blog.content)}
                    </p>

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {blog.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                          >
                            <HiTag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {blog.tags.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{blog.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Read More Button */}
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/blogs/${blog._id}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
                      >
                        Read More
                        <HiArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                      
                      {blog.views && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <HiEye className="h-4 w-4 mr-1" />
                          <span>{blog.views} views</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No blogs found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                {searchTerm || selectedCategory 
                  ? "Try adjusting your search filters" 
                  : "Check back later for new blog posts"
                }
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default Blogs;

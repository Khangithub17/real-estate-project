import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaBuilding, 
  FaBlog, 
  FaBriefcase, 
  FaUsers, 
  FaChartLine, 
  FaEye,
  FaPlus,
  FaEdit,
  FaCog,
  FaSpinner,
  FaCalendarAlt
} from 'react-icons/fa';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { useSocket } from '../contexts/SocketContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: { total: 0, active: 0, completed: 0 },
    blogs: { total: 0, published: 0, drafts: 0 },
    jobs: { total: 0, open: 0, closed: 0 },
    users: { total: 0, active: 0 }
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket, on, off } = useSocket();

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();

    // Set up Socket.IO listeners for real-time updates
    if (socket) {
      on('project_created', () => fetchDashboardStats());
      on('project_updated', () => fetchDashboardStats());
      on('project_deleted', () => fetchDashboardStats());
      on('blog_created', () => fetchDashboardStats());
      on('blog_updated', () => fetchDashboardStats());
      on('blog_deleted', () => fetchDashboardStats());
      on('job_created', () => fetchDashboardStats());
      on('job_updated', () => fetchDashboardStats());
      on('job_deleted', () => fetchDashboardStats());
      on('user_created', () => fetchDashboardStats());
      on('user_deleted', () => fetchDashboardStats());
    }

    // Cleanup listeners on unmount
    return () => {
      if (socket) {
        off('project_created');
        off('project_updated');
        off('project_deleted');
        off('blog_created');
        off('blog_updated');
        off('blog_deleted');
        off('job_created');
        off('job_updated');
        off('job_deleted');
        off('user_created');
        off('user_deleted');
      }
    };
  }, [socket, on, off]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [projectsRes, blogsRes, jobsRes, usersRes] = await Promise.allSettled([
        api.get('/projects'),
        api.get('/blogs'),
        api.get('/jobs'),
        api.get('/users')
      ]);

      // Process projects data
      const projects = projectsRes.status === 'fulfilled' ? 
        (projectsRes.value.data?.data?.projects || projectsRes.value.data || []) : [];
      
      // Process blogs data
      const blogs = blogsRes.status === 'fulfilled' ? 
        (blogsRes.value.data?.data?.blogs || blogsRes.value.data || []) : [];
      
      // Process jobs data
      const jobs = jobsRes.status === 'fulfilled' ? 
        (jobsRes.value.data?.data?.jobs || jobsRes.value.data || []) : [];

      // Process users data
      const users = usersRes.status === 'fulfilled' ? 
        (usersRes.value.data?.data?.users || usersRes.value.data || []) : [];

      setStats({
        projects: {
          total: projects.length,
          active: projects.filter(p => p.status === 'active' || p.status === 'ongoing').length,
          completed: projects.filter(p => p.status === 'completed').length
        },
        blogs: {
          total: blogs.length,
          published: blogs.filter(b => b.published).length,
          drafts: blogs.filter(b => !b.published).length
        },
        jobs: {
          total: jobs.length,
          open: jobs.filter(j => j.status === 'active').length,
          closed: jobs.filter(j => j.status === 'inactive').length
        },
        users: {
          total: users.length,
          active: users.filter(u => u.role === 'user').length
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Get recent items from each collection
      const [projectsRes, blogsRes, jobsRes] = await Promise.allSettled([
        api.get('/projects?limit=5&sort=-createdAt'),
        api.get('/blogs?limit=5&sort=-createdAt'),
        api.get('/jobs?limit=5&sort=-createdAt')
      ]);

      const activities = [];

      // Process recent projects
      if (projectsRes.status === 'fulfilled') {
        const projects = projectsRes.value.data?.data?.projects || projectsRes.value.data || [];
        projects.slice(0, 3).forEach(project => {
          activities.push({
            id: `project-${project._id}`,
            type: 'Project',
            action: 'Created',
            title: project.title,
            time: formatTimeAgo(project.createdAt),
            link: `/admin/projects`
          });
        });
      }

      // Process recent blogs
      if (blogsRes.status === 'fulfilled') {
        const blogs = blogsRes.value.data?.data?.blogs || blogsRes.value.data || [];
        blogs.slice(0, 2).forEach(blog => {
          activities.push({
            id: `blog-${blog._id}`,
            type: 'Blog',
            action: blog.published ? 'Published' : 'Created',
            title: blog.title,
            time: formatTimeAgo(blog.createdAt),
            link: `/admin/blogs`
          });
        });
      }

      // Process recent jobs
      if (jobsRes.status === 'fulfilled') {
        const jobs = jobsRes.value.data?.data?.jobs || jobsRes.value.data || [];
        jobs.slice(0, 2).forEach(job => {
          activities.push({
            id: `job-${job._id}`,
            type: 'Job',
            action: 'Posted',
            title: job.title,
            time: formatTimeAgo(job.createdAt),
            link: `/admin/jobs`
          });
        });
      }

      // Sort by most recent and take top 5
      activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    
    const now = new Date();
    const date = new Date(dateString);
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const dashboardCards = [
    {
      title: 'Projects',
      total: stats.projects.total,
      subtitle: `${stats.projects.active} Active, ${stats.projects.completed} Completed`,
      icon: FaBuilding,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      link: '/admin/projects',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Blogs',
      total: stats.blogs.total,
      subtitle: `${stats.blogs.published} Published, ${stats.blogs.drafts} Drafts`,
      icon: FaBlog,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      link: '/admin/blogs',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Jobs',
      total: stats.jobs.total,
      subtitle: `${stats.jobs.open} Open, ${stats.jobs.closed} Closed`,
      icon: FaBriefcase,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      link: '/admin/jobs',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Users',
      total: stats.users.total,
      subtitle: `${stats.users.active} Active Users`,
      icon: FaUsers,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      link: '/admin/users',
      trend: '+2%',
      trendUp: false
    }
  ];

  const quickActions = [
    { icon: FaPlus, title: 'Add Project', link: '/admin/projects', color: 'text-blue-600' },
    { icon: FaEdit, title: 'Write Blog', link: '/admin/blogs', color: 'text-green-600' },
    { icon: FaBriefcase, title: 'Post Job', link: '/admin/jobs', color: 'text-purple-600' },
    { icon: FaCog, title: 'Settings', link: '/admin/settings', color: 'text-gray-600' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-purple-600 mb-4 mx-auto" />
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Welcome back! Here's what's happening with your real estate business.</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${card.color} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
            >
              <Link to={card.link} className="block">
                <div className="flex items-center justify-between mb-4">
                  <card.icon className="text-3xl opacity-80" />
                  <div className="flex items-center text-sm opacity-80">
                    {card.trendUp ? <HiTrendingUp className="mr-1" /> : <HiTrendingDown className="mr-1" />}
                    <span>{card.trend}</span>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2">{card.total}</div>
                <div className="text-sm opacity-90">{card.title}</div>
                <div className="text-xs opacity-75 mt-1">{card.subtitle}</div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Link
                  key={action.title}
                  to={action.link}
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
                >
                  <action.icon className={`text-lg ${action.color} mr-3 group-hover:scale-110 transition-transform`} />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{action.title}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Activity will appear here when you create or update content</p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      {activity.type === 'Project' && <FaBuilding className="text-blue-600" />}
                      {activity.type === 'Blog' && <FaBlog className="text-green-600" />}
                      {activity.type === 'Job' && <FaBriefcase className="text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.action} {activity.type}
                      </div>
                      <div className="text-sm text-gray-600">{activity.title}</div>
                    </div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                ))
              )}
            </div>
            {recentActivity.length > 0 && (
              <div className="mt-4 text-center">
                <Link
                  to="/admin/activity"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View All Activity
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Performance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {stats.projects.total}
              </div>
              <div className="text-sm text-gray-600">Total Projects</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.projects.active} active projects
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {stats.blogs.published}
              </div>
              <div className="text-sm text-gray-600">Published Blogs</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.blogs.drafts} in draft
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {stats.jobs.open}
              </div>
              <div className="text-sm text-gray-600">Open Positions</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.jobs.total} total jobs
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
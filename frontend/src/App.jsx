import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Career from './pages/Career';
import JobDetail from './pages/JobDetail';
import Contact from './pages/Contact';
import Blogs from './pages/Blogs';

// Admin Pages
import AdminLogin from './admin/Login';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import ProjectManager from './admin/ProjectManager';
import BlogManager from './admin/BlogManager';
import JobManager from './admin/JobManager';
import UserManager from './admin/UserManager';
import Settings from './admin/Settings';

// Styles
import './styles/globals.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <SocketProvider>
            <AuthProvider>
              <Router>
                <div className="App min-h-screen bg-gray-50 dark:bg-gray-900">
                <Routes>
                  {/* Public Routes with Layout */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="about" element={<About />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projects/:id" element={<ProjectDetail />} />
                    <Route path="career" element={<Career />} />
                    <Route path="career/:id" element={<JobDetail />} />
                    <Route path="blogs" element={<Blogs />} />
                    <Route path="contact" element={<Contact />} />
                  </Route>
                  
                  {/* Admin Authentication */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  
                  {/* Protected Admin Routes */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="projects" element={<ProjectManager />} />
                    <Route path="blogs" element={<BlogManager />} />
                    <Route path="jobs" element={<JobManager />} />
                    <Route path="users" element={<UserManager />} />
                    <Route path="settings" element={<Settings />} />
                    <Route index element={<Dashboard />} />
                  </Route>
                  
                  {/* 404 Page */}
                  <Route path="*" element={
                    <Layout>
                      <div className="min-h-screen pt-20 flex items-center justify-center">
                        <div className="text-center">
                          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Page not found</p>
                          <a href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                            Go Home
                          </a>
                        </div>
                      </div>
                    </Layout>
                  } />
                </Routes>
                
                {/* Toast Notifications */}
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
              </div>
            </Router>
          </AuthProvider>
        </SocketProvider>
      </ThemeProvider>
    </HelmetProvider>
  </QueryClientProvider>
  );
}

export default App;
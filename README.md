# Real Estate MERN Stack Project

A modern, full-featured real estate management system built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🚀 Features

### Frontend
- **Modern React Application** with React 18 and functional components
- **Responsive Design** using Tailwind CSS
- **Smooth Animations** with Framer Motion
- **State Management** with Context API and React Query
- **Authentication & Authorization** with JWT tokens
- **Admin Dashboard** for managing content
- **SEO Optimized** with React Helmet Async
- **Toast Notifications** for user feedback
- **Form Handling** with React Hook Form
- **Image Optimization** with lazy loading
- **Modern UI Components** with React Icons

### Backend
- **RESTful API** built with Express.js
- **MongoDB** database with Mongoose ODM
- **Authentication & Authorization** with JWT
- **File Upload** support with Multer
- **Image Upload** integration with Cloudinary
- **Input Validation** with Express Validator
- **Security Middleware** for protection
- **CORS** enabled for cross-origin requests

### Admin Features
- Complete admin dashboard
- Project management (CRUD operations)
- Blog management system
- Job posting management
- User management
- Real-time statistics
- File upload capabilities

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router DOM v6
- Tailwind CSS
- Framer Motion
- React Query
- React Hook Form
- React Toastify
- React Icons
- React Helmet Async
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Tokens)
- Bcrypt.js
- Multer
- Cloudinary
- Express Validator
- CORS
- Dotenv

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-estate-project
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**

   Create a `.env` file in the `backend` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/real-estate-db
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   PORT=5000
   NODE_ENV=development
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

5. **Start MongoDB**
   - If using local MongoDB, make sure it's running
   - If using MongoDB Atlas, update the `MONGODB_URI` in your `.env` file

6. **Run the Application**

   **Start Backend Server (from backend directory):**
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

   **Start Frontend Development Server (from frontend directory):**
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project (Admin)
- `PUT /api/projects/:id` - Update project (Admin)
- `DELETE /api/projects/:id` - Delete project (Admin)

### Blogs
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/:id` - Get blog by ID
- `POST /api/blogs` - Create new blog (Admin)
- `PUT /api/blogs/:id` - Update blog (Admin)
- `DELETE /api/blogs/:id` - Delete blog (Admin)

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create new job (Admin)
- `PUT /api/jobs/:id` - Update job (Admin)
- `DELETE /api/jobs/:id` - Delete job (Admin)

## 🔐 Admin Access

To access the admin panel:
1. Navigate to `/admin/login`
2. Use admin credentials to log in
3. Access the dashboard at `/admin/dashboard`

Default admin credentials (change in production):
- Email: admin@realestate.com
- Password: admin123

## 📁 Project Structure

```
real-estate-project/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── uploads/
│   ├── package.json
│   └── .env
└── frontend/
    ├── public/
    ├── src/
    │   ├── admin/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   ├── styles/
    │   └── utils/
    ├── package.json
    └── tailwind.config.js
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Update CORS settings for production domain
3. Deploy to platforms like Heroku, Railway, or DigitalOcean
4. Ensure MongoDB connection is properly configured

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy the `build` folder to platforms like Netlify, Vercel, or AWS S3
3. Update API base URL in `src/utils/api.js`

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Admin-only routes protection
- File upload validation
- Rate limiting (recommended for production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please contact [your-email@example.com](mailto:your-email@example.com)

---

Built with ❤️ using the MERN stack
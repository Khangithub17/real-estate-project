# Deployment Configuration

## Environment Variables for Production

### Backend (.env)
```
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_super_secure_jwt_secret_for_production
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CORS_ORIGIN=https://yourdomain.com
```

### Frontend
Update `src/utils/api.js` with your production API URL:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com/api'
  : 'http://localhost:5000/api';
```

## Deployment Commands

### Build Frontend for Production
```bash
cd frontend
npm run build
```

### Deploy Backend
```bash
# For platforms like Heroku, Railway, etc.
cd backend
npm start
```

## Security Checklist for Production

- [ ] Change default admin credentials
- [ ] Use strong JWT secret (at least 64 characters)
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Enable MongoDB authentication
- [ ] Set up proper logging
- [ ] Configure error handling for production
- [ ] Enable compression middleware
- [ ] Set security headers
- [ ] Configure file upload limits
- [ ] Set up monitoring and health checks

## Recommended Hosting Platforms

### Frontend
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

### Backend
- Heroku
- Railway
- DigitalOcean App Platform
- AWS EC2/ECS
- Google Cloud Run

### Database
- MongoDB Atlas
- AWS DocumentDB
- DigitalOcean Managed MongoDB

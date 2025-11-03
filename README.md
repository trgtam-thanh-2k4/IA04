# React Authentication with JWT (Access + Refresh Tokens)

A full-stack authentication application implementing secure JWT-based authentication with access tokens and refresh tokens. The project consists of a NestJS backend with SQLite database and a React frontend built with Vite.

## Features

- ✅ **JWT Authentication**: Access tokens (15 min expiry) stored in memory, refresh tokens (7 days) stored in localStorage
- ✅ **Automatic Token Refresh**: Axios interceptors automatically refresh expired access tokens
- ✅ **Protected Routes**: React Router routes protected by authentication state
- ✅ **React Query**: Server state management with React Query for authentication and data fetching
- ✅ **React Hook Form**: Form validation using React Hook Form with Zod schema validation
- ✅ **Error Handling**: Comprehensive error handling for login failures, token expiration, and network issues
- ✅ **SQLite Database**: SQLite database with TypeORM for data persistence

## Project Structure

```
IA04/
├── backend/              # NestJS backend application
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── user/        # User module
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   └── seed.ts      # Seed script for test user
│   └── package.json
│
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities (Axios config)
│   │   └── types/       # TypeScript types
│   └── package.json
│
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults are provided):
```bash
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
FRONTEND_URL=http://localhost:5173
```

4. Seed the database with a test user:
```bash
npm run seed
```

This creates a test user with:
- Email: `test@example.com`
- Password: `password123`

5. Start the development server:
```bash
npm run start:dev
```

The backend will be running on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```bash
VITE_API_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be running on `http://localhost:5173`

## Usage

1. **Login**: Navigate to `http://localhost:5173/login` and use the test credentials:
   - Email: `test@example.com`
   - Password: `password123`

2. **Dashboard**: After successful login, you'll be redirected to the dashboard showing your user information.

3. **Token Management**: 
   - Access tokens are stored in memory and automatically attached to API requests
   - Refresh tokens are stored in localStorage
   - When the access token expires, it's automatically refreshed using the refresh token

4. **Logout**: Click the logout button to clear all tokens and redirect to the login page

## API Endpoints

### Authentication

- `POST /auth/login` - Login with email and password
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```

- `POST /auth/refresh` - Refresh access token
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```

- `POST /auth/logout` - Logout and invalidate refresh token
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```

- `GET /auth/me` - Get current user (requires Bearer token)

### User

- `GET /users/profile` - Get user profile (requires Bearer token)

## Technical Implementation

### Backend (NestJS)

- **Authentication Module**: Handles JWT generation, validation, and refresh token management
- **User Module**: User entity and service for database operations
- **JWT Strategy**: Passport JWT strategy for protecting routes
- **TypeORM**: SQLite database with automatic schema synchronization
- **Validation**: DTO validation using class-validator

### Frontend (React)

- **Axios Interceptors**: 
  - Request interceptor attaches access token to Authorization header
  - Response interceptor handles 401 errors and automatically refreshes tokens
  
- **React Query**:
  - `useLogin` mutation for login
  - `useLogout` mutation for logout
  - `useCurrentUser` query for fetching user data

- **React Hook Form**:
  - Login form with Zod schema validation
  - Email and password validation with error messages

- **Protected Routes**:
  - `ProtectedRoute` component checks authentication before rendering
  - Redirects to login if not authenticated

## Token Flow

1. **Login**: User submits credentials → Server validates → Returns access token (15min) + refresh token (7days)
2. **API Requests**: Access token sent in Authorization header
3. **Token Expiry**: If access token expires (401), Axios interceptor:
   - Calls `/auth/refresh` with refresh token
   - Gets new access + refresh tokens
   - Retries original request with new access token
4. **Refresh Failure**: If refresh fails, user is logged out and redirected to login
5. **Logout**: Refresh token invalidated on server, all tokens cleared on client

## Deployment

### Backend Deployment

For production deployment:

1. Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET` in environment variables
2. Set `synchronize: false` in TypeORM config and use migrations
3. Update CORS origin to your frontend URL
4. Build the application: `npm run build`
5. Start production server: `npm run start:prod`

### Frontend Deployment

The frontend can be deployed to:
- **Vercel**: Connect your Git repository and deploy automatically
- **Netlify**: Drag and drop the `dist` folder or connect Git
- **GitHub Pages**: Use GitHub Actions to build and deploy
- **Firebase Hosting**: Use Firebase CLI to deploy

#### Example: Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to frontend directory: `cd frontend`
3. Run: `vercel`
4. Set environment variable `VITE_API_URL` to your backend URL

#### Example: Deploy to Netlify

1. Build the frontend: `npm run build`
2. Install Netlify CLI: `npm i -g netlify-cli`
3. Deploy: `netlify deploy --prod --dir=dist`
4. Set environment variable `VITE_API_URL` in Netlify dashboard

## Public Hosting URL

*Note: Update this section with your actual deployment URL*

Example:
- Frontend: `https://jwt-auth-app.vercel.app`
- Backend: `https://jwt-auth-api.herokuapp.com` (or your backend host)

## Development Commands

### Backend
```bash
npm run start:dev    # Start development server with hot reload
npm run build        # Build for production
npm run seed         # Create test user
npm run lint         # Run linter
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
```

## Security Considerations

- ✅ Access tokens stored in memory (not localStorage) - reduces XSS risk
- ✅ Refresh tokens stored in localStorage with automatic cleanup
- ✅ Passwords hashed using bcrypt
- ✅ SQL injection protection via TypeORM
- ✅ Input validation using class-validator and Zod
- ✅ CORS configured for specific origins
- ✅ JWT tokens include expiration and type validation

## Future Enhancements (Stretch Goals)

- [ ] Silent token refresh before expiration
- [ ] Cookie-based refresh token storage (more secure)
- [ ] Multi-tab synchronization (broadcast channel API)
- [ ] Role-based access control (RBAC)
- [ ] Remember me functionality
- [ ] Two-factor authentication (2FA)

## Troubleshooting

### Backend Issues

**Database connection error**: Ensure SQLite is installed and check file permissions

**Port already in use**: Change PORT in `.env` or kill the process using port 3000

**Module not found**: Run `npm install` again

### Frontend Issues

**API connection failed**: Check `VITE_API_URL` matches your backend URL

**CORS error**: Ensure backend CORS is configured for your frontend URL

**Token refresh loop**: Check browser console for errors, verify refresh token is valid

## License

MIT

## Author

Created for the Web Application Development course assignment.

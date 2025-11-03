import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protected route component that requires authentication
 * @param children - Child components to render if authenticated
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};


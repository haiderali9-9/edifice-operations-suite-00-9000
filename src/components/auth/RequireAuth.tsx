
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const RequireAuth: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-construction-600" />
      </div>
    );
  }

  // TEMPORARY: Bypass authentication check for testing
  // When you're ready to re-enable auth, remove the next line and uncomment the block below
  return <Outlet />;

  /* UNCOMMENT THIS WHEN YOU WANT TO RESTORE AUTHENTICATION
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If authenticated, show the protected routes
  return <Outlet />;
  */
};

export default RequireAuth;

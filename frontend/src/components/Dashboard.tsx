import { useCurrentUser, useLogout } from '../hooks/useAuth';

/**
 * Dashboard component displaying user information
 */
export const Dashboard = () => {
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        {user && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                User Information
              </h2>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-medium text-gray-600 w-32">ID:</span>
                  <span className="text-gray-800">{user.id}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-600 w-32">Email:</span>
                  <span className="text-gray-800">{user.email}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-600 w-32">Name:</span>
                  <span className="text-gray-800">{user.name}</span>
                </div>
                {user.createdAt && (
                  <div className="flex">
                    <span className="font-medium text-gray-600 w-32">
                      Created:
                    </span>
                    <span className="text-gray-800">
                      {new Date(user.createdAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-green-800">
                ✅ You are successfully authenticated!
              </p>
              <p className="text-green-700 text-sm mt-2">
                Your access token is stored in memory and will be automatically
                refreshed when it expires.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


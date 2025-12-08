import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  if (!user) return null;
  
  const getUserInitial = () => {
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const isSuperAdmin = user.roles?.includes('SuperAdmin');
  const isAdmin = user.roles?.includes('Admin');
  const isUser = user.roles?.includes('User') && !isAdmin && !isSuperAdmin;

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="card">
        <div className="font-semibold mb-4 text-xl">Profile</div>
        
        {/* Profile Picture/Icon */}
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
          {user.picture ? (
            <img 
              src={user.picture} 
              alt={user.name || user.email}
              className="h-24 w-24 rounded-full object-cover border-4 border-blue-500 shadow-lg"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {getUserInitial()}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name || 'User'}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <div className="text-sm text-gray-900 mt-1">{user.name || 'Not set'}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <div className="text-sm text-gray-900 mt-1">{user.email}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">User ID</label>
            <div className="text-sm text-gray-900 mt-1">{user.id || 'N/A'}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Roles</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.roles?.map((role, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    role === 'SuperAdmin' 
                      ? 'bg-gradient-to-r from-red-100 to-orange-100 text-red-700'
                      : role === 'Admin'
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                      : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700'
                  }`}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
          {user.picture && (
            <div>
              <label className="text-sm font-medium text-gray-500">Profile Picture</label>
              <div className="text-xs text-gray-500 mt-1">Google Account</div>
            </div>
          )}

          {/* SuperAdmin Only Section */}
          {isSuperAdmin && (
            <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-lg font-bold text-red-700">SuperAdmin Only</h3>
              </div>
              <p className="text-sm text-red-600 mb-3">You have full system access and can manage all users, admins, and system settings.</p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>View all users and admins</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Create, delete, and modify any user or admin</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Promote users to admin or revoke admin access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Access SuperAdmin dashboard</span>
                </div>
              </div>
            </div>
          )}

          {/* Admin Only Section */}
          {isAdmin && !isSuperAdmin && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-lg font-bold text-green-700">Admin Only</h3>
              </div>
              <p className="text-sm text-green-600 mb-3">You have administrative privileges and can manage users assigned to you.</p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>View and manage your assigned users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Create and delete users in your scope</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Access Admin dashboard</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">✗</span>
                  <span className="text-gray-500">Cannot manage other admins or SuperAdmin</span>
                </div>
              </div>
            </div>
          )}

          {/* Regular User Section */}
          {isUser && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-lg font-bold text-blue-700">User Account</h3>
              </div>
              <p className="text-sm text-blue-600 mb-3">You have standard user access to the system.</p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">✓</span>
                  <span>View your own profile and dashboard</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">✓</span>
                  <span>Edit your profile information</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">✗</span>
                  <span className="text-gray-500">Cannot manage other users or access admin features</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;


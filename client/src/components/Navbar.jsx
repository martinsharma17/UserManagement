import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileIcon from "./ProfileIcon";

const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-brand">
          User Management
        </Link>
        <nav className="flex items-center gap-4">
          {user?.roles?.includes("SuperAdmin") && (
            <Link to="/superadmin" className="text-sm text-gray-700">
              SuperAdmin
            </Link>
          )}
          {user?.roles?.includes("Admin") && (
            <Link to="/admin" className="text-sm text-gray-700">
              Admin
            </Link>
          )}
          {user && (
            <Link to="/dashboard" className="text-sm text-gray-700">
              Dashboard
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <ProfileIcon name={user.displayName || user.email} />
              <button
                onClick={logout}
                className="text-sm text-gray-700 hover:text-brand"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="text-sm text-gray-700">
                Login
              </Link>
              <Link to="/register" className="text-sm text-gray-700">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;


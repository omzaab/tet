import { useAuth } from "@getmocha/users-service/react";
import { Link, useNavigate } from "react-router";
import { Home, Building, Star, LogOut, Shield } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-primary" />
                <span className="font-heading text-xl font-semibold text-gray-900">
                  TenantTrust
                </span>
              </Link>
              
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/properties"
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors"
                >
                  <Building className="w-4 h-4" />
                  <span>Properties</span>
                </Link>
                <Link
                  to="/reviews"
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors"
                >
                  <Star className="w-4 h-4" />
                  <span>Reviews</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={user.google_user_data?.picture || '/default-avatar.png'}
                  alt={user.google_user_data?.name || 'User'}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-gray-700">
                  {user.google_user_data?.name || user.email}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

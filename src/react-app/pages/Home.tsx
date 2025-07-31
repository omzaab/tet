import { useAuth } from "@getmocha/users-service/react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Shield, Star, Users, CheckCircle } from "lucide-react";

export default function Home() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isPending) {
      navigate("/dashboard");
    }
  }, [user, isPending, navigate]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Shield className="w-20 h-20 text-primary" />
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              TenantTrust
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Build trust in rental relationships through transparent reviews and AI-powered verification
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Connect landlords and tenants through a reliable, transparent platform that reduces risks for everyone
            </p>
            
            <button
              onClick={redirectToLogin}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get Started with Google
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose TenantTrust?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides tools and insights that benefit both landlords and tenants
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-gradient-to-b from-primary/5 to-transparent">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-gray-900 mb-4">
                Transparent Reviews
              </h3>
              <p className="text-gray-600">
                Honest feedback system that helps both parties make informed decisions about rental relationships
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gradient-to-b from-accent/5 to-transparent">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-gray-900 mb-4">
                AI-Powered Verification
              </h3>
              <p className="text-gray-600">
                Advanced AI analysis ensures review authenticity and helps calculate trust scores accurately
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gradient-to-b from-primary/5 to-transparent">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-gray-900 mb-4">
                Trust Scores
              </h3>
              <p className="text-gray-600">
                Build your reputation over time with our comprehensive trust scoring system
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Build Trust?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of landlords and tenants who trust TenantTrust for their rental relationships
          </p>
          <button
            onClick={redirectToLogin}
            className="bg-white text-primary hover:bg-gray-50 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Start Building Trust Today
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Shield className="w-6 h-6" />
            <span className="font-heading text-xl font-semibold">TenantTrust</span>
          </div>
          <p className="text-gray-400">
            Building trust in rental relationships, one review at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}

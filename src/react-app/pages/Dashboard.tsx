import { useAuth } from "@getmocha/users-service/react";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useApi } from "@/react-app/hooks/useApi";
import Layout from "@/react-app/components/Layout";
import TrustScore from "@/react-app/components/TrustScore";
import { Plus, Building, Star, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { } = useAuth();
  const navigate = useNavigate();
  
  const { data: userInfo, loading: userLoading } = useApi<{
    mochaUser: any;
    user: any;
  }>('/api/users/me');

  const { data: properties } = useApi<any[]>('/api/properties');
  const { data: receivedReviews } = useApi<any[]>('/api/reviews/received');

  useEffect(() => {
    if (!userLoading && userInfo && !userInfo.user) {
      navigate('/setup-profile');
    }
  }, [userLoading, userInfo, navigate]);

  if (userLoading || !userInfo?.user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const appUser = userInfo.user;
  const isLandlord = appUser.user_type === 'landlord' || appUser.user_type === 'both';

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-8 text-white">
          <h1 className="font-heading text-3xl font-bold mb-2">
            Welcome back, {appUser.full_name}!
          </h1>
          <p className="text-white/90">
            Your TenantTrust dashboard - building trust one interaction at a time.
          </p>
        </div>

        {/* Trust Score Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-heading text-xl font-semibold text-gray-900 mb-4">
            Your Trust Profile
          </h2>
          <TrustScore
            score={appUser.trust_score}
            totalReviews={appUser.total_reviews}
            averageRating={appUser.average_rating}
            size="lg"
          />
          {appUser.total_reviews === 0 && (
            <p className="text-gray-500 mt-4">
              Start building your trust score by receiving your first review!
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Trust Score</p>
                <p className="text-2xl font-bold text-gray-900">{appUser.trust_score}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{appUser.total_reviews}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          {isLandlord && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Properties</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties?.length || 0}
                  </p>
                </div>
                <Building className="w-8 h-8 text-primary" />
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-heading text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/add-review"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
            >
              <Plus className="w-5 h-5 text-primary" />
              <span className="font-medium">Add Review</span>
            </Link>

            {isLandlord && (
              <Link
                to="/properties"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Building className="w-5 h-5 text-primary" />
                <span className="font-medium">Manage Properties</span>
              </Link>
            )}

            <Link
              to="/reviews"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
            >
              <Star className="w-5 h-5 text-primary" />
              <span className="font-medium">View Reviews</span>
            </Link>
          </div>
        </div>

        {/* Recent Reviews */}
        {receivedReviews && receivedReviews.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-semibold text-gray-900">
                Recent Reviews
              </h2>
              <Link
                to="/reviews"
                className="text-primary hover:text-primary/80 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {receivedReviews.slice(0, 3).map((review) => (
                <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <img
                        src={review.reviewer_avatar || '/default-avatar.png'}
                        alt={review.reviewer_name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-medium">{review.reviewer_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{review.review_text}</p>
                  {review.property_name && (
                    <p className="text-xs text-gray-500 mt-2">
                      Property: {review.property_name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

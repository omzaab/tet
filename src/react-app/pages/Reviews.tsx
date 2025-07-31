import { useState } from 'react';
import { useApi } from '@/react-app/hooks/useApi';
import Layout from '@/react-app/components/Layout';
import { Star, Calendar, MapPin, MessageSquare } from 'lucide-react';
import { Link } from 'react-router';

export default function Reviews() {
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');
  
  const { data: receivedReviews, loading: receivedLoading } = useApi<any[]>('/api/reviews/received');
  const { data: givenReviews, loading: givenLoading } = useApi<any[]>('/api/reviews/given');

  const currentReviews = activeTab === 'received' ? receivedReviews : givenReviews;
  const loading = activeTab === 'received' ? receivedLoading : givenLoading;

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const parseIssueTypes = (issueTypesStr: string | null) => {
    if (!issueTypesStr) return [];
    try {
      return JSON.parse(issueTypesStr);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-900">
              Reviews
            </h1>
            <p className="text-gray-600 mt-2">
              View reviews you've received and given to build trust in the community
            </p>
          </div>
          <Link
            to="/add-review"
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Add Review</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('received')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'received'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reviews Received ({receivedReviews?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('given')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'given'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reviews Given ({givenReviews?.length || 0})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {!currentReviews || currentReviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-heading text-xl font-semibold text-gray-900 mb-2">
                  No Reviews Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'received'
                    ? "You haven't received any reviews yet. Start building relationships to get your first review!"
                    : "You haven't given any reviews yet. Share your experiences to help the community!"}
                </p>
                {activeTab === 'given' && (
                  <Link
                    to="/add-review"
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Write Your First Review
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {currentReviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={
                            activeTab === 'received'
                              ? review.reviewer_avatar || '/default-avatar.png'
                              : review.reviewee_avatar || '/default-avatar.png'
                          }
                          alt={
                            activeTab === 'received'
                              ? review.reviewer_name
                              : review.reviewee_name
                          }
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {activeTab === 'received'
                                ? review.reviewer_name
                                : review.reviewee_name}
                            </h3>
                            <span className="text-gray-500">
                              {activeTab === 'received' ? 'reviewed you' : 'you reviewed'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-gray-700">{review.review_text}</p>

                      {review.property_name && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>Property: {review.property_name}</span>
                          {review.property_address && (
                            <span className="text-gray-500">
                              - {review.property_address}
                            </span>
                          )}
                        </div>
                      )}

                      {review.issue_types && (
                        <div className="flex flex-wrap gap-2">
                          {parseIssueTypes(review.issue_types).map((issue: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                            >
                              {issue.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))}
                        </div>
                      )}

                      {review.evidence_image_url && (
                        <div>
                          <img
                            src={review.evidence_image_url}
                            alt="Review evidence"
                            className="max-w-xs rounded-lg border border-gray-200"
                          />
                        </div>
                      )}

                      {review.trust_score_impact !== 0 && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-500">Trust Score Impact:</span>
                          <span
                            className={`font-medium ${
                              review.trust_score_impact > 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {review.trust_score_impact > 0 ? '+' : ''}
                            {review.trust_score_impact}
                          </span>
                        </div>
                      )}

                      {!review.is_valid && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-800 text-sm">
                            <strong>Note:</strong> This review is under verification.
                            {review.ai_validation_reason && (
                              <span> Reason: {review.ai_validation_reason}</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

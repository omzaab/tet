import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApi, apiPost } from '@/react-app/hooks/useApi';
import Layout from '@/react-app/components/Layout';
import AIAnalysis from '@/react-app/components/AIAnalysis';
import { ISSUE_TYPES } from '@/shared/types';
import { Search, Star, X, CheckCircle } from 'lucide-react';

export default function AddReview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    rating: 0,
    review_text: '',
    issue_types: [] as string[],
    evidence_image_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const navigate = useNavigate();

  const { data: searchResults } = useApi<any[]>(
    searchQuery.length >= 2 ? `/api/users/search?q=${encodeURIComponent(searchQuery)}` : '',
    [searchQuery]
  );

  const { data: properties } = useApi<any[]>('/api/properties');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setError('Please select a user to review');
      return;
    }

    if (formData.rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (formData.review_text.length < 15) {
      setError('Review text must be at least 15 characters');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await apiPost('/api/reviews', {
        reviewee_id: selectedUser.id,
        rating: formData.rating,
        review_text: formData.review_text,
        issue_types: formData.issue_types.length > 0 ? formData.issue_types : undefined,
        evidence_image_url: formData.evidence_image_url || undefined,
      });
      
      if (response.aiAnalysis) {
        setAiAnalysis(response.aiAnalysis);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/reviews');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssueTypeToggle = (issueType: string) => {
    setFormData(prev => ({
      ...prev,
      issue_types: prev.issue_types.includes(issueType)
        ? prev.issue_types.filter(type => type !== issueType)
        : [...prev.issue_types, issueType]
    }));
  };

  const renderStars = (rating: number, onRatingChange?: (rating: number) => void) => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onRatingChange?.(i + 1)}
        className={`w-8 h-8 ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        } hover:text-yellow-400 transition-colors`}
        disabled={!onRatingChange}
      >
        <Star className="w-full h-full fill-current" />
      </button>
    ));
  };

  if (success) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2">
                Review Submitted Successfully!
              </h1>
              <p className="text-gray-600">
                Your review has been submitted and will help build trust in the community.
              </p>
            </div>
            
            {aiAnalysis && (
              <div className="mb-6">
                <AIAnalysis 
                  isValid={aiAnalysis.isValid}
                  reason={aiAnalysis.reason}
                  trustScoreImpact={aiAnalysis.trustScoreImpact}
                />
              </div>
            )}
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Redirecting to reviews page...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-6">
            Add a Review
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who are you reviewing? *
              </label>
              
              {selectedUser ? (
                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedUser.avatar_url || '/default-avatar.png'}
                      alt={selectedUser.full_name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{selectedUser.full_name}</p>
                      <p className="text-sm text-gray-500 capitalize">{selectedUser.user_type}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Search by name..."
                  />
                  
                  {searchResults && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(user);
                            setSearchQuery('');
                          }}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
                        >
                          <img
                            src={user.avatar_url || '/default-avatar.png'}
                            alt={user.full_name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name}</p>
                            <p className="text-sm text-gray-500 capitalize">
                              {user.user_type} • Trust Score: {user.trust_score}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating *
              </label>
              <div className="flex items-center space-x-2">
                {renderStars(formData.rating, (rating) =>
                  setFormData({ ...formData, rating })
                )}
                <span className="ml-3 text-sm text-gray-600">
                  {formData.rating > 0 && (
                    <>
                      {formData.rating} out of 5 stars
                      {formData.rating === 5 && ' - Excellent'}
                      {formData.rating === 4 && ' - Very Good'}
                      {formData.rating === 3 && ' - Good'}
                      {formData.rating === 2 && ' - Fair'}
                      {formData.rating === 1 && ' - Poor'}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={formData.review_text}
                onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Share your experience... (minimum 15 characters)"
                required
                minLength={15}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.review_text.length}/15 characters minimum
              </p>
            </div>

            {/* Issue Types (only show if rating is low) */}
            {formData.rating > 0 && formData.rating <= 3 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What issues did you experience? (Optional)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ISSUE_TYPES.map((issueType) => (
                    <button
                      key={issueType}
                      type="button"
                      onClick={() => handleIssueTypeToggle(issueType)}
                      className={`text-left p-2 text-sm border rounded-lg transition-all ${
                        formData.issue_types.includes(issueType)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {issueType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData.evidence_image_url}
                onChange={(e) => setFormData({ ...formData, evidence_image_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide supporting evidence if applicable (photos of damage, receipts, etc.)
              </p>
            </div>

            {/* Property Selection (if available) */}
            {properties && properties.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Property (Optional)
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    // This would need to be implemented to associate with a property
                    console.log('Selected property:', e.target.value);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select a property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name} - {property.address}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/reviews')}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedUser || formData.rating === 0}
                className="bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

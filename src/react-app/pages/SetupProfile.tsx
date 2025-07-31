import { useState } from 'react';
import { useNavigate } from 'react-router';
import { UserType } from '@/shared/types';
import { apiPost } from '@/react-app/hooks/useApi';
import Layout from '@/react-app/components/Layout';

export default function SetupProfile() {
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    user_type: 'tenant' as UserType,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiPost('/api/users', formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold text-gray-900 mb-4">
              Complete Your Profile
            </h1>
            <p className="text-gray-600">
              Tell us a bit about yourself to get started with TenantTrust
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, user_type: 'tenant' })}
                  className={`p-4 border rounded-lg text-center transition-all ${
                    formData.user_type === 'tenant'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">Tenant</div>
                  <div className="text-xs text-gray-500 mt-1">Looking for rentals</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, user_type: 'landlord' })}
                  className={`p-4 border rounded-lg text-center transition-all ${
                    formData.user_type === 'landlord'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">Landlord</div>
                  <div className="text-xs text-gray-500 mt-1">Renting out properties</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, user_type: 'both' })}
                  className={`p-4 border rounded-lg text-center transition-all ${
                    formData.user_type === 'both'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">Both</div>
                  <div className="text-xs text-gray-500 mt-1">Tenant & Landlord</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio (Optional)
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tell us a bit about yourself..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Creating Profile...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

import { Shield, Star } from 'lucide-react';

interface TrustScoreProps {
  score: number;
  totalReviews: number;
  averageRating: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function TrustScore({ score, totalReviews, averageRating, size = 'md' }: TrustScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`flex items-center space-x-3 ${sizeClasses[size]}`}>
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${getScoreBgColor(score)}`}>
        <Shield className={`${iconSizes[size]} ${getScoreColor(score)}`} />
        <span className={`font-semibold ${getScoreColor(score)}`}>
          {score}
        </span>
      </div>
      
      {totalReviews > 0 && (
        <div className="flex items-center space-x-1 text-gray-600">
          <Star className={`${iconSizes[size]} fill-yellow-400 text-yellow-400`} />
          <span className="font-medium">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-gray-500">
            ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      )}
    </div>
  );
}

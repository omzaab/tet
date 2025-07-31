import { Shield, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AIAnalysisProps {
  isValid: boolean;
  reason: string;
  trustScoreImpact: number;
}

export default function AIAnalysis({ isValid, reason, trustScoreImpact }: AIAnalysisProps) {
  const getImpactColor = (impact: number) => {
    if (impact > 0) return 'text-green-600';
    if (impact < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getImpactBgColor = (impact: number) => {
    if (impact > 0) return 'bg-green-50 border-green-200';
    if (impact < 0) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className={`border rounded-lg p-4 ${getImpactBgColor(trustScoreImpact)}`}>
      <div className="flex items-start space-x-3">
        {isValid ? (
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
        )}
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-semibold text-gray-900">AI Analysis</span>
            <span className={`text-sm font-medium ${getImpactColor(trustScoreImpact)}`}>
              {trustScoreImpact > 0 ? '+' : ''}{trustScoreImpact} trust points
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mb-2">{reason}</p>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Info className="w-3 h-3" />
            <span>
              {isValid 
                ? 'This review has been validated and will affect trust scores.'
                : 'This review requires manual review before affecting trust scores.'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
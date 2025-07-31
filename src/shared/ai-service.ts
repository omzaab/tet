import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the AI model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ReviewAnalysisResult {
  isValid: boolean;
  reason: string;
  trustScoreImpact: number;
}

export interface AggregateAnalysisResult {
  summary: string;
  identifiedIssues: string[];
  fairnessAssessment: 'positive' | 'negative' | 'neutral';
}

export class AIService {
  private static model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  /**
   * AI Flow 1: Analyze a single review submission
   */
  static async analyzeReviewSubmission(
    reviewText: string,
    rating: number,
    issueTypes: string[],
    evidenceImageUrl?: string
  ): Promise<ReviewAnalysisResult> {
    try {
      const prompt = `
You are an AI assistant analyzing a rental review for credibility and fairness.

Review Details:
- Rating: ${rating}/5 stars
- Review Text: "${reviewText}"
- Issue Types: ${issueTypes.length > 0 ? issueTypes.join(', ') : 'None specified'}
${evidenceImageUrl ? `- Evidence Image: ${evidenceImageUrl}` : ''}

Please analyze this review for:
1. Credibility: Does the review text align with the rating?
2. Evidence consistency: If an image is provided, does it support the claims?
3. Fairness: Is the review balanced and constructive?
4. Trust score impact: Based on rating, severity, and evidence strength

Respond with a JSON object containing:
{
  "isValid": boolean,
  "reason": "Brief explanation of credibility decision",
  "trustScoreImpact": number (between -20 and +20)
}

Guidelines:
- 5-star reviews with positive text: +10 to +20 impact
- 4-star reviews with constructive feedback: +5 to +15 impact
- 3-star reviews: 0 to +5 impact
- 2-star reviews with valid issues: -5 to -15 impact
- 1-star reviews with serious issues: -10 to -20 impact
- Invalid or malicious reviews: 0 impact
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      return {
        isValid: analysis.isValid,
        reason: analysis.reason,
        trustScoreImpact: Math.max(-20, Math.min(20, analysis.trustScoreImpact))
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback to basic analysis
      return {
        isValid: true,
        reason: 'AI analysis unavailable, using basic validation',
        trustScoreImpact: this.calculateBasicTrustScoreImpact(rating, issueTypes)
      };
    }
  }

  /**
   * AI Flow 2: Analyze aggregate reviews for a user
   */
  static async analyzeAggregateReviews(reviews: Array<{
    rating: number;
    reviewText: string;
    issueTypes: string[];
  }>): Promise<AggregateAnalysisResult> {
    try {
      const reviewsText = reviews.map(review => 
        `Rating: ${review.rating}/5 - "${review.reviewText}" - Issues: ${review.issueTypes.join(', ')}`
      ).join('\n\n');

      const prompt = `
You are an AI assistant analyzing multiple rental reviews for a user to provide insights about their reliability and reputation.

Reviews to analyze:
${reviewsText}

Please provide a comprehensive analysis and respond with a JSON object containing:
{
  "summary": "Overall assessment of reliability based on all reviews",
  "identifiedIssues": ["list", "of", "recurring", "issues"],
  "fairnessAssessment": "positive|negative|neutral"
}

Focus on:
1. Overall reliability patterns
2. Recurring positive or negative themes
3. Fairness of the review collection (are they balanced or biased?)
4. Specific issues that appear multiple times
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      return {
        summary: analysis.summary,
        identifiedIssues: analysis.identifiedIssues || [],
        fairnessAssessment: analysis.fairnessAssessment || 'neutral'
      };
    } catch (error) {
      console.error('AI aggregate analysis error:', error);
      // Fallback analysis
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      const issues = reviews.flatMap(r => r.issueTypes);
      
      return {
        summary: `Based on ${reviews.length} reviews with average rating of ${avgRating.toFixed(1)}/5`,
        identifiedIssues: [...new Set(issues)],
        fairnessAssessment: avgRating >= 4 ? 'positive' : avgRating <= 2 ? 'negative' : 'neutral'
      };
    }
  }

  /**
   * AI-powered avatar verification
   */
  static async verifyAvatar(imageUrl: string): Promise<{ isValid: boolean; reason: string }> {
    try {
      const prompt = `
You are an AI assistant verifying if an uploaded image is appropriate for a user avatar.

Image URL: ${imageUrl}

Please analyze this image and respond with a JSON object:
{
  "isValid": boolean,
  "reason": "Brief explanation"
}

The image should:
- Contain a human face
- Be appropriate and professional
- Not contain inappropriate content
- Be clear and recognizable
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('AI avatar verification error:', error);
      return {
        isValid: true,
        reason: 'AI verification unavailable, accepting image'
      };
    }
  }

  /**
   * Basic trust score calculation fallback
   */
  private static calculateBasicTrustScoreImpact(rating: number, issueTypes: string[]): number {
    let impact = 0;
    
    // Base impact from rating
    switch (rating) {
      case 5: impact = 15; break;
      case 4: impact = 10; break;
      case 3: impact = 0; break;
      case 2: impact = -10; break;
      case 1: impact = -20; break;
    }

    // Additional impact from issue types
    const seriousIssues = ['property_damage', 'lease_violations', 'unfair_treatment'];
    const moderateIssues = ['late_payment', 'maintenance_issues', 'communication_problems'];
    
    issueTypes.forEach(issue => {
      if (seriousIssues.includes(issue)) {
        impact -= 5;
      } else if (moderateIssues.includes(issue)) {
        impact -= 2;
      }
    });

    return Math.max(-20, Math.min(20, impact));
  }
}
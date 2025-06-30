export interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  categories: string[];
  keywords: string[];
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
    disgust: number;
  };
}

export interface FeedbackCategorization {
  primaryCategory: string;
  secondaryCategories: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  suggestedActions: string[];
}

export class SentimentService {
  // Sentiment keywords and patterns
  private static readonly POSITIVE_KEYWORDS = [
    'excellent', 'amazing', 'fantastic', 'wonderful', 'great', 'good', 'love', 'perfect',
    'outstanding', 'brilliant', 'awesome', 'superb', 'magnificent', 'terrific', 'pleased',
    'satisfied', 'happy', 'delighted', 'impressed', 'recommend', 'helpful', 'friendly',
    'professional', 'efficient', 'quick', 'fast', 'easy', 'smooth', 'seamless', 'intuitive'
  ];

  private static readonly NEGATIVE_KEYWORDS = [
    'terrible', 'awful', 'horrible', 'bad', 'worst', 'hate', 'disgusting', 'pathetic',
    'useless', 'broken', 'failed', 'error', 'problem', 'issue', 'bug', 'slow', 'difficult',
    'confusing', 'frustrated', 'disappointed', 'angry', 'upset', 'annoyed', 'poor', 'lacking',
    'missing', 'wrong', 'incorrect', 'unacceptable', 'unprofessional', 'rude', 'unhelpful'
  ];

  private static readonly NEUTRAL_KEYWORDS = [
    'okay', 'fine', 'average', 'normal', 'standard', 'typical', 'regular', 'moderate',
    'acceptable', 'adequate', 'sufficient', 'reasonable', 'fair', 'decent', 'alright'
  ];

  // Category keywords
  private static readonly CATEGORY_KEYWORDS = {
    'User Experience': ['ui', 'ux', 'interface', 'design', 'layout', 'navigation', 'usability', 'user-friendly'],
    'Performance': ['speed', 'fast', 'slow', 'loading', 'performance', 'lag', 'responsive', 'quick'],
    'Customer Service': ['support', 'service', 'staff', 'help', 'assistance', 'representative', 'agent'],
    'Product Quality': ['quality', 'product', 'feature', 'functionality', 'reliability', 'durability'],
    'Pricing': ['price', 'cost', 'expensive', 'cheap', 'value', 'money', 'affordable', 'pricing'],
    'Technical Issues': ['bug', 'error', 'crash', 'broken', 'glitch', 'technical', 'malfunction'],
    'Delivery/Shipping': ['delivery', 'shipping', 'package', 'arrived', 'delayed', 'on-time'],
    'Communication': ['communication', 'information', 'updates', 'notification', 'contact'],
    'Accessibility': ['accessibility', 'accessible', 'disability', 'screen reader', 'keyboard'],
    'Security': ['security', 'privacy', 'safe', 'secure', 'protection', 'data', 'personal']
  };

  // Emotion keywords
  private static readonly EMOTION_KEYWORDS = {
    joy: ['happy', 'joy', 'excited', 'thrilled', 'delighted', 'pleased', 'cheerful', 'elated'],
    anger: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'outraged'],
    fear: ['scared', 'afraid', 'worried', 'anxious', 'concerned', 'nervous', 'fearful'],
    sadness: ['sad', 'disappointed', 'upset', 'depressed', 'unhappy', 'miserable', 'down'],
    surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'unexpected', 'wow'],
    disgust: ['disgusted', 'revolted', 'appalled', 'repulsed', 'sickened', 'nauseated']
  };

  static analyzeSentiment(text: string): SentimentAnalysis {
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
    const words = cleanText.split(/\s+/).filter(word => word.length > 2);

    // Calculate sentiment scores
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    words.forEach(word => {
      if (this.POSITIVE_KEYWORDS.includes(word)) {
        positiveScore += 1;
      } else if (this.NEGATIVE_KEYWORDS.includes(word)) {
        negativeScore += 1;
      } else if (this.NEUTRAL_KEYWORDS.includes(word)) {
        neutralScore += 1;
      }
    });

    // Determine overall sentiment
    const totalScore = positiveScore + negativeScore + neutralScore;
    let sentiment: 'positive' | 'neutral' | 'negative';
    let confidence: number;

    if (totalScore === 0) {
      sentiment = 'neutral';
      confidence = 0.5;
    } else if (positiveScore > negativeScore) {
      sentiment = 'positive';
      confidence = Math.min(0.95, 0.5 + (positiveScore / totalScore) * 0.5);
    } else if (negativeScore > positiveScore) {
      sentiment = 'negative';
      confidence = Math.min(0.95, 0.5 + (negativeScore / totalScore) * 0.5);
    } else {
      sentiment = 'neutral';
      confidence = 0.6;
    }

    // Extract categories
    const categories = this.extractCategories(text);

    // Extract keywords
    const keywords = this.extractKeywords(text);

    // Analyze emotions
    const emotions = this.analyzeEmotions(text);

    return {
      sentiment,
      confidence,
      categories,
      keywords,
      emotions
    };
  }

  static categorizeFeedback(text: string, sentiment: SentimentAnalysis): FeedbackCategorization {
    const categories = sentiment.categories;
    const primaryCategory = categories[0] || 'General Feedback';
    const secondaryCategories = categories.slice(1, 3);

    // Determine urgency based on sentiment and keywords
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const urgentKeywords = ['urgent', 'critical', 'emergency', 'immediately', 'asap', 'broken', 'not working'];
    const highPriorityKeywords = ['important', 'serious', 'major', 'significant', 'problem', 'issue'];

    const lowerText = text.toLowerCase();
    
    if (urgentKeywords.some(keyword => lowerText.includes(keyword))) {
      urgency = 'critical';
    } else if (sentiment.sentiment === 'negative' && sentiment.confidence > 0.8) {
      urgency = 'high';
    } else if (highPriorityKeywords.some(keyword => lowerText.includes(keyword))) {
      urgency = 'medium';
    } else if (sentiment.sentiment === 'negative') {
      urgency = 'medium';
    }

    // Determine if action is required
    const actionRequired = urgency === 'critical' || urgency === 'high' || 
                          (sentiment.sentiment === 'negative' && sentiment.confidence > 0.7);

    // Generate suggested actions
    const suggestedActions = this.generateSuggestedActions(sentiment, primaryCategory, urgency);

    return {
      primaryCategory,
      secondaryCategories,
      urgency,
      actionRequired,
      suggestedActions
    };
  }

  private static extractCategories(text: string): string[] {
    const lowerText = text.toLowerCase();
    const foundCategories: { category: string; score: number }[] = [];

    Object.entries(this.CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        return acc + (matches ? matches.length : 0);
      }, 0);

      if (score > 0) {
        foundCategories.push({ category, score });
      }
    });

    return foundCategories
      .sort((a, b) => b.score - a.score)
      .map(item => item.category)
      .slice(0, 3);
  }

  private static extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Remove common stop words
    const stopWords = ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'];
    
    const filteredWords = words.filter(word => !stopWords.includes(word));

    // Count word frequency
    const wordCount: Record<string, number> = {};
    filteredWords.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Return top keywords
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private static analyzeEmotions(text: string): SentimentAnalysis['emotions'] {
    const lowerText = text.toLowerCase();
    const emotions = {
      joy: 0,
      anger: 0,
      fear: 0,
      sadness: 0,
      surprise: 0,
      disgust: 0
    };

    Object.entries(this.EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (lowerText.includes(keyword) ? 1 : 0);
      }, 0);
      emotions[emotion as keyof typeof emotions] = Math.min(1, score * 0.3);
    });

    return emotions;
  }

  private static generateSuggestedActions(
    sentiment: SentimentAnalysis, 
    category: string, 
    urgency: string
  ): string[] {
    const actions: string[] = [];

    // Base actions based on sentiment
    if (sentiment.sentiment === 'negative') {
      actions.push('Follow up with customer within 24 hours');
      actions.push('Investigate the reported issue');
      
      if (urgency === 'critical') {
        actions.push('Escalate to management immediately');
        actions.push('Provide immediate resolution or workaround');
      }
    } else if (sentiment.sentiment === 'positive') {
      actions.push('Thank the customer for positive feedback');
      actions.push('Share feedback with relevant team');
      actions.push('Consider featuring as testimonial');
    }

    // Category-specific actions
    switch (category) {
      case 'Technical Issues':
        actions.push('Forward to technical support team');
        actions.push('Create bug report if applicable');
        break;
      case 'Customer Service':
        actions.push('Review with customer service manager');
        actions.push('Provide additional training if needed');
        break;
      case 'Product Quality':
        actions.push('Forward to product development team');
        actions.push('Consider for product roadmap');
        break;
      case 'User Experience':
        actions.push('Share with UX/UI design team');
        actions.push('Consider for next design iteration');
        break;
      case 'Performance':
        actions.push('Forward to engineering team');
        actions.push('Monitor system performance metrics');
        break;
    }

    // Remove duplicates and limit to 5 actions
    return [...new Set(actions)].slice(0, 5);
  }

  static generateInsights(responses: any[]): {
    overallSentiment: { positive: number; neutral: number; negative: number };
    topCategories: { category: string; count: number; sentiment: string }[];
    urgentIssues: number;
    actionableItems: number;
    trendAnalysis: {
      sentimentTrend: 'improving' | 'declining' | 'stable';
      categoryTrends: { category: string; trend: 'up' | 'down' | 'stable' }[];
    };
  } {
    if (responses.length === 0) {
      return {
        overallSentiment: { positive: 0, neutral: 0, negative: 0 },
        topCategories: [],
        urgentIssues: 0,
        actionableItems: 0,
        trendAnalysis: {
          sentimentTrend: 'stable',
          categoryTrends: []
        }
      };
    }

    // Calculate overall sentiment distribution
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    const categoryMap: Record<string, { count: number; sentiments: string[] }> = {};
    let urgentIssues = 0;
    let actionableItems = 0;

    responses.forEach(response => {
      if (response.sentiment) {
        sentimentCounts[response.sentiment as keyof typeof sentimentCounts]++;
      }

      // Count urgent issues and actionable items
      if (response.metadata?.urgency === 'critical' || response.metadata?.urgency === 'high') {
        urgentIssues++;
      }
      if (response.metadata?.actionRequired) {
        actionableItems++;
      }

      // Track categories
      if (response.metadata?.categories) {
        response.metadata.categories.forEach((category: string) => {
          if (!categoryMap[category]) {
            categoryMap[category] = { count: 0, sentiments: [] };
          }
          categoryMap[category].count++;
          categoryMap[category].sentiments.push(response.sentiment || 'neutral');
        });
      }
    });

    // Calculate percentages
    const total = responses.length;
    const overallSentiment = {
      positive: Math.round((sentimentCounts.positive / total) * 100),
      neutral: Math.round((sentimentCounts.neutral / total) * 100),
      negative: Math.round((sentimentCounts.negative / total) * 100)
    };

    // Get top categories with dominant sentiment
    const topCategories = Object.entries(categoryMap)
      .map(([category, data]) => {
        const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
        data.sentiments.forEach(sentiment => {
          sentimentCounts[sentiment as keyof typeof sentimentCounts]++;
        });
        
        const dominantSentiment = Object.entries(sentimentCounts)
          .sort(([, a], [, b]) => b - a)[0][0];

        return {
          category,
          count: data.count,
          sentiment: dominantSentiment
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Simple trend analysis (would be more sophisticated with historical data)
    const recentResponses = responses.slice(-10);
    const olderResponses = responses.slice(0, -10);
    
    let sentimentTrend: 'improving' | 'declining' | 'stable' = 'stable';
    
    if (recentResponses.length > 0 && olderResponses.length > 0) {
      const recentPositive = recentResponses.filter(r => r.sentiment === 'positive').length / recentResponses.length;
      const olderPositive = olderResponses.filter(r => r.sentiment === 'positive').length / olderResponses.length;
      
      if (recentPositive > olderPositive + 0.1) {
        sentimentTrend = 'improving';
      } else if (recentPositive < olderPositive - 0.1) {
        sentimentTrend = 'declining';
      }
    }

    return {
      overallSentiment,
      topCategories,
      urgentIssues,
      actionableItems,
      trendAnalysis: {
        sentimentTrend,
        categoryTrends: [] // Would implement with more historical data
      }
    };
  }
}
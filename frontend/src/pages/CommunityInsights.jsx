import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { BarChart3, TrendingUp, Sparkles, Heart, MessageSquare, Compass, Shield } from 'lucide-react';
import { getEmotionStyle } from '../utils/emotionTheme';
import api from '../api/client';

export const CommunityInsights = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get('/analytics/community');
        if (res.data.success) {
          setAnalytics(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load community analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const dominantEmotion = analytics?.dominantEmotion || 'Hopeful';
  const dominantStyle = getEmotionStyle(dominantEmotion);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-echo-border/60">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-echo-lavender/10 text-echo-lavender text-xs font-medium mb-1">
          <Sparkles className="w-3 h-3" />
          <span>Real-time Community Resonance</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-echo-text">Community Pulse</h1>
        <p className="text-xs text-echo-muted mt-0.5">
          Aggregated emotional statistics and trending themes across our collective anonymous stream.
        </p>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="space-y-2">
          <span className="text-[11px] text-echo-subtle font-medium uppercase tracking-wider">
            Dominant Emotion
          </span>
          <p className="text-2xl font-serif font-bold text-echo-lavender">
            {dominantEmotion}
          </p>
          <p className="text-xs text-echo-muted">
            Leading community resonance
          </p>
        </Card>

        <Card padding="md" className="space-y-2">
          <span className="text-[11px] text-echo-subtle font-medium uppercase tracking-wider">
            Total Empathy Shared
          </span>
          <p className="text-2xl font-serif font-bold text-echo-emerald">
            {analytics?.totalEmpathyShared ?? 0}
          </p>
          <p className="text-xs text-echo-muted">Anonymous supportive touches</p>
        </Card>

        <Card padding="md" className="space-y-2">
          <span className="text-[11px] text-echo-subtle font-medium uppercase tracking-wider">
            Active Reflections
          </span>
          <p className="text-2xl font-serif font-bold text-echo-periwinkle">
            {analytics?.totalActiveThoughts ?? 0}
          </p>
          <p className="text-xs text-echo-muted">Currently wandering in the stream</p>
        </Card>

        <Card padding="md" className="space-y-2">
          <span className="text-[11px] text-echo-subtle font-medium uppercase tracking-wider">
            Active Rooms
          </span>
          <p className="text-2xl font-serif font-bold text-echo-coral">
            {analytics?.activeRoomsCount ?? 0}
          </p>
          <p className="text-xs text-echo-muted">Live peer conversation spaces</p>
        </Card>
      </div>

      {/* Emotion Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="lg" className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between border-b border-echo-border/50 pb-3">
            <div>
              <CardTitle>Emotion Distribution</CardTitle>
              <CardDescription className="mt-0.5">
                Relative percentage of emotions expressed across all active thoughts
              </CardDescription>
            </div>
            <BarChart3 className="w-5 h-5 text-echo-lavender" />
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse py-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-echo-surface rounded"></div>
              ))}
            </div>
          ) : !analytics?.emotionDistribution || analytics.emotionDistribution.length === 0 ? (
            <p className="text-xs text-echo-subtle py-8 text-center font-serif italic">
              Not enough reflections yet to compute emotional distribution.
            </p>
          ) : (
            <div className="space-y-3.5 pt-1">
              {analytics.emotionDistribution.map((item) => {
                const style = getEmotionStyle(item.emotion);
                return (
                  <div key={item.emotion} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5 font-medium text-echo-text">
                        <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
                        <span>{item.emotion}</span>
                      </div>
                      <span className="text-echo-subtle font-mono">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>

                    <div className="w-full bg-echo-surface h-2.5 rounded-full overflow-hidden border border-echo-border/40">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${style.dot}`}
                        style={{ width: `${Math.max(4, item.percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Trending Discussion Themes */}
        <Card padding="lg" className="space-y-4">
          <div className="border-b border-echo-border/50 pb-3">
            <CardTitle>Trending Themes</CardTitle>
            <CardDescription className="mt-0.5">
              Frequent topics mentioned across thoughts
            </CardDescription>
          </div>

          {loading ? (
            <div className="space-y-2 animate-pulse py-4">
              <div className="h-4 bg-echo-surface rounded"></div>
              <div className="h-4 bg-echo-surface rounded"></div>
            </div>
          ) : !analytics?.trendingTopics || analytics.trendingTopics.length === 0 ? (
            <p className="text-xs text-echo-subtle py-8 text-center font-serif italic">
              No topics tagged yet. Add tags when releasing thoughts.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {analytics.trendingTopics.map((item) => (
                <span
                  key={item.topic}
                  className="px-3 py-1.5 rounded-lg bg-echo-surface border border-echo-border text-xs text-echo-text flex items-center gap-1.5"
                >
                  <span className="text-echo-lavender">#{item.topic}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-echo-card text-echo-subtle">
                    {item.count}
                  </span>
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-echo-border/50 text-xs text-echo-subtle leading-relaxed">
            <p>
              EchoRoom community statistics are anonymized in aggregate without storing tracking cookies or advertising profiles.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CommunityInsights;

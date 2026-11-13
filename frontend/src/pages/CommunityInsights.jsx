import React from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { BarChart3, TrendingUp, Sparkles, Heart } from 'lucide-react';

export const CommunityInsights = () => {
  const stats = [
    { emotion: 'Hopeful', count: '38%', color: 'bg-echo-lavender' },
    { emotion: 'Lonely', count: '24%', color: 'bg-echo-periwinkle' },
    { emotion: 'Grateful', count: '18%', color: 'bg-echo-emerald' },
    { emotion: 'Frustrated', count: '12%', color: 'bg-echo-coral' },
    { emotion: 'Confused', count: '8%', color: 'bg-echo-amber' },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-echo-border/60">
        <h1 className="text-2xl font-serif font-bold text-echo-text">Community Pulse</h1>
        <p className="text-xs text-echo-muted mt-1">
          Aggregated emotional statistics and trending themes across our collective anonymous thoughts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md" className="space-y-2">
          <span className="text-xs text-echo-subtle font-medium uppercase tracking-wider">
            Dominant Emotion
          </span>
          <p className="text-2xl font-serif font-bold text-echo-lavender">Hopeful</p>
          <p className="text-xs text-echo-muted">38% of thoughts shared this week</p>
        </Card>
        <Card padding="md" className="space-y-2">
          <span className="text-xs text-echo-subtle font-medium uppercase tracking-wider">
            Total Empathy Shared
          </span>
          <p className="text-2xl font-serif font-bold text-echo-emerald">1,482</p>
          <p className="text-xs text-echo-muted">Anonymous supportive touches</p>
        </Card>
        <Card padding="md" className="space-y-2">
          <span className="text-xs text-echo-subtle font-medium uppercase tracking-wider">
            Active Rooms
          </span>
          <p className="text-2xl font-serif font-bold text-echo-periwinkle">12</p>
          <p className="text-xs text-echo-muted">Live peer support discussions</p>
        </Card>
      </div>

      {/* Emotion Distribution */}
      <Card padding="lg" className="space-y-4">
        <CardTitle className="text-base">Emotion Distribution</CardTitle>
        <div className="space-y-3">
          {stats.map((s) => (
            <div key={s.emotion} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-echo-text">{s.emotion}</span>
                <span className="text-echo-muted">{s.count}</span>
              </div>
              <div className="w-full bg-echo-surface h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${s.color} rounded-full`}
                  style={{ width: s.count }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CommunityInsights;

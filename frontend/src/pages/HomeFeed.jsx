import React from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Heart, MessageCircle, Share2, Filter, Search } from 'lucide-react';

export const HomeFeed = () => {
  const emotions = [
    'All', 'Happy', 'Sad', 'Confused', 'Frustrated', 'Hopeful', 'Lonely', 'Grateful', 'Motivated'
  ];

  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-echo-border/60">
        <div>
          <h1 className="text-2xl font-serif font-bold text-echo-text">Thought Stream</h1>
          <p className="text-xs text-echo-muted mt-1">
            Real-time thoughts shared anonymously from our global community.
          </p>
        </div>
        <Link to="/create">
          <Button size="sm">Share a Thought</Button>
        </Link>
      </div>

      {/* Emotion Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {emotions.map((emo, idx) => (
          <button
            key={emo}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              idx === 0
                ? 'bg-echo-lavender text-echo-bg font-semibold'
                : 'bg-echo-surface border border-echo-border text-echo-muted hover:text-echo-text hover:border-echo-muted/50'
            }`}
          >
            {emo}
          </button>
        ))}
      </div>

      {/* Feed Items (Placeholder) */}
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <Card key={item} hover padding="md">
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-echo-lavender/20 border border-echo-lavender/30 flex items-center justify-center text-echo-lavender text-xs font-medium">
                  M
                </div>
                <div>
                  <span className="text-xs font-medium text-echo-text">Midnight Traveler</span>
                  <span className="text-[10px] text-echo-subtle ml-2">2h ago</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-echo-periwinkle/15 text-echo-periwinkle border border-echo-periwinkle/30">
                Hopeful
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-echo-text/90 leading-relaxed font-sans">
                "Sometimes the hardest step is simply allowing yourself to rest without the weight of guilt. Today I chose peace over perfection."
              </p>
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-4 text-xs text-echo-muted">
                <span className="hover:text-echo-lavender cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Heart className="w-3.5 h-3.5" /> 14 Empathy
                </span>
                <span className="hover:text-echo-text cursor-pointer flex items-center gap-1.5 transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" /> 3 Responses
                </span>
              </div>
              <Link to={`/thought/${item}`} className="text-xs text-echo-lavender hover:underline font-medium">
                View discussion →
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomeFeed;


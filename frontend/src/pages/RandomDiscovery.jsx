import React from 'react';
import Card, { CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Shuffle, Heart, MessageCircle } from 'lucide-react';

export const RandomDiscovery = () => {
  return (
    <div className="max-w-xl mx-auto space-y-8 py-8 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-serif font-bold text-echo-text">Serendipity Discovery</h1>
        <p className="text-xs text-echo-muted">
          Draw a single unread thought from an anonymous soul somewhere across the world.
        </p>
      </div>

      <Card padding="lg" className="text-left space-y-6 shadow-elevated border-echo-lavender/30">
        <div className="flex items-center justify-between">
          <span className="text-xs text-echo-subtle font-mono uppercase tracking-widest">
            Ephemeral Echo
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-echo-coral/15 text-echo-coral border border-echo-coral/30">
            Lonely
          </span>
        </div>

        <p className="text-lg font-serif italic text-echo-text leading-relaxed py-4">
          "Sitting in a bustling campus café, watching everyone laugh with friends, wondering if they also sometimes feel this invisible ache."
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-echo-border/50 text-xs text-echo-muted">
          <span>By: Wandering Spirit</span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary">
              <Heart className="w-3.5 h-3.5 mr-1" /> Send Empathy
            </Button>
          </div>
        </div>
      </Card>

      <div className="pt-2">
        <Button size="lg" icon={Shuffle} className="mx-auto">
          Draw Another Thought
        </Button>
      </div>
    </div>
  );
};

export default RandomDiscovery;

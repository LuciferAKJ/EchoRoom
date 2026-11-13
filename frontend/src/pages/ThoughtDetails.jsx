import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card, { CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Heart, MessageCircle, ArrowLeft, Send } from 'lucide-react';

export const ThoughtDetails = () => {
  const { id } = useParams();

  const empathyOptions = [
    'I understand',
    "You're not alone",
    'Sending support',
    'I relate to this',
    'Thank you for sharing',
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/feed" className="inline-flex items-center gap-1.5 text-xs text-echo-muted hover:text-echo-text transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to feed
      </Link>

      {/* Main Thought Card */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-echo-lavender/20 border border-echo-lavender/40 flex items-center justify-center text-echo-lavender text-xs font-semibold">
              M
            </div>
            <div>
              <p className="text-sm font-semibold text-echo-text">Midnight Traveler</p>
              <p className="text-[10px] text-echo-subtle">Shared 2 hours ago</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-echo-periwinkle/15 text-echo-periwinkle border border-echo-periwinkle/30">
            Hopeful
          </span>
        </div>

        <p className="text-base text-echo-text leading-relaxed font-serif italic py-2">
          "Sometimes the hardest step is simply allowing yourself to rest without the weight of guilt. Today I chose peace over perfection."
        </p>

        {/* Empathy Response Bar */}
        <div className="pt-4 border-t border-echo-border/50 space-y-2">
          <p className="text-xs uppercase tracking-wider text-echo-subtle font-medium">
            Send Anonymous Empathy:
          </p>
          <div className="flex flex-wrap gap-2">
            {empathyOptions.map((item) => (
              <button
                key={item}
                className="px-3 py-1.5 rounded-full text-xs bg-echo-surface border border-echo-border text-echo-muted hover:border-echo-lavender hover:text-echo-lavender transition-all"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Comments / Responses Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-echo-text tracking-tight">
          Warm Responses (3)
        </h3>

        {/* Comment Box */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Write a supportive, kind anonymous response..."
            className="echo-input"
          />
          <Button icon={Send} size="sm">
            Reply
          </Button>
        </div>

        {/* Comments List */}
        <div className="space-y-3 pt-2">
          {[1, 2].map((c) => (
            <Card key={c} padding="sm" className="bg-echo-surface/60">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-medium text-echo-text">Gentle Willow</span>
                <span className="text-[10px] text-echo-subtle">45m ago</span>
              </div>
              <p className="text-xs text-echo-muted leading-relaxed">
                Thank you for this reminder. I really needed to hear it this evening.
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThoughtDetails;


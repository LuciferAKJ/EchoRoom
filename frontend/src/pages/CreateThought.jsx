import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Send, Clock, Sparkles } from 'lucide-react';

export const CreateThought = () => {
  const [emotion, setEmotion] = useState('Hopeful');
  const emotions = [
    'Happy', 'Sad', 'Confused', 'Frustrated', 'Hopeful', 'Lonely', 'Grateful', 'Motivated'
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-echo-text">Release a Thought</h1>
        <p className="text-xs text-echo-muted mt-1">
          Everything you post is anonymous. Speak what weighs on you or what brings you joy.
        </p>
      </div>

      <Card className="p-6 space-y-5">
        {/* Thought Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-echo-muted uppercase tracking-wider">
            Your Anonymous Thought
          </label>
          <textarea
            rows={5}
            placeholder="What is lingering in your mind right now? Speak freely..."
            className="w-full bg-echo-surface border border-echo-border rounded-lg p-3 text-echo-text placeholder-echo-subtle focus:outline-none focus:border-echo-lavender focus:ring-1 focus:ring-echo-lavender/30 transition-all text-sm resize-none"
          ></textarea>
        </div>

        {/* Emotion Picker */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-echo-muted uppercase tracking-wider">
            Primary Emotion
          </label>
          <div className="flex flex-wrap gap-2">
            {emotions.map((emo) => (
              <button
                key={emo}
                type="button"
                onClick={() => setEmotion(emo)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  emotion === emo
                    ? 'bg-echo-lavender text-echo-bg font-semibold shadow-sm'
                    : 'bg-echo-surface border border-echo-border text-echo-muted hover:text-echo-text hover:border-echo-muted/50'
                }`}
              >
                {emo}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Topic & Expiration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Optional Topic / Tag" placeholder="e.g. Life, Exams, Solitude" />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-echo-muted uppercase tracking-wider">
              Thought Lifespan
            </label>
            <select className="w-full bg-echo-surface border border-echo-border rounded-lg px-3 py-2 text-echo-text focus:outline-none focus:border-echo-lavender text-sm">
              <option value="24h">Expires in 24 hours</option>
              <option value="3d">Expires in 3 days</option>
              <option value="7d">Expires in 7 days</option>
              <option value="never">Permanent (Never expires)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-echo-subtle flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-echo-lavender" />
            Posting as: <strong className="text-echo-text font-medium">Quiet Wanderer</strong>
          </span>
          <Button icon={Send} size="md">
            Release Thought
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CreateThought;

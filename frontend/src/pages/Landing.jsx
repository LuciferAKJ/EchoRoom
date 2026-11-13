import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, HeartHandshake, EyeOff, Shield, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export const Landing = () => {
  return (
    <div className="space-y-12 py-8 md:py-16">
      {/* Editorial Hero */}
      <section className="text-center max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-echo-lavender/10 border border-echo-lavender/20 text-echo-lavender text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>A safe haven for genuine human thoughts</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-echo-text tracking-tight leading-tight">
          Express yourself freely. <br />
          <span className="text-echo-lavender font-serif italic">Without revealing who you are.</span>
        </h1>
        <p className="text-echo-muted text-base sm:text-lg leading-relaxed">
          EchoRoom is an anonymous sanctuary to release raw thoughts, unburden feelings, and receive heartfelt empathy from people who truly understand.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/feed">
            <Button size="lg" icon={ArrowRight}>
              Explore Thoughts
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="secondary" size="lg">
              Create Anonymous Identity
            </Button>
          </Link>
        </div>
      </section>

      {/* Philosophy Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="space-y-3">
          <div className="w-9 h-9 rounded-lg bg-echo-surface border border-echo-border flex items-center justify-center text-echo-lavender">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-echo-text">Complete Pseudonymity</h3>
          <p className="text-xs text-echo-muted leading-relaxed">
            Your real identity stays completely detached from your public posts. Speak honestly without fear of judgment.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="w-9 h-9 rounded-lg bg-echo-surface border border-echo-border flex items-center justify-center text-echo-coral">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-echo-text">Empathy Over Likes</h3>
          <p className="text-xs text-echo-muted leading-relaxed">
            No vanity counters or algorithms. Connect through five heartfelt responses like "I understand" and "You're not alone".
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="w-9 h-9 rounded-lg bg-echo-surface border border-echo-border flex items-center justify-center text-echo-periwinkle">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-echo-text">Ephemeral Safety</h3>
          <p className="text-xs text-echo-muted leading-relaxed">
            Set thoughts to auto-expire or join real-time fleeting discussion rooms that close peacefully when conversations end.
          </p>
        </Card>
      </section>
    </div>
  );
};

export default Landing;


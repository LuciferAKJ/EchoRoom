import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Shuffle, Heart, MessageCircle, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { getEmotionStyle, formatRelativeTime } from '../utils/emotionTheme';
import api from '../api/client';

export const RandomDiscovery = () => {
  const [thought, setThought] = useState(null);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  const fetchRandomThought = async () => {
    setLoading(true);
    try {
      const res = await api.get('/thoughts/discover');
      if (res.data.success && res.data.data) {
        setThought(res.data.data);
        setEmpty(false);
      } else {
        setThought(null);
        setEmpty(true);
      }
    } catch (err) {
      console.error('Failed to draw random thought:', err);
      setEmpty(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomThought();
  }, []);

  const author = thought?.authorIdentity || {};
  const pseudonym = author.pseudonym || 'Wandering Soul';
  const avatarColor = author.avatarColor || '#b4a0e5';
  const emotionStyle = thought ? getEmotionStyle(thought.emotion) : null;

  return (
    <div className="max-w-xl mx-auto space-y-8 py-6 sm:py-10 text-center">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-echo-lavender/10 border border-echo-lavender/20 text-echo-lavender text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Serendipitous Discovery</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-echo-text">
          Draw an Ephemeral Thought
        </h1>
        <p className="text-xs text-echo-muted max-w-md mx-auto">
          Draw a single unread thought released by an anonymous soul somewhere in the world.
        </p>
      </div>

      {loading ? (
        <Card padding="lg" className="min-h-[260px] flex flex-col items-center justify-center space-y-3 animate-pulse border-echo-border/60">
          <RefreshCw className="w-6 h-6 text-echo-lavender animate-spin" />
          <p className="text-xs text-echo-subtle font-serif italic">Listening to the quiet echoes...</p>
        </Card>
      ) : empty || !thought ? (
        <Card padding="lg" className="py-12 space-y-4">
          <p className="text-sm text-echo-muted">
            The echoes are currently silent. Share a thought to start the stream.
          </p>
          <Link to="/create">
            <Button size="sm">Share the First Thought</Button>
          </Link>
        </Card>
      ) : (
        <Card
          padding="lg"
          className="text-left space-y-6 shadow-elevated border-echo-lavender/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-echo-bg text-xs font-bold"
                style={{ backgroundColor: avatarColor }}
              >
                {pseudonym.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-medium text-echo-text">{pseudonym}</p>
                <p className="text-[10px] text-echo-subtle">{formatRelativeTime(thought.createdAt)}</p>
              </div>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${emotionStyle?.badge}`}
            >
              <span className={`w-1 h-1 rounded-full ${emotionStyle?.dot}`}></span>
              {thought.emotion}
            </span>
          </div>

          <p className="text-base sm:text-lg font-serif italic text-echo-text leading-relaxed py-2 whitespace-pre-wrap">
            "{thought.content}"
          </p>

          {thought.topics && thought.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {thought.topics.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded text-[10px] bg-echo-surface border border-echo-border/60 text-echo-subtle"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-echo-border/50 text-xs text-echo-muted">
            <span>{thought.empathyCounts?.total || 0} empathetic touches</span>
            <Link to={`/thought/${thought._id}`}>
              <Button size="sm" variant="secondary" icon={ArrowRight}>
                View Discussion
              </Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="pt-2">
        <Button size="lg" icon={Shuffle} onClick={fetchRandomThought} loading={loading} className="mx-auto">
          Draw Another Thought
        </Button>
      </div>
    </div>
  );
};

export default RandomDiscovery;

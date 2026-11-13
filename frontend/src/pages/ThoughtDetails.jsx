import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card, { CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Heart, MessageCircle, ArrowLeft, Send, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { getEmotionStyle, formatRelativeTime } from '../utils/emotionTheme';
import api from '../api/client';

export const ThoughtDetails = () => {
  const { id } = useParams();
  const [thought, setThought] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const empathyOptions = [
    { label: 'I understand', key: 'understand' },
    { label: "You're not alone", key: 'not_alone' },
    { label: 'Sending support', key: 'support' },
    { label: 'I relate to this', key: 'relate' },
    { label: 'Thank you for sharing', key: 'thanks' },
  ];

  useEffect(() => {
    const fetchThought = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await api.get(`/thoughts/${id}`);
        if (res.data.success) {
          setThought(res.data.data);
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Thought not found or has expired.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchThought();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 py-8 animate-pulse">
        <div className="h-4 w-24 bg-echo-surface rounded"></div>
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-echo-surface"></div>
            <div className="space-y-2">
              <div className="h-3 w-32 bg-echo-surface rounded"></div>
              <div className="h-2 w-20 bg-echo-surface rounded"></div>
            </div>
          </div>
          <div className="h-20 bg-echo-surface/60 rounded"></div>
        </Card>
      </div>
    );
  }

  if (errorMsg || !thought) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto text-echo-rose" />
        <h2 className="text-xl font-serif font-bold text-echo-text">Thought Unavailable</h2>
        <p className="text-xs text-echo-muted">
          {errorMsg || 'This reflection is no longer wandering in the active stream.'}
        </p>
        <div className="pt-2">
          <Link to="/feed">
            <Button size="sm" icon={ArrowLeft}>
              Return to Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const author = thought.authorIdentity || {};
  const pseudonym = author.pseudonym || 'Quiet Wanderer';
  const avatarColor = author.avatarColor || '#b4a0e5';
  const emotionStyle = getEmotionStyle(thought.emotion);

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      <Link
        to="/feed"
        className="inline-flex items-center gap-1.5 text-xs text-echo-muted hover:text-echo-text transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to thought stream
      </Link>

      {/* Main Thought Card */}
      <Card padding="lg" className="space-y-5 shadow-elevated">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-echo-bg text-sm font-bold shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {pseudonym.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-echo-text">{pseudonym}</p>
              <div className="flex items-center gap-2 text-[10px] text-echo-subtle">
                <span>Shared {formatRelativeTime(thought.createdAt)}</span>
                {thought.expirationSetting !== 'never' && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Lifespan: {thought.expirationSetting}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${emotionStyle.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${emotionStyle.dot}`}></span>
            {thought.emotion}
          </span>
        </div>

        <p className="text-base sm:text-lg text-echo-text leading-relaxed font-serif italic py-2 whitespace-pre-wrap">
          "{thought.content}"
        </p>

        {thought.topics && thought.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {thought.topics.map((t) => (
              <span
                key={t}
                className="px-2.5 py-0.5 rounded text-xs bg-echo-surface border border-echo-border/60 text-echo-muted"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Empathy Response Section */}
        <div className="pt-4 border-t border-echo-border/50 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-wider text-echo-subtle font-medium">
              Send Anonymous Empathy:
            </span>
            <span className="text-echo-lavender font-medium">
              {thought.empathyCounts?.total || 0} received
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {empathyOptions.map((item) => (
              <button
                key={item.key}
                className="px-3 py-1.5 rounded-full text-xs bg-echo-surface border border-echo-border text-echo-muted hover:border-echo-lavender hover:text-echo-lavender transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Responses Placeholder for Step 6 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-echo-text tracking-tight flex items-center gap-2">
          <span>Responses</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-echo-surface text-echo-subtle border border-echo-border">
            {thought.commentCount || 0}
          </span>
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
      </div>
    </div>
  );
};

export default ThoughtDetails;

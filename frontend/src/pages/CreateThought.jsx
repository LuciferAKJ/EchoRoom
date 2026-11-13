import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Send, Clock, Sparkles, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EMOTIONS, getEmotionStyle } from '../utils/emotionTheme';
import api from '../api/client';

export const CreateThought = () => {
  const { user, identity, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState('Hopeful');
  const [topicsInput, setTopicsInput] = useState('');
  const [expirationSetting, setExpirationSetting] = useState('never');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!content.trim() || content.trim().length < 3) {
      setErrorMsg('Please share a thought with at least 3 characters.');
      return;
    }

    if (content.trim().length > 2000) {
      setErrorMsg('Thoughts are limited to 2000 characters to maintain intimacy.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/thoughts', {
        content: content.trim(),
        emotion,
        topics: topicsInput,
        expirationSetting,
      });

      if (res.data.success) {
        navigate('/feed');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to release thought. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-5">
        <div className="w-12 h-12 mx-auto rounded-xl bg-echo-lavender/15 border border-echo-lavender/30 flex items-center justify-center text-echo-lavender">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-echo-text">Join the Stream</h2>
        <p className="text-xs text-echo-muted leading-relaxed">
          Create an anonymous identity to express your personal thoughts and receive heartfelt empathy from strangers.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/login">
            <Button variant="secondary" size="md" icon={LogIn}>
              Log In
            </Button>
          </Link>
          <Link to="/register">
            <Button size="md">
              Create Identity
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const pseudonym = identity?.pseudonym || 'Quiet Wanderer';
  const avatarColor = identity?.avatarColor || '#b4a0e5';

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      <div>
        <h1 className="text-2xl font-serif font-bold text-echo-text">Release a Thought</h1>
        <p className="text-xs text-echo-muted mt-1">
          Everything you publish is posted under your pseudonym. Speak what weighs on you or what brings you solace.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-echo-rose/15 border border-echo-rose/30 flex items-center gap-2 text-xs text-echo-rose">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thought Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-echo-muted uppercase tracking-wider">
                Your Anonymous Thought
              </label>
              <span className={`text-[11px] ${content.length > 1900 ? 'text-echo-coral font-medium' : 'text-echo-subtle'}`}>
                {content.length}/2000
              </span>
            </div>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What thoughts are lingering in your mind right now? Speak freely and without fear of judgment..."
              className="w-full bg-echo-surface border border-echo-border rounded-lg p-3.5 text-echo-text placeholder-echo-subtle focus:outline-none focus:border-echo-lavender focus:ring-1 focus:ring-echo-lavender/30 transition-all text-sm resize-none leading-relaxed"
              required
            ></textarea>
          </div>

          {/* Emotion Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-echo-muted uppercase tracking-wider">
              Primary Emotion
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map((emo) => {
                const isSelected = emotion === emo;
                const style = getEmotionStyle(emo);
                return (
                  <button
                    key={emo}
                    type="button"
                    onClick={() => setEmotion(emo)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? `${style.badge} font-semibold ring-1 ring-echo-lavender/50 shadow-sm`
                        : 'bg-echo-surface border border-echo-border text-echo-muted hover:text-echo-text hover:border-echo-muted/50'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? style.dot : 'bg-echo-subtle'}`}></span>
                    <span>{emo}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Topics & Expiration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Topics (Comma-separated)"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              placeholder="e.g. exams, burnout, solitude"
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-echo-muted uppercase tracking-wider">
                Thought Lifespan
              </label>
              <select
                value={expirationSetting}
                onChange={(e) => setExpirationSetting(e.target.value)}
                className="w-full bg-echo-surface border border-echo-border rounded-lg px-3 py-2.5 text-echo-text focus:outline-none focus:border-echo-lavender text-sm"
              >
                <option value="never">Permanent (Never expires)</option>
                <option value="24h">Expires in 24 hours</option>
                <option value="3d">Expires in 3 days</option>
                <option value="7d">Expires in 7 days</option>
              </select>
            </div>
          </div>

          {/* Footer Capsule & Action */}
          <div className="pt-2 border-t border-echo-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-echo-bg text-xs font-bold"
                style={{ backgroundColor: avatarColor }}
              >
                {pseudonym.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-echo-subtle">
                Posting as: <strong className="text-echo-text font-medium">{pseudonym}</strong>
              </span>
            </div>

            <Button type="submit" icon={Send} size="md" loading={isSubmitting}>
              Release Thought
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateThought;

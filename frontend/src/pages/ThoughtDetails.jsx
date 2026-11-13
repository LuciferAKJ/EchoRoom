import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card, { CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  Heart,
  MessageCircle,
  ArrowLeft,
  Send,
  Sparkles,
  Clock,
  AlertCircle,
  Bookmark,
  Trash2,
} from 'lucide-react';
import { getEmotionStyle, formatRelativeTime } from '../utils/emotionTheme';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export const ThoughtDetails = () => {
  const { id } = useParams();
  const { user, identity, isAuthenticated } = useAuth();

  const [thought, setThought] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Empathy State
  const [empathyCounts, setEmpathyCounts] = useState({
    understand: 0,
    notAlone: 0,
    support: 0,
    relate: 0,
    thanks: 0,
    total: 0,
  });
  const [userReactions, setUserReactions] = useState([]);
  const [reacting, setReacting] = useState(false);

  // Bookmark State
  const [isSaved, setIsSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);

  // Comments State
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');

  const empathyConfig = [
    { key: 'understand', label: 'I understand', countKey: 'understand' },
    { key: 'not_alone', label: "You're not alone", countKey: 'notAlone' },
    { key: 'support', label: 'Sending support', countKey: 'support' },
    { key: 'relate', label: 'I relate to this', countKey: 'relate' },
    { key: 'thanks', label: 'Thank you for sharing', countKey: 'thanks' },
  ];

  // Fetch Thought, Empathy, Bookmark status, and Comments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const thoughtRes = await api.get(`/thoughts/${id}`);
        if (thoughtRes.data.success) {
          const t = thoughtRes.data.data;
          setThought(t);
          if (t.empathyCounts) {
            setEmpathyCounts(t.empathyCounts);
          }
        }

        // Fetch user reactions breakdown
        try {
          const empRes = await api.get(`/thoughts/${id}/empathy`);
          if (empRes.data.success) {
            setUserReactions(empRes.data.userReactions || []);
            if (empRes.data.empathyCounts) {
              setEmpathyCounts(empRes.data.empathyCounts);
            }
          }
        } catch (e) {
          // Guest mode fallback
        }

        // Check if saved (if authenticated)
        if (isAuthenticated) {
          try {
            const savedRes = await api.get(`/thoughts/${id}/is-saved`);
            if (savedRes.data.success) {
              setIsSaved(savedRes.data.isSaved);
            }
          } catch (e) {}
        }

        // Fetch comments
        const commentsRes = await api.get(`/thoughts/${id}/comments`);
        if (commentsRes.data.success) {
          setComments(commentsRes.data.data || []);
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Thought not found or has expired.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, isAuthenticated]);

  // Handle Empathy Reaction Toggle
  const handleToggleEmpathy = async (reactionType) => {
    if (!isAuthenticated) {
      alert('Please log in or create an anonymous identity to send empathy.');
      return;
    }
    if (reacting) return;

    setReacting(true);
    try {
      const res = await api.post(`/thoughts/${id}/empathy`, { reactionType });
      if (res.data.success) {
        setEmpathyCounts(res.data.empathyCounts);
        if (res.data.action === 'added') {
          setUserReactions((prev) => [...prev, reactionType]);
        } else {
          setUserReactions((prev) => prev.filter((r) => r !== reactionType));
        }
      }
    } catch (err) {
      console.error('Failed to toggle empathy:', err);
    } finally {
      setReacting(false);
    }
  };

  // Handle Bookmark Toggle
  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      alert('Please log in to save thoughts to your personal bookmarks.');
      return;
    }
    if (savingBookmark) return;

    setSavingBookmark(true);
    try {
      const res = await api.post(`/thoughts/${id}/save`);
      if (res.data.success) {
        setIsSaved(res.data.isSaved);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setSavingBookmark(false);
    }
  };

  // Handle Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    setCommentError('');

    if (!commentText.trim()) return;

    if (!isAuthenticated) {
      setCommentError('Please log in to leave an anonymous response.');
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await api.post(`/thoughts/${id}/comments`, {
        content: commentText.trim(),
      });
      if (res.data.success) {
        setComments((prev) => [...prev, res.data.data]);
        setCommentText('');
        setThought((prev) => ({
          ...prev,
          commentCount: (prev.commentCount || 0) + 1,
        }));
      }
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to submit response.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to remove this response?')) return;

    try {
      const res = await api.delete(`/thoughts/${id}/comments/${commentId}`);
      if (res.data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        setThought((prev) => ({
          ...prev,
          commentCount: Math.max(0, (prev.commentCount || 1) - 1),
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove response.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 py-8 animate-pulse">
        <div className="h-4 w-28 bg-echo-surface rounded"></div>
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-echo-surface"></div>
            <div className="space-y-2">
              <div className="h-3 w-32 bg-echo-surface rounded"></div>
              <div className="h-2 w-20 bg-echo-surface rounded"></div>
            </div>
          </div>
          <div className="h-24 bg-echo-surface/60 rounded"></div>
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

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${emotionStyle.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${emotionStyle.dot}`}></span>
              {thought.emotion}
            </span>

            <button
              onClick={handleToggleBookmark}
              title={isSaved ? 'Remove bookmark' : 'Save bookmark'}
              className={`p-2 rounded-lg border transition-all ${
                isSaved
                  ? 'bg-echo-lavender/20 border-echo-lavender text-echo-lavender shadow-sm'
                  : 'bg-echo-surface border-echo-border text-echo-subtle hover:text-echo-text hover:border-echo-muted/50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-echo-lavender' : ''}`} />
            </button>
          </div>
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

        {/* Empathy Response Bar */}
        <div className="pt-4 border-t border-echo-border/50 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-wider text-echo-subtle font-medium">
              Send Anonymous Empathy
            </span>
            <span className="text-echo-lavender font-semibold">
              {empathyCounts.total || 0} empathetic {empathyCounts.total === 1 ? 'touch' : 'touches'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {empathyConfig.map((item) => {
              const hasReacted = userReactions.includes(item.key);
              const count = empathyCounts[item.countKey] || 0;
              return (
                <button
                  key={item.key}
                  onClick={() => handleToggleEmpathy(item.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    hasReacted
                      ? 'bg-echo-lavender/20 border-echo-lavender text-echo-lavender shadow-sm ring-1 ring-echo-lavender/30'
                      : 'bg-echo-surface border-echo-border text-echo-muted hover:border-echo-lavender/60 hover:text-echo-text'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${hasReacted ? 'fill-echo-lavender text-echo-lavender' : ''}`} />
                  <span>{item.label}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${hasReacted ? 'bg-echo-lavender/30 text-echo-text' : 'bg-echo-card text-echo-subtle'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Responses Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-echo-text tracking-tight flex items-center gap-2">
          <span>Warm Responses</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-echo-surface text-echo-subtle border border-echo-border">
            {comments.length}
          </span>
        </h3>

        {/* Add Comment Input */}
        <form onSubmit={handleAddComment} className="space-y-2">
          {commentError && (
            <p className="text-xs text-echo-rose">{commentError}</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                isAuthenticated
                  ? 'Write a supportive, kind anonymous response...'
                  : 'Log in to leave an anonymous response...'
              }
              disabled={!isAuthenticated || submittingComment}
              className="echo-input flex-1"
            />
            <Button
              type="submit"
              icon={Send}
              size="sm"
              disabled={!isAuthenticated || !commentText.trim()}
              loading={submittingComment}
            >
              Reply
            </Button>
          </div>
        </form>

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-echo-card/40 border border-echo-border/50 text-xs text-echo-subtle font-serif italic">
            No responses yet. Be the first gentle voice to answer this thought.
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {comments.map((comment) => {
              const cAuthor = comment.authorIdentity || {};
              const cPseudonym = cAuthor.pseudonym || 'Kind Stranger';
              const cAvatar = cAuthor.avatarColor || '#b4a0e5';
              const isMine =
                identity && cAuthor._id && identity._id === cAuthor._id;

              return (
                <Card key={comment._id} padding="sm" className="bg-echo-surface/60">
                  <div className="flex items-center justify-between pb-1.5 border-b border-echo-border/30">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-echo-bg text-[10px] font-bold"
                        style={{ backgroundColor: cAvatar }}
                      >
                        {cPseudonym.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-echo-text">
                        {cPseudonym}
                      </span>
                      <span className="text-[10px] text-echo-subtle">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>

                    {(isMine || user?.role === 'admin') && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        title="Delete response"
                        className="text-echo-subtle hover:text-echo-rose p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-echo-text/90 leading-relaxed pt-1.5 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThoughtDetails;

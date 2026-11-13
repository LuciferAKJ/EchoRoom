import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Bookmark, Heart, MessageCircle, Trash2, Sparkles, ArrowRight } from 'lucide-react';
import { getEmotionStyle, formatRelativeTime } from '../utils/emotionTheme';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export const SavedThoughts = () => {
  const { isAuthenticated } = useAuth();
  const [savedList, setSavedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedThoughts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/thoughts/saved');
      if (res.data.success) {
        setSavedList(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load saved thoughts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedThoughts();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleRemoveBookmark = async (thoughtId) => {
    try {
      const res = await api.post(`/thoughts/${thoughtId}/save`);
      if (res.data.success) {
        setSavedList((prev) => prev.filter((item) => item.thought?._id !== thoughtId));
      }
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <Bookmark className="w-10 h-10 mx-auto text-echo-subtle" />
        <h2 className="text-xl font-serif font-bold text-echo-text">Saved Bookmarks</h2>
        <p className="text-xs text-echo-muted">
          Please log in to review the thoughts and reflections you have bookmarked.
        </p>
        <div className="pt-2">
          <Link to="/login">
            <Button size="sm">Log In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-echo-border/60">
        <h1 className="text-2xl font-serif font-bold text-echo-text">Saved Reflections</h1>
        <p className="text-xs text-echo-muted mt-0.5">
          Words that brought you comfort, kept private in your personal bookmarks.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} padding="md" className="animate-pulse space-y-3">
              <div className="h-4 w-32 bg-echo-surface rounded"></div>
              <div className="h-14 bg-echo-surface/60 rounded"></div>
            </Card>
          ))}
        </div>
      ) : savedList.length === 0 ? (
        <Card padding="lg" className="text-center py-12 space-y-3">
          <Bookmark className="w-8 h-8 mx-auto text-echo-subtle" />
          <h3 className="text-base font-semibold text-echo-text">No saved thoughts yet</h3>
          <p className="text-xs text-echo-muted max-w-sm mx-auto">
            When you find a thought that touches you in the stream, click the bookmark icon to save it here for quiet recall.
          </p>
          <div className="pt-2">
            <Link to="/feed">
              <Button size="sm" icon={ArrowRight}>
                Explore Thoughts
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedList.map((item) => {
            const thought = item.thought;
            if (!thought) return null;

            const author = thought.authorIdentity || {};
            const pseudonym = author.pseudonym || 'Quiet Wanderer';
            const avatarColor = author.avatarColor || '#b4a0e5';
            const emotionStyle = getEmotionStyle(thought.emotion);

            return (
              <Card key={item._id} hover padding="md">
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-echo-bg text-xs font-bold"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {pseudonym.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-echo-text">{pseudonym}</span>
                      <span className="text-[10px] text-echo-subtle ml-2">
                        • Saved {formatRelativeTime(item.savedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border flex items-center gap-1 ${emotionStyle.badge}`}
                    >
                      <span className={`w-1 h-1 rounded-full ${emotionStyle.dot}`}></span>
                      {thought.emotion}
                    </span>

                    <button
                      onClick={() => handleRemoveBookmark(thought._id)}
                      title="Remove from bookmarks"
                      className="text-echo-subtle hover:text-echo-rose p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  <p className="text-sm text-echo-text font-serif italic leading-relaxed whitespace-pre-wrap">
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
                </CardContent>

                <CardFooter>
                  <div className="flex items-center gap-4 text-xs text-echo-muted">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5" />
                      <span>{thought.empathyCounts?.total || 0} Empathy</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{thought.commentCount || 0} Responses</span>
                    </span>
                  </div>

                  <Link
                    to={`/thought/${thought._id}`}
                    className="text-xs text-echo-lavender hover:underline font-medium"
                  >
                    View discussion →
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedThoughts;

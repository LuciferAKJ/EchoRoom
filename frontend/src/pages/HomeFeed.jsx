import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Heart, MessageCircle, Search, Filter, Sparkles, Clock, X, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EMOTIONS, getEmotionStyle, formatRelativeTime } from '../utils/emotionTheme';
import api from '../api/client';

export const HomeFeed = () => {
  const { isAuthenticated } = useAuth();
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmotion, setSelectedEmotion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [savedMap, setSavedMap] = useState({});

  const handleToggleSave = async (thoughtId) => {
    if (!isAuthenticated) {
      alert('Please log in to bookmark reflections.');
      return;
    }
    try {
      const res = await api.post(`/thoughts/${thoughtId}/save`);
      if (res.data.success) {
        setSavedMap((prev) => ({ ...prev, [thoughtId]: res.data.isSaved }));
      }
    } catch (e) {
      console.error('Failed to toggle save:', e);
    }
  };

  const fetchThoughts = async () => {
    setLoading(true);
    try {
      let endpoint = '/thoughts';
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 8);

      if (selectedEmotion !== 'All') {
        params.append('emotion', selectedEmotion);
      }
      if (sortBy === 'popular') {
        params.append('sort', 'popular');
      }

      if (activeSearch) {
        endpoint = '/thoughts/search';
        params.append('q', activeSearch);
      }

      const res = await api.get(`${endpoint}?${params.toString()}`);
      if (res.data.success) {
        setThoughts(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to load feed thoughts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThoughts();
  }, [selectedEmotion, activeSearch, sortBy, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchQuery.trim());
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-echo-border/60">
        <div>
          <h1 className="text-2xl font-serif font-bold text-echo-text">Thought Stream</h1>
          <p className="text-xs text-echo-muted mt-0.5">
            Real thoughts released anonymously by fellow souls around the world.
          </p>
        </div>
        <Link to="/create">
          <Button size="sm" icon={Sparkles}>
            Share a Thought
          </Button>
        </Link>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-echo-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search thoughts by keyword or topic..."
            className="w-full bg-echo-surface border border-echo-border rounded-lg pl-9 pr-9 py-2 text-xs text-echo-text placeholder-echo-subtle focus:outline-none focus:border-echo-lavender transition-all"
          />
          {activeSearch && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-2.5 text-echo-subtle hover:text-echo-text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
          <span className="text-xs text-echo-subtle">Sort:</span>
          <button
            onClick={() => {
              setSortBy('newest');
              setPage(1);
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              sortBy === 'newest'
                ? 'bg-echo-card border border-echo-border text-echo-text font-semibold'
                : 'text-echo-muted hover:text-echo-text'
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => {
              setSortBy('popular');
              setPage(1);
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              sortBy === 'popular'
                ? 'bg-echo-card border border-echo-border text-echo-text font-semibold'
                : 'text-echo-muted hover:text-echo-text'
            }`}
          >
            Most Empathy
          </button>
        </div>
      </div>

      {/* Emotion Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => {
            setSelectedEmotion('All');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            selectedEmotion === 'All'
              ? 'bg-echo-lavender text-echo-bg font-semibold shadow-sm'
              : 'bg-echo-surface border border-echo-border text-echo-muted hover:text-echo-text'
          }`}
        >
          All Reflections
        </button>
        {EMOTIONS.map((emo) => {
          const isSelected = selectedEmotion === emo;
          const style = getEmotionStyle(emo);
          return (
            <button
              key={emo}
              onClick={() => {
                setSelectedEmotion(emo);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? `${style.badge} font-semibold ring-1 ring-echo-lavender/50`
                  : 'bg-echo-surface border border-echo-border text-echo-muted hover:text-echo-text hover:border-echo-muted/50'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? style.dot : 'bg-echo-subtle'}`}></span>
              <span>{emo}</span>
            </button>
          );
        })}
      </div>

      {/* Thought Stream List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="md" className="animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-echo-surface"></div>
                <div className="space-y-1">
                  <div className="h-3 w-28 bg-echo-surface rounded"></div>
                  <div className="h-2 w-16 bg-echo-surface rounded"></div>
                </div>
              </div>
              <div className="h-12 bg-echo-surface/60 rounded"></div>
            </Card>
          ))}
        </div>
      ) : thoughts.length === 0 ? (
        <Card padding="lg" className="text-center py-12 space-y-3">
          <Sparkles className="w-8 h-8 mx-auto text-echo-subtle" />
          <h3 className="text-base font-semibold text-echo-text">The stream is quiet here</h3>
          <p className="text-xs text-echo-muted max-w-sm mx-auto">
            {activeSearch
              ? `No thoughts match "${activeSearch}". Try another keyword or clear the search.`
              : `No thoughts have been shared under "${selectedEmotion}" yet. Be the first to express yourself.`}
          </p>
          <div className="pt-2">
            <Link to="/create">
              <Button size="sm">Release the First Thought</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {thoughts.map((thought) => {
            const author = thought.authorIdentity || {};
            const pseudonym = author.pseudonym || 'Quiet Wanderer';
            const avatarColor = author.avatarColor || '#b4a0e5';
            const emotionStyle = getEmotionStyle(thought.emotion);
            const totalEmpathy = thought.empathyCounts?.total || 0;
            const commentCount = thought.commentCount || 0;

            return (
              <Card key={thought._id} hover padding="md">
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-echo-bg text-xs font-bold shrink-0"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {pseudonym.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-echo-text">{pseudonym}</span>
                      <span className="text-[10px] text-echo-subtle ml-2">
                        {formatRelativeTime(thought.createdAt)}
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
                      onClick={() => handleToggleSave(thought._id)}
                      title="Bookmark thought"
                      className={`p-1.5 rounded-lg border transition-all ${
                        savedMap[thought._id]
                          ? 'bg-echo-lavender/20 border-echo-lavender text-echo-lavender'
                          : 'bg-echo-surface border-echo-border text-echo-subtle hover:text-echo-text'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${savedMap[thought._id] ? 'fill-echo-lavender' : ''}`} />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-echo-text leading-relaxed font-sans whitespace-pre-wrap">
                    {thought.content}
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
                    <Link
                      to={`/thought/${thought._id}`}
                      className="hover:text-echo-lavender flex items-center gap-1.5 transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>{totalEmpathy} Empathy</span>
                    </Link>
                    <Link
                      to={`/thought/${thought._id}`}
                      className="hover:text-echo-text flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{commentCount} Responses</span>
                    </Link>
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

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-echo-border/60 text-xs text-echo-muted">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} thoughts)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronLeft}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronRight}
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeFeed;

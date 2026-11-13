import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Users, Plus, MessageSquare, Sparkles, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime } from '../utils/emotionTheme';
import api from '../api/client';

export const DiscussionRooms = () => {
  const { isAuthenticated, identity } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rooms');
      if (res.data.success) {
        setRooms(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !topic.trim()) {
      setFormError('Please fill out both the room title and topic.');
      return;
    }

    if (!isAuthenticated) {
      setFormError('Please log in to open a discussion room.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/rooms', {
        title: title.trim(),
        topic: topic.trim(),
      });

      if (res.data.success) {
        setShowCreateModal(false);
        setTitle('');
        setTopic('');
        navigate(`/rooms/${res.data.data._id}`);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create room.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rooms Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-echo-border/60">
        <div>
          <h1 className="text-2xl font-serif font-bold text-echo-text">Discussion Rooms</h1>
          <p className="text-xs text-echo-muted mt-0.5">
            Real-time, temporary spaces to talk anonymously about shared life moments.
          </p>
        </div>
        <Button
          size="sm"
          icon={Plus}
          onClick={() => {
            if (!isAuthenticated) {
              alert('Please sign in or create an anonymous identity to start a room.');
              return;
            }
            setShowCreateModal(true);
          }}
        >
          Create New Room
        </Button>
      </div>

      {/* Create Room Modal / Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-elevated border-echo-lavender/40">
            <div className="flex items-center justify-between border-b border-echo-border/50 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-echo-lavender" />
                <h3 className="text-base font-semibold text-echo-text">Open a Discussion Room</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-echo-subtle hover:text-echo-text p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-echo-rose/15 border border-echo-rose/30 flex items-center gap-2 text-xs text-echo-rose">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <Input
                label="Room Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Late Night Overthinking"
                required
              />
              <Input
                label="Topic / Subject"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Academics, Loneliness, Healing"
                required
              />

              <div className="text-[11px] text-echo-subtle p-2.5 rounded-lg bg-echo-surface border border-echo-border/60">
                Discussion rooms are peaceful and ephemeral. When you close the room, it concludes gracefully for all participants.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={isSubmitting}>
                  Open Room
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Rooms Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} padding="md" className="animate-pulse space-y-3">
              <div className="h-4 w-32 bg-echo-surface rounded"></div>
              <div className="h-3 w-20 bg-echo-surface/60 rounded"></div>
            </Card>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <Card padding="lg" className="text-center py-12 space-y-3">
          <MessageSquare className="w-8 h-8 mx-auto text-echo-subtle" />
          <h3 className="text-base font-semibold text-echo-text">No active rooms right now</h3>
          <p className="text-xs text-echo-muted max-w-sm mx-auto">
            The halls are quiet. Feel free to open a room and invite strangers to share a kind conversation.
          </p>
          <div className="pt-2">
            <Button
              size="sm"
              icon={Plus}
              onClick={() => {
                if (!isAuthenticated) {
                  alert('Please sign in or create an anonymous identity to start a room.');
                  return;
                }
                setShowCreateModal(true);
              }}
            >
              Open the First Room
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => {
            const creator = room.creatorIdentity || {};
            const creatorPseudonym = creator.pseudonym || 'Quiet Founder';

            return (
              <Card key={room._id} hover padding="md" className="space-y-3">
                <CardHeader>
                  <div>
                    <CardTitle className="text-base font-semibold text-echo-text">
                      {room.title}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs text-echo-muted">
                      Topic: <span className="text-echo-lavender">{room.topic}</span>
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-echo-surface border border-echo-border">
                    <span className="w-2 h-2 rounded-full bg-echo-emerald animate-pulse"></span>
                    <span className="text-echo-emerald font-semibold">
                      {room.activeParticipantsCount || 0}
                    </span>
                    <span className="text-echo-subtle text-[11px]">active</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-xs text-echo-subtle">
                    Started by {creatorPseudonym} • {formatRelativeTime(room.createdAt)}
                  </p>
                </CardContent>

                <CardFooter className="pt-2">
                  <span className="text-[11px] text-echo-subtle">Ephemeral room • Safe space</span>
                  <Link to={`/rooms/${room._id}`}>
                    <Button size="sm" variant="secondary" icon={MessageSquare}>
                      Join Room
                    </Button>
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

export default DiscussionRooms;

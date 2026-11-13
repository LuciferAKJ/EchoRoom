import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  ArrowLeft,
  Users,
  Send,
  ShieldAlert,
  Sparkles,
  AlertCircle,
  DoorOpen,
  PowerOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { formatRelativeTime } from '../utils/emotionTheme';
import api from '../api/client';

export const LiveRoomChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, identity, isAuthenticated } = useAuth();
  const { socket, isConnected } = useSocket();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [participantsCount, setParticipantsCount] = useState(1);
  const [participantsList, setParticipantsList] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isClosed, setIsClosed] = useState(false);
  const [roomError, setRoomError] = useState('');
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect to room via Socket.IO
  useEffect(() => {
    if (!socket || !id) return;

    // Join room
    socket.emit('room:join', { roomId: id });

    // Handle initial join event
    socket.on('room:joined', (data) => {
      setRoom(data.room);
      setMessages(data.messages || []);
      setLoading(false);
    });

    // Handle incoming real-time message
    socket.on('room:message', (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    // Handle participant list updates
    socket.on('room:participants', (data) => {
      setParticipantsCount(data.count || 1);
      setParticipantsList(data.participants || []);
    });

    // Handle room closure event
    socket.on('room:closed', (data) => {
      setIsClosed(true);
      setRoomError(data.message || 'This room has been concluded.');
    });

    // Handle socket errors
    socket.on('room:error', (err) => {
      setRoomError(err.message || 'An error occurred in this room.');
      setLoading(false);
    });

    return () => {
      socket.emit('room:leave', { roomId: id });
      socket.off('room:joined');
      socket.off('room:message');
      socket.off('room:participants');
      socket.off('room:closed');
      socket.off('room:error');
    };
  }, [socket, id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || isClosed) return;

    socket.emit('message:send', {
      roomId: id,
      message: inputText.trim(),
    });

    setInputText('');
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('room:leave', { roomId: id });
    }
    navigate('/rooms');
  };

  const handleCloseRoom = async () => {
    if (!confirm('Are you sure you want to peacefully conclude this discussion room for everyone?')) {
      return;
    }

    try {
      await api.post(`/rooms/${id}/close`);
      setIsClosed(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close room.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-echo-text">Anonymous Room Access</h2>
        <p className="text-xs text-echo-muted">
          Please log in to participate in real-time discussion rooms.
        </p>
        <Link to="/login">
          <Button size="sm">Log In</Button>
        </Link>
      </div>
    );
  }

  const myIdentityId = identity?._id?.toString();
  const isCreator =
    room &&
    (room.creatorIdentity?._id === myIdentityId ||
      room.creatorIdentity === myIdentityId ||
      user?.role === 'admin');

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-130px)] md:h-[calc(100vh-100px)] flex flex-col space-y-3">
      {/* Room Header */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-echo-surface border border-echo-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleLeaveRoom}
            className="text-echo-subtle hover:text-echo-text p-1 transition-colors"
            title="Leave room"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="truncate">
            <h2 className="text-sm font-semibold text-echo-text truncate">
              {room?.title || 'Loading room...'}
            </h2>
            <p className="text-[10px] text-echo-subtle truncate">
              Topic: <span className="text-echo-lavender">{room?.topic || 'General'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-echo-card border border-echo-border">
            <span className="w-1.5 h-1.5 rounded-full bg-echo-emerald animate-pulse"></span>
            <span className="text-echo-emerald font-semibold">{participantsCount}</span>
            <span className="text-echo-subtle text-[11px] hidden sm:inline">online</span>
          </span>

          {isCreator && !isClosed && (
            <Button
              size="sm"
              variant="danger"
              icon={PowerOff}
              onClick={handleCloseRoom}
              title="End room discussion"
            >
              Close Room
            </Button>
          )}

          <Button size="sm" variant="ghost" icon={DoorOpen} onClick={handleLeaveRoom}>
            Leave
          </Button>
        </div>
      </div>

      {/* Error or Closed Notification */}
      {roomError && (
        <div className="p-3 rounded-lg bg-echo-rose/15 border border-echo-rose/30 flex items-center gap-2 text-xs text-echo-rose shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{roomError}</span>
        </div>
      )}

      {/* Messages Canvas */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 rounded-xl bg-echo-card/40 border border-echo-border">
        <div className="text-center py-2">
          <span className="text-[11px] text-echo-subtle px-3 py-1 rounded-full bg-echo-surface border border-echo-border/50">
            Messages in this space are temporary. Speak with kindness and care.
          </span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-echo-subtle font-serif italic">
            Connecting to the echoes...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-xs text-echo-subtle font-serif italic">
            The room is quiet. Break the silence with a gentle greeting.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const sender = msg.senderIdentity || {};
            const senderPseudonym = sender.pseudonym || 'Kind Soul';
            const senderAvatar = sender.avatarColor || '#b4a0e5';
            const isMe =
              myIdentityId &&
              (sender._id === myIdentityId || sender.identityId === myIdentityId);

            return (
              <div
                key={msg._id || idx}
                className={`space-y-1 ${isMe ? 'ml-auto max-w-md text-right' : 'max-w-md text-left'}`}
              >
                <div
                  className={`flex items-center gap-2 text-[11px] ${
                    isMe ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isMe && (
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-echo-bg text-[9px] font-bold"
                      style={{ backgroundColor: senderAvatar }}
                    >
                      {senderPseudonym.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span
                    className={`font-medium ${
                      isMe ? 'text-echo-lavender' : 'text-echo-text'
                    }`}
                  >
                    {isMe ? 'You' : senderPseudonym}
                  </span>
                  <span className="text-[10px] text-echo-subtle">
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed inline-block text-left whitespace-pre-wrap ${
                    isMe
                      ? 'bg-echo-lavender/15 text-echo-text border border-echo-lavender/30 rounded-tr-none'
                      : 'bg-echo-surface text-echo-text border border-echo-border/70 rounded-tl-none'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Bar */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 shrink-0 pt-1">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isClosed
              ? 'This room has concluded.'
              : 'Share a kind message with the room... (Enter to send)'
          }
          disabled={isClosed}
          className="echo-input flex-1"
        />
        <Button
          type="submit"
          icon={Send}
          size="md"
          disabled={isClosed || !inputText.trim()}
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default LiveRoomChat;

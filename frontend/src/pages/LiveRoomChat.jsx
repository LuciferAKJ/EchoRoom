import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, Users, Send, ShieldAlert } from 'lucide-react';

export const LiveRoomChat = () => {
  const { id } = useParams();

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col space-y-3">
      {/* Room Header */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-echo-surface border border-echo-border">
        <div className="flex items-center gap-3">
          <Link to="/rooms" className="text-echo-muted hover:text-echo-text">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-sm font-semibold text-echo-text">Late Night Overthinking</h2>
            <p className="text-[10px] text-echo-subtle">Topic: Insomnia & Life • Room #{id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-echo-card border border-echo-border text-echo-emerald">
            <Users className="w-3.5 h-3.5" /> 4 online
          </span>
          <Button size="sm" variant="ghost">
            Leave Room
          </Button>
        </div>
      </div>

      {/* Messages Canvas */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 rounded-xl bg-echo-card/40 border border-echo-border">
        <div className="text-center py-2">
          <span className="text-[11px] text-echo-subtle px-3 py-1 rounded-full bg-echo-surface border border-echo-border/50">
            Messages disappear when room closes. Be kind.
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-echo-lavender">Gentle Owl</span>
            <span className="text-[10px] text-echo-subtle">02:14 AM</span>
          </div>
          <div className="p-3 rounded-lg bg-echo-surface border border-echo-border/60 max-w-md text-xs text-echo-text leading-relaxed">
            Anyone else find that the quiet of 2 AM makes your mind re-evaluate every life decision?
          </div>
        </div>

        <div className="space-y-1 ml-auto max-w-md text-right">
          <div className="flex items-center justify-end gap-2 text-xs">
            <span className="text-[10px] text-echo-subtle">02:15 AM</span>
            <span className="font-semibold text-echo-periwinkle">You (Quiet Wanderer)</span>
          </div>
          <div className="p-3 rounded-lg bg-echo-lavender/10 border border-echo-lavender/30 text-xs text-echo-text text-left leading-relaxed">
            Every single night. It helps to remind yourself that 2 AM thoughts rarely represent reality accurately.
          </div>
        </div>
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          placeholder="Share an anonymous message with the room..."
          className="echo-input"
        />
        <Button icon={Send} size="md">
          Send
        </Button>
      </div>
    </div>
  );
};

export default LiveRoomChat;

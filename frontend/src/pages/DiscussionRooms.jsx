import React from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Users, Plus, MessageSquare } from 'lucide-react';

export const DiscussionRooms = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-echo-border/60">
        <div>
          <h1 className="text-2xl font-serif font-bold text-echo-text">Discussion Rooms</h1>
          <p className="text-xs text-echo-muted mt-1">
            Real-time, temporary spaces to talk anonymously about shared life moments.
          </p>
        </div>
        <Button size="sm" icon={Plus}>
          Create New Room
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { id: '1', title: 'Late Night Overthinking', topic: 'Insomnia & Life', participants: 4 },
          { id: '2', title: 'Pre-Exam Anxiety Support', topic: 'Academics', participants: 7 },
          { id: '3', title: 'Small Daily Gratitudes', topic: 'Positivity', participants: 2 },
        ].map((room) => (
          <Card key={room.id} hover padding="md" className="space-y-3">
            <CardHeader>
              <div>
                <CardTitle>{room.title}</CardTitle>
                <CardDescription className="mt-0.5">{room.topic}</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-echo-surface border border-echo-border text-echo-muted">
                <Users className="w-3.5 h-3.5 text-echo-emerald" />
                <span>{room.participants} active</span>
              </div>
            </CardHeader>
            <CardFooter className="pt-2">
              <span className="text-[11px] text-echo-subtle">Ephemeral room • Safe space</span>
              <Link to={`/rooms/${room.id}`}>
                <Button size="sm" variant="secondary" icon={MessageSquare}>
                  Join Room
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DiscussionRooms;

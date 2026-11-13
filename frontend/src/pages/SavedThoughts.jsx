import React from 'react';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Bookmark, Heart, MessageCircle, Trash2 } from 'lucide-react';

export const SavedThoughts = () => {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-echo-border/60">
        <h1 className="text-2xl font-serif font-bold text-echo-text">Saved Thoughts</h1>
        <p className="text-xs text-echo-muted mt-1">
          Words that brought you comfort, kept private in your personal bookmarks.
        </p>
      </div>

      <div className="space-y-4">
        {[1, 2].map((item) => (
          <Card key={item} hover padding="md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-echo-text">Anonymous Whisper</span>
                <span className="text-[10px] text-echo-subtle">• Saved yesterday</span>
              </div>
              <button className="text-echo-subtle hover:text-echo-rose transition-colors" title="Remove bookmark">
                <Trash2 className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-echo-text/90 italic font-serif">
                "It is okay if all you did today was breathe and survive. That was enough."
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SavedThoughts;

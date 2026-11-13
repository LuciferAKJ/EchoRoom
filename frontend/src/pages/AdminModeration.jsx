import React from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ShieldAlert, CheckCircle, EyeOff, Ban } from 'lucide-react';

export const AdminModeration = () => {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-echo-border/60">
        <h1 className="text-2xl font-serif font-bold text-echo-text">Moderation Dashboard</h1>
        <p className="text-xs text-echo-muted mt-1">
          Review community reports, triage flagged content, and protect psychological safety.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md">
          <span className="text-xs text-echo-subtle font-medium uppercase tracking-wider">
            Pending Reports
          </span>
          <p className="text-2xl font-bold text-echo-coral mt-1">2</p>
        </Card>
        <Card padding="md">
          <span className="text-xs text-echo-subtle font-medium uppercase tracking-wider">
            Resolved Today
          </span>
          <p className="text-2xl font-bold text-echo-emerald mt-1">14</p>
        </Card>
        <Card padding="md">
          <span className="text-xs text-echo-subtle font-medium uppercase tracking-wider">
            Restricted Accounts
          </span>
          <p className="text-2xl font-bold text-echo-muted mt-1">1</p>
        </Card>
      </div>

      <Card padding="lg" className="space-y-4">
        <CardTitle className="text-base">Pending Flagged Queue</CardTitle>
        <div className="space-y-3">
          {[
            { id: 'rep-1', type: 'Thought', reason: 'Harassment / Hostility', target: '"Some inappropriate text here..."' },
            { id: 'rep-2', type: 'Comment', reason: 'Spam promotion link', target: '"Visit this external link..."' },
          ].map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-xl bg-echo-surface border border-echo-border flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-echo-rose/20 text-echo-rose border border-echo-rose/30">
                    {r.type} Report
                  </span>
                  <span className="text-xs text-echo-muted">Reason: {r.reason}</span>
                </div>
                <p className="text-xs text-echo-text italic font-serif">{r.target}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" icon={CheckCircle}>
                  Dismiss
                </Button>
                <Button size="sm" variant="danger" icon={EyeOff}>
                  Hide Content
                </Button>
                <Button size="sm" variant="danger" icon={Ban}>
                  Restrict
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminModeration;


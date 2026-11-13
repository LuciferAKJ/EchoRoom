import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ShieldAlert, CheckCircle, EyeOff, Trash2, Ban, Filter, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime } from '../utils/emotionTheme';
import api from '../api/client';

export const AdminModeration = () => {
  const { user, isAuthenticated } = useAuth();
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  // Restrict User Modal
  const [restrictModalOpen, setRestrictModalOpen] = useState(false);
  const [selectedUserToRestrict, setSelectedUserToRestrict] = useState(null);
  const [restrictionReason, setRestrictionReason] = useState('Repeated guideline violation');
  const [restrictionDays, setRestrictionDays] = useState('7');
  const [restricting, setRestricting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reports?status=${statusFilter}`);
      if (res.data.success) {
        setReports(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'moderator')) {
      fetchReports();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, statusFilter]);

  const handleTriageAction = async (reportId, actionTaken, newStatus = 'resolved') => {
    try {
      const res = await api.patch(`/admin/reports/${reportId}`, {
        status: newStatus,
        actionTaken,
      });

      if (res.data.success) {
        setActionSuccess(`Report action "${actionTaken}" applied successfully.`);
        setTimeout(() => setActionSuccess(''), 4000);
        fetchReports();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update report.');
    }
  };

  const handleApplyRestriction = async (e) => {
    e.preventDefault();
    if (!selectedUserToRestrict) return;

    setRestricting(true);
    try {
      const res = await api.patch(`/admin/users/${selectedUserToRestrict}/restriction`, {
        isRestricted: true,
        reason: restrictionReason,
        durationDays: restrictionDays,
      });

      if (res.data.success) {
        setActionSuccess(res.data.message);
        setTimeout(() => setActionSuccess(''), 4000);
        setRestrictModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply restriction.');
    } finally {
      setRestricting(false);
    }
  };

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'moderator')) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 mx-auto text-echo-rose" />
        <h2 className="text-xl font-serif font-bold text-echo-text">Moderation Access Restricted</h2>
        <p className="text-xs text-echo-muted">
          This portal requires administrator or safety moderator privileges.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-echo-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-echo-coral/15 text-echo-coral text-xs font-medium mb-1">
            <ShieldAlert className="w-3 h-3" />
            <span>Safety Gatekeeper</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-echo-text">Moderation Dashboard</h1>
          <p className="text-xs text-echo-muted mt-0.5">
            Triage community-reported content, protect psychological safety, and manage account restrictions.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-echo-surface p-1 rounded-lg border border-echo-border">
          {['pending', 'resolved', 'dismissed', 'all'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                statusFilter === st
                  ? 'bg-echo-card text-echo-lavender font-semibold shadow-sm border border-echo-border'
                  : 'text-echo-muted hover:text-echo-text'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-lg bg-echo-emerald/15 border border-echo-emerald/30 flex items-center gap-2 text-xs text-echo-emerald">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Reports Queue */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between border-b border-echo-border/50 pb-3">
          <CardTitle className="text-base">
            Report Queue ({reports.length})
          </CardTitle>
          <span className="text-xs text-echo-subtle capitalize font-mono">
            Filtering: {statusFilter}
          </span>
        </div>

        {loading ? (
          <div className="space-y-3 py-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-echo-surface rounded-xl"></div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <CheckCircle className="w-8 h-8 mx-auto text-echo-emerald/80" />
            <h3 className="text-sm font-semibold text-echo-text">Queue is clear</h3>
            <p className="text-xs text-echo-muted">
              No reports found with status "{statusFilter}".
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => {
              const reporter = r.reporterIdentity || {};
              const reporterName = reporter.pseudonym || 'Anonymous Member';

              return (
                <div
                  key={r._id}
                  className="p-4 rounded-xl bg-echo-surface border border-echo-border flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-echo-coral/20 text-echo-coral border border-echo-coral/30">
                        {r.targetModel} Report
                      </span>
                      <span className="text-xs font-semibold text-echo-text capitalize">
                        Reason: {r.reason?.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-echo-subtle">
                        • Reported {formatRelativeTime(r.createdAt)} by {reporterName}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-echo-card border border-echo-border/60">
                      <p className="text-xs text-echo-text font-serif italic leading-relaxed whitespace-pre-wrap">
                        "{r.contentSnippet}"
                      </p>
                    </div>

                    {r.details && (
                      <p className="text-[11px] text-echo-muted">
                        <strong className="text-echo-text">Reporter notes:</strong> {r.details}
                      </p>
                    )}

                    {r.reviewedBy && (
                      <p className="text-[10px] text-echo-subtle">
                        Action taken: <span className="text-echo-lavender">{r.actionTaken}</span> • Status: {r.status}
                      </p>
                    )}
                  </div>

                  {r.status === 'pending' && (
                    <div className="flex flex-wrap md:flex-col items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={CheckCircle}
                        onClick={() => handleTriageAction(r._id, 'none', 'dismissed')}
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={EyeOff}
                        onClick={() => handleTriageAction(r._id, 'hidden', 'resolved')}
                      >
                        Hide Content
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => handleTriageAction(r._id, 'removed', 'resolved')}
                      >
                        Remove Content
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminModeration;

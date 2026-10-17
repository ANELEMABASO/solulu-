import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
import { readJson } from '../lib/readJson';

interface Draft {
  id: string;
  studentName: string;
  studentNumber: string;
  moduleCode: string;
  to: string;
  subject: string;
  body: string;
  status: 'pending' | 'sent' | 'simulated' | 'rejected' | 'failed';
  createdAt: string;
  note?: string;
}

const STATUS_LABEL: Record<Draft['status'], string> = {
  pending: 'Awaiting approval',
  sent: 'Sent',
  simulated: 'Approved (simulated)',
  rejected: 'Rejected',
  failed: 'Failed',
};

export const DraftApprovals: React.FC<{ onShowToast: (msg: string) => void }> = ({ onShowToast }) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [edits, setEdits] = useState<Record<string, { subject: string; body: string }>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/drafts');
      if (!res.ok) throw new Error((await readJson(res)).error || 'Could not load drafts');
      setDrafts((await readJson(res)).drafts);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load drafts');
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [load]);

  const decide = async (draft: Draft, action: 'approve' | 'reject') => {
    setBusyId(draft.id);
    try {
      const res = await fetch(`/api/drafts/${draft.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'approve' ? edits[draft.id] ?? {} : {}),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || 'Request failed');
      onShowToast(action === 'approve' ? `Approved email to ${draft.studentName}` : `Rejected draft for ${draft.studentName}`);
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setBusyId(null);
      load();
    }
  };

  const pending = drafts.filter((d) => d.status === 'pending');
  const history = drafts.filter((d) => d.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Email Approvals</h2>
          <p className="text-xs text-gray-500 mt-1">
            Solulu Elevate drafts messages to students. Nothing is sent until you approve it here.
          </p>
        </div>
        <button onClick={load} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50" aria-label="Refresh drafts">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl p-4 border border-red-100">{error}</div>}

      {pending.length === 0 && !error && (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-sm text-gray-500">
          No drafts waiting. Ask Solulu Elevate to draft a check-in email for a struggling student.
        </div>
      )}

      {pending.map((draft) => {
        const edit = edits[draft.id] ?? { subject: draft.subject, body: draft.body };
        const busy = busyId === draft.id;
        return (
          <div key={draft.id} className="bg-white rounded-2xl p-6 border border-orange-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-900">
                {draft.studentName} · {draft.studentNumber} · {draft.moduleCode}
              </span>
              <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-bold">{STATUS_LABEL[draft.status]}</span>
            </div>
            <div className="text-xs text-gray-500">To: {draft.to}</div>
            <input
              value={edit.subject}
              onChange={(e) => setEdits((p) => ({ ...p, [draft.id]: { ...edit, subject: e.target.value } }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold"
              aria-label="Email subject"
            />
            <textarea
              value={edit.body}
              onChange={(e) => setEdits((p) => ({ ...p, [draft.id]: { ...edit, body: e.target.value } }))}
              rows={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              aria-label="Email body"
            />
            <div className="flex gap-2 justify-end">
              <button
                disabled={busy}
                onClick={() => decide(draft, 'reject')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button
                disabled={busy}
                onClick={() => decide(draft, 'approve')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#DC2626] text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve &amp; send
              </button>
            </div>
          </div>
        );
      })}

      {history.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3">History</h3>
          <ul className="divide-y divide-gray-100 text-sm">
            {history.map((d) => (
              <li key={d.id} className="py-2 flex justify-between gap-4">
                <span>
                  <span className="font-semibold">{d.studentName}</span> — {d.subject}
                  {d.note && <span className="block text-xs text-gray-500">{d.note}</span>}
                </span>
                <span className="text-xs font-bold text-gray-600 shrink-0">{STATUS_LABEL[d.status]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

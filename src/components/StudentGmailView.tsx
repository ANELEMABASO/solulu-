import React, { useState, useEffect } from 'react';
import {
  Mail,
  Inbox,
  Star,
  Send,
  FileText,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  Calendar,
  User,
  Clock,
  ChevronRight,
  Plus,
  Tag,
  ArrowLeft,
  Smartphone,
  Reply,
  CornerDownLeft,
  Check,
  X,
  MessageSquare,
  Wand2,
} from 'lucide-react';
import { DemoEmail, EmailReply } from '../types';
import { CURRENT_LECTURER } from '../data/unisaData';
import { readJson } from '../lib/readJson';

interface StudentGmailViewProps {
  role?: 'student' | 'lecturer';
  onOpenSaluluWithPrompt?: (prompt: string) => void;
  onNavigateToCalendar?: () => void;
}

// The counterpart uses the same mailbox with the other plus-tag, e.g. name+lecturer@gmail.com.
const counterpartAddress = (account: string, role: 'student' | 'lecturer') =>
  account.replace(`+${role}@`, `+${role === 'student' ? 'lecturer' : 'student'}@`);

export const StudentGmailView: React.FC<StudentGmailViewProps> = ({
  role = 'student',
  onOpenSaluluWithPrompt,
  onNavigateToCalendar,
}) => {
  const [emails, setEmails] = useState<DemoEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<DemoEmail | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [gmailAccount, setGmailAccount] = useState('');
  const [inboxError, setInboxError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newTo, setNewTo] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  // Email Reply state for mobile & desktop
  const [isReplying, setIsReplying] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replySuccessMessage, setReplySuccessMessage] = useState<string | null>(null);
  const [isAiGeneratingDraft, setIsAiGeneratingDraft] = useState(false);

  const mcpStatus = { lastSync: new Date().toLocaleTimeString() };
  const unreadCount = emails.filter((email) => email.isUnread).length;

  useEffect(() => {
    void refreshInbox();
    fetch(`/api/gmail/status?role=${role}`)
      .then(async (response) => {
        const result = await readJson(response);
        if (!response.ok) throw new Error(result.error || 'Could not connect to Gmail.');
        setGmailAccount(result.account);
        setNewTo(counterpartAddress(result.account, role));
      })
      .catch((error) => setInboxError(error instanceof Error ? error.message : 'Could not connect to Gmail.'));
  }, []);

  const refreshInbox = async (query = '') => {
    setIsSyncing(true);
    setInboxError(null);
    try {
      const params = new URLSearchParams({ role });
      if (query) params.set('q', query);
      const response = await fetch(`/api/gmail/messages?${params}`);
      const result = await readJson(response);
      if (!response.ok) throw new Error(result.error || 'Could not load the Gmail inbox.');
      const freshEmails = result.messages as DemoEmail[];
      setEmails(freshEmails);
      setSelectedEmail((current) =>
        current ? freshEmails.find((email) => email.id === current.id) || current : freshEmails[0] || null
      );
    } catch (error) {
      setInboxError(error instanceof Error ? error.message : 'Could not load the Gmail inbox.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncMcp = async () => {
    await refreshInbox(searchQuery);
  };

  const handleSelectEmail = async (email: DemoEmail) => {
    setSelectedEmail(email);
    setIsReplying(false);
    setReplyBody('');
    setReplySuccessMessage(null);
    setInboxError(null);
    try {
      const response = await fetch(`/api/gmail/messages/${encodeURIComponent(email.id)}`);
      const result = await readJson(response);
      if (!response.ok) throw new Error(result.error || 'Could not load this message.');
      setSelectedEmail(result as DemoEmail);
    } catch (error) {
      setInboxError(error instanceof Error ? error.message : 'Could not load this message.');
    }
  };

  const handleBackToListMobile = () => {
    setSelectedEmail(null);
    setIsReplying(false);
    setReplyBody('');
    setReplySuccessMessage(null);
  };

  const handleApplyQuickReply = (text: string) => {
    setIsReplying(true);
    setReplyBody(text);
  };

  const handleGenerateAiDraftReply = async () => {
    if (!selectedEmail) return;
    setIsAiGeneratingDraft(true);
    setIsReplying(true);

    let draftContent = '';
    if (role === 'lecturer') {
      draftContent = `Dear ${selectedEmail.fromName},\n\nThank you for your message. I have reviewed it and will follow up with you shortly. You are welcome to attend my consultation session if you would like to discuss this further.\n\nKind regards,\n${CURRENT_LECTURER.name}\nCS204 Lecturer, UNISA`;
    } else if (selectedEmail.subject.toLowerCase().includes('feedback') || selectedEmail.subject.toLowerCase().includes('assignment')) {
      draftContent = `Dear ${selectedEmail.fromName},\n\nThank you very much for reviewing my assignment and for the detailed, constructive feedback. I am glad that the implementation met the distinction standard.\n\nI would be delighted to attend your academic consultation session on Tuesday at 14:00 (Room C1.08) to discuss preparing for the upcoming semester examination.\n\nKind regards,\nMabaso Cele\nStudent Number: 67283910\nSent from myUNISA Mobile`;
    } else if (selectedEmail.category === 'exams') {
      draftContent = `Dear UNISA Examinations Directorate,\n\nI acknowledge receipt of the final May/June 2026 examination timetable for CS204 and CS201. I have recorded the dates on my academic calendar and will complete the online mock proctoring verification ahead of the deadline.\n\nThank you for the notification.\n\nKind regards,\nMabaso Cele (67283910)\nSent from myUNISA Mobile`;
    } else {
      draftContent = `Dear ${selectedEmail.fromName},\n\nThank you for this update. I have reviewed the details and will follow up accordingly.\n\nKind regards,\nMabaso Cele\nUNISA Student No: 67283910\nSent from myUNISA Mobile`;
    }

    setReplyBody(draftContent);
    setIsAiGeneratingDraft(false);
  };

  const handleSendReply = async (device: 'mobile' | 'web' = 'mobile') => {
    if (!selectedEmail || !replyBody.trim()) return;
    setIsSendingReply(true);
    setInboxError(null);
    try {
      const response = await fetch('/api/gmail/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: selectedEmail.id, body: replyBody.trim(), role }),
      });
      const result = await readJson(response);
      if (!response.ok) throw new Error(result.error || 'Gmail could not send this reply.');
      setReplySuccessMessage(`Email sent successfully to ${result.to} via ${device === 'mobile' ? 'Mobile Phone' : 'Web'}.`);
      setReplyBody('');
      setIsReplying(false);
      window.setTimeout(() => setReplySuccessMessage(null), 4500);
    } catch (error) {
      setInboxError(error instanceof Error ? error.message : 'Gmail could not send this reply.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleAskAgentToRead = () => {
    if (onOpenSaluluWithPrompt) {
      const context = emails
        .map((email) => `From: ${email.fromName} <${email.from}>\nSubject: ${email.subject}\nPreview: ${email.snippet}`)
        .join('\n\n');
      onOpenSaluluWithPrompt(`Summarize these messages currently loaded from my real Gmail inbox:\n\n${context}`);
    }
  };

  const handleAskAgentAboutEmail = (email: DemoEmail) => {
    if (onOpenSaluluWithPrompt) {
      onOpenSaluluWithPrompt(
        `Analyze this Gmail message from "${email.fromName}" regarding "${email.subject}" and suggest next steps:\n\n${email.body}`
      );
    }
  };

  const handleCreateTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTo.trim() || !newSubject.trim() || !newBody.trim()) return;
    setInboxError(null);
    try {
      const response = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: newTo.trim(), subject: newSubject.trim(), body: newBody.trim(), role }),
      });
      const result = await readJson(response);
      if (!response.ok) throw new Error(result.error || 'Gmail could not send this email.');
      setActionMessage(`Email sent successfully to ${result.to}.`);
      setIsComposeOpen(false);
      setNewSubject('');
      setNewBody('');
      window.setTimeout(() => setActionMessage(null), 5000);
    } catch (error) {
      setInboxError(error instanceof Error ? error.message : 'Gmail could not send this email.');
    }
  };

  const filteredEmails = emails.filter((email) => {
    if (filterCategory === 'unread') return email.isUnread;
    if (filterCategory === 'starred') return email.isStarred;
    if (filterCategory === 'academic') return email.category === 'academic';
    if (filterCategory === 'exams') return email.category === 'exams';
    if (filterCategory === 'alerts') return email.category === 'alerts';
    return true;
  }).filter((email) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      email.subject.toLowerCase().includes(q) ||
      email.fromName.toLowerCase().includes(q) ||
      email.body.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {(inboxError || actionMessage) && (
        <div className={`rounded-lg border p-3 text-sm ${inboxError ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
          <div className="flex items-center justify-between gap-3">
            <span>{inboxError || actionMessage}</span>
            {inboxError && (
              <button onClick={() => setInboxError(null)} className="font-bold" aria-label="Dismiss error">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Gmail connection status ── */}
      <div className="bg-white rounded-xl p-5 border border-[#E0E0E0] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#EA4335]/10 text-[#EA4335] flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#333333]">Gmail Inbox</h2>
                <span className="bg-[#EA4335] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Gmail
                </span>
              </div>
              <p className="text-xs text-[#666666] flex items-center gap-1.5 mt-0.5">
                <span className="font-semibold text-[#111111]">{gmailAccount || 'Connecting to Gmail...'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Gmail connection badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-2 rounded-lg flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="text-left">
              <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                <span>Google Gmail API</span>
                <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-extrabold">
                  {gmailAccount ? 'CONNECTED' : 'CONNECTING'}
                </span>
              </div>
              <p className="text-[10px] text-emerald-600">
                Inbox read and email send are server-side
              </p>
            </div>
          </div>

          <button
            onClick={handleAskAgentToRead}
            className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>Ask Solulu About Inbox</span>
          </button>

        </div>
      </div>

      {/* ── Main Gmail Interface Layout ── */}
      <div className="bg-white rounded-xl border border-[#E0E0E0] shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[580px]">
        {/* Left Sidebar Navigation */}
        <div className={`w-full md:w-60 border-r border-[#EAEAEA] bg-[#FAFAFA] flex flex-col p-3 shrink-0 ${
          selectedEmail ? 'hidden md:flex' : 'flex'
        }`}>
          <button
            onClick={() => setIsComposeOpen(true)}
            className="w-full mb-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Email</span>
          </button>

          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterCategory('all')}
              className={`flex-shrink-0 md:w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filterCategory === 'all'
                  ? 'bg-[#EAEAEA] text-[#DC2626] font-bold'
                  : 'text-[#555555] hover:bg-[#F0F0F0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4" />
                <span>All Mail</span>
              </div>
              <span className="text-[11px] font-bold text-[#888888] ml-2">{emails.length}</span>
            </button>

            <button
              onClick={() => setFilterCategory('unread')}
              className={`flex-shrink-0 md:w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filterCategory === 'unread'
                  ? 'bg-[#EAEAEA] text-[#DC2626] font-bold'
                  : 'text-[#555555] hover:bg-[#F0F0F0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#EA4335]" />
                <span>Unread</span>
              </div>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-[#DC2626] text-white px-2 py-0.5 rounded-full font-bold ml-2">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterCategory('academic')}
              className={`flex-shrink-0 md:w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filterCategory === 'academic'
                  ? 'bg-[#EAEAEA] text-[#DC2626] font-bold'
                  : 'text-[#555555] hover:bg-[#F0F0F0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-blue-500" />
                <span className="whitespace-nowrap">Feedback</span>
              </div>
            </button>

            <button
              onClick={() => setFilterCategory('exams')}
              className={`flex-shrink-0 md:w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filterCategory === 'exams'
                  ? 'bg-[#EAEAEA] text-[#DC2626] font-bold'
                  : 'text-[#555555] hover:bg-[#F0F0F0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span className="whitespace-nowrap">Exams</span>
              </div>
            </button>

            <button
              onClick={() => setFilterCategory('alerts')}
              className={`flex-shrink-0 md:w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filterCategory === 'alerts'
                  ? 'bg-[#EAEAEA] text-[#DC2626] font-bold'
                  : 'text-[#555555] hover:bg-[#F0F0F0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-emerald-500" />
                <span className="whitespace-nowrap">Alerts</span>
              </div>
            </button>

            <button
              onClick={() => setFilterCategory('starred')}
              className={`flex-shrink-0 md:w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filterCategory === 'starred'
                  ? 'bg-[#EAEAEA] text-[#DC2626] font-bold'
                  : 'text-[#555555] hover:bg-[#F0F0F0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="whitespace-nowrap">Starred</span>
              </div>
            </button>
          </nav>

          <div className="mt-auto pt-4 border-t border-[#EAEAEA] hidden md:block">
            <div className="p-3 bg-white rounded-lg border border-[#E0E0E0] text-[11px] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#333333]">Gmail Sync</span>
                <button
                  onClick={handleSyncMcp}
                  disabled={isSyncing}
                  className="text-[#DC2626] hover:underline flex items-center gap-1 font-bold"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>
              <p className="text-[10px] text-[#777777]">
                Last checked at {mcpStatus.lastSync}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Email Thread List */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-[#EAEAEA] flex flex-col shrink-0 ${
          selectedEmail ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Search bar */}
          <div className="p-3 border-b border-[#EAEAEA] bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F5F5F5] rounded-lg border border-[#E0E0E0] focus:outline-hidden focus:border-[#DC2626]"
              />
            </div>
          </div>

          {/* Email Item Cards */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#EAEAEA] bg-[#FAFAFA]">
            {filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#888888]">
                {isSyncing ? 'Loading inbox...' : 'No emails found matching your filter.'}
              </div>
            ) : (
              filteredEmails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                const replyCount = email.replies?.length || 0;
                return (
                  <div
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    className={`p-3.5 cursor-pointer transition-colors text-left relative ${
                      isSelected
                        ? 'bg-white border-l-4 border-[#DC2626] shadow-xs'
                        : email.isUnread
                        ? 'bg-white font-bold'
                        : 'bg-[#FAFAFA] hover:bg-[#F0F0F0]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        {email.isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#DC2626] shrink-0" />
                        )}
                        <span
                          className={`text-xs truncate ${
                            email.isUnread ? 'font-bold text-[#111111]' : 'text-[#444444]'
                          }`}
                        >
                          {email.fromName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-[#888888]">{email.time}</span>
                        <span title={email.isStarred ? 'Starred in Gmail' : undefined} className="p-0.5">
                          <Star
                            className={`w-3.5 h-3.5 ${
                              email.isStarred ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </span>
                      </div>
                    </div>

                    <h4
                      className={`text-xs truncate leading-snug ${
                        email.isUnread ? 'font-bold text-[#222222]' : 'text-[#555555]'
                      }`}
                    >
                      {email.subject}
                    </h4>

                    <p className="text-[11px] text-[#777777] line-clamp-2 mt-1 leading-normal font-normal">
                      {email.snippet}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        {email.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] bg-[#EAEAEA] text-[#555555] px-1.5 py-0.5 rounded font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {replyCount > 0 && (
                        <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                          <CornerDownLeft className="w-2.5 h-2.5" />
                          <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Email Detail & AI Action Bar */}
        <div className={`flex-1 flex flex-col bg-white overflow-y-auto ${
          !selectedEmail ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedEmail ? (
            <div className="p-4 sm:p-6 space-y-5">
              {/* Mobile Back to Inbox Bar */}
              <div className="flex md:hidden items-center justify-between pb-3 border-b border-[#EAEAEA]">
                <button
                  onClick={handleBackToListMobile}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#DC2626] hover:text-[#B91C1C] py-1 px-2 -ml-2 rounded-lg active:bg-red-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Inbox</span>
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                    Phone Optimized
                  </span>
                </div>
              </div>

              {/* Notification Banner when reply sent */}
              {replySuccessMessage && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-center justify-between gap-2 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{replySuccessMessage}</span>
                  </div>
                  <button
                    onClick={() => setReplySuccessMessage(null)}
                    className="text-emerald-700 hover:text-emerald-900"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Header */}
              <div className="border-b border-[#EAEAEA] pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-lg font-bold text-[#222222] leading-snug break-words">
                      {selectedEmail.subject}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
                      <span className="text-xs font-bold text-[#111111]">
                        {selectedEmail.fromName}
                      </span>
                      <span className="text-xs text-[#777777] break-all">
                        &lt;{selectedEmail.from}&gt;
                      </span>
                      <span className="text-xs text-[#999999] break-all">to {selectedEmail.to}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] sm:text-xs text-[#888888] font-medium whitespace-nowrap">
                      {selectedEmail.date} at {selectedEmail.time}
                    </span>
                    <span className="p-1.5 text-gray-400" title={selectedEmail.isStarred ? 'Starred in Gmail' : undefined}>
                      <Star
                        className={`w-4 h-4 ${
                          selectedEmail.isStarred ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </span>
                  </div>
                </div>

                {/* AI Agent Recommendation Banner */}
                {selectedEmail.mcpActionSuggested && (
                  <div className="mt-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide">
                          Solulu Elevate AI Recommendation
                        </span>
                        <p className="text-xs text-blue-800 mt-0.5">
                          {selectedEmail.mcpActionSuggested}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAskAgentAboutEmail(selectedEmail)}
                      className="self-start sm:self-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors shrink-0 shadow-xs"
                    >
                      Execute with AI →
                    </button>
                  </div>
                )}
              </div>

              {/* Email Body */}
              <div className="text-xs sm:text-sm text-[#333333] leading-relaxed whitespace-pre-line font-sans bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                {selectedEmail.body}
              </div>

              {/* Thread Replies (if any already sent) */}
              {selectedEmail.replies && selectedEmail.replies.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#555555]">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Responses & Thread History ({selectedEmail.replies.length})</span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedEmail.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-[#222222] space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-blue-950">{reply.fromName}</span>
                            <span className="text-[11px] text-blue-700 font-medium">({reply.from})</span>
                            {reply.device === 'mobile' && (
                              <span className="text-[9px] bg-blue-200/80 text-blue-900 font-semibold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                <Smartphone className="w-2.5 h-2.5" />
                                Phone
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">{reply.date} at {reply.time}</span>
                        </div>
                        <p className="whitespace-pre-line text-[#333333] leading-relaxed pl-1">
                          {reply.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Reply Chips - Mobile One-Tap Responses */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#666666] flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span>Mobile Quick Responses:</span>
                  </span>
                  <button
                    onClick={handleGenerateAiDraftReply}
                    disabled={isAiGeneratingDraft}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Wand2 className={`w-3 h-3 ${isAiGeneratingDraft ? 'animate-spin' : ''}`} />
                    <span>{isAiGeneratingDraft ? 'Generating Draft...' : 'AI Auto-Draft Reply'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() =>
                      handleApplyQuickReply(
                        'Thank you for the update. I have noted this on my academic schedule and will prepare accordingly.'
                      )
                    }
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-lg transition-colors text-left"
                  >
                    "Thank you, noted on my schedule"
                  </button>
                  <button
                    onClick={() =>
                      handleApplyQuickReply(
                        'Thank you Dr. Vasquez. I will attend the consultation session on Tuesday at 14:00.'
                      )
                    }
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-lg transition-colors text-left"
                  >
                    "I will attend the consultation session"
                  </button>
                  <button
                    onClick={() =>
                      handleApplyQuickReply(
                        'Acknowledged. I will review the feedback and complete the mock exam verification.'
                      )
                    }
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-lg transition-colors text-left"
                  >
                    "Acknowledged, will review feedback"
                  </button>
                </div>
              </div>

              {/* Reply Form / Action Box (Integrated for both Phone & Desktop) */}
              {isReplying ? (
                <div className="pt-4 border-t border-[#EAEAEA] space-y-3 bg-[#FAFAFA] p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Reply className="w-4 h-4 text-[#DC2626]" />
                      <span className="text-xs font-bold text-[#222222]">
                        Replying to {selectedEmail.fromName} &lt;{selectedEmail.from}&gt;
                      </span>
                    </div>
                    <button
                      onClick={() => setIsReplying(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="relative">
                    <textarea
                      rows={4}
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="Write your email response here on your mobile phone..."
                      className="w-full text-xs sm:text-sm p-3 bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] leading-relaxed"
                      autoFocus
                    />
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] text-slate-500">
                        Sending from {gmailAccount || 'connected Gmail account'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSendReply('mobile')}
                          disabled={isSendingReply || !replyBody.trim()}
                          className="bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-slate-300 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>{isSendingReply ? 'Sending...' : 'Send from Phone'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendReply('web')}
                          disabled={isSendingReply || !replyBody.trim()}
                          className="hidden sm:flex bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white text-xs font-bold px-3 py-2 rounded-lg items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Action Buttons */
                <div className="pt-4 border-t border-[#EAEAEA] flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setIsReplying(true)}
                    className="w-full sm:w-auto bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Respond to Email</span>
                  </button>

                  <button
                    onClick={() => handleAskAgentAboutEmail(selectedEmail)}
                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Draft Reply with Solulu AI</span>
                  </button>

                  {selectedEmail.category === 'exams' && onNavigateToCalendar && (
                    <button
                      onClick={onNavigateToCalendar}
                      className="w-full sm:w-auto bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#333333] border border-[#CCCCCC] text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      <span>View Exam in Calendar</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#888888]">
              <Mail className="w-12 h-12 text-[#CCCCCC] mb-2" />
              <p className="text-sm font-semibold">Select an email to view full academic details</p>
              <p className="text-xs text-[#AAAAAA] mt-1">
                Your real Gmail inbox is connected through the local server
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Compose Gmail message ── */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-[#E0E0E0] space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#DC2626]" />
                <h3 className="text-sm font-bold text-[#333333]">Compose Email</h3>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-[#888888] hover:text-[#333333]"
              >
                ✕
              </button>
            </div>

            {inboxError && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                {inboxError}
              </div>
            )}

            <form onSubmit={handleCreateTestEmail} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#555555] block mb-1">To:</label>
                <input
                  type="email"
                  value={newTo}
                  onChange={(e) => setNewTo(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#D5D5D5]"
                  required
                />
                <p className="text-[10px] text-[#777777] mt-1">
                  Sending is limited to the addresses in the server's EMAIL_ALLOWED_RECIPIENTS setting.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#555555] block mb-1">Subject:</label>
                <input
                  type="text"
                  placeholder="Email subject"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#D5D5D5]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#555555] block mb-1">Email Body:</label>
                <textarea
                  rows={4}
                  placeholder="Write your email..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#D5D5D5]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="text-xs px-3 py-2 rounded-lg text-[#666666] hover:bg-[#F0F0F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!gmailAccount || isSendingReply}
                  className="bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-slate-300 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{gmailAccount ? 'Send Email' : 'Connecting...'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

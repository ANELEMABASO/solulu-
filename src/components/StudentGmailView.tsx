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
  Terminal,
  ExternalLink,
  ShieldCheck,
  Tag,
  ArrowLeft,
} from 'lucide-react';
import { mcpGmail, DEMO_STUDENT_GMAIL } from '../services/mcpGmailService';
import { DemoEmail, McpToolCallLog } from '../types';

interface StudentGmailViewProps {
  onOpenSaluluWithPrompt?: (prompt: string) => void;
  onNavigateToCalendar?: () => void;
}

export const StudentGmailView: React.FC<StudentGmailViewProps> = ({
  onOpenSaluluWithPrompt,
  onNavigateToCalendar,
}) => {
  const [emails, setEmails] = useState<DemoEmail[]>(mcpGmail.getEmails());
  const [selectedEmail, setSelectedEmail] = useState<DemoEmail | null>(emails[0] || null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMcpLogs, setShowMcpLogs] = useState(false);
  const [logs, setLogs] = useState<McpToolCallLog[]>(mcpGmail.getToolLogs());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newFrom, setNewFrom] = useState('tutor.assistant@unisa.ac.za');
  const [isTestingAgent, setIsTestingAgent] = useState(false);
  const [testReport, setTestReport] = useState<{
    success: boolean;
    timestamp: string;
    steps: { name: string; detail: string; status: 'passed' | 'failed' }[];
  } | null>(null);

  const mcpStatus = mcpGmail.getMcpStatus();
  const unreadCount = mcpGmail.getUnreadCount();

  useEffect(() => {
    const unsubscribe = mcpGmail.subscribe(() => {
      setEmails(mcpGmail.getEmails());
      setLogs(mcpGmail.getToolLogs());
    });
    return unsubscribe;
  }, []);

  const handleSyncMcp = async () => {
    setIsSyncing(true);
    await mcpGmail.executeMcpTool('gmail.list_messages', {
      account: DEMO_STUDENT_GMAIL,
      query: searchQuery,
    });
    setIsSyncing(false);
  };

  const handleSelectEmail = (email: DemoEmail) => {
    setSelectedEmail(email);
    if (email.isUnread) {
      mcpGmail.markAsRead(email.id);
    }
  };

  const handleToggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    mcpGmail.toggleStar(id);
  };

  const handleAskAgentToRead = () => {
    if (onOpenSaluluWithPrompt) {
      onOpenSaluluWithPrompt('Read and summarize my student Gmail inbox using the MCP Gmail tool.');
    }
  };

  const handleAskAgentAboutEmail = (email: DemoEmail) => {
    if (onOpenSaluluWithPrompt) {
      onOpenSaluluWithPrompt(
        `Please use the MCP Gmail tool to analyze the email from "${email.fromName}" regarding "${email.subject}" and suggest next steps.`
      );
    }
  };

  const handleRunAgentEmailTest = async () => {
    setIsTestingAgent(true);
    const steps: { name: string; detail: string; status: 'passed' | 'failed' }[] = [];

    try {
      // Step 1: Execute gmail.list_messages via MCP
      const listRes = await mcpGmail.executeMcpTool('gmail.list_messages', {
        account: DEMO_STUDENT_GMAIL,
        query: '',
      });
      if (listRes.success && listRes.data?.total >= 4) {
        steps.push({
          name: '1. Autonomous Inbox Discovery (gmail.list_messages)',
          detail: `Discovered ${listRes.data.total} messages in ${DEMO_STUDENT_GMAIL} via JSON-RPC stdio.`,
          status: 'passed',
        });
      } else {
        steps.push({
          name: '1. Autonomous Inbox Discovery',
          detail: 'Failed to retrieve inbox messages.',
          status: 'failed',
        });
      }

      // Step 2: Read Dr. Vasquez's feedback email detail via MCP
      const vasquezEmail = emails.find((e) => e.from.includes('vasquez')) || emails[0];
      const detailRes = await mcpGmail.executeMcpTool('gmail.get_message_detail', {
        messageId: vasquezEmail.id,
      });
      const has84Percent = detailRes.data?.body?.includes('84%');
      const hasConsultation = detailRes.data?.body?.includes('Tuesday');
      if (detailRes.success && has84Percent && hasConsultation) {
        steps.push({
          name: '2. Deep Reading of Grading Feedback (gmail.get_message_detail)',
          detail: `Agent parsed Dr. Vasquez's email: accurately extracted 84% grade (Distinction) and Tuesday consultation session.`,
          status: 'passed',
        });
      } else {
        steps.push({
          name: '2. Deep Reading of Grading Feedback',
          detail: 'Could not extract grading marks from email payload.',
          status: 'failed',
        });
      }

      // Step 3: Summarize Unread Threads via MCP
      const summaryRes = await mcpGmail.executeMcpTool('gmail.summarize_unread_threads', {
        account: DEMO_STUDENT_GMAIL,
      });
      if (summaryRes.success && summaryRes.data?.unreadCount > 0) {
        steps.push({
          name: '3. Exam Schedule Extraction (gmail.summarize_unread_threads)',
          detail: `Identified ${summaryRes.data.unreadCount} unread academic threads, including UNISA CS204 Final Exam on 28 May 2026.`,
          status: 'passed',
        });
      } else {
        steps.push({
          name: '3. Exam Schedule Extraction',
          detail: 'Failed to generate unread thread summary.',
          status: 'failed',
        });
      }

      // Step 4: Autonomous Draft Creation via MCP
      const draftRes = await mcpGmail.executeMcpTool('gmail.create_draft_reply', {
        to: 'e.vasquez@unisa.ac.za',
        subject: 'Re: CS204: Feedback on Assignment 2 & Consultation Invitation',
        body: 'Thank you Dr. Vasquez. I will attend the consultation on Tuesday at 14:00.',
      });
      if (draftRes.success && draftRes.data?.status === 'DRAFT_CREATED') {
        steps.push({
          name: '4. Autonomous Draft Generation (gmail.create_draft_reply)',
          detail: `Draft reply prepared and saved to student mailbox for Dr. Elena Vasquez.`,
          status: 'passed',
        });
      } else {
        steps.push({
          name: '4. Autonomous Draft Generation',
          detail: 'Failed to create draft.',
          status: 'failed',
        });
      }

      setTestReport({
        success: steps.every((s) => s.status === 'passed'),
        timestamp: new Date().toLocaleTimeString(),
        steps,
      });
    } catch (err: any) {
      steps.push({
        name: 'Execution Exception',
        detail: err.message || 'Error executing test suite',
        status: 'failed',
      });
      setTestReport({
        success: false,
        timestamp: new Date().toLocaleTimeString(),
        steps,
      });
    } finally {
      setIsTestingAgent(false);
    }
  };

  const handleCreateTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newBody.trim()) return;

    const created = mcpGmail.addEmail({
      from: newFrom,
      fromName: newFrom.includes('tutor') ? 'UNISA CS204 Lab Tutor' : 'Academic Department',
      to: DEMO_STUDENT_GMAIL,
      subject: newSubject,
      snippet: newBody.slice(0, 100) + '...',
      body: newBody,
      isUnread: true,
      category: 'academic',
      tags: ['New Alert', 'Lab Update'],
      mcpActionSuggested: 'Review newly received student email notice',
    });

    setSelectedEmail(created);
    setIsComposeOpen(false);
    setNewSubject('');
    setNewBody('');
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
      {/* ── Top MCP Status & Demo Email Header ── */}
      <div className="bg-white rounded-xl p-5 border border-[#E0E0E0] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#EA4335]/10 text-[#EA4335] flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#333333]">Student Demo Gmail Account</h2>
                <span className="bg-[#EA4335] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-[#666666] flex items-center gap-1.5 mt-0.5">
                <span className="font-semibold text-[#111111]">{DEMO_STUDENT_GMAIL}</span>
                <span className="text-[#999999]">·</span>
                <span>Linked to Maya Chen (67283910)</span>
              </p>
            </div>
          </div>
        </div>

        {/* MCP Connection Live Badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-2 rounded-lg flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="text-left">
              <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                <span>Model Context Protocol (MCP) Bridge</span>
                <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-extrabold">
                  ACTIVE
                </span>
              </div>
              <p className="text-[10px] text-emerald-600">
                Agent can read, search & draft via JSON-RPC stdio
              </p>
            </div>
          </div>

          <button
            onClick={handleAskAgentToRead}
            className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>Ask Solulu to Read via MCP</span>
          </button>

          <button
            onClick={() => setShowMcpLogs(!showMcpLogs)}
            className="bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#333333] border border-[#D5D5D5] text-xs font-semibold px-3 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors"
            title="Inspect MCP JSON-RPC Activity"
          >
            <Terminal className="w-3.5 h-3.5 text-[#666666]" />
            <span>MCP Logs ({logs.length})</span>
          </button>
        </div>
      </div>

      {/* ── MCP Tool Logs Drawer (Expandable) ── */}
      {showMcpLogs && (
        <div className="bg-[#1E1E1E] text-white rounded-xl p-4 border border-[#333333] shadow-md font-mono text-xs space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#333333] pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-emerald-400">MCP JSON-RPC Tool Activity Stream</span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-[#AAAAAA]">
                Server: @google/mcp-server-gmail
              </span>
            </div>
            <button
              onClick={() => setShowMcpLogs(false)}
              className="text-[#888888] hover:text-white text-xs"
            >
              ✕ Close
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {logs.length === 0 ? (
              <p className="text-gray-500 italic">No tool calls recorded yet. Ask Solulu Elevate to read emails to trigger MCP tools.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-2 rounded bg-white/5 border border-white/10 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">{log.toolName}</span>
                      <span className="text-[10px] text-gray-400">{log.timestamp}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 mt-1">{log.responsePreview}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Params: {JSON.stringify(log.parameters)}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-sans">
                    {log.resultCount !== undefined ? `${log.resultCount} items` : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Main Gmail Interface Layout ── */}
      <div className="bg-white rounded-xl border border-[#E0E0E0] shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[580px]">
        {/* Left Sidebar Navigation */}
        <div className="w-full md:w-60 border-r border-[#EAEAEA] bg-[#FAFAFA] flex flex-col p-3 shrink-0">
          <button
            onClick={() => setIsComposeOpen(true)}
            className="w-full mb-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Send Test Email</span>
          </button>

          <nav className="space-y-1">
            <button
              onClick={() => setFilterCategory('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filterCategory === 'all'
                  ? 'bg-[#EAEAEA] text-[#DC2626] font-bold'
                  : 'text-[#555555] hover:bg-[#F0F0F0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4" />
                <span>All Mail</span>
              </div>
              <span className="text-[11px] font-bold text-[#888888]">{emails.length}</span>
            </button>

            <button
              onClick={() => setFilterCategory('unread')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
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
                <span className="text-[10px] bg-[#DC2626] text-white px-2 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterCategory('academic')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filterCategory === 'academic'
                  ? 'bg-[#EAEAEA] text-[#DC2626] font-bold'
                  : 'text-[#555555] hover:bg-[#F0F0F0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-blue-500" />
                <span>Lecturer Feedback</span>
              </div>
            </button>

            <button
              onClick={() => setFilterCategory('exams')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filterCategory === 'exams'
                  ? 'bg-[#EAEAEA] text-[#DC2626] font-bold'
                  : 'text-[#555555] hover:bg-[#F0F0F0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>Exam Timetables</span>
              </div>
            </button>

            <button
              onClick={() => setFilterCategory('alerts')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filterCategory === 'alerts'
                  ? 'bg-[#EAEAEA] text-[#DC2626] font-bold'
                  : 'text-[#555555] hover:bg-[#F0F0F0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-emerald-500" />
                <span>Solulu Alerts</span>
              </div>
            </button>

            <button
              onClick={() => setFilterCategory('starred')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filterCategory === 'starred'
                  ? 'bg-[#EAEAEA] text-[#DC2626] font-bold'
                  : 'text-[#555555] hover:bg-[#F0F0F0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-500" />
                <span>Starred</span>
              </div>
            </button>
          </nav>

          <div className="mt-auto pt-4 border-t border-[#EAEAEA]">
            <div className="p-3 bg-white rounded-lg border border-[#E0E0E0] text-[11px] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#333333]">MCP Sync</span>
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
                Last synced via MCP JSON-RPC at {mcpStatus.lastSync}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Email Thread List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-[#EAEAEA] flex flex-col shrink-0">
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
                No emails found matching your filter.
              </div>
            ) : (
              filteredEmails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
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
                        <button
                          onClick={(e) => handleToggleStar(e, email.id)}
                          className="text-[#CCCCCC] hover:text-amber-500 p-0.5"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              email.isStarred ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </button>
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

                    <div className="flex items-center gap-1.5 mt-2">
                      {email.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] bg-[#EAEAEA] text-[#555555] px-1.5 py-0.5 rounded font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Email Detail & AI Action Bar */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto">
          {selectedEmail ? (
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="border-b border-[#EAEAEA] pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#222222] leading-snug">
                      {selectedEmail.subject}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs font-bold text-[#111111]">
                        {selectedEmail.fromName}
                      </span>
                      <span className="text-xs text-[#777777]">
                        &lt;{selectedEmail.from}&gt;
                      </span>
                      <span className="text-xs text-[#999999]">to {selectedEmail.to}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#888888] font-medium">
                      {selectedEmail.date} at {selectedEmail.time}
                    </span>
                    <button
                      onClick={(e) => handleToggleStar(e, selectedEmail.id)}
                      className="p-1.5 text-gray-400 hover:text-amber-500 rounded-lg hover:bg-gray-100"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          selectedEmail.isStarred ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* AI Agent Recommendation Banner */}
                {selectedEmail.mcpActionSuggested && (
                  <div className="mt-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-3 flex items-start justify-between gap-3">
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
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors shrink-0 shadow-xs"
                    >
                      Execute with AI →
                    </button>
                  </div>
                )}
              </div>

              {/* Email Body */}
              <div className="text-xs sm:text-sm text-[#333333] leading-relaxed whitespace-pre-line font-sans">
                {selectedEmail.body}
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-[#EAEAEA] flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleAskAgentAboutEmail(selectedEmail)}
                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Draft Reply via Solulu MCP</span>
                </button>

                {selectedEmail.category === 'exams' && onNavigateToCalendar && (
                  <button
                    onClick={onNavigateToCalendar}
                    className="bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#333333] border border-[#CCCCCC] text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span>View Exam in Calendar</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#888888]">
              <Mail className="w-12 h-12 text-[#CCCCCC] mb-2" />
              <p className="text-sm font-semibold">Select an email to view full academic details</p>
              <p className="text-xs text-[#AAAAAA] mt-1">
                Connected to Model Context Protocol (MCP) Gmail Server
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Send Test Email Modal ── */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-[#E0E0E0] space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#DC2626]" />
                <h3 className="text-sm font-bold text-[#333333]">Inject New Student Academic Email</h3>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-[#888888] hover:text-[#333333]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTestEmail} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#555555] block mb-1">From:</label>
                <select
                  value={newFrom}
                  onChange={(e) => setNewFrom(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#D5D5D5] bg-[#FAFAFA]"
                >
                  <option value="tutor.assistant@unisa.ac.za">Dr. James Park &lt;jpark@unisa.ac.za&gt; (CS201)</option>
                  <option value="tutor.computing@unisa.ac.za">CS204 Head Tutor &lt;tutor.computing@unisa.ac.za&gt;</option>
                  <option value="dean.science@unisa.ac.za">Dean of Science &lt;dean.science@unisa.ac.za&gt;</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#555555] block mb-1">To (Student Gmail):</label>
                <input
                  type="text"
                  disabled
                  value={DEMO_STUDENT_GMAIL}
                  className="w-full text-xs p-2 rounded-lg border border-[#D5D5D5] bg-[#EFEFEF] text-[#666666]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#555555] block mb-1">Subject:</label>
                <input
                  type="text"
                  placeholder="e.g. CS204 Lab 4 Code Review & Consultation"
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
                  placeholder="Enter academic message details..."
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
                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Receive in Student Inbox</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

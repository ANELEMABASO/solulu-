import { DemoEmail, McpToolCallLog } from '../types';

export const DEMO_STUDENT_GMAIL = 'maya.chen.student.demo@gmail.com';

const INITIAL_EMAILS: DemoEmail[] = [
  {
    id: 'email-101',
    from: 'e.vasquez@unisa.ac.za',
    fromName: 'Dr. Elena Vasquez',
    to: DEMO_STUDENT_GMAIL,
    subject: 'CS204: Feedback on Assignment 2 (Graph Traversal & AVL Trees) & Consultation Invitation',
    snippet: 'Dear Maya, I reviewed your AVL tree balance factors and Dijkstra shortest-path implementation. Outstanding work! You achieved 84%...',
    body: `Dear Maya,

I have finished grading your submission for CS204 Assignment 2 (AVL Tree Rotations & Dijkstra Graph Algorithms). 

Overall, your implementation was top-tier! You achieved 84% (Distinction grade).
- AVL Rotations: 20/20 (Flawless balance factor logic and edge case handling)
- Graph Representation: 18/20 (Clear adjacency list structure)
- Asymptotic Complexity Proofs: 16/20 (Minor omission in the amortized analysis for multi-hop traversals)

Because of your strong progress, I would like to invite you to join my academic consultation session this Tuesday from 14:00 to 15:30 in Room C1.08 (Science Campus) or via myModules Virtual Classroom if you would like to discuss preparing for the May/June Examination.

Keep up the stellar standard of work!

Warm regards,
Dr. Elena Vasquez
Senior Lecturer & CS204 Module Coordinator
School of Computing, UNISA`,
    date: '2026-09-22',
    time: '08:45 AM',
    isUnread: true,
    isStarred: true,
    category: 'academic',
    tags: ['CS204', 'Grade Feedback', 'Consultation'],
    mcpActionSuggested: 'Book consultation with Dr. Vasquez for Tuesday at 14:00',
  },
  {
    id: 'email-102',
    from: 'exams.registrar@unisa.ac.za',
    fromName: 'UNISA Examinations Directorate',
    to: DEMO_STUDENT_GMAIL,
    subject: 'URGENT: Official May/June 2026 Examination Timetable Released for CS204 & CS201',
    snippet: 'Please note that the final examination timetable for Semester 1, 2026 has been published. CS204 Examination is scheduled for 28 May 2026...',
    body: `Dear Student (Maya Chen / 67283910),

Please note that the final Semester 1, 2026 Examination Timetable has been officially released on the myUNISA Academic Administration portal.

Your Scheduled Examination Dates:
1. CS204: Data Structures & Algorithms
   - Date: Thursday, 28 May 2026
   - Time: 09:00 AM – 12:00 PM (CAT)
   - Format: Proctored Online Examination (myExams / Moodle Proctoring)

2. CS201: Object-Oriented Programming (Java)
   - Date: Tuesday, 02 June 2026
   - Time: 09:00 AM – 12:00 PM (CAT)

IMPORTANT REQUIREMENTS:
- Complete your identity photo verification and mock invigilation trial before 15 May 2026.
- Ensure your continuous assessment (year mark) meets the statutory subminimum requirement (40% minimum to sit for final exam). Your current CS204 year mark is 84%, qualifying you for distinction-tier exam admission.

Office of the Registrar (Examinations)
University of South Africa`,
    date: '2026-09-21',
    time: '14:20 PM',
    isUnread: true,
    category: 'exams',
    tags: ['Exams', 'Timetable', 'Official'],
    mcpActionSuggested: 'Add CS204 exam date (28 May 2026 09:00 AM) to student calendar',
  },
  {
    id: 'email-103',
    from: 'alerts@solulu.elevate.unisa.ac.za',
    fromName: 'Solulu Elevate AI Monitor',
    to: DEMO_STUDENT_GMAIL,
    subject: 'Attendance Verified: Science Campus Lab Practical (100% Cumulative Rate)',
    snippet: 'Your attendance for the CS204 Trees Lab Practical has been verified and registered on Supabase. Your cumulative attendance is 100%...',
    body: `Dumelang Maya,

Your academic attendance record has been processed and safely synced with the UNISA Supabase database:
- Session: Trees Lab Practical & AVL Rotations Prep
- Module: CS204 (Data Structures)
- Venue: Room C1.08, Science Campus (Florida)
- Status: Attended & Biometrically Verified
- Timestamp: 22 September 2026, 09:15 SAST

Your cumulative attendance across all practical sessions is now 100%. Solulu Elevate predicts you are at Low Academic Risk (engagement index: 94/100).

Solulu Elevate Autonomous Academic Engine
College of Science, Engineering & Technology, UNISA`,
    date: '2026-09-22',
    time: '09:30 AM',
    isUnread: false,
    category: 'alerts',
    tags: ['Attendance', 'Supabase', 'Solulu Elevate'],
    mcpActionSuggested: 'Attendance confirmed: 100% overall rate',
  },
  {
    id: 'email-104',
    from: 'tutoring.computing@unisa.ac.za',
    fromName: 'Department of Computing (Tutor Hub)',
    to: DEMO_STUDENT_GMAIL,
    subject: 'Invitation: CS204 Peer-Assisted Study Sessions (PASS) — Dynamic Programming Workshop',
    snippet: 'Join our senior tutor Thabo Mokoena this Thursday at 14:00 for an intensive walkthrough of dynamic programming memoization...',
    body: `Hi CS204 Students,

Need extra practice before the upcoming test on Dynamic Programming and Recursive Memoization?

Join our Peer-Assisted Study Session (PASS):
- Topic: 0/1 Knapsack, Longest Common Subsequence, and Tabulation vs. Memoization
- Facilitator: Thabo Mokoena (Lead Tutor & MSc Candidate)
- When: Thursday, 24 September 2026 at 14:00 – 15:30 CAT
- Where: myModules Microsoft Teams & Room B2.14 (Science Campus)

Bring your laptops with VS Code and Java 17 configured. Free study guides and practice worksheets will be handed out.

UNISA Computing Peer Tutoring Collective`,
    date: '2026-09-20',
    time: '11:15 AM',
    isUnread: false,
    category: 'general',
    tags: ['Tutoring', 'CS204', 'Workshops'],
    mcpActionSuggested: 'Add Thursday 14:00 DP workshop to study plan',
  },
];

class McpGmailService {
  private emails: DemoEmail[] = [];
  private toolLogs: McpToolCallLog[] = [];
  private listeners: (() => void)[] = [];
  private isConnected = true;

  constructor() {
    this.loadEmails();
  }

  private loadEmails() {
    try {
      const saved = localStorage.getItem('unisa_demo_gmail_emails');
      if (saved) {
        this.emails = JSON.parse(saved);
      } else {
        this.emails = [...INITIAL_EMAILS];
        this.saveEmails();
      }
    } catch {
      this.emails = [...INITIAL_EMAILS];
    }
  }

  private saveEmails() {
    try {
      localStorage.setItem('unisa_demo_gmail_emails', JSON.stringify(this.emails));
    } catch (e) {
      console.warn('Failed to save demo emails to localStorage:', e);
    }
    this.notify();
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Error in listener callback:', err);
      }
    });
  }

  public getEmails(): DemoEmail[] {
    return [...this.emails];
  }

  public getUnreadCount(): number {
    return this.emails.filter((e) => e.isUnread).length;
  }

  public getMcpStatus() {
    return {
      connected: this.isConnected,
      account: DEMO_STUDENT_GMAIL,
      protocolVersion: '2024-11-05',
      serverName: '@google/mcp-server-gmail / UNISA Academic Bridge',
      transport: 'JSON-RPC 2.0 (stdio / SSE Bridge)',
      registeredTools: [
        'gmail.list_messages',
        'gmail.get_message_detail',
        'gmail.search_student_emails',
        'gmail.summarize_unread_threads',
        'gmail.create_draft_reply',
        'gmail.sync_calendar_events_from_mail',
      ],
      lastSync: new Date().toLocaleTimeString(),
    };
  }

  public getToolLogs(): McpToolCallLog[] {
    return [...this.toolLogs];
  }

  public markAsRead(id: string) {
    this.emails = this.emails.map((e) => (e.id === id ? { ...e, isUnread: false } : e));
    this.saveEmails();
  }

  public toggleStar(id: string) {
    this.emails = this.emails.map((e) =>
      e.id === id ? { ...e, isStarred: !e.isStarred } : e
    );
    this.saveEmails();
  }

  public addEmail(email: Omit<DemoEmail, 'id' | 'date' | 'time'>) {
    const newEmail: DemoEmail = {
      ...email,
      id: `email-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    this.emails = [newEmail, ...this.emails];
    this.saveEmails();
    return newEmail;
  }

  /**
   * Simulates an MCP (Model Context Protocol) tool call invoked by the AI Assistant.
   */
  public async executeMcpTool(toolName: string, params: Record<string, any>): Promise<{
    success: boolean;
    data: any;
    log: McpToolCallLog;
  }> {
    const logId = `mcp-call-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newLog: McpToolCallLog = {
      id: logId,
      toolName,
      timestamp: new Date().toLocaleTimeString(),
      parameters: params,
      status: 'executing',
    };
    this.toolLogs.unshift(newLog);
    this.notify();

    // Simulate realistic MCP network latency over JSON-RPC stdio
    await new Promise((resolve) => setTimeout(resolve, 600));

    let resultData: any = null;

    switch (toolName) {
      case 'gmail.list_messages': {
        const query = params.query?.toLowerCase() || '';
        const filtered = this.emails.filter(
          (e) =>
            !query ||
            e.subject.toLowerCase().includes(query) ||
            e.fromName.toLowerCase().includes(query) ||
            e.body.toLowerCase().includes(query)
        );
        resultData = {
          account: DEMO_STUDENT_GMAIL,
          total: filtered.length,
          messages: filtered.map((e) => ({
            id: e.id,
            from: e.from,
            fromName: e.fromName,
            subject: e.subject,
            snippet: e.snippet,
            date: e.date,
            isUnread: e.isUnread,
            category: e.category,
          })),
        };
        newLog.resultCount = filtered.length;
        newLog.responsePreview = `Fetched ${filtered.length} messages for ${DEMO_STUDENT_GMAIL}`;
        break;
      }

      case 'gmail.summarize_unread_threads': {
        const unread = this.emails.filter((e) => e.isUnread);
        resultData = {
          account: DEMO_STUDENT_GMAIL,
          unreadCount: unread.length,
          highlights: unread.map((e) => ({
            sender: e.fromName,
            subject: e.subject,
            urgency: e.category === 'exams' || e.tags?.includes('Consultation') ? 'HIGH' : 'NORMAL',
            actionItem: e.mcpActionSuggested,
            summarySnippet: e.snippet,
          })),
        };
        newLog.resultCount = unread.length;
        newLog.responsePreview = `Summarized ${unread.length} unread academic emails`;
        break;
      }

      case 'gmail.get_message_detail': {
        const target = this.emails.find((e) => e.id === params.messageId);
        if (target) {
          resultData = target;
          newLog.resultCount = 1;
          newLog.responsePreview = `Read email: "${target.subject}"`;
        } else {
          resultData = { error: 'Message not found' };
          newLog.status = 'error';
        }
        break;
      }

      case 'gmail.create_draft_reply': {
        resultData = {
          draftId: `draft-${Date.now()}`,
          to: params.to,
          subject: params.subject.startsWith('Re:') ? params.subject : `Re: ${params.subject}`,
          body: params.body,
          status: 'DRAFT_CREATED',
        };
        newLog.resultCount = 1;
        newLog.responsePreview = `Created draft reply to ${params.to}`;
        break;
      }

      default: {
        resultData = { error: `Tool ${toolName} not supported` };
        newLog.status = 'error';
      }
    }

    if (newLog.status !== 'error') {
      newLog.status = 'success';
    }

    this.toolLogs = this.toolLogs.map((l) => (l.id === logId ? newLog : l));
    this.notify();

    return {
      success: newLog.status === 'success',
      data: resultData,
      log: newLog,
    };
  }

  public resetToDefault() {
    this.emails = [...INITIAL_EMAILS];
    this.saveEmails();
  }
}

export const mcpGmail = new McpGmailService();

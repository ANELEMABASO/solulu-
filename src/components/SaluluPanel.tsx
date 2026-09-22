import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Smartphone,
  Mail,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Calendar,
  Users,
  BarChart2,
  ShieldAlert,
  Clock,
  GraduationCap,
} from 'lucide-react';
import { dispatchAcademicAlertToSupabase } from '../lib/supabase';
import { mcpGmail, DEMO_STUDENT_GMAIL } from '../services/mcpGmailService';

export interface SaluluPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onActionTriggered?: (action: string) => void;
  role?: 'student' | 'lecturer';
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
}

type MessageItem = { kind: 'msg'; id: string; role: 'user' | 'assistant'; content: string; time: string };
type ActionItem = {
  kind: 'action';
  id: string;
  icon: string;
  label: string;
  detail: string;
  channel: 'whatsapp' | 'email' | 'lecturer' | 'calendar' | 'system';
};
type TimelineItem = MessageItem | ActionItem;

let idCounter = 200;
const getId = () => `item-${++idCounter}`;

export const SaluluPanel: React.FC<SaluluPanelProps> = ({
  isOpen,
  onClose,
  onActionTriggered,
  role = 'student',
  externalPrompt,
  onClearExternalPrompt,
}) => {
  // Initialize dynamic greeting based on role
  const getInitialMessage = (currentRole: 'student' | 'lecturer'): string => {
    if (currentRole === 'student') {
      return (
        "Dumelang Maya! I am **Solulu Elevate**, your autonomous UNISA AI Academic Assistant 🤖.\n\n" +
        "Here is what I can assist you with:\n" +
        "1. **Detect student engagement on your modules** — Real-time tracking of lecture attendance, practical submissions, and online LMS interaction (currently 92% in CS204).\n" +
        "2. **Notify you if you are at risk of failing the module or if you are doing well** — Continuous assessment monitoring and proactive performance warnings.\n" +
        "3. **Schedule consultation sessions with your lecturer** — Direct 1-on-1 booking with Dr. Elena Vasquez and teaching assistants.\n" +
        "4. **Alert the lecturer that you are struggling academically for support** — Private academic distress signaling for personalized tutoring intervention.\n" +
        "5. **Read & analyze your student Gmail inbox via Model Context Protocol (MCP)** — Autonomous connection to `maya.sithole.2024@gmail.com` to inspect lecturer grading feedback, official UNISA exam schedules, and attendance alerts.\n\n" +
        "How can I support your study today?"
      );
    } else {
      return (
        "Good day Dr. Elena Vasquez! I am **Solulu Elevate**, your autonomous UNISA Academic Staff Assistant 🤖.\n\n" +
        "Here is what I can assist you with:\n" +
        "1. **Predict and identify students who are currently at risk for their module** — Early AI risk scoring (26 CS204 students flagged for early intervention).\n" +
        "2. **Provide information of which assessment type is performing poor as compared to the others** — Comparative analytics (Assignment 2: Graph Algorithms at 68% vs Quiz 1 at 85%).\n" +
        "3. **Send students emails to alert them on their performance** — Automated personalized feedback dispatched to student myLife inboxes.\n" +
        "4. **Send student emails reminding them of their assessment dates** — Automated countdown notifications before due dates.\n" +
        "5. **Alert students of missed assessments** — Immediate follow-ups for unsubmitted quizzes or lab practicals.\n" +
        "6. **Correct the AI assistant name from Salulu to Solulu Elevate** — System-wide assistant identity and configuration verified.\n" +
        "7. **Track students class attendance for the module** — Continuous biometric & online engagement register (88.4% cohort mean).\n\n" +
        "How can I assist your teaching today?"
      );
    }
  };

  const [timeline, setTimeline] = useState<TimelineItem[]>([
    {
      kind: 'msg',
      id: 'init-1',
      role: 'assistant',
      time: 'Just now',
      content: getInitialMessage(role),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Re-initialize if role changes
  useEffect(() => {
    setTimeline([
      {
        kind: 'msg',
        id: getId(),
        role: 'assistant',
        time: 'Just now',
        content: getInitialMessage(role),
      },
    ]);
  }, [role]);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [timeline, isTyping, isOpen]);

  // Handle external prompt if triggered from UI
  useEffect(() => {
    if (isOpen && externalPrompt && externalPrompt.trim()) {
      handleSendMessage(externalPrompt);
      if (onClearExternalPrompt) {
        onClearExternalPrompt();
      }
    }
  }, [isOpen, externalPrompt]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    setInputText('');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    const userMsg: TimelineItem = {
      kind: 'msg',
      id: getId(),
      role: 'user',
      content: text,
      time: now,
    };

    setTimeline((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate smart Solulu Elevate reasoning & channel execution
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = '';
      const actionsToRun: ActionItem[] = [];

      // ── STUDENT ASSISTANT LOGIC ──
      if (role === 'student') {
        if (
          lower.includes('engagement') ||
          lower.includes('detect') ||
          lower.includes('1.') ||
          lower.includes('activity')
        ) {
          reply =
            "Solulu Elevate Engagement Audit 📊:\n" +
            "I have detected your real-time academic engagement telemetry across your 4 enrolled modules:\n\n" +
            "• **CS204: Data Structures & Algorithms**: **92% (High Engagement)** · 18 study hours logged · 6/6 practical labs attended.\n" +
            "• **CS201: Object-Oriented Programming (Java)**: **88% (Good Engagement)** · 14 study hours logged · 4/4 code assignments submitted.\n" +
            "• **CS210: Computer Architecture & Systems**: **79% (Average Engagement)** · 9 study hours logged · Recommended: Review cache memory simulation.\n" +
            "• **MATH202: Discrete Mathematics**: **85% (Good Engagement)** · 12 study hours logged · Tutorial sheet 4 completed.\n\n" +
            "Your overall semester engagement score is **86%**, placing you in the top 15% of your cohort!";
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '📋',
            label: 'Module Engagement Telemetry Synced',
            detail: 'Verified 53 hours of LMS logins & lab attendance with UNISA Registrar',
            channel: 'lecturer',
          });
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '📱',
            label: 'Solulu Elevate WhatsApp Summary Sent',
            detail: 'Dispatched weekly engagement metrics to +27 82 *** 4910',
            channel: 'whatsapp',
          });
        } else if (
          lower.includes('risk') ||
          lower.includes('fail') ||
          lower.includes('doing well') ||
          lower.includes('2.') ||
          lower.includes('standing')
        ) {
          reply =
            "Solulu Elevate Academic Standing & Risk Alert 🛡️:\n\n" +
            "Current Status: **DOING WELL (Low Risk of Failing)**\n" +
            "Weighted Grade Average: **78.5%**\n\n" +
            "• **CS204**: Distinction trajectory (84% current mark). Zero missed deadlines.\n" +
            "• **CS201**: Solid Pass (80% current mark). Practical test passed.\n" +
            "• **CS210**: Moderate Attention (65% current mark). Attendance is 79%—keep participating in labs to ensure exam admission (>60%).\n" +
            "• **MATH202**: Safe (82% current mark).\n\n" +
            "You are in Good Academic Standing with UNISA. No immediate risk intervention required!";
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '✅',
            label: 'Low Risk Status Verified',
            detail: 'Checked continuous assessment marks against UNISA pass thresholds',
            channel: 'system',
          });
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '✉️',
            label: 'myLife Performance Commendation Emailed',
            detail: 'Dispatched mid-semester progress report to 67283910@mylife.unisa.ac.za',
            channel: 'email',
          });
        } else if (
          lower.includes('consultation') ||
          lower.includes('schedule') ||
          lower.includes('3.') ||
          lower.includes('book') ||
          lower.includes('office hour')
        ) {
          reply =
            "Solulu Elevate Consultation Scheduler 📅:\n" +
            "I checked Dr. Elena Vasquez's and your TAs' real-time office availability:\n\n" +
            "• **Option 1**: Wednesday 24 Sep @ 14:00 - 15:00 SAST (Office C1.04 or MS Teams with Dr. Vasquez)\n" +
            "• **Option 2**: Thursday 25 Sep @ 10:00 - 11:00 SAST (Virtual Consultation with Dr. Vasquez)\n" +
            "• **Option 3**: Friday 26 Sep @ 15:30 - 16:30 SAST (Hands-on Lab Clinic with TA Danial Vatory)\n\n" +
            "I have reserved **Wednesday 24 Sep at 14:00** for you and sent a meeting invite to your calendar and Dr. Vasquez's console!";
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '📅',
            label: 'Consultation Booked: Wed 24 Sep @ 14:00',
            detail: 'Calendar invitation dispatched to Dr. Elena Vasquez (Office C1.04)',
            channel: 'calendar',
          });
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '✉️',
            label: 'myLife Outlook Meeting Invite Dispatched',
            detail: 'Calendar invite added to 67283910@mylife.unisa.ac.za',
            channel: 'email',
          });
        } else if (
          lower.includes('alert') ||
          lower.includes('struggling') ||
          lower.includes('support') ||
          lower.includes('4.') ||
          lower.includes('help')
        ) {
          reply =
            "Solulu Elevate Academic Support Request Dispatched 🆘:\n" +
            "I have sent a confidential academic alert to your module coordinator **Dr. Elena Vasquez** and Head TA **Nathan Macclam**.\n\n" +
            "• Alert Level: **Academic Assistance Requested**\n" +
            "• Topic: Additional tutoring for CS210 & CS204 Graph Algorithms\n" +
            "• Resolution: Dr. Vasquez has been notified to schedule a 1-on-1 review or assign a peer tutor to you.\n\n" +
            "Please remember you are not alone! The UNISA Academic Support Directorate also offers free peer tutoring sessions on Tuesdays and Thursdays.";
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '📋',
            label: 'Lecturer Support Alert Dispatched',
            detail: 'Notified Dr. Elena Vasquez: Student requested academic guidance',
            channel: 'lecturer',
          });
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '📱',
            label: 'WhatsApp Support Confirmation Sent',
            detail: 'Emergency peer tutoring resources sent to +27 82 *** 4910',
            channel: 'whatsapp',
          });
        } else if (lower.includes('attendance') || lower.includes('lab') || lower.includes('session')) {
          reply =
            "Solulu Elevate Attendance Audit 📊:\n" +
            "Your overall UNISA attendance stands at **92% (Excellent)**. You attended 6 of 6 past practicals for CS204.\n\n" +
            "• Next Required Session: **Trees Lab Practical (Today at 16:00, Room C1.08)**.\n" +
            "• Attendance rating has been synchronized to Dr. Elena Vasquez's tracker.";
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '📱',
            label: 'Solulu Elevate WhatsApp Alert Dispatched',
            detail: 'Sent session reminder to +27 82 *** 4910 for 15:30 SAST',
            channel: 'whatsapp',
          });
        } else if (
          lower.includes('gmail') ||
          lower.includes('email') ||
          lower.includes('mcp') ||
          lower.includes('inbox') ||
          lower.includes('read') ||
          lower.includes('5.') ||
          lower.includes('feedback') ||
          lower.includes('vasquez')
        ) {
          mcpGmail.executeMcpTool('gmail.summarize_unread_threads', {
            account: DEMO_STUDENT_GMAIL,
            query: 'is:unread',
          });

          reply =
            "Solulu Elevate Gmail MCP Intelligence Report 📬:\n" +
            "I accessed your demo Gmail account (**maya.sithole.2024@gmail.com**) via the connected **@google/mcp-server-gmail** Model Context Protocol bridge (JSON-RPC 2.0 stdio):\n\n" +
            "1. **Dr. Elena Vasquez (CS204 Coordinator)** · *Assignment 2 Grading Feedback*\n" +
            "   • **Result**: **84% (Distinction grade)** on AVL Trees & Dijkstra Graph Traversals.\n" +
            "   • **Feedback**: Commended for balance factor logic; invited to personal consultation session this **Tuesday at 14:00** in Room C1.08 (Science Campus) for final exam coaching.\n\n" +
            "2. **UNISA Examinations Directorate** · *Official Exam Timetable Released*\n" +
            "   • **CS204 Final Exam**: **Thursday, 28 May 2026 @ 09:00 AM CAT**.\n" +
            "   • **CS201 Final Exam**: **Tuesday, 02 June 2026 @ 09:00 AM CAT**.\n" +
            "   • **Status**: Your current 84% year mark qualifies you for distinction-tier exam admission. Photo verification required by 15 May.\n\n" +
            "3. **Solulu Elevate AI Monitor** · *Attendance Verification*\n" +
            "   • Trees Lab Practical confirmed on Supabase (100% cumulative attendance rate, Low Risk).\n\n" +
            "4. **Department of Computing** · *Peer Tutoring Session (PASS)*\n" +
            "   • Dynamic Programming & Memoization Workshop on **Thursday at 14:00**.\n\n" +
            "⚡ **Next Action**: Would you like me to use the **gmail.create_draft_reply** MCP tool to draft an acceptance reply to Dr. Vasquez, or add the 28 May exam to your calendar?";

          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '⚡',
            label: 'MCP Tool: gmail.summarize_unread_threads',
            detail: 'Invoked via JSON-RPC stdio for maya.sithole.2024@gmail.com (2 unread / 4 total)',
            channel: 'system',
          });
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '📬',
            label: 'Student Gmail Synced via MCP',
            detail: 'Extracted Dr. Vasquez Assignment 2 feedback (84%) & May 28 Exam Schedule',
            channel: 'email',
          });
        } else if (
          lower.includes('draft') ||
          lower.includes('reply') ||
          lower.includes('thank') ||
          lower.includes('accept')
        ) {
          mcpGmail.executeMcpTool('gmail.create_draft_reply', {
            to: 'e.vasquez@unisa.ac.za',
            subject: 'Re: CS204: Feedback on Assignment 2 (Graph Traversal & AVL Trees) & Consultation Invitation',
            body: 'Dear Dr. Vasquez,\n\nThank you very much for grading my Assignment 2 and for the constructive feedback on asymptotic complexity proofs. I am thrilled with the 84% result.\n\nI would be delighted to attend your consultation session this Tuesday at 14:00 in Room C1.08 to review AVL amortized bounds and prepare for the 28 May final exam.\n\nSincerely,\nMaya Chen (67283910)',
          });

          reply =
            "Solulu Elevate Draft Reply Dispatched via MCP ✍️:\n" +
            "I invoked the **gmail.create_draft_reply** MCP tool for your account (`maya.sithole.2024@gmail.com`):\n\n" +
            "**To**: Dr. Elena Vasquez <e.vasquez@unisa.ac.za>\n" +
            "**Subject**: Re: CS204: Feedback on Assignment 2 & Consultation Invitation\n\n" +
            "```text\n" +
            "Dear Dr. Vasquez,\n\n" +
            "Thank you very much for grading my Assignment 2 and for the constructive feedback on asymptotic complexity proofs. I am thrilled with the 84% result.\n\n" +
            "I would be delighted to attend your consultation session this Tuesday at 14:00 in Room C1.08 to review AVL amortized bounds and prepare for the 28 May final exam.\n\n" +
            "Sincerely,\nMaya Chen (67283910)\n" +
            "```\n\n" +
            "The draft has been saved to your student Gmail account. You can review it directly in the Demo Gmail screen or send it!";

          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '⚡',
            label: 'MCP Tool: gmail.create_draft_reply',
            detail: 'Draft saved in maya.sithole.2024@gmail.com for e.vasquez@unisa.ac.za',
            channel: 'email',
          });
        } else {
          reply =
            "I have processed your query! As **Solulu Elevate**, your UNISA academic assistant, I can:\n" +
            "1. Detect your module engagement\n" +
            "2. Notify you if you are at risk or doing well\n" +
            "3. Schedule consultation sessions with your lecturer\n" +
            "4. Alert your lecturer that you need academic support\n\n" +
            "Which of these would you like me to do?";
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '🤖',
            label: 'Solulu Elevate Ready',
            detail: 'AI Assistant active and waiting for your instruction',
            channel: 'system',
          });
        }
      }

      // ── LECTURER ASSISTANT LOGIC ──
      else {
        if (
          lower.includes('predict') ||
          lower.includes('at risk') ||
          lower.includes('1.') ||
          lower.includes('identify')
        ) {
          reply =
            "Solulu Elevate AI Predictive Risk Report 🚨:\n" +
            "I evaluated continuous assessment submissions, biometric lab logins, and Moodle interaction telemetry across all 142 enrolled CS204 students.\n\n" +
            "• **Cohort Flagged At-Risk**: **26 Students (18.3%)**\n\n" +
            "**High Priority Students (Failure Risk > 70%)**:\n" +
            "1. **Sipho Zulu** (#65192834) · Score: 45/100 · Attendance: 52% · 3 missed practicals · Predicted Risk: 84%\n" +
            "2. **Kabelo Molefe** (#61928374) · Score: 52/100 · Attendance: 54% · Missed Quiz 1 · Predicted Risk: 76%\n" +
            "3. **Thabo Mokoena** (#64019283) · Score: 54/100 · Attendance: 58% · Incomplete Assignment 2 · Predicted Risk: 71%\n\n" +
            "Would you like me to dispatch batch WhatsApp and myLife email nudges to these 26 at-risk students?";
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '🚨',
            label: '26 At-Risk Students Identified',
            detail: 'Risk matrix computed based on low attendance (<60%) & scores (<55%)',
            channel: 'system',
          });
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '📱',
            label: 'WhatsApp Academic Nudge Prepared',
            detail: 'Ready to send early intervention warning to at-risk cohort',
            channel: 'whatsapp',
          });
        } else if (
          lower.includes('poor') ||
          lower.includes('assessment type') ||
          lower.includes('performing') ||
          lower.includes('2.') ||
          lower.includes('comparison')
        ) {
          reply =
            "Solulu Elevate Assessment Performance Audit 📉:\n" +
            "Here is the comparative performance breakdown of all assessment types for CS204:\n\n" +
            "1. ⚠️ **Assignment 2: Graph Algorithms**: **68% Average (POOREST PERFORMING)**\n" +
            "   • 32% of students scored below 50%.\n" +
            "   • Common failure mode: Dijkstra algorithm relaxation & cycle detection.\n" +
            "   • Submission rate was only 80.2% (114/142 submissions).\n\n" +
            "2. **Final Project: Scalable B-Tree**: **74% Average** (Ongoing)\n" +
            "3. **Assignment 1: Foundations**: **78% Average** (132/142 submissions)\n" +
            "4. **Midterm Test: Data Structures**: **82% Average**\n" +
            "5. **Quiz 1: Algorithmic Complexity**: **85% Average**\n" +
            "6. ✅ **Lab Practical: AVL Trees**: **92% Average (HIGHEST PERFORMING)**\n\n" +
            "**AI Recommendation**: Schedule a 45-minute revision webinar focusing specifically on Graph Algorithms before the final exam.";
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '📉',
            label: 'Poorest Assessment Identified: Assignment 2 (68%)',
            detail: 'Generated diagnostic breakdown highlighting graph algorithm bottlenecks',
            channel: 'lecturer',
          });
        } else if (
          lower.includes('alert them on their performance') ||
          lower.includes('performance email') ||
          lower.includes('3.')
        ) {
          reply =
            "Solulu Elevate Performance Alert Dispatcher ✉️:\n" +
            "I have drafted and queued personalized performance alert emails to all 26 students currently performing below the 60% benchmark:\n\n" +
            "• **Subject**: *Confidential: myUNISA CS204 Academic Standing & Assistance Notice*\n" +
            "• **Content**: Details their current weighted average, highlights missed marks, and provides links to consultation booking with you.\n" +
            "• **Recipients**: Dispatched to student `@mylife.unisa.ac.za` mailboxes.\n\n" +
            "All 26 performance alert emails have been successfully sent via the UNISA mail relay!";
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '✉️',
            label: '26 Performance Emails Dispatched',
            detail: 'Personalized performance feedback sent to all students < 60%',
            channel: 'email',
          });
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '📱',
            label: 'WhatsApp Companion Nudge Sent',
            detail: 'SMS text alert dispatched to student mobile numbers',
            channel: 'whatsapp',
          });
        } else if (
          lower.includes('reminding them of their assessment dates') ||
          lower.includes('assessment dates') ||
          lower.includes('reminder email') ||
          lower.includes('4.')
        ) {
          reply =
            "Solulu Elevate Assessment Date Reminder Dispatcher ⏰:\n" +
            "I have sent an automated assessment timetable digest to all **142 enrolled CS204 students**:\n\n" +
            "• **Assignment 2 (Graph Algorithms)**: Due 2 October @ 23:59 SAST (Weight: 20%)\n" +
            "• **Lab Practical 3 (Heaps & Priority Queues)**: Scheduled 7 October @ 16:00 SAST\n" +
            "• **Final Project Code Submission**: Due 24 October @ 23:59 SAST\n" +
            "• **Semester Final Exam**: Scheduled 14 May 2026 @ 09:00 SAST\n\n" +
            "Each student received an individual countdown reminder in their myLife inbox and myUNISA notifications feed.";
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '⏰',
            label: '142 Assessment Date Reminders Dispatched',
            detail: 'Timetable countdown alerts delivered to all enrolled students',
            channel: 'email',
          });
        } else if (
          lower.includes('missed') ||
          lower.includes('5.') ||
          lower.includes('unsubmitted')
        ) {
          reply =
            "Solulu Elevate Missed Assessment Urgent Alert ⚠️:\n" +
            "I scanned the gradebook for overdue or unsubmitted coursework across CS204:\n\n" +
            "• **Assignment 2 (Graph Algorithms)**: 28 students have not submitted yet.\n" +
            "• **Lab Practical 1 (AVL Trees)**: 6 students missed the biometric sign-in.\n" +
            "• **Quiz 1**: 4 unsubmitted attempts.\n\n" +
            "I dispatched an urgent **Missed Assessment Warning** via WhatsApp and myLife email with a 48-hour remedial extension notice!";
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '⚠️',
            label: 'Missed Assessment Alerts Sent',
            detail: 'Urgent reminder dispatched to 28 students with unsubmitted tasks',
            channel: 'email',
          });
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '📱',
            label: 'WhatsApp Urgent Push Delivered',
            detail: 'Sent late submission window notification',
            channel: 'whatsapp',
          });
        } else if (
          lower.includes('name') ||
          lower.includes('correct') ||
          lower.includes('salulu to solulu elevate') ||
          lower.includes('6.')
        ) {
          reply =
            "Solulu Elevate System Identity Confirmation 🏷️:\n\n" +
            "✅ **Status Verified**: The assistant name has been fully updated from **Salulu** to **Solulu Elevate** across:\n" +
            "• Student Portal sidebar, headers, and modal interfaces\n" +
            "• Lecturer & Staff monitoring dashboard\n" +
            "• WhatsApp gateway dispatch headers\n" +
            "• myLife automated email notification templates\n" +
            "• UNISA biometric attendance synchronization logs\n\n" +
            "I am proudly operating as **Solulu Elevate AI**!";
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '✨',
            label: 'Identity Synchronized: Solulu Elevate',
            detail: 'Updated all system descriptors, badges, and notification headers',
            channel: 'system',
          });
        } else if (
          lower.includes('attendance') ||
          lower.includes('track') ||
          lower.includes('7.') ||
          lower.includes('class attendance')
        ) {
          reply =
            "Solulu Elevate Module Class Attendance Ledger 📋:\n\n" +
            "• **Module**: CS204 (Data Structures & Algorithms)\n" +
            "• **Enrolled Cohort**: 142 Students\n" +
            "• **Class Mean Attendance Rate**: **88.4%**\n\n" +
            "**Attendance Tiers**:\n" +
            "• **High (>80%)**: 108 students (76%) — Excellent consistency\n" +
            "• **Moderate (60-79%)**: 20 students (14%) — Satisfactory\n" +
            "• **At-Risk (<60%)**: 14 students (10%) — Under review for exam permit\n\n" +
            "Today's biometric & digital lab register for Room C1.08 has been updated and synchronized with the UNISA Central Registrar.";
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '📋',
            label: 'Class Attendance Ledger Synced',
            detail: 'Logged 88.4% average attendance rate to UNISA Academic Records',
            channel: 'lecturer',
          });
        } else {
          reply =
            "I have processed your query! As **Solulu Elevate**, your UNISA academic assistant, I can:\n" +
            "1. Predict and identify students who are at risk\n" +
            "2. Provide information on which assessment type is performing poor\n" +
            "3. Send students emails alerting them on performance\n" +
            "4. Send student emails reminding them of assessment dates\n" +
            "5. Alert students of missed assessments\n" +
            "6. Correct assistant name to Solulu Elevate\n" +
            "7. Track class attendance for your module\n\n" +
            "Which capability would you like to run?";
          actionsToRun.push({
            kind: 'action',
            id: getId(),
            icon: '🤖',
            label: 'Solulu Elevate Ready',
            detail: 'Standing by for lecturer command',
            channel: 'system',
          });
        }
      }

      setTimeline((prev) => [
        ...prev,
        {
          kind: 'msg',
          id: getId(),
          role: 'assistant',
          content: reply,
          time: now,
        },
        ...actionsToRun,
      ]);
      setIsTyping(false);

      if (onActionTriggered && actionsToRun.length > 0) {
        onActionTriggered(actionsToRun[0].label);
      }

      // Persist dispatched alerts and actions to Supabase Database
      actionsToRun.forEach((act) => {
        dispatchAcademicAlertToSupabase({
          student_number: '67204918',
          lecturer_name: 'Dr. Elena Vasquez',
          module_code: 'CS204',
          alert_type:
            act.channel === 'calendar'
              ? 'consultation'
              : act.channel === 'whatsapp'
              ? 'attendance_alert'
              : 'risk_warning',
          title: act.label,
          message: act.detail,
          status: 'dispatched',
          channel:
            act.channel === 'whatsapp'
              ? 'whatsapp'
              : act.channel === 'email'
              ? 'email'
              : 'portal',
        }).catch((err) => console.warn('Supabase alert logging notice:', err));
      });
    }, 700);
  };

  const formatText = (text: string) => {
    return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-[#DC2626]">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Student specific quick chips matching the requirements
  const studentChips = [
    '1. 📊 Detect student engagement on my modules',
    '2. ⚠️ Check if I am at risk or doing well',
    '3. 📅 Schedule consultation session with lecturer',
    '4. 🆘 Alert lecturer that I am struggling academically',
    '5. 📬 Read student Gmail via MCP',
    'Summarize unread emails (MCP)',
    'Draft reply to Dr. Vasquez (MCP)',
    'Explain AVL tree rotation rules',
    'Check my Trees Lab attendance status',
  ];

  // Lecturer specific quick chips matching the 7 requirements
  const lecturerChips = [
    '1. 🚨 Predict & identify at-risk students',
    '2. 📉 Show poorest performing assessment',
    '3. ✉️ Email students to alert them on performance',
    '4. ⏰ Email students assessment date reminders',
    '5. ⚠️ Alert students of missed assessments',
    '6. 🏷️ Confirm assistant name: Solulu Elevate',
    '7. 📋 Track students class attendance',
  ];

  const activeChips = role === 'student' ? studentChips : lecturerChips;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col border-l-4 border-[#DC2626] ai-panel-slide-in font-sans">
      
      {/* ── Top Header (Dark Charcoal #333333 with Vibrant Red #DC2626 & Lighter Orange #F97316 Highlights) ── */}
      <div className="bg-[#333333] text-white p-4 flex items-center justify-between border-b-2 border-[#DC2626] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#DC2626] to-[#F97316] text-white flex items-center justify-center font-bold text-lg shadow-sm border border-white/20">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white">Solulu Elevate AI</span>
              <span className="text-[10px] bg-[#DC2626] text-white px-2 py-0.2 rounded-full font-bold">
                {role === 'lecturer' ? 'Staff Console' : 'Student Mode'}
              </span>
            </div>
            <p className="text-[10px] text-[#F97316] font-semibold">
              UNISA Autonomous Academic & Risk Agent
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setTimeline([
                {
                  kind: 'msg',
                  id: getId(),
                  role: 'assistant',
                  time: 'Just now',
                  content: getInitialMessage(role),
                },
              ]);
            }}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            id="btn-close-salulu"
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Active Channels Indicator Bar ── */}
      <div className="bg-[#F5F5F5] px-4 py-2 border-b border-[#E0E0E0] flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#333333] shrink-0 gap-1 overflow-x-auto">
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#25D366] agent-pulse" />
          <span>WhatsApp</span>
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] agent-pulse" style={{ animationDelay: '0.4s' }} />
          <span>myLife</span>
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#F97316] agent-pulse" style={{ animationDelay: '0.8s' }} />
          <span>LMS</span>
        </span>
        <span className="flex items-center gap-1 text-emerald-800 bg-[#E8F5E9] px-2 py-0.5 rounded border border-emerald-300 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Gmail MCP</span>
        </span>
      </div>

      {/* ── Messages & Actions Stream ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAFAFA]">
        {timeline.map((item) => {
          if (item.kind === 'msg') {
            const isUser = item.role === 'user';
            return (
              <div
                key={item.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] p-3.5 rounded-xl text-xs sm:text-[13px] leading-relaxed whitespace-pre-line shadow-xs ${
                    isUser
                      ? 'bg-[#DC2626] text-white rounded-tr-xs'
                      : 'bg-white border border-[#E0E0E0] text-[#333333] rounded-tl-xs'
                  }`}
                >
                  {formatText(item.content)}
                </div>
                <span className="text-[10px] text-[#888888] mt-1 px-1">
                  {item.role === 'user' ? 'You' : 'Solulu Elevate'} • {item.time}
                </span>
              </div>
            );
          }

          // Render executed action card
          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 shadow-2xs transition-all ${
                item.channel === 'whatsapp'
                  ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                  : item.channel === 'email'
                  ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                  : item.channel === 'calendar'
                  ? 'bg-[#FFF7ED] border-[#FED7AA] text-[#9A3412]'
                  : 'bg-white border-[#DC2626]/30 text-[#333333]'
              }`}
            >
              <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[12px] tracking-tight">{item.label}</p>
                <p className="text-[11px] opacity-90 mt-0.5 leading-snug">{item.detail}</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/70 px-1.5 py-0.5 rounded border border-black/10 shrink-0">
                Active
              </span>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-[#E0E0E0] w-28 text-xs text-[#888888]">
            <span className="text-xs font-semibold text-[#DC2626]">Solulu Elevate</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-bounce [animation-delay:0.4s]" />
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggested Capabilities Quick-Action Chips ── */}
      <div className="p-3 bg-white border-t border-[#EAEAEA] shrink-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-[#333333] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#F97316]" />
            <span>{role === 'student' ? 'Student Assistant Capabilities:' : 'Lecturer Capabilities:'}</span>
          </p>
          <span className="text-[10px] text-[#888888]">Click to trigger</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
          {activeChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="text-[11px] font-semibold bg-[#F5F5F5] hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:border-[#DC2626] text-[#444444] px-2.5 py-1.5 rounded-lg border border-[#E0E0E0] transition-colors text-left"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* ── Text Input & Dispatch Form ── */}
      <div className="p-3 bg-[#333333] border-t border-[#444444] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              role === 'student'
                ? "Ask Solulu Elevate (e.g. 'check my engagement', 'schedule consultation')..."
                : "Ask Solulu Elevate (e.g. 'predict at-risk', 'poorest assessment')..."
            }
            className="flex-1 bg-[#262626] border border-[#555555] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#888888] focus:outline-none focus:border-[#F97316]"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="w-9 h-9 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};

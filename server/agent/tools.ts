import type { AcademicRepository } from './repository.ts';
import { createDraft } from './drafts.ts';

export type Role = 'student' | 'lecturer';

export interface AgentContext {
  role: Role;
  // Student number of the signed-in student; students may only see their own data.
  studentNumber: string;
  repo: AcademicRepository;
  allowDrafts?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'OBJECT';
    properties: Record<string, { type: 'STRING'; description: string }>;
    required?: string[];
  };
  run: (args: Record<string, string>, ctx: AgentContext) => Promise<unknown>;
}

export const TOOLS: ToolDefinition[] = [
  {
    name: 'list_at_risk_students',
    description: 'Lists students in a module who are at risk of failing, ranked by risk score. Lecturers only.',
    parameters: {
      type: 'OBJECT',
      properties: { moduleCode: { type: 'STRING', description: 'Module code, e.g. CS204' } },
      required: ['moduleCode'],
    },
    async run({ moduleCode }, ctx) {
      if (ctx.role !== 'lecturer') return { error: 'Only lecturers can list students across a module.' };
      const students = await ctx.repo.listStudents(moduleCode);
      return students.filter((s) => s.riskLevel !== 'Low').sort((a, b) => b.riskScore - a.riskScore);
    },
  },
  {
    name: 'get_student_risk',
    description:
      'Gets the attendance, activity and risk assessment for one student, found by student number or name.',
    parameters: {
      type: 'OBJECT',
      properties: {
        moduleCode: { type: 'STRING', description: 'Module code, e.g. CS204' },
        student: { type: 'STRING', description: 'Student number or (part of) the student name' },
      },
      required: ['moduleCode', 'student'],
    },
    async run({ moduleCode, student }, ctx) {
      const all = await ctx.repo.listStudents(moduleCode);
      const query = String(student ?? '').toLowerCase();
      const found = all.find(
        (s) => s.studentNumber === query || (query.length > 1 && s.name.toLowerCase().includes(query)),
      );
      if (!found) return { error: `No student matching "${student}" in ${moduleCode}.` };
      if (ctx.role === 'student' && found.studentNumber !== ctx.studentNumber) {
        return { error: 'Students can only view their own record.' };
      }
      return found;
    },
  },
  {
    name: 'draft_student_email',
    description:
      'Drafts a supportive email to a student and places it in the lecturer approval queue. It does NOT send anything; a lecturer must approve it first. Lecturers only.',
    parameters: {
      type: 'OBJECT',
      properties: {
        moduleCode: { type: 'STRING', description: 'Module code, e.g. CS204' },
        student: { type: 'STRING', description: 'Student number or (part of) the student name' },
        subject: { type: 'STRING', description: 'Short, kind email subject' },
        body: { type: 'STRING', description: 'Plain-text email body, written to the student, signed by the lecturer' },
      },
      required: ['moduleCode', 'student', 'subject', 'body'],
    },
    async run({ moduleCode, student, subject, body }, ctx) {
      if (ctx.allowDrafts === false) return { error: 'Draft approvals are not available in this deployment.' };
      if (ctx.role !== 'lecturer') return { error: 'Only lecturers can draft student emails.' };
      const all = await ctx.repo.listStudents(moduleCode);
      const query = String(student ?? '').toLowerCase();
      const found = all.find(
        (s) => s.studentNumber === query || (query.length > 1 && s.name.toLowerCase().includes(query)),
      );
      if (!found) return { error: `No student matching "${student}" in ${moduleCode}.` };
      if (!subject?.trim() || !body?.trim()) return { error: 'A subject and body are required.' };

      const { draft, duplicate } = createDraft({
        studentNumber: found.studentNumber,
        studentName: found.name,
        moduleCode: moduleCode.toUpperCase(),
        to: `${found.studentNumber}@mylife.unisa.ac.za`,
        subject: subject.trim().slice(0, 200),
        body: body.trim().slice(0, 5000),
      });
      return {
        status: 'pending_approval',
        draftId: draft.id,
        note: duplicate
          ? 'A pending draft already exists for this student; no new draft was created.'
          : 'Draft saved. It will only be sent after the lecturer approves it in the Approvals screen.',
      };
    },
  },
];

export function getTool(name: string) {
  return TOOLS.find((t) => t.name === name);
}

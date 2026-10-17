import { INITIAL_ATTENDANCE_RECORDS } from '../../src/data/unisaData.ts';

export interface StudentRisk {
  studentNumber: string;
  name: string;
  module: string;
  attendancePct: number;
  lastActive: string;
  notesCompleted: boolean;
  riskScore: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  reasons: string[];
}

export interface AcademicRepository {
  listStudents(moduleCode: string): Promise<StudentRisk[]>;
}

function assess(record: (typeof INITIAL_ATTENDANCE_RECORDS)[number]): StudentRisk {
  const reasons: string[] = [];
  let score = 0;

  if (record.attendancePct < 50) {
    score += 60;
    reasons.push(`Attendance is critically low (${record.attendancePct}%)`);
  } else if (record.attendancePct < 70) {
    score += 35;
    reasons.push(`Attendance is below 70% (${record.attendancePct}%)`);
  }
  if (!record.notesCompleted) {
    score += 20;
    reasons.push('Study notes not completed');
  }
  if (/days ago/i.test(record.lastActive)) {
    score += 20;
    reasons.push(`Inactive on the platform (${record.lastActive})`);
  }
  if (record.status === 'At Risk') score += 10;

  score = Math.min(score, 100);
  return {
    studentNumber: record.studentNumber,
    name: record.name,
    module: record.module,
    attendancePct: record.attendancePct,
    lastActive: record.lastActive,
    notesCompleted: record.notesCompleted,
    riskScore: score,
    riskLevel: score >= 60 ? 'High' : score >= 30 ? 'Medium' : 'Low',
    reasons,
  };
}

// Practice data until a real Supabase-backed repository is plugged in.
class MockRepository implements AcademicRepository {
  async listStudents(moduleCode: string) {
    return INITIAL_ATTENDANCE_RECORDS.filter((r) => r.module.toUpperCase() === moduleCode.toUpperCase()).map(assess);
  }
}

export function createRepository(): AcademicRepository {
  return new MockRepository();
}

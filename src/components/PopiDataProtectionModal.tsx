import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  GraduationCap,
  HeartHandshake,
  CreditCard,
  Bot,
  Compass,
  Check,
  Info,
  Lock,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { UnisaLogo } from './UnisaLogo';
import { savePopiConsentToSupabase } from '../lib/supabase';

export interface StakeholderPermission {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  description: string;
  dataAccessed: string[];
  supportPurpose: string;
  isEssential?: boolean;
}

export const UNISA_STAKEHOLDERS: StakeholderPermission[] = [
  {
    id: 'lecturers',
    name: 'Module Coordinators & Lecturers',
    category: 'Academic Faculty',
    icon: GraduationCap,
    badgeColor: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
    description: 'Dr. Elena Vasquez and faculty responsible for your enrolled modules (e.g., CS204, CS201).',
    dataAccessed: [
      'Continuous assessment results & quiz grades',
      'Class & lab practical attendance timestamps',
      'Assignment submission timeliness & overdue flags',
    ],
    supportPurpose:
      'Proactively identifying academic difficulty, scheduling 1-on-1 office consultations, and giving personalized remediation guidance.',
  },
  {
    id: 'tutors',
    name: 'Departmental Tutors & Lab Demonstrators',
    category: 'Peer Learning',
    icon: Users,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Accredited tutors and lab assistants conducting practical coding and tutorial sessions.',
    dataAccessed: [
      'Lab worksheet completion status',
      'Practical programming exercise logs',
      'Peer study group engagement',
    ],
    supportPurpose:
      'Providing tailored coding guidance, hosting small-group remedial tutorials, and answering technical questions.',
  },
  {
    id: 'counselling',
    name: 'Directorate for Counselling & Career Development (DCCD)',
    category: 'Pastoral & Wellness',
    icon: HeartHandshake,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Professional student psychologists, counselors, and disability support specialists.',
    dataAccessed: [
      'Engagement anomaly triggers (sudden withdrawal or absence)',
      'Self-submitted student wellness requests',
      'Registered examination concession requirements',
    ],
    supportPurpose:
      'Providing free confidential mental wellness support, exam stress coping strategies, and disability accommodations.',
  },
  {
    id: 'advisors',
    name: 'Student Retention & Academic Advising Unit',
    category: 'Curriculum Planning',
    icon: Compass,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Academic advisors in the College of Science, Engineering and Technology (CSET).',
    dataAccessed: [
      'Degree progression trajectory and credit accumulation',
      'Prerequisite pass status and historical marks ledger',
    ],
    supportPurpose:
      'Curriculum pathway counseling, graduation verification, and structured academic development plans.',
  },
  {
    id: 'financial_aid',
    name: 'Financial Aid & NSFAS Bursary Directorate',
    category: 'Funding & Sponsorship',
    icon: CreditCard,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'UNISA bursaries office, NSFAS liaison officers, and verified sponsor administrators.',
    dataAccessed: [
      'Module registration confirmation and credits',
      'Academic progress verification for N+ Rule compliance',
    ],
    supportPurpose:
      'Auditing academic eligibility for book and living allowances, bursary renewals, and tuition fee clearance.',
  },
  {
    id: 'solulu_ai',
    name: 'Solulu Elevate AI Autonomous Early-Warning System',
    category: 'Automated Academic Assistant',
    icon: Bot,
    badgeColor: 'bg-orange-50 text-[#F97316] border-orange-200',
    description: 'UNISA’s early-alert platform monitoring module risk factors and dispatching multi-channel support.',
    dataAccessed: [
      'Attendance anomalies & upcoming assessment deadlines',
      'Automated study session tracking and study material accesses',
    ],
    supportPurpose:
      'Sending proactive WhatsApp/SMS assignment alerts, notifying Dr. Vasquez when tutoring is needed, and reserving consultation slots.',
  },
];

interface PopiDataProtectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsentSaved: (consented: boolean, allowedIds: string[]) => void;
  studentName?: string;
  studentNumber?: string;
}

export const PopiDataProtectionModal: React.FC<PopiDataProtectionModalProps> = ({
  isOpen,
  onClose,
  onConsentSaved,
  studentName = 'Maya Chen',
  studentNumber = '67204918',
}) => {
  const [selectedStakeholders, setSelectedStakeholders] = useState<string[]>(
    UNISA_STAKEHOLDERS.map((s) => s.id)
  );
  const [expandedStakeholderId, setExpandedStakeholderId] = useState<string | null>(null);
  const [showLegalDetails, setShowLegalDetails] = useState(false);
  const [showDeclineWarning, setShowDeclineWarning] = useState(false);

  // Initialize from localStorage if exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem('unisa_popi_consent_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.allowedStakeholders)) {
          setSelectedStakeholders(parsed.allowedStakeholders);
        }
      }
    } catch {
      // Ignore fallback
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleStakeholder = (id: string) => {
    setSelectedStakeholders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedStakeholders(UNISA_STAKEHOLDERS.map((s) => s.id));
  };

  const handleDeselectAll = () => {
    setSelectedStakeholders([]);
  };

  const handleAcceptAll = () => {
    const allIds = UNISA_STAKEHOLDERS.map((s) => s.id);
    setSelectedStakeholders(allIds);
    const consentPayload = {
      consented: true,
      allowedStakeholders: allIds,
      studentNumber,
      timestamp: new Date().toISOString(),
      type: 'full_consent' as const,
    };
    try {
      localStorage.setItem('unisa_popi_consent_v1', JSON.stringify(consentPayload));
    } catch {
      // Storage fallback
    }

    // Persist to Supabase Database
    savePopiConsentToSupabase({
      student_number: studentNumber,
      consented: true,
      allowed_stakeholders: allIds,
      consent_type: 'full_consent',
      consented_at: consentPayload.timestamp,
      notes: 'Full consent granted for all university support stakeholders',
    }).catch((err) => console.warn('Supabase consent sync notice:', err));

    onConsentSaved(true, allIds);
    onClose();
  };

  const handleSaveCustom = () => {
    const isConsented = selectedStakeholders.length > 0;
    const consentPayload = {
      consented: isConsented,
      allowedStakeholders: selectedStakeholders,
      studentNumber,
      timestamp: new Date().toISOString(),
      type: 'custom_consent' as const,
    };
    try {
      localStorage.setItem('unisa_popi_consent_v1', JSON.stringify(consentPayload));
    } catch {
      // Storage fallback
    }

    // Persist to Supabase Database
    savePopiConsentToSupabase({
      student_number: studentNumber,
      consented: isConsented,
      allowed_stakeholders: selectedStakeholders,
      consent_type: 'custom_consent',
      consented_at: consentPayload.timestamp,
      notes: 'Granular stakeholder permissions customized by student',
    }).catch((err) => console.warn('Supabase consent sync notice:', err));

    onConsentSaved(isConsented, selectedStakeholders);
    onClose();
  };

  const handleConfirmDecline = () => {
    const consentPayload = {
      consented: false,
      allowedStakeholders: [],
      studentNumber,
      timestamp: new Date().toISOString(),
      type: 'declined' as const,
    };
    try {
      localStorage.setItem('unisa_popi_consent_v1', JSON.stringify(consentPayload));
    } catch {
      // Storage fallback
    }

    // Persist decline to Supabase Database
    savePopiConsentToSupabase({
      student_number: studentNumber,
      consented: false,
      allowed_stakeholders: [],
      consent_type: 'declined',
      consented_at: consentPayload.timestamp,
      notes: 'Student opted to decline non-mandatory stakeholder access',
    }).catch((err) => console.warn('Supabase consent sync notice:', err));

    setSelectedStakeholders([]);
    setShowDeclineWarning(false);
    onConsentSaved(false, []);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-[#DC2626] overflow-hidden">
        
        {/* ── Modal Header with UNISA Branding & POPIA Act Reference ── */}
        <div className="bg-[#333333] text-white p-5 sm:p-6 border-b-4 border-[#DC2626] shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DC2626] text-white flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#DC2626] text-white px-2 py-0.5 rounded">
                    POPI Act No. 4 of 2013
                  </span>
                  <span className="text-[10px] text-[#F97316] font-bold">
                    South African Student Data Protection
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                  Consent for UNISA Stakeholders to Access Student Information
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-[#CCCCCC] hover:text-white p-1 rounded-lg hover:bg-[#444444] transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Profile Identity Context */}
          <div className="mt-3.5 pt-3 border-t border-[#444444] flex flex-wrap items-center justify-between text-xs text-[#CCCCCC] gap-2">
            <div>
              Student: <strong className="text-white">{studentName}</strong> (No: <span className="font-mono text-[#F97316]">{studentNumber}</span>)
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#AAAAAA]">
              <Lock className="w-3 h-3 text-[#25D366]" />
              <span>Compliant with POPIA Section 11 & Section 14</span>
            </div>
          </div>
        </div>

        {/* ── Modal Body (Scrollable) ── */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-[#333333] flex-1 text-xs">
          
          {/* Institutional Purpose Statement */}
          <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs leading-relaxed text-[#555555]">
              <p className="font-bold text-[#333333]">
                Why is UNISA asking for your consent?
              </p>
              <p>
                In compliance with the <strong>Protection of Personal Information Act (POPI Act No. 4 of 2013)</strong>, 
                UNISA must obtain your permission to allow authorized academic, counseling, bursary, and student support 
                stakeholders to view relevant educational information, attendance metrics, and early risk indicators to 
                deliver holistic learning assistance and early academic interventions.
              </p>
            </div>
          </div>

          {/* Warning banner if decline mode triggered */}
          {showDeclineWarning && (
            <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Impact of Restricting Support Access</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Declining access means Dr. Elena Vasquez, academic tutors, and counseling units cannot receive 
                automated early-warning alerts if your marks or attendance fall behind. You will still receive official 
                curriculum materials, but personalized outreach, automated WhatsApp reminders, and tutor nudges will be suspended.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleConfirmDecline}
                  className="bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                >
                  Yes, Restrict Access
                </button>
                <button
                  onClick={() => setShowDeclineWarning(false)}
                  className="bg-white border border-amber-300 text-amber-800 text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  Return to Permissions
                </button>
              </div>
            </div>
          )}

          {/* ── Stakeholder Selection Grid ── */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 gap-2">
              <div>
                <h3 className="font-bold text-sm text-[#333333]">
                  Authorized University Stakeholders
                </h3>
                <p className="text-[11px] text-[#666666]">
                  Select the UNISA support bodies permitted to access your academic and participation records:
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleSelectAll}
                  className="text-[11px] font-bold text-[#DC2626] hover:underline"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleDeselectAll}
                  className="text-[11px] font-bold text-gray-500 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              {UNISA_STAKEHOLDERS.map((stakeholder) => {
                const Icon = stakeholder.icon;
                const isSelected = selectedStakeholders.includes(stakeholder.id);
                const isExpanded = expandedStakeholderId === stakeholder.id;

                return (
                  <div
                    key={stakeholder.id}
                    className={`rounded-xl border transition-all ${
                      isSelected
                        ? 'border-[#DC2626]/40 bg-white shadow-xs'
                        : 'border-gray-200 bg-gray-50/60 opacity-80'
                    }`}
                  >
                    <div className="p-3.5 flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleStakeholder(stakeholder.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors border ${
                          isSelected
                            ? 'bg-[#DC2626] border-[#DC2626] text-white shadow-2xs'
                            : 'bg-white border-gray-300 hover:border-[#DC2626]'
                        }`}
                        title={isSelected ? 'Revoke permission' : 'Grant permission'}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${stakeholder.badgeColor}`}>
                            {stakeholder.category}
                          </span>
                          <h4 className="font-bold text-xs text-[#222222]">
                            {stakeholder.name}
                          </h4>
                        </div>

                        <p className="text-[11px] text-[#555555] mt-1">
                          {stakeholder.description}
                        </p>

                        <div className="mt-1.5 flex items-center gap-3 text-[11px]">
                          <span className="text-[#DC2626] font-semibold">
                            Purpose: {stakeholder.supportPurpose}
                          </span>
                          <button
                            onClick={() =>
                              setExpandedStakeholderId(isExpanded ? null : stakeholder.id)
                            }
                            className="text-[#666666] hover:text-[#DC2626] font-bold flex items-center gap-1 ml-auto text-[10px]"
                          >
                            <span>{isExpanded ? 'Hide Data Accessed' : 'View Data Accessed'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {/* Collapsible Details: Specific Data Accessed */}
                        {isExpanded && (
                          <div className="mt-2.5 p-3 rounded-lg bg-[#F8F9FA] border border-gray-200 text-[11px] space-y-1.5">
                            <p className="font-bold text-[#333333]">
                              Data points processed under this consent:
                            </p>
                            <ul className="list-disc list-inside space-y-0.5 text-[#555555]">
                              {stakeholder.dataAccessed.map((data, idx) => (
                                <li key={idx}>{data}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Statutory Rights & Disclosure Accordion ── */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowLegalDetails(!showLegalDetails)}
              className="w-full p-3.5 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left text-xs font-bold text-[#333333] transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#DC2626]" />
                <span>Your Rights Under the South African POPI Act (Act 4 of 2013)</span>
              </div>
              {showLegalDetails ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {showLegalDetails && (
              <div className="p-4 bg-white space-y-2 text-[11px] text-[#555555] leading-relaxed border-t border-gray-200">
                <p>
                  <strong>1. Purpose Specification (Section 13):</strong> Personal records (names, student numbers, attendance, 
                  course assessments) are collected solely for the educational purpose of fulfilling UNISA’s academic contract 
                  and offering direct student support.
                </p>
                <p>
                  <strong>2. Limitation on Processing (Section 9):</strong> Data is processed with lawful justification and will 
                  never be transferred to unauthorized commercial marketing brokers or external third parties.
                </p>
                <p>
                  <strong>3. Right to Object & Withdraw (Section 11(3)):</strong> You retain the legal right to alter, restrict, 
                  or revoke your consent at any time through the myUNISA Data Privacy settings or via the UNISA Information Officer.
                </p>
                <p>
                  <strong>4. Security Safeguards (Section 19):</strong> All student records are safeguarded by UNISA Information 
                  and Communication Technology (ICT) using enterprise encryption and role-based access protocols.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Modal Footer with High-Contrast Action Buttons ── */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-gray-500 text-center sm:text-left">
            <span>Selected: </span>
            <strong className="text-[#DC2626]">
              {selectedStakeholders.length} of {UNISA_STAKEHOLDERS.length} stakeholders authorized
            </strong>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            <button
              onClick={() => setShowDeclineWarning(true)}
              className="text-xs font-bold text-gray-600 hover:text-red-700 px-3 py-2 rounded-lg transition-colors order-3 sm:order-1"
            >
              Decline Access
            </button>

            {selectedStakeholders.length > 0 && selectedStakeholders.length < UNISA_STAKEHOLDERS.length && (
              <button
                onClick={handleSaveCustom}
                className="bg-white border-2 border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2] text-xs font-bold px-4 py-2 rounded-lg transition-colors order-2"
              >
                Save Selected Permissions
              </button>
            )}

            <button
              onClick={handleAcceptAll}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-extrabold px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto order-1 sm:order-3 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Allow All Stakeholders (Recommended)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

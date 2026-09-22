import React, { useState } from 'react';
import { Role, StudentScreen, StudentProfile } from './types';
import { CURRENT_STUDENT } from './data/unisaData';
import { LoginScreen } from './components/LoginScreen';
import { StudentSidebar } from './components/StudentSidebar';
import { StudentHeader } from './components/StudentHeader';
import { LecturerPortal } from './components/LecturerPortal';
import { SaluluPanel } from './components/SaluluPanel';
import {
  StudentOverviewView,
  StudentModulesView,
  StudentModuleDetailView,
  StudentScheduleView,
  StudentProgressView,
  StudentMessagesView,
} from './components/StudentViews';
import { StudentCalendarView } from './components/StudentCalendarView';
import { StudentGmailView } from './components/StudentGmailView';
import {
  LessonModal,
  WorksheetModal,
  AssignmentModal,
} from './components/Modals';
import { PopiDataProtectionModal } from './components/PopiDataProtectionModal';
import { recordAttendanceToSupabase } from './lib/supabase';
import { Sparkles, X } from 'lucide-react';

export function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(CURRENT_STUDENT);
  const [studentScreen, setStudentScreen] = useState<StudentScreen>('overview');
  const [selectedModuleCode, setSelectedModuleCode] = useState<string>('CS204');
  const [isSaluluOpen, setIsSaluluOpen] = useState(false);
  const [saluluPrompt, setSaluluPrompt] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isPopiModalOpen, setIsPopiModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const handleLogin = (
    selectedRole: Role,
    destinationPortal?: string,
    customProfile?: StudentProfile
  ) => {
    setRole(selectedRole);
    if (selectedRole === 'student') {
      if (customProfile) {
        setStudentProfile(customProfile);
      }
      // Auto-trigger POPI Act data protection consent modal if not previously completed
      try {
        const existingConsent = localStorage.getItem('unisa_popi_consent_v1');
        if (!existingConsent) {
          setTimeout(() => {
            setIsPopiModalOpen(true);
          }, 600);
        }
      } catch {
        setTimeout(() => {
          setIsPopiModalOpen(true);
        }, 600);
      }

      if (destinationPortal === 'myModules') {
        setStudentScreen('modules');
        showToast(
          `Authenticated into myModules LMS via UNISA Single Sign-On as ${
            customProfile?.name || 'Student'
          }.`
        );
      } else if (destinationPortal === 'myAdmin') {
        setStudentScreen('progress');
        showToast('Authenticated into myAdmin Student Records & Examination portal.');
      } else if (destinationPortal === 'SBL') {
        setStudentScreen('overview');
        showToast('Authenticated into UNISA Graduate School of Business Leadership (SBL).');
      } else {
        setStudentScreen('overview');
        showToast(
          `Welcome to myUNISA Learning Portal, ${customProfile?.name || 'Student'}.`
        );
      }
    } else {
      showToast('Authenticated as Dr. Elena Vasquez · Allocated to Lecturer Attendance & CS204 Portal.');
    }
  };

  const handleLogout = () => {
    setRole(null);
    setStudentScreen('overview');
    setIsSaluluOpen(false);
    showToast('Signed out of myUNISA session successfully.');
  };

  const handleModuleSelect = (code: string) => {
    setSelectedModuleCode(code);
    setStudentScreen('module-detail');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#333333] font-sans antialiased relative">
      {/* ── Toast Notification Banner ── */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] bg-[#333333] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl border-2 border-[#F97316] flex items-center gap-2.5 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#F97316]" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#AAAAAA] hover:text-white ml-1 text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* ── View Router ── */}
      {!role && <LoginScreen onLogin={handleLogin} />}

      {role === 'lecturer' && (
        <LecturerPortal
          onLogout={handleLogout}
          onOpenSalulu={() => setIsSaluluOpen(true)}
          onShowToast={showToast}
        />
      )}

      {role === 'student' && (
        <div className="flex h-screen w-screen overflow-hidden">
          <StudentSidebar
            currentScreen={studentScreen}
            userProfile={studentProfile}
            onNavigate={(s) => {
              setStudentScreen(s);
              setIsMobileSidebarOpen(false);
            }}
            onLogout={handleLogout}
            onOpenSalulu={() => setIsSaluluOpen(true)}
            onOpenPopiModal={() => setIsPopiModalOpen(true)}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <StudentHeader
              onOpenSalulu={() => setIsSaluluOpen(true)}
              onOpenPopiModal={() => setIsPopiModalOpen(true)}
              onNavigate={(s) => setStudentScreen(s)}
              currentScreen={studentScreen}
              onToggleMobileMenu={() => setIsMobileSidebarOpen((prev) => !prev)}
            />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24">
              {studentScreen === 'overview' && (
                <StudentOverviewView
                  userProfile={studentProfile}
                  onSelectModule={handleModuleSelect}
                  onOpenSchedule={() => setStudentScreen('schedule')}
                  onOpenCalendar={() => setStudentScreen('calendar')}
                  onOpenLesson={() => setIsLessonModalOpen(true)}
                  onOpenWorksheet={() => setIsWorksheetModalOpen(true)}
                />
              )}

              {studentScreen === 'calendar' && (
                <StudentCalendarView
                  onOpenWorksheet={() => setIsWorksheetModalOpen(true)}
                  onOpenLesson={() => setIsLessonModalOpen(true)}
                  onOpenAssignment={() => setIsAssignmentModalOpen(true)}
                />
              )}

              {studentScreen === 'modules' && (
                <StudentModulesView onSelectModule={handleModuleSelect} />
              )}

              {studentScreen === 'module-detail' && (
                <StudentModuleDetailView
                  onBack={() => setStudentScreen('modules')}
                  onOpenLesson={() => setIsLessonModalOpen(true)}
                  onOpenWorksheet={() => setIsWorksheetModalOpen(true)}
                  onOpenAssignment={() => setIsAssignmentModalOpen(true)}
                />
              )}

              {studentScreen === 'schedule' && (
                <StudentScheduleView
                  onOpenWorksheet={() => setIsWorksheetModalOpen(true)}
                  onOpenCalendar={() => setStudentScreen('calendar')}
                />
              )}

              {studentScreen === 'progress' && <StudentProgressView />}

              {studentScreen === 'messages' && (
                <StudentMessagesView
                  onOpenSalulu={() => setIsSaluluOpen(true)}
                  onOpenGmail={() => setStudentScreen('gmail')}
                />
              )}

              {studentScreen === 'gmail' && (
                <StudentGmailView
                  onOpenSaluluWithPrompt={(prompt) => {
                    setSaluluPrompt(prompt);
                    setIsSaluluOpen(true);
                  }}
                  onNavigateToCalendar={() => setStudentScreen('calendar')}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Floating Solulu Elevate Assistant Launcher Button (Available for both Student and Lecturer) */}
      {role && !isSaluluOpen && (
        <button
          id="btn-floating-solulu"
          onClick={() => setIsSaluluOpen(true)}
          className="fixed bottom-6 right-6 bg-[#333333] hover:bg-[#222222] text-white p-3.5 rounded-full shadow-2xl border-2 border-[#F97316] flex items-center gap-2.5 hover:scale-105 transition-all z-40 group"
          title="Open Solulu Elevate AI Assistant"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#DC2626] to-[#F97316] text-white flex items-center justify-center font-bold text-base shadow-sm">
            🤖
          </div>
          <div className="text-left pr-2 hidden sm:block">
            <p className="text-xs font-bold leading-tight text-white flex items-center gap-1.5">
              <span>Solulu Elevate AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] agent-pulse" />
            </p>
            <p className="text-[10px] text-[#F97316] font-semibold">
              {role === 'lecturer' ? 'Staff Analytics & Alerts' : 'Academic & Risk Monitor'}
            </p>
          </div>
        </button>
      )}

      {/* Solulu Elevate Slide-in Panel for both Student and Lecturer */}
      <SaluluPanel
        isOpen={isSaluluOpen}
        onClose={() => setIsSaluluOpen(false)}
        role={role === 'lecturer' ? 'lecturer' : 'student'}
        externalPrompt={saluluPrompt}
        onClearExternalPrompt={() => setSaluluPrompt(null)}
        onActionTriggered={(act) => showToast(`Solulu Elevate executed: ${act}`)}
      />

      {/* ── Modals ── */}
      {isLessonModalOpen && (
        <LessonModal
          onClose={() => setIsLessonModalOpen(false)}
          onComplete={() => {
            setIsLessonModalOpen(false);
            recordAttendanceToSupabase({
              student_number: '67204918',
              module_code: 'CS204',
              session_name: 'Week 7 AVL Trees & Tree Balancing Interactive Lesson',
              session_date: new Date().toISOString().split('T')[0],
              status: 'Attended',
              verified_by: 'Dr. Elena Vasquez',
            }).catch((err) => console.warn('Supabase attendance record notice:', err));
            showToast('Week 7 AVL Trees lesson completed. Solulu Elevate logged participation for Dr. Vasquez!');
          }}
        />
      )}

      {isWorksheetModalOpen && (
        <WorksheetModal
          onClose={() => setIsWorksheetModalOpen(false)}
          onSubmit={() => {
            setIsWorksheetModalOpen(false);
            recordAttendanceToSupabase({
              student_number: '67204918',
              module_code: 'CS204',
              session_name: 'Practical Worksheet: AVL Rotations & Rebalancing',
              session_date: new Date().toISOString().split('T')[0],
              status: 'Attended',
              verified_by: 'Dr. Elena Vasquez',
            }).catch((err) => console.warn('Supabase attendance record notice:', err));
            showToast('Trees Lab Worksheet submitted. Room C1.08 lab attendance prep confirmed!');
          }}
        />
      )}

      {isAssignmentModalOpen && (
        <AssignmentModal onClose={() => setIsAssignmentModalOpen(false)} />
      )}

      {/* ── POPI Act Student Data Protection Consent Pop-up Modal ── */}
      <PopiDataProtectionModal
        isOpen={isPopiModalOpen}
        onClose={() => setIsPopiModalOpen(false)}
        studentName="Mabaso Cele"
        studentNumber="67204918"
        onConsentSaved={(consented, allowedIds) => {
          if (consented) {
            showToast(
              `POPI Act consent recorded: ${allowedIds.length} UNISA stakeholders authorized for academic & student support.`
            );
          } else {
            showToast('POPI Act preference recorded: Non-mandatory stakeholder data access restricted.');
          }
        }}
      />
    </div>
  );
}

export default App;

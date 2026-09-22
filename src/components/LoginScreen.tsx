import React, { useState } from 'react';
import { UnisaLogo } from './UnisaLogo';
import { Role } from '../types';
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Sparkles,
  Info,
  CheckCircle2,
  Users,
  Compass,
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: Role, destinationPortal?: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student');
  const [username, setUsername] = useState('67283910');
  const [password, setPassword] = useState('student2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('myModules');

  const handlePortalActionClick = (portal: 'myModules' | 'myAdmin' | 'SBL' | 'staff') => {
    setSelectedAction(portal);
    if (portal === 'staff') {
      setActiveTab('staff');
      setUsername('evasquez@unisa.ac.za');
      setPassword('staff2026');
    } else {
      if (activeTab === 'staff') {
        setActiveTab('student');
      }
      setUsername('67283910');
      setPassword('student2026');
    }
    setErrorMsg('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (activeTab === 'student') {
      if (username.trim().length < 5) {
        setErrorMsg('Please enter a valid UNISA 8-digit student number or myLife email.');
        return;
      }
      onLogin('student', selectedAction);
    } else {
      if (!username.includes('@') && username.trim().length < 4) {
        setErrorMsg('Please enter a valid staff email or username (e.g. evasquez@unisa.ac.za).');
        return;
      }
      onLogin('lecturer', 'staffPortal');
    }
  };

  const handleAutofill = (type: 'student' | 'lecturer') => {
    if (type === 'student') {
      setActiveTab('student');
      setUsername('67283910');
      setPassword('student2026');
      setSelectedAction('myModules');
      setErrorMsg('');
    } else {
      setActiveTab('staff');
      setUsername('evasquez@unisa.ac.za');
      setPassword('staff2026');
      setSelectedAction('staff');
      setErrorMsg('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between font-sans">
      {/* ── Official UNISA Header Bar (Dark Charcoal #333333 + Vibrant Red #DC2626 Accent) ── */}
      <header className="bg-[#333333] text-white border-b-4 border-[#DC2626] shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center justify-between">
            <UnisaLogo size="md" theme="dark" showTagline={true} />
            <span className="md:hidden text-xs bg-[#DC2626] text-white px-2.5 py-1 rounded font-bold">
              myUNISA SSO
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-x-5 gap-y-2 text-xs text-[#E0E0E0]">
            <a
              href="#unisa-library"
              onClick={(e) => {
                e.preventDefault();
                alert("UNISA Library Services: Access 2.4 million electronic journals & course reserves.");
              }}
              className="hover:text-[#F97316] transition-colors flex items-center gap-1"
            >
              <span>UNISA Library</span>
            </a>
            <a
              href="#student-affairs"
              onClick={(e) => {
                e.preventDefault();
                alert("UNISA Directorate of Student Affairs & Financial Aid (NSFAS).");
              }}
              className="hover:text-[#F97316] transition-colors"
            >
              Student Affairs
            </a>
            <a
              href="#study"
              onClick={(e) => {
                e.preventDefault();
                alert("Study @ UNISA: 2026 Registration & Curriculum Guide.");
              }}
              className="hover:text-[#F97316] transition-colors"
            >
              Study @ UNISA
            </a>
            <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-[#555555] text-[#F97316] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Solulu Elevate AI Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* Left Column: Quick Portal Action Launchers (Lighter Orange #F97316 Buttons) */}
        <div className="w-full lg:w-7/12 space-y-6">
          
          {/* Welcome Banner in Vibrant Red #DC2626 */}
          <div className="bg-[#DC2626] text-white rounded-xl p-6 sm:p-7 shadow-md border border-[#B91C1C] relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
            <div className="relative z-10">
              <span className="inline-block bg-[#F97316] text-white text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full mb-2 shadow-xs">
                Official Gateway 2026
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
                Welcome to the myUNISA Portal
              </h1>
              <p className="text-sm sm:text-base text-white/95 mt-2 max-w-xl leading-relaxed">
                Single sign-on access to enrolled modules, student records, academic timetables, and the 
                autonomous <strong className="text-amber-200">Solulu Elevate AI Assistant</strong> for academic engagement, risk alerts, and reminders.
              </p>
            </div>
          </div>

          {/* Primary Login Action Buttons Grid */}
          <div className="bg-white rounded-xl p-6 border border-[#E0E0E0] shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EAEAEA]">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#333333]">
                  Select Your Destination Portal
                </h2>
                <p className="text-xs text-[#666666]">
                  Choose your targeted UNISA service to launch directly with authenticated single sign-on
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-wider bg-[#FFF7ED] px-2.5 py-1 rounded border border-[#FFEDD5]">
                Quick Access
              </span>
            </div>

            {/* Action Buttons Grid: 4 Action Portals including Staff Portal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* 1. Login to myModules */}
              <button
                id="btn-login-mymodules"
                type="button"
                onClick={() => {
                  handlePortalActionClick('myModules');
                  onLogin('student', 'myModules');
                }}
                className={`group flex flex-col justify-between p-4 rounded-lg border-2 text-left transition-all duration-200 bg-[#F97316] hover:bg-[#EA580C] text-white shadow-md hover:shadow-lg ${
                  selectedAction === 'myModules' ? 'ring-3 ring-[#DC2626]/30 border-white' : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-md bg-white/20 flex items-center justify-center text-white">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider">
                    LMS & Study
                  </span>
                  <span className="block text-base font-extrabold text-white mt-0.5">
                    Login to myModules
                  </span>
                  <span className="block text-[11px] text-white/90 mt-1">
                    Allocates to: CS204 Coursework, AVL Trees & Labs
                  </span>
                </div>
              </button>

              {/* 2. Login to myAdmin */}
              <button
                id="btn-login-myadmin"
                type="button"
                onClick={() => {
                  handlePortalActionClick('myAdmin');
                  onLogin('student', 'myAdmin');
                }}
                className={`group flex flex-col justify-between p-4 rounded-lg border-2 text-left transition-all duration-200 bg-[#F97316] hover:bg-[#EA580C] text-white shadow-md hover:shadow-lg ${
                  selectedAction === 'myAdmin' ? 'ring-3 ring-[#DC2626]/30 border-white' : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-md bg-white/20 flex items-center justify-center text-white">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider">
                    Records & Fees
                  </span>
                  <span className="block text-base font-extrabold text-white mt-0.5">
                    Login to myAdmin
                  </span>
                  <span className="block text-[11px] text-white/90 mt-1">
                    Allocates to: Registration, Academic Audits & Progress
                  </span>
                </div>
              </button>

              {/* 3. Login to SBL */}
              <button
                id="btn-login-sbl"
                type="button"
                onClick={() => {
                  handlePortalActionClick('SBL');
                  onLogin('student', 'SBL');
                }}
                className={`group flex flex-col justify-between p-4 rounded-lg border-2 text-left transition-all duration-200 bg-[#F97316] hover:bg-[#EA580C] text-white shadow-md hover:shadow-lg ${
                  selectedAction === 'SBL' ? 'ring-3 ring-[#DC2626]/30 border-white' : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-md bg-white/20 flex items-center justify-center text-white">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider">
                    Executive Studies
                  </span>
                  <span className="block text-base font-extrabold text-white mt-0.5">
                    Login to SBL
                  </span>
                  <span className="block text-[11px] text-white/90 mt-1">
                    Allocates to: Graduate School of Business Leadership
                  </span>
                </div>
              </button>

              {/* 4. Login to Staff Portal (Direct Action Button) */}
              <button
                id="btn-login-staff-direct"
                type="button"
                onClick={() => {
                  handlePortalActionClick('staff');
                  onLogin('lecturer', 'staffPortal');
                }}
                className={`group flex flex-col justify-between p-4 rounded-lg border-2 text-left transition-all duration-200 bg-[#333333] hover:bg-[#222222] text-white shadow-md hover:shadow-lg ${
                  selectedAction === 'staff' || activeTab === 'staff' ? 'ring-3 ring-[#DC2626]/40 border-[#F97316]' : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-md bg-[#DC2626] flex items-center justify-center text-white">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#F97316] opacity-90 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-[#F97316] uppercase tracking-wider">
                    Academic Staff
                  </span>
                  <span className="block text-base font-extrabold text-white mt-0.5">
                    Login to Staff Portal
                  </span>
                  <span className="block text-[11px] text-zinc-300 mt-1">
                    Allocates to: CS204 Cohort, Attendance & Lecturer Dashboard
                  </span>
                </div>
              </button>

            </div>

            {/* Note on Primary Buttons */}
            <p className="text-[11px] text-[#666666] mt-4 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
              <span>
                Clicking any primary button opens the authenticated portal. You may also enter specific credentials in the form on the right.
              </span>
            </p>
          </div>

          {/* Academic Announcements Block */}
          <div className="bg-[#F5F5F5] rounded-xl p-5 border border-[#E0E0E0]">
            <h3 className="text-xs font-bold text-[#DC2626] uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              UNISA Academic Notices
            </h3>
            <ul className="space-y-2 text-xs text-[#333333]">
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#DC2626] shrink-0">•</span>
                <span>
                  <strong>CS204 Trees Lab:</strong> Required practical worksheet must be completed before 16:00 SAST today in Room C1.08.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#DC2626] shrink-0">•</span>
                <span>
                  <strong>Solulu Elevate AI Agent Alert:</strong> Automated academic engagement digests, risk notifications & WhatsApp reminders are now active for the Department of Computing.
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Right Column: Unified SSO Authentication Card */}
        <div className="w-full lg:w-5/12 bg-white rounded-xl border border-[#E0E0E0] shadow-lg overflow-hidden">
          
          {/* Header Banner in Vibrant Red #DC2626 */}
          <div className="bg-[#DC2626] text-white p-5 border-b-2 border-[#F97316] text-center">
            <h2 className="text-xl font-bold uppercase tracking-wider text-white">
              UNISA Single Sign-On
            </h2>
            <p className="text-xs text-white/90 mt-0.5">
              Secure identity authentication for students & academic staff
            </p>
          </div>

          <div className="p-6 sm:p-7">
            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#F5F5F5] rounded-lg border border-[#E0E0E0] mb-4">
              <button
                type="button"
                id="tab-login-student"
                onClick={() => handleAutofill('student')}
                className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'student'
                    ? 'bg-[#DC2626] text-white shadow-xs'
                    : 'text-[#333333] hover:text-[#DC2626]'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Portal</span>
              </button>

              <button
                type="button"
                id="tab-login-staff"
                onClick={() => handleAutofill('lecturer')}
                className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'staff'
                    ? 'bg-[#333333] text-white shadow-xs'
                    : 'text-[#333333] hover:text-[#DC2626]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Staff / Lecturer</span>
              </button>
            </div>

            {/* Portal Allocation Destination Banner */}
            <div
              id="portal-allocation-banner"
              className={`mb-5 p-3 rounded-lg border text-xs flex items-start gap-2.5 transition-all ${
                activeTab === 'staff'
                  ? 'bg-amber-50 border-[#F97316]/40 text-[#7C2D12]'
                  : 'bg-red-50 border-[#DC2626]/30 text-[#991B1B]'
              }`}
            >
              <Compass className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === 'staff' ? 'text-[#F97316]' : 'text-[#DC2626]'}`} />
              <div>
                <p className="font-extrabold uppercase tracking-wide text-[10px]">
                  {activeTab === 'staff' ? 'Staff Portal Destination Allocation' : 'Student Portal Destination Allocation'}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug">
                  {activeTab === 'staff' ? (
                    <span>
                      Allocates user to: <strong className="font-bold underline">Academic Staff & Lecturer Portal</strong> (CS204 Cohort Overview, Real-time Attendance Analytics, WhatsApp Nudges, and Moodle Sync).
                    </span>
                  ) : (
                    <span>
                      Allocates user to: <strong className="font-bold underline">{selectedAction === 'SBL' ? 'UNISA SBL Executive Portal' : selectedAction === 'myAdmin' ? 'myAdmin Student Records & Examinations' : 'myModules LMS Portal'}</strong> (Data Structures & Algorithms, AVL Rotations, Labs, and Full UNISA Academic Calendar).
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#333333] uppercase tracking-wide mb-1">
                  {activeTab === 'student' ? 'Student Number / myLife Email' : 'Staff Email Address'}
                </label>
                <input
                  type="text"
                  id="input-login-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    activeTab === 'student' ? 'e.g. 67283910' : 'e.g. evasquez@unisa.ac.za'
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#CCCCCC] text-sm text-[#333333] focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] bg-white"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wide">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Password assistance: For myUnisa password resets, contact the student helpdesk at 0800 00 1870.");
                    }}
                    className="text-[11px] text-[#DC2626] hover:underline font-semibold"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    id="input-login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#CCCCCC] text-sm text-[#333333] focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] bg-white"
                    required
                  />
                  <Lock className="w-4 h-4 text-[#888888] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-[#FFF1F2] border border-[#FECDD3] rounded-lg text-xs text-[#DC2626] font-bold">
                  {errorMsg}
                </div>
              )}

              {/* Primary Login Button */}
              <button
                type="submit"
                id="btn-submit-login"
                className={`w-full py-3 rounded-lg text-sm font-extrabold uppercase tracking-wider transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                  activeTab === 'staff'
                    ? 'bg-[#333333] hover:bg-[#222222] text-white border-2 border-[#F97316]'
                    : 'bg-[#F97316] hover:bg-[#EA580C] text-white'
                }`}
              >
                <span>
                  {activeTab === 'student'
                    ? `Sign In to ${selectedAction === 'SBL' ? 'SBL' : selectedAction === 'myAdmin' ? 'myAdmin' : 'myModules'}`
                    : 'Sign In to Staff Portal'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Autofill Switchers */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  id="btn-autofill-student"
                  onClick={() => handleAutofill('student')}
                  className={`flex-1 py-2 px-2.5 rounded-md border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'student'
                      ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]'
                      : 'border-[#E0E0E0] text-[#333333] hover:bg-[#F5F5F5]'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Maya Chen (Student)</span>
                </button>
                <button
                  type="button"
                  id="btn-autofill-lecturer"
                  onClick={() => handleAutofill('lecturer')}
                  className={`flex-1 py-2 px-2.5 rounded-md border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'staff'
                      ? 'border-[#F97316] bg-[#FFF7ED] text-[#EA580C]'
                      : 'border-[#E0E0E0] text-[#DC2626] hover:bg-[#FEF2F2]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Dr. Vasquez (Staff)</span>
                </button>
              </div>
            </form>

            {/* Demo Credential Details */}
            <div className="mt-5 p-3.5 bg-[#F5F5F5] rounded-lg border border-[#E0E0E0] text-[11px] text-[#555555] space-y-1">
              <p className="font-bold text-[#333333] uppercase">Demo Access Accounts & Allocations:</p>
              <p>
                • Student: <span className="font-mono text-[#DC2626] font-bold">67283910</span> / student2026 → <span className="italic text-zinc-600">Student myModules LMS & Calendar</span>
              </p>
              <p>
                • Staff: <span className="font-mono text-[#DC2626] font-bold">evasquez@unisa.ac.za</span> / staff2026 → <span className="italic text-zinc-600">Lecturer & Coordinator Portal</span>
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* ── Official UNISA Footer in Dark Charcoal (#333333) with Vibrant Red Accent ── */}
      <footer className="bg-[#333333] text-[#CCCCCC] text-xs py-6 border-t-4 border-[#DC2626]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#DC2626] text-white rounded flex items-center justify-center font-bold text-xs">
              U
            </div>
            <div>
              <p className="font-bold text-white">University of South Africa (UNISA)</p>
              <p className="text-[11px] text-[#AAAAAA]">Preller Street, Muckleneuk Ridge, City of Tshwane, 0003</p>
            </div>
          </div>

          <div className="text-center md:text-right text-[11px] text-[#AAAAAA]">
            <p>© 2026 University of South Africa · All Rights Reserved</p>
            <p className="text-[#F97316] font-semibold mt-0.5">
              Solulu Elevate AI Academic Analytics · POPIA Compliant
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

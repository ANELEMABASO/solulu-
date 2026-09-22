import React, { useState } from 'react';
import { UnisaLogo } from './UnisaLogo';
import { Role, StudentProfile } from '../types';
import {
  authenticateUserWithSupabase,
  registerStudentWithSupabase,
} from '../lib/supabase';
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
  UserPlus,
  LogIn,
  KeyRound,
  Mail,
  User,
  Building,
  School,
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: Role, destinationPortal?: string, customProfile?: StudentProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student');
  const [username, setUsername] = useState('67283910');
  const [password, setPassword] = useState('student2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('myModules');

  // Sign up form fields
  const [regName, setRegName] = useState('');
  const [regStudentNumber, setRegStudentNumber] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDegree, setRegDegree] = useState('Bachelor of Science in Computing & Informatics');
  const [regCampus, setRegCampus] = useState('Muckleneuk Campus (Pretoria)');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const handlePortalActionClick = (portal: 'myModules' | 'myAdmin' | 'SBL' | 'staff') => {
    setSelectedAction(portal);
    setAuthMode('login');
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
    setSuccessMsg('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (authMode === 'signup') {
        // Validation for registration
        if (!regName.trim() || regName.trim().length < 2) {
          setErrorMsg('Please enter your full name.');
          setIsSubmitting(false);
          return;
        }

        const cleanNum = regStudentNumber.trim();
        if (!cleanNum || cleanNum.length < 5) {
          setErrorMsg('Please enter a valid student number (e.g. 8 digits, such as 67394821).');
          setIsSubmitting(false);
          return;
        }

        if (regPassword.length < 4) {
          setErrorMsg('Password must be at least 4 characters long.');
          setIsSubmitting(false);
          return;
        }

        if (regPassword !== regConfirmPassword) {
          setErrorMsg('Passwords do not match. Please re-enter.');
          setIsSubmitting(false);
          return;
        }

        const regResult = await registerStudentWithSupabase({
          studentNumber: cleanNum,
          name: regName.trim(),
          email: regEmail.trim() || `${cleanNum}@mylife.unisa.ac.za`,
          qualification: regDegree,
          campus: regCampus,
          password: regPassword,
        });

        if (regResult.success) {
          setSuccessMsg(
            `Account successfully registered on Supabase! Logging you in as ${regResult.student.name}...`
          );
          setTimeout(() => {
            onLogin('student', selectedAction, regResult.student);
          }, 900);
        } else {
          setErrorMsg('Registration failed. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      // Login Flow: check credentials and verify against database/account list
      const result = await authenticateUserWithSupabase(username, password, activeTab);

      if (!result.success) {
        setErrorMsg(
          result.error ||
            'No access found for these details. If you do not have an account, please click "Sign Up for Access" below.'
        );
        setIsSubmitting(false);
        return;
      }

      if (result.role === 'lecturer') {
        onLogin('lecturer', 'staffPortal');
      } else {
        onLogin('student', selectedAction, result.studentProfile);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutofill = (type: 'student' | 'lecturer') => {
    setAuthMode('login');
    if (type === 'student') {
      setActiveTab('student');
      setUsername('67283910');
      setPassword('student2026');
      setSelectedAction('myModules');
      setErrorMsg('');
      setSuccessMsg('');
    } else {
      setActiveTab('staff');
      setUsername('evasquez@unisa.ac.za');
      setPassword('staff2026');
      setSelectedAction('staff');
      setErrorMsg('');
      setSuccessMsg('');
    }
  };

  const switchToSignUp = () => {
    setAuthMode('signup');
    setErrorMsg('');
    setSuccessMsg('');
    // Suggest a new unique student number if empty
    if (!regStudentNumber) {
      const randomNum = `67${Math.floor(100000 + Math.random() * 900000)}`;
      setRegStudentNumber(randomNum);
      setRegEmail(`${randomNum}@mylife.unisa.ac.za`);
    }
  };

  const switchToLogin = () => {
    setAuthMode('login');
    setErrorMsg('');
    setSuccessMsg('');
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
        
        {/* Left Column: Quick Portal Action Launchers */}
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
                  Enter your credentials on the right or choose a targeted portal. If you don't have details, sign up below.
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-wider bg-[#FFF7ED] px-2.5 py-1 rounded border border-[#FFEDD5]">
                Target Portals
              </span>
            </div>

            {/* Action Buttons Grid: 4 Action Portals including Staff Portal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* 1. Login to myModules */}
              <button
                id="btn-login-mymodules"
                type="button"
                onClick={() => handlePortalActionClick('myModules')}
                className={`group flex flex-col justify-between p-4 rounded-lg border-2 text-left transition-all duration-200 bg-[#F97316] hover:bg-[#EA580C] text-white shadow-md hover:shadow-lg cursor-pointer ${
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
                onClick={() => handlePortalActionClick('myAdmin')}
                className={`group flex flex-col justify-between p-4 rounded-lg border-2 text-left transition-all duration-200 bg-[#F97316] hover:bg-[#EA580C] text-white shadow-md hover:shadow-lg cursor-pointer ${
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
                onClick={() => handlePortalActionClick('SBL')}
                className={`group flex flex-col justify-between p-4 rounded-lg border-2 text-left transition-all duration-200 bg-[#F97316] hover:bg-[#EA580C] text-white shadow-md hover:shadow-lg cursor-pointer ${
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

              {/* 4. Login to Staff Portal */}
              <button
                id="btn-login-staff-direct"
                type="button"
                onClick={() => handlePortalActionClick('staff')}
                className={`group flex flex-col justify-between p-4 rounded-lg border-2 text-left transition-all duration-200 bg-[#333333] hover:bg-[#222222] text-white shadow-md hover:shadow-lg cursor-pointer ${
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

            {/* Note on Access Requirement */}
            <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#F97316] shrink-0" />
                <span>
                  <strong>Authentication Required:</strong> You must enter verified details or create a new student account to enter.
                </span>
              </div>
              <button
                onClick={switchToSignUp}
                className="font-bold text-[#DC2626] hover:underline underline shrink-0 cursor-pointer text-[11px]"
              >
                Sign Up Now →
              </button>
            </div>
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

        {/* Right Column: Unified SSO Authentication Card (Login or Sign Up) */}
        <div className="w-full lg:w-5/12 bg-white rounded-xl border border-[#E0E0E0] shadow-lg overflow-hidden">
          
          {/* Header Banner in Vibrant Red #DC2626 */}
          <div className="bg-[#DC2626] text-white p-5 border-b-2 border-[#F97316] text-center">
            <h2 className="text-xl font-bold uppercase tracking-wider text-white">
              {authMode === 'login' ? 'UNISA Single Sign-On' : 'New Student Registration'}
            </h2>
            <p className="text-xs text-white/90 mt-0.5">
              {authMode === 'login'
                ? 'Sign in with your student credentials or register if you do not have one'
                : 'Create your myUNISA account to gain access to learning portals'}
            </p>
          </div>

          <div className="p-6 sm:p-7">
            {/* Mode Switcher (Sign In vs Sign Up) */}
            <div className="flex border-b border-gray-200 mb-5">
              <button
                type="button"
                id="btn-switch-login-mode"
                onClick={switchToLogin}
                className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'login'
                    ? 'border-[#DC2626] text-[#DC2626]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>1. Sign In (Existing Access)</span>
              </button>
              <button
                type="button"
                id="btn-switch-signup-mode"
                onClick={switchToSignUp}
                className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'signup'
                    ? 'border-[#DC2626] text-[#DC2626]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>2. Sign Up (No Details Yet)</span>
              </button>
            </div>

            {authMode === 'login' ? (
              <>
                {/* Role Switcher Tabs (Student vs Staff) */}
                <div className="grid grid-cols-2 p-1 bg-[#F5F5F5] rounded-lg border border-[#E0E0E0] mb-4">
                  <button
                    type="button"
                    id="tab-login-student"
                    onClick={() => handleAutofill('student')}
                    className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                    className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                          Target: <strong className="font-bold underline">Academic Staff & Lecturer Portal</strong> (CS204 Cohort Overview, Attendance, and Moodle Sync).
                        </span>
                      ) : (
                        <span>
                          Target: <strong className="font-bold underline">{selectedAction === 'SBL' ? 'UNISA SBL Executive Portal' : selectedAction === 'myAdmin' ? 'myAdmin Student Records & Examinations' : 'myModules LMS Portal'}</strong>.
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#333333] uppercase tracking-wide mb-1">
                      {activeTab === 'student' ? 'Student Number / myLife Email' : 'Staff Email Address'}
                    </label>
                    <div className="relative">
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
                      <User className="w-4 h-4 text-[#888888] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
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
                    <div className="p-3 bg-[#FFF1F2] border border-[#FECDD3] rounded-lg text-xs text-[#DC2626] font-semibold space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <span>⚠️ Access Denied:</span>
                      </p>
                      <p>{errorMsg}</p>
                      <button
                        type="button"
                        onClick={switchToSignUp}
                        className="mt-1 text-[11px] font-bold text-[#DC2626] underline hover:text-[#991B1B] block cursor-pointer"
                      >
                        Don't have login details? Click here to Sign Up →
                      </button>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {/* Primary Login Button */}
                  <button
                    type="submit"
                    id="btn-submit-login"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg text-sm font-extrabold uppercase tracking-wider transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === 'staff'
                        ? 'bg-[#333333] hover:bg-[#222222] text-white border-2 border-[#F97316]'
                        : 'bg-[#F97316] hover:bg-[#EA580C] text-white'
                    } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <span>
                      {isSubmitting
                        ? 'Verifying Details...'
                        : activeTab === 'student'
                        ? `Sign In to ${selectedAction === 'SBL' ? 'SBL' : selectedAction === 'myAdmin' ? 'myAdmin' : 'myModules'}`
                        : 'Sign In to Staff Portal'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* No details prompt banner */}
                  <div className="pt-2 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-600">
                      Don't have your login details yet?{' '}
                      <button
                        type="button"
                        onClick={switchToSignUp}
                        className="text-[#DC2626] font-bold hover:underline cursor-pointer"
                      >
                        Sign Up for Access Here
                      </button>
                    </p>
                  </div>

                  {/* Quick Demo Autofill Switchers */}
                  <div className="pt-1 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      id="btn-autofill-student"
                      onClick={() => handleAutofill('student')}
                      className={`flex-1 py-2 px-2.5 rounded-md border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
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
                      className={`flex-1 py-2 px-2.5 rounded-md border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
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
              </>
            ) : (
              /* Sign Up Form for users without details */
              <form onSubmit={handleFormSubmit} className="space-y-3.5">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <p className="font-bold flex items-center gap-1.5 mb-0.5">
                    <UserPlus className="w-4 h-4 text-[#F97316]" />
                    <span>New myUNISA Registration</span>
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Fill in your details below. Your profile will be verified and stored in the database so you can sign in anytime.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wide mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="input-signup-name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Sipho Sithole"
                      className="w-full px-3 py-2 rounded-lg border border-[#CCCCCC] text-sm text-[#333333] focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] bg-white"
                      required
                    />
                    <User className="w-4 h-4 text-[#888888] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#333333] uppercase tracking-wide mb-1">
                      Student Number *
                    </label>
                    <input
                      type="text"
                      id="input-signup-number"
                      value={regStudentNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRegStudentNumber(val);
                        if (!regEmail || regEmail.includes('@mylife.unisa.ac.za')) {
                          setRegEmail(`${val.trim()}@mylife.unisa.ac.za`);
                        }
                      }}
                      placeholder="e.g. 67492019"
                      className="w-full px-3 py-2 rounded-lg border border-[#CCCCCC] text-sm text-[#333333] focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#333333] uppercase tracking-wide mb-1">
                      myLife Email *
                    </label>
                    <input
                      type="email"
                      id="input-signup-email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="67492019@mylife.unisa.ac.za"
                      className="w-full px-3 py-2 rounded-lg border border-[#CCCCCC] text-sm text-[#333333] focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wide mb-1">
                    Qualification / Degree
                  </label>
                  <select
                    id="input-signup-degree"
                    value={regDegree}
                    onChange={(e) => setRegDegree(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#CCCCCC] text-xs text-[#333333] focus:outline-none focus:border-[#DC2626] bg-white"
                  >
                    <option value="Bachelor of Science in Computing & Informatics">
                      BSc in Computing & Informatics
                    </option>
                    <option value="Bachelor of Science in Computer Science">
                      BSc in Computer Science
                    </option>
                    <option value="Diploma in Information Technology">
                      Diploma in Information Technology
                    </option>
                    <option value="Bachelor of Commerce in Information Systems">
                      BCom in Information Systems
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wide mb-1">
                    Campus Location
                  </label>
                  <select
                    id="input-signup-campus"
                    value={regCampus}
                    onChange={(e) => setRegCampus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#CCCCCC] text-xs text-[#333333] focus:outline-none focus:border-[#DC2626] bg-white"
                  >
                    <option value="Muckleneuk Campus (Pretoria)">Muckleneuk Campus (Pretoria)</option>
                    <option value="Science Campus (Florida, Johannesburg)">
                      Science Campus (Florida, JHB)
                    </option>
                    <option value="Durban Regional Campus">Durban Regional Campus</option>
                    <option value="Cape Town Regional Campus">Cape Town Regional Campus</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#333333] uppercase tracking-wide mb-1">
                      Create Password *
                    </label>
                    <input
                      type="password"
                      id="input-signup-password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-lg border border-[#CCCCCC] text-sm text-[#333333] focus:outline-none focus:border-[#DC2626] bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#333333] uppercase tracking-wide mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      id="input-signup-confirm-password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-lg border border-[#CCCCCC] text-sm text-[#333333] focus:outline-none focus:border-[#DC2626] bg-white"
                      required
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-[#FFF1F2] border border-[#FECDD3] rounded-lg text-xs text-[#DC2626] font-bold">
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Submit Sign Up Button */}
                <button
                  type="submit"
                  id="btn-submit-signup"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg text-sm font-extrabold uppercase tracking-wider transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering on Supabase...' : 'Complete Sign Up & Enter Portal'}</span>
                </button>

                <div className="pt-2 text-center border-t border-gray-100">
                  <p className="text-xs text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={switchToLogin}
                      className="text-[#DC2626] font-bold hover:underline cursor-pointer"
                    >
                      Sign In here
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* Demo Credential Details */}
            <div className="mt-5 p-3.5 bg-[#F5F5F5] rounded-lg border border-[#E0E0E0] text-[11px] text-[#555555] space-y-1">
              <p className="font-bold text-[#333333] uppercase">Enrolled Accounts & Access Rules:</p>
              <p>
                • Enrolled Student: <span className="font-mono text-[#DC2626] font-bold">67283910</span> / student2026
              </p>
              <p>
                • Staff Coordinator: <span className="font-mono text-[#DC2626] font-bold">evasquez@unisa.ac.za</span> / staff2026
              </p>
              <p className="text-emerald-700 font-medium">
                • New student? Switch to <strong>"Sign Up (No Details Yet)"</strong> to register your name & student number into Supabase.
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


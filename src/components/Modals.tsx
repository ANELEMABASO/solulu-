import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  CheckCircle,
  FileText,
  Clock,
  Send,
  AlertCircle,
  HelpCircle,
  UploadCloud,
  Check,
} from 'lucide-react';

// ── 1. CS204 Week 7 Lesson Modal ──────────────────────────────────────────────
export const LessonModal: React.FC<{ onClose: () => void; onComplete: () => void }> = ({
  onClose,
  onComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30);

  useEffect(() => {
    let timer: any;
    if (isPlaying && progress < 100) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 99) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [isPlaying, progress]);

  const steps = [
    { title: 'Why self-balancing BSTs matter: Worst-case O(n) degeneration', time: '04:12', done: progress >= 20 },
    { title: 'The AVL Invariant: Balance Factor = Height(L) - Height(R) ∈ {-1, 0, 1}', time: '08:45', done: progress >= 40 },
    { title: 'Single Rotations: LL (Right Rotate) and RR (Left Rotate)', time: '06:18', done: progress >= 70 },
    { title: 'Double Rotations: LR (Left-then-Right) and RL (Right-then-Left)', time: '07:30', done: progress >= 95 },
    { title: 'Proof of O(log n) upper bound & comparison with Red-Black Trees', time: '05:15', done: progress === 100 },
  ];

  return (
    <div
      className="fixed inset-0 bg-[#333333]/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-sans"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl border border-[#DC2626]">
        {/* Modal Header */}
        <div className="bg-[#DC2626] text-white p-5 flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
              UNISA CS204 · Week 7 Lecture & Lab Practical
            </span>
            <h2 className="text-xl font-bold mt-2">Balanced Binary Search Trees (AVL Rotations)</h2>
            <p className="text-xs text-white/90 mt-0.5">
              Module Coordinator: Dr. Elena Vasquez · Duration: 32 min
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Simulation Canvas */}
        <div className="p-6 space-y-5">
          <div className="bg-[#222222] rounded-xl h-44 relative flex items-center justify-center overflow-hidden border border-[#333333] shadow-inner">
            {/* Visual simulation of tree balance */}
            <div className="absolute inset-0 opacity-20 flex items-center justify-center font-mono text-xs text-white select-none">
              <pre>{`       [20]
      /    \\
    [10]    [30]
   /   \\      \\
  [5]  [15]   [40] (AVL Balance Factor: 0)`}</pre>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-lg relative z-10"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>

            {/* Scrubber Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2.5 flex items-center gap-3 text-xs text-white">
              <span className="font-mono text-[11px]">{Math.floor((progress * 32) / 100)}:15</span>
              <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-[#F97316] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="font-mono text-[11px]">32:00</span>
            </div>
          </div>

          {/* Syllabus Outline */}
          <div className="bg-[#F5F5F5] rounded-lg p-4 border border-[#E0E0E0]">
            <h4 className="text-xs font-bold text-[#DC2626] uppercase tracking-wider mb-2.5">
              Structured Lesson Modules
            </h4>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2 rounded-md bg-white border border-[#EAEAEA]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        step.done
                          ? 'bg-[#F97316] text-white'
                          : 'bg-[#F0F0F0] text-[#666666]'
                      }`}
                    >
                      {step.done ? <Check className="w-3 h-3" /> : idx + 1}
                    </span>
                    <span className="font-medium text-[#333333]">{step.title}</span>
                  </div>
                  <span className="text-[11px] text-[#777777] font-mono">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                setProgress(100);
                setIsPlaying(false);
                onComplete();
              }}
              className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              Mark Lesson as Complete & Log to Salulu
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#CCCCCC] text-xs font-bold text-[#333333] hover:bg-[#F5F5F5]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 2. CS204 Trees Lab Worksheet Modal ─────────────────────────────────────────
export const WorksheetModal: React.FC<{ onClose: () => void; onSubmit: () => void }> = ({
  onClose,
  onSubmit,
}) => {
  const [answers, setAnswers] = useState({
    q1: 'Height of Left Subtree minus Height of Right Subtree.',
    q2: 'Left rotation at node A followed by right rotation at root B.',
    q3: 'AVL trees guarantee strict logarithmic height limit ≤ 1.44 log2(n).',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onSubmit();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 bg-[#333333]/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-sans"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-xl overflow-hidden shadow-2xl border border-[#DC2626]">
        {/* Header */}
        <div className="bg-[#DC2626] text-white p-5 flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
              Required Practical Prep · Today 16:00 Room C1.08
            </span>
            <h2 className="text-xl font-bold mt-2">CS204 Trees Lab Worksheet</h2>
            <p className="text-xs text-white/90 mt-0.5">
              Automated submission will verify your lab attendance record with Dr. Vasquez
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#ECFDF5] text-[#16A34A] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#333333]">
              Worksheet Submitted & Verified!
            </h3>
            <p className="text-xs text-[#666666] max-w-md mx-auto">
              Salulu AI has logged your preparation in the attendance audit log. Your lab instructor
              Dr. Elena Vasquez has received confirmation.
            </p>
            <button
              onClick={onClose}
              className="mt-4 bg-[#DC2626] text-white px-6 py-2 rounded-lg text-xs font-bold"
            >
              Return to Module
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#333333]">
                1. How is the Balance Factor of an AVL tree node calculated?
              </label>
              <textarea
                value={answers.q1}
                onChange={(e) => setAnswers({ ...answers, q1: e.target.value })}
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-[#CCCCCC] focus:outline-none focus:border-[#DC2626]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#333333]">
                2. What rotations resolve an LR (Left-Right) tree imbalance?
              </label>
              <textarea
                value={answers.q2}
                onChange={(e) => setAnswers({ ...answers, q2: e.target.value })}
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-[#CCCCCC] focus:outline-none focus:border-[#DC2626]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#333333]">
                3. What is the guaranteed worst-case search complexity of an AVL tree?
              </label>
              <textarea
                value={answers.q3}
                onChange={(e) => setAnswers({ ...answers, q3: e.target.value })}
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-[#CCCCCC] focus:outline-none focus:border-[#DC2626]"
                required
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#EAEAEA]">
              <button
                type="submit"
                className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Submit Worksheet & Sync Attendance
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg border border-[#CCCCCC] text-xs font-bold text-[#333333] hover:bg-[#F5F5F5]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── 3. Algorithm Analysis Coursework Modal ──────────────────────────────────────
export const AssignmentModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-[#333333]/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-sans"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#DC2626]">
        {/* Header */}
        <div className="bg-[#333333] text-white p-5 flex items-start justify-between border-b-2 border-[#F97316]">
          <div>
            <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-wider">
              Assessment 02 · Continuous Evaluation
            </span>
            <h2 className="text-xl font-bold mt-1">Algorithm Analysis Coursework</h2>
            <p className="text-xs text-[#CCCCCC] mt-0.5">
              Weighting: 20% of final grade · Due: 2 October 2026, 23:59 SAST
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Progress */}
          <div className="bg-[#F5F5F5] rounded-lg p-4 border border-[#E0E0E0]">
            <div className="flex justify-between items-baseline text-xs font-bold mb-1">
              <span className="text-[#333333]">Current Draft Completion</span>
              <span className="text-[#DC2626]">35% Completed</span>
            </div>
            <div className="h-3 bg-[#E0E0E0] rounded-full overflow-hidden">
              <div className="h-full bg-[#F97316] rounded-full" style={{ width: '35%' }} />
            </div>
            <p className="text-[11px] text-[#666666] mt-2">
              Salulu monitors your milestone pace and will dispatch a WhatsApp reminder 48 hours prior to deadline.
            </p>
          </div>

          <div className="space-y-2 text-xs text-[#333333]">
            <p className="font-bold text-[#DC2626]">Submission Guidelines:</p>
            <ul className="list-disc pl-4 space-y-1 text-[#555555]">
              <li>PDF report with asymptotic proofs (Master Theorem, recursion trees).</li>
              <li>Java source code implementing AVL rotation validation suite.</li>
              <li>Plagiarism threshold check via Turnitin (Maximum 15% similarity).</li>
            </ul>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={() => {
                alert("Coursework draft opened in myModules workspace.");
                onClose();
              }}
              className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider"
            >
              Continue Working on Draft →
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#CCCCCC] text-xs font-bold text-[#333333] hover:bg-[#F5F5F5]"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

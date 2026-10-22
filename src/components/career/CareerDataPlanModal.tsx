import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  Globe,
  Briefcase,
  ShieldCheck,
  User,
  Link as LinkIcon,
  DollarSign,
  Clock,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { CandidateDataPlan } from '../../lib/drcDiscoveryApi';

interface CareerDataPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDataPlan: (plan: CandidateDataPlan, resumeFiles: File[]) => void;
  initialPlan?: Partial<CandidateDataPlan>;
}

const STORAGE_KEY = 'drc_candidate_data_plan_v1';

export const CareerDataPlanModal: React.FC<CareerDataPlanModalProps> = ({
  isOpen,
  onClose,
  onSaveDataPlan,
  initialPlan,
}) => {
  // Load saved plan from localStorage or defaults
  const [dataPlan, setDataPlan] = useState<CandidateDataPlan>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      location: 'India',
      linkedin_url: '',
      github_url: '',
      portfolio_url: '',
      other_website_url: '',
      work_authorization: true,
      requires_sponsorship: false,
      notice_period: 'Immediate',
      earliest_start_date: 'Immediate',
      open_to_relocation: true,
      expected_salary: 'Competitive / Market Standard',
      current_salary: '',
      currency: 'INR',
      eeo_gender: 'Decline to Self-Identify',
      eeo_race: 'Decline to Self-Identify',
      eeo_veteran: 'Decline to Self-Identify',
      eeo_disability: 'Decline to Self-Identify',
      summary_note: '',
      ...initialPlan,
    };
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'auth' | 'resumes'>('resumes');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (initialPlan) {
      setDataPlan((prev) => ({ ...prev, ...initialPlan }));
    }
  }, [initialPlan]);

  if (!isOpen) return null;

  // Calculate profile completeness score
  const requiredFields = [
    dataPlan.first_name,
    dataPlan.last_name,
    dataPlan.email,
    dataPlan.phone,
    dataPlan.location,
  ];
  const filledCount = requiredFields.filter((f) => !!f && f.trim().length > 0).length;
  const hasResume = uploadedFiles.length > 0;
  const completeness = Math.round(
    ((filledCount + (hasResume ? 2 : 0) + (dataPlan.linkedin_url ? 1 : 0)) / 8) * 100
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      toast.success(`Attached ${newFiles.length} resume file(s)`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!dataPlan.email || !dataPlan.first_name) {
      toast.error('First Name and Email are required for ATS form submission.');
      setActiveTab('profile');
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataPlan));
    } catch {}
    onSaveDataPlan(dataPlan, uploadedFiles);
    toast.success('Data Plan & Resume configuration saved successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-[24px] bg-[#121212] border border-[#2e2e2e] shadow-2xl flex flex-col overflow-hidden text-[#fafafa]">
        {/* Header */}
        <div className="p-5 border-b border-[#262626] bg-[#161616] flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#3ecf8e]" />
              <h2 className="text-lg font-bold text-[#fafafa]">
                Auto-Apply Candidate Data Plan &amp; Multi-Upload Hub
              </h2>
            </div>
            <p className="text-xs text-[#898989]">
              Configures universal parameters for Greenhouse, Lever, Ashby, and SmartRecruiters automation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#1c1c1c] border border-[#2e2e2e]">
              <span className="text-[#898989]">Readiness:</span>
              <strong className={completeness >= 80 ? 'text-[#3ecf8e]' : 'text-amber-400'}>
                {completeness}%
              </strong>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#898989] hover:text-[#fafafa] hover:bg-[#222] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#262626] bg-[#141414] px-4">
          <button
            type="button"
            onClick={() => setActiveTab('resumes')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'resumes'
                ? 'border-[#3ecf8e] text-[#3ecf8e]'
                : 'border-transparent text-[#898989] hover:text-[#fafafa]'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Resumes &amp; Documents ({uploadedFiles.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-[#3ecf8e] text-[#3ecf8e]'
                : 'border-transparent text-[#898989] hover:text-[#fafafa]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal &amp; Contact</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'links'
                ? 'border-[#3ecf8e] text-[#3ecf8e]'
                : 'border-transparent text-[#898989] hover:text-[#fafafa]'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Online Portfolios &amp; Links</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('auth')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'auth'
                ? 'border-[#3ecf8e] text-[#3ecf8e]'
                : 'border-transparent text-[#898989] hover:text-[#fafafa]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Work Auth &amp; Logistics</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: RESUMES & MULTI-UPLOAD */}
          {activeTab === 'resumes' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-dashed border-[#3ecf8e]/40 bg-[#151c19] text-center space-y-2">
                <UploadCloud className="w-8 h-8 text-[#3ecf8e] mx-auto" />
                <h4 className="text-sm font-semibold text-[#fafafa]">
                  Attach Resumes / CVs for Auto-Apply
                </h4>
                <p className="text-xs text-[#898989] max-w-md mx-auto">
                  Upload your Master Resume (PDF/DOCX). Supports multiple role-specific resumes (AI/ML, Full Stack, Backend).
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#3ecf8e] hover:bg-[#34b27b] text-[#121212] transition-colors cursor-pointer mt-2 shadow-sm">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Choose PDF / DOCX Files</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#898989] uppercase tracking-wider">
                    Attached Files ({uploadedFiles.length})
                  </label>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#181818] border border-[#282828]"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#3ecf8e]" />
                          <div>
                            <div className="text-xs font-semibold text-[#fafafa]">{file.name}</div>
                            <div className="text-[10px] text-[#898989]">
                              {(file.size / 1024).toFixed(1)} KB • {idx === 0 ? 'Primary Master CV' : 'Secondary Attachment'}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="p-1.5 rounded-lg text-[#898989] hover:text-rose-400 hover:bg-[#222] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PERSONAL & CONTACT */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b4b4b4]">First Name *</label>
                <input
                  type="text"
                  value={dataPlan.first_name}
                  onChange={(e) => setDataPlan({ ...dataPlan, first_name: e.target.value })}
                  placeholder="e.g. Yash"
                  className="w-full px-3 py-2 bg-[#181818] border border-[#2e2e2e] rounded-xl text-xs text-[#fafafa] outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b4b4b4]">Last Name *</label>
                <input
                  type="text"
                  value={dataPlan.last_name}
                  onChange={(e) => setDataPlan({ ...dataPlan, last_name: e.target.value })}
                  placeholder="e.g. Sonawane"
                  className="w-full px-3 py-2 bg-[#181818] border border-[#2e2e2e] rounded-xl text-xs text-[#fafafa] outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b4b4b4]">Email Address *</label>
                <input
                  type="email"
                  value={dataPlan.email}
                  onChange={(e) => setDataPlan({ ...dataPlan, email: e.target.value })}
                  placeholder="e.g. candidate@example.com"
                  className="w-full px-3 py-2 bg-[#181818] border border-[#2e2e2e] rounded-xl text-xs text-[#fafafa] outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b4b4b4]">Phone / Mobile Number *</label>
                <input
                  type="tel"
                  value={dataPlan.phone}
                  onChange={(e) => setDataPlan({ ...dataPlan, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-3 py-2 bg-[#181818] border border-[#2e2e2e] rounded-xl text-xs text-[#fafafa] outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-[#b4b4b4]">Current City / Location</label>
                <input
                  type="text"
                  value={dataPlan.location}
                  onChange={(e) => setDataPlan({ ...dataPlan, location: e.target.value })}
                  placeholder="e.g. Bengaluru, Karnataka, India"
                  className="w-full px-3 py-2 bg-[#181818] border border-[#2e2e2e] rounded-xl text-xs text-[#fafafa] outline-none focus:border-[#3ecf8e]"
                />
              </div>
            </div>
          )}

          {/* TAB 3: LINKS & PROFILES */}
          {activeTab === 'links' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b4b4b4]">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={dataPlan.linkedin_url || ''}
                  onChange={(e) => setDataPlan({ ...dataPlan, linkedin_url: e.target.value })}
                  placeholder="https://www.linkedin.com/in/username"
                  className="w-full px-3 py-2 bg-[#181818] border border-[#2e2e2e] rounded-xl text-xs text-[#fafafa] outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b4b4b4]">GitHub Profile URL</label>
                <input
                  type="url"
                  value={dataPlan.github_url || ''}
                  onChange={(e) => setDataPlan({ ...dataPlan, github_url: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-2 bg-[#181818] border border-[#2e2e2e] rounded-xl text-xs text-[#fafafa] outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#b4b4b4]">Portfolio / Personal Website</label>
                <input
                  type="url"
                  value={dataPlan.portfolio_url || ''}
                  onChange={(e) => setDataPlan({ ...dataPlan, portfolio_url: e.target.value })}
                  placeholder="https://myportfolio.com"
                  className="w-full px-3 py-2 bg-[#181818] border border-[#2e2e2e] rounded-xl text-xs text-[#fafafa] outline-none focus:border-[#3ecf8e]"
                />
              </div>
            </div>
          )}

          {/* TAB 4: WORK AUTH & LOGISTICS */}
          {activeTab === 'auth' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#181818] border border-[#282828] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#fafafa]">Work Authorization</div>
                  <div className="text-[11px] text-[#898989]">
                    Legally authorized to work in target location/remote?
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={dataPlan.work_authorization}
                  onChange={(e) => setDataPlan({ ...dataPlan, work_authorization: e.target.checked })}
                  className="w-4 h-4 accent-[#3ecf8e]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#181818] border border-[#282828] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#fafafa]">Visa Sponsorship Required?</div>
                  <div className="text-[11px] text-[#898989]">
                    Will you now or in future require visa sponsorship?
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={dataPlan.requires_sponsorship}
                  onChange={(e) => setDataPlan({ ...dataPlan, requires_sponsorship: e.target.checked })}
                  className="w-4 h-4 accent-[#3ecf8e]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#b4b4b4]">Notice Period</label>
                  <select
                    value={dataPlan.notice_period}
                    onChange={(e) => setDataPlan({ ...dataPlan, notice_period: e.target.value })}
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2e2e2e] rounded-xl text-xs text-[#fafafa] outline-none focus:border-[#3ecf8e]"
                  >
                    <option value="Immediate">Immediate / Serving Notice</option>
                    <option value="15 days">15 Days</option>
                    <option value="30 days">30 Days</option>
                    <option value="60 days">60 Days</option>
                    <option value="90 days">90 Days</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#b4b4b4]">Expected Compensation</label>
                  <input
                    type="text"
                    value={dataPlan.expected_salary || ''}
                    onChange={(e) => setDataPlan({ ...dataPlan, expected_salary: e.target.value })}
                    placeholder="e.g. 18-24 LPA / Competitive"
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2e2e2e] rounded-xl text-xs text-[#fafafa] outline-none focus:border-[#3ecf8e]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#262626] bg-[#161616] flex items-center justify-between">
          <div className="text-xs text-[#898989]">
            {uploadedFiles.length > 0 ? (
              <span className="text-[#3ecf8e] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resume Attached ({uploadedFiles[0].name})
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                No Resume File Attached Yet
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-[#222] hover:bg-[#282828] text-[#fafafa] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#3ecf8e] hover:bg-[#34b27b] text-[#121212] transition-colors shadow-sm"
            >
              Save &amp; Enable Auto-Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

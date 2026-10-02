import React, { useState } from 'react';
import { X, CheckCircle, FileText, UserCheck, Sparkles, Send } from 'lucide-react';
import { StepResumeUpload } from './StepResumeUpload';
import { StepProfileReview } from './StepProfileReview';
import { StepRecommendations } from './StepRecommendations';
import { StepReviewSubmit } from './StepReviewSubmit';
import { StepSuccessReceipt } from './StepSuccessReceipt';
import { CandidateParsedProfile } from '../../lib/applicationApi';

interface ApplicationFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    company: string;
    location?: string;
    salary?: string;
    skills?: string[];
    description?: string;
    experience?: string;
    applicationUrl?: string;
  };
}

type FlowStep = 'upload' | 'profile' | 'recommendations' | 'review' | 'success';

export const ApplicationFlowModal: React.FC<ApplicationFlowModalProps> = ({
  isOpen,
  onClose,
  job,
}) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateParsedProfile | null>(null);
  const [selectedAdditionalJobIds, setSelectedAdditionalJobIds] = useState<string[]>([]);
  const [submittedApplicationId, setSubmittedApplicationId] = useState('');

  if (!isOpen || !job) return null;

  const handleResumeParsed = (file: File, profile: CandidateParsedProfile) => {
    setUploadedFile(file);
    setCandidateProfile(profile);
    setCurrentStep('profile');
  };

  const handleSkipResume = () => {
    const emptyProfile: CandidateParsedProfile = {
      name: '',
      email: '',
      phone: '',
      location: 'Pune, Maharashtra, India',
      total_experience_years: 3.0,
      primary_domain: 'Software Engineering',
      target_roles: [job.title],
      top_skills: job.skills && job.skills.length > 0 ? job.skills : ['Python', 'SQL', 'FastAPI'],
      education: ['Bachelor of Engineering'],
    };
    setCandidateProfile(emptyProfile);
    setCurrentStep('profile');
  };

  const handleProfileReviewed = (updatedProfile: CandidateParsedProfile) => {
    setCandidateProfile(updatedProfile);
    setCurrentStep('recommendations');
  };

  const handleToggleAdditionalJob = (jobId: string) => {
    setSelectedAdditionalJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleSubmitSuccess = (appId: string) => {
    setSubmittedApplicationId(appId);
    setCurrentStep('success');
  };

  const handleResetAndClose = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setCandidateProfile(null);
    setSelectedAdditionalJobIds([]);
    setSubmittedApplicationId('');
    onClose();
  };

  const stepsConfig: { key: FlowStep; label: string; icon: any }[] = [
    { key: 'upload', label: 'Resume', icon: FileText },
    { key: 'profile', label: 'Details', icon: UserCheck },
    { key: 'recommendations', label: 'Recommendations', icon: Sparkles },
    { key: 'review', label: 'Review & Submit', icon: Send },
  ];

  const getStepIndex = (step: FlowStep) => {
    switch (step) {
      case 'upload':
        return 0;
      case 'profile':
        return 1;
      case 'recommendations':
        return 2;
      case 'review':
        return 3;
      case 'success':
        return 4;
      default:
        return 0;
    }
  };

  const currentIdx = getStepIndex(currentStep);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#111] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#00C896] uppercase tracking-wider">
                Direct Job Application
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-400 font-medium">No Login Required</span>
            </div>
            <h2 className="text-base font-bold text-white truncate max-w-md">
              Applying for <span className="text-[#00C896]">{job.title}</span> at {job.company}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Bar (visible if not on success screen) */}
        {currentStep !== 'success' && (
          <div className="px-6 pt-3 pb-2 bg-zinc-950/60 border-b border-zinc-800/60">
            <div className="flex items-center justify-between">
              {stepsConfig.map((s, idx) => {
                const isPassed = currentIdx > idx;
                const isCurrent = currentIdx === idx;
                const Icon = s.icon;

                return (
                  <div key={s.key} className="flex items-center gap-2 flex-1 last:flex-none">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isPassed
                            ? 'bg-emerald-500 text-black'
                            : isCurrent
                            ? 'bg-[#00C896] text-black ring-4 ring-[#00C896]/20'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {isPassed ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span
                        className={`text-xs font-medium hidden sm:inline ${
                          isCurrent
                            ? 'text-white font-bold'
                            : isPassed
                            ? 'text-emerald-400'
                            : 'text-zinc-500'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>

                    {idx < stepsConfig.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 rounded ${
                          isPassed ? 'bg-emerald-500' : 'bg-zinc-800'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {currentStep === 'upload' && (
            <StepResumeUpload onParsed={handleResumeParsed} onSkip={handleSkipResume} />
          )}

          {currentStep === 'profile' && candidateProfile && (
            <StepProfileReview
              initialProfile={candidateProfile}
              resumeFileName={uploadedFile?.name}
              targetJob={job}
              onBack={() => setCurrentStep('upload')}
              onNext={handleProfileReviewed}
            />
          )}

          {currentStep === 'recommendations' && candidateProfile && (
            <StepRecommendations
              candidateProfile={candidateProfile}
              currentJobId={job.id}
              selectedAdditionalJobIds={selectedAdditionalJobIds}
              onToggleAdditionalJob={handleToggleAdditionalJob}
              onBack={() => setCurrentStep('profile')}
              onNext={() => setCurrentStep('review')}
            />
          )}

          {currentStep === 'review' && candidateProfile && (
            <StepReviewSubmit
              targetJob={job}
              candidateProfile={candidateProfile}
              resumeFile={uploadedFile}
              selectedAdditionalJobIds={selectedAdditionalJobIds}
              onBack={() => setCurrentStep('recommendations')}
              onSubmitSuccess={handleSubmitSuccess}
            />
          )}

          {currentStep === 'success' && candidateProfile && (
            <StepSuccessReceipt
              applicationId={submittedApplicationId}
              jobTitle={job.title}
              company={job.company}
              candidateEmail={candidateProfile.email}
              additionalRolesCount={selectedAdditionalJobIds.length}
              applicationUrl={job.applicationUrl}
              onDone={handleResetAndClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

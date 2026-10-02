import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { parseCandidateResume, CandidateParsedProfile } from '../../lib/applicationApi';
import { toast } from 'sonner';

interface StepResumeUploadProps {
  onParsed: (file: File, profile: CandidateParsedProfile) => void;
  onSkip?: () => void;
}

export const StepResumeUpload: React.FC<StepResumeUploadProps> = ({ onParsed, onSkip }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parsingStatusText, setParsingStatusText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(extension)) {
      toast.error('Please upload a valid PDF, DOCX, or TXT file.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds 15MB limit.');
      return;
    }

    setSelectedFile(file);
    setIsParsing(true);
    setParseProgress(20);
    setParsingStatusText('Reading document bytes...');

    try {
      const progressTimer = setInterval(() => {
        setParseProgress((prev) => {
          if (prev < 45) {
            setParsingStatusText('Extracting candidate profile and contact details...');
            return prev + 15;
          }
          if (prev < 80) {
            setParsingStatusText('Analyzing tech stack, experience, and domain skills...');
            return prev + 10;
          }
          return prev;
        });
      }, 350);

      const result = await parseCandidateResume(file);
      clearInterval(progressTimer);
      setParseProgress(100);
      setParsingStatusText('Resume successfully parsed!');

      setTimeout(() => {
        setIsParsing(false);
        toast.success(`Parsed profile for ${result.profile.name || 'candidate'}`);
        onParsed(file, result.profile);
      }, 500);
    } catch (err: any) {
      setIsParsing(false);
      toast.error(err.message || 'Failed to automatically parse resume. You can still edit fields manually.');
      // Create fallback profile so user can proceed
      const fallbackProfile: CandidateParsedProfile = {
        name: file.name.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' '),
        email: '',
        phone: '',
        location: 'Pune, Maharashtra, India',
        total_experience_years: 3.0,
        primary_domain: 'Software Engineering',
        target_roles: ['Software Engineer', 'Developer'],
        top_skills: ['Python', 'SQL', 'FastAPI', 'Git'],
        education: ['Bachelor of Engineering'],
      };
      onParsed(file, fallbackProfile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-white">Upload Your Resume</h3>
        <p className="text-sm text-zinc-400">
          We will automatically extract your contact info, skills, and experience to auto-fill your application.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isParsing && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-[#00C896] bg-[#00C896]/10 shadow-lg shadow-[#00C896]/20'
            : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/60 hover:bg-zinc-900'
        } ${isParsing ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        {isParsing ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-zinc-700 border-t-[#00C896] animate-spin flex items-center justify-center" />
              <FileText className="w-6 h-6 text-[#00C896] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-xs text-zinc-400 font-medium">
                <span>{parsingStatusText}</span>
                <span>{parseProgress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#00C896] transition-all duration-300 rounded-full"
                  style={{ width: `${parseProgress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              Parsing {selectedFile?.name}...
            </p>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-[#00C896] shadow-md group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-white">
                Click to browse or drag & drop your resume
              </p>
              <p className="text-xs text-zinc-400">
                Supports PDF, DOCX, or TXT (Max 15MB)
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart AI/ATS Auto-Population</span>
            </div>
          </div>
        )}
      </div>

      {/* Manual Entry Fallback */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
        <span className="text-xs text-zinc-500">
          Don't have your resume file right now?
        </span>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 hover:border-zinc-400 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>Fill Form Manually</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#00C896]" />
          </button>
        )}
      </div>
    </div>
  );
};

function Sparkles(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

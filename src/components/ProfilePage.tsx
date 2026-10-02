import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Pencil,
  Plus,
  Download,
  Trash2,
  LogOut,
  MapPin,
  Briefcase,
  Wallet,
  Mail,
  Phone,
  FileText,
  Check,
  ExternalLink,
  X,
  Save,
  Upload,
  Sparkles,
} from "lucide-react";

import { useUser } from "../contexts/UserContext";
import API_ENDPOINTS, { normalizeHostedUrl } from "../config/api";
import ProfileHero from "../components/profile/ProfileHero";
import { allSkills } from "../constants/skills";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  duration: string;
}

interface ITSkill {
  id: string;
  skill: string;
  version: string;
  lastUsed: string;
  experience: string;
}

interface Language {
  id: string;
  name: string;
  proficiency: string;
  read: boolean;
  write: boolean;
  speak: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  link: string;
}


interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

interface CareerDNA {
  coreStrengths: string[];
  enjoyableTasks: string;
  careerValues: string[];
  careerInterests: string[];
  industry: string;
  personalityType: string;
  marketDemand: string;
  emergingTrends: string;
  marketGap: string;
  nicheStatement: string;
  additionalPreferences: string;
}

interface AccomplishmentItem {
  id: string;
  name: string;
  link: string;
  uploadedDate?: string;
  fileName?: string;
}

interface Accomplishments {
  onlineProfiles: AccomplishmentItem[];
  workSamples: AccomplishmentItem[];
  publications: AccomplishmentItem[];
  presentations: AccomplishmentItem[];
  patents: AccomplishmentItem[];
  certifications: AccomplishmentItem[];
}

interface Preferences {
  industry: string;
  department: string;
  roleCategory: string;
  jobRole: string;
  jobType: string;
  employmentType: string;
  shift: string;
  location: string;
  expectedSalary: string;
}

interface UserProfile {
  name: string;
  role: string;
  jobType: string;
  avatar: string;
  location: string;
  experience: string;
  salary: string;
  email: string;
  phone: string;
  resume: { filename: string; uploadedDate: string; fileName?: string };
  summary: string;
  skills: string[];
  experienceList: Experience[];
  education: Education[];
  careerDNA: CareerDNA;
  certifications: Certification[];
  preferences: Preferences;
  itSkills: ITSkill[];
  languages: Language[];
  projects: Project[];
  accomplishments: Accomplishments;
  subscriptionPlan?: string | null;
  isWhatsApp?: boolean;
}

// ----------------------------------------------------------------------
// Avatar Crop Modal
// ----------------------------------------------------------------------
const CROP_SIZE = 240; // diameter of the circular crop area

const AvatarCropModal: React.FC<{
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}> = ({ imageSrc, onConfirm, onCancel }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  // baseW/baseH = displayed size of image at zoom=1 (short side = CROP_SIZE)
  const [baseW, setBaseW] = useState(0);
  const [baseH, setBaseH] = useState(0);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const shortSide = Math.min(img.naturalWidth, img.naturalHeight);
    const s = CROP_SIZE / shortSide;
    setBaseW(Math.round(img.naturalWidth * s));
    setBaseH(Math.round(img.naturalHeight * s));
  };

  const onPointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = { x: clientX, y: clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setOffset({
      x: dragStart.current.ox + (clientX - dragStart.current.x),
      y: dragStart.current.oy + (clientY - dragStart.current.y),
    });
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img || !baseW) return;

    const canvas = document.createElement("canvas");
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    const ctx = canvas.getContext("2d")!;

    // Displayed size of image at current zoom
    const displayW = baseW * zoom;
    const displayH = baseH * zoom;

    // The crop circle is centred in the preview; image is also centred + offset.
    // Relative position of crop circle origin within the displayed image:
    //   relX = displayW/2 - CROP_SIZE/2 - offset.x  (previewW cancels out)
    const relX = displayW / 2 - CROP_SIZE / 2 - offset.x;
    const relY = displayH / 2 - CROP_SIZE / 2 - offset.y;

    // Convert display-space back to original image pixels
    const totalScale = (baseW / img.naturalWidth) * zoom;
    const srcX = relX / totalScale;
    const srcY = relY / totalScale;
    const srcW = CROP_SIZE / totalScale;
    const srcH = CROP_SIZE / totalScale;

    ctx.beginPath();
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, CROP_SIZE, CROP_SIZE);

    canvas.toBlob((blob) => { if (blob) onConfirm(blob); }, "image/jpeg", 0.92);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1c1c1c] border border-zinc-700/50 rounded-2xl overflow-hidden w-full max-w-md shadow-[0_32px_64px_rgba(0,0,0,0.85)]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h3 className="text-white font-semibold text-[15px]">Edit Profile Picture</h3>
          <button
            onClick={onCancel}
            className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Preview canvas ── */}
        <div
          className="relative overflow-hidden bg-black select-none"
          style={{
            height: 320,
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onMouseDown={(e) => { e.preventDefault(); onPointerDown(e.clientX, e.clientY); }}
          onMouseMove={(e) => onPointerMove(e.clientX, e.clientY)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={(e) => { const t = e.touches[0]; onPointerDown(t.clientX, t.clientY); }}
          onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; onPointerMove(t.clientX, t.clientY); }}
          onTouchEnd={() => setIsDragging(false)}
        >
          {/* The image — always loaded, invisible until dimensions are known */}
          <img
            ref={imgRef}
            src={imageSrc}
            onLoad={onImageLoad}
            draggable={false}
            alt="Crop preview"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              ...(baseW > 0
                ? {
                    width: baseW,
                    height: baseH,
                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                  }
                : { opacity: 0 }),
              transformOrigin: "center",
              maxWidth: "none",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />

          {/* Dark vignette with circular hole via outward box-shadow */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: CROP_SIZE,
              height: CROP_SIZE,
              borderRadius: "50%",
              // large outward box-shadow creates the dark overlay outside the circle
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.62)",
              pointerEvents: "none",
            }}
          />

          {/* Teal crop-circle border */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: CROP_SIZE,
              height: CROP_SIZE,
              borderRadius: "50%",
              border: "2px solid rgba(0,200,150,0.9)",
              pointerEvents: "none",
            }}
          />

          {/* Hint text */}
          <p className="absolute bottom-3 left-0 right-0 text-center text-zinc-500 text-[11px] pointer-events-none">
            Drag image to reposition
          </p>
        </div>

        {/* ── Zoom slider ── */}
        <div className="px-6 pt-5 pb-1 flex items-center gap-3">
          {/* minus */}
          <button
            onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="11" width="18" height="2" rx="1" />
            </svg>
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.02}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[#00C896] h-1 cursor-pointer"
          />
          {/* plus */}
          <button
            onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 11h-6V5a1 1 0 0 0-2 0v6H5a1 1 0 0 0 0 2h6v6a1 1 0 0 0 2 0v-6h6a1 1 0 0 0 0-2z" />
            </svg>
          </button>
        </div>

        {/* ── Buttons ── */}
        <div className="flex gap-3 px-6 py-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-[#00C896] text-black font-bold text-sm hover:bg-[#00b386] transition-colors"
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Helper Components
// ----------------------------------------------------------------------
const SectionCard: React.FC<{
  title: string;
  onAdd?: () => void;
  onEdit?: () => void;
  children: React.ReactNode;
}> = ({ title, onAdd, onEdit, children }) => (
  <div className="bg-[#1a1a1a] rounded-2xl border border-zinc-800/60 mb-5 relative group shadow-[0_4px_24px_rgba(0,0,0,0.30)] overflow-hidden">
    <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800/60">
      <h2 className="text-white font-semibold text-[15px] tracking-tight">{title}</h2>
      <div className="flex items-center gap-3">
        {onAdd && (
          <button
            onClick={onAdd}
            className="text-[#00C896] hover:text-[#00b386] text-xs font-semibold uppercase tracking-wide transition-colors flex items-center gap-1"
          >
            <Plus size={13} /> Add
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-[#00C896] hover:bg-zinc-800/60 transition-colors"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-zinc-700/60 w-full max-w-lg rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/70 bg-[#161616]">
          <h3 className="text-white font-semibold text-base tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

const ReadMoreText: React.FC<{
  text: string;
  maxLength?: number;
  className?: string;
}> = ({
  text,
  maxLength = 150,
  className = "text-zinc-400 text-sm leading-relaxed",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;
  if (text.length <= maxLength) return <p className={className}>{text}</p>;
  return (
    <p className={className}>
      {isExpanded ? text : `${text.slice(0, maxLength)}...`}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-[#00C896] ml-1 hover:underline font-medium"
      >
        {isExpanded ? "Read less" : "Read more"}
      </button>
    </p>
  );
};

const formatMonthYear = (value: string) => {
  if (!value) return "";
  const [year, month] = value.split("-");
  return year && month ? `${month}/${year}` : value;
};

const formatExperiencePeriod = (exp: Experience) => {
  if (!exp.startDate) return "";
  const start = formatMonthYear(exp.startDate);
  if (exp.currentlyWorking) return `${start} - Present`;
  return exp.endDate ? `${start} - ${formatMonthYear(exp.endDate)}` : start;
};

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: any) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}

const InputField = React.memo(
  ({ label, name, value, onChange, type = "text", placeholder, className = "" }: InputFieldProps) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(name, e.target.value);
    };

    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-zinc-400 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
          {label}
        </label>
        <input
          type={type}
          value={value || ""}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full bg-zinc-900/80 border border-zinc-700/60 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896]/20 transition-all"
        />
      </div>
    );
  },
);

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
import NotificationBell from './NotificationBell';

interface ProfilePageProps {
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const { user_id } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null!);
  const avatarObjectUrlRef = useRef<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserProfile>({
    name: "",
    role: "",
    jobType: "",
    avatar: "",
    location: "",
    experience: "",
    salary: "",
    email: "",
    phone: "",
    isWhatsApp: false,
    resume: { filename: "", uploadedDate: "" },
    summary: "",
    skills: [],
    subscriptionPlan: null,
    experienceList: [],
    education: [],
    careerDNA: {
      coreStrengths: [],
      enjoyableTasks: "",
      careerValues: [],
      careerInterests: [],
      industry: "",
      personalityType: "",
      marketDemand: "",
      emergingTrends: "",
      marketGap: "",
      nicheStatement: "",
      additionalPreferences: "",
    },
    certifications: [],
    preferences: {
      industry: "",
      department: "",
      roleCategory: "",
      jobRole: "",
      jobType: "",
      employmentType: "",
      shift: "",
      location: "",
      expectedSalary: "",
    },
    itSkills: [],
    languages: [],
    projects: [],
    accomplishments: {
      onlineProfiles: [],
      workSamples: [],
      publications: [],
      presentations: [],
      patents: [],
      certifications: [],
    },
  });

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [selectedSkillOption, setSelectedSkillOption] = useState("");
  const [skillsError, setSkillsError] = useState("");
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [pendingAvatarSrc, setPendingAvatarSrc] = useState<string>("");
  const [parsedResumeDetails, setParsedResumeDetails] = useState<any | null>(null);
  const [isParsedResumeDialogOpen, setIsParsedResumeDialogOpen] = useState(false);

  const getHeaders = (): HeadersInit => ({
    "Content-Type": "application/json",
    "X-SESSION-TOKEN":
      localStorage.getItem("session_token") || localStorage.getItem("token") || "",
  });
  const getSessionToken = () =>
    localStorage.getItem("session_token") || localStorage.getItem("token") || "";
  const getAvatarRemovedKey = (id: string) => `profile_avatar_removed_${id}`;
  const isAvatarRemoved = (id: string) =>
    localStorage.getItem(getAvatarRemovedKey(id)) === "true";
  const markAvatarRemoved = (id: string) => {
    localStorage.setItem(getAvatarRemovedKey(id), "true");
    window.dispatchEvent(new CustomEvent("profile-avatar-removed", { detail: { userId: id } }));
  };
  const clearAvatarRemoved = (id: string) => {
    localStorage.removeItem(getAvatarRemovedKey(id));
    window.dispatchEvent(new CustomEvent("profile-avatar-updated", { detail: { userId: id } }));
  };
  const setAvatarFromBlob = (blob: Blob) => {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(blob);
    avatarObjectUrlRef.current = objectUrl;
    setUser((prev) => ({ ...prev, avatar: objectUrl }));
  };
  const loadProfileAvatar = async (id: string) => {
    if (isAvatarRemoved(id)) {
      setUser((prev) => ({ ...prev, avatar: "" }));
      return false;
    }
    const url = API_ENDPOINTS.FILES_PROFILE_PICTURE(id);
    console.log(`[Avatar] Fetching for user_id=${id}`, url);
    const response = await fetch(url, {
      headers: {
        "X-SESSION-TOKEN": getSessionToken(),
      },
    });
    console.log(`[Avatar] Response status: ${response.status} (ok=${response.ok})`);
    if (!response.ok) return false;
    const blob = await response.blob();
    console.log(`[Avatar] Loaded blob size=${blob.size} type=${blob.type}`);
    setAvatarFromBlob(blob);
    return true;
  };

  const handleChange = React.useCallback((name: string, value: any) => {
    setEditData((prev: any) => ({
      ...prev,
      [name]: value,
      ...(name === "currentlyWorking" && value ? { endDate: "" } : {}),
    }));
  }, []);
  // ----------------------------------------------------------------------
  // API Helper Functions
  // ----------------------------------------------------------------------
  const apiRequest = async <T = any,>(
    url: string,
    options: RequestInit = {},
  ): Promise<T> => {
    const response = await fetch(url, {
      ...options,
      headers: { ...getHeaders(), ...options.headers },
    });
    if (!response.ok) {
      const error = await response.text();
      const isSessionError =
        response.status === 401 ||
        response.status === 403 ||
        error.toLowerCase().includes("session") ||
        error.toLowerCase().includes("expired") ||
        error.toLowerCase().includes("unauthorized");
      if (isSessionError) {
        sessionStorage.setItem('session_expired_msg', 'Your session has expired. Please log in again.');
        onLogout();
        throw new Error("SESSION_EXPIRED");
      }
      throw new Error(error || "API request failed");
    }
    if (response.status === 204) {
      console.log("[ProfilePage API] 204 response", { url, method: options.method || "GET" });
      return null as T;
    }
    const text = await response.text();
    const parsed = (text ? JSON.parse(text) : null) as T;
    console.log("[ProfilePage API] response data", {
      url,
      method: options.method || "GET",
      data: parsed,
    });
    return parsed;
  };

  const safeArray = (value: any) => (Array.isArray(value) ? value : []);
  const parseSkills = (value: any): string[] => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        // Fall back to comma-separated parsing for legacy payloads.
      }
      return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };
  const parseJsonArray = (value: any) => {
    if (Array.isArray(value)) return value;
    if (typeof value !== "string" || !value.trim()) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const toExperienceUI = (item: any): Experience => {
    const endDate = item?.end_date || item?.endDate || "";
    return {
      id: item?.id || crypto.randomUUID(),
      title: item?.job_title || item?.title || "",
      company: item?.company_name || item?.company || "",
      startDate: item?.start_date || item?.startDate || "",
      endDate,
      currentlyWorking: Boolean(item?.currently_working ?? item?.currentlyWorking ?? !endDate),
      description: item?.description || "",
    };
  };

  const toExperienceApi = (item: any) => ({
    job_title: item?.title || "",
    company_name: item?.company || "",
    start_date: item?.startDate || null,
    end_date: item?.currentlyWorking ? null : item?.endDate || null,
    currently_working: Boolean(item?.currentlyWorking),
    description: item?.description || "",
  });

  const toCertificationUI = (item: any): Certification => ({
    id: item?.id || crypto.randomUUID(),
    name: item?.certificationName || item?.name || "",
    issuer: item?.issuingBody || item?.issuer || "",
    date: item?.date || "",
  });

  const toCertificationApi = (item: any) => ({
    certificationName: item?.name || "",
    issuingBody: item?.issuer || "",
    date: item?.date || "",
  });

  const toLanguageUI = (item: any): Language => ({
    id: item?.id || crypto.randomUUID(),
    name: item?.language || item?.name || "",
    proficiency: item?.proficiency || "",
    read: Boolean(item?.read ?? item?.canRead),
    write: Boolean(item?.write ?? item?.canWrite),
    speak: Boolean(item?.speak ?? item?.canSpeak),
  });

  const toLanguageApi = (item: any) => ({
    language: item?.name || "",
    proficiency: item?.proficiency || "",
    read: Boolean(item?.read),
    write: Boolean(item?.write),
    speak: Boolean(item?.speak),
  });

  const toProjectUI = (item: any): Project => ({
    id: item?.id || crypto.randomUUID(),
    name: item?.projectName || item?.name || "",
    description: item?.description || "",
    link: item?.projectLink || item?.link || "",
  });

  const toProjectApi = (item: any) => ({
    projectName: item?.name || "",
    description: item?.description || "",
    projectLink: item?.link || "",
  });

  const RESUME_ACCOMPLISHMENT_ID = "__profile_resume__";
  const getResumeStorageKey = (id: string) => `profile_resume_${id}`;
  const normalizeResumeFileName = (value: string) => {
    if (!value) return "";
    const clean = value.split("?")[0].split("#")[0];
    const segments = clean.split(/[\\/]/).filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : clean;
  };
  const readStoredResume = (id: string) => {
    try {
      const raw = localStorage.getItem(getResumeStorageKey(id));
      if (!raw) return { filename: "", uploadedDate: "", fileName: "" };
      const parsed = JSON.parse(raw);
      return {
        filename: normalizeResumeFileName(parsed?.filename || ""),
        uploadedDate: parsed?.uploadedDate || "",
        fileName: normalizeResumeFileName(parsed?.fileName || parsed?.filename || ""),
      };
    } catch {
      return { filename: "", uploadedDate: "", fileName: "" };
    }
  };
  const saveStoredResume = (
    id: string,
    resume: { filename: string; uploadedDate: string; fileName?: string },
  ) => {
    localStorage.setItem(getResumeStorageKey(id), JSON.stringify(resume));
  };
  const getPersistedResumeItem = (items: AccomplishmentItem[] = []) =>
    items.find((item) => item?.id === RESUME_ACCOMPLISHMENT_ID);
  const withoutPersistedResumeItem = (items: AccomplishmentItem[] = []) =>
    safeArray(items).filter((item: AccomplishmentItem) => item?.id !== RESUME_ACCOMPLISHMENT_ID);
  const getResumeFromAccomplishments = (data: any) => {
    const resumeItem = getPersistedResumeItem(parseJsonArray(data?.workSamples));
    return {
      filename: resumeItem?.name || "",
      uploadedDate: resumeItem?.uploadedDate || "",
      fileName: normalizeResumeFileName(resumeItem?.fileName || resumeItem?.link || ""),
    };
  };
  const buildAccomplishmentsPayload = (
    accomplishments: Accomplishments,
    resume = user.resume,
  ) => {
    const workSamples = withoutPersistedResumeItem(accomplishments.workSamples);
    const resumeFileName = normalizeResumeFileName(resume.fileName || resume.filename);
    return {
      onlineProfiles: accomplishments.onlineProfiles,
      workSamples: resumeFileName
        ? [
            ...workSamples,
            {
              id: RESUME_ACCOMPLISHMENT_ID,
              name: resume.filename,
              link: resumeFileName,
              fileName: resumeFileName,
              uploadedDate: resume.uploadedDate,
            },
          ]
        : workSamples,
      research: accomplishments.publications,
      presentations: accomplishments.presentations,
      patents: accomplishments.patents,
      certifications: accomplishments.certifications,
    };
  };
  const getMimeType = (fileName: string) => {
    const extension = fileName.toLowerCase().split(".").pop() || "";
    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      rtf: "application/rtf",
      txt: "text/plain",
    };
    return mimeTypes[extension] || "application/octet-stream";
  };
  const normalizeSkills = (skills: string[]) => {
    const unique = Array.from(
      new Set(skills.map((skill) => String(skill).trim()).filter(Boolean)),
    );
    return unique.slice(0, 15);
  };
  const buildSkillsPayload = (skills: string[]) => {
    const normalized = normalizeSkills(skills);
    const jsonPayload = JSON.stringify(normalized);
    if (jsonPayload.length <= 255) {
      return { normalized, payload: normalized };
    }
    const trimmed: string[] = [];
    for (const skill of normalized) {
      const next = [...trimmed, skill];
      if (JSON.stringify(next).length > 255) break;
      trimmed.push(skill);
    }
    return { normalized: trimmed, payload: trimmed };
  };
  const addSkillToEditor = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (!trimmedSkill) return;
    const currentSkills = normalizeSkills(safeArray(editData.skills));
    if (currentSkills.includes(trimmedSkill)) {
      setSkillsError("This skill already exists.");
      return;
    }
    if (currentSkills.length >= 15) {
      setSkillsError("Maximum 15 skills allowed.");
      return;
    }
    const nextSkills = [...currentSkills, trimmedSkill];
    if (JSON.stringify(nextSkills).length > 255) {
      setSkillsError("Skills limit reached for storage. Remove one and try again.");
      return;
    }
    setEditData((prev: any) => ({ ...prev, skills: nextSkills }));
    setCustomSkillInput("");
    setSelectedSkillOption("");
    setSkillsError("");
  };
  const removeSkillFromEditor = (index: number) => {
    setEditData((prev: any) => ({
      ...prev,
      skills: safeArray(prev.skills).filter((_: any, i: number) => i !== index),
    }));
    setSkillsError("");
  };

  // ----------------------------------------------------------------------
  // Fetch all profile data
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (!user_id) return;
    fetchAllProfileData();
  }, [user_id]);

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
      }
    };
  }, []);

  const fetchAllProfileData = async () => {
    if (!user_id) return;
    try {
      setLoading(true);

      const userDetails = await apiRequest(
        API_ENDPOINTS.USER_DETAILS(user_id),
      ).catch(() => ({}));
      const summaryData = await apiRequest(
        API_ENDPOINTS.PROFESSIONAL_SUMMARY_GET(user_id),
      ).catch(() => ({}));
      const careerData = await apiRequest(
        API_ENDPOINTS.CAREER_DNA_GET(user_id),
      ).catch(() => ({}));
      const educationData = await apiRequest(
        API_ENDPOINTS.EDUCATION_GET(user_id),
      ).catch(() => []);
      const skillsData = await apiRequest(
        API_ENDPOINTS.SKILLS_GET(user_id),
      ).catch(() => null);
      const experienceData = await apiRequest(
        API_ENDPOINTS.EXPERIENCE_GET(user_id),
      ).catch(() => []);
      const certificationsData = await apiRequest(
        API_ENDPOINTS.CERTIFICATIONS_GET(user_id),
      ).catch(() => []);
      const preferencesData = await apiRequest(
        API_ENDPOINTS.PREFERENCES_GET(user_id),
      ).catch(() => ({}));
      const itSkillsData = await apiRequest(
        API_ENDPOINTS.IT_SKILLS_GET(user_id),
      ).catch(() => []);
      const languagesData = await apiRequest(
        API_ENDPOINTS.LANGUAGES_GET(user_id),
      ).catch(() => []);
      const projectsData = await apiRequest(
        API_ENDPOINTS.PROJECTS_GET(user_id),
      ).catch(() => []);
      const accomplishmentsData = await apiRequest(
        API_ENDPOINTS.ACCOMPLISHMENTS_GET(user_id),
      ).catch(() => ({}));
      const userJobsData = await apiRequest<any[]>(
        API_ENDPOINTS.USER_JOBS_FETCH(user_id),
      ).catch(() => []);
      console.log("[ProfilePage API] aggregated profile payloads", {
        userDetails,
        summaryData,
        careerData,
        educationData,
        skillsData,
        experienceData,
        certificationsData,
        preferencesData,
        itSkillsData,
        languagesData,
        projectsData,
        accomplishmentsData,
        userJobsData,
      });
      const storedResume = readStoredResume(user_id);
      const persistedResume = getResumeFromAccomplishments(accomplishmentsData);
      const fallbackResumePath = Array.isArray(userJobsData)
        ? userJobsData.find((job: any) => job?.resume_path)?.resume_path || ""
        : "";
      const fallbackResumeName = normalizeResumeFileName(fallbackResumePath);
      const resumeFileName =
        persistedResume.fileName ||
        storedResume.fileName ||
        fallbackResumeName ||
        "";
      const fetchedSkills = parseSkills(
        (skillsData as any)?.skills ?? skillsData ?? userDetails?.skills,
      );
      setUser({
        name: userDetails?.name || "",
        role: userDetails?.job_title || "",
        jobType: userDetails?.job_type || "",
        avatar: "",
        location: userDetails?.job_location || "",
        experience: userDetails?.experience || "",
        salary: userDetails?.salary || "",
        email: userDetails?.email || "",
        phone: userDetails?.contact_number || "",
        isWhatsApp: !!userDetails?.is_whatsapp,
        subscriptionPlan: userDetails?.subscription_plan || null,
        resume: {
          filename:
            persistedResume.filename ||
            storedResume.filename ||
            fallbackResumeName ||
            "",
          uploadedDate: persistedResume.uploadedDate || storedResume.uploadedDate || "",
          fileName: resumeFileName,
        },
        summary: summaryData?.summary || "",
        skills: fetchedSkills,
        experienceList: Array.isArray(experienceData)
          ? experienceData.map(toExperienceUI)
          : [],
        education: Array.isArray(educationData)
          ? educationData.map((e: any) => ({
              ...e,
              id: e.id || Date.now().toString(),
            }))
          : [],
        careerDNA: {
          coreStrengths: careerData?.coreStrengths || [],
          enjoyableTasks: careerData?.coreStrengthStatement || "",
          careerValues: careerData?.careerValues || [],
          careerInterests: careerData?.careerInterests || [],
          industry: careerData?.industry || "",
          personalityType: careerData?.personalityType || "",
          marketDemand: careerData?.marketDemand || "",
          emergingTrends: careerData?.emergingTrends || "",
          marketGap: careerData?.marketGap || "",
          nicheStatement: careerData?.nicheStatement || "",
          additionalPreferences: careerData?.additionalPreferences || "",
        },
        certifications: Array.isArray(certificationsData)
          ? certificationsData.map(toCertificationUI)
          : [],
        preferences: {
          industry: preferencesData?.industry || "",
          department: preferencesData?.department || "",
          roleCategory: preferencesData?.roleCategory || "",
          jobRole: preferencesData?.jobRole || "",
          jobType: preferencesData?.jobType || "",
          employmentType: preferencesData?.employmentType || "",
          shift: preferencesData?.shift || "",
          location: preferencesData?.location || "",
          expectedSalary: preferencesData?.expectedSalary || "",
        },
        itSkills: Array.isArray(itSkillsData)
          ? itSkillsData.map((s: any) => ({
              ...s,
              id: s.id || Date.now().toString(),
            }))
          : [],
        languages: Array.isArray(languagesData)
          ? languagesData.map(toLanguageUI)
          : [],
        projects: Array.isArray(projectsData)
          ? projectsData.map(toProjectUI)
          : [],
        accomplishments: {
          onlineProfiles: parseJsonArray(accomplishmentsData?.onlineProfiles),
          workSamples: withoutPersistedResumeItem(parseJsonArray(accomplishmentsData?.workSamples)),
          publications: parseJsonArray(accomplishmentsData?.research),
          presentations: parseJsonArray(accomplishmentsData?.presentations),
          patents: parseJsonArray(accomplishmentsData?.patents),
          certifications: parseJsonArray(accomplishmentsData?.certifications),
        },
      });
      await loadProfileAvatar(user_id).catch(() => false);
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // Edit handlers
  // ----------------------------------------------------------------------
  const handleEdit = (section: string, data?: any) => {
    setEditingSection(section);
    if (section === "hero") {
      setEditData({
        name: user.name,
        role: user.role,
        jobType: user.jobType,
        location: user.location,
        experience: user.experience,
        salary: user.salary,
        email: user.email,
        phone: user.phone,
        isWhatsApp: user.isWhatsApp,
      });
    } else if (section === "summary") {
      setEditData({ summary: user.summary });
    } else if (section === "skills") {
      setEditData({ skills: [...user.skills] });
      setCustomSkillInput("");
      setSelectedSkillOption("");
      setSkillsError("");
    } else if (section === "careerDNA") {
      setEditData({ ...user.careerDNA });
    } else if (section === "preferences") {
      setEditData({ ...user.preferences });
    } else {
      setEditData(data || {});
    }
  };

  // ----------------------------------------------------------------------
  // Delete handlers
  // ----------------------------------------------------------------------
  const handleDelete = async (section: string, id: string) => {
    if (!user_id) return;
    try {
      if (section === "experience") {
        await apiRequest(API_ENDPOINTS.EXPERIENCE_DELETE(id), {
          method: "DELETE",
        });
        setUser((prev) => ({
          ...prev,
          experienceList: prev.experienceList.filter((e) => e.id !== id),
        }));
      } else if (section === "education") {
        await apiRequest(API_ENDPOINTS.EDUCATION_DELETE(id), {
          method: "DELETE",
        });
        setUser((prev) => ({
          ...prev,
          education: prev.education.filter((e) => e.id !== id),
        }));
      } else if (section === "certification") {
        await apiRequest(API_ENDPOINTS.CERTIFICATION_DELETE(id), {
          method: "DELETE",
        });
        setUser((prev) => ({
          ...prev,
          certifications: prev.certifications.filter((c) => c.id !== id),
        }));
      } else if (section === "itSkill") {
        await apiRequest(API_ENDPOINTS.IT_SKILL_DELETE(id), {
          method: "DELETE",
        });
        setUser((prev) => ({
          ...prev,
          itSkills: prev.itSkills.filter((s) => s.id !== id),
        }));
      } else if (section === "language") {
        await apiRequest(API_ENDPOINTS.LANGUAGE_DELETE(id), {
          method: "DELETE",
        });
        setUser((prev) => ({
          ...prev,
          languages: prev.languages.filter((l) => l.id !== id),
        }));
      } else if (section === "project") {
        await apiRequest(API_ENDPOINTS.PROJECT_DELETE(id), {
          method: "DELETE",
        });
        setUser((prev) => ({
          ...prev,
          projects: prev.projects.filter((p) => p.id !== id),
        }));
      } else if (section.startsWith("accomplishment_")) {
        const type = section.split("_")[1] as keyof Accomplishments;
        const nextAccomplishments = {
          ...user.accomplishments,
          [type]: user.accomplishments[type].filter((a) => a.id !== id),
        };
        setUser((prev) => ({
          ...prev,
          accomplishments: nextAccomplishments,
        }));
        await apiRequest(API_ENDPOINTS.ACCOMPLISHMENT_CREATE(user_id), {
          method: "POST",
          body: JSON.stringify(buildAccomplishmentsPayload(nextAccomplishments)),
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete. Please try again.");
    }
  };

  

  // ----------------------------------------------------------------------
  // Save handler
  // ----------------------------------------------------------------------
  const handleSave = async () => {
    if (!editingSection || !user_id) return;
    setSaving(true);

    try {
      if (editingSection === "hero") {
        await apiRequest(API_ENDPOINTS.USER_UPDATE(), {
          method: "POST",
          body: JSON.stringify({
            user_id,
            name: editData.name,
            email: editData.email,
            contact_number: editData.phone,
            is_whatsapp: editData.isWhatsApp ?? false,
            job_title: editData.role,
            job_location: editData.location,
            job_type: editData.jobType,
            salary: editData.salary,
            experience: editData.experience,
          }),
        });
        setUser((prev) => ({ ...prev, ...editData }));
      } else if (editingSection === "summary") {
  await apiRequest(
    API_ENDPOINTS.PROFESSIONAL_SUMMARY_CREATE(user_id), // ✅ change here
    {
      method: "POST", // ✅ keep POST
      body: JSON.stringify({
        summary: editData.summary,
      }),
    }
  );

  setUser((prev) => ({
    ...prev,
    summary: editData.summary || "",
  }));
} else if (editingSection === "skills") {
        const { normalized, payload } = buildSkillsPayload(safeArray(editData.skills));
        await apiRequest(API_ENDPOINTS.SKILLS_UPDATE(), {
          method: "POST",
          body: JSON.stringify({
            user_id,
            skills: payload,
          }),
        });
        setUser((prev) => ({ ...prev, skills: normalized }));
      } else if (editingSection === "careerDNA") {
        const isNew = Object.values(user.careerDNA).every(
          (value) => !value || (Array.isArray(value) && value.length === 0),
        );
        await apiRequest(
          isNew
            ? API_ENDPOINTS.CAREER_DNA_CREATE(user_id)
            : API_ENDPOINTS.CAREER_DNA_UPDATE(user_id),
          {
            method: "POST",
            body: JSON.stringify({
              coreStrengths: safeArray(editData.coreStrengths),
              coreStrengthStatement: editData.enjoyableTasks || "",
              careerValues: safeArray(editData.careerValues),
              careerInterests: safeArray(editData.careerInterests),
              industry: editData.industry || "",
              personalityType: editData.personalityType || "",
              marketDemand: editData.marketDemand || "",
              emergingTrends: editData.emergingTrends || "",
              marketGap: editData.marketGap || "",
              nicheStatement: editData.nicheStatement || "",
              additionalPreferences: editData.additionalPreferences || "",
            }),
          },
        );
        setUser((prev) => ({ ...prev, careerDNA: { ...editData } }));
      } else if (editingSection === "experience") {
        const isNew = !editData.id;
        const payload = toExperienceApi(editData);
        const saved = await apiRequest<any>(
          isNew
            ? API_ENDPOINTS.EXPERIENCE_CREATE(user_id)
            : API_ENDPOINTS.EXPERIENCE_UPDATE(editData.id),
          { method: isNew ? "POST" : "PUT", body: JSON.stringify(payload) },
        );
        const normalized = toExperienceUI(saved || { ...payload, id: editData.id });
        setUser((prev) => ({
          ...prev,
          experienceList: isNew
            ? [...prev.experienceList, normalized]
            : prev.experienceList.map((item) =>
                item.id === editData.id ? normalized : item,
              ),
        }));
      } else if (editingSection === "education") {
        const isNew = !editData.id;
        const saved = await apiRequest<any>(
          isNew
            ? API_ENDPOINTS.EDUCATION_CREATE(user_id)
            : API_ENDPOINTS.EDUCATION_UPDATE(editData.id),
          { method: isNew ? "POST" : "PUT", body: JSON.stringify(editData) },
        );
        const normalized = { ...editData, id: saved?.id || editData.id || crypto.randomUUID() };
        setUser((prev) => ({
          ...prev,
          education: isNew
            ? [...prev.education, normalized]
            : prev.education.map((item) => (item.id === editData.id ? normalized : item)),
        }));
      } else if (editingSection === "certifications") {
        const isNew = !editData.id;
        const saved = await apiRequest<any>(
          isNew
            ? API_ENDPOINTS.CERTIFICATION_CREATE(user_id)
            : API_ENDPOINTS.CERTIFICATION_UPDATE(editData.id),
          {
            method: isNew ? "POST" : "PUT",
            body: JSON.stringify(toCertificationApi(editData)),
          },
        );
        const normalized = isNew ? toCertificationUI(saved || editData) : { ...editData };
        setUser((prev) => ({
          ...prev,
          certifications: isNew
            ? [...prev.certifications, normalized]
            : prev.certifications.map((item) =>
                item.id === editData.id ? normalized : item,
              ),
        }));
      } else if (editingSection === "preferences") {
        await apiRequest(API_ENDPOINTS.PREFERENCES_UPDATE(user_id), {
          method: "POST",
          body: JSON.stringify(editData),
        });
        setUser((prev) => ({ ...prev, preferences: { ...editData } }));
      } else if (editingSection === "itSkills") {
        const isNew = !editData.id;
        const saved = await apiRequest<any>(
          isNew
            ? API_ENDPOINTS.IT_SKILL_CREATE(user_id)
            : API_ENDPOINTS.IT_SKILL_UPDATE(editData.id),
          { method: isNew ? "POST" : "PUT", body: JSON.stringify(editData) },
        );
        const normalized = { ...editData, id: saved?.id || editData.id || crypto.randomUUID() };
        setUser((prev) => ({
          ...prev,
          itSkills: isNew
            ? [...prev.itSkills, normalized]
            : prev.itSkills.map((item) => (item.id === editData.id ? normalized : item)),
        }));
      } else if (editingSection === "languages") {
        const isNew = !editData.id;
        const saved = await apiRequest<any>(
          isNew
            ? API_ENDPOINTS.LANGUAGE_CREATE(user_id)
            : API_ENDPOINTS.LANGUAGE_UPDATE(editData.id),
          {
            method: isNew ? "POST" : "PUT",
            body: JSON.stringify(toLanguageApi(editData)),
          },
        );
        const normalized = isNew ? toLanguageUI(saved || editData) : { ...editData };
        setUser((prev) => ({
          ...prev,
          languages: isNew
            ? [...prev.languages, normalized]
            : prev.languages.map((item) =>
                item.id === editData.id ? normalized : item,
              ),
        }));
      } else if (editingSection === "projects") {
        const isNew = !editData.id;
        const saved = await apiRequest<any>(
          isNew
            ? API_ENDPOINTS.PROJECT_CREATE(user_id)
            : API_ENDPOINTS.PROJECT_UPDATE(editData.id),
          { method: isNew ? "POST" : "PUT", body: JSON.stringify(toProjectApi(editData)) },
        );
        const normalized = isNew ? toProjectUI(saved || editData) : { ...editData };
        setUser((prev) => ({
          ...prev,
          projects: isNew
            ? [...prev.projects, normalized]
            : prev.projects.map((item) =>
                item.id === editData.id ? normalized : item,
              ),
        }));
      } else if (editingSection.startsWith("accomplishment_")) {
        const type = editingSection.split("_")[1] as keyof Accomplishments;
        const isNew = !editData.id;
        const existingList = user.accomplishments[type];
        const nextList = isNew
          ? [...existingList, { ...editData, id: crypto.randomUUID() }]
          : existingList.map((item) => (item.id === editData.id ? { ...editData } : item));
        const nextAccomplishments = { ...user.accomplishments, [type]: nextList };
        await apiRequest(API_ENDPOINTS.ACCOMPLISHMENT_CREATE(user_id), {
          method: "POST",
          body: JSON.stringify(buildAccomplishmentsPayload(nextAccomplishments)),
        });
        setUser((prev) => ({ ...prev, accomplishments: nextAccomplishments }));
      }

      setEditingSection(null);
      setEditData({});
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------------------------
  // Resume Upload
  // ----------------------------------------------------------------------
  const handleResumeUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !user_id) return;
    setSaving(true);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", user_id);

      const response = await fetch(API_ENDPOINTS.FILES_UPLOAD, {
        method: "POST",
        headers: {
          "X-SESSION-TOKEN": getSessionToken(),
        },
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Resume upload failed");
      }
      const result = await response.json().catch(() => ({}));
      console.log("[ProfilePage API] resume upload response", result);
      const uploadedFileName = normalizeResumeFileName(result?.file_url || result?.url || file.name);
      const resumeData = {
        filename: file.name,
        uploadedDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        fileName: uploadedFileName || file.name,
      };
      await apiRequest(API_ENDPOINTS.ACCOMPLISHMENT_CREATE(user_id), {
        method: "POST",
        body: JSON.stringify(buildAccomplishmentsPayload(user.accomplishments, resumeData)),
      });

      // Parse the resume to extract profile details
      try {
        const parseFormData = new FormData();
        parseFormData.append("file", file);
        const parseResponse = await fetch(API_ENDPOINTS.PARSE_RESUME, {
          method: "POST",
          headers: {
            "X-SESSION-TOKEN": getSessionToken(),
          },
          body: parseFormData,
        });

        if (parseResponse.ok) {
          const parsedData = await parseResponse.json();
          console.log("[ProfilePage API] parsed resume payload", parsedData);
          setParsedResumeDetails(parsedData);

          // Save extracted details to the database
          await apiRequest(API_ENDPOINTS.USER_UPDATE(), {
            method: "POST",
            body: JSON.stringify({
              name: parsedData.name || undefined,
              contact_number: parsedData.contact_number || undefined,
              job_title: parsedData.job_title || undefined,
              job_location: parsedData.job_location || undefined,
              job_type: parsedData.job_type || undefined,
              salary: parsedData.salary || undefined,
              experience: parsedData.experience || undefined,
              skills: parsedData.skills || undefined,
            }),
          });

          // Save professional summary if parsed
          if (parsedData.summary) {
            await apiRequest(API_ENDPOINTS.PROFESSIONAL_SUMMARY_CREATE(user_id), {
              method: "POST",
              body: JSON.stringify({
                summary: parsedData.summary,
              }),
            }).catch((e) => console.error("Failed saving parsed summary", e));
          }

          // Delete existing educations to avoid duplication and save fresh parsed ones
          if (parsedData.education && Array.isArray(parsedData.education) && parsedData.education.length > 0) {
            try {
              for (const edu of user.education || []) {
                if (edu.id) {
                  await apiRequest(API_ENDPOINTS.EDUCATION_DELETE(edu.id), { method: "DELETE" }).catch(() => {});
                }
              }
              for (const edu of parsedData.education) {
                await apiRequest(API_ENDPOINTS.EDUCATION_CREATE(user_id), {
                  method: "POST",
                  body: JSON.stringify({
                    degree: edu.degree || "",
                    institution: edu.institution || edu.school || "",
                    duration: edu.duration || edu.year || "",
                  }),
                }).catch((e) => console.error("Education POST failed", e));
              }
            } catch (eduErr) {
              console.error("Failed updating parsed education history:", eduErr);
            }
          }

          // Delete existing work experiences to avoid duplication and save fresh parsed ones
          if (parsedData.work_experience && Array.isArray(parsedData.work_experience) && parsedData.work_experience.length > 0) {
            try {
              for (const exp of user.experienceList || []) {
                if (exp.id) {
                  await apiRequest(API_ENDPOINTS.EXPERIENCE_DELETE(exp.id), { method: "DELETE" }).catch(() => {});
                }
              }
              for (const exp of parsedData.work_experience) {
                const start_date = new Date().toISOString().slice(0, 10);
                await apiRequest(API_ENDPOINTS.EXPERIENCE_CREATE(user_id), {
                  method: "POST",
                  body: JSON.stringify({
                    company_name: exp.company_name || exp.company || "",
                    job_title: exp.job_title || exp.role || "",
                    start_date: start_date,
                    description: exp.description || "",
                  }),
                }).catch((e) => console.error("WorkExperience POST failed", e));
              }
            } catch (expErr) {
              console.error("Failed updating parsed work experience history:", expErr);
            }
          }

          // Update LinkedIn URL in online profiles
          if (parsedData.linkedin) {
            try {
              const currentOnline = user.accomplishments?.onlineProfiles || [];
              const filtered = currentOnline.filter((p: any) => p.name?.toLowerCase() !== "linkedin");
              const updatedOnline = [
                ...filtered,
                {
                  id: "linkedin_profile",
                  name: "LinkedIn",
                  link: parsedData.linkedin,
                }
              ];
              const updatedAcc = {
                ...user.accomplishments,
                onlineProfiles: updatedOnline
              };
              
              await apiRequest(API_ENDPOINTS.ACCOMPLISHMENT_CREATE(user_id), {
                method: "POST",
                body: JSON.stringify(buildAccomplishmentsPayload(updatedAcc)),
              });
            } catch (linkErr) {
              console.error("Failed saving parsed LinkedIn URL:", linkErr);
            }
          }

          // Delete existing certifications to avoid duplication and save fresh parsed ones
          if (parsedData.certifications && Array.isArray(parsedData.certifications) && parsedData.certifications.length > 0) {
            try {
              for (const cert of user.certifications || []) {
                if (cert.id) {
                  await apiRequest(API_ENDPOINTS.CERTIFICATION_DELETE(cert.id), { method: "DELETE" }).catch(() => {});
                }
              }
              for (const cert of parsedData.certifications) {
                await apiRequest(API_ENDPOINTS.CERTIFICATION_CREATE(user_id), {
                  method: "POST",
                  body: JSON.stringify({
                    certificationName: cert.name || "",
                    issuingBody: cert.issuer || "",
                    date: cert.date || "",
                  }),
                }).catch((e) => console.error("Failed saving certification", e));
              }
            } catch (certErr) {
              console.error("Failed updating parsed certifications:", certErr);
            }
          }
        }
      } catch (parseErr) {
        console.error("[ProfilePage] Resume parsing and metadata update failed:", parseErr);
      }

      // Reload fresh data from database
      await fetchAllProfileData();

      saveStoredResume(user_id, resumeData);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsParsedResumeDialogOpen(true);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload resume.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!user.resume.filename || !user_id) return;
    try {
      const fileName = normalizeResumeFileName(user.resume.fileName || user.resume.filename);
      const fileUrl =
        fileName.startsWith("http://") || fileName.startsWith("https://") || fileName.startsWith("/")
          ? normalizeHostedUrl(fileName)
          : API_ENDPOINTS.FILES_FETCH(user_id, fileName);
      const response = await fetch(fileUrl, {
        headers: {
          "X-SESSION-TOKEN": getSessionToken(),
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: getMimeType(user.resume.filename) });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error("Download resume error:", error);
      alert("Unable to open resume. Please try again.");
    }
  };

  const handleDeleteResume = async () => {
    if (!user.resume.filename || !user_id) return;
    try {
      localStorage.removeItem(getResumeStorageKey(user_id));
      await apiRequest(API_ENDPOINTS.ACCOMPLISHMENT_CREATE(user_id), {
        method: "POST",
        body: JSON.stringify(
          buildAccomplishmentsPayload(user.accomplishments, {
            filename: "",
            uploadedDate: "",
            fileName: "",
          }),
        ),
      });
      setUser((prev) => ({
        ...prev,
        resume: { filename: "", uploadedDate: "", fileName: "" },
      }));
      alert("Resume deleted successfully!");
    } catch (error) {
      console.error("Delete resume error:", error);
      alert("Failed to delete resume.");
    }
  };

  // Avatar upload handler — opens crop modal first
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const objectUrl = URL.createObjectURL(file);
    setPendingAvatarSrc(objectUrl);
    setCropModalOpen(true);
    // reset input so re-selecting the same file still fires onChange
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropModalOpen(false);
    if (pendingAvatarSrc) {
      URL.revokeObjectURL(pendingAvatarSrc);
      setPendingAvatarSrc("");
    }
    if (!user_id) return;
    setSaving(true);
    try {
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", user_id);
      const response = await fetch(API_ENDPOINTS.FILES_UPLOAD_USERPROFILE, {
        method: "POST",
        headers: { "X-SESSION-TOKEN": getSessionToken() },
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Profile picture upload failed");
      }
      const result = await response.json().catch(() => ({}));
      console.log("[ProfilePage API] avatar upload response", result);
      clearAvatarRemoved(user_id);
      await loadProfileAvatar(user_id);
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Avatar upload error:", error);
      alert("Failed to upload avatar.");
    } finally {
      setSaving(false);
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    if (pendingAvatarSrc) {
      URL.revokeObjectURL(pendingAvatarSrc);
      setPendingAvatarSrc("");
    }
  };

  const handleAvatarDelete = () => {
    if (!user_id) return;
    if (!window.confirm("Remove your profile picture?")) return;
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = null;
    }
    markAvatarRemoved(user_id);
    setUser((prev) => ({ ...prev, avatar: "" }));
  };

  if (loading) {
    return (
      <div className="max-w-[780px] mx-auto py-8 px-4 text-white text-center">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-dvh h-full overflow-y-auto pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-white/10 px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center">
            <div className="w-8 h-8 bg-[var(--color-jobright-teal)] dark:bg-neon-green rounded-lg flex items-center justify-center mr-3 transition-colors duration-300">
              <span className="text-white font-bold text-sm">DRC</span>
            </div>
            <span className="truncate text-gray-900 dark:text-white font-medium transition-colors duration-300">
              Dheeraj Rathod Consult
            </span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={onLogout}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-[980px] mx-auto py-8 px-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".doc,.docx,.rtf,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        {/* HERO SECTION */}
        <ProfileHero
          user={user}
          onEdit={() => handleEdit("hero")}
          onAvatarClick={() => avatarInputRef.current?.click()}
          onAvatarChange={handleAvatarChange}
          onAvatarDelete={handleAvatarDelete}
          avatarInputRef={avatarInputRef}
        />

        {/* AVATAR CROP MODAL */}
        {cropModalOpen && pendingAvatarSrc && (
          <AvatarCropModal
            imageSrc={pendingAvatarSrc}
            onConfirm={handleCropConfirm}
            onCancel={handleCropCancel}
          />
        )}

        {/* RESUME SECTION */}
        <SectionCard title="Resume">
          <div className="border border-zinc-800/50 bg-zinc-900/20 rounded-xl p-6 flex flex-col items-center text-center">
            {user.resume.filename ? (
              <div className="flex items-center gap-3 mb-5 w-full max-w-lg justify-between rounded-xl border border-zinc-800/70 bg-zinc-900/60 px-4 py-3">
                <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center text-[#00C896]/70 shrink-0">
                  <FileText size={18} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {user.resume.filename}
                  </p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    Uploaded on {user.resume.uploadedDate}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={handleDownloadResume}
                    className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-[#00C896] hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={handleDeleteResume}
                    className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-zinc-500 text-sm">No resume uploaded yet.</p>
              </div>
            )}
            <button
              onClick={handleResumeUpload}
              className="px-5 py-2 border border-[#00C896] text-[#00C896] hover:bg-[#00C896]/10 rounded-full text-sm font-semibold tracking-wide transition-all mb-2.5 disabled:opacity-50"
              disabled={saving}
            >
              {user.resume.filename ? "Update Resume" : "Upload Resume"}
            </button>
            <p className="text-zinc-600 text-xs">
              Supported: doc, docx, rtf, pdf &mdash; up to 2 MB
            </p>
          </div>
        </SectionCard>

        {/* PROFESSIONAL SUMMARY */}
        <SectionCard
          title="Professional Summary"
          onEdit={() => handleEdit("summary")}
        >
          {user.summary ? (
            <ReadMoreText text={user.summary} />
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-zinc-500 text-sm italic">
                Add a professional summary to highlight your expertise.
              </p>
              <button
                onClick={() => handleEdit("summary")}
                className="text-[#00C896] text-sm font-medium hover:underline"
              >
                Add
              </button>
            </div>
          )}
        </SectionCard>

        {/* KEY SKILLS */}
        <SectionCard title="Key Skills" onEdit={() => handleEdit("skills")}>
          {user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-zinc-800/60 text-zinc-200 text-xs font-medium rounded-full border border-zinc-700/50 hover:border-[#00C896]/30 hover:text-white transition-colors cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-zinc-500 text-sm italic">
                Add your key skills to help employers find you.
              </p>
              <button
                onClick={() => handleEdit("skills")}
                className="text-[#00C896] text-sm font-medium hover:underline"
              >
                Add
              </button>
            </div>
          )}
        </SectionCard>

        {/* CAREER DNA */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#00C896]/15 mb-5 relative group shadow-[0_4px_24px_rgba(0,200,150,0.06)] overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-[#00C896]/10 bg-[#00C896]/[0.02]">
            <h2 className="text-white font-semibold text-[15px] tracking-tight flex items-center gap-2">
              Career DNA
              <span className="px-2 py-0.5 bg-[#00C896]/10 text-[#00C896] text-[9px] uppercase font-bold rounded tracking-widest">
                Strategic
              </span>
            </h2>
            <button
              onClick={() => handleEdit("careerDNA", user.careerDNA)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-[#00C896] hover:bg-zinc-800/60 transition-colors"
            >
              <Pencil size={14} />
            </button>
          </div>
          <div className="p-6">
          {/* ... Career DNA display content (same as original) ... */}
          <div className="space-y-8">
            <div>
              <h3 className="text-zinc-500 text-xs font-bold uppercase mb-3 tracking-wider">
                Core Strengths
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {user.careerDNA.coreStrengths.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 bg-[#00C896]/5 text-[#00C896] text-xs rounded-full border border-[#00C896]/10"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-zinc-400 text-sm italic">
                "{user.careerDNA.enjoyableTasks}"
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-zinc-500 text-xs font-bold uppercase mb-3 tracking-wider">
                  Career Values
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.careerDNA.careerValues.map((v) => (
                    <span
                      key={v}
                      className="px-3 py-1 bg-zinc-800/50 text-zinc-300 text-xs rounded-full border border-zinc-700/30"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-zinc-500 text-xs font-bold uppercase mb-3 tracking-wider">
                  Career Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.careerDNA.careerInterests.map((i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-zinc-800/50 text-zinc-300 text-xs rounded-full border border-zinc-700/30"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-zinc-500 text-xs font-bold uppercase mb-2 tracking-wider">
                  Industry / Sector
                </h3>
                <p className="text-white text-sm font-medium">
                  {user.careerDNA.industry}
                </p>
              </div>
              <div>
                <h3 className="text-zinc-500 text-xs font-bold uppercase mb-2 tracking-wider">
                  Personality Type
                </h3>
                <p className="text-white text-sm font-medium">
                  {user.careerDNA.personalityType}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-zinc-500 text-xs font-bold uppercase mb-2 tracking-wider">
                  Market Demand
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  {user.careerDNA.marketDemand}
                </p>
              </div>
              <div>
                <h3 className="text-zinc-500 text-xs font-bold uppercase mb-2 tracking-wider">
                  Emerging Trends
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  {user.careerDNA.emergingTrends}
                </p>
              </div>
              <div>
                <h3 className="text-zinc-500 text-xs font-bold uppercase mb-2 tracking-wider">
                  Market Gap
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  {user.careerDNA.marketGap}
                </p>
              </div>
            </div>
            <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
              <h3 className="text-zinc-500 text-xs font-bold uppercase mb-2 tracking-wider">
                Niche Statement
              </h3>
              <p className="text-[#00C896] text-sm font-medium italic leading-relaxed">
                "{user.careerDNA.nicheStatement}"
              </p>
            </div>
            <div>
              <h3 className="text-zinc-500 text-xs font-bold uppercase mb-2 tracking-wider">
                Additional Preferences
              </h3>
              <p className="text-zinc-400 text-sm">
                {user.careerDNA.additionalPreferences}
              </p>
            </div>
          </div>
          </div>
        </div>

        {/* WORK EXPERIENCE */}
        <SectionCard
          title="Work Experience"
          onAdd={() =>
            handleEdit("experience", {
              title: "",
              company: "",
              startDate: "",
              endDate: "",
              currentlyWorking: false,
              description: "",
            })
          }
        >
          <div className="space-y-8">
            {user.experienceList.length > 0 ? (
              user.experienceList.map((exp, idx) => (
                <div
                  key={exp.id}
                  className={`${idx !== 0 ? "pt-6 border-t border-zinc-800/40" : ""} relative group/item pl-4 border-l-2 border-zinc-800/60 hover:border-[#00C896]/40 transition-colors`}
                >
                  <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit("experience", exp)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-[#00C896] hover:bg-zinc-800 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete("experience", exp.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-0.5">
                    {exp.title}
                  </h3>
                  <p className="text-zinc-400 text-sm mb-0.5">{exp.company}</p>
                  <p className="text-[#00C896]/50 text-xs mb-3 font-medium">
                    {formatExperiencePeriod(exp)}
                  </p>
                  <ReadMoreText text={exp.description} />
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-sm italic">
                Add your work experience to showcase your career path.
              </p>
            )}
          </div>
        </SectionCard>

        {/* EDUCATION */}
        <SectionCard
          title="Education"
          onAdd={() =>
            handleEdit("education", {
              degree: "",
              institution: "",
              duration: "",
            })
          }
        >
          <div className="space-y-6">
            {user.education.length > 0 ? (
              user.education.map((edu) => (
                <div key={edu.id} className="relative group/item pl-4 border-l-2 border-zinc-800/60 hover:border-[#00C896]/40 transition-colors">
                  <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit("education", edu)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-[#00C896] hover:bg-zinc-800 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete("education", edu.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-0.5">
                    {edu.degree}
                  </h3>
                  <p className="text-zinc-400 text-sm mb-0.5">
                    {edu.institution}
                  </p>
                  <p className="text-zinc-500 text-xs">{edu.duration}</p>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-sm italic">
                Add your educational background.
              </p>
            )}
            <div className="flex flex-col gap-3 pt-4">
              {[
                "Doctorate/PhD",
                "Masters/Post-graduation",
                "Class XII",
                "Class X",
              ].map((degree) => (
                <button
                  key={degree}
                  onClick={() =>
                    handleEdit("education", {
                      degree,
                      institution: "",
                      duration: "",
                    })
                  }
                  className="text-[#00C896] text-sm font-medium hover:underline text-left"
                >
                  Add {degree}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* CERTIFICATIONS */}
        <SectionCard
          title="Certifications"
          onAdd={() =>
            handleEdit("certifications", { name: "", issuer: "", date: "" })
          }
        >
          <div className="space-y-6">
            {user.certifications.length === 0 ? (
              <p className="text-zinc-500 text-sm italic">
                Add details of certifications you have completed.
              </p>
            ) : (
              user.certifications.map((cert) => (
                <div key={cert.id} className="relative group/item pl-4 border-l-2 border-zinc-800/60 hover:border-[#00C896]/40 transition-colors">
                  <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit("certifications", cert)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-[#00C896] hover:bg-zinc-800 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete("certification", cert.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-0.5">
                    {cert.name}
                  </h3>
                  <p className="text-zinc-400 text-sm mb-0.5">{cert.issuer}</p>
                  <p className="text-zinc-500 text-xs">{cert.date}</p>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        {/* JOB PREFERENCES */}
        <SectionCard
          title="Job Preferences"
          onEdit={() => handleEdit("preferences", user.preferences)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-10">
            {Object.entries(user.preferences).map(([key, value]) => (
              <div key={key}>
                <p className="text-zinc-500 text-[10px] uppercase font-semibold tracking-widest mb-1">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p className="text-zinc-200 text-sm font-medium">{value || <span className="text-zinc-600 font-normal">Not set</span>}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* IT SKILLS */}
        <SectionCard
          title="IT Skills"
          onAdd={() =>
            handleEdit("itSkills", {
              skill: "",
              version: "",
              lastUsed: "",
              experience: "",
            })
          }
        >
          {user.itSkills.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800/70">
                    <th className="pb-3 text-zinc-500 text-[10px] font-semibold uppercase tracking-widest">Skills</th>
                    <th className="pb-3 text-zinc-500 text-[10px] font-semibold uppercase tracking-widest">Version</th>
                    <th className="pb-3 text-zinc-500 text-[10px] font-semibold uppercase tracking-widest">Last used</th>
                    <th className="pb-3 text-zinc-500 text-[10px] font-semibold uppercase tracking-widest">Experience</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {user.itSkills.map((skill) => (
                    <tr key={skill.id} className="group/row hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3.5 text-zinc-200 text-sm font-medium">{skill.skill}</td>
                      <td className="py-3.5 text-zinc-400 text-sm">{skill.version}</td>
                      <td className="py-3.5 text-zinc-400 text-sm">{skill.lastUsed}</td>
                      <td className="py-3.5 text-zinc-400 text-sm">{skill.experience}</td>
                      <td className="py-3.5 text-right">
                        <div className="flex gap-1 justify-end opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit("itSkills", skill)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-[#00C896] hover:bg-zinc-800 transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete("itSkill", skill.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm italic">
              Add your IT skills and software proficiency.
            </p>
          )}
        </SectionCard>

        {/* LANGUAGES */}
        <SectionCard
          title="Languages"
          onAdd={() =>
            handleEdit("languages", {
              name: "",
              proficiency: "",
              read: true,
              write: true,
              speak: true,
            })
          }
        >
          {user.languages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800/70">
                    <th className="pb-3 text-zinc-500 text-[10px] font-semibold uppercase tracking-widest">Languages</th>
                    <th className="pb-3 text-zinc-500 text-[10px] font-semibold uppercase tracking-widest">Proficiency</th>
                    <th className="pb-3 text-zinc-500 text-[10px] font-semibold uppercase tracking-widest text-center">Read</th>
                    <th className="pb-3 text-zinc-500 text-[10px] font-semibold uppercase tracking-widest text-center">Write</th>
                    <th className="pb-3 text-zinc-500 text-[10px] font-semibold uppercase tracking-widest text-center">Speak</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {user.languages.map((lang) => (
                    <tr key={lang.id} className="group/row hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3.5 text-zinc-200 text-sm font-medium">{lang.name}</td>
                      <td className="py-3.5 text-zinc-400 text-sm">{lang.proficiency}</td>
                      <td className="py-3.5 text-center">
                        {lang.read && <Check size={15} className="text-[#00C896] mx-auto" />}
                      </td>
                      <td className="py-3.5 text-center">
                        {lang.write && <Check size={15} className="text-[#00C896] mx-auto" />}
                      </td>
                      <td className="py-3.5 text-center">
                        {lang.speak && <Check size={15} className="text-[#00C896] mx-auto" />}
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex gap-1 justify-end opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit("languages", lang)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-[#00C896] hover:bg-zinc-800 transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete("language", lang.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm italic">
              Add languages you are proficient in.
            </p>
          )}
        </SectionCard>

        {/* PROJECTS */}
        <SectionCard
          title="Projects"
          onAdd={() =>
            handleEdit("projects", { name: "", description: "", link: "" })
          }
        >
          <div className="space-y-6">
            {user.projects.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-zinc-500 text-sm italic">
                  Stand out to employers by adding details about projects that
                  you have done so far.
                </p>
              </div>
            ) : (
              user.projects.map((proj) => (
                <div key={proj.id} className="relative group/item pl-4 border-l-2 border-zinc-800/60 hover:border-[#00C896]/40 transition-colors">
                  <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit("projects", proj)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-[#00C896] hover:bg-zinc-800 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete("project", proj.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold text-sm">{proj.name}</h3>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-500 hover:text-[#00C896] transition-colors"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                  <p className="text-zinc-500 text-sm leading-relaxed">{proj.description}</p>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        {/* ACCOMPLISHMENTS */}
        <SectionCard title="Accomplishments">
          <div className="space-y-6">
            {[
              {
                key: "onlineProfiles",
                label: "Online profile",
                desc: "Add link to online professional profiles (e.g. LinkedIn, etc.)",
              },
              {
                key: "workSamples",
                label: "Work sample",
                desc: "Link relevant work samples (e.g. Github, Behance)",
              },
              {
                key: "publications",
                label: "White paper / Research publication / Journal entry",
                desc: "Add links to your online publications",
              },
              {
                key: "presentations",
                label: "Presentation",
                desc: "Add links to your online presentations (e.g. Slide-share presentation links etc.)",
              },
              {
                key: "patents",
                label: "Patent",
                desc: "Add details of patents you have filed",
              },
              {
                key: "certifications",
                label: "Certification",
                desc: "Add details of certifications you have completed",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex flex-col gap-3 border border-zinc-800/70 rounded-xl p-4 bg-zinc-900/25"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-zinc-200 font-bold text-sm mb-1">
                      {item.label}
                    </h4>
                    <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                  <button
                    onClick={() =>
                      handleEdit(`accomplishment_${item.key}`, {
                        name: "",
                        link: "",
                      })
                    }
                    className="text-[#00C896] text-sm font-medium hover:underline whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
                {user.accomplishments[item.key as keyof Accomplishments].map(
                  (acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between bg-zinc-950/70 px-4 py-2.5 rounded-lg border border-zinc-800/70"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-zinc-200 text-sm truncate">
                          {acc.name}
                        </span>
                        {acc.link && (
                          <a
                            href={acc.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-zinc-700/80 text-zinc-400 hover:text-[#00C896] hover:border-[#00C896]/50 transition-colors"
                            title={acc.link}
                          >
                            Open
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleEdit(`accomplishment_${item.key}`, acc)
                          }
                          className="text-zinc-500 hover:text-[#00C896]"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(`accomplishment_${item.key}`, acc.id)
                          }
                          className="text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* MODAL FOR EDITING */}
        <Modal
          isOpen={!!editingSection}
          onClose={() => {
            setEditingSection(null);
            setEditData({});
          }}
          title={
            editingSection === "summary"
              ? user.summary
                ? "Edit Professional Summary"
                : "Add Professional Summary"
              : `Edit ${
                  editingSection
                    ?.replace("accomplishment_", "")
                    .replace(/([A-Z])/g, " $1")
                    .trim() || ""
                }`
          }
        >
          {editingSection === "hero" && (
            <>
              <InputField
                label="Full Name"
                name="name"
                value={editData?.name || ""}
                onChange={handleChange}
              />

              <InputField
                label="Job Title"
                name="role"
                value={editData?.role || ""}
                onChange={handleChange}
              />

              <InputField
                label="Employment Type"
                name="jobType"
                value={editData?.jobType || ""}
                onChange={handleChange}
              />

              <InputField
                label="Location"
                name="location"
                value={editData?.location || ""}
                onChange={handleChange}
              />

              <InputField
                label="Experience"
                name="experience"
                value={editData?.experience || ""}
                onChange={handleChange}
              />

              <InputField
                label="Salary"
                name="salary"
                value={editData?.salary || ""}
                onChange={handleChange}
              />

              <InputField
                label="Email"
                name="email"
                value={editData?.email || ""}
                onChange={handleChange}
              />

              <InputField
                label="Phone"
                name="phone"
                value={editData?.phone || ""}
                onChange={handleChange}
              />

              <div className="flex items-center gap-2 mt-2">
                <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                  <input
                    id="editIsWhatsApp"
                    type="checkbox"
                    checked={!!editData?.isWhatsApp}
                    onChange={(e) => setEditData((prev: any) => ({ ...prev, isWhatsApp: e.target.checked }))}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-700 bg-[#111] checked:border-[#25D366] checked:bg-[#25D366] focus:outline-none focus:ring-2 focus:ring-[#25D366]/50"
                  />
                  <Check className="pointer-events-none absolute h-2.5 w-2.5 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                </span>
                <label
                  htmlFor="editIsWhatsApp"
                  className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-400 select-none"
                >
                  This is my WhatsApp number
                </label>
              </div>
            </>
          )}

          {editingSection === "summary" && (
            <div className="space-y-2">
              <label className="block text-zinc-500 text-xs font-bold uppercase mb-1.5">
                Professional Summary
              </label>
              <textarea
                value={editData?.summary || ""}
                onChange={(e) => handleChange("summary", e.target.value)}
                placeholder="Write a short professional summary highlighting your expertise, key skills, and career goals..."
                className="w-full h-44 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00C896] transition-colors resize-none"
              />
              <p className="text-zinc-600 text-xs text-right">
                {(editData?.summary || "").length} characters
              </p>
            </div>
          )}

          {editingSection === "skills" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-zinc-500 text-xs">
                  Select predefined skills or add custom skills
                </p>
                <p className="text-zinc-500 text-xs">
                  {safeArray(editData?.skills).length} / 15
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {editData?.skills?.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-zinc-800 text-white text-xs rounded-full flex items-center gap-2"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkillFromEditor(idx)}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="space-y-2">
                <label className="block text-zinc-500 text-xs font-bold uppercase">
                  Predefined Skills
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedSkillOption}
                    onChange={(e) => setSelectedSkillOption(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00C896] transition-colors"
                    disabled={safeArray(editData?.skills).length >= 15}
                  >
                    <option value="">Select a skill...</option>
                    {allSkills
                      .filter((skill) => !safeArray(editData?.skills).includes(skill))
                      .map((skill) => (
                        <option key={skill} value={skill}>
                          {skill}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => addSkillToEditor(selectedSkillOption)}
                    className="px-4 py-2 rounded-lg border border-[#00C896] text-[#00C896] hover:bg-[#00C896]/10 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedSkillOption || safeArray(editData?.skills).length >= 15}
                  >
                    Add
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder={
                  safeArray(editData?.skills).length >= 15
                    ? "Maximum skills reached"
                    : "Or type custom skill and press Enter"
                }
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                disabled={safeArray(editData?.skills).length >= 15}
                onKeyDown={(e: any) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkillToEditor(customSkillInput);
                  }
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00C896] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {skillsError && <p className="text-red-400 text-xs">{skillsError}</p>}
            </div>
          )}

          {editingSection === "careerDNA" && (
            <div className="space-y-6">
              <div>
                <label className="block text-zinc-500 text-xs font-bold uppercase mb-1.5">
                  Core Strengths
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editData?.coreStrengths?.map((s: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-zinc-800 text-white text-xs rounded-full flex items-center gap-2"
                    >
                      {s}
                      <button
                        onClick={() =>
                          handleChange(
                            "coreStrengths",
                            editData.coreStrengths.filter(
                              (_: any, i: number) => i !== idx,
                            )
                          )
                        }
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add strength and press Enter"
                  onKeyDown={(e: any) => {
                    if (e.key === "Enter" && e.target.value) {
                      handleChange("coreStrengths", [
                        ...(editData?.coreStrengths || []),
                        e.target.value,
                      ]);
                      e.target.value = "";
                    }
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00C896] transition-colors"
                />
              </div>
              <div>
                <label className="block text-zinc-500 text-xs font-bold uppercase mb-1.5">
                  Enjoyable Tasks
                </label>
                <textarea
                  value={editData?.enjoyableTasks || ""}
                  onChange={(e) =>
                    handleChange("enjoyableTasks", e.target.value)
                  }
                  className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00C896] transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-zinc-500 text-xs font-bold uppercase mb-1.5">
                  Career Values
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editData?.careerValues?.map((v: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-zinc-800 text-white text-xs rounded-full flex items-center gap-2"
                    >
                      {v}
                      <button
                        onClick={() =>
                          handleChange(
                            "careerValues",
                            editData.careerValues.filter(
                              (_: any, i: number) => i !== idx,
                            )
                          )
                        }
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add value and press Enter"
                  onKeyDown={(e: any) => {
                    if (e.key === "Enter" && e.target.value) {
                      handleChange("careerValues", [
                        ...(editData?.careerValues || []),
                        e.target.value,
                      ]);
                      e.target.value = "";
                    }
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00C896] transition-colors"
                />
              </div>
              <div>
                <label className="block text-zinc-500 text-xs font-bold uppercase mb-1.5">
                  Career Interests
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editData?.careerInterests?.map((i: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-zinc-800 text-white text-xs rounded-full flex items-center gap-2"
                    >
                      {i}
                      <button
                        onClick={() =>
                          handleChange(
                            "careerInterests",
                            editData.careerInterests.filter(
                              (_: any, idy: number) => idy !== idx,
                            )
                          )
                        }
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add interest and press Enter"
                  onKeyDown={(e: any) => {
                    if (e.key === "Enter" && e.target.value) {
                      handleChange("careerInterests", [
                        ...(editData?.careerInterests || []),
                        e.target.value,
                      ]);
                      e.target.value = "";
                    }
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00C896] transition-colors"
                />
              </div>
              <InputField
                label="Industry / Sector"
                name="industry"
                value={editData?.industry || ""}
                onChange={handleChange}
              />
              <InputField
                label="Personality Type"
                name="personalityType"
                value={editData?.personalityType || ""}
                onChange={handleChange}
              />
              <InputField
                label="Market Demand"
                name="marketDemand"
                value={editData?.marketDemand || ""}
                onChange={handleChange}              />
              <InputField
                label="Emerging Trends"
                name="emergingTrends"
                value={editData?.emergingTrends || ""}
                onChange={handleChange}
              />
              <InputField
                label="Market Gap"
                name="marketGap"
                value={editData?.marketGap || ""}
                onChange={handleChange}
              />
              <InputField
                label="Niche Statement"
                name="nicheStatement"
                value={editData?.nicheStatement || ""}
                onChange={handleChange}
              />
              <InputField
                label="Additional Preferences"
                name="additionalPreferences"
                value={editData?.additionalPreferences || ""}
                onChange={handleChange}
              />
            </div>
          )}

          {editingSection === "preferences" && (
            <>
              <InputField
                label="Industry"
                name="industry"
                value={editData?.industry || ""}
                onChange={handleChange}
              />
              <InputField
                label="Department"
                name="department"
                value={editData?.department || ""}
                onChange={handleChange}
              />
              <InputField
                label="Role Category"
                name="roleCategory"
                value={editData?.roleCategory || ""}
                onChange={handleChange}
              />
              <InputField
                label="Job Role"
                name="jobRole"
                value={editData?.jobRole || ""}
                onChange={handleChange}
              />
              <InputField
                label="Job Type"
                name="jobType"
                value={editData?.jobType || ""}
                onChange={handleChange}
              />
              <InputField
                label="Employment Type"
                name="employmentType"
                value={editData?.employmentType || ""}
                onChange={handleChange}
              />
              <InputField
                label="Shift"
                name="shift"
                value={editData?.shift || ""}
                onChange={handleChange}
              />
              <InputField
                label="Location"
                name="location"
                value={editData?.location || ""}
                onChange={handleChange}
              />
              <InputField
                label="Expected Salary"
                name="expectedSalary"
                value={editData?.expectedSalary || ""}
                onChange={handleChange}
              />
            </>
          )}

          {editingSection === "experience" && (
            <div className="space-y-4">
              <InputField
                label="Title"
                name="title"
                value={editData?.title || ""}
                onChange={handleChange}
                className="mb-0"
              />
              <InputField
                label="Company"
                name="company"
                value={editData?.company || ""}
                onChange={handleChange}
                className="mb-0"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Start Date"
                  name="startDate"
                  value={editData?.startDate || ""}
                  onChange={handleChange}
                  type="date"
                  className="mb-0"
                />
                {!editData?.currentlyWorking && (
                  <InputField
                    label="End Date"
                    name="endDate"
                    value={editData?.endDate || ""}
                    onChange={handleChange}
                    type="date"
                    className="mb-0"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => handleChange("currentlyWorking", !editData?.currentlyWorking)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                  editData?.currentlyWorking
                    ? "border-[#00C896]/50 bg-[#00C896]/10 text-white"
                    : "border-zinc-700/60 bg-zinc-900/50 text-zinc-300 hover:border-zinc-600"
                }`}
              >
                <span>
                  <span className="block text-sm font-semibold">Currently working here</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">
                    {editData?.currentlyWorking ? "Resume will show Present" : "Add an end date if this role has ended"}
                  </span>
                </span>
                <span
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    editData?.currentlyWorking ? "bg-[#00C896]" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      editData?.currentlyWorking ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </span>
              </button>
              {editData?.currentlyWorking && (
                <div className="rounded-lg border border-[#00C896]/20 bg-[#00C896]/5 px-3 py-2 text-xs font-medium text-[#00C896]">
                  This role will appear as {editData?.startDate ? `${formatMonthYear(editData.startDate)} - Present` : "Present"} on your generated resume.
                </div>
              )}
              <div>
                <label className="block text-zinc-400 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={editData?.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                  placeholder="Add key responsibilities, achievements, tools, or measurable impact."
                  className="min-h-[104px] w-full resize-y rounded-lg border border-zinc-700/60 bg-zinc-900/80 px-4 py-3 text-sm leading-relaxed text-white placeholder-zinc-600 transition-all focus:border-[#00C896] focus:outline-none focus:ring-1 focus:ring-[#00C896]/20"
                />
              </div>
            </div>
          )}

          {(editingSection === "education" ||
            editingSection === "certifications") && (
            <>
              {Object.entries(editData || {}).map(([key, value]) => {
                if (key === "id") return null;
                return (
                  <InputField
                    key={key}
                    label={
                      key.charAt(0).toUpperCase() +
                      key.slice(1).replace(/([A-Z])/g, " $1")
                    }
                    name={key}
                    value={value as string}
                    onChange={handleChange}
                    type={
                      key === "startDate" || key === "endDate" ? "date" : "text"
                    }
                  />
                );
              })}
            </>
          )}

          {editingSection === "itSkills" && (
            <>
              <InputField
                label="Skill"
                name="skill"
                value={editData?.skill || ""}
                onChange={handleChange}
              />
              <InputField
                label="Version"
                name="version"
                value={editData?.version || ""}
                onChange={handleChange}
              />
              <InputField
                label="Last Used"
                name="lastUsed"
                value={editData?.lastUsed || ""}
                onChange={handleChange}
              />
              <InputField
                label="Experience"
                name="experience"
                value={editData?.experience || ""}
                onChange={handleChange}
              />
            </>
          )}

          {editingSection === "languages" && (
            <>
              <InputField
                label="Language"
                name="name"
                value={editData?.name || ""}
                onChange={handleChange}
              />
              <InputField
                label="Proficiency"
                name="proficiency"
                value={editData?.proficiency || ""}
                onChange={handleChange}
              />
              <div className="mb-4">
                <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">
                  Proficiency in
                </label>
                <div className="flex gap-6">
                  {["read", "write", "speak"].map((ability) => (
                    <label key={ability} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editData?.[ability] || false}
                        onChange={(e) =>
                          setEditData((prev: any) => ({
                            ...prev,
                            [ability]: e.target.checked,
                          }))
                        }
                        className="native-brand-checkbox w-4 h-4 rounded border-zinc-500 bg-white/10 text-[#00C896] focus:ring-[#00C896] focus:ring-offset-0"
                      />
                      <span className="text-white text-sm capitalize">
                        {ability}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {editingSection === "projects" && (
            <>
              <InputField
                label="Project Name"
                name="name"
                value={editData?.name || ""}
                onChange={handleChange}
              />
              <InputField
                label="Description"
                name="description"
                value={editData?.description || ""}
                onChange={handleChange}
              />
              <InputField
                label="Project Link (URL)"
                name="link"
                value={editData?.link || ""}
                onChange={handleChange}
              />
            </>
          )}

          {editingSection?.startsWith("accomplishment_") && (
            <>
              <InputField
                label="Name"
                name="name"
                value={editData?.name || ""}
                onChange={handleChange}
              />
              <InputField
                label="Link (URL)"
                name="link"
                value={editData?.link || ""}
                onChange={handleChange}
              />
              
            </>
          )}

          <div className="mt-8 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-[#00C896] hover:bg-[#00b386] text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => {
                setEditingSection(null);
                setEditData({});
              }}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </Modal>

        {/* Parsed Resume Details Modal */}
        <Dialog open={isParsedResumeDialogOpen} onOpenChange={setIsParsedResumeDialogOpen}>
          <DialogContent className="sm:max-w-3xl bg-[#121212] border border-zinc-800 text-white max-h-[85vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="px-6 py-4 border-b border-zinc-800 bg-[#161616]">
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-[#00C896]">
                <Sparkles className="w-5 h-5 animate-pulse" /> Resume Parsed Successfully!
              </DialogTitle>
              <DialogDescription className="text-zinc-400 text-sm">
                We have automatically extracted details from your resume and updated your profile. Please review the details below.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/60">
                  <div>
                    <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Full Name</label>
                    <p className="text-white font-medium text-base mt-0.5">{parsedResumeDetails?.name || "—"}</p>
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Email Address</label>
                    <p className="text-white font-medium text-base mt-0.5">{parsedResumeDetails?.email || "—"}</p>
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Contact Number</label>
                    <p className="text-white font-medium text-base mt-0.5">{parsedResumeDetails?.contact_number || "—"}</p>
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">LinkedIn URL</label>
                    {parsedResumeDetails?.linkedin ? (
                      <a href={parsedResumeDetails.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#00C896] hover:underline font-medium text-base mt-0.5 flex items-center gap-1.5">
                        View Profile <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <p className="text-zinc-400 font-medium text-base mt-0.5">—</p>
                    )}
                  </div>
                </div>

                {/* Professional Profile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/60">
                  <div>
                    <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Job Title</label>
                    <p className="text-white font-medium text-base mt-0.5">{parsedResumeDetails?.job_title || "—"}</p>
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Job Location</label>
                    <p className="text-white font-medium text-base mt-0.5">{parsedResumeDetails?.job_location || "—"}</p>
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Job Type</label>
                    <p className="text-white font-medium text-base mt-0.5">{parsedResumeDetails?.job_type || "—"}</p>
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Years of Experience</label>
                    <p className="text-white font-medium text-base mt-0.5">{parsedResumeDetails?.experience || "—"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Expected / Current Salary</label>
                    <p className="text-white font-medium text-base mt-0.5">{parsedResumeDetails?.salary || "—"}</p>
                  </div>
                </div>

                {/* Summary */}
                {parsedResumeDetails?.summary && (
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/60">
                    <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Professional Summary</label>
                    <p className="text-zinc-300 text-sm mt-1.5 leading-relaxed">{parsedResumeDetails.summary}</p>
                  </div>
                )}

                {/* Skills */}
                {parsedResumeDetails?.skills && parsedResumeDetails.skills.length > 0 && (
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/60">
                    <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-2">Skills Extracted</label>
                    <div className="flex flex-wrap gap-2">
                      {parsedResumeDetails.skills.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-[#00C896]/10 text-[#00C896] border-[#00C896]/20 px-2.5 py-1 text-xs font-medium rounded-full">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {parsedResumeDetails?.work_experience && parsedResumeDetails.work_experience.length > 0 && (
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/60">
                    <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-3">Work Experience</label>
                    <div className="space-y-4">
                      {parsedResumeDetails.work_experience.map((exp: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-[#00C896]/30 pl-4 py-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-white font-semibold text-sm">{exp.job_title || "Role"}</h4>
                            <span className="text-[#00C896] text-xs font-medium">{exp.company_name}</span>
                          </div>
                          {exp.description && (
                            <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {parsedResumeDetails?.education && parsedResumeDetails.education.length > 0 && (
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/60">
                    <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-3">Education</label>
                    <div className="space-y-3">
                      {parsedResumeDetails.education.map((edu: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-start border-l-2 border-zinc-700 pl-4 py-1">
                          <div>
                            <h4 className="text-white font-semibold text-sm">{edu.degree || "Degree"}</h4>
                            <p className="text-zinc-400 text-xs mt-0.5">{edu.institution || edu.school}</p>
                          </div>
                          {edu.duration && (
                            <span className="text-zinc-500 text-xs">{edu.duration || edu.year}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {parsedResumeDetails?.certifications && parsedResumeDetails.certifications.length > 0 && (
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/60">
                    <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-3">Certifications</label>
                    <div className="space-y-3">
                      {parsedResumeDetails.certifications.map((cert: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-start border-l-2 border-zinc-700 pl-4 py-1">
                          <div>
                            <h4 className="text-white font-semibold text-sm">{cert.name}</h4>
                            <p className="text-zinc-400 text-xs mt-0.5">{cert.issuer}</p>
                          </div>
                          {cert.date && (
                            <span className="text-zinc-500 text-xs">{cert.date}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="px-6 py-4 border-t border-zinc-800 bg-[#161616] flex justify-end">
              <button
                onClick={() => setIsParsedResumeDialogOpen(false)}
                className="bg-[#00C896] hover:bg-[#00b386] text-black font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                Great, thank you!
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProfilePage;

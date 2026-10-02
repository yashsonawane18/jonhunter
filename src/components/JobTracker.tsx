import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Briefcase,
  Target,
  LogOut,
  Upload,
  Eye,
  Trash2,
  Edit,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Loader,
  Check,
  ChevronsUpDown,
  Sparkles,
} from "lucide-react";
import { Button } from "./home/Button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import API_ENDPOINTS, { normalizeHostedUrl } from "../config/api";
import { allSkills } from "../constants/skills";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
//import { User as FirebaseUser } from "firebase/auth";
import { useUser } from "../contexts/UserContext";
import NotificationBell from "./NotificationBell";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { toast } from "sonner";
import { cn } from "./ui/utils";
import Sidebar from "./Sidebar";
import GeneratedResumeDialog from "./GeneratedResumeDialog";
import { generateResume } from "../lib/generateResume";
import type { GeneratedResume, CoverLetter } from "../lib/resumeTypes";
import { ApplicationDrawer } from "./ApplicationDrawer";

const stripHtml = (html: string): string => {
  if (!html) return "";
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const styles = doc.querySelectorAll("style, script");
    styles.forEach(el => el.remove());
    return doc.body.textContent || doc.body.innerText || "";
  } catch (e) {
    return html.replace(/<[^>]*>/g, "");
  }
};

interface ProofLog {
  timestamp: string;
  screenshots: string[];
  remarks: string;
  status: string;
}

interface Connection {
  name: string;
  title: string;
  emailOrLinkedIn: string; // email or LinkedIn URL
  email?: string;
  mobileNumber?: string;
}

const connectionPrimary = (conn: Connection) =>
  conn.name || conn.title || conn.emailOrLinkedIn || conn.email || conn.mobileNumber || "Connection";

const connectionDetails = (conn: Connection) => {
  const primary = connectionPrimary(conn);
  return Array.from(new Set([conn.title, conn.emailOrLinkedIn, conn.email, conn.mobileNumber].filter(Boolean) as string[]))
    .filter((detail) => detail !== primary);
};

const splitSkills = (value: string | string[] | undefined): string[] => {
  const values = Array.isArray(value) ? value : [value || ""];
  const seen = new Set<string>();

  return values
    .flatMap((skill) => skill.split(/[,;|\n\r]+/))
    .map((skill) => skill.replace(/^\[|\]$/g, "").trim())
    .filter((skill) => {
      const normalized = skill.toLowerCase();
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
};

interface TrackedJob {
  id: string;
  user_job_id?: string; // API identifier for deletion
  title: string;
  company: string;
  location?: string;
  jobType?: string;
  salary?: string;
  experience?: string;
  description?: string;
  keyResponsibilities?: string | string[];
  insights?: string;
  status: "saved" | "applied" | "call_received" | "interview" | "offer" | "rejected";  addedTime: string;
  callReceived?: boolean;
  appliedDate?: string;
  matchScore?: number;
  requirements?: string[];
  jobUrl?: string;
  connections?: Connection[];
  remarks?: string;
  proofs?: {
    screenshots: string[];
    remarks: string;
  };
  proofHistory?: ProofLog[];
  resumePath?: string;
  resumeFileName?: string;
  next_follow_up_date?: string;
  follow_up_date?: string;
  last_follow_up_date?: string;
  follow_up_count?: number;
  reminder_status?: string;
  operator_notes?: string;
  user_id?: string;
}

interface JobTrackerProps {
  onLogout: () => void;
  onNavigate?: (screen: string) => void;
  trackedJobs: TrackedJob[];
  onAddJob: (job: Omit<TrackedJob, "id" | "addedTime">) => void;
  onUpdateJob: (jobId: string, updates: Partial<TrackedJob>) => void;
  onMoveJob: (jobId: string, newStatus: TrackedJob["status"]) => void;
  onDeleteJob: (jobId: string) => void;
  isPremiumUser: boolean;
   // Stores the selected KPI card filter to display only matching jobs
  jobKpiFilter: string;
  setJobKpiFilter: React.Dispatch<React.SetStateAction<string>>;
}

const JobTracker: React.FC<JobTrackerProps> = ({
  onLogout,
  onNavigate,
  trackedJobs,
  onAddJob,
  onUpdateJob,
  onMoveJob,
  onDeleteJob,
  isPremiumUser,
}) => {
  // Stores the KPI card selected by the user to filter related jobs.
const [jobKpiFilter, setJobKpiFilter] = useState<string>('all');
  const [selectedUserJob, setSelectedUserJob] = useState<TrackedJob | null>(null);
  // for the note icon 
  const [selectedOperatorNote, setSelectedOperatorNote] = useState<string | null>(null);
  const [kpis, setKpis] = useState<any>({
    // pendingAdminApply: 0,
    appliedToday: 0,
    followUpDue: 0,
    recruiterReplies: 0,
    interviewsScheduled: 0,
    offers: 0,
    rejections: 0,
  });

  const fetchKpis = useCallback(async () => {
    try {
      const res = await fetch(API_ENDPOINTS.DASHBOARD_KPIS(), {
        headers: {
          'X-SESSION-TOKEN': localStorage.getItem('session_token') || sessionStorage.getItem('session_token') || localStorage.getItem('token') || sessionStorage.getItem('token') || '',
        }
      });
      if (res.ok) {
        setKpis(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  }, [trackedJobs]);

  React.useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddJobDialog, setShowAddJobDialog] = useState(false);
  const [selectedJobForEdit, setSelectedJobForEdit] =
    useState<TrackedJob | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [expandedRemarks, setExpandedRemarks] = useState<Set<string>>(
    new Set()
  );
  const [activeTab, setActiveTab] = useState("All");
  // The checkbox is a convenience shortcut only the first time it is used in
  // an add/edit flow. After that, changing it must not overwrite a manual status.
  const callReceivedShortcutUsed = useRef(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Loading states for buttons
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [isUpdatingJob, setIsUpdatingJob] = useState<string | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState<string | null>(null);

  // Custom skill input states
  const [customSkill, setCustomSkill] = useState("");
  const [skillPopoverOpen, setSkillPopoverOpen] = useState(false);

  // Generate Resume states
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<CoverLetter | null>(null);
  const [showGeneratedResume, setShowGeneratedResume] = useState(false);
  // JD + profile context for the generation, reused by the Interview Prep tab.
  const [generationContext, setGenerationContext] = useState<{
    userId: string;
    jobId: string;
    userJobId: string;
    jobTitle: string;
    company: string;
    jdText: string;
    keySkills: string[];
  } | null>(null);
  // Bumped on every generation so the preview dialog fully remounts with fresh
  // state — prevents any edits/drafts from one job leaking into another.
  const [generationNonce, setGenerationNonce] = useState(0);

  // Form state for add/edit job
  const [jobForm, setJobForm] = useState({
    job_id: "" as string,
    user_job_id: "" as string,
    title: "",
    company: "",
    location: "",
    jobType: "Full-time",
    salary: "",
    experience: "",
    keyResponsibilities: [] as string[],
    jobUrl: "",
    insights: "",
    status: "saved" as TrackedJob["status"],
    callReceived: false,
    connections: [{ name: "", title: "", emailOrLinkedIn: "", email: "", mobileNumber: "" }] as Connection[],
    remarks: "",
    proofs: { screenshots: [] as string[], remarks: "" },
    resumeUrl: "" as string,
    resumeFileName: "" as string,
  });

  // Store actual File objects for upload
  const [jobFormFiles, setJobFormFiles] = useState({
    proofFiles: [] as File[],
    resumeFile: null as File | null,
  });

  // Proof form state
  const [proofForm, setProofForm] = useState({
    screenshots: [] as string[],
    remarks: "",
  });

  const [activeInsightsTab, setActiveInsightsTab] = useState<'edit' | 'preview'>('edit');

  const getSessionToken = () =>
    localStorage.getItem("session_token") ||
    sessionStorage.getItem("session_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

  const getCurrentUserId = () =>
    localStorage.getItem("user_id") || sessionStorage.getItem("user_id") || "";

  const handleSessionExpired = () => {
    sessionStorage.setItem('session_expired_msg', 'Your session has expired. Please log in again.');
    onLogout();
  };

  const isSessionError = (status: number, body: string) =>
    status === 401 || status === 403 ||
    body.toLowerCase().includes("session") ||
    body.toLowerCase().includes("expired") ||
    body.toLowerCase().includes("unauthorized");

  // Remove skill from job form
  const removeSkill = (skillToRemove: string) => {
    setJobForm((prev) => ({
      ...prev,
      keyResponsibilities: prev.keyResponsibilities.filter((r) => r !== skillToRemove),
    }));
  };

  // Add custom skill
  const addCustomSkill = (skill: string) => {
    const incomingSkills = splitSkills(skill);
    if (!incomingSkills.length) return;

    setJobForm((prev) => {
      const existing = new Set(prev.keyResponsibilities.map((item) => item.toLowerCase()));
      const newSkills = incomingSkills.filter((item) => {
        const normalized = item.toLowerCase();
        if (existing.has(normalized)) return false;
        existing.add(normalized);
        return true;
      });

      return {
        ...prev,
        keyResponsibilities: [...prev.keyResponsibilities, ...newSkills].slice(0, 15),
      };
    });
    setCustomSkill("");
  };

  // Handle custom skill form submit
  const handleCustomSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomSkill(customSkill);
  };

  const resetJobForm = () => {
    callReceivedShortcutUsed.current = false;
    setJobForm({
      job_id: "",
      user_job_id: "",
      title: "",
      company: "",
      location: "",
      jobType: "Full-time",
      salary: "",
      experience: "",
      keyResponsibilities: [],
      jobUrl: "",
      insights: "",
      status: "saved" as TrackedJob["status"],
      callReceived: false,
      connections: [{ name: "", title: "", emailOrLinkedIn: "", email: "", mobileNumber: "" }],
      remarks: "",
      proofs: { screenshots: [], remarks: "" },
      resumeUrl: "",
      resumeFileName: "",
    });
    setJobFormFiles({
      proofFiles: [],
      resumeFile: null,
    });
    setCustomSkill("");
    setSkillPopoverOpen(false);
  };

  // File upload utility function
  const uploadFilesToAPI = async (proofFiles: File[], resumeFile: File | null, userId: string) => {
    try {
      const uploadedUrls = {
        proofUrls: [] as string[],
        resumeUrl: "" as string,
      };

      // Upload proofs in parallel
      if (proofFiles.length > 0) {
        const proofUploadPromises = proofFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('user_id', userId);

          const response = await fetch(API_ENDPOINTS.FILES_UPLOAD, {
            method: 'POST',
            headers: {
              "X-SESSION-TOKEN": getSessionToken(),
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload proof file: ${file.name}`);
          }

          const data = await response.json();
          return data.file_url || data.url; // Handle different response formats
        });

        uploadedUrls.proofUrls = await Promise.all(proofUploadPromises);
      }

      // Upload resume
      if (resumeFile) {
        const formData = new FormData();
        formData.append('file', resumeFile);
        formData.append('user_id', userId);

        const response = await fetch(API_ENDPOINTS.FILES_UPLOAD, {
          method: 'POST',
          headers: {
            "X-SESSION-TOKEN": getSessionToken(),
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload resume file: ${resumeFile.name}`);
        }

        const data = await response.json();
        uploadedUrls.resumeUrl = data.file_url || data.url; // Handle different response formats
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  };

  // Helper: Prepare files for upload
  const prepareJobFiles = async (userId: string) => {
    if (!jobFormFiles.proofFiles.length && !jobFormFiles.resumeFile) {
      return { proofUrls: [] as string[], resumeUrl: "" as string };
    }
    return uploadFilesToAPI(
      jobFormFiles.proofFiles,
      jobFormFiles.resumeFile,
      userId
    );
  };

  // Helper: Build job metadata payload for /jobs/{jobId} endpoint
  // Used for updating: job_title, company, location, job_type, application_url, insights, remarks, experience, salary, applied_at, key_skills, is_delete, connections
  const buildJobMetadataPayload = () => {
    const validConnections = jobForm.connections.filter(
      (conn) => conn.name || conn.title || conn.emailOrLinkedIn || conn.email || conn.mobileNumber
    );

    // Clean skills by removing brackets if they exist
    const cleanedSkills = splitSkills(jobForm.keyResponsibilities).slice(0, 15);

    // Build payload with only Job entity metadata fields
    const numericSalary = Number.parseFloat(
      String(jobForm.salary || "").replace(/[^0-9.]/g, "")
    );
    const payload: any = {
      job_title: jobForm.title,
      company: jobForm.company,
      location: jobForm.location || undefined,
      job_type: jobForm.jobType || undefined,
      key_skills: cleanedSkills.length > 0 ? cleanedSkills : undefined,
      application_url: jobForm.jobUrl || undefined,
      insights: jobForm.insights || undefined,
      salary: Number.isFinite(numericSalary) ? numericSalary : undefined,
      applied_at: new Date().toISOString().split("T")[0],
      remarks: jobForm.remarks || undefined,
      connections: validConnections.length > 0 ? validConnections : undefined,
      experience: jobForm.experience || undefined,
      is_delete: false,
    };

    // Remove undefined values to keep payload clean
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    return payload;
  };

  // Helper: Build user job metadata payload for /user-jobs/{userId}/{jobId} endpoint
  // Used for updating: status, resume_path, proof_path, proof_remark, is_delete
  const buildUserJobMetadataPayload = (
    uploadedUrls: { proofUrls: string[]; resumeUrl: string },
    proofRemark: string
  ) => {
    const userJobPayload: any = {
      status: jobForm.status,
      call_received: jobForm.callReceived,
      resume_path: uploadedUrls.resumeUrl || "",
      proof_path: uploadedUrls.proofUrls.length > 0 ? uploadedUrls.proofUrls.join(',') : "",
      proof_remark: proofRemark || "",
      is_delete: false,
    };

    // Remove empty string values to keep payload clean
    Object.keys(userJobPayload).forEach((key) => {
      if (userJobPayload[key] === "") {
        delete userJobPayload[key];
      }
    });

    return userJobPayload;
  };

  //Add new job
  const createAndSaveNewJob = async () => {
    if (!jobForm.title || !jobForm.company) return;

    setIsSubmittingJob(true);
    const user_id = getCurrentUserId();
    if (!user_id) {
      console.error("User ID not found in localStorage");
      setIsSubmittingJob(false);
      return;
    }
    
    // Filter out empty connections
    const validConnections = jobForm.connections.filter(
      (conn) => conn.name || conn.title || conn.emailOrLinkedIn || conn.email || conn.mobileNumber
    );
    
    try {
      // Step 1: Upload files to /files/upload API if any files are selected
      let uploadedUrls: { proofUrls: string[]; resumeUrl: string };
      try {
        uploadedUrls = await prepareJobFiles(user_id);
      } catch (uploadError) {
        console.error("File upload failed:", uploadError);
        alert("Failed to upload files. Please try again.");
        setIsSubmittingJob(false);
        return;
      }

      // Step 2: Build job metadata payload for /api/jobs endpoint
      const jobMetadataPayload = buildJobMetadataPayload();
      
      // Step 3: First API call: POST to /api/jobs to create the job
      const jobsResponse = await fetch(API_ENDPOINTS.JOBS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SESSION-TOKEN": getSessionToken(),
        },
        body: JSON.stringify(jobMetadataPayload),
      });

      if (!jobsResponse.ok) {
        console.error("Failed to add job to /api/jobs:", jobsResponse);
        alert("Failed to add job. Please try again.");
        setIsSubmittingJob(false);
        return;
      }

      const jobsResponseData = await jobsResponse.json();

      // Extract job_id from nested response structure
      // The API returns { id: wrapper_id, job: { job_id: actual_job_id } }
      const serverJobId =
        jobsResponseData.job_id ||
        jobsResponseData.job?.job_id ||
        jobsResponseData.id;
     
      const userJobIdForWrapper = jobsResponseData.id; // Wrapper ID for user-jobs operations

      // Step 4: Second API call: POST to /api/user-jobs/{userId}/{jobId} with user job metadata
      // Use the wrapper ID (userJobIdForWrapper) for user-jobs operations
      const userJobMetadataPayload = buildUserJobMetadataPayload(uploadedUrls, jobForm.proofs?.remarks || "");

      const userJobsResponse = await fetch(API_ENDPOINTS.USER_JOBS_UPDATE(user_id, serverJobId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SESSION-TOKEN": getSessionToken(),
        },
        body: JSON.stringify(userJobMetadataPayload),
      });

      if (!userJobsResponse.ok) {
        console.error("Failed to add job to /api/user-jobs:", userJobsResponse);
        alert("Failed to save job to user profile. Please try again.");
        setIsSubmittingJob(false);
        return;
      }

      const userJobsResponseData = await userJobsResponse.json();

      // Create new tracked job with nested job_id as primary ID (used for /jobs/{jobId} updates)
      // Also store the wrapper ID for user-jobs operations and deletion
      const newTrackedJob: TrackedJob = {
        id: serverJobId,
        user_job_id: userJobIdForWrapper, // Wrapper ID for deletion and user-jobs operations
        title: jobForm.title,
        company: jobForm.company,
        location: jobForm.location,
        jobType: jobForm.jobType,
        salary: jobForm.salary,
        experience: jobForm.experience,
        keyResponsibilities: jobForm.keyResponsibilities,
        jobUrl: jobForm.jobUrl,
        status: jobForm.status,
        callReceived: jobForm.callReceived,
        insights: jobForm.insights,
        appliedDate: new Date().toISOString().split("T")[0],
        connections: validConnections,
        remarks: jobForm.remarks,
        addedTime: new Date().toLocaleString(),
        proofs: uploadedUrls.proofUrls.length > 0 ? { screenshots: uploadedUrls.proofUrls, remarks: jobForm.proofs?.remarks || "" } : undefined,
        resumePath: uploadedUrls.resumeUrl || undefined,
        resumeFileName: jobForm.resumeFileName || undefined,
      };

      // Call onAddJob with frontend-formatted data
      onAddJob(newTrackedJob);

      resetJobForm();
      setShowAddJobDialog(false);
    } catch (error) {
      console.error("Error adding job:", error);
      alert("An error occurred while adding the job. Please try again.");
    } finally {
      setIsSubmittingJob(false);
    }
  };


    //Editing existing job data, not saving though
    const loadJobForEditing = (job: TrackedJob) => {
      callReceivedShortcutUsed.current = job.callReceived === true || job.status === "call_received";
      setSelectedJobForEdit(job);
      setJobForm({
        job_id: job.id,
        user_job_id: job.user_job_id || "",
        title: job.title,
        company: job.company,
        location: job.location || "",
        jobType: job.jobType || "Full-time",
        salary: job.salary || "",
        experience: job.experience || "",
        keyResponsibilities: splitSkills(job.keyResponsibilities).slice(0, 15),
        jobUrl: job.jobUrl || "",
        insights: stripHtml(job.insights || job.description || ""),
        status: job.status,
        callReceived: job.callReceived || false,
        connections:
          job.connections && job.connections.length > 0
            ? [
                ...job.connections,
                ...Array(Math.max(0, 5 - job.connections.length)).fill({
                  name: "",
                  title: "",
                  emailOrLinkedIn: "",
                  email: "",
                  mobileNumber: "",
                }),
              ]
            : Array(5).fill({ name: "", title: "", emailOrLinkedIn: "", email: "", mobileNumber: "" }),
        remarks: job.remarks || "",
        proofs: job.proofs || { screenshots: [], remarks: "" },
        resumeUrl: job.resumePath || "",
        resumeFileName: job.resumeFileName || "",
      });
    // If there are existing files, set them in jobFormFiles as well
    if (job.proofs?.screenshots && job.proofs.screenshots.length > 0) {
      setJobFormFiles((prev) => ({
        ...prev,
        proofFiles: [],
      }));
    }
    if (job.resumePath) {
      setJobFormFiles((prev) => ({
        ...prev,
        resumeFile: null,
      }));
    }
  };

  //Update existing job, basically also making two API calls
  const updateExistingJob = async () => {
    if (!selectedJobForEdit) return;

    const jobId = jobForm.job_id;
    setIsUpdatingJob(jobId);
    const user_id = getCurrentUserId();
    if (!user_id) {
      console.error("User ID not found in localStorage");
      setIsUpdatingJob(null);
      return;
    }

    try {
      // Step 1: Prepare and upload files if any new files are selected
      let uploadedUrls: { proofUrls: string[]; resumeUrl: string };
      try {
        uploadedUrls = await prepareJobFiles(user_id);
      } catch (uploadError) {
        console.error("File upload failed:", uploadError);
        alert("Failed to upload files. Please try again.");
        setIsUpdatingJob(null);
        return;
      }

      // Step 2: Preserve existing file paths if no new files are uploaded
      const finalUploadedUrls = {
        proofUrls: uploadedUrls.proofUrls.length > 0 
          ? uploadedUrls.proofUrls 
          : (selectedJobForEdit.proofs?.screenshots || []),
        resumeUrl: uploadedUrls.resumeUrl || selectedJobForEdit.resumePath || "",
      };

      // Step 3: Build job metadata payload for /jobs/{jobId} endpoint
      const jobMetadataPayload = buildJobMetadataPayload();

      // Step 4: First API call: PATCH to /jobs/{jobId} to update job metadata
      // Updates: job_title, company, location, job_type, application_url, insights, remarks, experience, salary, applied_at, key_skills, connections
      const jobUpdateResponse = await fetch(`${API_ENDPOINTS.JOBS}/${jobId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SESSION-TOKEN": getSessionToken(),
        },
        body: JSON.stringify(jobMetadataPayload),
      });

      if (!jobUpdateResponse.ok) {
        const errorText = await jobUpdateResponse.text().catch(() => "");
        if (isSessionError(jobUpdateResponse.status, errorText)) {
          handleSessionExpired();
          return;
        }
        alert("Failed to update job details. Please try again.");
        setIsUpdatingJob(null);
        return;
      }

      // Step 5: Build user job metadata payload for /user-jobs/{userId}/{jobId} endpoint
      const userJobMetadataPayload = buildUserJobMetadataPayload(finalUploadedUrls, jobForm.proofs?.remarks || "");

      // Step 6: Second API call: PATCH to /user-jobs/{userId}/{jobId} to update user job metadata
      // Updates: status, resume_path, proof_path, proof_remark
      // Use nested job_id (job.id in our TrackedJob) for user-jobs operations
      const userJobUpdateResponse = await fetch(API_ENDPOINTS.USER_JOBS_UPDATE(user_id, jobId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-SESSION-TOKEN": getSessionToken(),
        },
        body: JSON.stringify(userJobMetadataPayload),
      });

      if (!userJobUpdateResponse.ok) {
        const errorText = await userJobUpdateResponse.text().catch(() => "");
        if (isSessionError(userJobUpdateResponse.status, errorText)) {
          handleSessionExpired();
          return;
        }
        alert("Failed to update job status and files. Please try again.");
        setIsUpdatingJob(null);
        return;
      }

      // Step 7: Update frontend state with camelCase field names
      const validConnections = jobForm.connections.filter(
        (conn) => conn.name || conn.title || conn.emailOrLinkedIn || conn.email || conn.mobileNumber
      );

      const updatedJobData = {
        title: jobForm.title,
        company: jobForm.company,
        location: jobForm.location,
        jobType: jobForm.jobType,
        salary: jobForm.salary,
        experience: jobForm.experience,
        keyResponsibilities: jobForm.keyResponsibilities,
        jobUrl: jobForm.jobUrl,
        insights: jobForm.insights,
        status: jobForm.status,
        callReceived: jobForm.callReceived,
        connections: validConnections,
        remarks: jobForm.remarks,
        proofs: finalUploadedUrls.proofUrls.length > 0 ? { screenshots: finalUploadedUrls.proofUrls, remarks: jobForm.proofs?.remarks || "" } : selectedJobForEdit.proofs,
        resumePath: finalUploadedUrls.resumeUrl,
      };

      // Notify parent component
      onUpdateJob(jobId, updatedJobData);

      setSelectedJobForEdit(null);
      resetJobForm();
    } catch (error) {
      console.error("Error updating job:", error);
      alert("An error occurred while updating the job. Please try again.");
    } finally {
      setIsUpdatingJob(null);
    }
  };

  // Generate a tailored resume from the JD (insights) + candidate profile.
  // MOCK for now — see src/lib/generateResume.ts. When the backend endpoint
  // exists it resolves the full profile from user_id and the JD from job_id.
  const handleGenerateResume = async () => {
    const user_id = getCurrentUserId();
    if (!user_id) {
      alert("Please log in again to generate a resume.");
      return;
    }
    if (!jobForm.insights?.trim()) {
      alert("Add a Job Description / Insights first, then generate the resume.");
      return;
    }
    // No saved job required — the backend generates from the JD text we send
    // below. If the job is already saved, we also pass its id (for linkage/DB).
    const isUuid = (s: string) => /^[0-9a-fA-F-]{36}$/.test((s || "").trim());
    const jobId = (jobForm.job_id || "").trim();
    const userJobId = (jobForm.user_job_id || "").trim();

    setIsGeneratingResume(true);
    try {
      const { resume, coverLetter } = await generateResume({
        userId: user_id,
        jobId: isUuid(jobId) ? jobId : "",
        userJobId: isUuid(userJobId) ? userJobId : "",
        jobTitle: jobForm.title,
        company: jobForm.company,
        jdText: jobForm.insights,
        keySkills: jobForm.keyResponsibilities,
      });
      setGeneratedResume(resume);
      setGeneratedCoverLetter(coverLetter);
      // Kept so the Interview Prep tab can generate from the same JD + profile.
      setGenerationContext({
        userId: user_id,
        jobId: isUuid(jobId) ? jobId : "",
        userJobId: isUuid(userJobId) ? userJobId : "",
        jobTitle: jobForm.title,
        company: jobForm.company,
        jdText: jobForm.insights,
        keySkills: jobForm.keyResponsibilities,
      });
      setGenerationNonce((n) => n + 1);
      setShowGeneratedResume(true);
    } catch (error) {
      console.error("Error generating resume:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not generate resume. Please try again."
      );
    } finally {
      setIsGeneratingResume(false);
    }
  };

  const handleStatusChange = async (
    jobId: string,
    newStatus: TrackedJob["status"]
  ) => {
    setIsChangingStatus(jobId);
    const user_id = getCurrentUserId();
    if (!user_id) {
      console.error("User ID not found in localStorage");
      setIsChangingStatus(null);
      return;
    }

    const job = trackedJobs.find((j: TrackedJob) => j.id === jobId);
    if (!job) {
      console.error("Job not found");
      setIsChangingStatus(null);
      return;
    }

    try {
      // Build minimal payload with only status and insights as simple strings
      // Use same Map<String, String> format as updateExistingJob to avoid converter errors
      const statusUpdatePayload: any = {
        status: newStatus,
        call_received: job.callReceived === true,
        insights: job.insights || "",
      };

      // Use nested job_id for user-jobs operations
      // The /user-jobs endpoint expects the nested job_id, not the wrapper ID
      const response = await fetch(API_ENDPOINTS.USER_JOBS_UPDATE(user_id, jobId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-SESSION-TOKEN": getSessionToken(),
        },
        body: JSON.stringify(statusUpdatePayload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.error("Failed to update job status:", response.status, errorText);
        if (isSessionError(response.status, errorText)) {
          handleSessionExpired();
          return;
        }
        alert(`Failed to update job status: ${errorText || response.statusText}`);
        setIsChangingStatus(null);
        return;
      }

      // Notify parent component
      onMoveJob(jobId, newStatus);
    } catch (error) {
      console.error("Error updating job status:", error);
      alert("Error updating job status. Please try again.");
    } finally {
      setIsChangingStatus(null);
    }
  };

  // Helper function to determine MIME type from file extension
  const getMimeType = (fileName: string): string => {
    const extension = fileName.toLowerCase().split('.').pop() || '';
    
    const mimeTypes: { [key: string]: string } = {
      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'rtf': 'application/rtf',
      
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      
      // Spreadsheets
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'csv': 'text/csv',
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  };

  // Shared function to open any file (proof or resume)
  const handleOpenFile = async (fileName: string, fileType: 'proof' | 'resume' = 'proof') => {
    try {
      let fileUrl = '';
      
      // If it's a full URL (http/https), blob URL, or root-relative path
      if (fileName.startsWith('http://') || fileName.startsWith('https://') || fileName.startsWith('blob:') || fileName.startsWith('/')) {
        fileUrl = normalizeHostedUrl(fileName);
      } else {
        // If it's just a filename, construct the full URL using user_id
        const user_id = getCurrentUserId();
        if (!user_id) {
          alert('User ID not found. Please log in again.');
          return;
        }

        // Construct full URL for just filenames
        // Format: https://dheerajrathodconsult.com/files/{user_id}/{fileName}
        fileUrl = `${API_ENDPOINTS.FILES_FETCH(user_id, fileName)}`;
      }
      
      // Fetch the file to bypass Content-Disposition: attachment header
      // This allows browsers to display the file instead of downloading it
      const response = await fetch(fileUrl, {
        headers: {
          "X-SESSION-TOKEN": getSessionToken(),
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Get the file extension to determine MIME type
      const extension = fileName.toLowerCase().split('.').pop() || '';
      const mimeType = getMimeType(extension);
      
      // Read file as ArrayBuffer and create blob with explicit MIME type
      // This ensures the browser recognizes the file format and displays it instead of downloading
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: mimeType });
      
      // Create a blob URL and open it in new tab
      // With explicit MIME type, browsers display viewable files in-tab instead of downloading
      const blobUrl = URL.createObjectURL(blob);
      
      // Open in new window/tab - browser will display the file based on MIME type
      window.open(blobUrl, '_blank');
      
      // Note: We intentionally do NOT revoke the blob URL immediately
      // The browser keeps blob URLs alive as long as the tab/window is open
      // Manually revoking would break the file display in the new tab
      
      return;
    } catch (error) {
      console.error(`Error opening ${fileType} file:`, error);
      alert(`Unable to open ${fileType}. ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  // Function to open proof file in new tab
  const handleOpenProof = async (fileName: string) => {
    return handleOpenFile(fileName, 'proof');
  };

  // Function to open resume file in new tab
  const handleOpenResume = async (fileName: string) => {
    return handleOpenFile(fileName, 'resume');
  };

  // Function to delete a job
  const handleDeleteJob = async (jobId: string, userJobId?: string) => {
    const user_id = getCurrentUserId();
    if (!user_id) {
      alert("Cannot delete job: User session not found. Please log in again.");
      return;
    }

    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return;
    }

    try {
      // Soft-delete via PATCH /api/user-jobs/{userId}/{jobId} with is_delete: true
      // This uses the same reliable endpoint as status updates
      const response = await fetch(API_ENDPOINTS.USER_JOBS_UPDATE(user_id, jobId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-SESSION-TOKEN": getSessionToken(),
        },
        body: JSON.stringify({ is_delete: true }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.error("Failed to delete job:", response.status, errorText);
        if (isSessionError(response.status, errorText)) {
          handleSessionExpired();
          return;
        }
        alert(`Failed to delete job: ${errorText || response.statusText}`);
        return;
      }

      // Remove from UI only after confirmed server deletion
      onDeleteJob(jobId);
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Error deleting job. Please try again.");
    }
  };

  const toggleExpanded = (jobId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const toggleRemarksExpanded = (jobId: string) => {
    setExpandedRemarks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const addConnection = () => {
    if (jobForm.connections.length < 5) {
      setJobForm((prev) => ({
        ...prev,
        connections: [
          ...prev.connections,
          { name: "", title: "", emailOrLinkedIn: "", email: "", mobileNumber: "" },
        ],
      }));
    }
  };

  const updateConnection = (
    index: number,
    field: keyof Connection,
    value: string
  ) => {
    setJobForm((prev) => ({
      ...prev,
      connections: prev.connections.map((conn, i) =>
        i === index ? { ...conn, [field]: value } : conn
      ),
    }));
  };

  const removeConnection = (index: number) => {
    setJobForm((prev) => ({
      ...prev,
      connections: prev.connections.filter((_, i) => i !== index),
    }));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800";
      case "saved":
        return "bg-gray-100 text-gray-800";
      case "offer":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "interview":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const ensureProtocol = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return "https://" + url;
  };

  // Helper function to format applied date
  const formatFollowUpDate = (value?: string) => {
    if (!value) return "—";
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    } catch (error) {
      console.error('Error formatting follow-up date:', error);
    }
    return "—";
  };

  const formatAppliedDate = (appliedAt: number[] | string | undefined) => {
    if (!appliedAt) return "—";
    
    try {
      // If it's an array [year, month, day]
      if (Array.isArray(appliedAt)) {
        const [year, month, day] = appliedAt;
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      }
      
      // If it's a string date
      if (typeof appliedAt === 'string') {
        const date = new Date(appliedAt);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          });
        }
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }
    
    return "—";
  };

  // Helper function to detect contact type and return appropriate href and label
  const getContactLink = (contact: string) => {
    if (!contact) return null;

    // Email pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(contact)) {
      return {
        href: `mailto:${contact}`,
        label: "Email",
        type: "email"
      };
    }

    // Phone pattern (digits, spaces, hyphens, parentheses, +)
    const phonePattern = /^[\d\s+\-()]{7,}$/;
    if (phonePattern.test(contact)) {
      return {
        href: `tel:${contact.replace(/\D/g, '')}`, // Remove non-digits for tel: protocol
        label: "Call",
        type: "phone"
      };
    }

    // Website/URL pattern
    if (contact.includes(".") && (contact.includes("http://") || contact.includes("https://") || contact.includes("linkedin.com") || contact.includes("www."))) {
      const url = contact.startsWith("http://") || contact.startsWith("https://") 
        ? contact 
        : contact.startsWith("www.") 
          ? `https://${contact}`
          : `https://${contact}`;
      return {
        href: url,
        label: "Visit",
        type: "url"
      };
    }

    // If it starts with a URL-like pattern but doesn't have protocol
    if (contact.includes(".") && !contact.includes("@")) {
      return {
        href: `https://${contact}`,
        label: "Visit",
        type: "url"
      };
    }

    // Fallback to generic contact
    return {
      href: `https://${contact}`,
      label: "Contact",
      type: "unknown"
    };
  };

  // Filter jobs based on search query and selected KPI card.
const filteredJobs = useMemo(() => trackedJobs
  .filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.requirements &&
        job.requirements.some(r =>
          r.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    if (!matchesSearch) return false;

    // Existing Job Tracker tabs
    if (activeTab === "Saved") return job.status === "saved";
    if (activeTab === "Applied") return job.status === "applied";
    if (activeTab === "Follow Up") return !!job.next_follow_up_date;
    if (activeTab === "Interview") return job.status === "interview";

    // KPI cards filter jobs based on the selected KPI.
    if (jobKpiFilter === "appliedToday") {
      const today = new Date().toISOString().split("T")[0];
      return job.status === "applied" && job.appliedDate === today;
    }

    if (jobKpiFilter === "followUps") {
      return !!job.next_follow_up_date;
    }

    // Connections KPI focuses the tracker on jobs that have at least one contact.
    if (jobKpiFilter === "connections") {
      return (job.connections || []).some((connection) =>
        Boolean(connection.name || connection.title || connection.emailOrLinkedIn || connection.email || connection.mobileNumber)
      );
    }

    if (jobKpiFilter === "interviews") {
      return job.status === "interview";

    }

    if (jobKpiFilter === "offers") {
      return job.status === "offer";
    }

    if (jobKpiFilter === "rejections") {
      return job.status === "rejected";
    }

    // Show all jobs when no KPI card is selected.
    return true;
  })
  .sort((a, b) => {
    // Sort by appliedDate in descending order (newest first).
    const dateA = a.appliedDate || "1970-01-01";
    const dateB = b.appliedDate || "1970-01-01";

    return dateB.localeCompare(dateA);
  }),
  [trackedJobs, searchQuery, activeTab, jobKpiFilter]
);

  // Reset to page 1 when search or tab changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedJobs = useMemo(() => filteredJobs.slice(startIndex, endIndex), [filteredJobs, startIndex, endIndex]);

  // Calculate metrics
  const savedCount = trackedJobs.filter((job) => job.status === "saved").length;
  const appliedCount = trackedJobs.filter((job) =>
    ["applied", "call_received", "interview", "offer"].includes(job.status) ||
    (!!(job.next_follow_up_date || job.follow_up_date) && !["saved", "rejected"].includes(job.status))
  ).length;
  const callReceivedCount = trackedJobs.filter((job) => job.callReceived === true).length;
  const connectionCount = trackedJobs.reduce(
    (total, job) =>
      total +
        (job.connections || []).filter((connection) =>
          Boolean(connection.name || connection.title || connection.emailOrLinkedIn || connection.email || connection.mobileNumber)
        ).length,
    0
  );
  // const proofCount = trackedJobs.filter((job) => (job.proofHistory && job.proofHistory.length > 0) || (job.proofs && job.proofs.screenshots.length > 0)).length;

  return (
    <div className="min-h-dvh h-full bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-300 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-[#0a0a0a] px-4 sm:px-6 py-4 sm:py-5 flex-shrink-0 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[#888] text-[10px] font-bold uppercase tracking-wider mb-1">
            Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Application Tracker
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <button
            onClick={onLogout}
            className="flex items-center text-[#888] hover:text-white bg-transparent border border-[#222] hover:bg-[#1a1a1a] rounded-md px-3 py-1.5 transition-colors duration-300 text-sm font-semibold"
          >
            <span className="mr-2">~</span>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto min-h-0">
        <div className="max-w-[1600px] mx-auto w-full flex flex-col lg:flex-row px-4 sm:px-6 lg:px-10 py-4 sm:py-6 gap-6 min-h-full">


          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Pipeline Overview */}
            <div className="flex-shrink-0 mb-6 bg-[#111] border border-[#222] rounded-xl p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-8">
              <div className="flex-1 max-w-xl">
                <span className="text-[#888] text-[10px] font-bold uppercase tracking-wider mb-2 block">
                  Pipeline Overview
                </span>
                <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight mb-3">
                  Track every role from first click to final proof.
                </h2>
                <p className="text-[#888] text-sm leading-relaxed">
                  Keep applications, contacts, evidence, and next actions visible without losing the calm dashboard feel.
                </p>
              </div>
              <div className="grid w-full grid-cols-3 gap-3 lg:flex lg:w-auto lg:items-center lg:gap-4">
                {/* Job Applied Card */}
                <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-5 min-w-[120px] flex-1 lg:flex-none">
                  <span className="text-[#888] text-[10px] font-bold uppercase tracking-wider block mb-2">JOB APPLIED</span>
                  <span className="text-2xl sm:text-3xl font-bold text-white">{appliedCount}</span>
                </div>
                {/* Saved Card */}
                <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-5 min-w-[120px] flex-1 lg:flex-none">
                  <span className="text-[#888] text-[10px] font-bold uppercase tracking-wider block mb-2">SAVED</span>
                  <span className="text-2xl sm:text-3xl font-bold text-white">{savedCount}</span>
                </div>
                {/* Total call received card */}
                <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-5 min-w-[120px] flex-1 lg:flex-none">
                  <span className="text-[#888] text-[10px] font-bold uppercase tracking-wider block mb-2">TOTAL CALL RECEIVED</span>
                  <span className="text-3xl font-bold text-white">{callReceivedCount}</span>
                </div>
              </div>
            </div>

            {/* Operations KPIs Dashboard Cards
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                // { title: 'Pending Apply', count: kpis.pendingAdminApply, color: 'text-amber-500' },
                { title: 'Applied Today', count: kpis.appliedToday, color: 'text-[#00C896]' },
                { title: 'Follow-ups Due', count: kpis.followUpDue, color: 'text-rose-500' },
                { title: 'Replies', count: kpis.recruiterReplies, color: 'text-indigo-400' },
                { title: 'Interviews', count: kpis.interviewsScheduled, color: 'text-purple-400' },
                { title: 'Offers', count: kpis.offers, color: 'text-[#00C896] font-extrabold' },
                { title: 'Rejections', count: kpis.rejections, color: 'text-gray-500' },
              ].map((card) => (
                
                <div key={card.title} className="bg-[#111] border border-[#222] rounded-xl p-3 text-center">
                  <span className="text-gray-400 text-[10px] font-semibold uppercase block mb-1 truncate">{card.title}</span>
                  <span className={`text-xl font-bold ${card.color}`}>{card.count}</span>
                </div>
              ))}
            </div> */}

                        {/* Operations KPIs Dashboard Cards */}

            {/* KPI cards are clickable to show related jobs below */}
  <div className="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-3 lg:grid-cols-6">
  {[
  { title: 'Applied Today', count: kpis.appliedToday, color: 'text-[#00C896]', tab: 'appliedToday' },
  { title: 'Follow-ups Due', count: kpis.followUpDue, color: 'text-rose-500', tab: 'followUps' },
  { title: 'Connections', count: connectionCount, color: 'text-indigo-400', tab: 'connections' },
  { title: 'Interviews', count: kpis.interviewsScheduled, color: 'text-purple-400', tab: 'interviews' },
  { title: 'Offers', count: kpis.offers, color: 'text-[#00C896] font-extrabold', tab: 'offers' },
  { title: 'Rejections', count: kpis.rejections, color: 'text-gray-500', tab: 'rejections' },
].map((card) => (
        <button
      key={card.title}
      onClick={() => setJobKpiFilter(card.tab)}
      className="bg-[#111] border border-[#222] rounded-xl p-3 text-center hover:border-[#00C896] transition-colors cursor-pointer"
    >
      <span className="text-gray-400 text-[10px] font-semibold uppercase block mb-1 truncate">
        {card.title}
      </span>

      <span className={`text-xl font-bold ${card.color}`}>
        {card.count}
      </span>
    </button>
  ))}
 </div> 

            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 w-full lg:max-w-2xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#888] w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search jobs, companies, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 bg-[#111] border border-[#222] text-white placeholder:text-[#888] rounded-lg h-10 w-full focus-visible:ring-1 focus-visible:ring-[#00C896] focus-visible:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                <div className="flex items-center gap-1 bg-[#111] border border-[#222] rounded-lg p-1">
                  {["All", "Saved", "Applied", "Follow Up", "Interview"].map((tab) => (
                    <button
                      key={tab}
                      // onClick={() => setActiveTab(tab)} 
                      onClick={() => {setActiveTab(tab); setJobKpiFilter("");}}
                      className={`px-4 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${
                        activeTab === tab
                          ? "bg-[#00C896] text-black"
                          : "text-[#888] hover:text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <Button
                  variant="primary"
                  onClick={() => {
                    resetJobForm();
                    setShowAddJobDialog(true);
                  }}
                  className="bg-[#00C896] hover:bg-[#00b386] text-black font-semibold h-[38px] px-5 rounded-lg flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Job</span>
                </Button>
              </div>
            </div>

            {/* Scrollable Table Container */}
            <div className="flex-none min-h-[360px] lg:min-h-[420px] bg-white dark:bg-black rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col transition-colors duration-300">
              <div className="flex-1 overflow-auto bg-[#0a0a0a] lg:bg-transparent rounded-xl">
                {/* Desktop Table */}
                <div className="hidden lg:block w-full min-w-0">
                  <table className="w-full table-fixed border-collapse">
                    <colgroup>
                      <col className="w-[16%]" />
                      <col className="w-[13%]" />
                      <col className="w-[13%]" />
                      <col className="w-[11%]" />
                      <col className="w-[18%]" />
                      <col className="w-[10%]" />
                      <col className="w-[8%]" />
                      <col className="w-[6%]" />
                      <col className="w-[5%]" />
                    </colgroup>
                    <thead className="bg-[#111] sticky top-0 z-10 border-b border-[#222]">
                      <tr>
                        <th className="px-4 py-4 text-left text-[10px] font-bold text-[#888] uppercase tracking-wider">JOB</th>
                        <th className="px-4 py-4 text-left text-[10px] font-bold text-[#888] uppercase tracking-wider">COMPANY</th>
                        <th className="px-4 py-4 text-left text-[10px] font-bold text-[#888] uppercase tracking-wider">SKILLS</th>
                        <th className="px-4 py-4 text-left text-[10px] font-bold text-[#888] uppercase tracking-wider">STATUS</th>
                        <th className="px-4 py-4 text-left text-[10px] font-bold text-[#888] uppercase tracking-wider">CONNECTIONS</th>
                        <th className="px-4 py-4 text-left text-[10px] font-bold text-[#888] uppercase tracking-wider">FOLLOW-UP DATE</th>
                        <th className="px-4 py-4 text-left text-[10px] font-bold text-[#888] uppercase tracking-wider">FOLLOW-UP COUNT</th>
                        <th className="px-4 py-4 text-left text-[10px] font-bold text-[#888] uppercase tracking-wider">PROOF</th>
                        <th className="px-4 py-4 text-right text-[10px] font-bold text-[#888] uppercase tracking-wider">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                      {paginatedJobs.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-5 py-12 text-center text-[#888]">
                            <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>{filteredJobs.length === 0 ? "No jobs found. Add your first job to get started." : "No jobs on this page."}</p>
                          </td>
                        </tr>
                      ) : (
                        paginatedJobs.map((job, index) => (
                          <tr
                        key={job.id}
                          className="hover:bg-[#111] transition-colors duration-200"

                            // onClick={(e) => {
                            //   const target = e.target as HTMLElement;
                            //   if (
                            //     target.closest('button') ||
                            //     target.closest('select') ||
                            //     target.closest('a') ||
                            //     target.closest('[role="combobox"]') ||
                            //     target.closest('.proof-upload-btn')
                            //   ) {
                            //     return;
                            //   }
                            //   setSelectedUserJob(job);
                            // }}
                          >
                            {/* JOB */}
                            <td className="px-4 py-4 align-top break-words">
                              <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-[#1a2e26] text-[#00C896] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                  {String(startIndex + index + 1).padStart(2, '0')}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
                                    <span
                                        className="cursor-pointer hover:text-[#00C896] transition-colors"
                                          onClick={() => setSelectedUserJob(job)}
                                    >
                                    {job.title}
                                    </span>
                                    {job.jobUrl && (
                                      <a
                                        href={job.jobUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#00C896] hover:text-[#00b386] cursor-pointer inline-flex items-center"
                                        title="Open External Application Link"
                                      >
                                        <ExternalLink size={12} />
                                      </a>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-[#888]">{job.appliedDate ? `Applied ${formatAppliedDate(job.appliedDate)}` : "Not applied yet"}</div>
                                </div>
                              </div>
                            </td>
                            {/* COMPANY */}
                            <td className="px-4 py-4 align-top break-words">
                              <div className="font-bold text-white text-sm mb-2">{job.company}</div>
                              {job.location && (
                                <span className="bg-[#222] text-[#888] text-[10px] px-2 py-0.5 rounded-full inline-block">
                                  {job.location}
                                </span>
                              )}
                            </td>
                            {/* SKILLS */}
                            <td className="px-4 py-4 align-top break-words">
                              <div className="flex flex-wrap gap-1.5">
                                {splitSkills(job.requirements?.length ? job.requirements : job.keyResponsibilities).length > 0 ? (
                                  splitSkills(job.requirements?.length ? job.requirements : job.keyResponsibilities).slice(0, 6).map((skill, i) => (
                                    <span key={i} className="max-w-full bg-[#222] text-[#ccc] text-[10px] px-2 py-0.5 rounded-full whitespace-normal break-words">
                                      {skill}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[#888] text-xs italic">No skills listed</span>
                                )}
                              </div>
                            </td>
                            {/* STATUS */}
                            <td className="px-4 py-4 align-top">
                              {isChangingStatus === job.id ? (
                                <div className="flex items-center gap-1.5 text-xs text-[#888]">
                                  <Loader className="w-3.5 h-3.5 animate-spin" />
                                  <span>Updating...</span>
                                </div>
                              ) : (
                                <Select
                                  value={job.status}
                                  onValueChange={(val) => handleStatusChange(job.id, val as TrackedJob["status"])}
                                >
                                  <SelectTrigger className="h-8 bg-white text-black border-none text-[11px] font-bold rounded-full capitalize px-3 py-1 focus:ring-0 focus:ring-offset-0 focus:outline-none w-auto flex gap-1 items-center">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-black border border-[#222] text-white">
                                    <SelectItem value="saved" className="text-white hover:bg-[#222]">Saved</SelectItem>
                                    <SelectItem value="applied" className="text-white hover:bg-[#222]">Applied</SelectItem>
                                    <SelectItem value="call_received" className="text-white hover:bg-[#222]">Call Received</SelectItem>
                                    <SelectItem value="interview" className="text-white hover:bg-[#222]">Interviewing</SelectItem>
                                    <SelectItem value="offer" className="text-white hover:bg-[#222]">Offer</SelectItem>
                                    <SelectItem value="rejected" className="text-white hover:bg-[#222]">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </td>
                            {/* CONNECTIONS */}
                            <td className="px-4 py-4 align-top break-words">
                              {job.connections && job.connections.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {job.connections.map((conn, i) => (
                                    <div key={i} className="text-[#888] text-xs flex flex-col mb-1">
                                      <span className="text-white font-medium">{connectionPrimary(conn)}</span>
                                      {connectionDetails(conn).map((detail) => (
                                        <span key={detail} className="break-all">{detail}</span>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[#888] text-xs">No connections</span>
                              )}
                            </td>
                            {/* FOLLOW-UP DATE */}
                            <td className="px-4 py-4 align-top">
                              <span className="text-sm text-white">
                                {job.follow_up_date ? formatFollowUpDate(job.follow_up_date) : (job.next_follow_up_date ? formatFollowUpDate(job.next_follow_up_date) : "—")}
                              </span>
                            </td>
                            {/* FOLLOW-UP COUNT */}
                            <td className="px-5 py-4 align-top">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-white">
                                  {job.follow_up_count ?? 0}
                                </span>

                                {Boolean(job.operator_notes?.trim()) && (
                                  <button
                                    type="button"
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                      e.stopPropagation();
                                      setSelectedOperatorNote((job.operator_notes ?? "").trim());
                                    }}
                                    className="text-[#00C896] hover:text-[#00b386] cursor-pointer"
                                    title="View Operator Note"
                                  >
                                    📝
                                  </button>
                                )}
                              </div>
                            </td>
                            {/* PROOF */}
                            <td className="px-5 py-4 align-top">
                              {job.proofs && job.proofs.screenshots && (job.proofs.screenshots as any).length > 0 ? (
                                <button
                                  onClick={() => {
                                    let screenshotUrl = '';
                                    if (typeof job.proofs!.screenshots === 'string') {
                                      screenshotUrl = (job.proofs!.screenshots as string).split(',')[0].trim();
                                    } else if (Array.isArray(job.proofs!.screenshots)) {
                                      screenshotUrl = (job.proofs!.screenshots as string[])[0];
                                    }
                                    if (screenshotUrl) handleOpenProof(screenshotUrl);
                                  }}
                                  className="text-xs bg-[#222] hover:bg-[#333] text-white px-3 py-1.5 rounded-md font-semibold transition-colors"
                                >
                                  View
                                </button>
                              ) : (
                                <span className="text-[#888] text-xs">No proofs</span>
                              )}
                            </td>
                            {/* ACTIONS */}
                            <td className="px-5 py-4 align-top text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button onClick={() => loadJobForEditing(job)} className="text-[#888] hover:text-white transition-colors" title="Edit">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteJob(job.id, job.user_job_id)} className="text-[#888] hover:text-red-500 transition-colors" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="lg:hidden flex flex-col divide-y divide-[#222] border-t border-[#222]">
                  {paginatedJobs.length === 0 ? (
                    <div className="p-8 text-center text-[#888]">
                      <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>{filteredJobs.length === 0 ? "No jobs found." : "No jobs on this page."}</p>
                    </div>
                  ) : (
                    paginatedJobs.map((job, index) => (
                      <div key={job.id} className="p-5 flex flex-col gap-4 hover:bg-[#111] transition-colors duration-200">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="font-bold text-white text-base mb-1 flex items-center gap-1.5">
                              {job.title}
                              {job.jobUrl && (
                                <a
                                  href={job.jobUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#00C896] hover:text-[#00b386] cursor-pointer inline-flex items-center"
                                  title="Open External Application Link"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                            <div className="font-semibold text-[#00C896] text-sm mb-2">{job.company}</div>
                            <div className="text-xs text-[#888]">
                              {job.appliedDate ? `Applied ${formatAppliedDate(job.appliedDate)}` : "Not applied yet"}
                            </div>
                          </div>
                          {isChangingStatus === job.id ? (
                            <div className="flex items-center gap-1.5 text-xs text-[#888] shrink-0">
                              <Loader className="w-3.5 h-3.5 animate-spin" />
                            </div>
                          ) : (
                            <Select
                              value={job.status}
                              onValueChange={(val) => handleStatusChange(job.id, val as TrackedJob["status"])}
                            >
                              <SelectTrigger className="h-7 bg-white text-black border-none text-[10px] font-bold rounded-full capitalize px-2.5 py-0.5 focus:ring-0 focus:ring-offset-0 focus:outline-none w-auto flex gap-1 items-center shrink-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-black border border-[#222] text-white">
                                <SelectItem value="saved" className="text-white hover:bg-[#222]">Saved</SelectItem>
                                <SelectItem value="applied" className="text-white hover:bg-[#222]">Applied</SelectItem>
                                <SelectItem value="call_received" className="text-white hover:bg-[#222]">Call Received</SelectItem>
                                <SelectItem value="interview" className="text-white hover:bg-[#222]">Interviewing</SelectItem>
                                <SelectItem value="offer" className="text-white hover:bg-[#222]">Offer</SelectItem>
                                <SelectItem value="rejected" className="text-white hover:bg-[#222]">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => loadJobForEditing(job)} className="text-xs bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-md font-semibold transition-colors flex-1 text-center">
                            Edit
                          </button>
                          {job.proofs && job.proofs.screenshots && (job.proofs.screenshots as any).length > 0 && (
                            <button
                                  onClick={() => {
                                    let screenshotUrl = '';
                                    if (typeof job.proofs!.screenshots === 'string') {
                                      screenshotUrl = (job.proofs!.screenshots as string).split(',')[0].trim();
                                    } else if (Array.isArray(job.proofs!.screenshots)) {
                                      screenshotUrl = (job.proofs!.screenshots as string[])[0];
                                    }
                                    if (screenshotUrl) handleOpenProof(screenshotUrl);
                                  }}
                                  className="text-xs bg-[#00C896] hover:bg-[#00b386] text-black px-4 py-2 rounded-md font-semibold transition-colors flex-1 text-center"
                                >
                                  Proof
                            </button>
                          )}
                          <button onClick={() => handleDeleteJob(job.id, job.user_job_id)} className="text-[#888] hover:text-red-500 transition-colors p-2" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="bg-[#0a0a0a] lg:bg-transparent border-t border-[#222] px-4 lg:px-6 py-4 flex items-center justify-between transition-colors duration-300">
                  <div className="text-xs text-[#888] transition-colors duration-300">
                    Showing <span className="font-semibold text-white">{startIndex + 1}</span> to <span className="font-semibold text-white">{Math.min(endIndex, filteredJobs.length)}</span> of <span className="font-semibold text-white">{filteredJobs.length}</span> jobs
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="border-[#222] text-[#888] hover:text-white hover:bg-[#111] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1 overflow-x-auto max-w-xs lg:max-w-lg px-2 py-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "primary" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-10 h-10 p-0 transition-colors duration-300 flex-shrink-0 ${
                            currentPage === page
                              ? "bg-[#00C896] hover:bg-[#00b386] text-black border-none"
                              : "border-[#222] text-[#888] hover:text-white hover:bg-[#111]"
                          }`}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="border-[#222] text-[#888] hover:text-white hover:bg-[#111] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Job Dialog */}
      <Dialog
        open={showAddJobDialog || !!selectedJobForEdit}
        onOpenChange={(open: boolean) => {
          // Allow closing when the user clicks the X button or Cancel
          if (!open) {
            setShowAddJobDialog(false);
            setSelectedJobForEdit(null);
            resetJobForm();
          }
        }}
      >
        <DialogContent 
          className="w-[calc(100vw-1rem)] sm:max-w-7xl max-h-[90dvh] overflow-y-auto bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 transition-colors duration-300 shadow-2xl"
          onInteractOutside={(e: any) => e.preventDefault()}
          onEscapeKeyDown={(e: any) => e.preventDefault()}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white transition-colors duration-300">
                  {selectedJobForEdit ? "Edit Job" : "Add New Job"}
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  {selectedJobForEdit
                    ? "Update the job details"
                    : "Fill in the details for the job you want to track"}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-900 dark:text-white transition-colors duration-300">Job Title *</Label>
                <Input
                  id="title"
                  value={jobForm.title}
                  onChange={(e) =>
                    setJobForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Senior Software Engineer"
                  className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-jobright-teal dark:focus:ring-neon-green transition-colors duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-gray-900 dark:text-white transition-colors duration-300">Company *</Label>
                <Input
                  id="company"
                  value={jobForm.company}
                  onChange={(e) =>
                    setJobForm((prev) => ({ ...prev, company: e.target.value }))
                  }
                  placeholder="e.g. Google"
                  className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-jobright-teal dark:focus:ring-neon-green transition-colors duration-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-900 dark:text-white transition-colors duration-300">Location/Remote</Label>
                <Input
                  id="location"
                  value={jobForm.location}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-jobright-teal dark:focus:ring-neon-green transition-colors duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobType" className="text-gray-900 dark:text-white transition-colors duration-300">Job Type</Label>
                <Select
                  value={jobForm.jobType}
                  onValueChange={(value: string) =>
                    setJobForm((prev) => ({ ...prev, jobType: value }))
                  }
                >
                  <SelectTrigger className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white transition-colors duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-white/10 transition-colors duration-300">
                    <SelectItem value="Full-time" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300">Full-time</SelectItem>
                    <SelectItem value="Part-time" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300">Part-time</SelectItem>
                    <SelectItem value="Contract" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300">Contract</SelectItem>
                    <SelectItem value="Freelance" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300">Freelance</SelectItem>
                    <SelectItem value="Internship" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary" className="text-gray-900 dark:text-white transition-colors duration-300">Salary</Label>
                <Input
                  id="salary"
                  value={jobForm.salary}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      salary: e.target.value,
                    }))
                  }
                  placeholder="e.g. $120,000 or 120000"
                  className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-jobright-teal dark:focus:ring-neon-green transition-colors duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-gray-900 dark:text-white transition-colors duration-300">Experience Required</Label>
                <Input
                  id="experience"
                  value={jobForm.experience}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      experience: e.target.value,
                    }))
                  }
                  placeholder="e.g. 3-5 years"
                  className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-jobright-teal dark:focus:ring-neon-green transition-colors duration-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyResponsibilities" className="text-gray-900 dark:text-white transition-colors duration-300">
                Key Roles / Skills
              </Label>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  Add skills that define the job requirements
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  {jobForm.keyResponsibilities.length} / 15
                </span>
              </div>

              {/* Current Skills */}
              {jobForm.keyResponsibilities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {jobForm.keyResponsibilities.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 pl-3 pr-2 py-1.5 text-sm rounded-full transition-colors duration-300"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 p-0.5 rounded-full hover:bg-gray-300 dark:hover:bg-white/20 transition-colors duration-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Autocomplete dropdown */}
              <Popover open={skillPopoverOpen} onOpenChange={setSkillPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    role="combobox"
                    aria-expanded={skillPopoverOpen}
                    disabled={jobForm.keyResponsibilities.length >= 15}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-white/50 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 text-sm"
                  >
                    <span className="text-gray-400 dark:text-gray-500 transition-colors duration-300">
                      {jobForm.keyResponsibilities.length >= 15 ? 'Maximum skills reached (15/15)' : 'Search and select skills...'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-[min(400px,calc(100vw-2rem))] p-0 bg-white dark:bg-black border-gray-200 dark:border-white/10 transition-colors duration-300 shadow-xl" 
                  align="start"
                  sideOffset={5}
                  style={{ zIndex: 9999 }}
                >
                  <Command className="bg-white dark:bg-black transition-colors duration-300">
                    <CommandInput placeholder="Search skills..." className="dark:text-white dark:placeholder:text-gray-500 border-0" />
                    <CommandList className="bg-white dark:bg-black transition-colors duration-300 max-h-[300px]">
                      <CommandEmpty className="text-gray-600 dark:text-gray-400 transition-colors duration-300 py-6 text-center">No skill found.</CommandEmpty>
                      <CommandGroup className="p-1">
                        {allSkills
                          .filter(skill => !jobForm.keyResponsibilities.includes(skill))
                          .map((skill) => (
                            <CommandItem
                              key={skill}
                              value={skill}
                              onSelect={(currentValue: string) => {
                                addCustomSkill(currentValue);
                                setSkillPopoverOpen(false);
                              }}
                              className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer px-2 py-1.5 rounded-md transition-colors duration-300 aria-selected:bg-gray-100 dark:aria-selected:bg-white/10"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  jobForm.keyResponsibilities.includes(skill) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {skill}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Custom skill input */}
              <form onSubmit={handleCustomSkillSubmit}>
                <Input
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  disabled={jobForm.keyResponsibilities.length >= 15}
                  placeholder={jobForm.keyResponsibilities.length >= 15 ? 'Maximum skills reached' : 'Or type a custom skill and press Enter'}
                  className="bg-white/50 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-600 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-jobright-teal dark:focus:ring-neon-green transition-colors duration-300"
                />
              </form>
              
              {jobForm.keyResponsibilities.length >= 15 && (
                <p className="text-sm text-amber-600 dark:text-amber-400 transition-colors duration-300">
                  You've reached the maximum of 15 skills. Remove a skill to add a new one.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobUrl" className="text-gray-900 dark:text-white transition-colors duration-300">Application Website / URL</Label>
              <Input
                id="jobUrl"
                value={jobForm.jobUrl}
                onChange={(e) =>
                  setJobForm((prev) => ({ ...prev, jobUrl: e.target.value }))
                }
                placeholder="https://example.com/careers/job-posting"
                className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-jobright-teal dark:focus:ring-neon-green transition-colors duration-300 w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                <Label
                  htmlFor="status"
                  className="text-gray-900 dark:text-white transition-colors duration-300"
                >
                  Status
                </Label>

                <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={jobForm.callReceived}
                    disabled={jobForm.callReceived}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const shouldSetStatus = checked && !callReceivedShortcutUsed.current;
                      callReceivedShortcutUsed.current = true;
                      setJobForm((prev) => ({
                        ...prev,
                        callReceived: checked,
                        ...(shouldSetStatus ? { status: "call_received" as TrackedJob["status"] } : {}),
                      }));
                    }}
                    className="h-4 w-4 cursor-pointer"
                  />
                  Total Call Received
                </label>
              </div>
                <Select
                  value={jobForm.status}
                  onValueChange={(value: TrackedJob["status"]) => {
                    callReceivedShortcutUsed.current = true;
                    setJobForm((prev) => ({ ...prev, status: value }));
                  }}
                >
                  <SelectTrigger className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white transition-colors duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-white/10 transition-colors duration-300">
                    <SelectItem value="saved" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300">Saved</SelectItem>
                    <SelectItem value="applied" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300">Applied</SelectItem>
                    <SelectItem value="call_received"className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300">Call Received</SelectItem>
                    <SelectItem value="interview" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300">Interviewing</SelectItem>
                    <SelectItem value="offer" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300">Offer</SelectItem>
                    <SelectItem value="rejected" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="insights" className="text-gray-900 dark:text-white transition-colors duration-300">
                  Job Description / Insights about the Company
                </Label>
                <div className="flex bg-gray-200 dark:bg-white/5 rounded-lg p-0.5 border border-gray-300 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveInsightsTab('edit')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      activeInsightsTab === 'edit'
                        ? 'bg-[#00C896] text-black font-bold shadow'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveInsightsTab('preview')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      activeInsightsTab === 'preview'
                        ? 'bg-[#00C896] text-black font-bold shadow'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {activeInsightsTab === 'edit' ? (
                <Textarea
                  id="insights"
                  value={jobForm.insights}
                  onChange={(e) =>
                    setJobForm((prev) => ({ ...prev, insights: e.target.value }))
                  }
                  placeholder="Paste job description, company culture, values, recent news, or any insights about the role..."
                  className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-jobright-teal dark:focus:ring-neon-green transition-colors duration-300 min-h-[300px] max-h-[600px] resize-vertical"
                />
              ) : (
                <div 
                  className="bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-md p-3 min-h-[300px] max-h-[600px] overflow-y-auto text-xs text-gray-800 dark:text-gray-200 leading-relaxed space-y-2"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#222 transparent'
                  }}
                >
                  {!jobForm.insights?.trim() ? (
                    <p className="text-gray-400 italic">No description or insights provided yet.</p>
                  ) : jobForm.insights.includes('<') && jobForm.insights.includes('>') ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: jobForm.insights }} 
                      className="space-y-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_h1]:text-sm [&_h1]:font-bold [&_h2]:text-xs [&_h2]:font-bold"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{jobForm.insights}</p>
                  )}
                </div>
              )}
            </div>

            {/* Generate Resume — uses the JD above + the candidate's profile */}
            <div className="rounded-lg border border-dashed border-[var(--color-jobright-teal)]/40 dark:border-neon-green/30 bg-[var(--color-jobright-teal)]/5 dark:bg-neon-green/5 p-4 transition-colors duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--color-jobright-teal)] dark:text-neon-green" />
                    Generate resume &amp; cover letter
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Uses this job description and your profile to build a tailored resume and cover letter you can preview and download as PDF.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleGenerateResume}
                  disabled={isGeneratingResume || !jobForm.insights?.trim()}
                  className="flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {isGeneratingResume ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isGeneratingResume ? "Generating..." : "Generate Resume & Cover Letter"}
                </Button>
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proofFiles" className="text-gray-900 dark:text-white transition-colors duration-300">Add Proofs (Screenshots, etc.)</Label>
                <input
                  id="proofFiles"
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const fileUrls = files.map(file => URL.createObjectURL(file));
                    setJobForm((prev) => ({
                      ...prev,
                      proofs: {
                        ...(prev.proofs || { screenshots: [], remarks: '' }),
                        screenshots: [
                          ...(prev.proofs?.screenshots || []),
                          ...fileUrls
                        ]
                      }
                    }));
                    // Store actual File objects for upload
                    setJobFormFiles((prev) => ({
                      ...prev,
                      proofFiles: [...prev.proofFiles, ...files]
                    }));
                  }}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[var(--color-jobright-teal)] dark:file:bg-neon-green
                    file:text-white dark:file:text-black
                    hover:file:opacity-80
                    transition-colors duration-300"
                />
                {jobForm.proofs?.screenshots && jobForm.proofs.screenshots.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      ✓ {jobForm.proofs.screenshots.length} file(s) added
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {typeof jobForm.proofs.screenshots === 'string'
                        ? (jobForm.proofs.screenshots as string).split(',').filter((url: string) => url.trim()).map((url: string, idx: number) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleOpenProof(url.trim())}
                              className="text-xs text-[var(--color-jobright-teal)] dark:text-neon-green hover:underline cursor-pointer"
                            >
                              Proof {idx + 1}
                            </button>
                          ))
                        : (jobForm.proofs.screenshots as any[]).map((url: string, idx: number) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleOpenProof(url)}
                              className="text-xs text-[var(--color-jobright-teal)] dark:text-neon-green hover:underline cursor-pointer"
                            >
                              Proof {idx + 1}
                            </button>
                          ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="resumeFile" className="text-gray-900 dark:text-white transition-colors duration-300">Add Resume/CV</Label>
                <input
                  id="resumeFile"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const fileUrl = URL.createObjectURL(file);
                      setJobForm((prev) => ({
                        ...prev,
                        resumeUrl: fileUrl,
                        resumeFileName: file.name
                      }));
                      // Store actual File object for upload
                      setJobFormFiles((prev) => ({
                        ...prev,
                        resumeFile: file
                      }));
                    }
                  }}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[var(--color-jobright-teal)] dark:file:bg-neon-green
                    file:text-white dark:file:text-black
                    hover:file:opacity-80
                    transition-colors duration-300"
                />
                {(jobForm.resumeFileName || jobForm.resumeUrl) && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      ✓ {jobForm.resumeFileName || jobForm.resumeUrl.split('/').pop() || 'Resume'}
                    </p>
                    {(jobForm.resumeFileName || jobForm.resumeUrl) && (
                      <button
                        type="button"
                        onClick={() => handleOpenResume(jobForm.resumeFileName || jobForm.resumeUrl)}
                        className="text-xs text-[var(--color-jobright-teal)] dark:text-neon-green hover:underline inline-block cursor-pointer"
                      >
                        View Resume
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-900 dark:text-white transition-colors duration-300">Connections (up to 5)</Label>
                {jobForm.connections.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addConnection}
                    className="border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Connection
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {jobForm.connections.map((connection, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-3 p-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 transition-colors duration-300 sm:grid-cols-2 xl:grid-cols-[1.5fr_1.5fr_1fr_1fr_auto]"
                  >
                    <Input
                      placeholder="Name"
                      value={connection.name}
                      onChange={(e) =>
                        updateConnection(index, "name", e.target.value)
                      }
                      className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-300"
                    />
                    <Input
                      placeholder="Title / Position"
                      value={connection.title}
                      onChange={(e) =>
                        updateConnection(index, "title", e.target.value)
                      }
                      className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-300"
                    />
                    <Input
                      placeholder="LinkedIn URL"
                      value={connection.emailOrLinkedIn}
                      onChange={(e) =>
                        updateConnection(index, "emailOrLinkedIn", e.target.value)
                      }
                      className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-300"
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={connection.email || ""}
                      onChange={(e) =>
                        updateConnection(index, "email", e.target.value)
                      }
                      className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-300"
                    />
                    <div className="flex flex-col items-end justify-between gap-2">
                      <Input
                        placeholder="Mobile Number"
                        value={connection.mobileNumber || ""}
                        onChange={(e) =>
                          updateConnection(index, "mobileNumber", e.target.value)
                        }
                        className="w-full bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-300"
                      />
                      {jobForm.connections.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConnection(index)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors duration-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks" className="text-gray-900 dark:text-white transition-colors duration-300">Remarks / Notes</Label>
              <Textarea
                id="remarks"
                value={jobForm.remarks}
                onChange={(e) =>
                  setJobForm((prev) => ({ ...prev, remarks: e.target.value }))
                }
                placeholder="Any additional notes, interview feedback, or comments..."
                rows={3}
                className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-jobright-teal dark:focus:ring-neon-green transition-colors duration-300"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-white/10 transition-colors duration-300">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddJobDialog(false);
                setSelectedJobForEdit(null);
                resetJobForm();
              }}
              className="border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={selectedJobForEdit ? updateExistingJob : createAndSaveNewJob}
              disabled={!jobForm.title || !jobForm.company || isSubmittingJob || (selectedJobForEdit !== null && isUpdatingJob === selectedJobForEdit.id)}
              className="flex items-center justify-center gap-2"
            >
              {(isSubmittingJob || (selectedJobForEdit !== null && isUpdatingJob === selectedJobForEdit.id)) && <Loader className="h-4 w-4 animate-spin" />}
              {selectedJobForEdit ? "Update Job" : "Add Job"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generated Resume preview + PDF download.
          key forces a fresh dialog per generation so no state leaks across jobs. */}
      <GeneratedResumeDialog
        key={generationNonce}
        open={showGeneratedResume}
        resume={generatedResume}
        coverLetter={generatedCoverLetter}
        jobContext={generationContext}
        onClose={() => setShowGeneratedResume(false)}
      />

      {selectedUserJob && (
        <ApplicationDrawer
          userJob={selectedUserJob}
          onClose={() => setSelectedUserJob(null)}
          onUpdate={(updatedJob) => {
            if (updatedJob) {
              onUpdateJob(updatedJob.id, updatedJob);
            }
            setSelectedUserJob((prev: TrackedJob | null) => prev ? { ...prev, ...updatedJob } : prev);
          }}
        />
      )}
      {selectedOperatorNote && (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
    onClick={() => setSelectedOperatorNote(null)}
  >
    <div
      className="w-full max-w-md bg-[#111] border border-[#2c2c30] rounded-xl p-5 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">
          Operator Note
        </h3>

        <button
          type="button"
          onClick={() => setSelectedOperatorNote(null)}
          className="text-gray-400 hover:text-white text-lg"
        >
          ×
        </button>
      </div>

      <div className="bg-[#18181b] border border-[#2c2c30] rounded-lg p-3 max-h-80 overflow-y-auto">
        <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
          {selectedOperatorNote}
        </p>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default JobTracker;

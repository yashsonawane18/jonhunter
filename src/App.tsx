import React, { useState, useEffect } from 'react';
import { Briefcase, Compass, Target, TrendingUp, User, Send } from 'lucide-react';
import Home from './components/Home';
import HomeQAtoBA from './components/HomeQAtoBA';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import JobDetailScreen from './components/JobDetailScreen';
import UploadCVScreen from './components/UploadCVScreen';
import SkillsEditScreen from './components/SkillsEditScreen';
import JobDashboard from './components/JobDashboard';
import JobTracker from './components/JobTracker';
import Sidebar from './components/Sidebar';
import WeeklyProgressTracker from './components/WeeklyProgressTracker';
import { useUser } from './contexts/UserContext';
import API_ENDPOINTS from './config/api';
import ProfilePage from './components/ProfilePage';
import { Pricing } from './components/Pricing';
import { Navbar } from './components/home/Navbar';
import { Footer } from './components/home/Footer';
import AICoursePage from './components/home/AICoursePage';
import JobDiscovery from './components/JobDiscovery';
import ReferralJobs from './components/ReferralJobs';
import AuditCallPage from './components/home/AuditCallPage';
import { Toaster } from './components/ui/sonner';
import DiscoveredJobsTrackerComponent from './components/DiscoveredJobsTracker';
import { ErrorBoundary } from './components/ErrorBoundary';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type AppState =
  | 'home'
  | 'qa-to-ba'
  | 'ai-course'
  | 'career-audit'
  | 'signup'
  | 'signin'
  | 'pricing'
  | 'discover'
  | 'job-detail-screen'
  | 'upload-cv'
  | 'skills-edit'
  | 'job-dashboard'
  | 'job-tracker';

// Convert screen state to URL path
const screenToPath = (screen: AppState, dashboardView?: 'jobs' | 'job-tracker' | 'profile' | 'referral-jobs' | 'job-discovery' | 'weekly-progress'): string => {
  if (screen === 'home') return '/';
  if (screen === 'qa-to-ba') return '/qa-to-ba';
  if (screen === 'ai-course') return '/ai-course';
  if (screen === 'career-audit') return '/career-audit';
  if (screen === 'pricing') return '/pricing';
  if (screen === 'signin') return '/signin';
  if (screen === 'signup') return '/signup';
  if (screen === 'discover') return '/discover';
  if (screen === 'job-dashboard') {
    if (dashboardView === 'job-tracker') return '/jobs/tracker';
    if (dashboardView === 'jobs') return '/jobs';
    if (dashboardView === 'job-discovery') return '/jobs/discovery';
    if (dashboardView === 'profile') return '/profile';
    if (dashboardView === 'referral-jobs') return '/referral-jobs';
    return '/dashboard';
  }
  if (screen === 'job-detail-screen') return '/job-detail';
  if (screen === 'upload-cv') return '/upload-cv';
  if (screen === 'skills-edit') return '/skills-edit';
  return '/';
};

// Convert URL path to screen state
const pathToScreen = (path: string): { screen: AppState; dashboardView?: 'jobs' | 'job-tracker' | 'profile' | 'referral-jobs' | 'job-discovery' | 'weekly-progress' } => {
  if (path === '/' || path === '') return { screen: 'home' };
  if (path === '/qa-to-ba') return { screen: 'qa-to-ba' };
  if (path === '/ai-course') return { screen: 'ai-course' };
  if (path === '/career-audit') return { screen: 'career-audit' };
  if (path === '/pricing') return { screen: 'pricing' };
  if (path === '/signin') return { screen: 'signin' };
  if (path === '/signup') return { screen: 'signup' };
  if (path === '/discover' || path === '/find-jobs') return { screen: 'discover' };
  if (path === '/jobs') return { screen: 'discover' };
  if (path === '/jobs/discovery') return { screen: 'job-dashboard', dashboardView: 'job-discovery' };
  if (path === '/jobs/tracker') return { screen: 'job-dashboard', dashboardView: 'job-tracker' };
  if (path === '/profile') return { screen: 'job-dashboard', dashboardView: 'profile' };
  if (path === '/referral-jobs') return { screen: 'job-dashboard', dashboardView: 'referral-jobs' };
  if (path === '/dashboard') return { screen: 'job-dashboard' };
  if (path === '/job-detail') return { screen: 'job-detail-screen' };
  if (path === '/upload-cv') return { screen: 'upload-cv' };
  if (path === '/skills-edit') return { screen: 'skills-edit' };
  return { screen: 'home' };
};

// Screens that require authentication
const AUTHENTICATED_SCREENS: AppState[] = [
  'upload-cv',
  'skills-edit',
];

const DashboardMobileNav: React.FC<{
  currentView: 'jobs' | 'job-tracker' | 'profile' | 'weekly-progress' | 'job-discovery' | 'referral-jobs';
  isPremiumUser: boolean;
  onNavigate: (view: string) => void;
}> = ({ currentView, isPremiumUser, onNavigate }) => {
  const items = [
    { id: 'profile', label: 'Profile', icon: User, show: true },
    { id: 'jobs', label: 'Jobs', icon: Briefcase, show: isPremiumUser },
    { id: 'job-tracker', label: 'Tracker', icon: Target, show: true },
    { id: 'referral-jobs', label: 'Referrals', icon: Send, show: true },
    { id: 'weekly-progress', label: 'Progress', icon: TrendingUp, show: true },
    { id: 'job-discovery', label: 'Discover', icon: Compass, show: true },
  ].filter((item) => item.show);

  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-[80] border-t border-[#222] bg-[#0b0b0b]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-xl grid-flow-col auto-cols-fr gap-1">
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = currentView === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[10px] font-semibold transition-colors ${
                isActive ? 'bg-[#00C896] text-black' : 'text-[#888] hover:bg-[#1a1a1a] hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
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
  emailOrLinkedIn: string;
  email?: string;
  mobileNumber?: string;
}

interface TrackedJob {
  id: string;
  user_job_id?: string;
  job_id?: string;
  title: string;
  company: string;
  location?: string;
  jobType?: string;
  salary?: string;
  experience?: string;
  description?: string;
  keyResponsibilities?: string | string[];
  insights?: string;
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';
  addedTime: string;
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
  last_follow_up_date?: string;
  follow_up_count?: number;
  reminder_status?: string;
  operator_notes?: string;
  user_id?: string;
}

const getInitialRoute = () => {
  const params = new URLSearchParams(window.location.search);
  const screenParam = params.get('screen');
  if (screenParam === 'qa-to-ba' || screenParam === 'ai-course' || screenParam === 'career-audit') {
    return { screen: screenParam as AppState, dashboardView: undefined as 'jobs' | 'job-tracker' | 'profile' | undefined };
  }
  return pathToScreen(window.location.pathname);
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppState>(() => {
    const initial = getInitialRoute();
    // If the user accessed a specific route directly (e.g. /discover, /pricing, /qa-to-ba, /signin), ALWAYS prioritize it
    if (initial.screen !== 'home') {
      return initial.screen;
    }
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      const savedScreen = localStorage.getItem('user_session_screen') as AppState | null;
      if (savedScreen && AUTHENTICATED_SCREENS.includes(savedScreen)) {
        return savedScreen;
      }
      return 'job-dashboard';
    }
    return 'home';
  });
  const [dashboardView, setDashboardView] = useState<'jobs' | 'job-tracker' | 'profile' | 'weekly-progress' | 'job-discovery' | 'referral-jobs'>(() => {
    const initial = getInitialRoute();
    if (initial.dashboardView) {
      return initial.dashboardView;
    }
    const savedDashboardView = localStorage.getItem('user_dashboard_view') as 'jobs' | 'job-tracker' | 'profile' | 'weekly-progress' | 'job-discovery' | 'referral-jobs' | null;
    return savedDashboardView || 'job-tracker';
  });
  const [userJobPreferences, setUserJobPreferences] = useState<any>(null);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>([]);
  // Stores the selected KPI card filter to display only matching jobs
const [jobKpiFilter, setJobKpiFilter] = useState<string>('all');
  
  const [hasRestoredSession, setHasRestoredSession] = useState(false);
  const [hasHandledSessionError, setHasHandledSessionError] = useState(false);

  const { isPremiumUser, isAuthenticated, isLoading, clearUser } = useUser();
  const getSessionToken = () =>
    localStorage.getItem('session_token') ||
    sessionStorage.getItem('session_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    '';

  const isSessionError = (status: number, body: string) =>
    status === 401 ||
    status === 403 ||
    body.toLowerCase().includes('session') ||
    body.toLowerCase().includes('expired') ||
    body.toLowerCase().includes('unauthorized');

  const handleSessionError = () => {
    if (hasHandledSessionError) return;

    setHasHandledSessionError(true);
    setUserJobPreferences(null);
    setUserSkills([]);
    setDashboardView('jobs');
    setTrackedJobs([]);
    setHasRestoredSession(false);
    clearUser();
    localStorage.removeItem('user_dashboard_view');

    // Only redirect to signin if the user is on an authenticated-only screen
    if (currentScreen === 'job-dashboard' || AUTHENTICATED_SCREENS.includes(currentScreen)) {
      setCurrentScreen('signin');
    }
  };

  // Update URL when screen or dashboard view changes
  useEffect(() => {
    const path = screenToPath(currentScreen, dashboardView);
    if (window.location.pathname !== path) {
      window.history.pushState({ screen: currentScreen, dashboardView }, '', path);
    }
    window.gtag?.('config', 'G-7VFQ334X5H', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [currentScreen, dashboardView]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.screen) {
        setCurrentScreen(e.state.screen as AppState);
        if (e.state.dashboardView) {
          setDashboardView(e.state.dashboardView);
        }
      } else {
        const path = window.location.pathname;
        const { screen, dashboardView: view } = pathToScreen(path);
        setCurrentScreen(screen);
        if (view) setDashboardView(view);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle session-expired event globally
  useEffect(() => {
    const handleSessionExpired = () => {
      // Only redirect to signin if user was on a protected authenticated screen
      if (currentScreen === 'job-dashboard' || AUTHENTICATED_SCREENS.includes(currentScreen)) {
        sessionStorage.setItem('session_expired_msg', 'Your session has expired. Please log in again.');
        handleLogout();
      } else {
        clearUser();
      }
    };
    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, [currentScreen]);

  // Restore session and also respect external new-tab program links on mount
  useEffect(() => {
    if (isLoading) return;
    if (hasRestoredSession) return;

    const path = window.location.pathname;
    const { screen: urlScreen, dashboardView: urlDashboardView } = pathToScreen(path);

    // Check if URL has a specific screen
    if (urlScreen !== 'home') {
      setCurrentScreen(urlScreen);
      if (urlDashboardView) {
        setDashboardView(urlDashboardView as 'jobs' | 'job-tracker' | 'profile' | 'weekly-progress' | 'job-discovery');
      }
      setHasRestoredSession(true);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen');
    if (screenParam === 'qa-to-ba' || screenParam === 'ai-course' || screenParam === 'career-audit') {
      setCurrentScreen(screenParam as AppState);
      setHasRestoredSession(true);
      return;
    }

    if (isAuthenticated) {
      const savedScreen = localStorage.getItem('user_session_screen') as AppState | null;
      const savedDashboardView = localStorage.getItem('user_dashboard_view') as 'jobs' | 'job-tracker' | 'profile' | 'weekly-progress' | 'job-discovery' | null;

      if (savedScreen && AUTHENTICATED_SCREENS.includes(savedScreen)) {
        setCurrentScreen(savedScreen);
      } else {
        setCurrentScreen('job-dashboard');
      }

      if (savedDashboardView) {
        setDashboardView(savedDashboardView);
      } else {
        setDashboardView('job-tracker');
      }
    }
    setHasRestoredSession(true);
  }, [isLoading, hasRestoredSession, isAuthenticated]);

  // Persist screen state for authenticated screens
  useEffect(() => {
    if (isAuthenticated && AUTHENTICATED_SCREENS.includes(currentScreen)) {
      localStorage.setItem('user_session_screen', currentScreen);
    }
  }, [currentScreen, isAuthenticated]);

  // Persist dashboard view
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('user_dashboard_view', dashboardView);
    }
  }, [dashboardView, isAuthenticated]);

  // Fetch tracked jobs
  useEffect(() => {
    const user_id = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');

    if (!user_id || currentScreen !== 'job-dashboard') {
      setTrackedJobs([]);
      return;
    }

    const fetchTrackedJobs = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.USER_JOBS_FETCH(user_id), {
          headers: {
            'X-SESSION-TOKEN': getSessionToken(),
          },
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          console.error('Failed to fetch tracked jobs:', errorText || response.statusText);

          if (isSessionError(response.status, errorText)) {
            handleSessionError();
          }

          return;
        }

        const data = await response.json();
        const jobsArray = Array.isArray(data) ? data : (data.jobs || data.data || []);

        const sanitizeValue = (value: any) => {
          if (typeof value === 'string') {
            if (
              value.includes('uj.') ||
              /\bfunction\s*\(/.test(value) ||
              /<script/i.test(value)
            ) {
              return '';
            }
          }
          return value || '';
        };

        const parseAppliedAt = (appliedAt: any): string => {
          if (Array.isArray(appliedAt) && appliedAt.length >= 3) {
            const year = appliedAt[0];
            const month = String(appliedAt[1]).padStart(2, '0');
            const day = String(appliedAt[2]).padStart(2, '0');
            return `${year}-${month}-${day}`;
          } else if (typeof appliedAt === 'string') {
            return appliedAt;
          }
          return new Date().toISOString().split('T')[0];
        };

        const formatKeySkills = (keySkills: any): string => {
          if (Array.isArray(keySkills)) {
            return keySkills.map((skill: any) => sanitizeValue(skill)).join(', ');
          }
          return sanitizeValue(keySkills || '');
        };

        const normalizeConnections = (connections: any): Connection[] => {
          let list = connections;
          if (typeof list === 'string') {
            try {
              list = JSON.parse(list);
            } catch {
              list = [];
            }
          }
          if (!Array.isArray(list)) return [];

          return list
            .map((conn: any) => ({
              name: sanitizeValue(conn?.name),
              title: sanitizeValue(conn?.title || conn?.position),
              emailOrLinkedIn: sanitizeValue(conn?.emailOrLinkedIn || conn?.contact || conn?.linkedin || conn?.linkedIn || conn?.url),
              email: sanitizeValue(conn?.email || conn?.email_address || conn?.email_id),
              mobileNumber: sanitizeValue(conn?.mobileNumber || conn?.mobile || conn?.mobile_number || conn?.mobilenumber || conn?.phone),
            }))
            .filter((conn: Connection) =>
              conn.name || conn.title || conn.emailOrLinkedIn || conn.email || conn.mobileNumber
            );
        };

        const mappedJobs: TrackedJob[] = jobsArray.map((item: any, idx: number) => {
          const jobData = item.job || item;

          return {
            id: jobData.job_id || item.id,
            user_job_id: item.id,
            title: sanitizeValue(jobData.title || jobData.job_title),
            company: sanitizeValue(jobData.company),
            location: sanitizeValue(jobData.location),
            jobType: sanitizeValue(jobData.jobType || jobData.job_type),
            salary: sanitizeValue(jobData.salary || jobData.salary_range || jobData.salaryRange || jobData.salary_min || ''),
            experience: sanitizeValue(jobData.experience || jobData.experience_level || jobData.experienceLevel),
            description: sanitizeValue(jobData.description),
            keyResponsibilities: formatKeySkills(jobData.keyResponsibilities || jobData.key_responsibilities || jobData.key_skills),
            insights: sanitizeValue(jobData.insights),
            status: (item.status || jobData.status || 'saved').toLowerCase() as any,
            callReceived: item.call_received === true || item.callReceived === true,
            addedTime: jobData.addedTime || jobData.added_time || jobData.createdAt || new Date().toLocaleString(),
            appliedDate: parseAppliedAt(jobData.appliedDate || jobData.applied_date || jobData.applied_at),
            matchScore: jobData.matchScore || jobData.match_score || 0,
            requirements: Array.isArray(jobData.requirements)
              ? jobData.requirements.map((req: any) => sanitizeValue(req))
              : jobData.required_skill
              ? [sanitizeValue(jobData.required_skill)]
              : Array.isArray(jobData.key_skills)
              ? jobData.key_skills.map((skill: any) => sanitizeValue(skill))
              : [],
            jobUrl: sanitizeValue(jobData.jobUrl || jobData.job_url || jobData.application_url),
            connections: normalizeConnections(jobData.connections),
            remarks: sanitizeValue(jobData.remarks),
            proofs: {
              screenshots: item.proof_path
                ? item.proof_path.split(',').map((url: string) => url.trim())
                : jobData.proofs?.screenshots || [],
              remarks: item.proof_remark || jobData.proofs?.remarks || '',
            },
            resumePath: item.resume_path || jobData.resumePath,
            resumeFileName: item.resume_path ? item.resume_path.split('/').pop() : jobData.resumeFileName,
            proofHistory: jobData.proofHistory || jobData.proof_history || [],
            follow_up_date: item.follow_up_date || item.followUpDate || item.next_follow_up_date || '',
            next_follow_up_date: item.next_follow_up_date || '',
            last_follow_up_date: item.last_follow_up_date || '',
            follow_up_count: item.follow_up_count || 0,
            reminder_status: item.reminder_status || '',
            operator_notes: item.operator_notes || '',
            user_id: localStorage.getItem('user_id') || sessionStorage.getItem('user_id') || '',
          };
        });

        setTrackedJobs(mappedJobs);
      } catch (error) {
        console.error('Error fetching tracked jobs:', error);
      }
    };

    fetchTrackedJobs();
  }, [currentScreen, dashboardView]);

  // Handlers
  const handleSignUpSuccess = () => {
    setCurrentScreen('home');
  };

  const handleSignInSuccess = (hasExistingProfile?: boolean) => {
    if (hasExistingProfile) {
      setCurrentScreen('job-dashboard');
      setDashboardView('job-tracker');
    } else {
      setCurrentScreen('job-detail-screen');
    }
  };

  const handleJobDetailComplete = (preferences: any) => {
    setUserJobPreferences(preferences);
    setCurrentScreen('upload-cv');
  };

  const handleCVUploaded = () => {
    setCurrentScreen('skills-edit');
  };

  const handleSkillsConfirmed = (skills: string[]) => {
    setUserSkills(skills);
    setCurrentScreen('job-dashboard');
    setDashboardView('job-tracker');
  };

  const handleLogout = () => {
    setCurrentScreen('signin');
    setUserJobPreferences(null);
    setUserSkills([]);
    setDashboardView('jobs');
    setTrackedJobs([]);
    setHasRestoredSession(false);
    setHasHandledSessionError(false);
    clearUser();
    localStorage.removeItem('user_dashboard_view');
  };

  const handleDashboardNavigation = (view: string) => {
    if (view === 'jobs') setDashboardView('jobs');
    else if (view === 'job-tracker') setDashboardView('job-tracker');
    else if (view === 'profile') setDashboardView('profile');
    else if (view === 'weekly-progress') setDashboardView('weekly-progress');
    else if (view === 'job-discovery') setDashboardView('job-discovery');
    else if (view === 'referral-jobs') setDashboardView('referral-jobs');
  };

  const handleJobApplied = (job: any) => {
    const jobId = job.id || Date.now().toString();

    setTrackedJobs((prev) => {
      let existingJobIndex = prev.findIndex((j) => j.id === jobId);
      if (existingJobIndex === -1 && job.job_id) {
        existingJobIndex = prev.findIndex((j) => j.id === job.job_id);
      }
      if (existingJobIndex === -1) {
        existingJobIndex = prev.findIndex((j) => j.title === job.title && j.company === job.company);
      }
      if (existingJobIndex !== -1) {
        const updatedJobs = [...prev];
        updatedJobs[existingJobIndex] = {
          ...updatedJobs[existingJobIndex],
          status: 'saved' as const,
        };
        return updatedJobs;
      } else {
        const newTrackedJob: TrackedJob = {
          id: jobId,
          title: job.title,
          company: job.company,
          location: job.location,
          jobType: job.jobType,
          salary: job.salary,
          experience: job.experience,
          description: job.description,
          status: 'saved',
          addedTime: new Date().toLocaleString(),
          matchScore: job.matchScore,
          requirements: job.requirements,
          jobUrl: job.jobUrl,
          keyResponsibilities: job.requirements?.join(', ') || '',
          insights: job.insights,
          connections: Array.isArray(job.connections)
            ? job.connections.map((conn: any) => ({
                name: conn.name || '',
                title: conn.title || '',
                emailOrLinkedIn: conn.emailOrLinkedIn || conn.contact || conn.linkedin || conn.linkedIn || conn.url || '',
                email: conn.email || '',
                mobileNumber: conn.mobileNumber || conn.mobile || conn.mobile_number || conn.mobilenumber || conn.phone || '',
              }))
            : [],
        };
        return [...prev, newTrackedJob];
      }
    });

  };

  const handleAddJob = (
    jobData: Omit<TrackedJob, 'id' | 'addedTime'> & { id?: string; addedTime?: string }
  ) => {
    const newJob: TrackedJob = {
      ...jobData,
      id: jobData.id || `tmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedTime: jobData.addedTime || new Date().toLocaleString(),
    };
    setTrackedJobs((prev) => [...prev, newJob]);
  };

  const handleUpdateJob = (jobId: string, updates: Partial<TrackedJob>) => {
    setTrackedJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, ...updates } : job)));
  };

  const handleMoveJob = (jobId: string, newStatus: TrackedJob['status']) => {
    setTrackedJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, status: newStatus } : job)));
  };

  const handleDeleteJob = (jobId: string) => {
    setTrackedJobs((prev) => prev.filter((job) => job.id !== jobId));
  };

  // Navigate to Pricing
  const handleNavigateToPricing = () => setCurrentScreen('pricing');

  // Unified navbar navigation handler (shared across public screens)
  const handleNav = (view: 'home' | 'pricing' | 'login' | 'bapo' | 'ai-course' | 'career-audit' | 'discover') => {
    if (view === 'home') {
      setCurrentScreen('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'pricing') {
      setCurrentScreen('pricing');
    } else if (view === 'discover') {
      setCurrentScreen('discover');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'login') {
      setCurrentScreen('signin');
    } else if (view === 'bapo') {
      // Open qa-to-ba in new tab with full URL
      window.open(`${window.location.origin}/qa-to-ba`, '_blank');
    } else if (view === 'ai-course') {
      // Open ai-course in new tab with full URL
      window.open(`${window.location.origin}/ai-course`, '_blank');
    } else if (view === 'career-audit') {
      // Open career-audit in new tab with full URL
      window.open(`${window.location.origin}/career-audit`, '_blank');
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <>
            {/* No currentView → navbar is transparent at top, turns dark on scroll */}
            <Navbar onNavigate={handleNav} />
            <Home
              onGetStarted={() => setCurrentScreen('signin')}
              onNavigateToQAtoBA={() => setCurrentScreen('qa-to-ba')}
              onNavigateToPricing={handleNavigateToPricing}   // ✅ pass to Home
            />
            <Footer />
          </>
        );
      case 'qa-to-ba':
        return (
          <>
            <Navbar onNavigate={handleNav} currentView="bapo" />
            <HomeQAtoBA
              onGetStarted={() => setCurrentScreen('signin')}
              onNavigateToQAtoBA={() => setCurrentScreen('qa-to-ba')}
              onNavigateToPricing={handleNavigateToPricing}
            />
            <Footer />
          </>
        );
      case 'pricing':
        return (
          <>
            <Navbar onNavigate={handleNav} currentView="pricing" />
            <Pricing
              onNavigateHome={() => handleNav('home')}
              onGetStarted={() => setCurrentScreen('signin')}
            />
            <Footer />
          </>
        );
      case 'ai-course':
        return (
          <>
            <Navbar onNavigate={handleNav} currentView="ai-course" />
            <AICoursePage />
            <Footer />
          </>
        );
      case 'career-audit':
        return (
          <>
            <Navbar onNavigate={handleNav} currentView="career-audit" />
            <AuditCallPage onBack={() => handleNav('home')} />
            <Footer />
          </>
        );
      case 'discover':
        return (
          <>
            <Navbar onNavigate={handleNav} currentView="discover" />
            <div className="min-h-screen bg-black pt-20 pb-10 px-4">
              <DiscoveredJobsTrackerComponent />
            </div>
            <Footer />
          </>
        );
      case 'signup':
        return (
          <SignUp
            onSwitchToSignIn={() => setCurrentScreen('signin')}
            onSignUpSuccess={handleSignUpSuccess}
          />
        );
      case 'signin':
        return (
          <div className="min-h-screen bg-black">
          <SignIn
            onSwitchToSignUp={() => setCurrentScreen('signup')}
            onSignInSuccess={handleSignInSuccess}
          />
          </div>
        );
      case 'job-detail-screen':
        return (
          <JobDetailScreen
            onComplete={handleJobDetailComplete}
            onLogout={handleLogout}
          />
        );
      case 'upload-cv':
        return (
          <UploadCVScreen
            onUploadComplete={handleCVUploaded}
            onLogout={handleLogout}
          />
        );
      case 'skills-edit':
        return (
          <SkillsEditScreen
            initialSkills={userSkills}
            jobPreferences={userJobPreferences}
            onSkillsConfirmed={handleSkillsConfirmed}
            onLogout={handleLogout}
          />
        );
      case 'job-dashboard':
        return (
          <div className="flex h-dvh min-h-dvh bg-black">
            <Sidebar
              isPremiumUser={isPremiumUser}
              onNavigate={handleDashboardNavigation}
              currentView={dashboardView}
            />
            <div className={`flex-1 min-w-0 ${dashboardView === 'jobs' ? 'overflow-y-auto' : 'overflow-hidden'}`}>
              {dashboardView === 'job-tracker' && (
                <JobTracker
                  onLogout={handleLogout}
                  onNavigate={handleDashboardNavigation}
                  trackedJobs={trackedJobs}
                  onAddJob={handleAddJob}
                  onUpdateJob={handleUpdateJob}
                  onMoveJob={handleMoveJob}
                  onDeleteJob={handleDeleteJob}
                  isPremiumUser={isPremiumUser}
                  jobKpiFilter={jobKpiFilter}
                  setJobKpiFilter={setJobKpiFilter}
                />
              )}
              {dashboardView === 'jobs' && isPremiumUser && (
                <JobDashboard
                  userPreferences={userJobPreferences}
                  cvKeywords={userSkills}
                  onLogout={handleLogout}
                  onNavigate={handleDashboardNavigation}
                  onJobApplied={handleJobApplied}
                  isPremiumUser={isPremiumUser}
                />
              )}
              {dashboardView === 'profile' && <ProfilePage onLogout={handleLogout} />}
              {dashboardView === 'weekly-progress' && (
                <WeeklyProgressTracker onLogout={handleLogout} onNavigate={handleDashboardNavigation} />
              )}
              {dashboardView === 'job-discovery' && (
                <JobDiscovery onLogout={handleLogout} onNavigate={handleDashboardNavigation} />
              )}
              {dashboardView === 'referral-jobs' && <ReferralJobs onLogout={handleLogout} />}
            </div>
            <DashboardMobileNav
              currentView={dashboardView}
              isPremiumUser={isPremiumUser}
              onNavigate={handleDashboardNavigation}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="size-full">
      {isLoading ? (
        <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-[var(--color-jobright-teal)] dark:border-neon-green border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      ) : (
        <ErrorBoundary fallbackTitle="Application View Recovered">
          {renderCurrentScreen()}
        </ErrorBoundary>
      )}
      <Toaster richColors position="top-right" />
    </div>
  );
}

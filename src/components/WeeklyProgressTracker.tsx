import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, CheckCircle2, Circle, Search, Save, Calendar, TrendingUp, LogOut, X, Loader, MessageSquare, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import NotificationBell from './NotificationBell';
import { useUser } from '../contexts/UserContext';
import API_ENDPOINTS from '../config/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";

interface WeeklyProgressTrackerProps {
  onLogout: () => void;
  onNavigate?: (screen: string) => void;
}

interface PreviousGoalReview {
  goal: string;
  comment: string;
}

interface WeeklyCheckin {
  id?: string;
  weekNumber: number;
  date: string;
  reportingPeriod?: string;
  status: 'on-track' | 'needs-support' | 'stalled';
  goalsSet: string[];
  progressMade: string;
  nextSteps: string;
  previousGoalReviews: PreviousGoalReview[];
  additionalEmails?: string[];
}

interface UserProfile {
  aspirations: string;
  interests: string[];
  persona: string;
  weeklyReport: string;
  isAdmin: boolean;
}

const getSessionToken = () => {
  if (typeof window === 'undefined') return "";
  return (
    localStorage.getItem("session_token") ||
    sessionStorage.getItem("session_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    ""
  );
};

const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-SESSION-TOKEN": getSessionToken(),
});

const WeeklyProgressTracker: React.FC<WeeklyProgressTrackerProps> = ({ onLogout, onNavigate }) => {
  const apiRequest = async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(url, {
      ...options,
      headers: { ...getHeaders(), ...options.headers },
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = errorText || response.statusText || "API request failed";
      const isSessionError =
        response.status === 401 ||
        response.status === 403 ||
        errorMessage.toLowerCase().includes("session") ||
        errorMessage.toLowerCase().includes("expired") ||
        errorMessage.toLowerCase().includes("unauthorized");

      if (isSessionError) {
        sessionStorage.setItem('session_expired_msg', 'Your session has expired. Please log in again.');
        onLogout();
        throw new Error("SESSION_EXPIRED");
      }

      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null as T;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : (null as T);
  };
  const { user_id } = useUser();
  const [profile, setProfile] = useState<UserProfile>({
    aspirations: '',
    interests: [],
    persona: '',
    weeklyReport: '',
    isAdmin: false
  });
  const [checkins, setCheckins] = useState<WeeklyCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatingPersona, setGeneratingPersona] = useState(false);
  const [sendingReports, setSendingReports] = useState(false);
  const [isEditingPersona, setIsEditingPersona] = useState(false);
  const [personaDraft, setPersonaDraft] = useState('');

  // Modal / Check-in Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weekNumber, setWeekNumber] = useState<number>(1);
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reportingPeriod, setReportingPeriod] = useState('Full week');
  const [customReportingPeriod, setCustomReportingPeriod] = useState('');
  const [status, setStatus] = useState<'on-track' | 'needs-support' | 'stalled'>('on-track');
  const [goalsSet, setGoalsSet] = useState<string[]>(['']);
  const [progressMade, setProgressMade] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [prevGoalReviews, setPrevGoalReviews] = useState<PreviousGoalReview[]>([]);
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');

  // Interests UI State
  const [newInterest, setNewInterest] = useState('');

  const fetchProfile = async () => {
    try {
      const data = await apiRequest<UserProfile>(API_ENDPOINTS.PROGRESS_PROFILE());
      setProfile({
        aspirations: data.aspirations || '',
        interests: data.interests || [],
        persona: data.persona || '',
        weeklyReport: data.weeklyReport || '',
        isAdmin: !!data.isAdmin,
      });
      setPersonaDraft(data.persona || '');
    } catch (e) {
      console.error("Error fetching progress profile", e);
    }
  };

  const fetchCheckins = async () => {
    try {
      const data = await apiRequest<WeeklyCheckin[]>(API_ENDPOINTS.PROGRESS_CHECKINS());
      setCheckins(data || []);
    } catch (e) {
      console.error("Error fetching checkins", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchCheckins()]);
      setLoading(false);
    };
    init();
  }, []);

  // Update Week Number auto-increment
  useEffect(() => {
    if (checkins.length > 0) {
      const maxWeek = Math.max(...checkins.map(c => c.weekNumber));
      setWeekNumber(maxWeek + 1);
    } else {
      setWeekNumber(1);
    }
  }, [checkins]);

  // Load previous goals for review when modal opens
  const handleOpenModal = () => {
    setIsModalOpen(true);
    // Find latest checkin to review its goals
    if (checkins.length > 0) {
      const latest = [...checkins].sort((a, b) => b.weekNumber - a.weekNumber)[0];
      setPrevGoalReviews(latest.goalsSet.map(g => ({ goal: g, comment: '' })));
    } else {
      setPrevGoalReviews([]);
    }
    setSessionDate(new Date().toISOString().split('T')[0]);
    setReportingPeriod('Full week');
    setCustomReportingPeriod('');
    setStatus('on-track');
    setGoalsSet(['']);
    setProgressMade('');
    setNextSteps('');
    setAdditionalEmails([]);
    setNewEmail('');
  };

  const saveProfile = async (profileUpdate: Partial<UserProfile>) => {
    const updatedProfile = { ...profile, ...profileUpdate };
    await apiRequest(API_ENDPOINTS.PROGRESS_PROFILE(), {
      method: 'PUT',
      body: JSON.stringify({
        aspirations: updatedProfile.aspirations,
        interests: updatedProfile.interests,
        persona: updatedProfile.persona,
      }),
    });
    setProfile(updatedProfile);
    return updatedProfile;
  };

  const handleSaveAspirations = async (val: string) => {
    try {
      await saveProfile({ aspirations: val });
      toast.success('Future aspirations updated');
    } catch (e) {
      toast.error('Failed to update aspirations');
    }
  };

  const handleAddInterest = async () => {
    if (!newInterest.trim()) return;
    try {
      const updatedProfile = await saveProfile({
        interests: [...profile.interests, newInterest.trim()],
      });
      setNewInterest('');
      setProfile(updatedProfile);
      toast.success('Interest added');
    } catch (e) {
      toast.error('Failed to save interest');
    }
  };

  const handleRemoveInterest = async (index: number) => {
    try {
      await saveProfile({
        interests: profile.interests.filter((_, i) => i !== index),
      });
      toast.success('Interest removed');
    } catch (e) {
      toast.error('Failed to remove interest');
    }
  };

  const handleGeneratePersona = async () => {
    setGeneratingPersona(true);
    try {
      const data = await apiRequest<{ persona: string }>(API_ENDPOINTS.PROGRESS_PERSONA_GENERATE(), {
        method: 'POST',
      });
      await saveProfile({ persona: data.persona || '' });
      setPersonaDraft(data.persona || '');
      toast.success('AI Persona generated!');
    } catch (e) {
      toast.error('AI Generation failed. Ensure you have aspirations and interests saved.');
    } finally {
      setGeneratingPersona(false);
    }
  };

  const handleSendWeeklyReports = async () => {
    setSendingReports(true);
    try {
      const res = await fetch(API_ENDPOINTS.PROGRESS_ADMIN_REPORTS(), {
        method: 'POST',
        headers: getHeaders()
      });
      if (res.ok) {
        toast.success("Weekly feedback reports generated for all active users!");
      } else {
        toast.error("Failed to send admin weekly reports");
      }
    } catch (e) {
      toast.error("Network error while generating reports");
    } finally {
      setSendingReports(false);
    }
  };

  const handleAddGoalField = () => {
    setGoalsSet([...goalsSet, '']);
  };

  const handleRemoveGoalField = (index: number) => {
    setGoalsSet(goalsSet.filter((_, i) => i !== index));
  };

  const handleGoalFieldChange = (index: number, val: string) => {
    const next = [...goalsSet];
    next[index] = val;
    setGoalsSet(next);
  };

  const handlePrevGoalCommentChange = (index: number, val: string) => {
    const next = [...prevGoalReviews];
    next[index].comment = val;
    setPrevGoalReviews(next);
  };

  const handleSavePersona = async (val: string) => {
    try {
      await saveProfile({ persona: val });
      setIsEditingPersona(false);
      toast.success('AI Coach Persona saved');
    } catch (e) {
      toast.error('Failed to save persona');
    }
  };

  const handleAddEmail = () => {
    const email = newEmail.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      toast.error('Enter a valid email address.');
      return;
    }
    if (additionalEmails.includes(email)) {
      toast.error('This email address has already been added.');
      return;
    }
    setAdditionalEmails((emails) => [...emails, email]);
    setNewEmail('');
  };

  const handleSaveSession = async () => {
    const activeGoals = goalsSet.filter(g => g.trim() !== '');
    const periodCovered = reportingPeriod === 'Custom'
      ? customReportingPeriod.trim()
      : reportingPeriod;

    if (!periodCovered) {
      toast.error("Please select the progress period covered.");
      return;
    }

    if (activeGoals.length === 0) {
      toast.error("Please add at least one plan item for the next period.");
      return;
    }
    if (!progressMade.trim() || !nextSteps.trim()) {
      toast.error("Please add completed progress and next period plan.");
      return;
    }

    setSubmitting(true);
    const newCheckin: WeeklyCheckin = {
      weekNumber,
      date: sessionDate,
      reportingPeriod: periodCovered,
      status,
      goalsSet: activeGoals,
      progressMade,
      nextSteps,
      previousGoalReviews: prevGoalReviews.filter(r => r.goal.trim() !== ''),
      additionalEmails,
    };

    try {
      await apiRequest<WeeklyCheckin>(API_ENDPOINTS.PROGRESS_CHECKINS(), {
        method: 'POST',
        body: JSON.stringify(newCheckin),
      });
      setIsModalOpen(false);
      toast.success('Session saved and email notification sent.');
      await fetchCheckins();
    } catch (e) {
      console.error('Save session error:', e);
      toast.error('Failed to log session.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCheckin = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session log?")) return;
    try {
      await apiRequest(API_ENDPOINTS.PROGRESS_CHECKIN_DELETE(id), {
        method: 'DELETE',
      });
      toast.success('Session log deleted');
      await fetchCheckins();
    } catch (e) {
      console.error('Delete session error:', e);
      toast.error('Failed to delete log');
    }
  };

  const parseWeeklyReport = () => {
    if (!profile.weeklyReport) return null;
    try {
      return JSON.parse(profile.weeklyReport);
    } catch (e) {
      return null;
    }
  };

  const weeklyReportData = parseWeeklyReport();

  return (
    <div className="flex-1 min-h-dvh h-full bg-[#0d0d0d] text-white overflow-hidden flex flex-col font-sans pb-20 md:pb-0">
      {/* Header */}
      <header className="px-4 sm:px-8 py-4 sm:py-5 border-b border-[#1e1e1e] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-[#111111]">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#00C896] uppercase mb-1 block">
            Dashboard
          </span>
          <h1 className="text-2xl font-bold">Progress Tracking</h1>
          <p className="text-xs text-gray-400 mt-1">Log your weekly sessions, track goals, and grow consistently.</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-4">
          {profile.isAdmin && (
            <button
              onClick={handleSendWeeklyReports}
              disabled={sendingReports}
              className="flex items-center gap-2 bg-[#00C896]/15 hover:bg-[#00C896]/25 text-[#00C896] border border-[#00C896]/30 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all disabled:opacity-50"
            >
              {sendingReports ? <Loader className="animate-spin w-4 h-4" /> : <Sparkles size={15} />}
              Send Weekly Reports
            </button>
          )}
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-[#00C896] hover:bg-[#00b386] text-black px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Log Weekly Session
          </button>
          <NotificationBell />
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-[#0d0d0d]">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-10 h-10 animate-spin text-[#00C896]" />
            <p className="text-gray-400 text-sm">Loading Progress Dashboard...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          
          {/* Left Panel */}
          <div className="space-y-8">
            
            {/* Weekly Streak Card */}
            <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Weekly Streak</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-extrabold text-white">{checkins.length}</span>
                <span className="text-gray-400 text-sm">weeks logged</span>
              </div>
              <div className="space-y-2">
                <div className="w-full bg-[#1e1e1e] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#00C896] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((checkins.length / 12) * 100, 100)}%` }} 
                  />
                </div>
                <p className="text-xs text-gray-400">Goal: 12 weeks of consistent tracking</p>
              </div>
            </div>

            {/* Persona & Aspirations Card */}
            <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Future Aspirations</h3>
                <textarea
                  defaultValue={profile.aspirations}
                  onBlur={(e) => handleSaveAspirations(e.target.value)}
                  placeholder="Where do you see yourself in 3-5 years?"
                  className="w-full h-24 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00C896] resize-none"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Interests</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.interests.map((interest, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-[#1a1a1a] border border-[#2a2a2a] text-[#ccc] text-xs rounded-full">
                      {interest}
                      <button onClick={() => handleRemoveInterest(i)} className="hover:text-red-400 font-bold">×</button>
                    </span>
                  ))}
                  {profile.interests.length === 0 && <span className="text-xs text-gray-500">No interests added yet.</span>}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add interest (e.g. React)"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#00C896]"
                  />
                  <button onClick={handleAddInterest} className="px-3 bg-[#00C896] text-black font-semibold rounded-lg text-xs hover:bg-[#00b386] transition-colors">
                    Add
                  </button>
                </div>
              </div>

              {/* AI Persona Section */}
              <div className="pt-4 border-t border-[#1e1e1e]">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">AI Coach Persona</h3>
                  {profile.persona && !isEditingPersona && (
                    <button
                      onClick={() => setIsEditingPersona(true)}
                      className="text-[#00C896] text-xs font-semibold hover:text-[#9df2bf]"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {profile.persona && !isEditingPersona ? (
                  <div className="bg-[#1a1a1a] border-l-2 border-[#00C896] p-4 rounded-r-lg italic text-gray-300 text-xs leading-relaxed">
                    {profile.persona}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={personaDraft}
                      onChange={(e) => setPersonaDraft(e.target.value)}
                      placeholder="Describe your AI coach persona here..."
                      className="w-full h-28 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00C896] resize-none"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSavePersona(personaDraft)}
                        disabled={personaDraft.trim().length === 0}
                        className="flex items-center justify-center gap-2 bg-[#00C896] hover:bg-[#00b386] text-black px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <Save size={14} />
                        Save Persona
                      </button>
                      <button
                        onClick={() => {
                          setPersonaDraft(profile.persona || '');
                          setIsEditingPersona(false);
                        }}
                        className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#2a2a2a] text-gray-300 hover:border-[#00C896] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleGeneratePersona}
                        disabled={generatingPersona}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-600 text-xs font-semibold text-gray-400 hover:border-[#00C896] hover:text-white transition-all bg-white/[0.01]"
                      >
                        {generatingPersona ? <Loader className="animate-spin w-4 h-4" /> : <Sparkles size={14} />}
                        Generate Persona
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Coach Abhishek Feedback Card */}
            {weeklyReportData && (
              <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-[#1e1e1e] pb-3">
                  <MessageSquare className="text-[#00C896]" size={18} />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Coaching Report</h3>
                </div>
                <div className="space-y-3 text-xs leading-relaxed text-gray-300">
                  <p className="font-semibold text-white">{weeklyReportData.greeting},</p>
                  <p>{weeklyReportData.opening}</p>
                  
                  {weeklyReportData.highlights && weeklyReportData.highlights.length > 0 && (
                    <div>
                      <p className="font-bold text-[#00C896] mb-1">Highlights:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {weeklyReportData.highlights.map((h: string, i: number) => <li key={i}>{h}</li>)}
                      </ul>
                    </div>
                  )}

                  {weeklyReportData.nextSteps && weeklyReportData.nextSteps.length > 0 && (
                    <div>
                      <p className="font-bold text-[#00C896] mb-1">Recommended Next Steps:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {weeklyReportData.nextSteps.map((n: string, i: number) => <li key={i}>{n}</li>)}
                      </ul>
                    </div>
                  )}

                  <p className="pt-2 border-t border-[#1e1e1e]/50 italic">{weeklyReportData.closing}</p>
                </div>
              </div>
            )}

          </div>

          {/* Right Panel (Timeline) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-[#00C896]" />
              Check-In Timeline
            </h2>

            {checkins.length === 0 ? (
              <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-12 text-center text-gray-500">
                No weekly sessions logged yet. Log your first check-in above.
              </div>
            ) : (
              <div className="relative border-l border-zinc-800 ml-4 space-y-8 pl-8 pb-4">
                {checkins.map((checkin) => {
                  const statusColors = {
                    'on-track': 'bg-[#00C896]',
                    'needs-support': 'bg-amber-500',
                    'stalled': 'bg-red-500'
                  };

                  return (
                    <div key={checkin.id} className="relative group">
                      
                      {/* Timeline Dot Indicator */}
                      <span className={`absolute -left-[41px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-[#0d0d0d] ${statusColors[checkin.status]}`}>
                        <span className="text-[10px] font-bold text-black">{checkin.weekNumber}</span>
                      </span>

                      {/* Card block */}
                      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-6 hover:border-zinc-700 transition-colors shadow-sm relative">
                        
                        {/* Hover Delete Action */}
                        {checkin.id && (
                          <button
                            onClick={() => handleDeleteCheckin(checkin.id!)}
                            className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-500 hover:text-red-400 hover:bg-white/5 rounded-md"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}

                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h4 className="font-bold text-white text-base">Week {checkin.weekNumber} Review</h4>
                            <span className="text-xs text-gray-500">
                              {new Date(checkin.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              {' | '}
                              {checkin.reportingPeriod || 'Full week'}
                            </span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                            checkin.status === 'on-track' ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/20' :
                            checkin.status === 'needs-support' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {checkin.status.replace('-', ' ')}
                          </span>
                        </div>

                        {/* Narrative / Goal Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          <div>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Next Period Plan</span>
                            <ul className="space-y-2">
                              {checkin.goalsSet.map((goal, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#00C896]" />
                                  {goal}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Client Progress Update</span>
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{checkin.progressMade}</p>
                          </div>
                        </div>

                        {/* Previous Goal Review Comments */}
                        {checkin.previousGoalReviews && checkin.previousGoalReviews.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-[#1e1e1e] space-y-3">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Previous Goals Review</span>
                            <div className="space-y-2">
                              {checkin.previousGoalReviews.map((rev, i) => (
                                <div key={i} className="bg-[#1a1a1a] p-3 rounded-lg text-xs">
                                  <span className="font-bold text-[#00C896] block mb-1">Goal: {rev.goal}</span>
                                  <p className="text-gray-400">{rev.comment || 'No review comment provided.'}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Next Steps */}
                        <div className="mt-6 pt-4 border-t border-[#1e1e1e]">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Client Inputs / Next Actions</span>
                          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{checkin.nextSteps}</p>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Log Weekly Session Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111111] border border-[#222] text-white max-w-xl overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>New Weekly Session</DialogTitle>
            <DialogDescription className="text-gray-400">
              Prepare the progress update DRC can share with the client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            
            {/* Week, Date, Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Report Week</label>
                <input 
                  type="number"
                  value={weekNumber}
                  onChange={e => setWeekNumber(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00C896]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Report Date</label>
                <input 
                  type="date"
                  value={sessionDate}
                  onChange={e => setSessionDate(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00C896] [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Overall Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00C896]"
                >
                  <option value="on-track">On Track</option>
                  <option value="needs-support">Needs Support</option>
                  <option value="stalled">Stalled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Progress Period Covered</label>
                <select
                  value={reportingPeriod}
                  onChange={e => setReportingPeriod(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00C896]"
                >
                  <option value="Full week">Full week</option>
                  <option value="Last 3 days">Last 3 days</option>
                  <option value="Last 4 days">Last 4 days</option>
                  <option value="Custom">Custom period</option>
                </select>
              </div>
              {reportingPeriod === 'Custom' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Custom Period</label>
                  <input
                    type="text"
                    value={customReportingPeriod}
                    onChange={e => setCustomReportingPeriod(e.target.value)}
                    placeholder="e.g. Mon-Wed, Aug 5-Aug 8"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00C896]"
                  />
                </div>
              )}
            </div>

            {/* Previous Goals Review (Conditional) */}
            {prevGoalReviews.length > 0 && (
              <div className="bg-[#161616] p-4 rounded-xl border border-[#222] space-y-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Review Previous Goals</span>
                {prevGoalReviews.map((rev, idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="block text-xs text-gray-300 font-medium">Goal: {rev.goal}</label>
                    <input 
                      type="text"
                      placeholder="How did this go?"
                      value={rev.comment}
                      onChange={e => handlePrevGoalCommentChange(idx, e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#00C896]"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Goals for this week */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan for Next Period</label>
              {goalsSet.map((goal, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    type="text"
                    placeholder={`Example: Apply to 10 more relevant jobs`}
                    value={goal}
                    onChange={e => handleGoalFieldChange(idx, e.target.value)}
                    className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#00C896]"
                  />
                  {goalsSet.length > 1 && (
                    <button 
                      onClick={() => handleRemoveGoalField(idx)}
                      className="p-1.5 text-gray-500 hover:text-red-400 bg-[#1a1a1a] hover:bg-red-500/10 rounded-lg transition-colors border border-[#2a2a2a]"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddGoalField}
                className="text-xs font-semibold text-[#00C896] hover:text-[#00b386] flex items-center gap-1 mt-1"
              >
                <Plus size={12} /> Add Goal
              </button>
            </div>

            {/* Narrative Progress */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">This Period's Progress</label>
              <textarea 
                value={progressMade}
                onChange={e => setProgressMade(e.target.value)}
                placeholder="Example: Applied to 12 relevant jobs, followed up on 4 applications, and updated the resume for product analyst roles."
                className="w-full h-24 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-sm focus:outline-none focus:border-[#00C896] resize-none"
              />
            </div>

            {/* Next Steps */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Client Inputs / Next Actions</label>
              <textarea 
                value={nextSteps}
                onChange={e => setNextSteps(e.target.value)}
                placeholder="Example: Need confirmation on preferred locations and notice period. Next, we will target 10 more suitable openings and follow up on pending applications."
                className="w-full h-24 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-sm focus:outline-none focus:border-[#00C896] resize-none"
              />
            </div>

            <div className="space-y-3 rounded-xl border border-[#222] bg-[#161616] p-4">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Add Email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEmail();
                    }
                  }}
                  placeholder="Enter email address"
                  className="min-w-0 flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00C896]"
                />
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="shrink-0 rounded-lg bg-[#00C896] px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#00b386]"
                >
                  <Plus size={14} className="mr-1 inline" /> Add Email
                </button>
              </div>
              {additionalEmails.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-xs text-gray-400">Added emails</span>
                  {additionalEmails.map((email) => (
                    <div key={email} className="flex items-center justify-between gap-3 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-sm text-gray-200">
                      <span className="truncate">{email}</span>
                      <button
                        type="button"
                        onClick={() => setAdditionalEmails((emails) => emails.filter((item) => item !== email))}
                        className="shrink-0 text-xs font-semibold text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="flex justify-end gap-3 border-t border-[#222] pt-4 mt-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSession}
              disabled={submitting}
              className="bg-[#00C896] hover:bg-[#00b386] text-black font-semibold px-5 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              {submitting && <Loader className="animate-spin w-4 h-4 text-black" />}
              {submitting ? 'Sending...' : 'Send Session'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyProgressTracker;

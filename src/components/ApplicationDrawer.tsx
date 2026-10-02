import React, { useState, useEffect } from 'react';
import { X, Bookmark, Send, Calendar, MessageSquare, Loader, Clock, User, CheckCircle2 } from 'lucide-react';
import API_ENDPOINTS from '../config/api';

interface RecommendationScore {
  atsScore?: number;
  resumeMatchScore?: number;
  skillMatch?: number;
  experienceMatch?: number;
  preferenceMatch?: number;
  aiConfidenceScore?: number;
  overallRecommendation?: string;
  reason?: string;
}

interface TimelineEvent {
  id: string;
  eventType: string;
  timestamp: string;
  performedBy: string;
  source: string;
  notes: string;
}

interface WhatsAppMessage {
  id: string;
  messageText: string;
  status: string;
  direction: 'inbound' | 'outbound';
  created_at: string;
}

interface ApplicationDrawerProps {
  userJob: any;
  onClose: () => void;
  onUpdate: (updatedJob?: any) => void;
}

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-SESSION-TOKEN': localStorage.getItem('session_token') || sessionStorage.getItem('session_token') || localStorage.getItem('token') || sessionStorage.getItem('token') || '',
});

export const ApplicationDrawer: React.FC<ApplicationDrawerProps> = ({ userJob, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'whatsapp'>('details');
  const [recommendation, setRecommendation] = useState<RecommendationScore | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  
  // Follow-up state
  const [nextFollowUp, setNextFollowUp] = useState(userJob.follow_up_date || userJob.next_follow_up_date || '');
  const [notes, setNotes] = useState(userJob.operator_notes || '');
  const [followUpCount, setFollowUpCount] = useState(userJob.follow_up_count || 0);
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  // Simulation loading states
  const [sendingUpdate, setSendingUpdate] = useState(false);
  const [webhookReplying, setWebhookReplying] = useState<string | null>(null);

  const syncFollowUpState = (dateValue: string, notesValue: string, countValue: number) => {
    setNextFollowUp(dateValue);
    setNotes(notesValue);
    setFollowUpCount(countValue);
  };

  useEffect(() => {
    if (userJob.user_job_id) {
      fetchScores();
      fetchTimeline();
      fetchMessages();
    }
  }, [userJob.user_job_id]);

  // useEffect(() => {
  //   syncFollowUpState(
  //     userJob.follow_up_date || userJob.next_follow_up_date || '',
  //     userJob.operator_notes || '',
  //     typeof userJob.follow_up_count === 'number' ? userJob.follow_up_count : 0
  //   );
  // }, [userJob.id, userJob.follow_up_date, userJob.next_follow_up_date, userJob.operator_notes, userJob.follow_up_count]);
useEffect(() => {
  syncFollowUpState(
    userJob.follow_up_date || userJob.next_follow_up_date || '',
    userJob.operator_notes || '',
    typeof userJob.follow_up_count === 'number'
      ? userJob.follow_up_count
      : 0
  );
}, [userJob.id]);
  const fetchScores = async () => {
      console.log("Score ID:", userJob.user_job_id);

    try {
      const res = await fetch(`${API_ENDPOINTS.DISCOVERED_JOBS_LIST}/${userJob.user_job_id}/score`, { headers: getHeaders() });
          console.log("Score Status:", res.status);

      if (res.ok) {
        const data = await res.json();
        setRecommendation(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTimeline = async () => {
         console.log("Timeline ID:", userJob.user_job_id);

    try {
      const res = await fetch(`${API_ENDPOINTS.API_BASE_URL}/api/timeline/${userJob.user_job_id}`, { headers: getHeaders() });
      if (res.ok) {
        setTimeline(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async () => {
      console.log("Message ID:", userJob.user_job_id);

    try {
      const res = await fetch(`${API_ENDPOINTS.API_BASE_URL}/api/notifications/messages/${userJob.user_job_id}`, { headers: getHeaders() });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveFollowUp = async () => {
    setSavingFollowUp(true);
    const userId = userJob.user_id || localStorage.getItem('user_id') || sessionStorage.getItem('user_id') || '';
    const jobId = userJob.job_id || userJob.id || userJob.user_job_id || '';

    if (!userId || !jobId) {
      console.error('Missing user or job identifier for follow-up save', { userId, jobId, userJob });
      setSavingFollowUp(false);
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.USER_JOBS_UPDATE(userId, jobId), {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          next_follow_up_date: nextFollowUp,
          operator_notes: notes,
          follow_up_count: String(followUpCount),
        }),
      });
      if (res.ok) {
        const payload = await res.json();
        const savedDate = payload.follow_up_date || payload.next_follow_up_date || nextFollowUp;
        const savedCount = payload.follow_up_count ?? followUpCount;
        const savedNotes = payload.operator_notes ?? notes;
        const updatedJob = {
          ...userJob,
          follow_up_date: savedDate,
          next_follow_up_date: payload.next_follow_up_date || payload.follow_up_date || savedDate,
          follow_up_count: savedCount,
          operator_notes: savedNotes,
        };
        // syncFollowUpState(savedDate, savedNotes, savedCount);
        // onUpdate(updatedJob);
        // fetchTimeline();
        // fetchMessages();

        
onUpdate(updatedJob);

// Reset follow-up form after successful save
syncFollowUpState("", "", 0);
setNextFollowUp("");
setNotes("");
setFollowUpCount(0);

// Close drawer after successful save
onClose();

fetchTimeline();
fetchMessages();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingFollowUp(false);
    }
  };

  const handleSendWhatsAppUpdate = async () => {
    setSendingUpdate(true);
    try {
      // const res = await fetch(`${API_ENDPOINTS.PROGRESS_PROFILE().replace('/profile', '/notifications/send-update')}`, {
      //   method: 'POST',
      //   headers: getHeaders(),
      //   body: JSON.stringify({
      //     userJobId: userJob.user_job_id,
      //     templateKey: 'status_update_poll',
      //   }),
      // });

      const res = await fetch(
  API_ENDPOINTS.NOTIFICATION_SEND_UPDATE(),
  {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      userJobId: userJob.user_job_id,
      templateKey: 'status_update_poll',
    }),
  }
);
      if (res.ok) {
        fetchMessages();
        fetchTimeline();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingUpdate(false);
    }
  };

  const handleSimulateCandidateReply = async (messageId: string, buttonText: string) => {
    setWebhookReplying(buttonText);
    try {
      // const res = await fetch(`${API_ENDPOINTS.PROGRESS_PROFILE().replace('/profile', '/notifications/webhook')}`, {
      //   method: 'POST',
      //   headers: getHeaders(),
      //   body: JSON.stringify({
      //     messageId,
      //     buttonText,
      //   }),
      // });
      const res = await fetch(
  API_ENDPOINTS.NOTIFICATION_WEBHOOK(),
  {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      messageId,
      buttonText,
    }),
  }
);
      if (res.ok) {
        fetchMessages();
        fetchTimeline();
        onUpdate(userJob);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWebhookReplying(null);
    }
  };
  const formatTimelineDate = (timestamp: any) => {
  if (!timestamp) return "Invalid Date";

  try {
    // Backend LocalDateTime can come as:
    // [year, month, day, hour, minute, second, nanoseconds]
    if (Array.isArray(timestamp)) {
      const [
        year,
        month,
        day,
        hour = 0,
        minute = 0,
        second = 0,
        nanoseconds = 0
      ] = timestamp;

      const milliseconds = Math.floor(nanoseconds / 1000000);

      const date = new Date(
        year,
        month - 1,
        day,
        hour,
        minute,
        second,
        milliseconds
      );

      if (!isNaN(date.getTime())) {
        return date.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      }
    }

    // If backend sends ISO string
    const date = new Date(timestamp);

    if (!isNaN(date.getTime())) {
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  } catch (error) {
    console.error("Error formatting timeline date:", error);
  }

  return "Invalid Date";
};


  return (
    <div className="fixed inset-y-0 right-0 w-[460px] bg-[#0c0c0e] border-l border-[#222] shadow-2xl flex flex-col z-50 animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b border-[#222] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white truncate max-w-[320px]">{userJob.title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{userJob.company} • {userJob.location || 'Location Unknown'}</p>
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1a1a]">
          <X size={18} />
        </button>
      </div>

      {/* Tabs - WhatsApp Sim removed; only job details and timeline are required */}

      <div className="flex border-b border-[#222] bg-[#09090b]">
        {['details', 'timeline', ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2.5 text-xs font-semibold capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-[#00C896] text-[#00C896]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeTab === 'details' && (
          <>
            {/* Match Diagnostics */}
            <div className="bg-[#121215] border border-[#222] rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Match Diagnostics</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'ATS Alignment', val: recommendation?.atsScore || 65 },
                  { name: 'Resume Match', val: recommendation?.resumeMatchScore || 70 },
                  { name: 'Skills Fit', val: recommendation?.skillMatch || 75 },
                  { name: 'Experience Fit', val: recommendation?.experienceMatch || 80 },
                  { name: 'Preference Match', val: recommendation?.preferenceMatch || 85 },
                  { name: 'Confidence Score', val: recommendation?.aiConfidenceScore || 80 },
                ].map((item) => (
                  <div key={item.name} className="bg-[#18181b] border border-[#222] rounded-lg p-2.5 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-medium">{item.name}</span>
                    <span className={`text-xs font-bold ${item.val >= 80 ? 'text-[#00C896]' : item.val >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {item.val}%
                    </span>
                  </div>
                ))}
              </div>

              {recommendation?.overallRecommendation && (
                <div className="pt-3 border-t border-[#222]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium text-gray-400">Recommendation:</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      recommendation.overallRecommendation.includes('Highly') ? 'bg-[#00C896]/10 text-[#00C896]' :
                      recommendation.overallRecommendation.includes('Needs') ? 'bg-amber-400/10 text-amber-400' :
                      recommendation.overallRecommendation.includes('Not') ? 'bg-rose-400/10 text-rose-400' : 'bg-blue-400/10 text-blue-400'
                    }`}>
                      {recommendation.overallRecommendation}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 italic">"{recommendation.reason}"</p>
                </div>
              )}
            </div>

            {/* Job Description */}
            {userJob.description && (
              <div className="bg-[#121215] border border-[#222] rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Job Description</h3>
                <div 
                  className="text-xs text-gray-300 leading-relaxed max-h-[300px] overflow-y-auto pr-1 space-y-2"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#222 transparent'
                  }}
                >
                  {userJob.description.includes('<') && userJob.description.includes('>') ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: userJob.description }} 
                      className="space-y-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_h1]:text-sm [&_h1]:font-bold [&_h2]:text-xs [&_h2]:font-bold"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{userJob.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Follow-Up Engine */}
            <div className="bg-[#121215] border border-[#222] rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={13} className="text-[#00C896]" />
                Follow-up Scheduling
              </h3>
              
              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={nextFollowUp}
                    onChange={(e) => setNextFollowUp(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#2c2c30] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C896]"
                  />
                </div>

                <div className="flex items-center justify-between bg-[#18181b] border border-[#222] rounded-lg p-2.5">
                  <span className="text-[11px] text-gray-400 font-semibold uppercase">Total Follow-ups Sent</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFollowUpCount(Math.max(0, followUpCount - 1))}
                      className="w-6 h-6 rounded bg-[#2c2c30] hover:bg-[#38383c] flex items-center justify-center text-white text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-white px-1.5">{followUpCount}</span>
                    <button
                      onClick={() => setFollowUpCount(followUpCount + 1)}
                      className="w-6 h-6 rounded bg-[#2c2c30] hover:bg-[#38383c] flex items-center justify-center text-white text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">Operator Notes</label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter activity log or follow-up notes here..."
                    className="w-full bg-[#18181b] border border-[#2c2c30] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00C896] resize-none"
                  />
                </div>

                <button
                  onClick={handleSaveFollowUp}
                  disabled={savingFollowUp}
                  className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-black text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  {savingFollowUp && <Loader size={12} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-[#121215] border border-[#222] rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={13} className="text-[#00C896]" />
              Hiring Activity Timeline
            </h3>

            {timeline.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500">No events logged yet.</div>
            ) : (
              <div className="relative border-l border-[#2c2c30] ml-2.5 pl-4 space-y-4">
                {timeline.map((event) => (
                  <div key={event.id} className="relative">
                    <span className="absolute -left-[22.5px] top-0.5 bg-[#00C896] text-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-4 border-[#121215]">
                      <CheckCircle2 size={10} className="text-black font-bold" />
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2"> 
                        <span className="text-xs font-semibold text-white">{event.eventType}</span>
                        <span className="text-[9px] text-gray-500">{formatTimelineDate(event.timestamp)}</span>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        Performed by: <span className="text-gray-300 font-medium">{event.performedBy}</span> via <span className="text-gray-300 font-medium">{event.source}</span>
                      </p>
                      {event.notes && (
                        <p className="text-[11px] text-gray-300 bg-[#18181b] border border-[#222] rounded px-2 py-1 mt-1">{event.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <div className="space-y-4 flex flex-col h-[520px]">
            {/* Quick Actions / Outbound Trigger */}
            <div className="bg-[#121215] border border-[#222] rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Status Poll Template</span>
              <button
                onClick={handleSendWhatsAppUpdate}
                disabled={sendingUpdate}
                className="px-3 py-1.5 bg-[#00C896] hover:bg-[#00b386] text-black text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                {sendingUpdate ? <Loader size={12} className="animate-spin" /> : <Send size={12} />}
                Send Update
              </button>
            </div>

            {/* Chat History Pane */}
            <div className="flex-1 bg-[#121215] border border-[#222] rounded-xl p-3 flex flex-col space-y-3 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <MessageSquare size={24} className="text-gray-600 mb-2" />
                  <p className="text-xs text-gray-500">No simulated WhatsApp messages sent yet.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.direction === 'outbound' ? 'self-end items-end' : 'self-start items-start'}`}>
                    <div className={`p-2.5 rounded-xl text-xs ${
                      msg.direction === 'outbound'
                        ? 'bg-[#00C896]/10 text-white border border-[#00C896]/30 rounded-tr-none'
                        : 'bg-[#222] text-gray-200 border border-[#333] rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.messageText}</p>
                      
                      {/* Simulation Button Options for Candidate replies */}
                      {msg.direction === 'outbound' && msg.status === 'sent' && (
                        <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-[#00C896]/10">
                          {['Received Recruiter Call', 'Interview Scheduled', 'Round 1 Completed', 'Round 2 Completed', 'Rejected', 'Offer Received', 'Need Help'].map((btn) => (
                            <button
                              key={btn}
                              disabled={webhookReplying !== null}
                              onClick={() => handleSimulateCandidateReply(msg.id, btn)}
                              className="px-2 py-0.5 bg-[#00C896] hover:bg-[#00b386] text-black text-[9px] font-bold rounded transition-colors"
                            >
                              {webhookReplying === btn ? 'Syncing...' : btn}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] text-gray-500 mt-1">{new Date(msg.created_at || Date.now()).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from "react";
import { Briefcase, Target, MapPin, User, TrendingUp, Compass, Send } from "lucide-react";
import { FEATURES } from "../config/features";
import { useUser } from "../contexts/UserContext";
import API_ENDPOINTS from "../config/api";
import SubscriptionExpiryBanner from "./SubscriptionExpiryBanner";

interface SidebarProps {
  isPremiumUser: boolean;
  onNavigate?: (screen: string) => void;
  currentView?: string;
}

interface ProfileData {
  name: string;
  jobTitle: string;
  location: string;
  experience: string;
  avatar: string;
  skills: string[];
}

const parseSkills = (value: any): string[] => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {}
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const getAvatarRemovedKey = (userId: string) => `profile_avatar_removed_${userId}`;
const isAvatarRemoved = (userId: string) =>
  localStorage.getItem(getAvatarRemovedKey(userId)) === "true";

const Sidebar: React.FC<SidebarProps> = ({ isPremiumUser, onNavigate, currentView }) => {
  const { user_id } = useUser();
  const avatarObjectUrlRef = useRef<string | null>(null);

  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    jobTitle: "",
    location: "",
    experience: "",
    avatar: "",
    skills: [],
  });

  const activeNav = currentView ?? "job-tracker";

  const getToken = () =>
    localStorage.getItem("session_token") || localStorage.getItem("token") || "";

  const loadProfileAvatar = async (userId: string): Promise<string> => {
    if (isAvatarRemoved(userId)) return "";
    const res = await fetch(API_ENDPOINTS.FILES_PROFILE_PICTURE(userId), {
      headers: { "X-SESSION-TOKEN": getToken() },
    });
    if (!res.ok) return "";
    const blob = await res.blob();
    if (avatarObjectUrlRef.current) URL.revokeObjectURL(avatarObjectUrlRef.current);
    const url = URL.createObjectURL(blob);
    avatarObjectUrlRef.current = url;
    return url;
  };

  const fetchProfile = async (userId: string) => {
    const token = getToken();
    const headers = { "Content-Type": "application/json", "X-SESSION-TOKEN": token };

    try {
      const [userRes, avatarUrl] = await Promise.all([
        fetch(API_ENDPOINTS.USER_DETAILS(userId), { headers }),
        loadProfileAvatar(userId).catch(() => ""),
      ]);

      const userData = userRes.ok ? await userRes.json() : {};

      setProfile({
        name: userData?.name || "",
        jobTitle: userData?.job_title || "",
        location: userData?.job_location || "",
        experience: userData?.experience || "",
        avatar: avatarUrl,
        skills: parseSkills(userData?.skills),
      });
    } catch (err) {
      console.error("[Sidebar] fetchProfile error:", err);
    }
  };

  useEffect(() => {
    if (!user_id) return;
    fetchProfile(user_id);
  }, [user_id]);

  useEffect(() => {
    if (!user_id) return;

    const handleAvatarRemoved = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail;
      if (detail?.userId && detail.userId !== user_id) return;
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
        avatarObjectUrlRef.current = null;
      }
      setProfile((prev) => ({ ...prev, avatar: "" }));
    };

    const handleAvatarUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail;
      if (detail?.userId && detail.userId !== user_id) return;
      fetchProfile(user_id);
    };

    window.addEventListener("profile-avatar-removed", handleAvatarRemoved);
    window.addEventListener("profile-avatar-updated", handleAvatarUpdated);
    return () => {
      window.removeEventListener("profile-avatar-removed", handleAvatarRemoved);
      window.removeEventListener("profile-avatar-updated", handleAvatarUpdated);
    };
  }, [user_id]);

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) URL.revokeObjectURL(avatarObjectUrlRef.current);
    };
  }, []);

  const navigate = (view: string) => {
    onNavigate?.(view);
  };

  const navItemClass = (view: string) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-semibold transition-colors ${
      activeNav === view
        ? "bg-[#222] text-[#00C896]"
        : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
    }`;

  const initials = profile.name
    ? profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <aside className="w-[240px] bg-[#111111] flex flex-col h-full border-r border-[#222] hidden md:flex shrink-0 font-sans">
      {/* SIDEBAR HEADER — logo area */}
      <div className="flex items-center px-4 pt-6 pb-4">
        <div className="w-8 h-8 bg-[#00C896] rounded-md flex items-center justify-center mr-3 shrink-0">
          <span className="text-black font-bold text-xs tracking-wider">DRC</span>
        </div>
        <div className="min-w-0">
          <span className="block text-white text-[12px] font-semibold leading-tight break-words">
            Dheeraj Rathod Consult
          </span>
        </div>
      </div>

      {/* Subscription expiry banner */}
      <SubscriptionExpiryBanner />

      {/* PROFILE CARD */}
      <div className="px-5 pt-2 pb-6 flex flex-col items-center text-center border-b border-[#222]">
        {/* AVATAR */}
        <div
          className="relative mb-3 cursor-pointer group"
          onClick={() => navigate("profile")}
          title="Go to profile"
        >
          <div className="w-[88px] h-[88px] rounded-full p-[2px] bg-gradient-to-tr from-[#00C896] to-[#00C896]/40">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover border-4 border-[#111]"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#222] flex items-center justify-center border-4 border-[#111]">
                <span className="text-white text-xl font-medium">{initials}</span>
              </div>
            )}
          </div>
        </div>

        {/* NAME */}
        <h3 className="text-white font-semibold text-[15px] mb-0.5">
          {profile.name || "Test User"}
        </h3>

        {/* JOB TITLE */}
        <p className="text-[#00C896] text-xs font-medium mb-3">
          {profile.jobTitle || "Frontend Developer"}
        </p>

        {/* LOCATION & EXPERIENCE */}
        <div className="flex items-center justify-center gap-3 mb-4 w-full text-[#888] text-[11px]">
          <span>{profile.location || "Argentina"}</span>
          <span>{profile.experience || "Mid Level"}</span>
        </div>

        {/* KEY SKILLS */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-5">
          {profile.skills.length > 0 ? (
            profile.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 bg-[#222] text-[#ccc] text-[10px] rounded-full"
              >
                {skill}
              </span>
            ))
          ) : (
            <>
              <span className="px-2.5 py-1 bg-[#222] text-[#ccc] text-[10px] rounded-full">AR/VR</span>
              <span className="px-2.5 py-1 bg-[#222] text-[#ccc] text-[10px] rounded-full">Adobe Suite</span>
              <span className="px-2.5 py-1 bg-[#222] text-[#ccc] text-[10px] rounded-full">Abstract</span>
              <span className="px-2.5 py-1 bg-[#222] text-[#ccc] text-[10px] rounded-full">Salesforce</span>
            </>
          )}
        </div>

        {/* VIEW PROFILE BUTTON */}
        <button
          onClick={() => navigate("profile")}
          className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-black font-semibold text-sm rounded-md transition-colors"
        >
          View Profile
        </button>
      </div>

      {/* NAVIGATION */}
      <div className="p-5 flex-1">
        <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-wider mb-3">
          Navigation
        </p>
        <nav className="space-y-1">

          <button onClick={() => navigate("profile")} className={navItemClass("profile")}>
            <User size={16} />
            <span>Profile</span>
          </button>

          {isPremiumUser && (
            <button onClick={() => navigate("jobs")} className={navItemClass("jobs")}>
              <Briefcase size={16} />
              <span>Jobs</span>
            </button>
          )}

          <button onClick={() => navigate("job-tracker")} className={navItemClass("job-tracker")}>
            <Target size={16} />
            <span>Job Tracker</span>
          </button>
          <button onClick={() => navigate("referral-jobs")} className={navItemClass("referral-jobs")}>
            <Send size={16} />
            <span>Referral Jobs</span>
          </button>
          
          <button onClick={() => navigate("weekly-progress")} className={navItemClass("weekly-progress")}>
            <TrendingUp size={16} />
            <span>Weekly Progress</span>
          </button>

          {FEATURES.JOB_DISCOVERY && (
            <button onClick={() => navigate("job-discovery")} className={navItemClass("job-discovery")}>
              <Compass size={16} />
              <span>Job Discovery</span>
            </button>
          )}

        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

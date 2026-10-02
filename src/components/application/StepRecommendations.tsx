import React, { useState, useEffect } from 'react';
import { Sparkles, Check, CheckSquare, Square, Building2, MapPin, DollarSign, ArrowRight, ArrowLeft, Loader2, Briefcase } from 'lucide-react';
import { CandidateParsedProfile, fetchJobRecommendations } from '../../lib/applicationApi';
import { DiscoveredJobItem } from '../../lib/drcDiscoveryApi';

interface StepRecommendationsProps {
  candidateProfile: CandidateParsedProfile;
  currentJobId: string;
  selectedAdditionalJobIds: string[];
  onToggleAdditionalJob: (jobId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const StepRecommendations: React.FC<StepRecommendationsProps> = ({
  candidateProfile,
  currentJobId,
  selectedAdditionalJobIds,
  onToggleAdditionalJob,
  onBack,
  onNext,
}) => {
  const [recommendations, setRecommendations] = useState<DiscoveredJobItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadRecs() {
      setLoading(true);
      try {
        const jobs = await fetchJobRecommendations(
          candidateProfile.top_skills || [],
          candidateProfile.reference_role || candidateProfile.primary_domain || '',
          currentJobId,
          4
        );
        if (isMounted) {
          setRecommendations(jobs);
        }
      } catch {
        if (isMounted) setRecommendations([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRecs();
    return () => {
      isMounted = false;
    };
  }, [candidateProfile, currentJobId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div>
          <h3 className="text-xl font-bold text-white">Recommended Openings For You</h3>
          <p className="text-xs text-zinc-400">
            Based on your parsed stack ({candidateProfile.top_skills?.slice(0, 3).join(', ')}), you are a strong match for these active roles.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Skill-Matched</span>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#00C896] animate-spin" />
          <p className="text-xs text-zinc-400">Finding complementary openings matching your profile...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="py-8 text-center space-y-2 border border-zinc-800 bg-zinc-900/40 rounded-xl p-6">
          <Briefcase className="w-8 h-8 text-zinc-500 mx-auto" />
          <p className="text-sm font-semibold text-zinc-300">No additional complementary roles found right now.</p>
          <p className="text-xs text-zinc-500">You can proceed directly to complete your primary application.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-medium text-zinc-400">
            Select any additional roles you want to apply to simultaneously:
          </p>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {recommendations.map((job) => {
              const isSelected = selectedAdditionalJobIds.includes(job.id);
              const matchScore = job.ats_score || (job as any).match_score || 85;

              return (
                <div
                  key={job.id}
                  onClick={() => onToggleAdditionalJob(job.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'border-[#00C896] bg-[#00C896]/10 shadow-md shadow-[#00C896]/10'
                      : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="mt-0.5 text-[#00C896]">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 fill-[#00C896] text-black" />
                    ) : (
                      <Square className="w-5 h-5 text-zinc-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{job.job_title}</h4>
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        🎯 ATS Score: {matchScore}%
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-zinc-400">
                      <span className="flex items-center gap-1 font-medium text-zinc-300">
                        <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        {job.location}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1 text-zinc-400">
                          <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                          {job.salary}
                        </span>
                      )}
                    </div>

                    {/* Matched Skills */}
                    {(job as any).matched_skills && (job as any).matched_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(job as any).matched_skills.slice(0, 4).map((skill: string) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-700 font-mono"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 hover:border-zinc-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Profile</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-7 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00E5AA] text-black font-black text-xs flex items-center gap-2 border-2 border-[#00E5AA] shadow-xl shadow-[#00C896]/30 hover:scale-105 transition-all"
        >
          <span>
            {selectedAdditionalJobIds.length > 0
              ? `Review Application (+${selectedAdditionalJobIds.length} roles)`
              : 'Review & Submit'}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

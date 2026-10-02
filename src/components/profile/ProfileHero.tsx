import {
  Pencil,
  MapPin,
  Briefcase,
  Wallet,
  Mail,
  Phone,
  Upload,
  Trash2,
  Check,
  Zap,
  Star,
  Award,
} from "lucide-react";

interface ProfileHeroProps {
  user: any;
  onEdit: () => void;
  onAvatarClick: () => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAvatarDelete?: () => void;
  avatarInputRef: React.RefObject<HTMLInputElement>;
}

const ProfileHero: React.FC<ProfileHeroProps> = ({
  user,
  onEdit,
  onAvatarClick,
  onAvatarChange,
  onAvatarDelete,
  avatarInputRef,
}) => {
  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-zinc-800/50 mb-6 relative">
      
      {/* EDIT BUTTON */}
      <button
        onClick={onEdit}
        className="absolute top-6 right-6 text-zinc-500 hover:text-[#00C896] transition-colors"
      >
        <Pencil size={18} />
      </button>

      <div className="flex flex-col items-center md:flex-row md:items-start gap-8">

        {/* AVATAR */}
        <div className="relative shrink-0 group">
          <div className="w-32 h-32 rounded-full p-1.5 bg-gradient-to-tr from-[#00C896] to-emerald-400">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover border-4 border-[#1a1a1a]"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-zinc-700 border-4 border-[#1a1a1a] flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                </span>
              </div>
            )}
          </div>

          {/* Hover overlay with upload/delete buttons */}
          <div className="absolute inset-0 bg-black/55 rounded-full flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <button
              onClick={onAvatarClick}
              className="flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/35 rounded-full text-white text-[11px] font-medium transition-colors"
            >
              <Upload size={11} />
              {user.avatar ? "Change" : "Upload"}
            </button>
            {user.avatar && onAvatarDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onAvatarDelete(); }}
                className="flex items-center gap-1 px-2.5 py-1 bg-red-500/70 hover:bg-red-500 rounded-full text-white text-[11px] font-medium transition-colors"
              >
                <Trash2 size={11} />
                Remove
              </button>
            )}
          </div>

          <input
            type="file"
            ref={avatarInputRef}
            className="hidden"
            onChange={onAvatarChange}
            accept="image/*"
          />
        </div>

        {/* USER INFO */}
        <div className="flex-1 text-center md:text-left">
          
          {/* NAME */}
          <h1 className="text-3xl font-bold text-white mb-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
            <span>{user.name || "Your Name"}</span>
            {user.subscriptionPlan && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black tracking-wider uppercase ${
                user.subscriptionPlan.toUpperCase() === 'PREMIUM' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                user.subscriptionPlan.toUpperCase() === 'PLUS' ? 'bg-[#00C896]/10 border-[#00C896]/20 text-[#00C896]' :
                'bg-[#38bdf8]/10 border-[#38bdf8]/20 text-[#38bdf8]'
              }`}>
                {user.subscriptionPlan.toUpperCase() === 'PREMIUM' && <Award size={12} className="text-orange-400" />}
                {user.subscriptionPlan.toUpperCase() === 'PLUS' && <Star size={12} className="text-[#00C896]" />}
                {user.subscriptionPlan.toUpperCase() === 'BASE' && <Zap size={12} className="text-[#38bdf8]" />}
                {user.subscriptionPlan}
              </span>
            )}
          </h1>

          {/* ROLE */}
          <p className="text-zinc-400 text-lg mb-2">
            {user.role || "Add job title"}
          </p>
          {user.jobType && (
            <span className="inline-block px-3 py-0.5 bg-[#00C896]/10 text-[#00C896] text-xs font-semibold rounded-full border border-[#00C896]/20 mb-5">
              {user.jobType}
            </span>
          )}

          {/* DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">

            {/* LOCATION */}
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <MapPin size={16} className="text-[#00C896]" />
              <span>{user.location || "Add location"}</span>
            </div>

            {/* EXPERIENCE */}
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <Briefcase size={16} className="text-[#00C896]" />
              <span>{user.experience || "Add experience"}</span>
            </div>

            {/* SALARY */}
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <Wallet size={16} className="text-[#00C896]" />
              <span>{user.salary || "Add salary"}</span>
            </div>

            {/* EMAIL */}
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <Mail size={16} className="text-[#00C896]" />
              <span>{user.email || "Add email"}</span>
              {user.email && <Check size={14} className="text-[#00C896]" />}
            </div>

            {/* PHONE */}
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <Phone size={16} className="text-[#00C896]" />
              <span>{user.phone || "Add phone"}</span>
              {user.phone && <Check size={14} className="text-[#00C896]" />}
              {user.phone && user.isWhatsApp && (
                <a
                  href={`https://wa.me/${user.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Hello! I am contacting you from the DRC (Dheeraj Rathod Consult) support team. We wanted to touch base and get a quick update on how your recent job applications and interview calls are progressing. Let us know when you have a moment!")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center p-1 rounded hover:bg-white/10 transition-colors ml-1"
                  title="Chat on WhatsApp"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#25D366] flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHero;

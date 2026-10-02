import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, ArrowLeft } from 'lucide-react';
import { Button } from './Button';

interface NavbarProps {
  onNavigate?: (view: 'home' | 'pricing' | 'login' | 'bapo' | 'ai-course' | 'career-audit') => void;
  onNavigateToQAtoBA?: () => void;
  onNavigateToPricing?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToAICourse?: () => void;
  onNavigateToCareerAudit?: () => void;
  currentView?: 'home' | 'pricing' | 'login' | 'bapo' | 'ai-course' | 'career-audit';
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onNavigateToQAtoBA,
  onNavigateToPricing,
  onNavigateToLogin,
  onNavigateToHome,
  onNavigateToAICourse,
  onNavigateToCareerAudit,
  currentView,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookCall = () => {
    window.open(`${window.location.origin}/career-audit`, '_blank');
  };

  const navigateTo = (view: 'home' | 'pricing' | 'login' | 'bapo' | 'ai-course' | 'career-audit') => {
    if (onNavigate) {
      onNavigate(view);
    } else {
      switch (view) {
        case 'home':
          onNavigateToHome?.();
          break;
        case 'pricing':
          onNavigateToPricing?.();
          break;
        case 'login':
          onNavigateToLogin?.();
          break;
        case 'bapo':
          onNavigateToQAtoBA?.();
          break;
        case 'ai-course':
          onNavigateToAICourse?.();
          break;
        case 'career-audit':
          onNavigateToCareerAudit?.();
          break;
        default:
          break;
      }
    }
    setMobileMenuOpen(false);
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo('home');
  };

  const handlePricingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo('pricing');
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo('login');
  };

  const getProgramUrl = (screen: 'bapo' | 'ai-course') => {
    const pathByScreen = {
      bapo: '/qa-to-ba',
      'ai-course': '/ai-course',
    };
    return `${window.location.origin}${pathByScreen[screen]}`;
  };


  const handleQAtoBAClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo('bapo');
  };

  const handleAICourseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo('ai-course');
  };

  const showBackButton = currentView === 'bapo' || currentView === 'ai-course' || currentView === 'career-audit';

  const linkClass = (view: 'home' | 'pricing' | 'login' | 'bapo' | 'ai-course' | 'career-audit') =>
    `text-sm font-normal uppercase tracking-widest transition-all duration-300 ${
      currentView === view ? 'text-neon-green' : 'text-gray-400 hover:text-white'
    }`;

  return (
    <>
      <style>{`
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes circular-spin-glow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse-ring {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.95);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
        .discover-jobs-floating-pill {
          animation: float-gentle 3.5s ease-in-out infinite;
          display: inline-flex;
        }
        .discover-jobs-halo {
          animation: circular-spin-glow 5s linear infinite;
        }
        .discover-jobs-underline-glow {
          animation: pulse-ring 2.5s ease-in-out infinite;
        }
      `}</style>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || currentView
            ? 'bg-black/90 backdrop-blur-md border-b border-white/10 py-3'
            : 'bg-transparent py-5'
        }`}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 justify-between items-center gap-3">
          {/* Logo */}
          <div className="flex min-w-0 items-center gap-3">
            {showBackButton && (
              <button
                type="button"
                onClick={handleHomeClick}
                aria-label="Back to home"
                className="text-gray-400 hover:text-white transition-all p-2 rounded-full border border-white/10 bg-white/5"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="flex min-w-0 items-center">
              <a
                href="#"
                onClick={handleHomeClick}
                className="flex min-w-0 items-center gap-2 group"
              >
              <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-neon-green to-neon-emerald flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(74,222,128,0.6)] transition-shadow">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-black"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="truncate text-sm min-[360px]:text-base sm:text-xl font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-neon-green transition-all">
                Dheeraj Rathod Consult
              </span>
            </a>
          </div>
        </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Program Dropdown (hover) */}
            <div className="relative group py-2">
              <button
                className={`text-sm font-normal uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 focus:outline-none ${
                  currentView === 'bapo' || currentView === 'ai-course'
                    ? 'text-neon-green'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>Program</span>
                <ChevronDown size={14} className="transform transition-transform group-hover:rotate-180" />
              </button>

              {/* Dropdown – wider to fit "AI Mastery Program" on one line */}
              <div className="absolute left-0 top-full pt-2 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className="bg-white border border-gray-100 p-2 shadow-2xl rounded-xl flex flex-col gap-1">
                  <a
                    href={getProgramUrl('bapo')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg text-gray-800 hover:bg-neon-green hover:text-black transition-all whitespace-nowrap"
                  >
                    BA/PO Transition
                  </a>
                  <a
                    href={getProgramUrl('ai-course')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg text-gray-800 hover:bg-neon-green hover:text-black transition-all whitespace-nowrap"
                  >
                    AI Mastery Program
                  </a>
                </div>
              </div>
            </div>

            {/* 🔍 Discover Jobs with Floating Circular Motion Style */}
            <div className="relative discover-jobs-floating-pill group">
              {/* Rotating Circular Neon Halo Glow */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#00C896] via-[#4ade80] to-[#2dd4bf] opacity-40 blur-sm discover-jobs-halo group-hover:opacity-80 transition-opacity" />
              
              <a
                href="/discover"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/discover';
                }}
                className="relative flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/90 border-2 border-[#00C896]/70 text-xs font-black uppercase tracking-widest text-[#00C896] hover:text-white hover:border-[#00E5AA] hover:bg-black shadow-lg shadow-[#00C896]/25 transition-all duration-300"
              >
                {/* Pulsing Live Beacon */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C896]"></span>
                </span>
                <span>🔍 Discover Jobs</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#00C896]/20 text-[#4ade80] font-mono font-bold border border-[#00C896]/40">
                  LIVE
                </span>
              </a>

              {/* Floating Circular Motion Underline Indicator as requested in user diagram */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4/5 h-[3px] rounded-full bg-gradient-to-r from-transparent via-[#00C896] to-transparent discover-jobs-underline-glow shadow-[0_0_10px_#00C896]" />
            </div>

            <a
              href="#login"
              onClick={handleLoginClick}
              className={linkClass('login')}
            >
              Sign In
            </a>

            <Button
              onClick={handleBookCall}
              variant="glow"
              size="sm"
              className="uppercase text-xs font-black tracking-widest px-6 shadow-neon-green/20"
            >
              Book 1:1 Call
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 rounded-lg touch-manipulation"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f172a] border-t border-gray-800 absolute inset-x-0 w-full max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 py-5 shadow-xl flex flex-col space-y-4 animate-in slide-in-from-top-5">
          <a
            href="#"
            onClick={handleHomeClick}
            className={`text-lg font-medium transition-colors px-2 ${
              currentView === 'home' ? 'text-neon-green' : 'text-gray-400 hover:text-white'
            }`}
          >
            Home
          </a>

          {/* Mobile Program List */}
          <div className="space-y-2 px-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-gray-500 block py-1 border-b border-white/5">
              Programs
            </span>
            <a
              href={getProgramUrl('bapo')}
              target="_blank"
              rel="noopener noreferrer"
              className={`block text-lg font-medium pl-2 transition-colors ${
                currentView === 'bapo' ? 'text-neon-green' : 'text-gray-400 hover:text-white'
              }`}
            >
              — BA/PO Transition
            </a>
            <a
              href={getProgramUrl('ai-course')}
              target="_blank"
              rel="noopener noreferrer"
              className={`block text-lg font-medium pl-2 transition-colors ${
                currentView === 'ai-course' ? 'text-neon-green' : 'text-gray-400 hover:text-white'
              }`}
            >
              — AI Course
            </a>
          </div>

          {/* Mobile Discover Jobs Glow Card */}
          <div className="px-2 py-1">
            <a
              href="/discover"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                window.location.href = '/discover';
              }}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-black border-2 border-[#00C896] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-[#00C896]/20 transition-all active:scale-95"
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00C896]"></span>
                </span>
                <span className="text-[#00C896]">🔍 Discover Jobs</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00C896]/20 text-[#4ade80] font-mono font-bold border border-[#00C896]/40">
                LIVE MARKET
              </span>
            </a>
          </div>

          <a
            href="#login"
            onClick={handleLoginClick}
            className={`text-lg font-medium transition-colors px-2 ${
              currentView === 'login' ? 'text-neon-green' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </a>

          <Button
            onClick={handleBookCall}
            variant="glow"
            fullWidth
            className="uppercase font-bold tracking-widest"
          >
            Book 1:1 Call
          </Button>
        </div>
      )}
      </nav>
    </>
  );
};

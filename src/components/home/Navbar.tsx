import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, ArrowLeft } from 'lucide-react';
import { Button } from './Button';

interface NavbarProps {
  onNavigate?: (view: 'home' | 'pricing' | 'login' | 'bapo' | 'ai-course' | 'career-audit' | 'discover') => void;
  onNavigateToQAtoBA?: () => void;
  onNavigateToPricing?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToAICourse?: () => void;
  onNavigateToCareerAudit?: () => void;
  onNavigateToDiscover?: () => void;
  currentView?: 'home' | 'pricing' | 'login' | 'bapo' | 'ai-course' | 'career-audit' | 'discover';
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onNavigateToQAtoBA,
  onNavigateToPricing,
  onNavigateToLogin,
  onNavigateToHome,
  onNavigateToAICourse,
  onNavigateToCareerAudit,
  onNavigateToDiscover,
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

  const navigateTo = (view: 'home' | 'pricing' | 'login' | 'bapo' | 'ai-course' | 'career-audit' | 'discover') => {
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
        case 'discover':
          if (onNavigateToDiscover) {
            onNavigateToDiscover();
          } else {
            window.location.href = '/discover';
          }
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

  const handleDiscoverClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo('discover');
  };

  const getProgramUrl = (screen: 'bapo' | 'ai-course') => {
    const pathByScreen = {
      bapo: '/qa-to-ba',
      'ai-course': '/ai-course',
    };
    return `${window.location.origin}${pathByScreen[screen]}`;
  };

  const showBackButton = currentView === 'bapo' || currentView === 'ai-course' || currentView === 'career-audit';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-colors duration-200 border-b ${
        scrolled || currentView
          ? 'bg-[#121212]/95 backdrop-blur border-[#2e2e2e]'
          : 'bg-[#121212] border-[#2e2e2e]'
      }`}
    >
      <div className="max-w-[1200px] h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              type="button"
              onClick={handleHomeClick}
              aria-label="Back to home"
              className="text-[#b4b4b4] hover:text-[#fafafa] transition-colors p-1.5 rounded-full border border-[#2e2e2e] bg-[#242424]"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <a
            href="#"
            onClick={handleHomeClick}
            className="flex items-center gap-2.5 group"
          >
            {/* Supabase style phosphor green geometric emblem */}
            <div className="w-7 h-7 rounded-lg bg-[#121212] border border-[#2e2e2e] flex items-center justify-center group-hover:border-[#3ecf8e] transition-colors">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#3ecf8e]"
              >
                <path
                  d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium tracking-[-0.007em] text-[#fafafa]">
                JonHunter
              </span>
              <span className="text-[11px] font-normal text-[#898989] font-mono tracking-tight">
                / DRC
              </span>
            </div>
          </a>
        </div>

        {/* Center: Nav links in #b4b4b4, Circular 400, 14px */}
        <div className="hidden md:flex items-center space-x-7">
          <a
            href="#"
            onClick={handleHomeClick}
            className={`text-sm tracking-[-0.007em] transition-colors ${
              currentView === 'home' || !currentView ? 'text-[#fafafa] font-medium' : 'text-[#b4b4b4] hover:text-[#fafafa]'
            }`}
          >
            Platform
          </a>

          {/* Program Dropdown */}
          <div className="relative group py-2">
            <button
              className={`text-sm tracking-[-0.007em] transition-colors flex items-center gap-1 focus:outline-none ${
                currentView === 'bapo' || currentView === 'ai-course'
                  ? 'text-[#3ecf8e] font-medium'
                  : 'text-[#b4b4b4] hover:text-[#fafafa]'
              }`}
            >
              <span>Programs</span>
              <ChevronDown size={13} className="text-[#898989] transition-transform group-hover:rotate-180" />
            </button>

            <div className="absolute left-0 top-full pt-1.5 w-52 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-150 z-50">
              <div className="bg-[#121212] border border-[#2e2e2e] p-1.5 rounded-xl shadow-none flex flex-col gap-0.5">
                <a
                  href={getProgramUrl('bapo')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-xs rounded-lg text-[#b4b4b4] hover:text-[#fafafa] hover:bg-[#242424] transition-colors"
                >
                  BA/PO Transition
                </a>
                <a
                  href={getProgramUrl('ai-course')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-xs rounded-lg text-[#b4b4b4] hover:text-[#fafafa] hover:bg-[#242424] transition-colors"
                >
                  AI Mastery Program
                </a>
              </div>
            </div>
          </div>

          {/* Pricing link */}
          <a
            href="#pricing"
            onClick={handlePricingClick}
            className={`text-sm tracking-[-0.007em] transition-colors ${
              currentView === 'pricing' ? 'text-[#3ecf8e] font-medium' : 'text-[#b4b4b4] hover:text-[#fafafa]'
            }`}
          >
            Pricing
          </a>

          {/* 🔍 Discover Jobs Terminal Pill */}
          <a
            href="/discover"
            onClick={handleDiscoverClick}
            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium tracking-[-0.007em] border transition-colors ${
              currentView === 'discover'
                ? 'bg-[#242424] border-[#3ecf8e] text-[#fafafa]'
                : 'bg-[#181818] border-[#2e2e2e] text-[#b4b4b4] hover:border-[#4d4d4d] hover:text-[#fafafa]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e]" />
            <span>Discover Jobs</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-[#242424] text-[#3ecf8e] font-mono border border-[#2e2e2e]">
              LIVE
            </span>
          </a>

          {/* 🏢 859+ Career Boards ATS Pill */}
          <a
            href="/discover#career-pages"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '#career-pages';
              navigateTo('discover');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-[-0.007em] border border-[#2e2e2e] bg-[#141414] text-[#b4b4b4] hover:border-[#3ecf8e]/50 hover:text-[#fafafa] transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e]" />
            <span>Career Pages</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-[#1e2722] text-[#3ecf8e] font-mono border border-[#3ecf8e]/30">
              859 ATS
            </span>
          </a>
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Sign In Pill Ghost Button */}
          <a
            href="#login"
            onClick={handleLoginClick}
            className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs tracking-[-0.007em] font-normal text-[#fafafa] border border-[#393939] hover:border-[#4d4d4d] hover:bg-white/[0.04] transition-colors"
          >
            Sign In
          </a>

          {/* Primary Action: Phosphor Green Pill */}
          <button
            type="button"
            onClick={handleBookCall}
            className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs tracking-[-0.007em] font-medium text-[#121212] bg-[#3ecf8e] hover:bg-[#00c573] border border-[#3ecf8e] hover:border-[#1f4b37] transition-colors cursor-pointer"
          >
            Book 1:1 Call
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <a
            href="/discover"
            onClick={handleDiscoverClick}
            className="px-2.5 py-1 rounded-full text-xs border border-[#2e2e2e] bg-[#181818] text-[#fafafa] flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e]" />
            <span>Jobs</span>
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[#fafafa] p-1.5 rounded-md border border-[#2e2e2e] bg-[#181818]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#121212] border-b border-[#2e2e2e] px-4 py-4 flex flex-col space-y-3">
          <a
            href="#"
            onClick={handleHomeClick}
            className={`text-sm px-2 py-1.5 rounded ${
              currentView === 'home' ? 'text-[#3ecf8e]' : 'text-[#b4b4b4] hover:text-[#fafafa]'
            }`}
          >
            Platform
          </a>
          <a
            href="/discover"
            onClick={handleDiscoverClick}
            className={`text-sm px-2 py-1.5 rounded flex items-center justify-between border ${
              currentView === 'discover'
                ? 'border-[#3ecf8e] text-[#fafafa] bg-[#242424]'
                : 'border-[#2e2e2e] text-[#b4b4b4]'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3ecf8e]" />
              <span>Discover Jobs Engine</span>
            </span>
            <span className="text-[10px] font-mono text-[#3ecf8e]">LIVE</span>
          </a>
          <a
            href="/discover#career-pages"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '#career-pages';
              navigateTo('discover');
            }}
            className="text-sm px-2 py-1.5 rounded flex items-center justify-between border border-[#2e2e2e] text-[#b4b4b4]"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3ecf8e]" />
              <span>859+ Corporate Career Boards</span>
            </span>
            <span className="text-[10px] font-mono text-[#3ecf8e]">859 ATS</span>
          </a>
          <a
            href="#pricing"
            onClick={handlePricingClick}
            className={`text-sm px-2 py-1.5 rounded ${
              currentView === 'pricing' ? 'text-[#3ecf8e]' : 'text-[#b4b4b4] hover:text-[#fafafa]'
            }`}
          >
            Pricing
          </a>
          <div className="pt-2 border-t border-[#2e2e2e] flex flex-col gap-2">
            <a
              href="#login"
              onClick={handleLoginClick}
              className="text-center py-2 text-xs rounded-full border border-[#393939] text-[#fafafa]"
            >
              Sign In
            </a>
            <button
              type="button"
              onClick={handleBookCall}
              className="w-full text-center py-2 text-xs font-medium rounded-full bg-[#3ecf8e] text-[#121212]"
            >
              Book 1:1 Call
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

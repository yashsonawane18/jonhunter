import React, { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "../home/Button";

interface QAtoBANavbarProps {
  onNavigateBack?: () => void;           // Usually navigates back to Home or SignIn
  onNavigateToPricing?: () => void;      // Navigate to Pricing page
  onNavigateToLogin?: () => void;        // Navigate to Sign In page
  onNavigateToHome?: () => void;         // Navigate to Home (or scroll to top)
  currentView?: 'home' | 'pricing' | 'login' | 'bapo'; // optional active highlight
}

export const QAtoBANavbar: React.FC<QAtoBANavbarProps> = ({
  onNavigateBack,
  onNavigateToPricing,
  onNavigateToLogin,
  onNavigateToHome,
  currentView,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dark mode by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.theme = "dark";
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to section with offset (only used for Program dropdown and Book Call)
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      const yOffset = -80;
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  // Navigation handlers – use callbacks if provided, else fallback to scroll
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToHome) {
      onNavigateToHome();
    } else {
      scrollToSection("home");
    }
    setMobileMenuOpen(false);
  };

  const handleProgramClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Program dropdown opens the BA/PO item; we can scroll to the program section
    // or let the dropdown item handle it.
    // We'll keep scroll for the Program button itself.
    scrollToSection("program");
    setMobileMenuOpen(false);
  };

  const handlePricingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToPricing) {
      onNavigateToPricing();
    } else {
      scrollToSection("pricing");
    }
    setMobileMenuOpen(false);
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      scrollToSection("signin");
    }
    setMobileMenuOpen(false);
  };

  const handleBapoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // BA/PO Transition – usually scroll to the program section
    scrollToSection("bapo");
    setMobileMenuOpen(false);
  };

  const handleBookCall = () => {
    scrollToSection("register");
  };

  // Helper to get link class based on currentView
  const linkClass = (view: 'home' | 'pricing' | 'login' | 'bapo') =>
    `text-sm font-normal uppercase tracking-widest transition-all duration-300 ${
      currentView === view ? 'text-neon-green' : 'text-gray-400 hover:text-white'
    }`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/90 backdrop-blur-md border-b border-white/10 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 justify-between items-center gap-3">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Program Dropdown */}
            <div className="relative group py-2">
              <button
                onClick={handleProgramClick}
                className={`text-sm font-normal uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 focus:outline-none ${
                  currentView === 'bapo' ? 'text-neon-green' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>Program</span>
                <ChevronDown
                  size={14}
                  className="transform transition-transform group-hover:rotate-180"
                />
              </button>

              <div className="absolute left-0 top-full pt-2 w-48 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className="bg-white border border-gray-100 p-2 shadow-2xl rounded-xl">
                  <a
                    href="#bapo"
                    onClick={handleBapoClick}
                    className="block px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg text-gray-800 hover:bg-neon-green hover:text-black transition-all"
                  >
                    BA/PO Transition
                  </a>
                </div>
              </div>
            </div>

            <a
              href="#pricing"
              onClick={handlePricingClick}
              className={linkClass('pricing')}
            >
              Pricing
            </a>
            <a
              href="#signin"
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
              className="text-white p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
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
              href="#bapo"
              onClick={handleBapoClick}
              className={`block text-lg font-medium pl-2 transition-colors ${
                currentView === 'bapo' ? 'text-neon-green' : 'text-gray-400 hover:text-white'
              }`}
            >
              — BA/PO Course
            </a>
          </div>

          <a
            href="#pricing"
            onClick={handlePricingClick}
            className={`text-lg font-medium transition-colors px-2 ${
              currentView === 'pricing' ? 'text-neon-green' : 'text-gray-400 hover:text-white'
            }`}
          >
            Pricing
          </a>
          <a
            href="#signin"
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
  );
};

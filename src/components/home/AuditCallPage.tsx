import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Facebook,
  FileText,
  Gift,
  Instagram,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  User,
  Zap,
} from 'lucide-react';
import API_ENDPOINTS from '../../config/api';
import mentorImage from '../../assets/dheeraj-hero.jpg';
import { Button } from './Button';

interface AuditCallPageProps {
  onBack: () => void;
}

interface DateItem {
  id: number;
  dayName: string;
  dayNum: number;
  month: string;
  dateStr: string;
  fullDateStr: string;
}

interface UploadedFile {
  file: File;
  name: string;
  size: string;
}

const getNextDays = (): DateItem[] => {
  const days: DateItem[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 1; i <= 10; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      id: i,
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      month: monthNames[d.getMonth()],
      dateStr: `${d.getDate()} ${monthNames[d.getMonth()]}`,
      fullDateStr: d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' }),
    });
  }

  return days;
};

const availableDates = getNextDays();
const timeSlots = ['11:30 AM', '12:00 PM', '12:30 PM', '2:00 PM', '3:30 PM', '4:30 PM'];

export const AuditCallPage: React.FC<AuditCallPageProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);

    const originalTitle = document.title;
    document.title = '1:1 Career Audit | Dheeraj Rathod Consult | DRC';

    let metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc ? metaDesc.getAttribute('content') : '';
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      'Get More Interview Calls with a personalized 1:1 Career Audit. Receive a complete 30-day job search strategy, ATS resume rewrite, LinkedIn audit, and recruiter contacts.'
    );

    return () => {
      document.title = originalTitle;
      if (metaDesc) {
        if (originalDesc) {
          metaDesc.setAttribute('content', originalDesc);
        } else {
          metaDesc.remove();
        }
      }
    };
  }, []);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<DateItem>(availableDates[0]);
  const [selectedTime, setSelectedTime] = useState('11:30 AM');
  const [timezone, setTimezone] = useState('(GMT+5:30) Chennai, Kolkata, Mumbai, New Delhi (IST)');
  const [dateScrollIndex, setDateScrollIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const schedulerRef = useRef<HTMLDivElement>(null);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToScheduler = () => {
    schedulerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const setFile = (file: File) => {
    setUploadedFile({
      file,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    });
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const removeUploadedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const scrollDatesLeft = () => {
    if (dateScrollIndex > 0) {
      setDateScrollIndex(dateScrollIndex - 1);
    }
  };

  const scrollDatesRight = () => {
    if (dateScrollIndex < availableDates.length - 4) {
      setDateScrollIndex(dateScrollIndex + 1);
    }
  };

  const handleContinueToDetails = () => {
    if (!selectedDate || !selectedTime) {
      setValidationError('Please select an available date and time.');
      return;
    }
    setValidationError(null);
    setStep(2);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setValidationError('Please fill out all required fields.');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      const bookingData = new FormData();
      bookingData.append('date', selectedDate.dateStr);
      bookingData.append('time', selectedTime);
      bookingData.append('timezone', timezone);
      bookingData.append('fullName', formData.name.trim());
      bookingData.append('email', formData.email.trim());
      bookingData.append('whatsappNumber', formData.phone.trim());

      if (uploadedFile?.file) {
        bookingData.append('resume', uploadedFile.file);
      }

      const response = await fetch(API_ENDPOINTS.CAREER_AUDIT_BOOKING, {
        method: 'POST',
        body: bookingData,
      });

      if (!response.ok) {
        let message = 'Unable to confirm this slot. Please try another date or time.';
        try {
          const errorBody = await response.json();
          message = errorBody.message || errorBody.error || message;
        } catch {
          message = response.statusText || message;
        }
        throw new Error(message);
      }

      setStep(3);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Unable to confirm this slot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const carouselSlides = [
    {
      id: 1,
      title: '1:1 Career Audit Call',
      description: 'Get a focused review of your resume, LinkedIn, and job-search plan without paying the regular session fee.',
    },
    {
      id: 2,
      title: '30-Day Job Search Plan',
      description: 'Personalized roadmap with daily action steps and strategies to land your dream job.',
    },
    {
      id: 3,
      title: 'ATS-Optimized Resume Strategy',
      description: 'Pass through ATS filters and catch hiring managers attention with a professionally crafted resume.',
    },
  ];

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-800 via-emerald-950 to-black min-h-screen text-gray-100 font-sans relative overflow-hidden pt-24 pb-16 px-3 sm:px-6">
      <style>{`
        @keyframes pulse-green {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes float-badge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes strike-in {
          0% { width: 0; opacity: 0; }
          100% { width: 100%; opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(16, 185, 129, 0.1); }
          50% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.5), 0 0 60px rgba(16, 185, 129, 0.2); }
        }
        @keyframes price-pop {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes countdown-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-green {
          animation: pulse-green 2s ease-in-out infinite;
        }
        .animate-float-badge {
          animation: float-badge 2.5s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-price-pop {
          animation: price-pop 0.6s ease-out forwards;
        }
        .animate-countdown-pulse {
          animation: countdown-pulse 1.5s ease-in-out infinite;
        }
        .slide-transition {
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .carousel-dot {
          transition: all 0.3s ease;
        }
        .carousel-dot.active {
          background: #34d399;
          width: 28px;
        }
      `}</style>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-emerald-500/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-emerald-400/25 rounded-full blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-gray-900 border border-white/10 flex flex-col transform transition-all duration-300">
            <div className="p-4 sm:p-5 border-b border-gray-100 bg-white flex items-center justify-between gap-3">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-bold text-xs py-2 px-4 shadow-sm rounded-full transition-all group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to Homepage
              </button>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                <Sparkles size={12} />
                Limited Free Slots
              </span>
            </div>

            <div className="bg-[#121824] m-4 sm:m-5 rounded-2xl border border-gray-800/80 p-5 sm:p-6 md:p-8 relative overflow-hidden text-white flex flex-col md:flex-row gap-6 justify-between items-stretch md:items-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(34,197,94,0.12)_0%,transparent_70%)] pointer-events-none" />

              <div className="flex-1 space-y-4 text-left z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                  <Clock size={13} />
                  Today's limited offer
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                  Get More <span className="text-emerald-400">Interview Calls</span> <br />
                  With a Proven Job Search Plan
                </h2>

                <ul className="space-y-2 pt-1 text-sm text-gray-300 font-light">
                  <li className="flex items-center gap-2">
                    <Check size={15} className="text-emerald-400 shrink-0" />
                    <span>ATS-optimized resume rewrite</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={15} className="text-emerald-400 shrink-0" />
                    <span>Recruiter-friendly LinkedIn optimization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={15} className="text-emerald-400 shrink-0" />
                    <span>Targeted job search (no mass applying)</span>
                  </li>
                </ul>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase tracking-wider font-extrabold px-3.5 py-1.5 rounded-full inline-block">
                    30-min 1:1 Call
                  </span>
                  <span className="bg-white/10 text-white border border-white/15 text-[10px] uppercase tracking-wider font-extrabold px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
                    <ShieldCheck size={13} />
                    No payment required
                  </span>

                  <div className="flex items-center gap-2 text-gray-400 pl-1">
                    <Facebook size={16} className="hover:text-white transition-colors cursor-pointer" />
                    <Instagram size={16} className="hover:text-white transition-colors cursor-pointer" />
                  </div>
                </div>

                <p className="text-[11px] text-emerald-400 font-medium leading-relaxed pt-2 border-t border-white/5">
                  A personalized 30-day strategy to fix your resume, LinkedIn & job search
                </p>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-300">
                  <Zap size={13} className="text-emerald-300" />
                  Takes less than 1 minute to reserve
                </div>
              </div>

              <div className="w-full max-w-[260px] md:w-56 lg:w-60 h-60 sm:h-72 md:h-72 mx-auto relative shrink-0 overflow-hidden rounded-2xl bg-gradient-to-t from-emerald-950 to-emerald-800 border border-white/10 shadow-lg group z-10">
                <img
                  src={mentorImage}
                  alt="Dheeraj Rathod"
                  className="w-full h-full object-cover object-top filter brightness-110 contrast-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-md">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Live with Dheeraj</p>
                  <p className="mt-0.5 text-xs font-semibold text-white">Career audit + action plan</p>
                </div>
              </div>
            </div>

            <div className="px-5 sm:px-6 md:px-8 pb-7 sm:pb-8 text-left space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-xs font-black">
                  <Star size={13} className="fill-amber-600 stroke-none" />
                  5.0
                </span>
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                  Popular
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
                Get More Interview Calls - Proven Job Search Plan
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 italic border-l-2 border-emerald-500 pl-4 py-1">
                "Dheeraj Rathod is highly recommended for his insightful guidance on remote job hunting. Attendees praise his personalized and practical strategies that elevate confidence and lead to success."
              </p>

              <div className="text-sm text-gray-700 space-y-3 font-light leading-relaxed">
                <p>Are you applying to hundreds of jobs but not getting interview calls?</p>
                <p>
                  I will help you fix that with a personalized, data-backed job search strategy designed to get you more interviews whether you are targeting remote, hybrid, or top product-based companies.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-5 mt-6 shadow-xl shadow-emerald-100">
                <div className="absolute right-[-24px] top-[-24px] h-24 w-24 rounded-full bg-emerald-200/40 blur-2xl" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                      <Sparkles size={12} />
                      Included in your free call
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 mt-2 leading-tight">
                      Walk away with a clearer interview-call plan.
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-light mt-1 leading-relaxed">
                      Your Rs.0 booking includes focused guidance on the exact pieces blocking interviews.
                    </p>
                    <div className="mt-3 overflow-hidden rounded-xl border border-emerald-100 bg-white/80">
                      <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-800">
                        <Sparkles size={14} className="text-emerald-600" />
                        <span>{carouselSlides[currentSlide].title}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-2xl bg-gradient-to-br from-white to-emerald-50 p-5 text-left border-2 border-emerald-200 shadow-lg shadow-emerald-100/60 animate-pulse-glow relative">
                    <div className="absolute -top-2 -right-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-white shadow-lg animate-countdown-pulse">
                        <Clock size={10} />
                        Limited Time
                      </span>
                    </div>
                    
                    <div className="flex items-end gap-4 sm:justify-end">
                      <div className="text-left">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Regular Price</span>
                        <span className="text-gray-400 line-through text-2xl font-bold">Rs.500</span>
                      </div>
                      <div className="text-left">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Today Only</span>
                        <span className="text-5xl font-black text-emerald-600 leading-none animate-price-pop">Rs.0</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-emerald-200/50">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                          <Clock size={12} className="text-emerald-500" />
                          Offer expires soon
                        </span>
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                          ⚡ Save 100%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                  <div className="rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 font-semibold text-gray-700 flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    Resume review
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 font-semibold text-gray-700 flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    LinkedIn audit
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 font-semibold text-gray-700 flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    30-day search plan
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div ref={schedulerRef} className="scroll-mt-24 lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-gray-900 border border-gray-100 flex flex-col min-h-[500px]">
            {step === 1 && (
              <div className="p-5 sm:p-8 flex flex-col h-full justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="text-emerald-600 shrink-0" size={20} />
                    <h2 className="text-lg font-extrabold text-gray-900">When should we meet?</h2>
                  </div>

                  <div className="relative flex items-center mb-6">
                    <button
                      onClick={scrollDatesLeft}
                      disabled={dateScrollIndex === 0}
                      className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 bg-white hover:bg-gray-50 transition-colors shrink-0 mr-1.5 ${dateScrollIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="flex-1 flex gap-1.5 sm:gap-2 overflow-hidden justify-between">
                      {availableDates.slice(dateScrollIndex, dateScrollIndex + 4).map((date) => {
                        const isSelected = selectedDate?.id === date.id;
                        return (
                          <button
                            key={date.id}
                            onClick={() => setSelectedDate(date)}
                            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-3 px-1.5 sm:px-2 rounded-xl border text-center transition-all ${
                              isSelected
                                ? 'bg-emerald-500/10 border-emerald-600 ring-2 ring-emerald-600/30 text-emerald-950 font-bold'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-100'
                            }`}
                          >
                            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">{date.dayName}</span>
                            <span className="text-lg font-black mt-1">{date.dayNum}</span>
                            <span className="text-[9px] opacity-90">{date.month}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={scrollDatesRight}
                      disabled={dateScrollIndex >= availableDates.length - 4}
                      className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 bg-white hover:bg-gray-50 transition-colors shrink-0 ml-1.5 ${dateScrollIndex >= availableDates.length - 4 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                      <Clock size={15} className="text-emerald-600" />
                      Select time of day
                    </h3>

                    <div className="grid grid-cols-2 min-[420px]:grid-cols-3 gap-2">
                      {timeSlots.map((slot) => {
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-100'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 mt-6">
                    <label className="text-sm font-extrabold text-gray-900 block">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:border-emerald-600"
                    >
                      <option>(GMT+5:30) Chennai, Kolkata, Mumbai, New Delhi (IST)</option>
                      <option>(GMT+0:00) London, Dublin (GMT)</option>
                      <option>(GMT-5:00) New York, Toronto (EST)</option>
                      <option>(GMT+8:00) Singapore, Hong Kong (SGT)</option>
                      <option>(GMT+10:00) Sydney, Melbourne (AEST)</option>
                    </select>
                  </div>
                </div>

                {validationError && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium border border-red-100">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    onClick={handleContinueToDetails}
                    variant="glow"
                    fullWidth
                    className="py-3.5 uppercase text-xs font-black tracking-widest bg-emerald-600 border-none hover:bg-emerald-700 text-white shadow-emerald-500/20"
                  >
                    Continue
                  </Button>
                  <span className="text-[10px] text-gray-400 text-center block mt-2 font-light">
                    Next step: Enter name, phone and upload CV
                  </span>
                </div>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmitBooking} className="p-5 sm:p-8 flex flex-col h-full justify-between space-y-5">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">Confirm Your Booking</h2>
                    <p className="text-xs text-gray-400 font-light mt-0.5">Please provide your details below to secure your slot.</p>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-gray-900">Selected Appointment</p>
                      <p className="text-gray-600">
                        {selectedDate?.fullDateStr} @ {selectedTime}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-emerald-600 hover:text-emerald-700 font-bold uppercase tracking-wider text-[10px]"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block mb-1">Full Name *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3.5 text-gray-400"><User size={14} /></span>
                        <input
                          type="text"
                          required
                          placeholder="Dheeraj Rathod"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full text-xs pl-9 pr-3 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block mb-1">Email Address *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3.5 text-gray-400"><Mail size={14} /></span>
                        <input
                          type="email"
                          required
                          placeholder="example@gmail.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full text-xs pl-9 pr-3 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block mb-1">Phone / WhatsApp Number *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3.5 text-gray-400"><Phone size={14} /></span>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full text-xs pl-9 pr-3 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block mb-1.5">Upload CV / Resume (Optional)</label>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                      />

                      {!uploadedFile ? (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={triggerFileSelect}
                          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                            isDragging ? 'bg-emerald-50 border-emerald-500' : 'bg-gray-50 border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <Upload className="text-gray-400 mb-1.5" size={20} />
                            <p className="text-xs font-bold text-gray-700">Drag & drop resume here</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">or click to browse from device (PDF, DOCX)</p>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                              <FileText className="text-emerald-700" size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">{uploadedFile.name}</p>
                              <p className="text-[10px] text-gray-500 font-light">{uploadedFile.size}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeUploadedFile}
                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {validationError && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium border border-red-100">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <div className="bg-emerald-50/50 rounded-xl p-3 flex items-center justify-between gap-3 border border-emerald-100/50 text-[11px] font-semibold text-emerald-800">
                    <span>Total Investment Due:</span>
                    <span className="text-emerald-700 font-extrabold text-sm">Rs.0 (Free Offer)</span>
                  </div>

                  <Button
                    type="submit"
                    variant="glow"
                    fullWidth
                    disabled={isSubmitting}
                    className="py-3.5 uppercase text-xs font-black tracking-widest bg-emerald-600 border-none hover:bg-emerald-700 text-white shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Confirming slot...' : 'Confirm Free Booking'}
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="p-5 sm:p-8 text-center flex flex-col justify-center items-center my-auto space-y-6">
                <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-100 animate-bounce">
                  <CheckCircle2 size={42} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Booking Confirmed!</h2>
                  <p className="text-xs text-gray-500 leading-relaxed font-light">
                    Awesome, <span className="font-bold text-gray-800">{formData.name}</span>! Your slot is officially registered in our system.
                  </p>
                </div>

                <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2 text-left text-xs text-gray-700">
                  <div className="flex justify-between border-b border-gray-200/50 pb-2">
                    <span className="text-gray-400">Date</span>
                    <span className="font-bold text-gray-900">{selectedDate?.fullDateStr}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/50 pb-2">
                    <span className="text-gray-400">Time</span>
                    <span className="font-bold text-gray-900">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-gray-400">Host</span>
                    <span className="font-bold text-gray-900">Dheeraj Rathod (1:1 Video Call)</span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                  A Google Meet invitation has been dispatched to <span className="font-semibold text-emerald-600">{formData.email}</span>. Please click below to append it to your Calendar right now.
                </p>

                <div className="w-full space-y-2 pt-2">
                  <Button
                    onClick={() => {
                      const title = encodeURIComponent('1:1 Career Audit & Proven Job Search Plan');
                      const details = encodeURIComponent('30-minute diagnostic session with Dheeraj Rathod. Bring your CV!');
                      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&sf=true&output=xml`;
                      window.open(calendarUrl, '_blank', 'noopener,noreferrer');
                    }}
                    variant="outline"
                    fullWidth
                    className="py-3 text-xs uppercase font-black tracking-widest text-emerald-700 border-emerald-200 hover:bg-emerald-50 flex items-center justify-center gap-1.5"
                  >
                    <Calendar size={16} />
                    Add to Google Calendar
                  </Button>

                  <Button
                    onClick={onBack}
                    variant="primary"
                    fullWidth
                    className="py-3.5 text-xs uppercase font-black tracking-widest bg-gray-900 border-none hover:bg-black text-white"
                  >
                    Back to Homepage
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditCallPage;

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Loader,
  CheckCircle,
  Check,
  UserRound,
  Mail,
  BriefcaseBusiness,
  Phone,
  Clock,
  ShieldCheck,
  User,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { Button } from "./home/Button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import AuthLayout from "./AuthLayout";
import API_ENDPOINTS from "../config/api";

interface SignUpFormData {
  fullName: string;
  email: string;
  currentJobPosition: string;
  mobileNumber: string;
  isWhatsApp: boolean;
  receiveUpdates: boolean;
}

interface SignUpProps {
  onSwitchToSignIn: () => void;
  onSignUpSuccess: () => void;
}

type LegalModal = "terms" | "privacy" | null;

const legalContent = {
  terms: {
    title: "Terms and Conditions",
    description:
      "Please review these terms for using Dheeraj Rathod Consult (DRC) job-search services.",
    sections: [
      {
        heading: "Service overview",
        body: "DRC provides career and job-search support including profile review, job discovery, CV guidance, application tracking, and human-assisted application support based on the details you share.",
      },
      {
        heading: "Account information",
        body: "You agree to provide accurate name, email, phone number, career details, resume information, job preferences, and any other details needed to support your job search.",
      },
      {
        heading: "Your responsibilities",
        body: "You are responsible for reviewing your profile details, attending interviews, responding to employers, verifying job opportunities, and making final decisions about applications, offers, salary, and employment.",
      },
      {
        heading: "Applications and employer platforms",
        body: "When DRC helps with applications, information may be used to complete forms, tailor materials, or communicate application progress. Employer websites, job boards, and recruiters remain third-party services with their own rules.",
      },
      {
        heading: "No guaranteed outcome",
        body: "DRC works to improve application quality, matching, and visibility, but interview calls, job offers, salary outcomes, timelines, and employer decisions are not guaranteed.",
      },
      {
        heading: "Communication",
        body: "DRC may contact you by email, phone, WhatsApp, or other shared contact details for onboarding, service updates, consultation offers, application progress, account support, and important notices.",
      },
      {
        heading: "Documents and resume content",
        body: "You confirm that resumes, work samples, certifications, portfolio links, and profile information shared with DRC are truthful and that you have the right to use and share them.",
      },
      {
        heading: "Plans, payments, and refunds",
        body: "Any paid plan, consultation, refund, or service package is governed by the specific offer communicated to you at purchase or onboarding. Delivered work, setup effort, and processed applications may affect refund eligibility.",
      },
      {
        heading: "Fair use",
        body: "You agree not to misuse the platform, submit false information, upload harmful files, or use DRC services for unlawful or misleading activity.",
      },
      {
        heading: "Changes to service",
        body: "DRC may update features, workflows, pricing, eligibility, or these terms as the service improves. Continued use means you accept the latest applicable terms.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "How DRC uses your information to run job-search support and protect your profile.",
    sections: [
      {
        heading: "Information we collect",
        body: "DRC may collect your name, email, mobile number, current role, job preferences, resume, skills, application records, and service communication history.",
      },
      {
        heading: "How we use it",
        body: "Your information is used to create your account, understand your career goals, recommend jobs, tailor resumes, submit or support applications, track progress, and provide consultation updates.",
      },
      {
        heading: "Resume and profile data",
        body: "Resume and profile details are used for job matching and application support. They are shared only where needed to evaluate or apply for roles on your behalf or provide the requested service.",
      },
      {
        heading: "Sharing with employers and tools",
        body: "When supporting your applications, DRC may use or share relevant profile details with employer systems, job boards, recruiters, application forms, or operational tools needed to provide the service.",
      },
      {
        heading: "Service communications",
        body: "If you opt in to updates, DRC may send job-search tips, consultation offers, product updates, or service reminders. You can ask to stop marketing updates at any time.",
      },
      {
        heading: "Access and correction",
        body: "You can request correction of inaccurate profile information or ask for help updating details used for job matching and application support.",
      },
      {
        heading: "Retention",
        body: "DRC keeps information for as long as needed to provide services, maintain account records, resolve support requests, meet business needs, or comply with applicable obligations.",
      },
      {
        heading: "Data care",
        body: "DRC aims to keep your information accurate, secure, and limited to the purpose of helping with your job search and account experience.",
      },
    ],
  },
};

const SignUp: React.FC<SignUpProps> = ({
  onSwitchToSignIn,
  onSignUpSuccess,
}) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showExistingModal, setShowExistingModal] = useState(false);
  const [legalModal, setLegalModal] = useState<LegalModal>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    defaultValues: {
      receiveUpdates: false,
    },
  });

  const receiveUpdates = watch("receiveUpdates");
  const activeLegalContent = legalModal ? legalContent[legalModal] : null;

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const payload = {
        email: data.email.trim().toLowerCase(),
        name: data.fullName?.trim() || "",
        contact_number: data.mobileNumber?.trim() || "",
        is_whatsapp: data.isWhatsApp ?? false,
        job_title: data.currentJobPosition?.trim() || "",
      };

      const response = await fetch(API_ENDPOINTS.SIGNUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage =
            errorData.message ||
            errorData.error ||
            errorData.detail ||
            errorText;
        } catch {
          // Backend sometimes returns plain text instead of JSON.
        }

        console.error("Sign up failed:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });

        // Check if the error indicates email already exists
        const isEmailExists =
          response.status === 409 ||
          errorMessage.toLowerCase().includes("already exists") ||
          errorMessage.toLowerCase().includes("already registered") ||
          errorMessage.toLowerCase().includes("email exists");

        if (isEmailExists) {
          setShowExistingModal(true);
        } else {
          alert(
            `Sign up failed: ${
              errorMessage ||
              "The signup API rejected the request. It may still require a password on the backend."
            }`
          );
        }
        return;
      }

      const responseData = await response.json();
      console.log("Sign up successful:", responseData);

      // Show success modal for new user
      setShowSuccessModal(true);
    } catch (error) {
      console.error("An error occurred during sign up:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="relative">
      {/* Back button (unchanged) */}
      <button
        type="button"
        onClick={onSwitchToSignIn}
        className="absolute top-6 left-6 z-50 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors duration-300"
        aria-label="Go back to sign in"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      <AuthLayout
        title="Start Your DRC Job Search"
        subtitle="Create your account. We will collect detailed preferences and CV information after this step."
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04]"
        >
          <div className="mb-5 border-b border-gray-100 pb-4 dark:border-white/10">
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              Basic details
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              No password is required here. DRC will guide you through job
              preferences and CV setup next.
            </p>
          </div>

          <div className="space-y-4">
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="text-sm font-semibold text-gray-800 transition-colors duration-300 dark:text-gray-100"
              >
                Full Name
              </Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className={`h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-gray-900 shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-transparent focus:ring-2 focus:ring-jobright-teal dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-gray-500 dark:hover:border-white/20 dark:focus:ring-neon-green ${
                    errors.fullName ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                  {...register("fullName", {
                    required: "Full name is required",
                    setValueAs: (value) => value.trim(),
                    minLength: {
                      value: 2,
                      message: "Full name must be at least 2 characters",
                    },
                    validate: (value) =>
                      /^[a-zA-Z\s.'-]+$/.test(value) ||
                      "Full name can only contain letters, spaces, apostrophes, periods, and hyphens",
                  })}
                  aria-describedby={
                    errors.fullName ? "fullName-error" : undefined
                  }
                />
              </div>
              {errors.fullName && (
                <p
                  id="fullName-error"
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-gray-800 transition-colors duration-300 dark:text-gray-100"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-gray-900 shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-transparent focus:ring-2 focus:ring-jobright-teal dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-gray-500 dark:hover:border-white/20 dark:focus:ring-neon-green ${
                    errors.email ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                  {...register("email", {
                    required: "Email is required",
                    setValueAs: (value) => value.trim().toLowerCase(),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p
                  id="email-error"
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Current Job Position Field */}
            <div className="space-y-2">
              <Label
                htmlFor="currentJobPosition"
                className="text-sm font-semibold text-gray-800 transition-colors duration-300 dark:text-gray-100"
              >
                Current Role
              </Label>
              <div className="relative">
                <BriefcaseBusiness className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="currentJobPosition"
                  type="text"
                  placeholder="e.g. Backend Developer"
                  className={`h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-gray-900 shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-transparent focus:ring-2 focus:ring-jobright-teal dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-gray-500 dark:hover:border-white/20 dark:focus:ring-neon-green ${
                    errors.currentJobPosition
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  {...register("currentJobPosition", {
                    required: "Current role is required",
                    setValueAs: (value) => value.trim(),
                    minLength: {
                      value: 2,
                      message: "Current role must be at least 2 characters",
                    },
                  })}
                  aria-describedby={
                    errors.currentJobPosition
                      ? "currentJobPosition-error"
                      : undefined
                  }
                />
              </div>
              {errors.currentJobPosition && (
                <p
                  id="currentJobPosition-error"
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {errors.currentJobPosition.message}
                </p>
              )}
            </div>

            {/* Mobile Number Field */}
            <div className="space-y-2">
              <Label
                htmlFor="mobileNumber"
                className="text-sm font-semibold text-gray-800 transition-colors duration-300 dark:text-gray-100"
              >
                Mobile Number
              </Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="mobileNumber"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter mobile number"
                  onKeyDown={(e) => {
                    // Allow: backspace, delete, tab, escape, enter, arrows, home, end
                    const allowed = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
                    if (allowed.includes(e.key)) return;
                    // Allow Ctrl/Cmd+A, C, V, X
                    if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) return;
                    // Block anything that isn't a digit
                    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
                  }}
                  className={`h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-gray-900 shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-transparent focus:ring-2 focus:ring-jobright-teal dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-gray-500 dark:hover:border-white/20 dark:focus:ring-neon-green ${
                    errors.mobileNumber ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                  {...register("mobileNumber", {
                    required: "Mobile number is required",
                    setValueAs: (value) => value.trim(),
                    pattern: {
                      value: /^[0-9\s\-\+\(\)]+$/,
                      message: "Please enter a valid mobile number",
                    },
                    validate: (value) => {
                      const digitsOnly = value.replace(/\D/g, "");
                      if (digitsOnly.length < 10) {
                        return "Mobile number must contain at least 10 digits";
                      }
                      if (digitsOnly.length > 15) {
                        return "Mobile number cannot exceed 15 digits";
                      }
                      return true;
                    },
                  })}
                  aria-describedby={
                    errors.mobileNumber ? "mobileNumber-error" : undefined
                  }
                />
              </div>

              {/* WhatsApp tick */}
              <div className="flex items-center gap-2 mt-2">
                <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                  <input
                    id="isWhatsApp"
                    type="checkbox"
                    checked={!!watch("isWhatsApp")}
                    onChange={(e) => setValue("isWhatsApp", e.target.checked)}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 bg-white checked:border-[#25D366] checked:bg-[#25D366] focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 dark:border-white/25 dark:bg-black"
                  />
                  <Check className="pointer-events-none absolute h-2.5 w-2.5 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                </span>
                <label
                  htmlFor="isWhatsApp"
                  className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-600 select-none dark:text-gray-400"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[#25D366] flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Is this your WhatsApp number?
                </label>
              </div>

              {errors.mobileNumber && (
                <p
                  id="mobileNumber-error"
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {errors.mobileNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Checkbox for updates with Brand Colors */}
          <div className="mt-5 flex items-start space-x-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
              <input
                id="receiveUpdates"
                type="checkbox"
                checked={!!receiveUpdates}
                onChange={(event) =>
                  setValue("receiveUpdates", event.target.checked)
                }
                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 bg-white checked:border-[#00d4aa] checked:bg-[#00d4aa] focus:outline-none focus:ring-2 focus:ring-[#00d4aa]/60 dark:border-white/25 dark:bg-black"
              />
              <Check
                className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100"
                strokeWidth={3}
              />
            </span>
            <Label
              htmlFor="receiveUpdates"
              className="cursor-pointer text-sm leading-relaxed text-gray-700 transition-colors duration-300 dark:text-gray-200"
            >
              Send me DRC job-search updates, consultation offers, and progress
              reminders.
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isSubmitting}
            className="mt-5 flex h-12 items-center justify-center gap-2 rounded-lg text-base font-semibold shadow-[0_14px_35px_rgba(16,185,129,0.22)] dark:shadow-[0_0_22px_rgba(255,255,255,0.18)]"
          >
            {isSubmitting && <Loader className="h-5 w-5 animate-spin" />}
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>

          {/* Terms acceptance */}
          <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-center text-xs leading-relaxed text-gray-500 transition-colors duration-300 dark:bg-white/[0.03] dark:text-gray-400">
            <p>
              By continuing, you agree to DRC's{" "}
              <button
                type="button"
                className="text-jobright-teal dark:text-neon-green hover:underline focus:underline focus:outline-none font-medium transition-colors duration-300"
                onClick={() => setLegalModal("terms")}
              >
                Terms and Conditions
              </button>{" "}
              and the{" "}
              <button
                type="button"
                className="text-jobright-teal dark:text-neon-green hover:underline focus:underline focus:outline-none font-medium transition-colors duration-300"
                onClick={() => setLegalModal("privacy")}
              >
                Privacy Policy
              </button>
            </p>
          </div>

          {/* Sign In Link */}
          <div className="mt-5 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
              Already a member?{" "}
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="text-jobright-teal dark:text-neon-green hover:underline focus:underline focus:outline-none font-medium transition-colors duration-300"
              >
                Sign in now
              </button>
            </p>
          </div>
        </form>
      </AuthLayout>

      {/* Legal Terms Dialog (unchanged) */}
      <Dialog
        open={!!legalModal}
        onOpenChange={(open) => !open && setLegalModal(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto border-gray-200 bg-white text-gray-900 dark:border-white/10 dark:bg-[#080808] dark:text-white sm:max-w-2xl">
          {activeLegalContent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {activeLegalContent.title}
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  {activeLegalContent.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {activeLegalContent.sections.map((section) => (
                  <section
                    key={section.heading}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {section.heading}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {section.body}
                    </p>
                  </section>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-500">
                This summary is written for the DRC frontend experience and may
                be replaced by a formal legal document when your business
                publishes one.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* SUCCESS MODAL (new user) */}
      {showSuccessModal && (
        <div
          id="registration-success-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
        >
          <div className="relative bg-[#0d1527] border border-white/10 rounded-3xl p-8 max-w-xl w-full text-center overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.25)] transition-all duration-300 transform scale-100 animate-in zoom-in-95 duration-300">
            {/* Ambient aesthetic glow spots */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#22c55e]/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#06b6d4]/10 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Glowing review icon animation */}
            <div className="relative w-20 h-20 rounded-full bg-[#15803d]/20 border-2 border-[#22c55e]/50 flex items-center justify-center mx-auto mb-6 text-[#4ade80] shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <Clock
                size={40}
                className="text-[#4ade80] animate-spin [animation-duration:10s]"
              />
              <ShieldCheck
                size={20}
                className="absolute bottom-1 right-1 text-[#4ade80] bg-black rounded-full"
              />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-4 font-sans">
              Application Received & Under Review
            </h3>

            <div className="text-gray-300 text-sm leading-relaxed space-y-3 mb-6 max-w-md mx-auto text-left font-sans">
              <p>
                Your details have been successfully submitted to the DRC team
                and are currently being reviewed.
              </p>
              <p>
                Our consultants will evaluate your profile, experience, and
                career objectives to identify suitable opportunities and next
                steps.
              </p>
              <p>
                You can expect an update from our team shortly regarding your
                profile assessment and recommendations.
              </p>
            </div>

            <div className="bg-black/20 border border-white/5 rounded-2xl p-5 mb-8 text-left space-y-4 font-sans">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-gray-400 border-b border-white/5 pb-2">
                Need Assistance?
              </h4>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-center gap-3 text-gray-300">
                  <User size={16} className="text-[#4ade80]" />
                  <div>
                    <span className="block text-gray-500 text-[9px] uppercase font-extrabold tracking-wider">
                      Career Consultant
                    </span>
                    <span className="font-bold text-white text-sm">
                      Dheeraj Rathod
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <a
                    href="mailto:Connect@dheerajrathodconsult.com"
                    className="flex items-center gap-2.5 text-gray-300 hover:text-[#4ade80] transition-colors p-2 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <Mail size={15} className="text-[#4ade80]" />
                    <span className="font-semibold text-xs truncate">
                      Connect@dheerajrathodconsult.com
                    </span>
                  </a>

                  <a
                    href="tel:+918625063353"
                    className="flex items-center gap-2.5 text-gray-300 hover:text-[#4ade80] transition-colors p-2 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <Phone size={15} className="text-[#4ade80]" />
                    <span className="font-semibold text-xs shrink-0">
                      +91 86250 63353
                    </span>
                  </a>
                </div>

                <a
                  href="https://wa.me/918625063353"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 text-[#4ade80] hover:text-white bg-[#22c55e]/10 hover:bg-[#22c55e]/20 transition-all py-2.5 px-4 rounded-xl border border-[#22c55e]/20 text-xs font-bold w-full uppercase tracking-widest shadow-sm"
                >
                  <MessageSquare size={15} />
                  <span>WhatsApp Support</span>
                </a>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed pt-2.5 border-t border-white/5">
                For any questions regarding your profile review, application
                process, or career guidance, feel free to contact our support
                team.
              </p>
            </div>

            <button
              onClick={() => {
                setShowSuccessModal(false);
                onSignUpSuccess();
              }}
              className="w-full bg-white hover:bg-[#4ade80] hover:text-black text-black font-extrabold uppercase text-xs tracking-widest py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(74,222,128,0.7)] font-sans"
            >
              Back to Main Website
            </button>
          </div>
        </div>
      )}

      {/* EXISTING USER MODAL (email already registered) */}
      {showExistingModal && (
        <div
          id="existing-user-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
        >
          <div className="relative bg-[#0d1527] border border-white/10 rounded-3xl p-8 max-w-xl w-full text-center overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.25)] transition-all duration-300 transform scale-100 animate-in zoom-in-95 duration-300">
            {/* Ambient glow spots (warm amber tone) */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Icon - alert circle with exclamation */}
            <div className="relative w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center mx-auto mb-6 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
              <AlertCircle size={40} className="text-amber-400" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-4 font-sans">
              Application Already in Progress
            </h3>

            <div className="text-gray-300 text-sm leading-relaxed space-y-3 mb-6 max-w-md mx-auto text-left font-sans">
              <p>
                This email address is already registered with Dheeraj Rathod Consult (DRC).
              </p>
              <p>
                Your request is already in our system. Please contact our support team directly for assistance with your existing application or to proceed further.
              </p>
              <p>
                Our team will help you with next steps and answer any questions regarding your profile.
              </p>
            </div>

            {/* Contact Details for Existing Users */}
            <div className="bg-black/20 border border-white/5 rounded-2xl p-5 mb-8 text-left space-y-4 font-sans">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-gray-400 border-b border-white/5 pb-2">
                Contact DRC Support
              </h4>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail size={16} className="text-amber-400" />
                  <div>
                    <span className="block text-gray-500 text-[9px] uppercase font-extrabold tracking-wider">
                      Email
                    </span>
                    <a
                      href="mailto:Connect@dheerajrathodconsult.com"
                      className="font-bold text-white text-sm hover:text-amber-400 transition-colors"
                    >
                      Connect@dheerajrathodconsult.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-300">
                  <Phone size={16} className="text-amber-400" />
                  <div>
                    <span className="block text-gray-500 text-[9px] uppercase font-extrabold tracking-wider">
                      Phone / WhatsApp
                    </span>
                    <a
                      href="tel:8625063353"
                      className="font-bold text-white text-sm hover:text-amber-400 transition-colors"
                    >
                      8625063353
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-300 pt-1 border-t border-white/10 mt-2">
                  <BriefcaseBusiness size={16} className="text-amber-400" />
                  <div>
                    <span className="block text-gray-500 text-[9px] uppercase font-extrabold tracking-wider">
                      Consultancy
                    </span>
                    <span className="font-bold text-white text-sm">
                      Dheeraj Rathod Consult
                    </span>
                  </div>
                </div>
              </div>

              <a
                href="https://wa.me/918625063353"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 transition-all py-2.5 px-4 rounded-xl border border-amber-500/20 text-xs font-bold w-full uppercase tracking-widest shadow-sm"
              >
                <MessageSquare size={15} />
                <span>Chat on WhatsApp</span>
              </a>

              <p className="text-[11px] text-gray-400 leading-relaxed pt-2.5 border-t border-white/5">
                Our support team is available to assist you with your existing application, profile updates, or any career guidance.
              </p>
            </div>

            <button
              onClick={() => {
                setShowExistingModal(false);
                // Optionally switch to sign-in or just close modal
                // onSwitchToSignIn(); // uncomment if you want to redirect to sign in
              }}
              className="w-full bg-white hover:bg-amber-400 hover:text-black text-black font-extrabold uppercase text-xs tracking-widest py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(251,191,36,0.7)] font-sans"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
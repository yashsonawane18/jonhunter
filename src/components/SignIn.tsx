import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ArrowLeft, Loader, Check } from "lucide-react";
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
import { useUser } from "../contexts/UserContext";
import API_ENDPOINTS from "../config/api";

interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignInProps {
  onSwitchToSignUp: () => void;
  onSignInSuccess: (hasExistingProfile?: boolean) => void;
}

const SignIn: React.FC<SignInProps> = ({
  onSwitchToSignUp,
  onSignInSuccess,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { setUser } = useUser();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: {
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);

  React.useEffect(() => {
    const expiredMsg = sessionStorage.getItem('session_expired_msg');
    if (expiredMsg) {
      setLoginError(expiredMsg);
      sessionStorage.removeItem('session_expired_msg');
    }
  }, []);

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
  } as const;
  const activeLegalContent = legalModal ? legalContent[legalModal] : null;

  // ONLY onSubmit FUNCTION UPDATED — REST SAME
const onSubmit = async (data: SignInFormData) => {
  try {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Sign in failed:", text);
      // Try to extract a clean message from the JSON body
      let friendlyMsg = "Invalid email or password. Please try again.";
      try {
        const errJson = JSON.parse(text);
        if (errJson?.message) friendlyMsg = errJson.message;
      } catch { /* plain text fallback */ }
      setLoginError(friendlyMsg);
      return;
    }

    const responseData = await response.json();
    console.log("✅ Full response:", responseData);

    // Handle both nested {user:{user_id}, session_token} and flat {user_id} response shapes
    const userId = responseData.user?.user_id ?? responseData.userId ?? responseData.user_id;
    const token = responseData.session_token ?? responseData.token ?? "";
    const isPremium = responseData.user?.is_premium ?? responseData.isPremiumUser ?? responseData.is_premium ?? false;
    const subscriptionEndDate = responseData.subscriptionEndDate ?? responseData.user?.subscriptionEndDate ?? null;
    const subscriptionPlan = responseData.subscriptionPlan ?? responseData.user?.subscriptionPlan ?? null;
    // Store in localStorage
    if (!userId) {
      console.error("Missing userId", responseData);
      setLoginError("Login failed: could not retrieve your account. Please try again.");
      return;
    }

// Pass subscription data from backend into context
setUser(userId, isPremium, token || "", subscriptionEndDate, subscriptionPlan);

    // Update context
    setUser(userId, isPremium, token, subscriptionEndDate, subscriptionPlan);

    console.log("Stored in localStorage:", {
      user_id: localStorage.getItem("user_id"),
      token: localStorage.getItem("token"),
    });

    // Check profile completion by fetching user details
    let hasExistingProfile = false;
    try {
      const userDetailsRes = await fetch(API_ENDPOINTS.USER_DETAILS(userId), {
        headers: { "X-SESSION-TOKEN": token },
      });
      if (userDetailsRes.ok) {
        const userDetails = await userDetailsRes.json();
        // User has gone through setup if job_title or experience is filled in
        hasExistingProfile = !!(userDetails?.job_title || userDetails?.experience);
      }
    } catch {
      // Fall back to skills check from login response
      const skills = responseData.user?.skills || [];
      hasExistingProfile = Array.isArray(skills) && skills.length > 0;
    }

    onSignInSuccess(hasExistingProfile);
  } catch (error) {
    console.error("An error occurred during sign in:", error);
    setLoginError("An unexpected error occurred. Please try again later.");
  }
};

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => window.location.href = "/"}
        className="absolute top-6 left-6 z-50 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors duration-300"
        aria-label="Go back to home"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>
      
      <AuthLayout
        title="Welcome Back"
        subtitle="Sign in to your Dheeraj Rathod Consult account"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white dark:text-gray-300 font-medium transition-colors duration-300">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            className={`w-full h-12 px-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-jobright-teal dark:focus:ring-neon-green focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-300 ${
              errors.email ? "border-red-500 focus:ring-red-500" : ""
            }`}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email address",
              },
            })}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-red-600" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white dark:text-gray-300 font-medium transition-colors duration-300">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={`w-full h-12 px-4 pr-12 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-jobright-teal dark:focus:ring-neon-green focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-300 ${
                errors.password ? "border-red-500 focus:ring-red-500" : ""
              }`}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 1,
                  message: "Password is required",
                },
              })}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
              )}
            </button>
          </div>
          {errors.password && (
            <p
              id="password-error"
              className="text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember me checkbox with Brand Colors */}
        <div className="flex items-center space-x-3">
          <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
            <input
              id="rememberMe"
              type="checkbox"
              checked={!!rememberMe}
              onChange={(event) =>
                setValue("rememberMe", event.target.checked)
              }
              className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-white/70 bg-black checked:border-[#00d4aa] checked:bg-[#00d4aa] focus:outline-none focus:ring-2 focus:ring-[#00d4aa]/60"
            />
            <Check className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
          </span>
          <Label
            htmlFor="rememberMe"
            className="text-sm text-white dark:text-gray-300 cursor-pointer transition-colors duration-300"
          >
            Remember me
          </Label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-black dark:bg-neon-green hover:bg-gray-800 dark:hover:bg-green-400 text-white dark:text-black font-semibold rounded-lg transition-all duration-300 shadow-lg dark:shadow-[0_0_20px_rgba(74,222,128,0.3)] flex items-center justify-center gap-2"
          disabled={isSubmitting}
          onClick={() => setLoginError(null)}
        >
          {isSubmitting && <Loader className="h-5 w-5 animate-spin" />}
          {isSubmitting ? "Signing In..." : "SIGN IN"}
        </Button>

        {/* Inline error message — replaces browser alert() */}
        {loginError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-in fade-in slide-in-from-top-1 duration-300"
          >
            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{loginError}</span>
          </div>
        )}

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-jobright-teal dark:text-neon-green hover:underline focus:underline focus:outline-none font-medium transition-colors duration-300"
            >
              Sign up now
            </button>
          </p>
        </div>

        {/* Terms and Privacy */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
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
      </form>
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
    </AuthLayout>
    </div>
  );
};

export default SignIn;

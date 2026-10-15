import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { UserProvider } from "./contexts/UserContext.tsx";
import { errorLogger } from "./lib/errors/errorLogger.ts";

// 1. Global uncaught promise rejection listener
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    errorLogger.error("UnhandledPromiseRejection", event.reason || "Unhandled promise rejection", {
      type: "unhandledrejection",
    });
  });

  // 2. Global uncaught window error listener
  window.addEventListener("error", (event) => {
    errorLogger.error("WindowError", event.error || event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
}

// 3. Global fetch interceptor to catch session expiration and log network issues
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  const rawUrl =
    typeof args[0] === "string"
      ? args[0]
      : args[0] instanceof Request
      ? args[0].url
      : args[0] instanceof URL
      ? args[0].href
      : "";

  try {
    const response = await originalFetch(...args);

    // Public and job-engine endpoints that should NEVER trigger session expired redirect
    const isPublicEndpoint =
      rawUrl.includes("/api/jobs") ||
      rawUrl.includes("/api/health") ||
      rawUrl.includes("/api/locations") ||
      rawUrl.includes("/api/find-jobs") ||
      rawUrl.includes("/api/parse-resume") ||
      rawUrl.includes("/api/recommendations") ||
      rawUrl.includes("/api/job-alerts") ||
      rawUrl.includes(":5055") ||
      rawUrl.includes("/api/enquiries") ||
      rawUrl.includes("/api/bookings") ||
      rawUrl.includes("/api/users/login") ||
      rawUrl.includes("/api/users/signup");

    const hasStoredToken = !!(
      localStorage.getItem("session_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("session_token") ||
      sessionStorage.getItem("token")
    );

    // Only dispatch session-expired if the user actually had a session and accessed a protected endpoint
    if (!isPublicEndpoint && hasStoredToken) {
      if (response.status === 401 || response.status === 403) {
        window.dispatchEvent(new Event("session-expired"));
      } else if (!response.ok) {
        try {
          const clone = response.clone();
          const text = await clone.text();
          const isSessionError =
            text.toLowerCase().includes("session") ||
            text.toLowerCase().includes("expired") ||
            text.toLowerCase().includes("unauthorized");
          if (isSessionError) {
            window.dispatchEvent(new Event("session-expired"));
          }
        } catch {
          // ignore clone or text read error
        }
      }
    }
    return response;
  } catch (error) {
    errorLogger.warn("FetchInterceptor", `Network request failed for ${rawUrl}`, { error });
    throw error;
  }
};

if (window.location.hostname === "www.dheerajrathodconsult.com") {
  window.location.replace(
    `https://dheerajrathodconsult.com${window.location.pathname}${window.location.search}${window.location.hash}`
  );
}

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <App />
  </UserProvider>
);

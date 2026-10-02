import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { UserProvider } from "./contexts/UserContext.tsx";

  // Global fetch interceptor to catch session expiration globally
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    try {
      const response = await originalFetch(...args);
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
      return response;
    } catch (error) {
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
  

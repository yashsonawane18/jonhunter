import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  user_id: string | null;
  isPremiumUser: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  subscriptionEndDate: string | null;   // ISO date string e.g. "2025-08-15"
  subscriptionPlan: string | null;      // "BASE" | "PLUS" | "PREMIUM" | null
  daysUntilExpiry: number | null;       // null = not premium; ≤7 triggers banner
  setUser: (user_id: string, isPremiumUser: boolean, token: string, subscriptionEndDate?: string | null, subscriptionPlan?: string | null) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/** Compute days remaining until an ISO date string. Returns null if no date. */
const computeDaysUntilExpiry = (endDate: string | null): number | null => {
  if (!endDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(endDate);
  expiry.setHours(0, 0, 0, 0);
  const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user_id, setUser_id] = useState<string | null>(() => localStorage.getItem("user_id"));
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(() => localStorage.getItem("is_premium_user") === "true");
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    // Only show loading spinner if there is a stored user session to validate
    return !!localStorage.getItem("user_id");
  });
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(() => localStorage.getItem("subscription_end_date"));
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(() => localStorage.getItem("subscription_plan"));

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const setUser = (
    id: string,
    isPremium: boolean,
    token: string,
    endDate?: string | null,
    plan?: string | null
  ) => {
    const normalizedToken = token || "";

    setUser_id(id);
    setIsPremiumUser(isPremium);
    setSubscriptionEndDate(endDate ?? null);
    setSubscriptionPlan(plan ?? null);

    localStorage.setItem("user_id", id);
    localStorage.setItem("is_premium_user", String(isPremium));
    localStorage.setItem("token", normalizedToken);
    localStorage.setItem("session_token", normalizedToken);
    sessionStorage.setItem("token", normalizedToken);
    sessionStorage.setItem("session_token", normalizedToken);
    if (endDate) localStorage.setItem("subscription_end_date", endDate);
    else localStorage.removeItem("subscription_end_date");
    if (plan) localStorage.setItem("subscription_plan", plan);
    else localStorage.removeItem("subscription_plan");
  };

  const clearUser = () => {
    setUser_id(null);
    setIsPremiumUser(false);
    setSubscriptionEndDate(null);
    setSubscriptionPlan(null);

    localStorage.removeItem("user_id");
    localStorage.removeItem("is_premium_user");
    localStorage.removeItem("token");
    localStorage.removeItem("session_token");
    localStorage.removeItem("user_session_screen");
    localStorage.removeItem("subscription_end_date");
    localStorage.removeItem("subscription_plan");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("session_token");
  };

  const isAuthenticated = !!user_id;
  const daysUntilExpiry = computeDaysUntilExpiry(subscriptionEndDate);

  return (
    <UserContext.Provider value={{
      user_id,
      isPremiumUser,
      isAuthenticated,
      isLoading,
      subscriptionEndDate,
      subscriptionPlan,
      daysUntilExpiry,
      setUser,
      clearUser,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
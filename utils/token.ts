import { TokenData } from "@/types/api";

export const saveTokensToStorage = (tokens: TokenData) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("tokens", JSON.stringify(tokens));
};

export const getTokensFromStorage = (): TokenData | null => {
  if (typeof window === "undefined") return null; 
  const t = localStorage.getItem("tokens");
  if (!t) return null;
  try {
    return JSON.parse(t) as TokenData;
  } catch {
    return null;
  }
};

export const getAccessToken = (): string | null => {
  return getTokensFromStorage()?.access_token || null;
};

export const getRefreshToken = (): string | null => {
  return getTokensFromStorage()?.refresh_token || null;
};

export const clearTokensFromStorage = () => {
  if (typeof window === "undefined") return; 
  localStorage.removeItem("tokens");
};

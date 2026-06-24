import api from "./api";

export interface AuthUser {
  id?: string;
  _id?: string;
  name?: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user?: AuthUser;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("mm_token");
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("mm_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setSession(token: string, user?: AuthUser) {
  window.localStorage.setItem("mm_token", token);
  if (user) window.localStorage.setItem("mm_user", JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem("mm_token");
  window.localStorage.removeItem("mm_user");
}

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  setSession(data.token, data.user);
  return data;
}

export async function register(name: string, email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/register", { name, email, password });
  setSession(data.token, data.user);
  return data;
}

export function logout() {
  clearSession();
}
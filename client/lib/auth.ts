export type CurrentUser = {
  id: string;
  name: string;
  email?: string;
  role?: string;
} | null;

const STORAGE_KEY = "mock_current_user";

export function getCurrentUser(): CurrentUser {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CurrentUser;
  } catch (e) {
    return null;
  }
}

export function logout() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}

// Simple mock login for dev/testing
export async function login(email: string, password: string) {
  // generic test credentials
  const adminCred = { email: "admin@example.com", password: "Password123!" };
  const userCred = { email: "user@example.com", password: "Password123!" };

  let user: CurrentUser | null = null;
  if (email === adminCred.email && password === adminCred.password) {
    user = {
      id: "u_admin",
      name: "Admin Demo",
      email: adminCred.email,
      role: "ADMIN",
    };
  } else if (email === userCred.email && password === userCred.password) {
    user = {
      id: "u_1",
      name: "User Demo",
      email: userCred.email,
      role: "AUDITEUR",
    };
  } else {
    // try matching by email only for convenience (dev)
    if (email === "admin" || email === "admin@example.com") {
      user = { id: "u_admin", name: "Admin Demo", email, role: "ADMIN" };
    } else if (email === "user" || email === "user@example.com") {
      user = { id: "u_1", name: "User Demo", email, role: "AUDITEUR" };
    }
  }

  if (!user) {
    throw new Error("Invalid credentials");
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {}

  return user;
}

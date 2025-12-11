export function getCurrentUser() {
  // Mocked current user. In production, integrate real auth.
  return { id: "u_1", name: "Alice Dupont", role: "auditeur" } as { id: string; name: string; role: string };
}

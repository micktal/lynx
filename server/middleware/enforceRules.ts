import type { Request, Response, NextFunction } from "express";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function enforceRules(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.headers["x-user-role"]; // ex: MANAGER, ADMIN

      const { data: rules } = await fetch(
        `${SUPABASE_URL}/rest/v1/rules?resource=eq.${resource}&action=eq.${action}&enabled=eq.true`,
        {
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
          },
        },
      ).then((r) => r.json());

      if (!rules || rules.length === 0) {
        return next(); // aucune règle = autorisé
      }

      for (const rule of rules) {
        // Vérification rôle
        if (
          rule.only_roles &&
          Array.isArray(rule.only_roles) &&
          !rule.only_roles.includes(userRole)
        ) {
          return res.status(403).json({
            error: "Forbidden by rule",
            rule,
          });
        }

        // Vérification condition JSON (simple)
        if (rule.condition) {
          const { field, operator, value } = rule.condition;
          const target = field
            .split(".")
            .reduce((o: any, k: string) => o?.[k], req.body);

          if (operator === "==" && target !== value) {
            return res.status(403).json({
              error: "Condition not met",
              rule,
            });
          }
        }
      }

      next();
    } catch (e) {
      console.error("Rule enforcement error", e);
      res.status(500).json({ error: "Rule enforcement failed" });
    }
  };
}

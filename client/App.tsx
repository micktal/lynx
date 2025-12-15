import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Synthese from "./pages/Synthese";
import SitePage from "./pages/SitePage";
import SpacePage from "./pages/SpacePage";
import AuditPage from "./pages/AuditPage";
import AuditsPage from "./pages/Audits";
import EquipmentPage from "./pages/EquipmentPage";
import RiskPage from "./pages/RiskPage";
import ActionPage from "./pages/ActionPage";
import Dashboard from "./pages/Dashboard";
import WorkflowPage from "./pages/Workflow";
import NotificationsPage from "./pages/Notifications";
import WorkflowDashboard from "./pages/WorkflowDashboard";
import JournalPage from "./pages/journal";
import BuildingPage from "./pages/BuildingPage";
import BuildingPlansAdmin from "./pages/BuildingPlansAdmin";
import AuditMobile from "./pages/AuditMobile";
import AuditMobileSpace from "./pages/AuditMobileSpace";
import AuditMobileEquipment from "./pages/AuditMobileEquipment";
import Referentiels from "./pages/Referentiels";
import ReferentielsPreview from "./pages/ReferentielsPreview";
import Supervision from "./pages/Supervision";
import ClientsPage from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import ClientPortal from "./pages/ClientPortal";
import ReportingPage from "./pages/Reporting";
import ReportingComparatifPage from "./pages/ReportingComparatif";
import ReportingTimelinePage from "./pages/ReportingTimeline";
import ReportingDesignerPage from "./pages/ReportingDesigner";
import DataLakeAdminPage from "./pages/datalake-admin";
import DataLakeReplayPage from "./pages/datalake-replay";
import AdminSecurityLogPage from "./pages/admin-security-log";
import AdminRulesPage from "./pages/admin-rules";
import AdminUsersPage from "./pages/admin-users";
import UnauthorizedPage from "./pages/unauthorized";
import LoginPage from "./pages/login";
import MapPage from "./pages/map";
import MapFrancePage from "./pages/map-france";
import ProjectsPage from "./pages/projects";
import ProjectPage from "./pages/project";
import ChantiersPage from "./pages/chantiers";
import ChantierPage from "./pages/chantier";

const queryClient = new QueryClient();

import React from "react";
const App = () => {
  React.useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/health");
        if (r.ok) {
          const j = await r.json();
          if (j.supabase && !j.supabase.ok) {
            const { toast } = await import("@/hooks/use-toast");
            toast({
              title: "Alerte infra",
              description: "Proxy Supabase non configuré ou indisponible",
            });
          }
        }
      } catch (e) {
        const { toast } = await import("@/hooks/use-toast");
        toast({
          title: "Alerte",
          description: "Impossible de joindre le serveur API",
        });
      }
    })();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/synthese" element={<Synthese />} />
            <Route path="/site/:id" element={<SitePage />} />
            <Route path="/space/:id" element={<SpacePage />} />
            <Route path="/audit" element={<AuditsPage />} />
            <Route path="/audit/:id" element={<AuditPage />} />
            <Route path="/equipment/:id" element={<EquipmentPage />} />
            <Route path="/risk/:id" element={<RiskPage />} />
            <Route path="/action/:id" element={<ActionPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workflow" element={<WorkflowPage />} />
            <Route path="/workflow-dashboard" element={<WorkflowDashboard />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/building/:id" element={<BuildingPage />} />
            <Route
              path="/building/:id/plans"
              element={<BuildingPlansAdmin />}
            />
            <Route path="/audit-mobile/:auditId" element={<AuditMobile />} />
            <Route
              path="/audit-mobile/:auditId/space/:spaceId"
              element={<AuditMobileSpace />}
            />
            <Route
              path="/audit-mobile/:auditId/equipment/:equipmentId"
              element={<AuditMobileEquipment />}
            />
            <Route path="/referentiels" element={<Referentiels />} />
            <Route
              path="/referentiels/preview/:templateId"
              element={<ReferentielsPreview />}
            />
            <Route path="/supervision" element={<Supervision />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/client-portal" element={<ClientPortal />} />
            <Route path="/reporting" element={<ReportingPage />} />
            <Route
              path="/reporting/comparatif"
              element={<ReportingComparatifPage />}
            />
            <Route
              path="/reporting/timeline"
              element={<ReportingTimelinePage />}
            />
            <Route
              path="/reporting/designer"
              element={<ReportingDesignerPage />}
            />
            <Route path="/datalake-admin" element={<DataLakeAdminPage />} />
            <Route
              path="/datalake/replay/:entityType/:entityId"
              element={<DataLakeReplayPage />}
            />
            <Route
              path="/admin/security-log"
              element={<AdminSecurityLogPage />}
            />
            <Route path="/admin/rules" element={<AdminRulesPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/map-france" element={<MapFrancePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/project/:id" element={<ProjectPage />} />
            <Route path="/chantiers" element={<ChantiersPage />} />
            <Route path="/chantier/:id" element={<ChantierPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const container = document.getElementById("root")!;
const g = globalThis as any;
if (!g.__root) {
  g.__root = createRoot(container);
}

g.__root.render(<App />);

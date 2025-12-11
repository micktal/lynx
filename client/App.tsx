import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Synthese from "./pages/Synthese";
import SitePage from "./pages/SitePage";
import SpacePage from "./pages/SpacePage";
import AuditPage from "./pages/AuditPage";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/synthese" element={<Synthese />} />
          <Route path="/site/:id" element={<SitePage />} />
          <Route path="/space/:id" element={<SpacePage />} />
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
          <Route path="/building/:id/plans" element={<BuildingPlansAdmin />} />
          <Route path="/audit-mobile/:auditId" element={<AuditMobile />} />
          <Route path="/audit-mobile/:auditId/space/:spaceId" element={<AuditMobileSpace />} />
          <Route path="/audit-mobile/:auditId/equipment/:equipmentId" element={<AuditMobileEquipment />} />
          <Route path="/referentiels" element={<Referentiels />} />
          <Route path="/referentiels/preview/:templateId" element={<ReferentielsPreview />} />
          <Route path="/supervision" element={<Supervision />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/client-portal" element={<ClientPortal />} />
          <Route path="/reporting" element={<ReportingPage />} />
          <Route path="/reporting/comparatif" element={<ReportingComparatifPage />} />
          <Route path="/reporting/timeline" element={<ReportingTimelinePage />} />
          <Route path="/reporting/designer" element={<ReportingDesignerPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const container = document.getElementById("root")!;
const g = globalThis as any;
if (!g.__root) {
  g.__root = createRoot(container);
}

g.__root.render(<App />);

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

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LocalMatch from "./pages/LocalMatch";
import ComputerMatch from "./pages/ComputerMatch";
import Puzzles from "./pages/Puzzles";
import Lessons from "./pages/Lessons";
import Players from "./pages/Players";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/local-match" element={<LocalMatch />} />
          <Route path="/computer" element={<ComputerMatch />} />
          <Route path="/puzzles" element={<Puzzles />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/players" element={<Players />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

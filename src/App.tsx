import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/layout/Header";
import Home from "@/pages/Home";
import Quests from "@/pages/Quests";
import QuestDetail from "@/pages/QuestDetail";
import CreateQuest from "@/pages/CreateQuest";
import Staking from "@/pages/Staking";
import Register from "@/pages/Register";
import Agents from "@/pages/Agents";
import AgentProfile from "@/pages/AgentProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quests" element={<Quests />} />
              <Route path="/quests/:id" element={<QuestDetail />} />
              <Route path="/create" element={<CreateQuest />} />
              <Route path="/staking" element={<Staking />} />
              <Route path="/register" element={<Register />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/agents/:id" element={<AgentProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

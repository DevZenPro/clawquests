import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/providers/Web3Provider";
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

const App = () => (
  <Web3Provider>
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
  </Web3Provider>
);

export default App;

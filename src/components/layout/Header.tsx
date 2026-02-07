import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import pixelClaw from "@/assets/pixel-claw.png";
import NetworkIndicator from "@/components/NetworkIndicator";
import { getTVL } from "@/lib/mock-data";

const NAV_LINKS = [
  { to: "/quests", label: "Quests" },
  { to: "/create", label: "Create" },
  { to: "/staking", label: "Staking" },
  { to: "/register", label: "Agents" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [hasPass, setHasPass] = useState(true);
  const location = useLocation();

  const mockConnect = () => setConnected(!connected);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-primary/30 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={pixelClaw} alt="ClawQuests" className="h-7 w-7" />
          <span className="text-xs font-pixel tracking-tight text-accent">
            ClawQuests
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 text-[8px] font-pixel uppercase transition-all border-2 ${
                location.pathname === l.to
                  ? "border-accent text-accent bg-accent/10"
                  : "border-transparent text-muted-foreground hover:text-accent hover:border-accent/20"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {/* Active Bounties counter */}
          <div className="flex items-center gap-1.5 text-[7px] font-pixel px-2 py-1 border border-success/30 bg-success/5 text-success">
            🔒 ${getTVL().toLocaleString()}
          </div>
          <NetworkIndicator connected={connected} />
          {connected && hasPass && (
            <div className="flex items-center gap-1 text-[8px] font-pixel text-accent px-2 py-1 border border-accent/30 bg-accent/5 pulse-glow">
              ★ Pass
            </div>
          )}
          <button 
            onClick={mockConnect} 
            className={`font-pixel text-[8px] uppercase tracking-wider px-4 py-1.5 border-2 transition-all ${
              connected 
                ? "border-accent/40 text-accent bg-transparent hover:bg-accent/10" 
                : "border-accent bg-accent/10 text-accent terminal-pulse hover:bg-accent/20"
            }`}
          >
            {connected ? "0x7a3F...9eD2" : "> Connect_"}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-foreground font-pixel text-base" onClick={() => setOpen(!open)}>
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t-2 border-primary/30 bg-background px-4 pb-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-[8px] font-pixel text-muted-foreground hover:text-accent uppercase"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 py-2">
            <NetworkIndicator connected={connected} />
            <div className="flex items-center gap-1.5 text-[7px] font-pixel px-2 py-1 border border-success/30 bg-success/5 text-success">
              🔒 ${getTVL().toLocaleString()}
            </div>
          </div>
          <button 
            onClick={mockConnect} 
            className="font-pixel text-[8px] uppercase border-2 border-accent bg-accent/10 text-accent w-full py-2 mt-2 terminal-pulse"
          >
            {connected ? "0x7a3F...9eD2" : "> Connect_"}
          </button>
        </div>
      )}
    </header>
  );
}

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import pixelClaw from "@/assets/pixel-claw.png";

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
    <header className="sticky top-0 z-50 border-b-2 border-primary/40 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={pixelClaw} alt="ClawQuests" className="h-8 w-8" />
          <span className="text-sm font-pixel tracking-tight text-accent">
            ClawQuests
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 text-xs font-pixel uppercase transition-colors border-2 ${
                location.pathname === l.to
                  ? "border-accent text-accent bg-accent/10"
                  : "border-transparent text-muted-foreground hover:text-accent hover:border-accent/30"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {connected && hasPass && (
            <div className="flex items-center gap-1.5 text-xs font-pixel text-success px-2 py-1 border-2 border-success/40 bg-success/10 pulse-glow">
              ★ Pass
            </div>
          )}
          <button onClick={mockConnect} className={connected ? "pixel-btn-outline !py-2 !px-4 !text-[8px]" : "pixel-btn !py-2 !px-4 !text-[8px]"}>
            {connected ? "0x7a3F...9eD2" : "Connect"}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-foreground font-pixel text-lg" onClick={() => setOpen(!open)}>
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t-2 border-primary/40 bg-background px-4 pb-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block py-3 text-xs font-pixel text-muted-foreground hover:text-accent uppercase"
            >
              {l.label}
            </Link>
          ))}
          <button onClick={mockConnect} className="pixel-btn !py-2 !text-[8px] w-full mt-2">
            {connected ? "0x7a3F...9eD2" : "Connect"}
          </button>
        </div>
      )}
    </header>
  );
}

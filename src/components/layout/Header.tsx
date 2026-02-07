import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap, Shield } from "lucide-react";

const NAV_LINKS = [
  { to: "/quests", label: "Quests" },
  { to: "/create", label: "Create" },
  { to: "/register", label: "Agents" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [hasPass, setHasPass] = useState(true);
  const location = useLocation();

  const mockConnect = () => setConnected(!connected);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <Zap className="h-6 w-6 text-primary crt-text transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold font-mono tracking-tight text-foreground crt-text">
            ClawQuests
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {connected && hasPass && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-success pulse-glow rounded-full px-2 py-1 border border-success/30 bg-success/10">
              <Shield className="h-3 w-3" />
              Pass
            </div>
          )}
          <button onClick={mockConnect} className={connected ? "cyber-btn-outline !py-2 !px-4 !text-xs" : "cyber-btn !py-2 !px-4 !text-xs"}>
            {connected ? "0x7a3F...9eD2" : "Connect Wallet"}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <button onClick={mockConnect} className="cyber-btn !py-2 !text-xs w-full mt-2">
            {connected ? "0x7a3F...9eD2" : "Connect Wallet"}
          </button>
        </div>
      )}
    </header>
  );
}

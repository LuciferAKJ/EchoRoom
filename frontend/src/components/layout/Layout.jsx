import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import {
  Compass,
  MessageSquare,
  BarChart3,
  Bookmark,
  Settings,
  ShieldAlert,
  PlusCircle,
  Menu,
  X,
  Sparkles,
  Home,
  User,
  LogIn,
} from 'lucide-react';

export const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Primary navigation links
  const navLinks = [
    { to: '/feed', label: 'Feed', icon: Home },
    { to: '/discover', label: 'Serendipity', icon: Compass },
    { to: '/rooms', label: 'Rooms', icon: MessageSquare },
    { to: '/insights', label: 'Insights', icon: BarChart3 },
    { to: '/saved', label: 'Saved', icon: Bookmark },
  ];

  const secondaryLinks = [
    { to: '/settings', label: 'Identity & Settings', icon: Settings },
    { to: '/admin', label: 'Moderation', icon: ShieldAlert },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-echo-bg text-echo-text flex flex-col md:flex-row antialiased selection:bg-echo-lavender/20 selection:text-echo-lavender">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-echo-border bg-echo-surface/60 backdrop-blur-md sticky top-0 h-screen p-5 justify-between z-30 select-none">
        <div className="space-y-6">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 px-2 group">
            <div className="w-8 h-8 rounded-lg bg-echo-lavender/15 border border-echo-lavender/30 flex items-center justify-center text-echo-lavender group-hover:bg-echo-lavender group-hover:text-echo-bg transition-all">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-lg tracking-tight font-semibold text-echo-text group-hover:text-echo-lavender transition-colors">
                EchoRoom
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-echo-subtle font-sans -mt-0.5">
                Empathy Platform
              </span>
            </div>
          </Link>

          {/* New Thought Action */}
          <div className="pt-2">
            <Link
              to="/create"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-echo-lavender text-echo-bg font-semibold text-sm hover:bg-echo-lavenderDark active:scale-[0.98] transition-all shadow-subtle"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Share Thought</span>
            </Link>
          </div>

          {/* Primary Navigation */}
          <nav className="space-y-1">
            <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-echo-subtle">
              Discovery
            </p>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-echo-card text-echo-lavender border border-echo-border/80 shadow-sm'
                        : 'text-echo-muted hover:text-echo-text hover:bg-echo-surface'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* System & Moderation */}
          <nav className="space-y-1 pt-2 border-t border-echo-border/40">
            <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-echo-subtle">
              Account & Safety
            </p>
            {secondaryLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-echo-card text-echo-lavender border border-echo-border/80'
                        : 'text-echo-muted hover:text-echo-text hover:bg-echo-surface'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Identity Footer Capsule */}
        <div className="pt-4 border-t border-echo-border/50">
          <div className="p-2.5 rounded-xl bg-echo-card border border-echo-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-echo-lavender/20 border border-echo-lavender/40 flex items-center justify-center text-echo-lavender text-xs font-semibold shrink-0">
                A
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-echo-text truncate">Quiet Wanderer</p>
                <p className="text-[10px] text-echo-subtle truncate">Anonymous Guest</p>
              </div>
            </div>
            <Link
              to="/login"
              title="Log in or Register"
              className="text-echo-subtle hover:text-echo-text p-1.5 rounded-md hover:bg-echo-hover transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE HEADER ================= */}
      <header className="md:hidden sticky top-0 z-40 bg-echo-surface/90 backdrop-blur-md border-b border-echo-border px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-echo-lavender/15 border border-echo-lavender/30 flex items-center justify-center text-echo-lavender">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-serif text-base font-semibold text-echo-text">
            EchoRoom
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/create"
            className="p-1.5 rounded-lg bg-echo-lavender text-echo-bg"
            title="Create Thought"
          >
            <PlusCircle className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-echo-border text-echo-muted hover:text-echo-text hover:bg-echo-hover"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ================= MOBILE DRAWER ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-echo-bg/95 backdrop-blur-xl pt-16 px-6 pb-24 overflow-y-auto">
          <div className="space-y-6">
            <div className="p-3 rounded-xl bg-echo-card border border-echo-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-echo-lavender/20 border border-echo-lavender/40 flex items-center justify-center text-echo-lavender font-semibold text-sm">
                A
              </div>
              <div className="truncate flex-1">
                <p className="text-sm font-medium text-echo-text">Quiet Wanderer</p>
                <p className="text-xs text-echo-subtle">Anonymous Guest</p>
              </div>
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="text-xs text-echo-lavender underline font-medium"
              >
                Sign In
              </Link>
            </div>

            <nav className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-echo-subtle font-medium px-2 pb-1">
                Navigation
              </p>
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-echo-card text-echo-lavender border border-echo-border'
                          : 'text-echo-muted hover:text-echo-text'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <nav className="space-y-1 pt-2 border-t border-echo-border/50">
              <p className="text-xs uppercase tracking-wider text-echo-subtle font-medium px-2 pb-1">
                Account & Moderation
              </p>
              {secondaryLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-echo-card text-echo-lavender border border-echo-border'
                          : 'text-echo-muted hover:text-echo-text'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT OUTLET ================= */}
      <main className="flex-1 min-h-[calc(100vh-60px)] md:min-h-screen overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>

      {/* ================= MOBILE BOTTOM BAR ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-echo-surface/90 backdrop-blur-md border-t border-echo-border px-3 py-2 flex items-center justify-around">
        {navLinks.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] transition-colors ${
                isActive ? 'text-echo-lavender font-medium' : 'text-echo-subtle hover:text-echo-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <Link
          to="/create"
          className="flex flex-col items-center gap-1 py-1 px-2 text-echo-lavender text-[10px] font-medium"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New</span>
        </Link>
      </nav>
    </div>
  );
};

export default Layout;


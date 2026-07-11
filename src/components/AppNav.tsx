import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  ShieldCheck,
  History,
  Coins,
  Menu,
  X,
  UserCheck
} from 'lucide-react';
import { useTaskStore } from '../services/taskStore';

const AppNav: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, updateProfile } = useTaskStore();

  const handleRoleChange = (role: 'Creator' | 'Contributor' | 'Admin') => {
    // Dynamically update username based on role for realistic profiles
    let name = 'LatterFixer';
    let address = 'G-CONTRIB-Alice-888';
    if (role === 'Creator') {
      name = 'LatterFix-Creator';
      address = 'G-CREATOR-LatterFix-777';
    } else if (role === 'Admin') {
      name = 'LatterFix-Admin';
      address = 'G-CREATOR-Admin-111';
    }
    updateProfile(name, address, role);
  };

  const navLinks = (
    <>
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition ${
            isActive
              ? 'text-(--accent) bg-white/5 shadow-sm shadow-accent/5'
              : 'text-(--muted) hover:bg-white/10 hover:text-white'
          }`
        }
        onClick={() => setMobileOpen(false)}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/tasks"
        className={({ isActive }) =>
          `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition ${
            isActive
              ? 'text-(--accent) bg-white/5'
              : 'text-(--muted) hover:bg-white/10 hover:text-white'
          }`
        }
        onClick={() => setMobileOpen(false)}
      >
        <Search className="w-4 h-4" />
        <span>Task Explorer</span>
      </NavLink>

      <NavLink
        to="/create-task"
        className={({ isActive }) =>
          `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition ${
            isActive
              ? 'text-(--accent) bg-white/5'
              : 'text-(--muted) hover:bg-white/10 hover:text-white'
          }`
        }
        onClick={() => setMobileOpen(false)}
      >
        <PlusCircle className="w-4 h-4" />
        <span>Create Task</span>
      </NavLink>

      <NavLink
        to="/escrow"
        className={({ isActive }) =>
          `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition ${
            isActive
              ? 'text-(--accent) bg-white/5'
              : 'text-(--muted) hover:bg-white/10 hover:text-white'
          }`
        }
        onClick={() => setMobileOpen(false)}
      >
        <Coins className="w-4 h-4" />
        <span>Escrow & Disputes</span>
      </NavLink>

      <NavLink
        to="/history"
        className={({ isActive }) =>
          `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition ${
            isActive
              ? 'text-(--accent) bg-white/5'
              : 'text-(--muted) hover:bg-white/10 hover:text-white'
          }`
        }
        onClick={() => setMobileOpen(false)}
      >
        <History className="w-4 h-4" />
        <span>History</span>
      </NavLink>

      <NavLink
        to="/governance"
        className={({ isActive }) =>
          `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition ${
            isActive
              ? 'text-purple-400 bg-purple-500/10'
              : 'text-purple-300 hover:bg-purple-500/20 hover:text-purple-400'
          }`
        }
        onClick={() => setMobileOpen(false)}
      >
        <ShieldCheck className="w-4 h-4" />
        <span>Governance</span>
      </NavLink>
    </>
  );

  return (
    <nav className="relative w-full flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-4">{navLinks}</div>

        {/* Mobile menu button */}
        <button
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-md hover:bg-white/5 transition"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Role Switcher Widget */}
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1.5 bg-black/35 px-2.5 py-1.5 rounded-xl border border-white/5">
          <UserCheck className="w-3.5 h-3.5 text-accent opacity-75" />
          <span className="text-[10px] uppercase font-mono tracking-wider text-muted mr-1">Role:</span>
          <select
            value={currentUser.role}
            onChange={(e) => handleRoleChange(e.target.value as 'Creator' | 'Contributor' | 'Admin')}
            className="bg-transparent text-[11px] font-bold text-white focus:outline-none cursor-pointer pr-1 border-0"
          >
            <option value="Contributor" className="bg-slate-900 text-white">Contributor</option>
            <option value="Creator" className="bg-slate-900 text-white">Creator</option>
            <option value="Admin" className="bg-slate-900 text-white">Admin</option>
          </select>
        </div>

        {/* Simple profile card */}
        <div className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-linear-to-tr from-accent to-accent2 flex items-center justify-center font-black text-[10px] text-black">
            {currentUser.username.substring(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-[10px] font-extrabold text-white leading-none mb-0.5">{currentUser.username}</p>
            <p className="text-[9px] font-mono text-muted leading-none">
              {currentUser.address.slice(0, 6)}...{currentUser.address.slice(-4)}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-full z-40 bg-slate-900 border border-white/5 shadow-2xl rounded-xl mt-2 overflow-hidden">
          <div className="px-4 py-3 flex flex-col gap-2 bg-slate-950">
            {navLinks}
            <div className="border-t border-white/5 my-2 pt-2 flex items-center justify-between">
              <span className="text-xs text-muted">Role:</span>
              <select
                value={currentUser.role}
                onChange={(e) => {
                  handleRoleChange(e.target.value as 'Creator' | 'Contributor' | 'Admin');
                  setMobileOpen(false);
                }}
                className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
              >
                <option value="Contributor">Contributor</option>
                <option value="Creator">Creator</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AppNav;

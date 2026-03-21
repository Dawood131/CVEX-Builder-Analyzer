import React, { useState, useEffect, useRef } from 'react';
import { useCV } from '../../context/CVContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/UIComponents';
import { FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa';
import { FaSignInAlt, FaUserPlus, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/helper';

/* ── User Avatar — initials only ─────────────────────────────────── */
function Avatar({ user, profile }) {
    const name = profile?.full_name || user?.email || "U";
    const initials = name
        .split(" ")
        .map(w => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="w-8 h-8 rounded-full bg-[var(--brand-500)] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
        </div>
    );
}

/* ── User Dropdown ───────────────────────────────────────────────── */
function UserDropdown({ user, profile, onSignOut }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const name = profile?.full_name || user?.email?.split("@")[0] || "User";
    const email = user?.email || "";

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all cursor-pointer",
                    "hover:bg-[var(--surface-100)] border-[var(--surface-200)]",
                    open && "bg-[var(--surface-100)]"
                )}
            >

                <span className="hidden lg:block text-xs font-semibold text-[var(--surface-800)] max-w-[100px] truncate">
                    {name}
                </span>
                <FaChevronDown className={cn(
                    "text-[10px] text-[var(--surface-400)] transition-transform duration-200",
                    open && "rotate-180"
                )} />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--surface-50)] rounded-xl border border-[var(--surface-200)] shadow-xl overflow-hidden z-[100]">
                    <div className="px-4 py-3 border-b border-[var(--surface-100)]">
                        <p className="text-xs font-bold text-[var(--surface-900)] truncate">{name}</p>
                        <p className="text-[11px] text-[var(--surface-400)] truncate mt-0.5">{email}</p>
                    </div>
                    <div className="p-1.5">
                        {/* Change Password */}
                        <button
                            onClick={() => { setOpen(false); navigate("/auth/reset-password"); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[var(--surface-700)] hover:bg-[var(--surface-100)] transition-colors cursor-pointer"
                        >
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            Change password
                        </button>

                        {/* Divider */}
                        <div className="h-px bg-[var(--surface-100)] my-1" />

                        {/* Sign out */}
                        <button
                            onClick={() => { setOpen(false); onSignOut(); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                            <FaSignOutAlt className="text-xs" />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN NAVBAR
══════════════════════════════════════════════════════════════════ */
function Navbar() {
    const { darkMode, setDarkMode } = useCV();
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (darkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [darkMode]);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) { window.scrollTo({ top: el.offsetTop, behavior: 'smooth' }); setMobileOpen(false); }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--surface-50)]/60 backdrop-blur-xl border border-[var(--surface-50)]/30 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                            <img src="/CVEX Logo Design.png" alt="CVEX Logo" className="w-full h-full object-cover rounded-full" />
                        </div>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-4">
                        {[
                            ['Features', () => scrollToSection('features')],
                            ['Templates', () => navigate('/templates')],
                            ['AI Analyzer', () => navigate('/analyzer')],
                            ['How It Works', () => scrollToSection('how-it-works')],
                        ].map(([label, fn]) => (
                            <button key={label} onClick={fn}
                                className="text-[var(--surface-100)] dark:text-[var(--surface-800)] font-medium text-sm px-3 py-1.5 rounded-md transition-colors duration-200 hover:bg-[var(--surface-50)] dark:hover:bg-[var(--surface-200)] focus:outline-none cursor-pointer">
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => setDarkMode(prev => !prev)}>
                            {darkMode ? <FaSun /> : <FaMoon />}
                        </Button>

                        {/* Desktop auth */}
                        <div className="hidden md:flex items-center gap-3">
                            {!user ? (
                                <>
                                    <Button variant="secondary" size="sm" onClick={() => navigate("/auth/login")}>
                                        <FaSignInAlt className="text-xs mr-1" /> Sign In
                                    </Button>
                                    <Button variant="primary" size="sm" onClick={() => navigate("/auth/signup")}>
                                        <FaUserPlus className="mr-1" /> Sign Up
                                    </Button>
                                </>
                            ) : (
                                <UserDropdown
                                    user={user}
                                    profile={profile}
                                    onSignOut={handleSignOut}
                                />
                            )}
                        </div>

                        {/* Mobile toggle */}
                        <Button variant="ghost" size="sm"
                            className="md:hidden relative w-8 h-8 flex items-center justify-center"
                            onClick={() => setMobileOpen(p => !p)}>
                            <span className={`absolute text-lg transition-transform duration-500 ${mobileOpen ? 'rotate-180' : 'rotate-0'}`}>
                                {mobileOpen ? <FaTimes /> : <FaBars />}
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden px-4 space-y-2 rounded-b-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out
        ${mobileOpen ? 'max-h-[500px] py-3 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>

                {/* Mobile user info */}
                {user && (
                    <div className="flex items-center gap-3 px-1 py-2 border-b border-[var(--surface-200)] mb-2">
                        <Avatar user={user} profile={profile} />
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-[var(--surface-900)] truncate">
                                {profile?.full_name || user?.email?.split("@")[0]}
                            </p>
                            <p className="text-[10px] text-[var(--surface-400)] truncate">{user?.email}</p>
                        </div>
                    </div>
                )}

                <button type="button"
                    className="py-2 text-sm font-medium w-full text-left text-[var(--surface-900)] dark:text-[var(--surface-800)] hover:text-[var(--brand-500)] transition-colors"
                    onClick={() => { setMobileOpen(false); navigate('/templates'); }}>
                    Templates
                </button>

                <button type="button"
                    className="py-2 text-sm font-medium w-full text-left text-[var(--surface-900)] dark:text-[var(--surface-800)] hover:text-[var(--brand-500)] transition-colors"
                    onClick={() => { setMobileOpen(false); navigate('/analyzer'); }}>
                    AI Analyzer
                </button>

                {['Features', 'How It Works'].map((link) => (
                    <button key={link}
                        className="block py-2 text-sm font-medium w-full text-left text-[var(--surface-900)] dark:text-[var(--surface-800)] hover:text-[var(--brand-500)] transition-colors"
                        onClick={() => { scrollToSection(link.toLowerCase().replace(/\s+/g, '-')); setMobileOpen(false); }}>
                        {link}
                    </button>
                ))}

                <div className="flex gap-2 mt-2">
                    {!user ? (
                        <>
                            <Button variant="secondary" className="flex-1"
                                onClick={() => { setMobileOpen(false); navigate("/auth/login"); }}>
                                <FaSignInAlt className="text-xs mr-1" /> Sign In
                            </Button>
                            <Button variant="primary" className="flex-1"
                                onClick={() => { setMobileOpen(false); navigate("/auth/signup"); }}>
                                <FaUserPlus className="mr-1" /> Sign Up
                            </Button>
                        </>
                    ) : (
                        <button
                            onClick={() => { setMobileOpen(false); handleSignOut(); }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-all cursor-pointer"
                        >
                            <FaSignOutAlt className="text-xs" /> Sign out
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
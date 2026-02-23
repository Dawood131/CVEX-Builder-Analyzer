import React, { useState, useEffect } from 'react';
import { useCV } from '../../context/CVContext';
import { Button } from '../ui/UIComponents';
import { FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa';
import { FaSignInAlt, FaUserPlus, FaSignOutAlt } from "react-icons/fa";

function Navbar({ navigate }) {
    const { darkMode, setDarkMode } = useCV();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (darkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [darkMode]);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
            setMobileOpen(false);
        }
    };


    useEffect(() => {
        const storedUser = localStorage.getItem("cvex_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);
    const handleLogin = () => {
        const fakeUser = {
            id: 1,
            name: "Dawood",
            email: "dawood@gmail.com"
        };

        localStorage.setItem("cvex_user", JSON.stringify(fakeUser));
        navigate("/");
        window.location.reload(); // simple refresh for now
    };
    const handleSignOut = () => {
        localStorage.removeItem("cvex_user");
        setUser(null);
    };

    return (
        <nav class="fixed top-0 left-0 right-0 z-50 bg-[var(--surface-50)]/60 backdrop-blur-xl border border-[var(--surface-50)]/30 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                            <img
                                src="/CVEX Logo Design.png"
                                alt="CVEX Logo"
                                className="w-full h-full object-cover rounded-full"
                            />
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
                            <button
                                key={label}
                                onClick={fn}
                                className="text-[var(--surface-100)] dark:text-[var(--surface-800)] font-medium text-sm px-3 py-1.5 rounded-md transition-colors duration-200 hover:bg-[var(--surface-50)] dark:hover:bg-[var(--surface-200)] focus:outline-none cursor-pointer"
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Right Buttons */}
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => setDarkMode(prev => !prev)}>
                            {darkMode ? <FaSun /> : <FaMoon />}
                        </Button>

                        {/* Desktop buttons - show only on md+ */}
                        <div className="hidden md:flex items-center gap-3">
                            {!user ? (
                                <>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => navigate("/signin")}
                                    >
                                        <FaSignInAlt className="text-xs mr-1" /> Sign In
                                    </Button>

                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => navigate("/signup")}
                                    >
                                        <FaUserPlus className="mr-1" /> Sign Up
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleSignOut}
                                >
                                    <FaSignOutAlt className="mr-1" /> Sign Out
                                </Button>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden relative w-8 h-8 flex items-center justify-center transition-transform duration-500"
                            onClick={() => setMobileOpen(p => !p)}
                        >
                            <span
                                className={`absolute text-lg transition-transform duration-500 transform ${mobileOpen ? 'rotate-180' : 'rotate-0'
                                    }`}
                            >
                                {mobileOpen ? <FaTimes /> : <FaBars />}
                            </span>
                        </Button>

                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden px-4 space-y-2 rounded-b-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out
    ${mobileOpen ? 'max-h-[500px] py-3 opacity-100' : 'max-h-0 py-0 opacity-0'}
  `}
            >
                <button
                    type="button"
                    className="py-2 text-sm font-medium w-full text-left text-[var(--surface-900)] dark:text-[var(--surface-800)] hover:text-[var(--brand-500)] transition-colors"
                    onClick={() => {
                        setMobileOpen(false);
                        navigate('/templates');
                    }}
                >
                    Templates
                </button>

                <button
                    type="button"
                    className="py-2 text-sm font-medium w-full text-left text-[var(--surface-900)] dark:text-[var(--surface-800)] hover:text-[var(--brand-500)] transition-colors"
                    onClick={() => {
                        setMobileOpen(false);
                        navigate('/analyzer');
                    }}
                >
                    AI Analyzer
                </button>

                {['Features', 'How It Works'].map((link) => (
                    <button
                        key={link}
                        className="block py-2 text-sm font-medium w-full text-left text-[var(--surface-900)] dark:text-[var(--surface-800)] hover:text-[var(--brand-500)] transition-colors"
                        onClick={() => {
                            scrollToSection(link.toLowerCase().replace(/\s+/g, '-'));
                            setMobileOpen(false);
                        }}
                    >
                        {link}
                    </button>
                ))}

                <div className="flex gap-2 mt-2">
                    {mobileOpen && (
                        <>
                            {!user ? (
                                <>
                                    <Button
                                        variant="secondary"
                                        className="flex-1 animate-slideUpFade"
                                        onClick={() => {
                                            setMobileOpen(false);
                                            navigate("/signin");
                                        }}
                                    >
                                        <FaSignInAlt className="text-xs mr-1" /> Sign In
                                    </Button>

                                    <Button
                                        variant="primary"
                                        className="flex-1 animate-slideUpFade delay-100"
                                        onClick={() => {
                                            setMobileOpen(false);
                                            navigate("/signup");
                                        }}
                                    >
                                        <FaUserPlus className="mr-1" /> Sign Up
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="secondary"
                                    className="flex-1 animate-slideUpFade"
                                    onClick={() => {
                                        setMobileOpen(false);
                                        handleSignOut();
                                    }}
                                >
                                    <FaSignOutAlt className="mr-1" /> Sign Out
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

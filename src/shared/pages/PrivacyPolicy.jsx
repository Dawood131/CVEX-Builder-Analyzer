import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[var(--surface-50)] py-10 px-6">

            <div className="max-w-4xl mx-auto">

                {/* Header */}
                {/* Header */}
                <div className="mb-12">

                    <div className="flex items-center justify-between mb-4">

                        {/* Back Button (Left) */}
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-sm text-[var(--surface-600)] hover:text-[var(--brand-500)] transition cursor-pointer"
                        >
                            <FaArrowLeft />
                            Back
                        </button>

                        {/* Spacer (for balance) */}
                        <div className="w-16"></div>
                    </div>

                    {/* Center Title */}
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
                            Privacy <span className="text-[var(--brand-500)]">Policy</span>
                        </h1>

                        <div className="w-24 h-1 bg-gradient-to-r from-[var(--brand-500)] to-[var(--brand-300)] mx-auto rounded-full"></div>

                        <p className="text-sm text-[var(--surface-500)] mt-4">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                </div>

                {/* Content Card */}
                <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6">

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-[var(--surface-900)]">
                            1. Information We Collect
                        </h2>
                        <p className="text-[var(--surface-600)]">
                            This application CVEX collects basic user data such as email address for authentication and account management purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-[var(--surface-900)]">
                            2. How We Use Information
                        </h2>
                        <p className="text-[var(--surface-600)]">
                            We use your information to provide authentication, personalize your experience, and maintain the functionality of the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-[var(--surface-900)]">
                            3. Data Storage & Security
                        </h2>
                        <p className="text-[var(--surface-600)]">
                            We use secure third-party services like Supabase to store and manage data. All reasonable measures are taken to protect user data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-[var(--surface-900)]">
                            4. Data Sharing
                        </h2>
                        <p className="text-[var(--surface-600)]">
                            We do not sell, rent, or share your personal data with third parties except as required to operate the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-[var(--surface-900)]">
                            5. Your Consent
                        </h2>
                        <p className="text-[var(--surface-600)]">
                            By using this application, you consent to this Privacy Policy and agree to its terms.
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}
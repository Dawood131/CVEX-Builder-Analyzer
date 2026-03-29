import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function ServicePolicy() {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[var(--surface-50)] py-10 px-6">

            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-12">

                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-4">

                        {/* Back Button */}
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-sm text-[var(--surface-600)] hover:text-[var(--brand-500)] transition cursor-pointer"
                        >
                            <FaArrowLeft />
                            Back
                        </button>

                        {/* Spacer */}
                        <div className="w-16"></div>
                    </div>

                    {/* Title */}
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
                            Terms of <span className="text-[var(--brand-500)]">Service</span>
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
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-[var(--surface-600)]">
                            By accessing and using CVEX, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-[var(--surface-900)]">
                            2. Use of the Service
                        </h2>
                        <p className="text-[var(--surface-600)]">
                            You agree to use the platform only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-[var(--surface-900)]">
                            3. Accounts
                        </h2>
                        <p className="text-[var(--surface-600)]">
                            You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-[var(--surface-900)]">
                            4. Limitation of Liability
                        </h2>
                        <p className="text-[var(--surface-600)]">
                            CVEX is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-[var(--surface-900)]">
                            5. Changes to Terms
                        </h2>
                        <p className="text-[var(--surface-600)]">
                            We may update these Terms at any time. Continued use of the service after changes means you accept the updated terms.
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}
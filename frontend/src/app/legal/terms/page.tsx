'use client'

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { FileText, ShieldAlert, Gavel, Scale } from 'lucide-react'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-vault-off-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32">
                <section className="px-12 md:px-32 py-20 bg-white border-b border-black/[0.05]">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h1 className="text-6xl font-display font-medium tracking-tighter text-black uppercase tracking-tight">Terms of Service</h1>
                        <p className="text-sm font-bold uppercase tracking-[0.3em] text-vault-charcoal/30">Effective Date: January 1, 2026</p>
                    </div>
                </section>

                <section className="px-12 md:px-32 py-40">
                    <div className="max-w-3xl mx-auto space-y-16 text-vault-charcoal/60 font-medium leading-relaxed">
                        <div className="space-y-12">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-display font-bold text-black flex items-center gap-4">
                                    <Scale size={24} className="text-vault-success" /> 1. Acceptance of Terms
                                </h2>
                                <p>
                                    By accessing or using the Vault protocol, you agree to be bound by these Terms. If you do not agree to these terms, you must not access or use the protocol.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-display font-bold text-black flex items-center gap-4">
                                    <ShieldAlert size={24} className="text-vault-success" /> 2. No Warranty
                                </h2>
                                <p>
                                    THE PROTOCOL IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. VAULT OPERATORS DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-display font-bold text-black flex items-center gap-4">
                                    <Gavel size={24} className="text-vault-success" /> 3. Responsible Use
                                </h2>
                                <p>
                                    You are solely responsible for the content you shard using the protocol. You agree not to use the protocol for any illegal activity or to store prohibited materials as defined by international law.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-display font-bold text-black flex items-center gap-4">
                                    <FileText size={24} className="text-vault-success" /> 4. Protocol Fees
                                </h2>
                                <p>
                                    While currently in a free-tier promotional period, Vault reserves the right to implement protocol fees for mesh storage in the future, subject to community governance votes on the Avalanche network.
                                </p>
                            </section>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

'use client'

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Shield, Lock, EyeOff, FileText } from 'lucide-react'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-vault-off-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32">
                <section className="px-12 md:px-32 py-20 bg-white border-b border-black/[0.05]">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h1 className="text-6xl font-display font-medium tracking-tighter text-black uppercase tracking-tight">Privacy Policy</h1>
                        <p className="text-sm font-bold uppercase tracking-[0.3em] text-vault-charcoal/30">Last Updated: January 2026</p>
                    </div>
                </section>

                <section className="px-12 md:px-32 py-40">
                    <div className="max-w-3xl mx-auto prose prose-neutral prose-invert text-vault-charcoal/60 font-medium leading-relaxed">
                        <div className="space-y-12">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-display font-bold text-black border-l-2 border-vault-success pl-6">1. Non-Custodial Architecture</h2>
                                <p>
                                    Vault is a non-custodial file sharding protocol. By design, we do not have access to your private keys, nor can we view or reconstruct the cleartext content of your sharded binaries. All cryptographic operations occur client-side within your browser or integration environment.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-display font-bold text-black border-l-2 border-vault-success pl-6">2. Information Collection</h2>
                                <p>
                                    The protocol itself collects zero personal identifiable information (PII). We do not collect names, email addresses, or IP addresses. The only data associated with your account is your public wallet address used for authentication and indexing.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-display font-bold text-black border-l-2 border-vault-success pl-6">3. On-Chain Data</h2>
                                <p>
                                    Please be aware that metadata associated with your sharded files (such as shard hashes and indices) are committed to the Avalanche blockchain. This data is public and permanent. While the cleartext is encrypted, the encrypted fragments are distributed across public validator nodes.
                                </p>
                            </section>

                            <section className="space-y-4 text-center py-12 border-t border-black/5 mt-20">
                                <Lock size={40} className="mx-auto text-vault-success/40 mb-4" />
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-vault-charcoal/30">Privacy is a Protocol level default.</p>
                            </section>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

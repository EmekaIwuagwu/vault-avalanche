'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { FileText, Download, ShieldCheck, Cpu } from 'lucide-react'
import { Footer } from '@/components/Footer'

export default function WhitepaperPage() {
    return (
        <div className="min-h-screen bg-vault-off-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-40 px-8 md:px-32 max-w-5xl mx-auto w-full space-y-20 pb-32">
                <header className="space-y-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/40">Technical Specification v1.0</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-display font-medium tracking-tight"
                    >
                        The Protocol
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-vault-charcoal/60 max-w-2xl mx-auto"
                    >
                        A deep dive into the high-performance C++ storage architecture
                        and AES-256 sharding protocols behind VAULT.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="pt-8"
                    >
                        <button className="vault-button flex items-center gap-2 mx-auto">
                            <Download size={18} />
                            Download PDF (14.2 MB)
                        </button>
                    </motion.div>
                </header>

                <section className="space-y-12">
                    <div className="grid md:grid-cols-2 gap-16">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-display font-bold">1. Abstract</h2>
                            <p className="text-vault-charcoal/70 leading-relaxed">
                                VAULT solves the data bottleneck in the Avalanche ecosystem by providing a
                                Web3-native storage layer that bridges the gap between decentralized consensus
                                and enterprise-grade file management. By leveraging a high-performance C++ backend,
                                VAULT achieves throughput levels traditional IPFS gateways cannot match.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-3xl font-display font-bold">2. Architecture</h2>
                            <p className="text-vault-charcoal/70 leading-relaxed">
                                The system utilizes a dual-layer approach: a lightweight indexing layer stored
                                on-chain for provenance, and a sophisticated C++ shard layer for physical data
                                retrieval. Each file is fragmented into AES-256 encrypted blobs before distribution.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-vault-gray p-12 rounded-[4px] space-y-8">
                        <div className="flex items-center gap-4 text-vault-success">
                            <ShieldCheck size={32} />
                            <h3 className="text-2xl font-display font-bold text-black">Cryptographic Integrity</h3>
                        </div>
                        <p className="text-vault-charcoal/70 font-mono text-sm leading-loose">
                // Protocol pseudocode for encryption sequence
                            <br />
                            void EncryptAndShard(File data) {"{"}
                            <br />
                            &nbsp;&nbsp;auto hash = SHA256(data);
                            <br />
                            &nbsp;&nbsp;auto fragments = K_S_Sharding(data, 12);
                            <br />
                            &nbsp;&nbsp;for(auto& shard : fragments) {"{"}
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;shard.encrypt(USER_AES_KEY);
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;DispatchToNode(shard, Avalanche_AOT);
                            <br />
                            &nbsp;&nbsp;{"}"}
                            <br />
                            {"}"}
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

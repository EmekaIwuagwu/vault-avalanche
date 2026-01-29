'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import {
    Shield, Zap, Lock, Database, Code, Activity,
    Cpu, Network, Share2, ShieldCheck, ZapOff, HardDrive
} from 'lucide-react'

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-vault-off-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32">
                {/* Hero */}
                <section className="px-12 md:px-32 py-20 bg-white">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-vault-success bg-vault-success/10 px-4 py-2 rounded-full">Protocol Features</span>
                        <h1 className="text-7xl md:text-8xl font-display font-medium leading-[0.9] tracking-tighter max-w-4xl text-black">
                            Deep technical <br /> sharding for the <br />
                            <span className="text-vault-charcoal/30">Next Generation.</span>
                        </h1>
                        <p className="text-xl text-vault-charcoal/50 max-w-2xl leading-relaxed">
                            Vault isn't just storage. It's a high-performance orchestration layer for binary data persistence on the Avalanche network.
                        </p>
                    </div>
                </section>

                {/* Feature Grid */}
                <section className="px-12 md:px-32 py-40 border-t border-black/[0.05]">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-vault-gray border border-vault-gray shadow-2xl rounded-[4px] overflow-hidden">
                        <FeatureCard
                            icon={<ShieldCheck className="text-vault-success" />}
                            title="Zero-Knowledge Env"
                            desc="Client-side encryption ensures no cleartext data ever leaves your local execution environment."
                        />
                        <FeatureCard
                            icon={<Cpu className="text-blue-500" />}
                            title="C++ Engine Core"
                            desc="Our custom storage engine is written in native C++ for maximum throughput and memory efficiency."
                        />
                        <FeatureCard
                            icon={<Network className="text-purple-500" />}
                            title="Mesh Distribution"
                            desc="Data is fragmented into 12+ shards and distributed across verified Avalanche validators."
                        />
                        <FeatureCard
                            icon={<Zap className="text-yellow-500" />}
                            title="Sub-Second Retrieval"
                            desc="Optimized routing protocols allow for sub-second retrieval from the global node mesh."
                        />
                        <FeatureCard
                            icon={<Share2 className="text-orange-500" />}
                            title="Atomic Persistence"
                            desc="Either all shards are successfully committed, or the transaction is rolled back. No corruption."
                        />
                        <FeatureCard
                            icon={<HardDrive className="text-zinc-500" />}
                            title="10TB Native Storage"
                            desc="Every developer starts with 10TB of enterprise-grade storage capacity by default."
                        />
                    </div>
                </section>

                {/* Technical Specification */}
                <section className="px-12 md:px-32 py-40 bg-black text-white overflow-hidden relative">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-32 items-center">
                        <div className="space-y-12 relative z-10">
                            <div className="space-y-4">
                                <h2 className="text-6xl font-display font-medium leading-tight">Technical <br /> Specifications</h2>
                                <p className="text-gray-400 text-lg leading-relaxed">
                                    Engineered for the most demanding decentralized applications on Avalanche.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <SpecItem label="Encryption Standard" value="AES-256-GCM (Authenticated)" />
                                <SpecItem label="Auth Protocol" value="EIP-191 Typed Signatures" />
                                <SpecItem label="Network Topology" value="Sharded P2P Mesh" />
                                <SpecItem label="Shard Redundancy" value="Erasure Coding (12/24)" />
                                <SpecItem label="Supported Subnets" value="AVA-1, Fuji-Test, Mainnet-V" />
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-20 bg-vault-success/10 blur-[120px] rounded-full" />
                            <div className="bg-[#0A0A0A] border border-white/10 p-12 rounded-lg space-y-8 relative">
                                <p className="font-mono text-sm text-vault-success"># Protocol Layer 0 v1.0.4</p>
                                <div className="space-y-2 font-mono text-xs text-gray-500">
                                    <p>[INFO] Initializing Vault Subnet Interface...</p>
                                    <p>[INFO] Peer Discovery: 142 Nodes identified</p>
                                    <p>[INFO] Consensus Mode: Avalanche-Finality</p>
                                    <p className="text-white">[CMD] vault.shard(binary_stream, {`{ redundancy: 'max' }`})</p>
                                    <p className="text-vault-success">--- Sharding Sequence Started ---</p>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                            className="h-full bg-vault-success"
                                        />
                                    </div>
                                    <p className="text-vault-success">[SUCCESS] 12 Shards persisted globally</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="bg-white p-12 space-y-6 hover:bg-vault-off-white transition-colors cursor-default group">
            <div className="w-10 h-10 flex items-center justify-center bg-vault-off-white rounded-[2px] group-hover:scale-110 group-hover:bg-white transition-all shadow-sm">
                {icon}
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-display font-bold text-black">{title}</h3>
                <p className="text-vault-charcoal/50 text-sm leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

function SpecItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">{label}</span>
            <span className="text-vault-success font-mono text-sm">{value}</span>
        </div>
    )
}

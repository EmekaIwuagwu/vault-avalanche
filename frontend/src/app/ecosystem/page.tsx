'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import {
    Globe, Server, Shield, Database, Activity,
    MapPin, Cpu, Users, BarChart3, Radio
} from 'lucide-react'

export default function EcosystemPage() {
    return (
        <div className="min-h-screen bg-vault-off-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32">
                {/* Hero */}
                <section className="px-12 md:px-32 py-20 bg-white">
                    <div className="max-w-7xl mx-auto space-y-12">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-vault-off-white border border-black/[0.05] rounded-full">
                            <div className="w-2 h-2 bg-vault-success rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-vault-charcoal/40">Global Mesh Network Active</span>
                        </div>
                        <h1 className="text-7xl md:text-[140px] font-display font-medium leading-[0.8] tracking-tighter text-black">
                            Universal <br /> Distribution.
                        </h1>
                        <div className="flex flex-col md:flex-row gap-12 items-start justify-between">
                            <p className="text-2xl text-vault-charcoal/50 max-w-2xl leading-tight">
                                Vault is powered by a globally decentralized network of high-performance storage nodes integrated directly into the Avalanche ecosystem.
                            </p>
                            <div className="flex gap-12">
                                <Stat label="Active Nodes" value="1,242+" />
                                <Stat label="Total Volume" value="840 PB" />
                                <Stat label="Uptime" value="99.99%" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Node Map Placeholder / Visualization */}
                <section className="px-12 md:px-32 py-20">
                    <div className="max-w-7xl mx-auto h-[600px] bg-black rounded-lg relative overflow-hidden flex items-center justify-center border border-white/10 shadow-2xl group">
                        {/* Visual backdrop */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-vault-success via-transparent to-transparent group-hover:opacity-40 transition-opacity duration-1000" />
                        <Globe size={300} className="text-white/5 group-hover:text-vault-success/10 transition-colors duration-1000" />

                        {/* Node Markers */}
                        <NodeMarker x="30%" y="40%" label="North America Cluster" />
                        <NodeMarker x="55%" y="45%" label="Europe Core" />
                        <NodeMarker x="80%" y="60%" label="Asia Pacific Edge" />
                        <NodeMarker x="40%" y="70%" label="South America Node" />

                        <div className="absolute bottom-10 left-10 p-6 bg-white/5 backdrop-blur-md rounded border border-white/10 space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-vault-success">Network Pulse</p>
                            <div className="flex items-center gap-8">
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase tracking-widest text-gray-500">Latency</p>
                                    <p className="font-mono text-sm text-white">42ms AVG</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase tracking-widest text-gray-500">Bandwidth</p>
                                    <p className="font-mono text-sm text-white">12.8 Gbps</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sectors */}
                <section className="px-12 md:px-32 py-40 border-t border-black/[0.05]">
                    <div className="max-w-7xl mx-auto space-y-24">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <EcosystemCard
                                icon={<Shield size={24} />}
                                title="Validator Network"
                                desc="Run a Vault storage node and earn protocol rewards for securing shard metadata."
                            />
                            <EcosystemCard
                                icon={<Radio size={24} />}
                                title="Relayer Grid"
                                desc="Optimize data routing across subnets to minimize latency for end-user applications."
                            />
                            <EcosystemCard
                                icon={<BarChart3 size={24} />}
                                title="Governance"
                                desc="Participate in parameter tuning for sharding redundancy and network expansion."
                            />
                        </div>

                        <div className="bg-white border border-black/[0.05] p-20 flex flex-col md:flex-row items-center justify-between gap-12 rounded-[2px] shadow-sm">
                            <div className="space-y-4">
                                <h3 className="text-4xl font-display font-medium">Join the Grid.</h3>
                                <p className="text-vault-charcoal/50 max-w-md font-medium">
                                    Interested in becoming a node operator? Join our validator cohort and power the next generation of storage infrastructure.
                                </p>
                            </div>
                            <button className="vault-button px-12 py-5 text-sm">Apply for Validator Program</button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

function Stat({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-vault-charcoal/30">{label}</p>
            <p className="text-3xl font-display font-medium text-black">{value}</p>
        </div>
    )
}

function EcosystemCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="bg-white p-12 space-y-8 hover:bg-vault-off-white transition-all group border border-black/5 hover:border-black/10 shadow-sm">
            <div className="w-12 h-12 flex items-center justify-center bg-black text-white rounded-[2px] group-hover:-rotate-6 transition-transform">
                {icon}
            </div>
            <div className="space-y-4">
                <h3 className="text-2xl font-display font-bold">{title}</h3>
                <p className="text-vault-charcoal/50 text-sm leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

function NodeMarker({ x, y, label }: { x: string, y: string, label: string }) {
    return (
        <div
            className="absolute group/marker"
            style={{ left: x, top: y }}
        >
            <div className="w-3 h-3 bg-vault-success rounded-full animate-ping absolute inset-0 opacity-40" />
            <div className="w-3 h-3 bg-vault-success rounded-full relative z-10 border-2 border-black" />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white">{label}</p>
            </div>
        </div>
    )
}

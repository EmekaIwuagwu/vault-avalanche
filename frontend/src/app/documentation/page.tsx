'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import {
    Book, Code, Zap, Shield, Search, ChevronRight,
    Terminal, Layers, Globe, Database
} from 'lucide-react'
import Link from 'next/link'

export default function DocumentationPage() {
    return (
        <div className="min-h-screen bg-vault-off-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32">
                <section className="px-12 md:px-32 py-20 bg-white border-b border-black/[0.05]">
                    <div className="max-w-7xl mx-auto space-y-8 text-center">
                        <h1 className="text-7xl font-display font-medium tracking-tighter text-black">Documentation Center</h1>
                        <p className="text-xl text-vault-charcoal/50 max-w-2xl mx-auto leading-relaxed">
                            Everything you need to integrate Vault's sharding protocol into your decentralized architecture.
                        </p>
                        <div className="max-w-xl mx-auto relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-vault-charcoal/30 group-focus-within:text-black transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search the protocol guides..."
                                className="w-full pl-16 pr-8 py-5 bg-vault-off-white border border-black/5 rounded-full outline-none focus:border-black transition-all font-medium"
                            />
                        </div>
                    </div>
                </section>

                <section className="px-12 md:px-32 py-40">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-12">
                        {/* Sidebar content */}
                        <div className="lg:col-span-1 space-y-12">
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/30">Getting Started</p>
                                <ul className="space-y-3">
                                    <SidebarLink active>Introduction</SidebarLink>
                                    <SidebarLink>Quick Start Guide</SidebarLink>
                                    <SidebarLink>Core Concepts</SidebarLink>
                                    <SidebarLink>Network Topology</SidebarLink>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/30">Protocol Deep Dive</p>
                                <ul className="space-y-3">
                                    <SidebarLink>Sharding Mechanism</SidebarLink>
                                    <SidebarLink>Consensus Layer</SidebarLink>
                                    <SidebarLink>Retrieval Logic</SidebarLink>
                                    <SidebarLink>Security & Auth</SidebarLink>
                                </ul>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3 bg-white p-16 border border-black/[0.05] rounded-lg shadow-sm space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-4xl font-display font-bold text-black uppercase tracking-tight">Introduction to Vault</h2>
                                <p className="text-lg text-vault-charcoal/60 leading-relaxed font-medium">
                                    Vault is a high-performance, decentralized file sharding protocol native to the Avalanche network.
                                    Unlike traditional IPFS or S3 providers, Vault uses a custom-built C++ storage engine to fragment
                                    data locally and distribute it across a global validator mesh.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <GuideCard
                                    icon={<Zap size={20} />}
                                    title="Quick Setup"
                                    desc="Learn how to initialize the Vault SDK and start sharding binaries in under 3 minutes."
                                />
                                <GuideCard
                                    icon={<Shield size={20} />}
                                    title="Security Model"
                                    desc="Understand our EIP-191 signature-based authentication and client-side entropy generation."
                                />
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-2xl font-display font-bold">Protocol Workflow</h3>
                                <div className="space-y-4">
                                    <WorkflowItem step="1" title="Local Fragmentation" desc="Original binary is split into 12 encrypted fragments using AES-256-GCM." />
                                    <WorkflowItem step="2" title="Mesh Distribution" desc="Shards are routed through Subnet AVA-1 to selected parity validators." />
                                    <WorkflowItem step="3" title="Chain Indexing" desc="Provenance hashes are committed to the Avalanche C-Chain for global retrieval." />
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

function SidebarLink({ children, active = false }: { children: React.ReactNode, active?: boolean }) {
    return (
        <li>
            <Link
                href="#"
                className={`text-sm font-bold tracking-tight hover:text-black transition-colors ${active ? 'text-black flex items-center gap-2' : 'text-vault-charcoal/40'}`}
            >
                {active && <div className="w-1 h-1 bg-vault-success rounded-full" />}
                {children}
            </Link>
        </li>
    )
}

function GuideCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="p-8 border border-black/[0.05] rounded-[2px] hover:border-black transition-all cursor-pointer group">
            <div className="w-10 h-10 flex items-center justify-center bg-vault-off-white rounded-[2px] mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                {icon}
            </div>
            <h4 className="text-xl font-display font-bold mb-2">{title}</h4>
            <p className="text-sm text-vault-charcoal/40 leading-relaxed">{desc}</p>
        </div>
    )
}

function WorkflowItem({ step, title, desc }: { step: string, title: string, desc: string }) {
    return (
        <div className="flex gap-6 group">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-black text-xs font-bold rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                {step}
            </div>
            <div className="space-y-1">
                <h5 className="font-bold text-black">{title}</h5>
                <p className="text-sm text-vault-charcoal/50">{desc}</p>
            </div>
        </div>
    )
}

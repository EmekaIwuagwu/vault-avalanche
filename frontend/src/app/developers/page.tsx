'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import {
    Terminal, Code, Book, Rocket, Search, Copy,
    ExternalLink, Github, MessageSquare, Cloud, Cpu, Box,
    Twitter
} from 'lucide-react'
import Link from 'next/link'

export default function DevelopersPage() {
    return (
        <div className="min-h-screen bg-vault-off-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32">
                {/* Hero */}
                <section className="px-12 md:px-32 py-20 bg-white border-b border-black/[0.05]">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-end">
                        <div className="space-y-8">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-vault-charcoal/40 bg-vault-off-white border border-black/[0.05] px-4 py-2 rounded-full">Developer Portal</span>
                            <h1 className="text-7xl md:text-8xl font-display font-medium leading-[0.9] tracking-tighter text-black">
                                Built by <br /> developers, for <br />
                                <span className="italic">architects.</span>
                            </h1>
                            <p className="text-xl text-vault-charcoal/50 max-w-xl leading-relaxed">
                                Vault provides the building blocks for creating decentralized, sharded, and ultra-secure file storage applications on Avalanche.
                            </p>
                            <div className="flex items-center gap-4 pt-4">
                                <button className="vault-button px-8 py-4 flex items-center gap-2">
                                    <Book size={18} /> Documentation
                                </button>
                                <button className="px-8 py-4 border border-black font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all flex items-center gap-2">
                                    <Github size={18} /> Explore GitHub
                                </button>
                            </div>
                        </div>

                        <div className="bg-vault-off-white p-8 border border-black/[0.05] rounded-lg space-y-4 shadow-inner hidden lg:block">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-vault-charcoal/40">Quick Start</span>
                                <span className="text-[10px] font-bold text-vault-success uppercase tracking-widest">v1.0.0 Stable</span>
                            </div>
                            <div className="bg-black text-white p-6 rounded font-mono text-sm space-y-2">
                                <p className="opacity-40"># Install the Vault SDK</p>
                                <p className="text-vault-success">npm install <span className="text-white">@vault-protocol/sdk</span></p>
                                <br />
                                <p className="opacity-40"># Initialize Client</p>
                                <p><span className="text-purple-400">const</span> vault = <span className="text-blue-400">new</span> <span className="text-yellow-400">Vault</span>({`{ address: MY_WALLET_ADDR }`});</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Resources Grid */}
                <section className="px-12 md:px-32 py-40">
                    <div className="max-w-7xl mx-auto space-y-20">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <DocLink
                                icon={<Rocket className="text-vault-success" />}
                                title="Quick Start"
                                desc="Get your first sharded storage app running in under 5 minutes."
                            />
                            <DocLink
                                icon={<Code className="text-blue-500" />}
                                title="SDK Reference"
                                desc="Deep dive into our TypeScript and Rust SDK implementations."
                            />
                            <DocLink
                                icon={<Cpu className="text-purple-500" />}
                                title="Core Engine"
                                desc="Understand the C++ sharding logic and subnet architecture."
                            />
                            <DocLink
                                icon={<Cloud className="text-zinc-500" />}
                                title="API Access"
                                desc="Universal REST endpoints for cross-platform integration."
                            />
                        </div>

                        {/* Core Pillars */}
                        <div className="grid lg:grid-cols-3 gap-1px bg-vault-gray border border-vault-gray rounded-lg overflow-hidden shadow-2xl">
                            <DevFeature
                                title="Security First"
                                icon={<ShieldCheck size={24} />}
                                desc="Built-in EIP-191 signature validation and AES-256 encryption handling out of the box."
                            />
                            <DevFeature
                                title="Native C++ Speed"
                                icon={<Cpu size={24} />}
                                desc="Leverage the raw performance of our custom binary sharding engine for sub-second writes."
                            />
                            <DevFeature
                                title="Avalanche Optimized"
                                icon={<Box size={24} />}
                                desc="Direct subnet awareness and gas-optimized provenance indexing on the Avalanche chain."
                            />
                        </div>
                    </div>
                </section>

                {/* Community Section */}
                <section className="px-12 md:px-32 py-40 border-t border-black/[0.05] bg-white text-center">
                    <div className="max-w-3xl mx-auto space-y-12">
                        <h2 className="text-5xl font-display font-medium">Join the Architect Community</h2>
                        <p className="text-xl text-vault-charcoal/50 leading-relaxed">
                            Collaborate with engineers building the future of decentralized storage.
                            Get support, share your projects, and contribute to the protocol.
                        </p>
                        <div className="flex items-center justify-center gap-8">
                            <CommunityButton icon={<MessageSquare size={20} />} label="Discord" />
                            <CommunityButton icon={<Twitter size={20} />} label="Twitter" />
                            <CommunityButton icon={<Github size={20} />} label="GitHub" />
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

function DocLink({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <Link href="#" className="bg-white p-10 border border-black/[0.05] space-y-6 hover:-translate-y-2 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 flex items-center justify-center bg-vault-off-white rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                {icon}
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-bold font-display flex items-center justify-between">
                    {title} <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-vault-charcoal/50 text-sm leading-relaxed">{desc}</p>
            </div>
        </Link>
    )
}

function DevFeature({ title, icon, desc }: { title: string, icon: any, desc: string }) {
    return (
        <div className="bg-white p-14 space-y-8 hover:bg-vault-off-white transition-colors">
            <div className="w-10 h-10 border border-black/[0.1] flex items-center justify-center rounded-[2px] text-black">
                {icon}
            </div>
            <div className="space-y-4">
                <h3 className="text-2xl font-display font-bold">{title}</h3>
                <p className="text-vault-charcoal/50 text-sm leading-relaxed font-medium">{desc}</p>
            </div>
        </div>
    )
}

function CommunityButton({ icon, label }: { icon: any, label: string }) {
    return (
        <button className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-vault-charcoal/40 hover:text-black transition-colors group">
            <span className="w-10 h-10 border border-black/[0.05] rounded-full flex items-center justify-center group-hover:border-black transition-colors">
                {icon}
            </span>
            {label}
        </button>
    )
}

function ShieldCheck({ size, ...props }: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}

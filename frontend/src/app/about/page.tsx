'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import {
    Users, Target, Shield, Heart, Globe,
    MapPin, Milestone, History, Award
} from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-vault-off-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32">
                {/* Intro Section */}
                <section className="px-12 md:px-32 py-20 bg-white">
                    <div className="max-w-7xl mx-auto space-y-12">
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-vault-success bg-vault-success/10 px-4 py-2 rounded-full">Our Purpose</span>
                        <h1 className="text-7xl md:text-[120px] font-display font-medium tracking-tighter leading-[0.8] text-black">
                            Engineering <br /> <span className="text-vault-charcoal/20">Immortality.</span>
                        </h1>
                        <p className="text-2xl text-vault-charcoal/50 max-w-2xl leading-tight font-medium">
                            Vault was founded on a simple principle: digital data should be as permanent and secure as the physical infrastructure of the internet.
                        </p>
                    </div>
                </section>

                {/* Mission / Values */}
                <section className="px-12 md:px-32 py-40 border-y border-black/[0.05]">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-24">
                        <div className="space-y-8">
                            <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-[2px]">
                                <Shield size={24} />
                            </div>
                            <h3 className="text-2xl font-display font-bold">Uncompromising Privacy</h3>
                            <p className="text-vault-charcoal/50 leading-relaxed font-normal">
                                We believe encryption isn't a feature; it's a fundamental human right. Our zero-knowledge architecture ensures that not even our operators can access your data.
                            </p>
                        </div>
                        <div className="space-y-8 text-black">
                            <div className="w-12 h-12 bg-vault-success text-black flex items-center justify-center rounded-[2px] shadow-lg shadow-vault-success/20">
                                <Globe size={24} />
                            </div>
                            <h3 className="text-2xl font-display font-bold">Decentralized Power</h3>
                            <p className="text-vault-charcoal/50 leading-relaxed font-normal">
                                By leveraging the Avalanche network, we eliminate single points of failure. Your data exists in shards globally, coordinated by immutable consensus.
                            </p>
                        </div>
                        <div className="space-y-8">
                            <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-[2px]">
                                <Target size={24} />
                            </div>
                            <h3 className="text-2xl font-display font-bold">Performance Obsessed</h3>
                            <p className="text-vault-charcoal/50 leading-relaxed font-normal">
                                Decentralization shouldn't mean slow. Our native C++ core is optimized for sub-second retrieval and enterprise-level throughput.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Story Section */}
                <section className="px-12 md:px-32 py-40 bg-black text-white overflow-hidden relative">
                    <div className="max-w-4xl mx-auto space-y-16 relative z-10">
                        <h2 className="text-6xl font-display font-medium tracking-tight">From Subnet Genesis to Global Mesh.</h2>
                        <div className="space-y-12">
                            <StoryStep
                                year="2024"
                                title="The Whitepaper"
                                desc="Vault Protocol v1 concept is published, proposing an atomic sharding layer for the Avalanche P-Chain."
                            />
                            <StoryStep
                                year="2025"
                                title="Engine Alpha"
                                desc="Native C++ sharding engine achieves 10x throughput vs existing decentralized providers."
                            />
                            <StoryStep
                                year="2026"
                                title="Subnet Launch"
                                desc="Vault Subnet AVA-1 goes live, onboarding the first 1,000 node operators."
                            />
                        </div>
                    </div>
                    {/* Visual background */}
                    <div className="absolute inset-x-0 bottom-0 opacity-10 pointer-events-none select-none">
                        <p className="text-[20vw] font-display font-black leading-none whitespace-nowrap -mb-10 tracking-tighter uppercase italic">Our Evolution</p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

function StoryStep({ year, title, desc }: { year: string, title: string, desc: string }) {
    return (
        <div className="flex gap-16 border-l border-white/10 pl-16 py-8 relative group">
            <div className="absolute left-0 top-12 w-4 h-4 bg-vault-success rounded-full -translate-x-1/2 group-hover:scale-150 transition-transform" />
            <span className="text-4xl font-display font-bold text-white/20 group-hover:text-vault-success transition-colors">{year}</span>
            <div className="space-y-2">
                <h4 className="text-xl font-bold">{title}</h4>
                <p className="text-gray-500 font-medium leading-relaxed max-w-xl">{desc}</p>
            </div>
        </div>
    )
}

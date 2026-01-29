'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import {
    Rss, ChevronRight, Calendar, User,
    ArrowUpRight, Search, Hash
} from 'lucide-react'
import Link from 'next/link'

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-vault-off-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32">
                {/* Blog Header */}
                <section className="px-12 md:px-32 py-20 bg-white">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-12">
                        <div className="space-y-6">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-vault-charcoal/30">Protocol News & Research</span>
                            <h1 className="text-7xl font-display font-medium tracking-tighter text-black">The Vault Log.</h1>
                        </div>
                        <div className="flex gap-4">
                            <button className="p-4 border border-black/5 rounded-full hover:border-black transition-all">
                                <Rss size={20} />
                            </button>
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-vault-charcoal/30" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search posts..."
                                    className="pl-14 pr-8 py-4 bg-vault-off-white/50 border border-black/5 rounded-full outline-none focus:border-black transition-all w-64"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Blog Feed */}
                <section className="px-12 md:px-32 py-40 border-t border-black/[0.05]">
                    <div className="max-w-7xl mx-auto space-y-32">
                        {/* Featured Post */}
                        <FeaturedPost
                            date="Jan 24, 2026"
                            category="Engineering"
                            title="Optimizing Retrieval Latency in Sharded Mesh Networks: A Quantitative Study"
                            excerpt="Deep dive into our latest performance benchmarks showing a 40% reduction in first-shard resolution time using predictive node routing."
                            image="/blog/featured.png"
                        />

                        {/* Post Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16">
                            <BlogPost
                                date="Jan 15, 2026"
                                tag="Security"
                                title="Audit Report: Vault Core v1.0 Security Verification"
                                desc="Key findings from our recent formal verification and stress test cycles."
                            />
                            <BlogPost
                                date="Dec 28, 2025"
                                tag="Ecosystem"
                                title="Vault Subnet AVA-1: Milestone 4 Migration Guide"
                                desc="Steps for node operators to upgrade their sharding modules for the new year."
                            />
                            <BlogPost
                                date="Dec 12, 2025"
                                tag="Architecture"
                                title="Solving the Redundancy Dilemma in Web3 Storage"
                                desc="How Vault achieves 12x availability without inflating storage overhead."
                            />
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

function FeaturedPost({ date, title, excerpt, category }: any) {
    return (
        <Link href="#" className="flex flex-col lg:grid lg:grid-cols-2 gap-16 group">
            <div className="aspect-[16/9] bg-black rounded-lg overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-vault-success/20 to-transparent opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <Hash size={400} className="text-white" />
                </div>
            </div>
            <div className="space-y-8 flex flex-col justify-center">
                <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-vault-success bg-vault-success/10 px-4 py-1.5 rounded-full">{category}</span>
                    <span className="text-xs text-vault-charcoal/30 flex items-center gap-2"><Calendar size={14} /> {date}</span>
                </div>
                <h2 className="text-5xl font-display font-medium leading-tight text-black group-hover:underline decoration-1 underline-offset-8 transition-all">{title}</h2>
                <p className="text-xl text-vault-charcoal/50 leading-relaxed font-normal">{excerpt}</p>
                <div className="flex items-center gap-3 font-bold uppercase tracking-widest text-xs pt-4">
                    Read Full Research <ArrowUpRight size={16} />
                </div>
            </div>
        </Link>
    )
}

function BlogPost({ date, tag, title, desc }: any) {
    return (
        <Link href="#" className="space-y-6 group cursor-pointer">
            <div className="aspect-[3/2] bg-vault-off-white border border-black/5 rounded-[2px] mb-8 overflow-hidden relative">
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
                    <Rss size={100} />
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-vault-charcoal/30">
                    <span className="text-black">{tag}</span>
                    <span>•</span>
                    <span>{date}</span>
                </div>
                <h3 className="text-2xl font-display font-bold group-hover:text-vault-success transition-colors">{title}</h3>
                <p className="text-sm text-vault-charcoal/40 leading-relaxed font-medium">{desc}</p>
            </div>
        </Link>
    )
}

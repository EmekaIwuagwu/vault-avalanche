'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import {
    Briefcase, MapPin, Clock, ArrowRight,
    Cpu, Shield, Globe, Terminal, Code
} from 'lucide-react'
import Link from 'next/link'

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-vault-off-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32">
                {/* Careers Hero */}
                <section className="px-12 md:px-32 py-20 bg-white">
                    <div className="max-w-7xl mx-auto space-y-12">
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-vault-success bg-vault-success/10 px-4 py-2 rounded-full">Open Positions</span>
                        <h1 className="text-7xl md:text-[140px] font-display font-medium tracking-tighter leading-[0.8] text-black">
                            Architect <br /> <span className="text-vault-charcoal/20">The Future.</span>
                        </h1>
                        <p className="text-2xl text-vault-charcoal/50 max-w-2xl leading-tight font-medium">
                            We're a distributed team of engineers and researchers building the protocol for digital permanence. Join us on the frontier.
                        </p>
                    </div>
                </section>

                {/* Categories / Jobs List */}
                <section className="px-12 md:px-32 py-40 border-t border-black/[0.05]">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-24">
                        {/* Intro to Culture */}
                        <div className="lg:col-span-1 space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-4xl font-display font-bold">Why Vault?</h2>
                                <p className="text-vault-charcoal/50 text-lg leading-relaxed font-normal">
                                    We value deep technical expertise, binary efficiency, and obsessive focus on security. Our culture is built around decentralized ownership and technical excellence.
                                </p>
                            </div>
                            <div className="space-y-6">
                                <Benefit icon={<Cpu size={20} />} title="Deep Tech" desc="Solve real infrastructure problems at the binary level." />
                                <Benefit icon={<Globe size={20} />} title="Fully Remote" desc="Work from anywhere in the world, on your own timeframe." />
                                <Benefit icon={<Shield size={20} />} title="High Equity" desc="Direct ownership in the growth of the Vault protocol." />
                            </div>
                        </div>

                        {/* Job Listings */}
                        <div className="lg:col-span-2 space-y-12">
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/30">Engineering</p>
                                <JobItem title="Lead C++ Systems Engineer" location="Remote" type="Full-time" />
                                <JobItem title="Senior Blockchain Protocol Architect" location="Zurich / Remote" type="Full-time" />
                                <JobItem title="Security Engineer (Formal Verification)" location="London / Remote" type="Full-time" />
                                <JobItem title="Senior Frontend Architect (Next.js/React)" location="Remote" type="Full-time" />
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/30">Product & Growth</p>
                                <JobItem title="Technical Product Manager" location="Remote" type="Full-time" />
                                <JobItem title="Developer Relations Lead" location="Remote" type="Full-time" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

function Benefit({ icon, title, desc }: any) {
    return (
        <div className="flex gap-4 group">
            <div className="w-10 h-10 border border-black/5 flex items-center justify-center rounded-[2px] group-hover:bg-black group-hover:text-white transition-all">
                {icon}
            </div>
            <div className="space-y-1">
                <h4 className="font-bold text-sm">{title}</h4>
                <p className="text-xs text-vault-charcoal/40 leading-relaxed font-medium">{desc}</p>
            </div>
        </div>
    )
}

function JobItem({ title, location, type }: any) {
    return (
        <Link href="#" className="flex items-center justify-between p-8 bg-white border border-black/5 rounded-[2px] hover:border-black transition-all group">
            <div className="space-y-2">
                <h4 className="text-xl font-display font-medium group-hover:underline decoration-1 underline-offset-4">{title}</h4>
                <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-vault-charcoal/30">
                    <span className="flex items-center gap-1.5"><MapPin size={12} /> {location}</span>
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {type}</span>
                </div>
            </div>
            <div className="w-10 h-10 border border-black/5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={16} />
            </div>
        </Link>
    )
}

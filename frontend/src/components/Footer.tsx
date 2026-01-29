'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { IpfsLogo } from './IpfsLogo'
import { Twitter, Github, Linkedin, ArrowUpRight } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-black text-white py-24 px-12 md:px-24">
            <div className="max-w-7xl mx-auto flex flex-col gap-24">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                    {/* Brand Column */}
                    <div className="space-y-8 max-w-sm">
                        <Link href="/" className="flex items-center gap-4 group">
                            <div className="w-10 h-10 bg-white flex items-center justify-center rounded-[2px] group-hover:rotate-[30deg] transition-transform duration-500">
                                <IpfsLogo className="w-6 h-6 text-black" />
                            </div>
                            <span className="font-display text-3xl font-bold tracking-tighter uppercase">
                                Vault
                            </span>
                        </Link>
                        <p className="text-gray-400 text-lg leading-relaxed font-medium">
                            The high-performance storage infrastructure for the next generation of Avalanche developers.
                        </p>
                        <div className="flex items-center gap-6">
                            <SocialIcon icon={<Twitter size={20} />} />
                            <SocialIcon icon={<Github size={20} />} />
                            <SocialIcon icon={<Linkedin size={20} />} />
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-16 md:gap-24">
                        <div className="space-y-6">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Platform</p>
                            <ul className="space-y-4">
                                <FooterLink href="/features">Features</FooterLink>
                                <FooterLink href="/developers">Developers</FooterLink>
                                <FooterLink href="/ecosystem">Ecosystem</FooterLink>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Resources</p>
                            <ul className="space-y-4">
                                <FooterLink href="/whitepaper">Whitepaper</FooterLink>
                                <FooterLink href="/documentation">Documentation</FooterLink>
                                <FooterLink href="/api-specs">API Specs</FooterLink>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Product</p>
                            <ul className="space-y-4">
                                <FooterLink href="/dashboard">Infrastructure</FooterLink>
                                <FooterLink href="/deployments">API Keys</FooterLink>
                                <FooterLink href="/settings">Security</FooterLink>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Company</p>
                            <ul className="space-y-4">
                                <FooterLink href="/about">About</FooterLink>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-24 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                        <p>© 2026 Vault Avalanche Protocol</p>
                        <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 text-xs font-bold"
                    >
                        <span className="w-2 h-2 bg-vault-success rounded-full animate-pulse" />
                        All Systems Operational
                    </motion.div>
                </div>
            </div>
        </footer>
    )
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <li>
            <Link
                href={href}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group text-sm font-medium"
            >
                {children}
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </Link>
        </li>
    )
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
    return (
        <a href="#" className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all">
            {icon}
        </a>
    )
}

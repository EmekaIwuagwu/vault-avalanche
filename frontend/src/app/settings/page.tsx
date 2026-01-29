'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { User, Shield, Bell, Database, ExternalLink, Copy } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useState } from 'react'

export default function SettingsPage() {
    const { address } = useAccount()
    const [activeSection, setActiveSection] = useState('account')

    return (
        <div className="min-h-screen bg-vault-off-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32 px-8 md:px-32 max-w-7xl mx-auto w-full flex gap-16">
                {/* Sidebar Nav */}
                <aside className="w-64 space-y-8">
                    <h2 className="text-3xl font-display font-bold">Settings</h2>
                    <nav className="flex flex-col gap-1">
                        <SettingsNavItem
                            icon={<User size={18} />}
                            label="Account"
                            active={activeSection === 'account'}
                            onClick={() => setActiveSection('account')}
                        />
                        <SettingsNavItem
                            icon={<Database size={18} />}
                            label="Storage"
                            active={activeSection === 'storage'}
                            onClick={() => setActiveSection('storage')}
                        />
                        <SettingsNavItem
                            icon={<Shield size={18} />}
                            label="Security"
                            active={activeSection === 'security'}
                            onClick={() => setActiveSection('security')}
                        />
                        <SettingsNavItem
                            icon={<Bell size={18} />}
                            label="Notifications"
                            active={activeSection === 'notifications'}
                            onClick={() => setActiveSection('notifications')}
                        />
                    </nav>
                </aside>

                {/* Content Area */}
                <section className="flex-1 bg-white border border-vault-gray rounded-lg p-12 shadow-sm min-h-[600px]">
                    {activeSection === 'account' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-display font-bold">Account Profile</h3>
                                <p className="text-vault-charcoal/60 text-sm">Manage your public information and connected wallet.</p>
                            </div>

                            <div className="grid gap-8 max-w-xl">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-vault-charcoal/40">Display Name</label>
                                    <input type="text" className="vault-input w-full" placeholder="Alex Dev" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-vault-charcoal/40">Email Address</label>
                                    <input type="email" className="vault-input w-full" placeholder="alex@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-vault-charcoal/40">Connected Wallet</label>
                                    <div className="flex items-center gap-4 bg-vault-off-white p-3 rounded border border-vault-gray font-mono text-sm">
                                        <span className="truncate">{address || "0x..."}</span>
                                        <Copy className="cursor-pointer hover:text-black transition-colors" size={14} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-vault-gray">
                                <button className="vault-button">Save Changes</button>
                            </div>
                        </motion.div>
                    )}

                    {activeSection === 'storage' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-display font-bold">Storage Usage</h3>
                                <p className="text-vault-charcoal/60 text-sm">Review your data consumption across the Avalanche network.</p>
                            </div>

                            <div className="space-y-8">
                                <div className="p-8 bg-black text-white rounded-lg flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold uppercase tracking-widest text-white/40">Current Plan</p>
                                        <p className="text-2xl font-bold">Enterprise (Unlimited)</p>
                                    </div>
                                    <button disabled className="bg-white/10 text-white px-6 py-2 rounded font-bold text-sm cursor-default">
                                        Active
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <p className="font-semibold text-lg">2.4 GB used</p>
                                        <p className="text-sm text-vault-charcoal/60">10 GB total</p>
                                    </div>
                                    <div className="h-4 bg-vault-off-white border border-vault-gray rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '24%' }}
                                            className="h-full bg-black"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeSection === 'security' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-display font-bold">Security & Keys</h3>
                                <p className="text-vault-charcoal/60 text-sm">Manage sessions and architectural security settings.</p>
                            </div>

                            <div className="divide-y divide-vault-gray">
                                <SecurityItem
                                    title="Active Sessions"
                                    desc="You are currently logged in from 1 device on Avalanche Mainnet."
                                    btn="Manage"
                                />
                                <SecurityItem
                                    title="Two-Factor Authentication"
                                    desc="Add an extra layer of security to your file management operations."
                                    btn="Enable"
                                />
                                <SecurityItem
                                    title="Global Encryption Key"
                                    desc="Required to decrypt file shards. Keep this offline."
                                    btn="Rotate"
                                />
                            </div>
                        </motion.div>
                    )}
                </section>
            </main>
        </div>
    )
}

function SettingsNavItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-[2px] w-full text-left transition-all ${active ? 'bg-vault-black text-white' : 'hover:bg-white text-vault-charcoal/60 hover:text-black'}`}
        >
            {icon}
            <span className="text-sm font-semibold">{label}</span>
        </button>
    )
}

function SecurityItem({ title, desc, btn }: { title: string, desc: string, btn: string }) {
    return (
        <div className="py-8 flex items-center justify-between">
            <div className="space-y-1">
                <p className="font-bold">{title}</p>
                <p className="text-sm text-vault-charcoal/60">{desc}</p>
            </div>
            <button className="px-6 py-2 border border-black text-xs font-bold hover:bg-black hover:text-white transition-all rounded-[2px]">
                {btn}
            </button>
        </div>
    )
}

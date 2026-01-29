'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import {
    Activity,
    ArrowRight,
    Shield,
    Database,
    Cloud,
    FileCode,
    Search,
    Filter,
    RefreshCw,
    File,
    Layout,
    HardDrive
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { fetchActivity, ActivityLog } from '@/lib/api'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ActivityPage() {
    const { address, isConnected, chain } = useAccount()
    const router = useRouter()

    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadActivity = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await fetchActivity()
            setLogs(data)
            setError(null)
        } catch (err) {
            setError('Failed to load activity logs from VAULT engine.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!isConnected) {
            router.push('/')
            return
        }
        loadActivity()
    }, [isConnected, router, loadActivity])

    return (
        <div className="min-h-screen bg-vault-off-white flex flex-col">
            <Navbar />

            <div className="flex-1 flex pt-24 overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-72 bg-white border-r border-black/[0.05] p-8 flex flex-col gap-10 overflow-y-auto">
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/40">Infrastructure</h3>
                        <nav className="flex flex-col gap-1">
                            <SidebarItem icon={<File size={18} />} label="All Storage" onClick={() => router.push('/dashboard')} />
                            <SidebarItem icon={<Activity size={18} />} label="Activity Log" active />
                            <SidebarItem icon={<Database size={18} />} label="Node Mesh" onClick={() => router.push('/nodes')} />
                            <SidebarItem icon={<Cloud size={18} />} label="API Deployments" onClick={() => router.push('/deployments')} />
                        </nav>
                    </div>

                    <div className="mt-auto pt-6 border-t border-black/[0.05]">
                        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-vault-success`}>
                            <div className={`w-2 h-2 bg-current rounded-full animate-pulse`} />
                            V-Activity Protocol Active
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-12 overflow-y-auto">
                    <div className="max-w-6xl mx-auto space-y-12">
                        <header className="flex flex-col md:flex-row justify-between items-end gap-8">
                            <div className="space-y-4">
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-vault-charcoal/40">Infrastructure Monitoring</span>
                                <h1 className="text-6xl font-display font-medium">Activity Protocol</h1>
                                <p className="text-xl text-vault-charcoal/50 max-w-xl">Real-time audit log of your encrypted sharding sequences.</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={loadActivity}
                                    className="p-4 bg-white border border-black/[0.05] hover:bg-vault-off-white transition-all rounded-[2px]"
                                >
                                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                                </button>
                                <div className="flex bg-white border border-black/[0.05] p-1 gap-1 rounded-[2px]">
                                    <button className="px-6 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest">Real-time</button>
                                    <button className="px-6 py-2 hover:bg-vault-off-white text-[10px] font-bold uppercase tracking-widest text-black/40 transition-all">Historical</button>
                                </div>
                            </div>
                        </header>

                        {/* Audit Log Table */}
                        <div className="bg-white border border-black/[0.05] rounded-[4px] overflow-hidden shadow-sm">
                            <div className="p-8 border-b border-black/[0.03] flex justify-between items-center bg-vault-off-white/30">
                                <div className="flex items-center gap-4">
                                    <Search size={18} className="text-black/20" />
                                    <input placeholder="Filter by event hash..." className="bg-transparent border-none outline-none text-sm font-medium w-64 placeholder:text-black/20" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                                    Total Records: {logs.length}
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-bold uppercase tracking-widest text-black/30 bg-vault-off-white/50 border-b border-black/[0.02]">
                                            <th className="px-10 py-5">Event Type</th>
                                            <th className="px-10 py-5">Resource Label</th>
                                            <th className="px-10 py-5 text-center">Protocol Node</th>
                                            <th className="px-10 py-5 text-center">Status</th>
                                            <th className="px-10 py-5 text-right">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/[0.02]">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={5} className="px-10 py-20 text-center text-black/20 font-medium">Syncing with VaultDB Protocol...</td>
                                            </tr>
                                        ) : logs.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-10 py-20 text-center text-black/20 font-medium">No activity recorded yet.</td>
                                            </tr>
                                        ) : (
                                            logs.map((log, idx) => (
                                                <motion.tr
                                                    key={log.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="group hover:bg-vault-off-white/50 transition-all"
                                                >
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-2 rounded-[2px] ${log.type === 'Upload' ? 'bg-black text-white' : log.type === 'Delete' ? 'bg-vault-alert text-white' : 'bg-gray-100'}`}>
                                                                {log.type === 'Upload' ? <Cloud size={14} /> : log.type === 'Delete' ? <RefreshCw size={14} /> : <Shield size={14} />}
                                                            </div>
                                                            <span className="font-bold text-sm tracking-tight">{log.type}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div>
                                                            <p className="font-bold text-sm tracking-tight">{log.name}</p>
                                                            <p className="text-[9px] font-mono opacity-30 group-hover:opacity-100 transition-opacity truncate max-w-xs">{log.hash || log.wallet}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6 text-center text-[10px] font-medium opacity-50 font-mono italic">{log.nodes}</td>
                                                    <td className="px-10 py-6 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${log.status === 'Success' ? 'bg-vault-success/10 text-vault-success' : 'bg-vault-alert/10 text-vault-alert'}`}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-6 text-right text-[10px] font-bold font-mono opacity-30">{log.time}</td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-4 px-5 py-4 rounded-[2px] cursor-pointer transition-all duration-300 ${active ? 'bg-black text-white shadow-xl translate-x-1' : 'text-black/40 hover:bg-vault-off-white hover:text-black hover:translate-x-1'}`}
        >
            {icon}
            <span className="text-[11px] font-bold uppercase tracking-[0.15em]">{label}</span>
        </div>
    )
}

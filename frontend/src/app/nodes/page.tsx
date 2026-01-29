'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import {
    Globe,
    Database,
    Cpu,
    Zap,
    Search,
    Layers,
    RefreshCw,
    File,
    Activity,
    Cloud,
    Shield
} from 'lucide-react'
import { IpfsLogo } from '@/components/IpfsLogo'
import { useRouter } from 'next/navigation'

const NODES = [
    { id: 'PHNX-01', location: 'Seattle, US', speed: '1.2 Gbps', status: 'Online', health: 98, load: 45 },
    { id: 'PHNX-02', location: 'Dublin, IE', speed: '820 Mbps', status: 'Online', health: 92, load: 62 },
    { id: 'PHNX-03', location: 'Tokyo, JP', speed: '940 Mbps', status: 'Idle', health: 100, load: 12 },
    { id: 'PHNX-04', location: 'Frankfurt, DE', speed: '1.1 Gbps', status: 'Online', health: 95, load: 58 },
    { id: 'PHNX-05', location: 'Sydney, AU', speed: '650 Mbps', status: 'Syncing', health: 88, load: 84 },
    { id: 'PHNX-06', location: 'São Paulo, BR', speed: '480 Mbps', status: 'Online', health: 94, load: 31 },
]

export default function NodesPage() {
    const router = useRouter()

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
                            <SidebarItem icon={<Activity size={18} />} label="Activity Log" onClick={() => router.push('/activity')} />
                            <SidebarItem icon={<Database size={18} />} label="Node Mesh" active />
                            <SidebarItem icon={<Cloud size={18} />} label="API Deployments" onClick={() => router.push('/deployments')} />
                        </nav>
                    </div>

                    <div className="mt-auto pt-6 border-t border-black/[0.05]">
                        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-vault-success`}>
                            <div className={`w-2 h-2 bg-current rounded-full animate-pulse`} />
                            Mesh Status: Synchronized
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-12 overflow-y-auto">
                    <div className="max-w-6xl mx-auto space-y-16">
                        <header className="flex flex-col md:flex-row justify-between items-end gap-8">
                            <div className="space-y-4">
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-vault-charcoal/40">Global Mesh Monitor</span>
                                <h1 className="text-6xl font-display font-medium">Node Explorer</h1>
                                <p className="text-xl text-vault-charcoal/50 max-w-xl">Visualize the distributed Avalanche subnet nodes holding your encrypted shards.</p>
                            </div>
                            <div className="flex bg-black text-white p-6 items-center gap-8 rounded-[2px] shadow-2xl">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Network Load</span>
                                    <span className="text-2xl font-display font-bold">42.8 TH/s</span>
                                </div>
                                <div className="h-10 w-[1px] bg-white/10" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Total Nodes</span>
                                    <span className="text-2xl font-display font-bold">12,402</span>
                                </div>
                            </div>
                        </header>

                        {/* Network Map Placeholder Visualization */}
                        <div className="h-[400px] bg-white border border-black/[0.05] rounded-[4px] relative overflow-hidden group shadow-sm">
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
                                <div className="p-20 font-mono text-[8vw] font-black break-all leading-none grayscale uppercase">
                                    VAULT_MESH_LAYER_0x1A2B3C4D_ACTIVE_NODE_RETENTION
                                </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                                        className="w-72 h-72 border border-dashed border-black/10 rounded-full flex items-center justify-center p-12"
                                    >
                                        <IpfsLogo className="w-full h-full text-black/5" />
                                    </motion.div>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 bg-black text-white rounded-[2px] text-[10px] font-bold uppercase tracking-widest shadow-xl">
                                        Active Protocol Mesh
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-8 right-8">
                                <button className="flex items-center gap-3 px-8 py-4 bg-white border border-black/[0.1] text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm">
                                    <RefreshCw size={14} />
                                    Recalibrate Shards
                                </button>
                            </div>
                        </div>

                        {/* Node Inventory */}
                        <div className="space-y-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/40">Distributed Infrastructure</h3>
                                <div className="flex gap-4 items-center">
                                    <Search size={18} className="text-black/20" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Status: Optimized</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {NODES.map((node, idx) => (
                                    <motion.div
                                        key={node.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white p-10 border border-black/[0.05] hover:border-black/20 hover:shadow-2xl transition-all group flex flex-col"
                                    >
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="w-14 h-14 bg-vault-off-white rounded-[2px] flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-sm">
                                                <Cpu size={28} />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] ${node.status === 'Online' ? 'bg-vault-success/10 text-vault-success' : 'bg-vault-alert/10 text-vault-alert'}`}>
                                                {node.status}
                                            </span>
                                        </div>
                                        <div className="space-y-2 mb-8 flex-1">
                                            <p className="text-2xl font-display font-bold tracking-tight">{node.id}</p>
                                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/30">{node.location}</p>
                                        </div>
                                        <div className="space-y-6 pt-8 border-t border-black/[0.03]">
                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                                <span className="opacity-40">Bandwidth</span>
                                                <span className="font-bold">{node.speed}</span>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest opacity-30">
                                                    <span>Node Resource Load</span>
                                                    <span>{node.load}%</span>
                                                </div>
                                                <div className="h-1 bg-vault-gray rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${node.load}%` }}
                                                        className="h-full bg-black shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
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

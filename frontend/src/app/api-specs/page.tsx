'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import {
    Terminal, Code2, Copy, Play, CheckCircle2,
    ChevronRight, Lock, Globe, Server, Database
} from 'lucide-react'
import { useState } from 'react'

export default function ApiSpecsPage() {
    const [activeTab, setActiveTab] = useState('upload')

    return (
        <div className="min-h-screen bg-vault-off-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32">
                {/* Header */}
                <section className="px-12 md:px-32 py-20 bg-white border-b border-black/[0.05]">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-vault-charcoal/30">Protocol Interface v1.0</span>
                        <h1 className="text-7xl font-display font-medium tracking-tighter text-black">REST API <br /> <span className="text-vault-charcoal/20">Specifications.</span></h1>
                        <p className="text-xl text-vault-charcoal/50 max-w-2xl leading-relaxed">
                            Direct, high-performance HTTP interface for interacting with the Vault Core C++ Engine.
                        </p>
                    </div>
                </section>

                {/* API Content */}
                <section className="px-12 md:px-32 py-40">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-20">
                        {/* Endpoints List */}
                        <div className="lg:col-span-1 space-y-12">
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/30">Binary Storage</p>
                                <div className="space-y-4">
                                    <ApiNavLink
                                        method="POST"
                                        path="/api/upload"
                                        active={activeTab === 'upload'}
                                        onClick={() => setActiveTab('upload')}
                                    />
                                    <ApiNavLink
                                        method="GET"
                                        path="/api/files"
                                        active={activeTab === 'list'}
                                        onClick={() => setActiveTab('list')}
                                    />
                                    <ApiNavLink
                                        method="GET"
                                        path="/api/download/{id}"
                                        active={activeTab === 'download'}
                                        onClick={() => setActiveTab('download')}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/30">Infrastructure</p>
                                <div className="space-y-4">
                                    <ApiNavLink
                                        method="GET"
                                        path="/api/capacity"
                                        active={activeTab === 'capacity'}
                                        onClick={() => setActiveTab('capacity')}
                                    />
                                    <ApiNavLink
                                        method="POST"
                                        path="/api/keys/generate"
                                        active={activeTab === 'keys'}
                                        onClick={() => setActiveTab('keys')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Spec Detail */}
                        <div className="lg:col-span-2 space-y-16">
                            <div className="bg-[#0A0A0A] rounded-lg overflow-hidden shadow-2xl border border-white/5">
                                <div className="bg-white/5 px-8 py-4 flex items-center justify-between border-b border-white/5">
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-mono font-bold text-vault-success tracking-widest uppercase">Endpoint Definition</span>
                                    </div>
                                    <Terminal size={16} className="text-white/20" />
                                </div>
                                <div className="p-10 font-mono text-sm space-y-8">
                                    {activeTab === 'upload' && (
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-4">
                                                <span className="bg-vault-success/20 text-vault-success px-3 py-1 rounded text-xs font-bold">POST</span>
                                                <span className="text-white font-bold text-lg">/api/upload</span>
                                            </div>
                                            <p className="text-gray-500 leading-relaxed text-base">
                                                Upload and shard a binary file to the global mesh. Requires EIP-191 signature authentication via the Authorization header.
                                            </p>
                                            <div className="space-y-4">
                                                <p className="text-vault-charcoal/40 text-xs font-bold uppercase tracking-widest">Headers</p>
                                                <div className="space-y-2">
                                                    <HeaderParam name="Authorization" type="Bearer <API_KEY>" desc="Your production API Secret Key." />
                                                    <HeaderParam name="X-Filename" type="string" desc="Original name of the binary." />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab !== 'upload' && (
                                        <div className="py-20 text-center space-y-4">
                                            <Code2 size={48} className="text-white/5 mx-auto" />
                                            <p className="text-white/20 font-display">Schema detail for {activeTab} is available in our production Swagger hub.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Real World Example */}
                            <div className="space-y-6">
                                <h3 className="text-2xl font-display font-medium text-black">Implementation Sample</h3>
                                <div className="bg-black p-8 rounded font-mono text-xs text-white/70 space-y-3 relative overflow-hidden group">
                                    <div className="flex items-center gap-2 mb-4 opacity-40">
                                        <div className="w-2 h-2 rounded-full bg-red-400" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                        <div className="w-2 h-2 rounded-full bg-green-400" />
                                    </div>
                                    <pre className="text-vault-success overflow-x-auto">
                                        {`curl -X POST http://vault-mesh-1.ava/api/upload \\
  -H "Authorization: Bearer va_live_0x123...abc" \\
  -H "X-Filename: archive.pdf" \\
  -F "file=@/path/to/archive.pdf"`}
                                    </pre>
                                    <button className="absolute top-6 right-8 text-white/20 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                        <Copy size={16} />
                                    </button>
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

function ApiNavLink({ method, path, active, onClick }: { method: string, path: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 rounded-lg flex items-center justify-between transition-all group ${active ? 'bg-black text-white shadow-lg' : 'bg-white hover:bg-vault-off-white border border-black/5'}`}
        >
            <div className="flex items-center gap-4 overflow-hidden">
                <span className={`text-[9px] font-black w-10 text-center rounded-sm py-0.5 ${method === 'POST' ? 'bg-vault-success text-black' : 'bg-blue-500 text-white'}`}>
                    {method}
                </span>
                <span className="text-xs font-mono font-medium truncate">{path}</span>
            </div>
            <ChevronRight size={14} className={`${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'} transition-all`} />
        </button>
    )
}

function HeaderParam({ name, type, desc }: { name: string, type: string, desc: string }) {
    return (
        <div className="flex items-start gap-4">
            <span className="text-white/80 min-w-32">{name}</span>
            <div className="space-y-1">
                <span className="text-vault-success font-black text-[9px] uppercase tracking-widest">{type}</span>
                <p className="text-gray-600 text-[11px] font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

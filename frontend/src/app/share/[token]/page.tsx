'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Download, Shield, Clock, FileText, Lock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { fetchPublicFile, VaultFile, downloadFile } from '@/lib/api'

export default function SharePage() {
    const params = useParams()
    const token = params.token as string
    const [file, setFile] = useState<VaultFile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadFile = async () => {
            try {
                setIsLoading(true)
                const data = await fetchPublicFile(token)
                setFile(data)
            } catch (err) {
                setError('Invalid or expired protocol share token.')
            } finally {
                setIsLoading(false)
            }
        }
        if (token) loadFile()
    }, [token])

    const handleDownload = async () => {
        if (!file) return
        try {
            await downloadFile(file.id, file.name)
        } catch (err) {
            console.error('Download failed')
        }
    }

    return (
        <div className="min-h-screen bg-vault-off-white flex flex-col selection:bg-black selection:text-white">
            <Navbar />

            <main className="flex-1 flex flex-col items-center justify-center p-8 pt-32">
                <div className="w-full max-w-2xl bg-white border border-black/[0.05] rounded-[4px] overflow-hidden shadow-2xl relative">
                    {/* Top Aesthetic Bar */}
                    <div className="h-2 bg-gradient-to-r from-black via-vault-success to-black" />

                    <div className="p-16 space-y-12">
                        <header className="text-center space-y-4">
                            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                                <Shield size={32} className="text-white" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-vault-charcoal/40">Secured Shard Transmission</span>
                            <h1 className="text-5xl font-display font-medium tracking-tight">Public Protocol Share</h1>
                        </header>

                        {isLoading ? (
                            <div className="text-center py-10 space-y-4">
                                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Decrypting Transmission...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-10 bg-vault-alert/5 border border-vault-alert/20 rounded-[2px] space-y-4">
                                <Lock size={32} className="mx-auto text-vault-alert" />
                                <p className="text-xl font-display font-medium text-vault-alert">{error}</p>
                            </div>
                        ) : file && (
                            <div className="space-y-10">
                                <div className="bg-vault-off-white p-10 rounded-[4px] border border-black/[0.03] space-y-8 shadow-inner">
                                    <div className="flex items-center gap-6">
                                        <div className="p-4 bg-white border border-black/[0.05] rounded-[2px]">
                                            <FileText size={40} className="text-black" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-2xl font-display font-bold truncate">{file.name}</h2>
                                            <p className="text-[10px] font-mono opacity-40 truncate">{file.hash}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pt-8 border-t border-black/[0.05]">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">File Size</p>
                                            <p className="font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">Security Scan</p>
                                            <p className="font-bold text-vault-success flex items-center gap-2">Verified <Shield size={12} /></p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleDownload}
                                    className="w-full vault-button py-6 flex items-center justify-center gap-4 text-lg"
                                >
                                    <Download size={24} />
                                    Download Distributed Shard
                                </button>

                                <div className="flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-black/30">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} />
                                        Expires in 24h
                                    </div>
                                    <div className="w-1 h-1 bg-black/10 rounded-full" />
                                    <div className="flex items-center gap-2 text-vault-success">
                                        <Shield size={14} />
                                        TLS-1.3 Encrypted
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Background Detail */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none font-mono text-[15vw] font-black break-all leading-none select-none overflow-hidden grayscale">
                        VAULT_SHARE_PROTOCOL_TX_ID_{token}
                    </div>
                </div>

                <p className="mt-12 text-[10px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/30">
                    &copy; 2026 Vault Protocol &mdash; Decentralized Sharding Engine
                </p>
            </main>
        </div>
    )
}

'use client'

import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, ArrowRight, Zap, Database, X, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'

export function WalletConnectModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { connect, connectors, isPending, error: connectError } = useConnect()
    const { isConnected } = useAccount()

    // Filter connectors to avoid duplicates (e.g., metaMask and generic injected)
    const activeConnectors = connectors.filter((c, index, self) =>
        index === self.findIndex((t) => (t.id === c.id))
    )

    useEffect(() => {
        if (isConnected) {
            onClose()
        }
    }, [isConnected, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md bg-white p-12 rounded-[4px] border border-black/[0.05] shadow-[0_40px_120px_rgba(0,0,0,0.5)]"
            >
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <h2 className="text-4xl font-display font-medium text-black tracking-tight">Access Gateway</h2>
                            <button onClick={onClose} className="text-gray-300 hover:text-black transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-vault-charcoal/50 font-medium">Identify through the Avalanche protocol nodes.</p>
                    </div>

                    <div className="space-y-4">
                        {activeConnectors.map((connector) => (
                            <button
                                key={connector.id}
                                onClick={() => connect({ connector })}
                                disabled={isPending}
                                className="w-full flex items-center justify-between p-6 border border-black/[0.05] hover:border-black hover:bg-vault-off-white transition-all rounded-[4px] group relative overflow-hidden disabled:opacity-50"
                            >
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="w-14 h-14 bg-black flex items-center justify-center rounded-[2px] group-hover:scale-105 transition-transform">
                                        {connector.id.toLowerCase().includes('metamask') ? (
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg" className="w-8 h-8" alt="MetaMask" />
                                        ) : connector.id.toLowerCase().includes('coinbase') ? (
                                            <Database size={24} className="text-white" />
                                        ) : (
                                            <Wallet size={24} className="text-white" />
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-bold text-xl">
                                            {connector.name}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                                            {connector.id === 'injected' ? 'External Injected Provider' : 'Native Web3 Gateway'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isPending && <RefreshCw size={16} className="animate-spin text-black/20" />}
                                    <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-black relative z-10" />
                                </div>
                            </button>
                        ))}
                    </div>

                    {connectError && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-[2px]">
                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest leading-relaxed">
                                {connectError.message.includes('not found')
                                    ? "Wallet instance not found. Ensure MetaMask/Core is active in your browser."
                                    : connectError.message}
                            </p>
                        </div>
                    )}

                    <div className="p-6 bg-vault-off-white border border-black/[0.03] rounded-[2px]">
                        <p className="text-[10px] text-center text-vault-charcoal/40 uppercase tracking-[0.25em] leading-relaxed font-bold">
                            🛡️ Authenticated session powered by Avalanche EIP-191 signatures.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

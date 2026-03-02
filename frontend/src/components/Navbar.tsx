'use client'

import Link from 'next/link'
import { useAccount, useDisconnect, useConnect } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, LogOut, ChevronRight } from 'lucide-react'
import { IpfsLogo } from './IpfsLogo'
import { useState } from 'react'
import { WalletConnectModal } from './WalletConnectModal'

export function Navbar() {
    const { address, isConnected } = useAccount()
    const { connect, connectors, isPending } = useConnect()
    const { disconnect } = useDisconnect()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleLogin = () => {
        const mm = connectors.find((c: any) => c.id === 'metaMask' || c.id === 'io.metamask')
        const inj = connectors.find((c: any) => c.id === 'injected')
        const preferred = mm || inj || connectors[0]

        if (preferred && connectors.length <= 2) {
            connect({ connector: preferred })
        } else {
            setIsModalOpen(true)
        }
    }

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 h-24 z-[90] px-12 flex items-center justify-between border-b border-black/[0.03] bg-vault-off-white/80 backdrop-blur-xl">
                <div className="flex items-center gap-16">
                    <Link href="/" className="group flex items-center gap-4">
                        <div className="w-10 h-10 bg-black flex items-center justify-center rounded-[2px] group-hover:rotate-[30deg] transition-transform duration-500">
                            <IpfsLogo className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-display text-2xl font-bold tracking-tighter text-black uppercase">
                            Vault
                        </span>
                    </Link>

                    {isConnected && (
                        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-vault-charcoal/30">
                            <span>Main</span>
                            <ChevronRight size={12} />
                            <Link href="/dashboard" className="text-black hover:opacity-100 opacity-60 transition-opacity">Files</Link>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-8">
                        <NavLink href="/features">Features</NavLink>
                        <NavLink href="/developers">Developers</NavLink>
                        <NavLink href="/ecosystem">Ecosystem</NavLink>
                        <NavLink href="/whitepaper">Whitepaper</NavLink>
                    </div>

                    <div className="h-4 w-[1px] bg-black/[0.05]" />

                    <AnimatePresence mode="wait">
                        {isConnected ? (
                            <motion.div
                                key="connected"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-center gap-6"
                            >
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-vault-charcoal/30 uppercase tracking-widest">Connected</span>
                                    <span className="text-sm font-mono font-medium">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                                </div>
                                <button
                                    onClick={() => disconnect()}
                                    className="w-10 h-10 flex items-center justify-center border border-black/[0.05] hover:bg-black hover:text-white transition-all rounded-[2px]"
                                    title="Disconnect"
                                >
                                    <LogOut size={16} />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="disconnected"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <button
                                    onClick={handleLogin}
                                    disabled={isPending}
                                    className="vault-button py-2.5 px-6 flex items-center gap-2 text-xs"
                                >
                                    <Wallet size={16} className={isPending ? 'animate-bounce' : ''} />
                                    {isPending ? 'Connecting...' : 'Connect Wallet'}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </nav>

            <AnimatePresence>
                {isModalOpen && (
                    <WalletConnectModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    )
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-xs font-bold uppercase tracking-[0.2em] text-vault-charcoal/40 hover:text-black transition-colors relative group"
        >
            {children}
            <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-black transition-all group-hover:w-full" />
        </Link>
    )
}

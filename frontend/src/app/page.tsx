'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { useAccount, useConnect } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Shield, Zap, Globe, Lock, ArrowRight, Layers, Database,
  Code, Activity, Server, Smartphone, Monitor, Wallet,
  Terminal, ChevronRight, CheckCircle2, Layout, Boxes
} from 'lucide-react'
import { IpfsLogo } from '@/components/IpfsLogo'
import Link from 'next/link'
import { WalletConnectModal } from '@/components/WalletConnectModal'

export default function LandingPage() {
  const { isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const handleLogin = () => {
    // Try to connect the specific MetaMask connector or first injected one directly
    const mm = connectors.find((c: any) => c.id === 'metaMask')
    const inj = connectors.find((c: any) => c.id === 'injected')
    const preferred = mm || inj || connectors[0]

    if (preferred && connectors.length <= 2) { // If only common ones found, try to connect directly
      connect({ connector: preferred })
    } else {
      setIsModalOpen(true)
    }
  }

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard')
    }
  }, [isConnected, router])

  return (
    <div className="min-h-screen bg-vault-off-white flex flex-col selection:bg-black selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* 1. Hero Section - The Hook */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center p-8 pt-40 relative overflow-hidden">
          <div className="text-center space-y-12 mb-20 max-w-5xl relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-vault-charcoal/40 bg-white/50 border border-vault-gray px-6 py-2 rounded-full backdrop-blur-sm shadow-sm hover:border-black transition-colors cursor-default">
                Avalanche Optimized Infrastructure
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-8xl md:text-[200px] font-display font-medium tracking-[-0.05em] leading-[0.8] text-black"
            >
              VAULT
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-2xl md:text-3xl text-vault-charcoal/60 font-medium max-w-3xl mx-auto leading-relaxed"
            >
              The high-performance protocol for Web3 file sharding.
              Luxurious. Encrypted. Unstoppable.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="pt-12 flex flex-col md:flex-row items-center justify-center gap-6"
            >
              <button
                onClick={handleLogin}
                className="vault-button px-14 py-6 text-xl group flex items-center gap-4 relative overflow-hidden active:scale-95 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.2)]"
                disabled={isPending}
              >
                <span className="relative z-10">{isPending ? 'Connecting...' : 'Connect Wallet'}</span>
                <Wallet size={24} className={`group-hover:translate-x-1.5 transition-transform relative z-10 ${isPending ? 'animate-bounce' : ''}`} />
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              <Link href="/whitepaper" className="px-14 py-6 border border-black hover:bg-black hover:text-white transition-all text-sm font-bold uppercase tracking-[0.3em] rounded-[2px] backdrop-blur-sm">
                Protocol Details
              </Link>
            </motion.div>
          </div>

          {/* Technical Backdrop Decoration */}
          <div className="absolute inset-0 -z-20 opacity-[0.03] pointer-events-none select-none">
            <div className="p-20 font-mono text-[8vw] font-black break-all leading-none grayscale uppercase">
              VAULT_CORE_BINARY_STORAGE_LAYER_0x1A2B3C4D_GCM_PROTOCOL_AVA_SHARD_ACTIVE_MESH
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-vault-off-white to-transparent" />
        </section>

        {/* 2. Ecosystem section - Social Proof Marquee */}
        <section className="py-24 border-y border-black/[0.05] bg-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-8 space-y-12">
            <div className="flex justify-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-vault-charcoal/30">Trusted by top-tier subnets</span>
            </div>
            <div className="flex flex-wrap justify-between gap-12 grayscale opacity-40 hover:opacity-100 transition-opacity">
              <EcosystemLogo label="Avalanche" />
              <EcosystemLogo label="Metamask" />
              <EcosystemLogo label="Core Wallet" />
              <EcosystemLogo label="Subnet-8" />
              <EcosystemLogo label="IPFS" />
              <EcosystemLogo label="Node Mesh" />
              <EcosystemLogo label="Zk-Proof" />
            </div>
          </div>
        </section>

        {/* 2.5 Technical Deep Dive Section */}
        <section className="py-40 px-12 md:px-32 bg-vault-off-white">
          <div className="max-w-7xl mx-auto space-y-32">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <div className="space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-vault-success">Engine Architecture</span>
                  <h2 className="text-6xl font-display font-medium leading-tight text-black">High-Performance <br /> Binary Sharding.</h2>
                </div>
                <p className="text-xl text-vault-charcoal/50 leading-relaxed font-medium">
                  We built our custom storage engine from the ground up in C++ to handle the high throughput requirements of the Avalanche network.
                </p>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <p className="text-3xl font-display font-bold text-black font-mono">256-bit</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-vault-charcoal/40">AES Encryption</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-3xl font-display font-bold text-black font-mono">12 Shards</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-vault-charcoal/40">Default Redundancy</p>
                  </div>
                </div>
              </div>
              <div className="relative aspect-square">
                <div className="absolute inset-0 bg-black rounded-[4px] shadow-2xl overflow-hidden flex items-center justify-center border border-white/5">
                  <div className="grid grid-cols-4 grid-rows-4 gap-4 p-8 w-full h-full opacity-20">
                    {[...Array(16)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0.1 }}
                        animate={{ opacity: [0.1, 0.4, 0.1] }}
                        transition={{ duration: 4, delay: i * 0.1, repeat: Infinity }}
                        className="bg-vault-success rounded-sm"
                      />
                    ))}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-12 space-y-6">
                    <p className="font-mono text-xs text-vault-success opacity-80">SHARD_RECONSTRUCTION_READY: 0x82d1...73c</p>
                    <div className="h-[2px] w-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="h-full w-1/3 bg-vault-success"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Developer Experience - Real Utility */}
        <section className="py-40 px-12 md:px-32 bg-black text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-12 relative z-10">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-vault-success/60">Built for Engineers</span>
                <h2 className="text-6xl font-display font-medium leading-tight">Integration in <br /> seconds, for real.</h2>
              </div>
              <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
                Use our universal API to sharding data directly into your decentralized application.
                No single point of failure. No centralized storage.
              </p>
              <div className="space-y-6">
                <FeatureItem label="Unified Binary API" />
                <FeatureItem label="EIP-191 Signature Auth" />
                <FeatureItem label="Global Node Mesh Retrieval" />
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-vault-success/20 to-black rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-[#0A0A0A] border border-white/10 rounded-lg p-10 font-mono text-sm leading-relaxed overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 mb-8 opacity-20">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-white/80 space-y-4">
                  <p className="text-vault-success opacity-80">// Deploy to the Avalanche Mesh</p>
                  <p><span className="text-purple-400">import</span> {"{ Vault }"} <span className="text-purple-400">from</span> <span className="text-vault-success">'@vault/protocol'</span>;</p>
                  <p><span className="text-purple-400">const</span> client = <span className="text-blue-400">new</span> <span className="text-yellow-400">Vault</span>({"{ subnetId: '802-AVA' }"});</p>
                  <br />
                  <p><span className="text-purple-400">await</span> client.<span className="text-blue-400">shard</span>(file, {"{"}</p>
                  <p>&nbsp;&nbsp;redundancy: <span className="text-orange-400">12</span>,</p>
                  <p>&nbsp;&nbsp;encryption: <span className="text-vault-success">'AES-256-GCM'</span></p>
                  <p>{"}"});</p>
                  <p className="text-vault-success opacity-40">// 0.4s later: Globally persistent.</p>
                </div>
                <div className="absolute top-8 right-10 flex flex-col items-end gap-2">
                  <Terminal size={40} className="text-white/5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Security Philosophy Section */}
        <section className="py-40 px-12 md:px-32 bg-white relative">
          <div className="max-w-4xl mx-auto text-center space-y-24">
            <div className="space-y-6">
              <h2 className="text-6xl font-display font-medium tracking-tight">Data Sovereignty. By Design.</h2>
              <p className="text-xl text-vault-charcoal/50 leading-relaxed mx-auto max-w-2xl">
                Your files are fragmented locally before reaching the mesh.
                We don't store your data; we coordinate its immortality.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-1px bg-vault-gray border border-vault-gray rounded-[2px] overflow-hidden text-left">
              <SecurityCard
                icon={<Lock size={32} />}
                title="Client-Side Entropy"
                desc="Entropy is generated locally within your secured session environment."
              />
              <SecurityCard
                icon={<Boxes size={32} />}
                title="Atomic Distribution"
                desc="Shards are distributed atomically, ensuring consistent availability."
              />
            </div>
          </div>
        </section>

        {/* 5. Sharding Visualization section (Expanded Workflow) */}
        <section className="py-40 px-12 md:px-32 bg-vault-off-white">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="flex flex-col md:flex-row justify-between items-end gap-12">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/40">Physical Layer</span>
                <h2 className="text-7xl font-display font-bold">The Mesh.</h2>
              </div>
              <p className="text-vault-charcoal/50 max-w-md text-lg font-medium leading-relaxed">
                A globally distributed network of high-performance C++ storage nodes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-1px bg-vault-gray border border-vault-gray overflow-hidden shadow-2xl">
              <WorkflowStep
                number="01"
                icon={<Lock size={32} />}
                title="AES-256 Sharding"
                desc="Local fragmentation ensures your data never leaves the browser in its original form."
              />
              <WorkflowStep
                number="02"
                icon={<Layers size={32} />}
                title="Subnet Routing"
                desc="Atomic sharding logic distributes fragments across the global Avalanche mesh."
              />
              <WorkflowStep
                number="03"
                icon={<Activity size={32} />}
                title="Persistence"
                desc="Provenance indexing on-chain with millisecond retrieval for enterprise workflows."
              />
            </div>
          </div>
        </section>

        {/* 6. Core Pillars - Why Vault? */}
        <section className="py-40 px-12 md:px-32 bg-white border-t border-black/[0.05]">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-vault-charcoal/40">Philosophy</span>
              <h2 className="text-6xl font-display font-medium">Why Build on Vault?</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <PillarCard
                title="Zero-Knowledge"
                desc="We don't hold your keys. We can't see your data. True privacy by architectural guarantee, not policy."
                icon={<Shield size={24} />}
                href="/features"
              />
              <PillarCard
                title="Infinite Scale"
                desc="10TB default capacity per user. Our custom sharding engine scales linearly with the Avalanche network."
                icon={<Database size={24} />}
                featured
                href="/ecosystem"
              />
              <PillarCard
                title="Developer First"
                desc="One-line integration. Standardized REST APIs. Webhooks. Everything you need to build the future."
                icon={<Code size={24} />}
                href="/developers"
              />
            </div>
          </div>
        </section>

        {/* 7. Final CTA - The Conversion */}
        <section className="py-60 px-12 md:px-32 bg-black text-white relative flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 opacity-20 overflow-hidden pointer-events-none">
            <div className="p-20 font-display text-[20vw] font-black leading-none whitespace-nowrap -mb-20">VAULT PROTOCOL</div>
          </div>

          <div className="relative z-10 space-y-12 max-w-3xl">
            <h2 className="text-6xl md:text-[100px] font-display font-medium leading-[0.9] tracking-tighter">
              Ready to secure the future?
            </h2>
            <p className="text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
              Join the next generation of Avalanche developers building high-fidelity storage applications.
            </p>
            <div className="pt-12">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-white text-black px-16 py-8 text-xl font-bold uppercase tracking-[0.2em] hover:bg-vault-success hover:scale-[1.05] transition-all duration-500 rounded-[2px]"
              >
                Connect Wallet Now
              </button>
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <WalletConnectModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <Footer />

      <div className="fixed inset-0 -z-30 pointer-events-none">
        <div className="mesh-bg opacity-[0.2]" />
      </div>
    </div>
  )
}

function EcosystemLogo({ label }: { label: string }) {
  return (
    <span className="text-xs font-bold uppercase tracking-[0.3em] font-mono hover:text-black transition-colors">
      {label}
    </span>
  )
}

function FeatureItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-8 h-[1px] bg-vault-success group-hover:w-12 transition-all" />
      <span className="text-sm font-bold uppercase tracking-[0.2em]">{label}</span>
    </div>
  )
}

function SecurityCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white p-12 space-y-8 hover:bg-vault-off-white transition-all cursor-default group">
      <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-[2px] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-display font-bold">{title}</h3>
        <p className="text-vault-charcoal/50 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function WorkflowStep({ number, icon, title, desc }: { number: string, icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white p-14 space-y-16 hover:bg-vault-off-white transition-colors group cursor-default">
      <div className="flex justify-between items-start">
        <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-[2px] group-hover:rotate-12 transition-all duration-500">
          {icon}
        </div>
        <span className="text-5xl font-display font-medium text-black/5 group-hover:text-black/10 transition-colors uppercase">{number}</span>
      </div>
      <div className="space-y-4">
        <h3 className="text-3xl font-display font-bold">{title}</h3>
        <p className="text-vault-charcoal/50 text-base leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  )
}

function PillarCard({ title, desc, icon, featured = false, href = "#" }: { title: string, desc: string, icon: any, featured?: boolean, href?: string }) {
  return (
    <div className={`p-12 space-y-8 border transition-all hover:-translate-y-2 flex flex-col h-full ${featured ? 'bg-black text-white border-black shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative' : 'bg-white border-black/[0.05] hover:border-black/20'}`}>
      <div className={`w-12 h-12 flex items-center justify-center rounded-[2px] ${featured ? 'bg-white text-black' : 'bg-black text-white'}`}>
        {icon}
      </div>
      <div className="space-y-4 flex-1">
        <h3 className="text-2xl font-display font-medium">{title}</h3>
        <p className={`text-sm leading-relaxed ${featured ? 'opacity-70' : 'text-vault-charcoal/50'}`}>{desc}</p>
      </div>

      <Link href={href} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest pt-6 group/link ${featured ? 'text-vault-success' : 'text-black'}`}>
        Learn More <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
      </Link>

      {featured && (
        <div className="absolute top-8 right-12">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-vault-success text-black px-4 py-2 rounded-full shadow-lg shadow-vault-success/20">Enterprise</span>
        </div>
      )}
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import {
    Code2,
    Terminal,
    Copy,
    Check,
    Key,
    File,
    Activity,
    Database,
    Cloud,
    Shield,
    ExternalLink
} from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { generateApiKey } from '@/lib/api'

const CODE_EXAMPLES = {
    curl: `curl -X GET "http://localhost:8081/api/files" \\
     -H "X-Wallet-Address: 0xYourWalletAddress"`,
    javascript: `const response = await fetch('http://localhost:8081/api/files', {
  headers: {
    'X-Wallet-Address': '0xYourWalletAddress'
  }
});
const data = await response.json();
console.log(data);`,
    python: `import requests

url = "http://localhost:8081/api/files"
headers = {"X-Wallet-Address": "0xYourWalletAddress"}

response = requests.get(url, headers=headers)
print(response.json())`,
}

export default function DeploymentsPage() {
    const { address } = useAccount()
    const [activeTab, setActiveTab] = useState<'curl' | 'javascript' | 'python'>('curl')
    const [copied, setCopied] = useState(false)
    const [apiKey, setApiKey] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const router = useRouter()

    const handleCopy = () => {
        const code = apiKey
            ? CODE_EXAMPLES[activeTab].replace('0xYourWalletAddress', address || '0x...').replace('curl -X GET', `curl -X GET -H "Authorization: Bearer ${apiKey}"`)
            : CODE_EXAMPLES[activeTab]

        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleGenerateKey = async () => {
        if (!address) return;
        try {
            setIsGenerating(true);
            const data = await generateApiKey(address);
            setApiKey(data.key);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    }

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
                            <SidebarItem icon={<Database size={18} />} label="Node Mesh" onClick={() => router.push('/nodes')} />
                            <SidebarItem icon={<Cloud size={18} />} label="API Deployments" active />
                        </nav>
                    </div>

                    <div className="mt-auto pt-6 border-t border-black/[0.05]">
                        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-vault-success`}>
                            <div className={`w-2 h-2 bg-current rounded-full animate-pulse`} />
                            API Status: Operational
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-12 overflow-y-auto">
                    <div className="max-w-6xl mx-auto space-y-16">
                        <header className="space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-vault-charcoal/40">Developer Protocol</span>
                            <h1 className="text-6xl tracking-tighter font-display font-medium">Engine Integration</h1>
                            <p className="text-xl text-vault-charcoal/50 max-w-2xl">
                                VaultDB Native API. Directly interface with the C++ sharding engine from your
                                automated deployment pipelines and CI/CD environments.
                            </p>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            {/* Documentation */}
                            <section className="space-y-12">
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold font-display">Local Engine API</h3>
                                    <p className="text-vault-charcoal/70 font-medium">
                                        The VAULT C++ Engine exposes a high-performance REST API.
                                        In development, the engine listens on port 8081.
                                    </p>

                                    <div className="bg-white border border-black/[0.05] rounded-[4px] p-8 space-y-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-vault-charcoal/40">Local Endpoint</span>
                                            <button
                                                onClick={() => { navigator.clipboard.writeText('http://localhost:8081'); }}
                                                className="text-[10px] font-bold uppercase tracking-widest hover:text-black transition-colors flex items-center gap-1 opacity-40 hover:opacity-100"
                                            >
                                                <Copy size={12} /> Copy
                                            </button>
                                        </div>
                                        <div className="font-mono text-sm bg-vault-off-white p-4 rounded-[2px] border border-black/[0.02] shadow-inner">
                                            http://localhost:8081
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold font-display">Authentication</h3>
                                    <p className="text-vault-charcoal/70 font-medium">
                                        In production, use HMAC-SHA256 signed headers for protocol-level security.
                                    </p>

                                    {!apiKey ? (
                                        <button
                                            onClick={handleGenerateKey}
                                            disabled={isGenerating || !address}
                                            className="vault-button flex items-center gap-2 py-4 px-10 shadow-lg disabled:opacity-50"
                                        >
                                            <Key size={18} />
                                            {isGenerating ? 'Generating...' : 'Generate API Secret'}
                                        </button>
                                    ) : (
                                        <div
                                            onClick={() => {
                                                navigator.clipboard.writeText(apiKey);
                                                // Optional: Add a temporary toast or visual feedback here if desired
                                            }}
                                            className="bg-black text-white p-6 rounded-[4px] space-y-2 relative group overflow-hidden cursor-pointer hover:bg-neutral-900 transition-colors"
                                            title="Click to Copy"
                                        >
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-2">
                                                Active Secret Key <span className="opacity-50 text-[9px]">(CLICK TO COPY)</span>
                                            </p>
                                            <p className="font-mono text-lg tracking-widest text-vault-success blur-sm group-hover:blur-none transition-all select-all break-all">
                                                {apiKey}
                                            </p>
                                            <div className="absolute top-4 right-4 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                                                Hover to reveal
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-white border border-black/[0.05] rounded-[2px] overflow-hidden shadow-sm">
                                        <table className="w-full text-left">
                                            <thead className="bg-vault-off-white border-b border-black/[0.05] text-[10px] uppercase font-bold text-vault-charcoal/40 tracking-widest">
                                                <tr>
                                                    <th className="px-6 py-5">Environment</th>
                                                    <th className="px-6 py-5">Protocol Status</th>
                                                    <th className="px-6 py-5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                <tr className="border-b border-black/[0.02] last:border-0 hover:bg-vault-off-white/50 transition-colors">
                                                    <td className="px-6 py-6 font-bold">Local Development</td>
                                                    <td className="px-6 py-6 text-vault-success font-medium">Operational</td>
                                                    <td className="px-6 py-6 text-right">
                                                        <button className="text-vault-alert text-[10px] font-bold uppercase tracking-widest hover:underline">Revoke</button>
                                                    </td>
                                                </tr>
                                                {apiKey && (
                                                    <tr className="border-b border-black/[0.02] last:border-0 hover:bg-vault-off-white/50 transition-colors animate-in fade-in slide-in-from-top-2">
                                                        <td className="px-6 py-6 font-bold">Production (API Key)</td>
                                                        <td className="px-6 py-6 text-vault-success font-medium">Active</td>
                                                        <td className="px-6 py-6 text-right">
                                                            <button onClick={() => setApiKey(null)} className="text-vault-alert text-[10px] font-bold uppercase tracking-widest hover:underline">Revoke</button>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>

                            {/* Code Examples */}
                            <section className="space-y-10">
                                <div className="bg-black rounded-[4px] shadow-2xl overflow-hidden border border-white/10">
                                    <div className="bg-white/5 px-8 py-6 flex items-center justify-between border-b border-white/5">
                                        <div className="flex items-center gap-8">
                                            {(['curl', 'javascript', 'python'] as const).map((tab) => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${activeTab === tab ? 'text-white' : 'text-white/30 hover:text-white'}`}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleCopy}
                                            className="text-white/40 hover:text-white transition-colors p-2"
                                        >
                                            {copied ? <Check size={18} className="text-vault-success" /> : <Copy size={18} />}
                                        </button>
                                    </div>

                                    <div className="p-10">
                                        <pre className="font-mono text-[14px] text-white/80 leading-relaxed overflow-x-auto selection:bg-white/20">
                                            <code>{CODE_EXAMPLES[activeTab]}</code>
                                        </pre>
                                    </div>
                                </div>

                                <div className="bg-white border border-black/[0.05] rounded-[4px] p-10 flex items-start gap-6 shadow-sm">
                                    <div className="p-5 bg-black text-white rounded-[2px] shadow-2xl">
                                        <Terminal size={32} />
                                    </div>
                                    <div className="space-y-3">
                                        <p className="font-bold text-lg tracking-tight">Vault CLI Tool</p>
                                        <p className="text-sm text-vault-charcoal/60 leading-relaxed font-medium">
                                            Download the pre-compiled C++ CLI binary to interact with the
                                            engine directly from the terminal without HTTP overhead.
                                        </p>
                                        <button className="text-[11px] font-bold uppercase tracking-[0.2em] text-black hover:opacity-60 transition-opacity flex items-center gap-2 pt-4">
                                            Download Protocol Binary <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </div>
                            </section>
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

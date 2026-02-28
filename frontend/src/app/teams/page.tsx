'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import {
    Users,
    UserPlus,
    Shield,
    FileText,
    Plus,
    RefreshCw,
    MoreVertical,
    Trash2,
    CheckCircle2,
    ChevronRight,
    Search
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import {
    fetchTeams,
    createTeam,
    inviteToTeam,
    fetchTeamFiles,
    fetchTeamMembers,
    Team,
    TeamMember,
    VaultFile
} from '@/lib/api'

export default function TeamsPage() {
    const { address, isConnected } = useAccount()
    const router = useRouter()

    const [teams, setTeams] = useState<Team[]>([])
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
    const [teamFiles, setTeamFiles] = useState<VaultFile[]>([])
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreatingTeam, setIsCreatingTeam] = useState(false)
    const [isInviting, setIsInviting] = useState(false)
    const [newTeamName, setNewTeamName] = useState('')
    const [inviteWallet, setInviteWallet] = useState('')
    const [inviteRole, setInviteRole] = useState('viewer')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const loadData = useCallback(async () => {
        if (!address) return
        try {
            setIsLoading(true)
            const teamData = await fetchTeams(address)
            setTeams(teamData)
            if (teamData.length > 0 && !selectedTeam) {
                setSelectedTeam(teamData[0])
            }
        } catch (err) {
            setError('Failed to load teams.')
        } finally {
            setIsLoading(false)
        }
    }, [address, selectedTeam])

    const loadTeamFiles = useCallback(async (teamId: number) => {
        try {
            const [files, members] = await Promise.all([
                fetchTeamFiles(teamId),
                fetchTeamMembers(teamId)
            ])
            setTeamFiles(files)
            setTeamMembers(members)
        } catch (err) {
            console.error('Failed to load team data')
        }
    }, [])

    useEffect(() => {
        if (!isConnected) {
            router.push('/')
            return
        }
        loadData()
    }, [isConnected, router, loadData])

    useEffect(() => {
        if (selectedTeam) {
            loadTeamFiles(selectedTeam.id)
        }
    }, [selectedTeam, loadTeamFiles])

    const handleCreateTeam = async () => {
        if (!newTeamName || !address) return
        try {
            await createTeam(newTeamName, address)
            setNewTeamName('')
            setIsCreatingTeam(false)
            setSuccess('Team created successfully.')
            loadData()
        } catch (err) {
            setError('Failed to create team.')
        }
    }

    const handleInvite = async () => {
        if (!inviteWallet || !selectedTeam || !address) return
        try {
            await inviteToTeam(selectedTeam.id, inviteWallet, inviteRole, address)
            setInviteWallet('')
            setIsInviting(false)
            setSuccess(`Invited ${inviteWallet.slice(0, 6)}... to team.`)
        } catch (err) {
            setError('Failed to send invitation.')
        }
    }

    if (!isConnected) return null

    return (
        <div className="min-h-screen bg-vault-off-white flex flex-col selection:bg-black selection:text-white">
            <Navbar />

            <div className="flex-1 flex pt-24 overflow-hidden">
                {/* Team Sidebar */}
                <aside className="w-80 bg-white border-r border-black/[0.05] p-8 flex flex-col gap-8 overflow-y-auto">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/40">My Teams</h3>
                        <button
                            onClick={() => setIsCreatingTeam(true)}
                            className="p-1.5 hover:bg-black/5 rounded-full transition-colors text-black/40 hover:text-black"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    <nav className="flex flex-col gap-2">
                        {teams.map(team => (
                            <div
                                key={team.id}
                                onClick={() => setSelectedTeam(team)}
                                className={`flex items-center gap-4 px-5 py-4 rounded-[2px] cursor-pointer transition-all duration-300 ${selectedTeam?.id === team.id ? 'bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] translate-x-1' : 'text-black/40 hover:bg-vault-off-white hover:text-black hover:translate-x-1'}`}
                            >
                                <Users size={18} />
                                <span className="text-[11px] font-bold uppercase tracking-[0.15em] truncate">{team.name}</span>
                            </div>
                        ))}
                        {teams.length === 0 && !isLoading && (
                            <p className="text-[10px] text-black/30 text-center py-4 border border-dashed border-black/10 rounded">No teams joined</p>
                        )}
                    </nav>

                    <div className="mt-auto p-6 bg-black text-white rounded-[4px] space-y-4 shadow-xl">
                        <div className="flex items-center gap-3">
                            <Shield size={20} className="text-vault-success" />
                            <h4 className="text-xs font-bold uppercase tracking-widest">Enterprise Trust</h4>
                        </div>
                        <p className="text-[10px] opacity-60 leading-relaxed font-medium">
                            Team storage uses multi-signature shard distribution for enhanced shard security.
                        </p>
                    </div>
                </aside>

                {/* Main Team View */}
                <main className="flex-1 p-12 overflow-y-auto">
                    <div className="max-w-6xl mx-auto space-y-10">
                        {selectedTeam ? (
                            <>
                                <header className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-4xl font-display font-medium">{selectedTeam.name}</h1>
                                            <span className="px-3 py-1 bg-black text-white text-[9px] font-bold uppercase rounded-full tracking-widest">Team</span>
                                        </div>
                                        <p className="text-sm text-vault-charcoal/40 font-medium italic">Owner: {selectedTeam.owner}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setIsInviting(true)}
                                            className="vault-button flex items-center gap-2 py-3 px-8"
                                        >
                                            <UserPlus size={18} />
                                            Invite Member
                                        </button>
                                    </div>
                                </header>

                                {/* Team Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white p-8 rounded-[4px] border border-black/[0.05] space-y-4">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/30">Shared Files</p>
                                        <span className="text-4xl font-display font-bold tracking-tighter">{teamFiles.length}</span>
                                    </div>
                                    <div className="bg-white p-8 rounded-[4px] border border-black/[0.05] space-y-4">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/30">Active Members</p>
                                        <span className="text-4xl font-display font-bold tracking-tighter">{teamMembers.length}</span>
                                    </div>
                                    <div className="bg-white p-8 rounded-[4px] border border-black/[0.05] space-y-4">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/30">Shard Availability</p>
                                        <span className="text-4xl font-display font-bold text-vault-success tracking-tighter">100%</span>
                                    </div>
                                </div>

                                {/* Team Shards Section */}
                                <div className="space-y-6">
                                    <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/40">Shared Repository</h3>
                                    <div className="bg-white border border-black/[0.05] rounded-[4px] overflow-hidden shadow-sm">
                                        {teamFiles.length === 0 ? (
                                            <div className="p-20 text-center">
                                                <FileText size={48} className="mx-auto text-black/10" />
                                                <p className="mt-4 text-lg font-display font-medium text-black/40">No shared files in this team.</p>
                                            </div>
                                        ) : (
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-vault-off-white/50 border-b border-black/[0.03]">
                                                    <tr>
                                                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-black/30">Shard Name</th>
                                                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-black/30 text-center">Size</th>
                                                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-black/30 text-right">Owner</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-black/[0.02]">
                                                    {teamFiles.map(file => (
                                                        <tr key={file.id} className="hover:bg-vault-off-white transition-all cursor-pointer">
                                                            <td className="px-8 py-6 font-bold">{file.name}</td>
                                                            <td className="px-8 py-6 text-center text-sm font-mono opacity-60">{(file.size / 1024 / 1024).toFixed(2)} MB</td>
                                                            <td className="px-8 py-6 text-right text-[10px] font-mono opacity-40 italic">System Owner</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>

                                {/* Team Members Section */}
                                <div className="space-y-6 pt-10 border-t border-black/[0.03]">
                                    <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/40">Credentialed Members</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {teamMembers.map(member => (
                                            <div key={member.wallet} className="bg-white p-6 border border-black/[0.05] rounded-[2px] flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-vault-off-white flex items-center justify-center rounded-full">
                                                        <Users size={18} className="text-black/30" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-mono font-bold">{member.wallet.slice(0, 6)}...{member.wallet.slice(-4)}</p>
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-black/30">{member.role}</p>
                                                    </div>
                                                </div>
                                                {selectedTeam.owner && member.wallet.toLowerCase() === selectedTeam.owner.toLowerCase() && (
                                                    <span className="text-[8px] font-bold uppercase px-2 py-0.5 bg-black text-white rounded">Owner</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                                <Users size={64} className="text-black/10" />
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-display font-medium">Select a Team</h2>
                                    <p className="text-vault-charcoal/40 max-w-sm">Collaborate on encrypted shards and manage collective organizational data.</p>
                                </div>
                                <button
                                    onClick={() => setIsCreatingTeam(true)}
                                    className="vault-button py-4 px-10"
                                >
                                    Start a New Team
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Success/Error Toasts */}
            <AnimatePresence>
                {(error || success) && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`fixed bottom-12 left-1/2 -translate-x-1/2 px-8 py-4 rounded-[2px] shadow-2xl flex items-center gap-4 z-[300] border ${error ? 'bg-vault-alert text-white border-vault-alert/20' : 'bg-black text-white border-white/10'}`}
                    >
                        {success ? <CheckCircle2 size={18} /> : <Shield size={18} />}
                        <span className="text-xs font-bold uppercase tracking-widest">{error || success}</span>
                        <button onClick={() => { setError(null); setSuccess(null); }} className="ml-4 opacity-40 hover:opacity-100">✕</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Team Modal */}
            <AnimatePresence>
                {isCreatingTeam && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-8">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white w-full max-w-lg p-16 rounded-[4px] space-y-12 shadow-2xl"
                        >
                            <div className="text-center space-y-6">
                                <div className="w-20 h-20 mx-auto bg-black rounded-full flex items-center justify-center">
                                    <Users size={32} className="text-white" />
                                </div>
                                <h3 className="text-4xl font-display font-medium">Form a Collective</h3>
                            </div>
                            <div className="space-y-6 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Team Name</label>
                                    <input
                                        autoFocus
                                        value={newTeamName}
                                        onChange={(e) => setNewTeamName(e.target.value)}
                                        className="vault-input w-full bg-vault-off-white"
                                        placeholder="Enter name..."
                                    />
                                </div>
                                <button onClick={handleCreateTeam} className="w-full vault-button py-4 font-bold">Initialize Team Mesh</button>
                                <button onClick={() => setIsCreatingTeam(false)} className="w-full py-4 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100">Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Invite Modal */}
            <AnimatePresence>
                {isInviting && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-8">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white w-full max-w-lg p-16 rounded-[4px] space-y-12 shadow-2xl"
                        >
                            <div className="text-center space-y-6">
                                <div className="w-20 h-20 mx-auto bg-vault-success/10 rounded-full flex items-center justify-center">
                                    <UserPlus size={32} className="text-vault-success" />
                                </div>
                                <h3 className="text-4xl font-display font-medium">Delegate Access</h3>
                            </div>
                            <div className="space-y-8 text-left">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Member Wallet Address</label>
                                        <input
                                            autoFocus
                                            value={inviteWallet}
                                            onChange={(e) => setInviteWallet(e.target.value)}
                                            className="vault-input w-full bg-vault-off-white font-mono"
                                            placeholder="0x..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Assigned Role</label>
                                        <select
                                            value={inviteRole}
                                            onChange={(e) => setInviteRole(e.target.value)}
                                            className="vault-input w-full bg-vault-off-white"
                                        >
                                            <option value="viewer">Viewer (Read Shards)</option>
                                            <option value="manager">Manager (Read/Write Shards)</option>
                                        </select>
                                    </div>
                                </div>
                                <button onClick={handleInvite} className="w-full vault-button py-4 font-bold">Authorize Member</button>
                                <button onClick={() => setIsInviting(false)} className="w-full py-4 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100">Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

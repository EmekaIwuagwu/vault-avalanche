'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import {
    File,
    Clock,
    Share2,
    Cloud,
    Plus,
    Search,
    MoreVertical,
    Download,
    Trash2,
    HardDrive,
    Activity,
    Shield,
    Database,
    Zap,
    ExternalLink,
    ChevronDown,
    Upload,
    RefreshCw,
    Eye,
    Folder as FolderIcon,
    FolderPlus,
    History,
    ChevronRight,
    Users,
    CheckCircle2
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Progress } from '@/components/ui/progress'
import { useAccount, useBalance } from 'wagmi'
import { useRouter } from 'next/navigation'
import {
    fetchFiles,
    uploadFile,
    downloadFile,
    deleteFile,
    fetchCapacity,
    checkHealth,
    formatFileSize,
    VaultFile,
    Folder,
    Version,
    CapacityInfo,
    getPreviewUrl,
    fetchFolders,
    createFolder,
    fetchVersions,
    restoreVersion,
    createShareLink,
    moveFile
} from '@/lib/api'
import { IpfsLogo } from '@/components/IpfsLogo'

export default function Dashboard() {
    const { address, isConnected, chain } = useAccount()
    const { data: balance, refetch: refetchBalance, isLoading: isBalanceLoading } = useBalance({ address })
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [files, setFiles] = useState<VaultFile[]>([])
    const [folders, setFolders] = useState<Folder[]>([])
    const [currentFolder, setCurrentFolder] = useState<number>(0)
    const [capacity, setCapacity] = useState<CapacityInfo | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [isSharing, setIsSharing] = useState(false)
    const [isCreatingFolder, setIsCreatingFolder] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadStep, setUploadStep] = useState('Queued')
    const [uploadTxHash, setUploadTxHash] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<number | null>(null)
    const [versions, setVersions] = useState<Version[]>([])
    const [view, setView] = useState('all')
    const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isMovingFile, setIsMovingFile] = useState(false)
    const [movingFileId, setMovingFileId] = useState<number | null>(null)

    const handleMoveFile = async (targetId: number) => {
        if (!movingFileId) return;
        try {
            await moveFile(movingFileId, targetId);
            setSuccess('Shard successfully re-routed');
            loadData();
            setIsMovingFile(false);
            setMovingFileId(null);
        } catch (err) {
            setError('Failed to move shard to target directory');
        }
    };

    const loadData = useCallback(async () => {
        if (!address) return;
        try {
            setIsLoading(true);
            setError(null);
            const [fileData, folderData, capacityData] = await Promise.all([
                fetchFiles(address),
                fetchFolders(address),
                fetchCapacity(address)
            ]);
            setFiles(fileData);
            setFolders(folderData);
            setCapacity(capacityData);
            setBackendStatus('online');
        } catch (err) {
            setError('Cannot connect to VAULT backend engine. Please check if the service is starting.');
            setBackendStatus('offline');
        } finally {
            setIsLoading(false);
        }
    }, [address]);

    const loadVersions = async (fileId: number) => {
        try {
            const v = await fetchVersions(fileId);
            setVersions(v);
        } catch (err) {
            console.error('Failed to load versions');
        }
    }

    useEffect(() => {
        if (selectedFile) loadVersions(selectedFile);
    }, [selectedFile]);

    const handleCreateFolder = async () => {
        if (!newFolderName || !address) return;
        try {
            await createFolder(newFolderName, currentFolder, address);
            setNewFolderName('');
            setIsCreatingFolder(false);
            loadData();
        } catch (err) {
            setError('Folder creation failed.');
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !address) return

        setIsUploading(true)
        setUploadProgress(0)
        setUploadStep('Preparing encrypted shards...')
        setUploadTxHash(null)

        try {
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) return prev
                    const newProgress = prev + Math.random() * 20
                    if (newProgress > 30 && newProgress < 60) setUploadStep('Encrypting (AES-256-CBC)...')
                    if (newProgress >= 60) setUploadStep('Distributing to Node Mesh...')
                    return Math.min(newProgress, 90)
                })
            }, 300)

            const result = await uploadFile(file, address, currentFolder)
            
            console.log('[Upload] Backend response:', result)
            console.log('[Upload] txHash:', result.txHash)
            console.log('[Upload] txHash type:', typeof result.txHash)
            console.log('[Upload] txHash truthy?:', !!result.txHash)

            clearInterval(progressInterval)
            setUploadProgress(100)
            
            if (result.txHash && result.txHash.length > 0) {
                console.log('[Upload] Setting transaction hash:', result.txHash)
                setUploadStep('✅ Registered on Avalanche!')
                setUploadTxHash(result.txHash)
            } else {
                console.log('[Upload] No transaction hash received')
                setUploadStep('Protocol Complete!')
            }

            setTimeout(() => {
                setIsUploading(false)
                setUploadTxHash(null)
                loadData()
                refetchBalance?.()
            }, 3000)
        } catch (err) {
            console.error('[Upload] Error:', err)
            setError('Upload sequence failed at the engine level.')
            setIsUploading(false)
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleDownload = async (fileId: number, fileName: string) => {
        try {
            const blob = await downloadFile(fileId)
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = fileName
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (err) {
            setError('Download request failed.')
        }
    }

    const handleDelete = async (fileId: number) => {
        if (!address) return;
        if (!confirm('Are you sure you want to delete this resource and its shards?')) return;

        try {
            await deleteFile(fileId, address);
            if (selectedFile === fileId) setSelectedFile(null);
            loadData();
        } catch (err) {
            setError('Deactivation failed.');
        }
    }

    const handlePreview = async (fileId: number) => {
        const url = await getPreviewUrl(fileId);
        window.open(url, '_blank');
    }

    if (!isConnected) return null

    const selectedFileData = files.find(f => f.id === selectedFile)
    const totalStorage = files.reduce((acc, f) => acc + f.size, 0)
    const maxStorage = capacity?.maxBytes || 10737418240; // Default 10GB

    return (
        <div className="min-h-screen bg-vault-off-white flex flex-col selection:bg-black selection:text-white">
            <Navbar />

            <div className="flex-1 flex pt-24 overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-72 bg-white border-r border-black/[0.05] p-8 flex flex-col gap-10 overflow-y-auto">
                    {/* User Profile Mini */}
                    <div className="p-6 bg-vault-off-white rounded-[4px] border border-black/[0.03] space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                                {address?.slice(2, 4).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold uppercase tracking-widest opacity-30">Active Wallet</p>
                                <p className="text-sm font-mono truncate">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-black/[0.05] flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Balance ({chain?.name || 'Unk'})</span>
                                <span className="text-sm font-bold">
                                    {isBalanceLoading ? (
                                        <span className="animate-pulse">...</span>
                                    ) : balance ? (
                                        `${(Number(balance.value) / Math.pow(10, balance.decimals)).toFixed(4)} ${balance.symbol}`
                                    ) : (
                                        '0.0000 AVAX'
                                    )}
                                </span>
                            </div>
                            <button
                                onClick={() => refetchBalance?.()}
                                className="p-1.5 hover:bg-black/5 rounded-full transition-colors"
                                title="Refresh Balance"
                            >
                                <RefreshCw size={12} className={`opacity-40 ${isBalanceLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/40">Infrastructure</h3>
                        <nav className="flex flex-col gap-1">
                            <SidebarItem icon={<File size={18} />} label="All Storage" active={view === 'all'} onClick={() => setView('all')} />
                            <SidebarItem icon={<Users size={18} />} label="Teams" active={view === 'teams'} onClick={() => router.push('/teams')} />
                            <SidebarItem icon={<Activity size={18} />} label="Activity Log" active={view === 'activity'} onClick={() => router.push('/activity')} />
                            <SidebarItem icon={<Database size={18} />} label="Node Mesh" active={view === 'nodes'} onClick={() => router.push('/nodes')} />
                            <SidebarItem icon={<Cloud size={18} />} label="API Deployments" active={view === 'deployments'} onClick={() => router.push('/deployments')} />
                        </nav>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/40">Storage Usage (Enterprise)</h3>
                        <div className="space-y-3 p-4 bg-vault-off-white rounded-[2px] border border-black/[0.02]">
                            <div className="flex justify-between text-[11px] font-bold uppercase">
                                <span>{formatFileSize(totalStorage)} / {formatFileSize(maxStorage)}</span>
                                <span className="text-vault-charcoal/40">{Math.min(100, (totalStorage / maxStorage * 100)).toFixed(1)}%</span>
                            </div>
                            <div className="h-1 bg-vault-gray rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (totalStorage / maxStorage * 100))}%` }}
                                    className="h-full bg-black"
                                />
                            </div>
                            <div className="w-full text-center py-2 text-[10px] font-bold uppercase tracking-widest text-vault-success bg-vault-success/5 border border-vault-success/10">
                                100% Free Plan Active
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-black/[0.05]">
                        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${backendStatus === 'online' ? 'text-vault-success' : 'text-vault-alert'}`}>
                            <div className={`w-2 h-2 bg-current rounded-full ${backendStatus === 'online' ? 'animate-pulse' : ''}`} />
                            {backendStatus === 'online' ? `VaultDB @ ${chain?.name || 'Avalanche'}` : 'Backend Offline'}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-12 overflow-y-auto">
                    <div className="max-w-6xl mx-auto space-y-10">
                        <header className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h1 className="text-4xl font-display font-medium">My Infrastructure</h1>
                                <p className="text-sm text-vault-charcoal/40 font-medium">Manage sharded files and protocol deployments.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vault-charcoal/30 group-focus-within:text-black transition-colors" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search shards..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="vault-input pl-12 w-80 bg-white"
                                    />
                                </div>
                                <button
                                    onClick={loadData}
                                    className="p-3 border border-black/[0.05] hover:bg-vault-off-white transition-colors rounded-[2px]"
                                    title="Refresh"
                                >
                                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                                </button>
                                <button
                                    onClick={() => setIsCreatingFolder(true)}
                                    className="p-3 border border-black/[0.05] hover:bg-vault-off-white transition-colors rounded-[2px]"
                                    title="New Folder"
                                >
                                    <FolderPlus size={18} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="vault-button flex items-center gap-2 py-3 px-8"
                                    disabled={backendStatus === 'offline'}
                                >
                                    <Upload size={18} />
                                    Upload File
                                </button>
                            </div>
                        </header>

                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40">
                            <button onClick={() => setCurrentFolder(0)} className="hover:text-black transition-colors">Root</button>
                            {currentFolder !== 0 && (
                                <>
                                    <ChevronRight size={12} />
                                    <span className="text-black">{folders.find(f => f.id === currentFolder)?.name}</span>
                                </>
                            )}
                        </div>

                        {/* Error Banner */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-vault-alert/10 border border-vault-alert/20 text-vault-alert p-4 rounded-[2px] flex items-center justify-between shadow-sm"
                                >
                                    <span className="text-sm font-medium">{error}</span>
                                    <button onClick={() => setError(null)} className="text-vault-alert hover:opacity-70">✕</button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Top Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard label="Total Files" value={String(files.length)} trend={files.length > 0 ? 'Protocol Synced' : ''} />
                            <StatCard label="Avg Shard Count" value="12" sub="Redundancy Factor" />
                            <StatCard label="Backend Connectivity" value={backendStatus === 'online' ? 'Stable' : 'Offline'} color={backendStatus === 'online' ? 'text-vault-success' : 'text-vault-alert'} />
                        </div>

                        {/* File Repository Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/40">Active Repository</h3>
                                <div className="flex gap-4">
                                    <button className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Name</button>
                                    <button className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Size</button>
                                </div>
                            </div>

                            <div className="bg-white border border-black/[0.05] rounded-[4px] overflow-hidden shadow-sm">
                                {isLoading ? (
                                    <div className="p-20 text-center">
                                        <RefreshCw size={32} className="mx-auto animate-spin text-black/20" />
                                        <p className="mt-4 text-sm text-black/40 font-medium">Syncing with VaultDB v1.0...</p>
                                    </div>
                                ) : files.length === 0 ? (
                                    <div className="p-20 text-center">
                                        <Database size={48} className="mx-auto text-black/10" />
                                        <p className="mt-4 text-lg font-display font-medium text-black/40">Repository is Empty</p>
                                        <p className="text-sm text-black/30">Connect your files to the Avalanche Sharding Protocol.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-vault-off-white/50 border-b border-black/[0.03]">
                                                <tr>
                                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-black/30">Resource Shard</th>
                                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-black/30 text-center">Size</th>
                                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-black/30 text-center">Protocol Level</th>
                                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-black/30 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-black/[0.02]">
                                                {folders
                                                    .filter(f => f.parentId === currentFolder && f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                    .map((folder, idx) => (
                                                        <tr
                                                            key={`folder-${folder.id}`}
                                                            className="group hover:bg-vault-off-white transition-all cursor-pointer"
                                                            onClick={() => setCurrentFolder(folder.id)}
                                                        >
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-vault-charcoal flex items-center justify-center rounded-[2px] transition-colors shadow-sm">
                                                                        <FolderIcon className="w-5 h-5 text-white" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-[15px] tracking-tight">{folder.name}</p>
                                                                        <p className="text-[10px] font-mono text-black/30 italic">Cloud Folder</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6 text-center text-sm font-medium opacity-60 font-mono tracking-tighter">--</td>
                                                            <td className="px-8 py-6 text-center">
                                                                <span className="px-3 py-1 bg-black/5 text-black/40 text-[9px] font-bold uppercase rounded-full tracking-widest">Directory</span>
                                                            </td>
                                                            <td className="px-8 py-6 text-right"></td>
                                                        </tr>
                                                    ))}
                                                {files
                                                    .filter(f => f.folderId === currentFolder && f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                    .map((file, idx) => (
                                                        <motion.tr
                                                            key={file.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            className={`group hover:bg-vault-off-white transition-all cursor-pointer ${selectedFile === file.id ? 'bg-vault-off-white border-l-2 border-black' : ''}`}
                                                            onClick={() => setSelectedFile(file.id)}
                                                        >
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-black flex items-center justify-center rounded-[2px] group-hover:bg-vault-charcoal transition-colors shadow-lg">
                                                                        <IpfsLogo className="w-5 h-5 text-white" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-[15px] tracking-tight">{file.name}</p>
                                                                        <p className="text-[10px] font-mono text-black/30 truncate max-w-[140px] italic">{file.hash}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6 text-center text-sm font-medium opacity-60 font-mono tracking-tighter">{formatFileSize(file.size)}</td>
                                                            <td className="px-8 py-6 text-center">
                                                                <span className="px-3 py-1 bg-vault-success/10 text-vault-success text-[9px] font-bold uppercase rounded-full tracking-widest">Encrypted</span>
                                                            </td>
                                                            <td className="px-8 py-6 text-right opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    {file.name.toLowerCase().endsWith('.pdf') && (
                                                                        <ActionBtn onClick={(e) => { e.stopPropagation(); handlePreview(file.id); }} icon={<Eye size={14} />} />
                                                                    )}
                                                                    <ActionBtn onClick={(e) => { e.stopPropagation(); handleDownload(file.id, file.name); }} icon={<Download size={14} />} />
                                                                    <ActionBtn onClick={(e) => { e.stopPropagation(); setIsSharing(true); }} icon={<Share2 size={14} />} />
                                                                    <ActionBtn onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }} icon={<Trash2 size={14} />} alert />
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* Right Details Panel */}
                <AnimatePresence>
                    {selectedFile && selectedFileData && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 420, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="bg-white border-l border-black/[0.05] p-10 flex flex-col gap-10 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/40">Shard Topology</h3>
                                <button onClick={() => setSelectedFile(null)} className="text-black/30 hover:text-black transition-colors">✕</button>
                            </div>

                            <div className="p-8 bg-vault-off-white rounded-[4px] border border-black/[0.03] flex items-center gap-6 shadow-inner">
                                <div className="w-16 h-16 bg-black rounded-[4px] flex items-center justify-center shadow-2xl">
                                    <IpfsLogo className="w-8 h-8 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xl font-display font-medium truncate">{selectedFileData.name}</p>
                                    <p className="text-[9px] font-mono text-black/30 truncate">{selectedFileData.hash}</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <DetailRow label="Resource ID" value={`#${selectedFileData.id}`} />
                                <DetailRow label="File Size" value={formatFileSize(selectedFileData.size)} />
                                <DetailRow label="Distributed Shards" value={String(selectedFileData.shards)} />
                                <DetailRow label="Protocol Sync" value={selectedFileData.date} />
                                <DetailRow label="Encryption Standard" value="AES-256-CBC" />
                                <DetailRow label="Engine Version" value="VaultDB v1.0" />
                                <DetailRow label="Data Integrity" value="SHA-256 Verified" />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-vault-charcoal/40 flex items-center gap-2">
                                    <History size={12} /> Version History
                                </h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                    {versions.length === 0 ? (
                                        <p className="text-[10px] text-black/30 italic">No previous versions</p>
                                    ) : versions.map(v => (
                                        <div key={v.id} className="flex items-center justify-between p-3 bg-vault-off-white/50 rounded-[2px] border border-black/[0.03]">
                                            <div>
                                                <p className="text-[10px] font-bold">{v.date}</p>
                                                <p className="text-[8px] font-mono opacity-40">{v.hash.slice(0, 16)}...</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Restore this version? current will become a version.')) {
                                                        restoreVersion(selectedFileData.id, v.id).then(() => {
                                                            loadData();
                                                            loadVersions(selectedFileData.id);
                                                        });
                                                    }
                                                }}
                                                className="text-[9px] font-bold uppercase tracking-widest text-black/40 hover:text-black"
                                            >
                                                Restore
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto space-y-4">
                                {selectedFileData.name.toLowerCase().endsWith('.pdf') && (
                                    <button
                                        onClick={() => handlePreview(selectedFileData.id)}
                                        className="w-full py-4 bg-vault-off-white text-black border border-black/10 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Eye size={16} /> Preview Encrypted PDF
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDownload(selectedFileData.id, selectedFileData.name)}
                                    className="w-full vault-button flex items-center justify-center gap-2 font-bold"
                                >
                                    <Download size={16} /> Download Local Defragmentation
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedFileData.id)}
                                    className="w-full py-4 border border-vault-alert/20 text-vault-alert text-[10px] font-bold uppercase tracking-widest hover:bg-vault-alert hover:text-white transition-all"
                                >
                                    Deactivate Resource Shards
                                </button>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploading && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-8">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-lg p-16 rounded-[4px] space-y-12 shadow-2xl border border-white/10"
                        >
                            <div className="text-center space-y-6">
                                <div className="w-24 h-24 mx-auto bg-black rounded-full flex items-center justify-center shadow-2xl border-4 border-vault-off-white">
                                    <Upload size={40} className="text-white animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-display font-medium">Protocol Active</h3>
                                    <p className="text-vault-charcoal/50 font-medium">Establishing secure nodes and distributing encrypted shards.</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em]">
                                        <span className="opacity-40">Shard Status</span>
                                        <span className="text-vault-success">{uploadStep}</span>
                                    </div>
                                    <div className="h-2 bg-vault-gray rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${uploadProgress}%` }}
                                            className="h-full bg-black shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                                        />
                                    </div>
                                </div>

                                {uploadTxHash && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-vault-success/10 border border-vault-success/20 rounded-[4px] p-6 space-y-4"
                                    >
                                        <div className="flex items-center gap-2 text-vault-success">
                                            <CheckCircle2 size={18} />
                                            <span className="text-[11px] font-bold uppercase tracking-widest">Blockchain Confirmed</span>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">Transaction Hash</p>
                                            <p className="font-mono text-xs break-all text-vault-charcoal/70">{uploadTxHash}</p>
                                        </div>
                                        <a
                                            href={`https://testnet.snowtrace.io/tx/${uploadTxHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-[2px] hover:bg-vault-charcoal transition-colors"
                                        >
                                            <ExternalLink size={14} />
                                            View on Snowtrace
                                        </a>
                                    </motion.div>
                                )}
                            </div>

                            <div className="flex items-center justify-center gap-2 opacity-30">
                                <Shield size={14} />
                                <p className="text-[9px] font-bold uppercase tracking-[0.3em]">
                                    Avalanche Protected Environment
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Share Modal */}
            <AnimatePresence>
                {isSharing && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-8">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md p-12 rounded-[2px] space-y-10 shadow-2xl"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-3xl font-display font-medium">Delegate Access</h3>
                                <button onClick={() => setIsSharing(false)} className="text-black/20 hover:text-black">✕</button>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Shard Access URI</label>
                                    <div className="flex gap-2">
                                        <input readOnly value={`https://vault.ava/s/${Math.random().toString(36).substr(2, 6)}`} className="vault-input flex-1 font-mono text-[10px] bg-vault-off-white" />
                                        <button className="px-6 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-vault-charcoal transition-all">Copy</button>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsSharing(false)} className="w-full vault-button font-bold">Generate Ephemeral Keys</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Folder Modal */}
            <AnimatePresence>
                {isCreatingFolder && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-8">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white v-full max-w-md p-12 rounded-[2px] space-y-10 shadow-2xl"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-3xl font-display font-medium">New Directory</h3>
                                <button onClick={() => setIsCreatingFolder(false)} className="text-black/20 hover:text-black">✕</button>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Folder Name</label>
                                    <input
                                        autoFocus
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                        className="vault-input w-full bg-vault-off-white"
                                        placeholder="Enter name..."
                                    />
                                </div>
                            </div>
                            <button onClick={handleCreateFolder} className="w-full vault-button font-bold">Create Shard Partition</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Move Shard Modal */}
            <AnimatePresence>
                {isMovingFile && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-[2px] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-black/[0.05]">
                                <h3 className="text-xl font-display font-medium">Re-route Shard</h3>
                                <p className="text-xs text-vault-charcoal/40 font-bold uppercase tracking-widest mt-1">Select target directory</p>
                            </div>
                            <div className="p-8 space-y-4 max-h-[300px] overflow-y-auto">
                                <button
                                    onClick={() => handleMoveFile(0)}
                                    className="w-full p-4 border border-black/[0.05] hover:bg-vault-off-white transition-all text-left flex items-center gap-3 group"
                                >
                                    <div className="w-8 h-8 bg-black flex items-center justify-center rounded-[2px] group-hover:bg-vault-charcoal">
                                        <FolderIcon size={14} className="text-white" />
                                    </div>
                                    <span className="font-bold text-xs uppercase tracking-widest">Root Directory</span>
                                </button>
                                {folders.map(folder => (
                                    <button
                                        key={folder.id}
                                        onClick={() => handleMoveFile(folder.id)}
                                        className="w-full p-4 border border-black/[0.05] hover:bg-vault-off-white transition-all text-left flex items-center gap-3 group"
                                    >
                                        <div className="w-8 h-8 bg-vault-charcoal flex items-center justify-center rounded-[2px] group-hover:bg-black">
                                            <FolderIcon size={14} className="text-white" />
                                        </div>
                                        <span className="font-bold text-xs uppercase tracking-widest">{folder.name}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="p-8 bg-vault-off-white border-t border-black/[0.05] flex justify-end gap-3">
                                <button
                                    onClick={() => setIsMovingFile(false)}
                                    className="px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
        </div>
    )
}

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-4 px-5 py-4 rounded-[2px] cursor-pointer transition-all duration-300 ${active ? 'bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] translate-x-1' : 'text-black/40 hover:bg-vault-off-white hover:text-black hover:translate-x-1'}`}
        >
            {icon}
            <span className="text-[11px] font-bold uppercase tracking-[0.15em]">{label}</span>
        </div>
    )
}

function StatCard({ label, value, trend, sub, color = 'text-black' }: { label: string, value: string, trend?: string, sub?: string, color?: string }) {
    return (
        <div className="bg-white p-8 rounded-[4px] border border-black/[0.05] hover:border-black/10 transition-all space-y-4 hover:shadow-lg">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/30">{label}</p>
            <div className="flex items-baseline gap-3">
                <span className={`text-4xl font-display font-bold ${color} tracking-tighter`}>{value}</span>
                {trend && <span className="text-[9px] font-bold text-vault-success uppercase tracking-[0.2em]">{trend}</span>}
                {sub && <span className="text-[9px] font-bold text-black/20 uppercase tracking-[0.2em]">{sub}</span>}
            </div>
        </div>
    )
}

function DetailRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center py-4 border-b border-black/[0.02] last:border-0 hover:bg-vault-off-white/30 transition-colors px-2 rounded-[2px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/30">{label}</span>
            <span className="text-sm font-bold text-black tracking-tight">{value}</span>
        </div>
    )
}

function ActionBtn({ icon, alert, onClick }: { icon: any, alert?: boolean, onClick: (e: any) => void }) {
    return (
        <button
            onClick={onClick}
            className={`p-3 rounded-[2px] transition-all hover:scale-110 active:scale-95 ${alert ? 'hover:bg-vault-alert hover:text-white border border-vault-alert/10 text-vault-alert' : 'hover:bg-black hover:text-white border border-black/5 text-black/40 shadow-sm'}`}
        >
            {icon}
        </button>
    )
}

import { redis } from '@/lib/redis'
import { AlertTriangle, FileText, Download, EyeOff, Sparkles } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering to ensure GETDEL happens on every request
export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ViewPage({ params }: PageProps) {
    const { id } = await params

    const data = await redis.getdel(id) as string | null

    if (!data) {
        return (
            <main className="min-h-screen relative overflow-hidden">
                <div className="absolute inset-0 bg-zinc-950">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10 animate-pulse-slow" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] opacity-30 animate-float" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[100px] opacity-30 animate-float-delayed" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.1),transparent_70%)]" />
                </div>

                <div className="relative min-h-screen flex flex-col items-center justify-center p-4 text-center">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-zinc-700/20 rounded-full blur-2xl animate-pulse" />
                        <div className="relative w-32 h-32 bg-zinc-900/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-8 border border-zinc-800/50">
                            <EyeOff className="w-16 h-16 text-zinc-600" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-zinc-200 mb-4 bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">This note has self-destructed.</h1>
                    <p className="text-zinc-500 mb-10 max-w-md">
                        The link you visited has either been viewed already or has expired.
                    </p>
                    <Link
                        href="/"
                        className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
                    >
                        Create New Secret
                    </Link>
                </div>
            </main>
        )
    }

    const { content, type } = JSON.parse(data)

    return (
        <main className="min-h-screen relative overflow-hidden">
            <div className="absolute inset-0 bg-zinc-950">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10 animate-pulse-slow" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] opacity-30 animate-float" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[100px] opacity-30 animate-float-delayed" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.1),transparent_70%)]" />
            </div>

            <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl backdrop-blur-xl bg-zinc-900/60 border border-zinc-800/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">

                    <div className="p-6 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 border-b border-zinc-800/50 flex items-center gap-3 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-pink-500/5 animate-shimmer" />
                        <div className="relative p-2.5 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30 shadow-[0_0_20px_rgba(234,88,12,0.3)]">
                            <AlertTriangle className="w-6 h-6 text-orange-400" />
                        </div>
                        <div className="relative">
                            <h1 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Destruction Imminent</h1>
                            <p className="text-xs text-orange-400/70">
                                This content has been deleted from the server. If you refresh, it will be gone forever.
                            </p>
                        </div>
                    </div>

                    <div className="p-8">
                        {type === 'text' ? (
                            <div className="bg-zinc-950/80 p-6 rounded-xl border border-zinc-800/50">
                                <pre className="text-zinc-200 whitespace-pre-wrap font-mono text-sm">{content}</pre>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="relative inline-block mb-8">
                                    <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-2xl opacity-50" />
                                    <FileText className="relative w-24 h-24 text-zinc-600" />
                                </div>
                                <h2 className="text-2xl font-semibold text-zinc-200 mb-3">Secure File received</h2>
                                <p className="text-zinc-500 mb-8 text-sm">Download your file immediately.</p>

                                {content.startsWith('data:') ? (
                                    <div className="space-y-4">
                                        <div className="max-w-2xl mx-auto">
                                            {content.startsWith('data:image/') ? (
                                                <div className="mb-6">
                                                    <img
                                                        src={content}
                                                        alt="Secure image preview"
                                                        className="max-w-full max-h-[400px] mx-auto rounded-xl border border-zinc-800/50"
                                                    />
                                                    <p className="text-xs text-zinc-500 mt-3">Image preview - Download to save</p>
                                                </div>
                                            ) : null}

                                            <a
                                                href={content}
                                                download={content.match(/data:.*?;name=(.*?);/)?.[1] || 'secret-file'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
                                            >
                                                <Download className="w-6 h-6 group-hover:animate-bounce" />
                                                Download File
                                            </a>
                                        </div>

                                        {content.length > 500000 ? (
                                            <p className="text-xs text-zinc-600 mt-4">
                                                Large file detected - Click &quot;Download File&quot; button above. If download doesn&apos;t start automatically, right-click and &quot;Save Link As&quot;
                                            </p>
                                        ) : null}
                                    </div>
                                ) : (
                                    <div className="text-red-400">
                                        <p className="mb-4">Error: Invalid file data</p>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(content)}
                                            className="text-xs underline"
                                        >
                                            Copy raw data
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-zinc-950/50 p-4 text-center border-t border-zinc-800/50">
                        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors inline-flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Share your own secret
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}

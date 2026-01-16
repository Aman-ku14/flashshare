'use client'

import { useState, useRef } from 'react'
import { Copy, FileText, Upload, Check, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text')
  const [text, setText] = useState('')
  const [expiry, setExpiry] = useState('3600') // 1 hour
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ url: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 1024 * 1024) {
      setError(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max 1MB allowed.`)
      return
    }

    const sizeInKB = (file.size / 1024).toFixed(1)
    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / 1024 / 1024).toFixed(2)}MB`
      : `${sizeInKB}KB`

    setFileName(file.name)
    setFileSize(sizeStr)
    setError(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const result = ev.target?.result as string
        if (!result || !result.startsWith('data:')) {
          throw new Error('Failed to read file')
        }
        setFileContent(result)
      } catch (err) {
        setError('Failed to process file. Please try a different file.')
        console.error('File read error:', err)
      }
    }
    reader.onerror = () => {
      setError('Failed to read file. Please try again.')
    }
    reader.readAsDataURL(file)
  }

  const createLink = async () => {
    setError(null)
    setLoading(true)

    try {
      const content = activeTab === 'text' ? text : fileContent

      if (!content) {
        throw new Error('Please enter some text or select a file')
      }

      const res = await fetch('/api/create', {
        method: 'POST',
        body: JSON.stringify({
          content,
          type: activeTab,
          expiry: parseInt(expiry)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setResult({ url: `${window.location.origin}/view/${data.id}` })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!result) return
    navigator.clipboard.writeText(result.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setResult(null)
    setText('')
    setFileName(null)
    setFileSize(null)
    setFileContent(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10 animate-pulse-slow" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] opacity-30 animate-float" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[100px] opacity-30 animate-float-delayed" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.1),transparent_70%)]" />
      </div>

      <div className="relative min-h-screen text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className={cn(
          "w-full max-w-md backdrop-blur-xl bg-zinc-900/60 border border-zinc-800/50 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500",
          isHovered && "shadow-purple-500/10 shadow-[0_0_60px_-12px_rgba(139,92,246,0.3)] scale-[1.01]"
        )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >

          <div className="p-6 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border-b border-zinc-800/50 flex items-center gap-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-fuchsia-500/5 animate-shimmer" />
            <div className="relative p-2.5 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Sparkles className="w-6 h-6 text-violet-400" />
            </div>
            <div className="relative">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                FlashShare
              </h1>
              <p className="text-xs text-zinc-400">Self-destructing secure storage</p>
            </div>
          </div>

          <div className="p-6">
            {result ? (
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                      <Check className="w-10 h-10 text-green-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Secret Link Created!</h2>
                  <p className="text-sm text-zinc-400">
                    This link will self-destruct after one visit.
                  </p>
                </div>

                <div className="relative bg-zinc-950/80 p-4 rounded-xl border border-zinc-800/50 flex items-center gap-3 mb-6 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex-1 overflow-hidden">
                    <p className="text-sm text-zinc-300 truncate font-mono">{result.url}</p>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="relative p-2.5 hover:bg-zinc-800/50 rounded-lg transition-all hover:scale-105 active:scale-95"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400 group-hover:text-zinc-300 transition-colors" />
                    )}
                  </button>
                </div>

                <button
                  onClick={reset}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
                >
                  Create Another
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 p-1.5 bg-zinc-950/80 rounded-xl border border-zinc-800/50">
                  <button
                    onClick={() => setActiveTab('text')}
                    className={cn(
                      "py-3 text-sm font-semibold rounded-lg transition-all duration-300 relative overflow-hidden",
                      activeTab === 'text'
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                    )}
                  >
                    Text Note
                  </button>
                  <button
                    onClick={() => setActiveTab('file')}
                    className={cn(
                      "py-3 text-sm font-semibold rounded-lg transition-all duration-300 relative overflow-hidden",
                      activeTab === 'file'
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                    )}
                  >
                    File Upload
                  </button>
                </div>

                <div className="min-h-[220px]">
                  {activeTab === 'text' ? (
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Type your secret message here..."
                      className="w-full h-[220px] bg-zinc-950/80 border border-zinc-800/50 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 resize-none transition-all placeholder:text-zinc-600"
                    />
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-[220px] border-2 border-dashed border-zinc-700/50 hover:border-violet-500/50 hover:bg-zinc-950/80 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      {fileName ? (
                        <>
                          <div className="relative">
                            <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl opacity-50" />
                            <FileText className="relative w-12 h-12 text-violet-400 mb-4" />
                          </div>
                          <p className="text-sm text-zinc-200 max-w-[200px] truncate">{fileName}</p>
                          {fileSize && (
                            <p className="text-xs text-violet-400/70 mt-1">{fileSize}</p>
                          )}
                          <p className="text-xs text-zinc-500 mt-2">Click to change</p>
                        </>
                      ) : (
                        <>
                          <div className="relative">
                            <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                            <Upload className="relative w-12 h-12 text-zinc-600 group-hover:text-violet-400 transition-colors mb-4" />
                          </div>
                          <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Click to upload a file</p>
                          <p className="text-xs text-zinc-600 mt-1">Max 1MB (MVP)</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Self-Destruct Timer</label>
                  <div className="relative">
                    <select
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800/50 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 appearance-none cursor-pointer transition-all hover:border-zinc-700/50"
                    >
                      <option value="60">After 1 Minute</option>
                      <option value="3600">After 1 Hour</option>
                      <option value="86400">After 24 Hours</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Files are also deleted immediately after first view.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5 text-sm text-red-400 backdrop-blur-sm animate-shake">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={createLink}
                  disabled={loading}
                  className="group relative w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 active:scale-[0.98] transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-5 h-5" />
                        Create Secret Link
                      </>
                    )}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

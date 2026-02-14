import { useState, useRef, useCallback } from 'react'
import { Globe, Download, Loader2, CheckCircle2, XCircle, FileText, Smartphone, Settings2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface ProgressItem {
  page: number
  total: number
  url: string
  status: string
  title?: string
}

function App() {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [appStoreUrl, setAppStoreUrl] = useState('')
  const [maxPages, setMaxPages] = useState(10)
  const [isCrawling, setIsCrawling] = useState(false)
  const [progress, setProgress] = useState<ProgressItem[]>([])
  const [markdown, setMarkdown] = useState('')
  const [pagesCrawled, setPagesCrawled] = useState(0)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const handleCrawl = useCallback(async () => {
    if (!websiteUrl.trim()) {
      setError('Please enter a website URL')
      return
    }

    let url = websiteUrl.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    setIsCrawling(true)
    setProgress([])
    setMarkdown('')
    setPagesCrawled(0)
    setError('')

    abortRef.current = new AbortController()

    try {
      const body: Record<string, unknown> = { url, max_pages: maxPages }
      if (appStoreUrl.trim()) {
        body.app_store_url = appStoreUrl.trim()
      }

      const response = await fetch(`${API_URL}/api/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'progress') {
                setProgress(prev => {
                  const existing = prev.findIndex(p => p.page === data.page)
                  if (existing >= 0) {
                    const updated = [...prev]
                    updated[existing] = data
                    return updated
                  }
                  return [...prev, data]
                })
              } else if (data.type === 'complete') {
                setMarkdown(data.markdown)
                setPagesCrawled(data.pages_crawled)
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message || 'An error occurred during crawling')
      }
    } finally {
      setIsCrawling(false)
    }
  }, [websiteUrl, appStoreUrl, maxPages])

  const handleStop = useCallback(() => {
    abortRef.current?.abort()
    setIsCrawling(false)
  }, [])

  const handleDownload = useCallback(() => {
    if (!markdown) return
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const domain = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`).hostname
    a.href = url
    a.download = `${domain}-rag-context.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [markdown, websiteUrl])

  const handleCopyToClipboard = useCallback(() => {
    if (!markdown) return
    navigator.clipboard.writeText(markdown)
  }, [markdown])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">RAG Context Generator</h1>
            <p className="text-xs text-gray-400">Crawl websites & apps to generate RAG context documents</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-medium">Website URL</h2>
          </div>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://www.example.com"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isCrawling}
              onKeyDown={(e) => e.key === 'Enter' && !isCrawling && handleCrawl()}
            />
            {!isCrawling ? (
              <button
                onClick={handleCrawl}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                disabled={!websiteUrl.trim()}
              >
                <Globe className="w-4 h-4" />
                Crawl & Generate
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Stop
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
              {showSettings ? 'Hide options' : 'More options'}
            </button>
          </div>

          {showSettings && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div>
                <label className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  App Store URL (optional)
                </label>
                <input
                  type="text"
                  value={appStoreUrl}
                  onChange={(e) => setAppStoreUrl(e.target.value)}
                  placeholder="https://apps.apple.com/us/app/..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isCrawling}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Max pages to crawl</label>
                <input
                  type="number"
                  value={maxPages}
                  onChange={(e) => setMaxPages(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                  min={1}
                  max={50}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isCrawling}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {(isCrawling || progress.length > 0) && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium flex items-center gap-2">
                {isCrawling && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
                Crawling Progress
              </h2>
              {progress.length > 0 && (
                <span className="text-xs text-gray-400">
                  {progress.filter(p => p.status === 'done').length} / {maxPages} pages
                </span>
              )}
            </div>

            <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.filter(p => p.status === 'done').length / maxPages) * 100}%` }}
              />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {progress.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm py-1.5 px-3 rounded-lg bg-gray-800/50">
                  {item.status === 'crawling' || item.status === 'crawling_app_store' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 flex-shrink-0" />
                  ) : item.status === 'done' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  )}
                  <span className="text-gray-300 truncate flex-1">{item.title || item.url}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {item.status === 'crawling' ? 'Crawling...' :
                     item.status === 'crawling_app_store' ? 'Fetching app data...' :
                     item.status === 'done' ? 'Done' : 'Failed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {markdown && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" />
                Generated RAG Context
                <span className="text-xs text-gray-400 font-normal">({pagesCrawled} pages crawled)</span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyToClipboard}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .md
                </button>
              </div>
            </div>
            <div className="bg-gray-950 rounded-lg border border-gray-800 p-4 max-h-96 overflow-y-auto">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">{markdown}</pre>
            </div>
          </div>
        )}

        {!isCrawling && !markdown && progress.length === 0 && (
          <div className="text-center py-16">
            <Globe className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg text-gray-500 mb-2">Enter a website URL to get started</h3>
            <p className="text-sm text-gray-600 max-w-lg mx-auto">
              The crawler will visit the website, extract features from each page (navigation, forms, CTAs, media, sections), and generate a comprehensive markdown document suitable for RAG context.
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 py-4 mt-12">
        <p className="text-center text-xs text-gray-600">RAG Context Generator &mdash; Crawl websites to build domain knowledge for AI applications</p>
      </footer>
    </div>
  )
}

export default App

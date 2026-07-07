import { Link } from 'react-router-dom'

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-orange-100">
        <img src="/logo.png" alt="ScrappyChef" className="w-16 h-16 mx-auto mb-6" />
        <h1 className="text-2xl font-black text-gray-900 mb-2">📸 Fridge Audit Video</h1>
        <p className="text-gray-500 text-sm mb-6">
          Download this ready-to-post video for the<br />
          <strong className="text-orange-600">#FridgeAuditChallenge</strong> on TikTok &amp; Instagram.
        </p>

        <a
          href="/fridge_audit.mp4"
          download="scrappychef_fridge_audit.mp4"
          className="inline-flex items-center gap-3 bg-orange-500 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:-translate-y-0.5 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Video
        </a>

        <div className="flex justify-center gap-3 mt-6">
          <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">📹 MP4</span>
          <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">1.3 MB</span>
          <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">⏱️ 30s</span>
        </div>
      </div>

      <Link to="/" className="mt-8 text-sm text-gray-400 font-bold hover:text-orange-500 transition-colors">
        ← Back to ScrappyChef
      </Link>
    </div>
  )
}
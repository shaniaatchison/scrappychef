import { ChefHat, Calculator, BookOpen, Smartphone, Trophy } from 'lucide-react'

export default function LinksPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#333] flex flex-col items-center px-6 py-12 font-sans">
      {/* Header */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="bg-[#7DA084] p-4 rounded-3xl mb-4 shadow-lg shadow-[#7DA084]/20 text-white">
          <ChefHat size={48} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">@ScrappyChefApp</h1>
        <p className="text-[#7DA084] font-medium mt-1">Stop wasting, start saving. ✨</p>
      </div>

      {/* Link Buttons */}
      <div className="w-full max-w-md space-y-4">
        {/* Primary CTA */}
        <a 
          href="/"
          className="flex flex-col items-center text-center p-5 bg-white border-2 border-[#7DA084] rounded-2xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all group animate-pulse-slow"
        >
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="text-[#7DA084]" size={24} />
            <span className="text-lg font-bold">Open Free Pantry Organizer App</span>
          </div>
          <span className="text-xs text-gray-500 font-medium italic">Zero install required. Add to home screen in 1 click.</span>
        </a>

        {/* Leaderboard social proof */}
        <a 
          href="/leaderboard"
          className="w-full flex flex-col items-center text-center p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-amber-400 hover:bg-amber-50 transition-all group"
        >
          <div className="flex items-center gap-2 mb-1 text-gray-800 group-hover:text-amber-600">
            <Trophy size={22} className="text-amber-500" />
            <span className="text-lg font-bold">Scrappy Hall of Fame</span>
          </div>
          <span className="text-xs text-gray-500 font-medium italic">See how much money the top "scrappers" are saving.</span>
        </a>

        {/* Lead Magnet */}
        <a 
          href="/"
          className="w-full flex flex-col items-center text-center p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-[#E8A856] hover:bg-[#FDFBF7] transition-all group"
        >
          <div className="flex items-center gap-2 mb-1 text-gray-800 group-hover:text-[#E8A856]">
            <Calculator size={22} />
            <span className="text-lg font-bold">Calculate Your Scrap Value</span>
          </div>
          <span className="text-xs text-gray-500 font-medium italic">Find out how much money is sitting in your trash bin.</span>
        </a>

        {/* Recipe Highlight */}
        <a 
          href="/recipes"
          className="flex flex-col items-center text-center p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-[#E8A856] hover:bg-[#FDFBF7] transition-all group"
        >
          <div className="flex items-center gap-2 mb-1 text-gray-800 group-hover:text-[#E8A856]">
            <BookOpen size={22} />
            <span className="text-lg font-bold">How to Make "Liquid Gold" Broth</span>
          </div>
          <span className="text-xs text-gray-500 font-medium italic">Step-by-step video & text guide.</span>
        </a>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-16 text-center space-y-4">
        <div className="flex justify-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <a href="#" className="hover:text-[#7DA084]">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:text-[#7DA084]">Terms</a>
          <span>•</span>
          <a href="#" className="hover:text-[#7DA084]">Support</a>
        </div>
        <p className="text-[10px] text-gray-400 font-medium">© 2026 ScrappyChef. All rights reserved.</p>
      </footer>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { border-color: #7DA084; box-shadow: 0 0 0 rgba(125, 160, 132, 0); }
          50% { border-color: #E8A856; box-shadow: 0 0 15px rgba(232, 168, 86, 0.3); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}

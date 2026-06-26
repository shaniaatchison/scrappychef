import { ChefHat, Plus } from 'lucide-react'

export default function StickerPage() {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      {/* Instagram/TikTok 'Add Yours' Sticker Style */}
      <div className="bg-white/90 backdrop-blur-md rounded-[40px] p-6 shadow-2xl border border-white/20 max-w-xs w-full flex flex-col items-center gap-4 text-center">
        <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-lg">
          <ChefHat size={32} />
        </div>
        
        <div className="space-y-1">
          <h2 className="text-xl font-black text-gray-900 leading-tight">ADD YOURS</h2>
          <p className="text-gray-500 text-sm font-medium">Show your Scrappy Score</p>
        </div>

        <div className="bg-gray-100/50 w-full rounded-2xl p-4 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400">
            <Plus size={24} />
          </div>
          <span className="text-gray-400 font-bold text-sm uppercase tracking-widest">Post yours</span>
        </div>

        <div className="flex -space-x-2 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center text-[10px] font-black text-orange-600">
            +2.4k
          </div>
        </div>

        <div className="pt-2">
          <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">ScrappyChef.app</span>
        </div>
      </div>
    </div>
  )
}

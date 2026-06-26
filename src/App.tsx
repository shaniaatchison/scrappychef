import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { ChefHat, ShoppingBasket, History, User as UserIcon } from 'lucide-react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Inventory from './components/Inventory'
import RecipeList from './components/RecipeList'
import CookingHistory from './components/CookingHistory'
import Profile from './components/Profile'
import NotificationCenter from './components/NotificationCenter'
import { Leaderboard } from './components/Leaderboard'
import Disclaimer from './components/Disclaimer'
import LinksPage from './pages/LinksPage'
import StickerPage from './pages/StickerPage'
import type { User } from '@supabase/supabase-js'

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  
  // Hide bottom nav on special pages
  const isSpecialPage = location.pathname === '/links' || location.pathname === '/sticker'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      {!isSpecialPage && (
        <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <Link to="/" className="flex items-center gap-2 outline-none">
              <ChefHat className="text-orange-500 w-8 h-8" />
              <h1 className="text-xl font-black text-gray-900 tracking-tight">ScrappyChef</h1>
            </Link>
            <div className="flex items-center gap-1">
              <NotificationCenter />
              <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                MVP
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 max-w-lg mx-auto w-full ${isSpecialPage ? '' : 'p-4 pb-28'}`}>
        {children}
        
        {/* Footer */}
        {!isSpecialPage && (
          <footer className="mt-12 mb-8 px-4 text-center">
            <Link 
              to="/disclaimer" 
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Legal Disclaimer
            </Link>
          </footer>
        )}
      </main>

      {/* Bottom Navigation */}
      {!isSpecialPage && (
        <nav className="bg-white border-t border-gray-100 fixed bottom-0 left-0 right-0 py-4 px-8 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-10">
          <div className="max-w-lg mx-auto flex justify-between items-center">
            <Link 
              to="/"
              className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/' ? 'text-orange-500 scale-110' : 'text-gray-300 hover:text-gray-400'}`}
            >
              <ShoppingBasket size={24} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Inventory</span>
            </Link>
            <Link 
              to="/recipes"
              className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/recipes' ? 'text-orange-500 scale-110' : 'text-gray-300 hover:text-gray-400'}`}
            >
              <ChefHat size={24} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Recipes</span>
            </Link>
            <Link 
              to="/history"
              className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/history' ? 'text-orange-500 scale-110' : 'text-gray-300 hover:text-gray-400'}`}
            >
              <History size={24} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">History</span>
            </Link>
            <Link 
              to="/profile"
              className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/profile' ? 'text-orange-500 scale-110' : 'text-gray-300 hover:text-gray-400'}`}
            >
              <UserIcon size={24} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  )
}

function App() {
  const [session, setSession] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center">
        <ChefHat className="text-orange-500 w-16 h-16 animate-bounce" />
        <p className="mt-4 text-orange-900/40 font-black tracking-widest uppercase text-xs">Loading</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/links" element={<LinksPage />} />
      <Route path="/sticker" element={<StickerPage />} />
      
      <Route path="/" element={
        session ? (
          <Layout>
            <Inventory />
          </Layout>
        ) : (
          <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4">
            <Auth onAuthSuccess={() => {}} />
            <footer className="mt-8 text-center">
              <Link 
                to="/disclaimer" 
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Legal Disclaimer
              </Link>
            </footer>
          </div>
        )
      } />

      <Route path="/recipes" element={
        session ? (
          <Layout>
            <RecipeList />
          </Layout>
        ) : <Navigate to="/" />
      } />

      <Route path="/history" element={
        session ? (
          <Layout>
            <CookingHistory />
          </Layout>
        ) : <Navigate to="/" />
      } />

      <Route path="/profile" element={
        session ? (
          <Layout>
            <Profile />
          </Layout>
        ) : <Navigate to="/" />
      } />

      <Route path="/leaderboard" element={
        session ? (
          <Layout>
            <Leaderboard />
          </Layout>
        ) : <Navigate to="/" />
      } />

      <Route path="/disclaimer" element={
        <Layout>
          <Disclaimer />
        </Layout>
      } />
    </Routes>
  )
}

export default App

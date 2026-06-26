import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ChefHat, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'

export default function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        })
        if (error) throw error
        alert('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        onAuthSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-8 bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
      <div className="text-center space-y-2">
        <div className="bg-orange-100 p-3 rounded-full inline-block">
          <ChefHat className="w-10 h-10 text-orange-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {isSignUp ? 'Join ScrappyChef' : 'Welcome Back'}
        </h1>
        <p className="text-gray-500 text-sm max-w-[280px] mx-auto">
          {isSignUp 
            ? 'Start saving money and reducing waste today.' 
            : 'Log in to manage your kitchen and find recipes.'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="w-full space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}

        {isSignUp && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="scrappy_chef_99"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {isSignUp ? 'Create Account' : 'Sign In'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
        >
          {isSignUp 
            ? 'Already have an account? Sign In' 
            : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  )
}

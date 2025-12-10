import { useState } from 'react'
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from '../../firebase.js' // Added .js extension
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signInWithEmailAndPassword(auth, email, password)
      // On success, redirect to dashboard
      navigate('/admin/dashboard')
    } catch (err) {
      setError('Invalid credentials. Access denied.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surf-black flex items-center justify-center px-4 bg-noise">
      <div className="max-w-md w-full bg-surf-card border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-surf-accent to-transparent opacity-50"></div>

        <div className="text-center mb-8">
            <i className="ph-fill ph-lock-key text-4xl text-surf-accent mb-4 inline-block"></i>
            <h1 className="font-display text-3xl text-white uppercase tracking-wide">Command Center</h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest mt-2">Authorized Personnel Only</p>
        </div>

        {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold uppercase text-center rounded">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-black/30 border border-white/10 rounded p-3 text-white focus:outline-none focus:border-surf-accent transition-colors"
              placeholder="admin@birdrock.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-black/30 border border-white/10 rounded p-3 text-white focus:outline-none focus:border-surf-accent transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-surf-accent text-black font-bold uppercase py-4 rounded tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>

        <div className="mt-8 text-center">
            <a href="/" className="text-xs text-gray-600 hover:text-white transition-colors">← Return to Shop</a>
        </div>

      </div>
    </div>
  )
}
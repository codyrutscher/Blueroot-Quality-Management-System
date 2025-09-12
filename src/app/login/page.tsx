'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        router.push('/')
      }
    } catch (error) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        {/* Back to Home Link */}
        <div className="flex justify-start">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Enhanced Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img src="/logo.png" alt="Company Logo" className="w-24 h-24 object-contain" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent mb-3">
            Manufacturing Portal
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Sign in to access AI-powered document management
          </p>
        </div>

        {/* Professional Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg text-black placeholder-slate-400 form-input"
                  placeholder="Enter your email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg text-black placeholder-slate-400 form-input"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-xl">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </div>
                  <p className="text-red-800 font-semibold">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 btn-primary"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            
          </form>
        </div>

        {/* Test Users Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Demo Access</h3>
            <p className="text-sm text-slate-600">QMS Workflow Test Users</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 max-h-64 overflow-y-auto">
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-1 gap-2">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900">John Troup</div>
                  <div className="text-slate-600">Email: john.troup@company.com</div>
                  <div className="text-slate-600">Username: john.troup</div>
                  <div className="text-slate-500 font-mono">Password: john.troup.4872</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900">Matt White</div>
                  <div className="text-slate-600">Email: matt.white@company.com</div>
                  <div className="text-slate-600">Username: matt.white</div>
                  <div className="text-slate-500 font-mono">Password: matt.white.9153</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900">Nick Hafften</div>
                  <div className="text-slate-600">Email: nick.hafften@company.com</div>
                  <div className="text-slate-600">Username: nick.hafften</div>
                  <div className="text-slate-500 font-mono">Password: nick.hafften.7284</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900">Steve Nelson</div>
                  <div className="text-slate-600">Email: steve.nelson@company.com</div>
                  <div className="text-slate-600">Username: steve.nelson</div>
                  <div className="text-slate-500 font-mono">Password: steve.nelson.3967</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900">Nick Deloia</div>
                  <div className="text-slate-600">Email: nick.deloia@company.com</div>
                  <div className="text-slate-600">Username: nick.deloia</div>
                  <div className="text-slate-500 font-mono">Password: nick.deloia.8541</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900">Jenn Doucette</div>
                  <div className="text-slate-600">Email: jenn.doucette@company.com</div>
                  <div className="text-slate-600">Username: jenn.doucette</div>
                  <div className="text-slate-500 font-mono">Password: jenn.doucette.2096</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900">Dana Rutscher</div>
                  <div className="text-slate-600">Email: dana.rutscher@company.com</div>
                  <div className="text-slate-600">Username: dana.rutscher</div>
                  <div className="text-slate-500 font-mono">Password: dana.rutscher.6413</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900">Shefali Pandey</div>
                  <div className="text-slate-600">Email: shefali.pandey@company.com</div>
                  <div className="text-slate-600">Username: shefali.pandey</div>
                  <div className="text-slate-500 font-mono">Password: shefali.pandey.9750</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900">Whitney Palmerton</div>
                  <div className="text-slate-600">Email: whitney.palmerton@company.com</div>
                  <div className="text-slate-600">Username: whitney.palmerton</div>
                  <div className="text-slate-500 font-mono">Password: whitney.palmerton.1638</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
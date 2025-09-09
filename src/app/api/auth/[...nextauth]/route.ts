import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Demo mode - allow specific demo accounts without database lookup
        const demoUsers = {
          'demo@company.com': { id: 'demo-user-id', name: 'Demo User', role: 'USER', username: 'demo.user', password: 'demo123' },
          'admin@company.com': { id: 'admin-user-id', name: 'Admin User', role: 'ADMIN', username: 'admin.user', password: 'demo123' },
          'manager@company.com': { id: 'manager-user-id', name: 'Manager User', role: 'MANAGER', username: 'manager.user', password: 'demo123' },
          'john.troup@company.com': { id: 'user-john-troup', name: 'John Troup', role: 'USER', username: 'john.troup', password: 'john.troup.4872' },
          'matt.white@company.com': { id: 'user-matt-white', name: 'Matt White', role: 'USER', username: 'matt.white', password: 'matt.white.9153' },
          'nick.hafften@company.com': { id: 'user-nick-hafften', name: 'Nick Hafften', role: 'USER', username: 'nick.hafften', password: 'nick.hafften.7284' },
          'steve.nelson@company.com': { id: 'user-steve-nelson', name: 'Steve Nelson', role: 'USER', username: 'steve.nelson', password: 'steve.nelson.3967' },
          'nick.deloia@company.com': { id: 'user-nick-deloia', name: 'Nick Deloia', role: 'USER', username: 'nick.deloia', password: 'nick.deloia.8541' },
          'jenn.doucette@company.com': { id: 'user-jenn-doucette', name: 'Jenn Doucette', role: 'USER', username: 'jenn.doucette', password: 'jenn.doucette.2096' },
          'dana.rutscher@company.com': { id: 'user-dana-rutscher', name: 'Dana Rutscher', role: 'USER', username: 'dana.rutscher', password: 'dana.rutscher.6413' },
          'shefali.pandey@company.com': { id: 'user-shefali-pandey', name: 'Shefali Pandey', role: 'USER', username: 'shefali.pandey', password: 'shefali.pandey.9750' },
          'whitney.palmerton@company.com': { id: 'user-whitney-palmerton', name: 'Whitney Palmerton', role: 'USER', username: 'whitney.palmerton', password: 'whitney.palmerton.1638' },
        }

        if (demoUsers[credentials.email]) {
          const user = demoUsers[credentials.email]
          if (credentials.password === user.password) {
            return {
              id: user.id,
              email: credentials.email,
              name: user.name,
              role: user.role,
            }
          }
        }

        // Using demo mode only - no database lookup needed

        return null
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.sub = user.id // Ensure sub is set to user ID
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string || token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
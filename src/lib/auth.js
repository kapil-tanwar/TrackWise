import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './db';
import User from '@/models/User';

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();
        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.profilePicture,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.includes('signout') || url.includes('logout')) {
        return `${baseUrl}/login`;
      }
      
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      try {
        if (new URL(url).origin === baseUrl) {
          return url;
        }
      } catch (err) {
        // Fallback if url is invalid
      }
      
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);

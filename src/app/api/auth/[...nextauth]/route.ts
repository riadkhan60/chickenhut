import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'admin' },
        password: { label: 'Password', type: 'password' },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async authorize(credentials): Promise<any | null> {
        // Get first user from database
        const users = await prisma.user.findMany();
        const user = users[0];

        if (
          credentials?.username === user.name &&
          credentials?.password === user.password
        ) {
          // Return user object without password
          const { password: _password, ...userWithoutPassword } = user;
          void _password;
          return userWithoutPassword;
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/sign-in',
  },
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST };

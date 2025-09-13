import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        
        const publicRoutes = ['/', '/login', '/register'];
        if (publicRoutes.includes(req.nextUrl.pathname)) {
          return true;
        }
        
        
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/transactions/:path*',
    '/achievements/:path*',
    '/settings/:path*',
  ],
};

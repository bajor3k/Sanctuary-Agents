import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_API_ROUTES = '/api/';

export function middleware(request: NextRequest) {
    // Only check API routes
    if (request.nextUrl.pathname.startsWith(PROTECTED_API_ROUTES)) {

        // Exclude certain endpoints from auth (used internally or for file operations)
        const publicEndpoints = [
            '/api/generate-pdfs',
            '/api/advisory-documents',
            '/api/extract',
            '/api/view-pdf'
        ];

        if (publicEndpoints.some(endpoint => request.nextUrl.pathname.startsWith(endpoint))) {
            return NextResponse.next();
        }

        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        // TODO: Ideally verify the token signature here using 'jose' or distinct validation verify steps
        // For now, we ensure a token is passed.
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/api/:path*',
    ],
};

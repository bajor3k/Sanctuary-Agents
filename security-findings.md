# Security Audit Findings

**Date:** 2026-01-19
**Scope:** API Routes, File System Access, Authentication

## Executive Summary
The application currently has **CRITICAL** security vulnerabilities. The API routes are potential open to the public without any authentication, and there are significant risks related to local file system access and file uploads.

## Critical Issues

### 1. Missing API Authentication (Zero Protection)
-   **Location:** All API routes (`src/app/api/**/*`) and likely Server Actions.
-   **Issue:** There is no `middleware.ts` to enforce authentication globally, and individual API routes (e.g., `advisory-documents/route.ts`) do not check for an `Authorization` header or session.
-   **Impact:** Any user (or bot) with network access to your Next.js server can list your local files, upload arbitrary data, and download PDFs.
-   **Recommendation:**
    -   Implement `middleware.ts` to verify the MSAL Access Token (or a session cookie).
    -   Alternatively, check headers in every API route.

### 2. Insecure Local File System Access
-   **Location:** `src/app/api/advisory-documents/route.ts`, `src/app/api/view-pdf/route.ts`
-   **Issue:** The app reads directly from `/Users/bajor3k/Desktop/Orion Advisory`.
-   **Impact:** Hosting this app on a server would expose that server's filesystem. On your local machine, it exposes your personal desktop folder to anyone who can reach `localhost:3000`.
-   **Recommendation:** Use a cloud storage provider (Azure Blob Storage, AWS S3) or a dedicated isolated data directory, rather than personal desktop folders.

### 3. File Upload Vulnerabilities
-   **Location:** `src/app/api/upload-analysis/route.ts`
-   **Issue:**
    -   No authentication checks.
    -   No validation of file content (MIME type, magic bytes). It blindly trusts the extension.
    -   Saves files to a hardcoded local path `/Users/bajor3k/Desktop/AA Dummy/Analysis`.
-   **Impact:** An attacker could upload malicious executables (renamed as .pdf) or flood your disk storage.
-   **Recommendation:** Use `zod` to validate file types/sizes and authenticate the user before processing.

### 4. IDOR (Insecure Direct Object Reference) in PDF Viewing
-   **Location:** `src/app/api/view-pdf/route.ts`
-   **Issue:** The endpoint accepts a `?path=` query parameter. While it checks `startsWith(DOCUMENTS_FOLDER)`, anyone who guesses a valid filename can download it without permission.
-   **Recommendation:** Use an ID-based lookup (database) instead of raw paths, and check if the requesting `user.uid` has permission to view that specific document.

## Immediate Action Plan

1.  **Create Middleware**: Add `middleware.ts` to block `/api/*` requests that lack a valid token.
2.  **Validate Inputs**: Add `zod` validation to `upload-analysis` to ensure only real 10MB max PDFs are uploaded.
3.  **Sanitize Paths**: Stop using absolute desktop paths if possible, or ensure strictly confined access.

## Example Fix for `view-pdf`

```typescript
// Proposed structure
import { verifyToken } from "@/lib/auth/verify"; // You need to implement this

export async function GET(req: NextRequest) {
  // 1. Auth Check
  const token = req.headers.get("Authorization");
  if (!token || !verifyToken(token)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 2. Validate Input
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  if (!path || path.includes("..")) { // Basic path traversal check
     return new NextResponse("Invalid path", { status: 400 });
  }

  // ... proceed
}
```

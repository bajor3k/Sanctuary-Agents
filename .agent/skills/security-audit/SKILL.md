---
name: security-audit
description: Guide for ensuring application security. Use when reviewing code for vulnerabilities, validating inputs, or checking permissions.
---
# Security Audit Skill
This skill provides a checklist and set of rules to identify and prevent security vulnerabilities in the application.
## When to use this skill
- When reviewing API routes or Server Actions.
- When modifying database schemas or access patterns.
- When handling user authentication or authorization.
- When adding new dependencies.
## Audit Checklist
### 1. Authentication & Authorization
- [ ] **Middleware Protection**: Are sensitive routes successfully blocked by middleware?
- [ ] **Role Checks**: Does the code explicitly check for user roles (e.g., `admin`, `user`) before performing actions?
- [ ] **Server Actions**: Are Server Actions properly protected? (They expose public endpoints by default).
- [ ] **Firebase Rules**: Are Firestore security rules restrictive enough? (e.g., `request.auth != null`).
### 2. Data Validation & Injection
- [ ] **Input Validation**: Is `zod` used to validate *all* incoming data on API routes and Server Actions?
- [ ] **No Raw SQL**: Are we using ORM methods (Prisma) instead of raw SQL queries (which are prone to injection)?
- [ ] **XSS Prevention**: Are we avoiding `dangerouslySetInnerHTML` unless absolutely necessary and sanitized?
### 3. Secrets & Configuration
- [ ] **No Hardcoded Secrets**: Are API keys, tokens, and passwords stored in `.env` and accessed via `process.env`?
- [ ] **Public vs Private**: Are we ensuring *only* `NEXT_PUBLIC_` variables are exposed to the client?
### 4. Dependency Safety
- [ ] **Audit**: Has `npm audit` been run recently?
- [ ] **Versions**: Are we using stable versions of critical libraries (e.g., `firebase`, `next-auth`, `@prisma/client`)?
## Common Vulnerabilities to Look For
- **Broken Object Level Authorization (BOLA/IDOR)**: Can User A access User B's data by changing an ID in the URL/payload?
- **Mass Assignment**: Can a user update fields they shouldn't (e.g., `isAdmin: true`) by sending extra JSON data? (Zod schemas usually prevent this).
- **Improper Error Handling**: Do error messages leak sensitive stack traces or database details to the user?
## Recommended Actions
If you find a vulnerability:
1.  **Blocker**: Mark it as a critical issue.
2.  **Fix**: Propose a fix (e.g., "Wrap this API handler with `withAuth`", "Add Zod validation").
3.  **Verify**: Explain how to verify the fix works (e.g., "Try sending a request without a token").

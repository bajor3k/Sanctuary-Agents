# CLAUDE.md - AI Context & Guidelines

> **Start Here:** This file provides essential context for AI assistants working on the Sanctuary Agents codebase. Read this before suggesting complex changes.

## 1. Quick Project Context
- **Product:** Financial operations platform for wealth management (Sanctuary Agents).
- **Core Features:** Ticket management, AI document processing (PDF analysis), 
- **Tech Stack:**
  - **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS, Lucide Icons.
  - **Backend:** Next.js Server Actions, Prisma ORM.
  - **Database:** SQLite (local dev), Azure Cosmos DB (planned/migration).
  - **AI:** Google Genkit (flows, prompts), Gemini Models (via Vertex AI/Google AI).
  - **Auth:** Azure AD (MSAL).
- **Size:** ~19k lines of TypeScript.

## 2. Architecture Overview
### File Structure
- `src/app/` - Next.js App Router pages.
  - `src/app/api/` - API routes (minimal, mostly for webhooks/legacy).
  - `src/app/[section]/` - Feature pages (e.g., `orion`, `advisor-services`, `compliance`).
- `src/components/` - React components.
  - `ui/` - Reusable base components (buttons, inputs).
  - `tickets/`, `sidebar/` - Feature-specific components.
- `src/ai/` - Genkit AI implementation.
  - `flows/` - AI flows (e.g., `analyze-advisory-pdf.ts`).
  - `prompts/` - (Conceptually) where prompts live, though currently defined inline in flows.
- `src/lib/` - Utilities, constants (e.g., `navigation-data.ts`).
- `src/actions/` - Server Actions for data mutations.
- `src/contexts/` - Global state (Auth, Tickets, Navigation).
- `prisma/` - Database schema (`schema.prisma`).

### Key Patterns
- **Server Actions:** Used for data mutations instead of API routes.
- **Genkit Flows:** AI logic is encapsulated in "flows" (`ai.defineFlow`) which are typed and can be served/tested.
- **Context API:** Used for client-side state (Tickets, Auth). React Query is used for server state.
- **Ticket Lifecycle:** Tickets track operations requests. Statuses: Open, Awaiting Input, Action Required, Completed, Closed.

## 3. Important Conventions & Patterns
- **Navigation:**
  - Sections defined in `src/lib/navigation-data.ts`.
  - Sidebar logic in `src/components/Sidebar.tsx`.
- **AI Flows:**
  - Define schema with Zod (`z.object`).
  - Define prompt with `ai.definePrompt`.
  - Define flow with `ai.defineFlow`.
- **Styling:** Tailwind CSS. Use `cn()` utility for class merging.
- **Auth:** `useAuth()` hook provides user context. MSAL handles Azure AD login.

## 4. Module Deep-Dives
### Advisory Agent (AI)
- **Goal:** Analyze PDF agreements for key fields (signatures, fee types).
- **File:** `src/ai/flows/analyze-advisory-pdf.ts`
- **Logic:** Uses Gemini 2.0 Flash to extract JSON matching `AdvisoryDataSchema`.
- **Flow:** Upload PDF -> Base64 -> Genkit Flow -> JSON Output.

### Ticket System
- **Goal:** Manage ops tasks.
- **Schema:** `Ticket` model in `prisma/schema.prisma`.
- **State:** `TicketContext` (`src/contexts/ticket-context.tsx`) currently uses mock data `MOCK_TICKETS` but is structured to swap for DB calls.
- **Fields:** `status`, `priority`, `assignedTeam`, `transferHistory`.

### Authentication
- **Provider:** Azure Active Directory (Microsoft Entra ID).
- **Implementation:** `@azure/msal-react` / `@azure/msal-browser`.
- **File:** `src/contexts/auth-context.tsx`.
- **User Type:** `AppUser` interface abstracts the provider details.

## 5. Development Guidelines
- **Navigation Updates:** To add a page, create `src/app/[new-slug]/page.tsx` AND update `src/lib/navigation-data.ts`.
- **Environment:**
  - `NEXT_PUBLIC_...` for client-side usage.
  - `GEMINI_API_KEY` for AI.
  - `DATABASE_URL` for Prisma.
- **Types:** Keep shared types in `src/types/`.

## 6. AI-Specific Context
- **Framework:** Genkit (`@genkit-ai/core`).
- **Models:** Primarily `gemini-2.0-flash-exp` for speed/cost.
- **Prompts:** currently defined **inline** within flow files using `ai.definePrompt`.
- **Tools:** `genkit start` runs the dev UI for testing flows without the frontend.

## 7. Common Operations
- **Add New Page:**
  1. Create `src/app/new-page/page.tsx`.
  2. Add entry to `navigationData` in `src/lib/navigation-data.ts`.
  3. (Optional) Add sidebar configuration in `Sidebar.tsx`.
- **Create AI Flow:**
  1. Create `src/ai/flows/my-new-flow.ts`.
  2. Define input/output Zod schemas.
  3. `ai.defineFlow(...)`.
  4. Import in `src/ai/dev.ts` to register for Genkit UI.
- **Modify DB:**
  1. Edit `prisma/schema.prisma`.
  2. Run `npx prisma migrate dev`.

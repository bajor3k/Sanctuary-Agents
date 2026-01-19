# Matrix CRM & Dashboard

A Next.js 15 application featuring a Market Dashboard, CRM, and Ticket Management System.

## Features

- **Market Dashboard:** Real-time stock data, news, IPO calendar, and government spending tracking.
- **CRM:** Manage firms, advisors, and associates.
- **Ticket System:** Create, track, and manage support tickets.
- **AI Integration:** Genkit-powered flows for avatar generation and document analysis.

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install --legacy-peer-deps
    ```

2.  **Environment Variables:**
    Copy `env-template` to `.env` and fill in your API keys (Firebase, Google AI, etc.).
    ```bash
    cp env-template .env
    ```

3.  **Database:**
    The project uses SQLite with Prisma.
    ```bash
    npx prisma generate
    npx prisma db push
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## Testing

Run unit tests with Jest:
```bash
npm test
```

## Project Structure

- `src/app/dashboard`: Main market dashboard.
- `src/app/tickets`: Ticket management system.
- `src/app/crm`: CRM modules.
- `src/app/actions`: Server Actions for backend logic.
- `src/ai`: Genkit AI flows.

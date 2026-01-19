# Azure Cosmos DB Setup Guide

Your application is now ready for Azure Cosmos DB! Follow these steps to connect your database.

## 🎯 What's Already Done

✅ Azure Cosmos DB SDK installed (`@azure/cosmos`)
✅ Configuration file created (`src/lib/cosmos.ts`)
✅ Health check integrated into diagnostics page
✅ Environment variable template created (`.env.example`)

## 📋 Setup Steps

### Step 1: Create Azure Cosmos DB Account

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"** → Search for **"Azure Cosmos DB"**
3. Choose **"Azure Cosmos DB for NoSQL"** (recommended)
4. Fill in the details:
   - **Resource Group**: Create new or select existing
   - **Account Name**: Choose a unique name (e.g., `sanctuary-cosmos-db`)
   - **Location**: Choose closest to your users
   - **Capacity mode**: Start with **Serverless** (pay per use, no minimum cost)

5. Click **"Review + Create"** → **"Create"**
6. Wait 5-10 minutes for deployment

---

### Step 2: Create Database and Container

1. Once deployed, go to your Cosmos DB account
2. Click **"Data Explorer"** in the left menu
3. Click **"New Container"**
4. Settings:
   - **Database id**: `sanctuary-db` (or your choice)
   - **Container id**: `main-container` (or your choice)
   - **Partition key**: `/id` (recommended for general use)
5. Click **"OK"**

---

### Step 3: Get Connection Credentials

1. In your Cosmos DB account, click **"Keys"** in the left menu
2. Copy these values:
   - **URI** (endpoint)
   - **PRIMARY KEY** (or secondary key)

---

### Step 4: Add to Environment Variables

Create or update your `.env.local` file in the project root:

```env
# Azure Cosmos DB Configuration
AZURE_COSMOS_ENDPOINT=https://your-account-name.documents.azure.com:443/
AZURE_COSMOS_KEY=your-primary-key-here==
AZURE_COSMOS_DATABASE_ID=sanctuary-db
AZURE_COSMOS_CONTAINER_ID=main-container

# Microsoft Authentication (Already configured)
NEXT_PUBLIC_AZURE_CLIENT_ID=8f5eadab-8939-4226-8161-ae23f98d49a4
NEXT_PUBLIC_AZURE_TENANT_ID=39ed4fe9-48e7-4f1d-bfe7-1dc664b06c1f
```

**Replace:**
- `your-account-name` with your Cosmos DB account name
- `your-primary-key-here==` with your actual primary key
- Database and container IDs if you used different names

---

### Step 5: Restart Your Development Server

```bash
npm run dev
```

---

### Step 6: Verify Connection

1. Open your app at `http://localhost:3002`
2. Navigate to **Diagnostics** page (settings icon in sidebar)
3. Check **"Azure Cosmos DB"** status:
   - ✅ Green = Connected successfully
   - ❌ Red = Check your environment variables

---

## 💾 Using Cosmos DB in Your Code

### Example: Create a Document

```typescript
import { getContainer } from '@/lib/cosmos';

export async function createUser(userData: any) {
  const container = getContainer();

  if (!container) {
    throw new Error('Cosmos DB not configured');
  }

  const { resource } = await container.items.create({
    id: userData.id,
    ...userData,
  });

  return resource;
}
```

### Example: Read a Document

```typescript
import { getContainer } from '@/lib/cosmos';

export async function getUser(userId: string) {
  const container = getContainer();

  if (!container) {
    throw new Error('Cosmos DB not configured');
  }

  const { resource } = await container.item(userId, userId).read();
  return resource;
}
```

### Example: Query Documents

```typescript
import { getContainer } from '@/lib/cosmos';

export async function getUsersByEmail(email: string) {
  const container = getContainer();

  if (!container) {
    throw new Error('Cosmos DB not configured');
  }

  const querySpec = {
    query: "SELECT * FROM c WHERE c.email = @email",
    parameters: [{ name: "@email", value: email }]
  };

  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources;
}
```

---

## 💰 Cost Information

**Serverless Mode** (Recommended for development):
- Pay only for operations you use
- No minimum charge
- First 1M Request Units free per month
- ~$0.25 per million additional Request Units
- Storage: ~$0.25/GB per month

**Typical Development Usage**: $0-5/month

---

## 🔒 Security Best Practices

1. ✅ **Never commit `.env.local`** to git (already in `.gitignore`)
2. ✅ **Use Primary Key for development**, Managed Identity for production
3. ✅ **Enable Azure RBAC** in production for fine-grained access control
4. ✅ **Use connection string encryption** when deploying to Azure App Service

---

## 🚀 Production Deployment

When deploying to Azure App Service or Azure Static Web Apps:

1. Go to your App Service → **Configuration** → **Application settings**
2. Add the same environment variables:
   - `AZURE_COSMOS_ENDPOINT`
   - `AZURE_COSMOS_KEY`
   - `AZURE_COSMOS_DATABASE_ID`
   - `AZURE_COSMOS_CONTAINER_ID`
3. Save and restart the app

---

## 📚 Additional Resources

- [Azure Cosmos DB Documentation](https://docs.microsoft.com/azure/cosmos-db/)
- [Cosmos DB for NoSQL Quickstart](https://learn.microsoft.com/azure/cosmos-db/nosql/quickstart-nodejs)
- [Pricing Calculator](https://azure.microsoft.com/pricing/calculator/)

---

## ❓ Troubleshooting

### "No database configured" in diagnostics
- Check that all 4 environment variables are set in `.env.local`
- Restart the dev server after adding variables

### "Connection failed: Unauthorized"
- Verify the PRIMARY KEY is correct (no extra spaces)
- Check the ENDPOINT URL is complete with `https://` and `:443/`

### "Resource not found"
- Verify database ID and container ID match what you created
- Check spelling and capitalization

---

Need help? The diagnostics page will show you the exact error message!

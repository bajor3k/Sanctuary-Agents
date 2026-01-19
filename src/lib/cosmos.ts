import { CosmosClient, Database, Container } from "@azure/cosmos";

// Azure Cosmos DB Configuration
const cosmosConfig = {
  endpoint: process.env.AZURE_COSMOS_ENDPOINT || "",
  key: process.env.AZURE_COSMOS_KEY || "",
  databaseId: process.env.AZURE_COSMOS_DATABASE_ID || "sanctuary-db",
  containerId: process.env.AZURE_COSMOS_CONTAINER_ID || "main-container",
};

let cosmosClient: CosmosClient | null = null;
let database: Database | null = null;
let container: Container | null = null;

/**
 * Initialize Azure Cosmos DB client
 * Only initializes if credentials are provided
 */
export function initializeCosmos() {
  if (!cosmosConfig.endpoint || !cosmosConfig.key) {
    console.warn("Azure Cosmos DB credentials not configured. Database features will be disabled.");
    return false;
  }

  try {
    cosmosClient = new CosmosClient({
      endpoint: cosmosConfig.endpoint,
      key: cosmosConfig.key,
    });

    database = cosmosClient.database(cosmosConfig.databaseId);
    container = database.container(cosmosConfig.containerId);

    console.log("Azure Cosmos DB initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize Azure Cosmos DB:", error);
    return false;
  }
}

/**
 * Get the Cosmos DB client instance
 */
export function getCosmosClient(): CosmosClient | null {
  if (!cosmosClient && cosmosConfig.endpoint && cosmosConfig.key) {
    initializeCosmos();
  }
  return cosmosClient;
}

/**
 * Get the Cosmos DB database instance
 */
export function getDatabase(): Database | null {
  if (!database && cosmosConfig.endpoint && cosmosConfig.key) {
    initializeCosmos();
  }
  return database;
}

/**
 * Get the Cosmos DB container instance
 */
export function getContainer(): Container | null {
  if (!container && cosmosConfig.endpoint && cosmosConfig.key) {
    initializeCosmos();
  }
  return container;
}

/**
 * Check if Cosmos DB is configured and ready
 */
export function isCosmosConfigured(): boolean {
  return !!(cosmosConfig.endpoint && cosmosConfig.key);
}

/**
 * Health check for Cosmos DB connection
 */
export async function checkCosmosHealth(): Promise<{ connected: boolean; message: string }> {
  if (!isCosmosConfigured()) {
    return {
      connected: false,
      message: "No database configured",
    };
  }

  try {
    const db = getDatabase();
    if (!db) {
      return {
        connected: false,
        message: "Failed to get database instance",
      };
    }

    // Try to read database info to verify connection
    await db.read();

    return {
      connected: true,
      message: "Connected to Azure Cosmos DB",
    };
  } catch (error) {
    return {
      connected: false,
      message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export { cosmosConfig };

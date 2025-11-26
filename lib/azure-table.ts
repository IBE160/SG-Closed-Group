import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

let tableClient: TableClient | null = null;

export function getTableClient(): TableClient {
  if (!tableClient) {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT;
    const accountKey = process.env.AZURE_STORAGE_KEY;
    const tableName = process.env.AZURE_STORAGE_TABLE_NAME || 'innmeldinger';

    if (!accountName || !accountKey) {
      throw new Error('Azure Storage credentials are not configured');
    }

    const credential = new AzureNamedKeyCredential(accountName, accountKey);

    tableClient = new TableClient(
      `https://${accountName}.table.core.windows.net`,
      tableName,
      credential
    );
  }

  return tableClient;
}

export interface BonfireEntity {
  partitionKey: string;
  rowKey: string;
  navn: string;
  telefon: string;
  epost: string;
  adresse: string;
  kommune: string;
  latitude: number;
  longitude: number;
  balstorrelse: string;
  type: string;
  fra?: string;
  til?: string;
  beskrivelse?: string;
  timestamp: string;
  expiryDate: string;
  status: string;
  godkjent: boolean;
}

export async function createBonfireInAzure(data: Omit<BonfireEntity, 'partitionKey' | 'rowKey' | 'timestamp' | 'expiryDate' | 'status' | 'godkjent'>): Promise<string> {
  const client = getTableClient();

  const rowKey = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const now = new Date();
  const expiryDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 dager

  const entity: BonfireEntity = {
    partitionKey: 'innmeldinger',
    rowKey,
    ...data,
    timestamp: now.toISOString(),
    expiryDate: expiryDate.toISOString(),
    status: 'ACTIVE',
    godkjent: false
  };

  await client.createEntity(entity);

  return rowKey;
}

export async function getBonfireFromAzure(rowKey: string): Promise<BonfireEntity | null> {
  try {
    const client = getTableClient();
    const entity = await client.getEntity<BonfireEntity>('innmeldinger', rowKey);
    return entity;
  } catch (error) {
    console.error('Error getting entity:', error);
    return null;
  }
}

export async function getAllBonfiresFromAzure(): Promise<BonfireEntity[]> {
  const client = getTableClient();
  const entities: BonfireEntity[] = [];

  const entitiesIter = client.listEntities<BonfireEntity>({
    queryOptions: { filter: `PartitionKey eq 'innmeldinger' and status eq 'ACTIVE'` }
  });

  for await (const entity of entitiesIter) {
    entities.push(entity);
  }

  return entities;
}

export async function deleteBonfireFromAzure(rowKey: string): Promise<void> {
  const client = getTableClient();
  await client.deleteEntity('innmeldinger', rowKey);
}

export async function approveBonfire(rowKey: string): Promise<void> {
  const client = getTableClient();
  const entity = await client.getEntity<BonfireEntity>('innmeldinger', rowKey);

  await client.updateEntity({
    ...entity,
    godkjent: true
  }, 'Merge');
}

export async function rejectBonfire(rowKey: string): Promise<void> {
  await deleteBonfireFromAzure(rowKey);
}

export async function getPendingBonfires(): Promise<BonfireEntity[]> {
  const client = getTableClient();
  const entities: BonfireEntity[] = [];

  const entitiesIter = client.listEntities<BonfireEntity>({
    queryOptions: { filter: `PartitionKey eq 'innmeldinger' and status eq 'ACTIVE' and godkjent eq false` }
  });

  for await (const entity of entitiesIter) {
    entities.push(entity);
  }

  return entities;
}

export async function getApprovedBonfires(): Promise<BonfireEntity[]> {
  const client = getTableClient();
  const entities: BonfireEntity[] = [];

  const entitiesIter = client.listEntities<BonfireEntity>({
    queryOptions: { filter: `PartitionKey eq 'innmeldinger' and status eq 'ACTIVE' and godkjent eq true` }
  });

  for await (const entity of entitiesIter) {
    entities.push(entity);
  }

  return entities;
}

// Chat message entity
export interface ChatMessageEntity {
  partitionKey: string;
  rowKey: string;
  userMessage: string;
  aiResponse: string;
  timestamp: string;
}

export async function saveChatMessage(userMessage: string, aiResponse: string): Promise<string> {
  const client = getTableClient();

  const rowKey = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const now = new Date();

  const entity: ChatMessageEntity = {
    partitionKey: 'chat-logs',
    rowKey,
    userMessage,
    aiResponse,
    timestamp: now.toISOString()
  };

  await client.createEntity(entity);

  return rowKey;
}

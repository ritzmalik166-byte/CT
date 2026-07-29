import { BlobServiceClient } from "@azure/storage-blob";

function getBlobServiceClient(): BlobServiceClient {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING?.trim();

  if (connectionString) {
    return BlobServiceClient.fromConnectionString(connectionString);
  }

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME?.trim();
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY?.trim();

  if (accountName && accountKey) {
    return BlobServiceClient.fromConnectionString(
      `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`,
    );
  }

  throw new Error(
    "Azure Storage is not configured. Set AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_NAME + AZURE_STORAGE_ACCOUNT_KEY in .env.local",
  );
}

export function getAzureBlobConfig() {
  const container = process.env.AZURE_STORAGE_CONTAINER?.trim() || "ct-assets";
  const prefix = process.env.AZURE_STORAGE_BLOG_PREFIX?.trim() || "blog";
  const accountName =
    process.env.AZURE_STORAGE_ACCOUNT_NAME?.trim() || "contenaissance";

  return { container, prefix, accountName };
}

export async function uploadToAzureBlob(
  buffer: Buffer,
  blobName: string,
  contentType: string,
): Promise<string> {
  const client = getBlobServiceClient();
  const { container, prefix, accountName } = getAzureBlobConfig();
  const fullBlobName = prefix ? `${prefix}/${blobName}` : blobName;

  const containerClient = client.getContainerClient(container);
  const blockBlobClient = containerClient.getBlockBlobClient(fullBlobName);

  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  return `https://${accountName}.blob.core.windows.net/${container}/${fullBlobName}`;
}

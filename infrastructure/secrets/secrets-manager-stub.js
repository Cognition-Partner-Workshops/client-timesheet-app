async function getSecret(secretName) {
  const provider = process.env.SECRETS_PROVIDER || 'env';

  if (provider === 'aws') {
    return getSecretFromAWS(secretName);
  } else if (provider === 'gcp') {
    return getSecretFromGCP(secretName);
  } else if (provider === 'azure') {
    return getSecretFromAzure(secretName);
  }

  return process.env[secretName];
}

async function getSecretFromAWS(secretName) {
  // Requires: npm install @aws-sdk/client-secrets-manager
  // const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
  // const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });
  // const command = new GetSecretValueCommand({ SecretId: secretName });
  // const response = await client.send(command);
  // return JSON.parse(response.SecretString);
  throw new Error('AWS Secrets Manager not configured. Install @aws-sdk/client-secrets-manager and uncomment the code above.');
}

async function getSecretFromGCP(secretName) {
  // Requires: npm install @google-cloud/secret-manager
  // const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
  // const client = new SecretManagerServiceClient();
  // const projectId = process.env.GCP_PROJECT_ID;
  // const [version] = await client.accessSecretVersion({
  //   name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
  // });
  // return version.payload.data.toString('utf8');
  throw new Error('GCP Secret Manager not configured. Install @google-cloud/secret-manager and uncomment the code above.');
}

async function getSecretFromAzure(secretName) {
  // Requires: npm install @azure/keyvault-secrets @azure/identity
  // const { SecretClient } = require('@azure/keyvault-secrets');
  // const { DefaultAzureCredential } = require('@azure/identity');
  // const vaultUrl = process.env.AZURE_KEYVAULT_URL;
  // const credential = new DefaultAzureCredential();
  // const client = new SecretClient(vaultUrl, credential);
  // const secret = await client.getSecret(secretName);
  // return secret.value;
  throw new Error('Azure Key Vault not configured. Install @azure/keyvault-secrets @azure/identity and uncomment the code above.');
}

async function loadSecrets() {
  const secretNames = ['JWT_SECRET', 'DATABASE_URL'];
  const secrets = {};

  for (const name of secretNames) {
    try {
      secrets[name] = await getSecret(name);
    } catch (err) {
      console.warn(`Failed to load secret ${name}:`, err.message);
    }
  }

  return secrets;
}

module.exports = {
  getSecret,
  loadSecrets,
};

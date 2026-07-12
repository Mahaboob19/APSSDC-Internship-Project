const fs = require('fs');
const path = require('path');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const DB_PATH = path.join(__dirname, 'db.json');

const REGION = process.env.AWS_REGION || 'us-east-1';
const COMPANIES_TABLE = process.env.COMPANIES_TABLE || 'placesync-companies';
const APPLICATIONS_TABLE = process.env.APPLICATIONS_TABLE || 'placesync-applications';

let ddbDocClient = null;
if (process.env.DB_TYPE === 'dynamodb') {
  const ddbClient = new DynamoDBClient({ region: REGION });
  ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
}

/**
 * Single source of truth for reading/writing the database (supporting local JSON and AWS DynamoDB).
 */
async function readDB() {
  if (process.env.DB_TYPE === 'dynamodb') {
    try {
      const companiesRes = await ddbDocClient.send(new ScanCommand({ TableName: COMPANIES_TABLE }));
      const applicationsRes = await ddbDocClient.send(new ScanCommand({ TableName: APPLICATIONS_TABLE }));
      return {
        companies: companiesRes.Items || [],
        applications: applicationsRes.Items || [],
      };
    } catch (err) {
      console.error('Error reading from DynamoDB:', err);
      throw err;
    }
  } else {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  }
}

async function writeDB(data) {
  if (process.env.DB_TYPE === 'dynamodb') {
    try {
      const currentDb = await readDB();

      // Sync companies
      const currentCompanies = currentDb.companies;
      const newCompanies = data.companies;

      for (const company of newCompanies) {
        await ddbDocClient.send(new PutCommand({
          TableName: COMPANIES_TABLE,
          Item: company
        }));
      }

      const newCompanyIds = new Set(newCompanies.map(c => c.id));
      for (const company of currentCompanies) {
        if (!newCompanyIds.has(company.id)) {
          await ddbDocClient.send(new DeleteCommand({
            TableName: COMPANIES_TABLE,
            Key: { id: company.id }
          }));
        }
      }

      // Sync applications
      const currentApplications = currentDb.applications;
      const newApplications = data.applications;

      for (const app of newApplications) {
        await ddbDocClient.send(new PutCommand({
          TableName: APPLICATIONS_TABLE,
          Item: app
        }));
      }

      const newAppIds = new Set(newApplications.map(a => a.id));
      for (const app of currentApplications) {
        if (!newAppIds.has(app.id)) {
          await ddbDocClient.send(new DeleteCommand({
            TableName: APPLICATIONS_TABLE,
            Key: { id: app.id }
          }));
        }
      }
    } catch (err) {
      console.error('Error writing to DynamoDB:', err);
      throw err;
    }
  } else {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  }
}

module.exports = { readDB, writeDB };


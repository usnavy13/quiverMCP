import fs from 'fs';
import path from 'path';

interface APIEndpoint {
  path: string;
  method: string;
  operationId: string;
  description: string;
  summary: string;
  parameters: any[];
  responses: any;
  tags: string[];
  security: any[];
}

function extractTier1Endpoints() {
  const apiSpecPath = path.join(process.cwd(), 'quiverAPI.json');
  const apiSpec = JSON.parse(fs.readFileSync(apiSpecPath, 'utf8'));
  
  const tier1Endpoints: APIEndpoint[] = [];
  
  for (const [path, pathItem] of Object.entries(apiSpec.paths)) {
    for (const [method, operation] of Object.entries(pathItem as any)) {
      const op = operation as any;
      if (op.tags && op.tags.includes('Tier 1')) {
        tier1Endpoints.push({
          path,
          method: method.toUpperCase(),
          operationId: op.operationId,
          description: op.description || '',
          summary: op.summary || '',
          parameters: op.parameters || [],
          responses: op.responses,
          tags: op.tags,
          security: op.security || []
        });
      }
    }
  }
  
  console.log('Tier 1 Endpoints Found:');
  console.log('========================');
  tier1Endpoints.forEach(endpoint => {
    console.log(`${endpoint.method} ${endpoint.path}`);
    console.log(`  Summary: ${endpoint.summary}`);
    console.log(`  Description: ${endpoint.description}`);
    console.log(`  Parameters: ${endpoint.parameters.length}`);
    console.log('');
  });
  
  // Save to file for reference
  fs.writeFileSync(
    path.join(process.cwd(), 'src/tier1-endpoints.json'),
    JSON.stringify(tier1Endpoints, null, 2)
  );
  
  return tier1Endpoints;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  extractTier1Endpoints();
}

export { extractTier1Endpoints };
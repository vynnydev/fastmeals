#!/usr/bin/env node
/**
 * Merge OpenAPI specs from all 6 microservices into a unified spec.
 *
 * The swagger.ts files export a pure object with no runtime dependencies,
 * so we can load them directly via tsx (TypeScript execution).
 *
 * Usage:
 *   npx tsx scripts/generate-unified-api-docs.js
 *   # or
 *   node --loader tsx scripts/generate-unified-api-docs.js
 *
 * Output:
 *   docs/api/openapi.yaml
 *   docs/api/openapi.json
 */

const fs = require('fs');
const path = require('path');

// Try to use js-yaml, fallback to simple JSON if not available
let yaml;
try {
  yaml = require('js-yaml');
} catch {
  console.error('⚠️  js-yaml not installed. Install with: npm install --save-dev js-yaml');
  console.error('   Falling back to JSON-only output.\n');
}

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs/api');
const YAML_FILE = path.join(OUTPUT_DIR, 'openapi.yaml');
const JSON_FILE = path.join(OUTPUT_DIR, 'openapi.json');

const SERVICES = [
  { name: 'auth-service', title: '🔐 Authentication', basePath: '/api/auth' },
  { name: 'products-service', title: '📦 Products', basePath: '/api/products' },
  { name: 'orders-service', title: '📋 Orders', basePath: '/api/orders' },
  { name: 'delivery-service', title: '🚴 Delivery', basePath: '/api/delivery-persons' },
  { name: 'optimization-service', title: '🧠 Optimization', basePath: '/api/orders' },
  { name: 'reports-service', title: '📊 Reports', basePath: '/api/reports' },
];

/**
 * Load swagger spec by reading the .ts file as text and extracting the object.
 */
function loadServiceSpec(serviceName) {
  const swaggerPath = path.join(
    ROOT,
    'backend/services',
    serviceName,
    'src/infrastructure/http/swagger.ts',
  );

  if (!fs.existsSync(swaggerPath)) {
    console.error(`❌ ${serviceName}: swagger.ts not found at ${swaggerPath}`);
    return null;
  }

  try {
    const source = fs.readFileSync(swaggerPath, 'utf-8');

    // Extract the object literal after "export const swaggerSpec ="
    const match = source.match(/export\s+const\s+swaggerSpec\s*=\s*(\{[\s\S]*\})\s*;?\s*$/m);
    if (!match) {
      console.error(`❌ ${serviceName}: could not find "export const swaggerSpec = {...}"`);
      return null;
    }

    const objectLiteral = match[1];
    const spec = new Function(`return (${objectLiteral})`)();

    return spec;
  } catch (err) {
    console.error(`❌ ${serviceName}: ${err.message}`);
    return null;
  }
}

/**
 * Re-prefix paths with the service's API Gateway basePath.
 */
function rewritePaths(spec, basePath) {
  if (!spec.paths) return {};

  const newPaths = {};
  Object.entries(spec.paths).forEach(([pathName, pathValue]) => {
    const fullPath = pathName === '/'
      ? basePath
      : `${basePath}${pathName}`;
    newPaths[fullPath] = pathValue;
  });

  return newPaths;
}

/**
 * Merge a service spec into the unified spec.
 */
function mergeSpec(unified, service, spec) {
  if (!spec) return;

  const serviceTags = new Set();
  const paths = rewritePaths(spec, service.basePath);

  Object.entries(paths).forEach(([pathName, pathValue]) => {
    Object.keys(pathValue).forEach(method => {
      const operation = pathValue[method];

      if (operation.tags && Array.isArray(operation.tags)) {
        operation.tags = operation.tags.map(t => {
          const newTag = `${service.title} — ${t}`;
          serviceTags.add(newTag);
          return newTag;
        });
      } else {
        operation.tags = [service.title];
        serviceTags.add(service.title);
      }
    });

    unified.paths[pathName] = pathValue;
  });

  serviceTags.forEach(tagName => {
    unified.tags.push({
      name: tagName,
      description: `${service.name} endpoints`,
    });
  });

  if (spec.components) {
    Object.entries(spec.components).forEach(([componentType, components]) => {
      if (!unified.components[componentType]) {
        unified.components[componentType] = {};
      }
      Object.entries(components).forEach(([name, def]) => {
        unified.components[componentType][name] = def;
      });
    });
  }
}

function main() {
  console.log('🔨 Generating unified API documentation...\n');

  const unified = {
    openapi: '3.0.3',
    info: {
      title: 'FastMeals API',
      version: '1.0.0',
      description: [
        '# FastMeals — Unified API Documentation',
        '',
        'Documentação unificada de todos os **6 microserviços** da plataforma FastMeals.',
        '',
        '## Serviços',
        '',
        '- **🔐 auth-service** — JWT authentication (login, refresh token)',
        '- **📦 products-service** — Product catalog CRUD',
        '- **📋 orders-service** — Orders with state machine',
        '- **🚴 delivery-service** — Delivery persons CRUD',
        '- **🧠 optimization-service** — Hungarian algorithm assignment',
        '- **📊 reports-service** — Analytics + AI Insights (AWS Bedrock)',
        '',
        '## Autenticação',
        '',
        'Todos os endpoints (exceto `/api/auth/login` e `/api/auth/refresh-token`) requerem JWT Bearer token:',
        '',
        '```',
        'Authorization: Bearer <access_token>',
        '```',
        '',
        '## Rate Limiting',
        '',
        'Todos os endpoints possuem rate limiting per-IP.',
        '',
        '## URLs',
        '',
        '- **Production:** https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com',
        '- **Local:** http://localhost (via Nginx gateway)',
      ].join('\n'),
      contact: {
        name: 'Vinicius Prudencio',
        url: 'https://github.com/vynnydev/fastmeals',
      },
      license: { name: 'MIT' },
    },
    servers: [
      {
        url: 'https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com',
        description: 'Production (AWS API Gateway)',
      },
      {
        url: 'http://localhost',
        description: 'Local (Nginx gateway)',
      },
    ],
    tags: [],
    paths: {},
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token obtained via POST /api/auth/login',
        },
      },
      schemas: {},
    },
    security: [{ bearerAuth: [] }],
  };

  let totalEndpoints = 0;
  SERVICES.forEach(service => {
    const spec = loadServiceSpec(service.name);
    if (spec) {
      mergeSpec(unified, service, spec);
      const pathCount = spec.paths ? Object.keys(spec.paths).length : 0;
      totalEndpoints += pathCount;
      console.log(`✅ ${service.name.padEnd(25)} ${pathCount} paths`);
    }
  });

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(JSON_FILE, JSON.stringify(unified, null, 2));

  if (yaml) {
    const yamlContent = yaml.dump(unified, {
      lineWidth: 120,
      noRefs: false,
      sortKeys: false,
    });
    fs.writeFileSync(YAML_FILE, yamlContent);
  }

  console.log(`\n✨ Unified spec generated with ${totalEndpoints} endpoints:`);
  console.log(`   📄 ${path.relative(ROOT, JSON_FILE)}`);
  if (yaml) console.log(`   📄 ${path.relative(ROOT, YAML_FILE)}`);
  console.log(`\n🌐 Open docs/api/index.html in a browser to view the Scalar UI.`);
  console.log(`   Or serve locally: npx serve docs/api`);
}

main();
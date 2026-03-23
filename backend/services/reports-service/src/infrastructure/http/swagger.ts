export const swaggerSpec = {
    openapi: '3.0.3',
    info: {
      title: 'FastMeals Reports Service',
      version: '1.0.0',
      description: 'Analytics com CQRS read model, 4 relatórios + AI Insights via AWS Bedrock (Claude).',
    },
    servers: [{ url: '/api/reports', description: 'Reports API' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/revenue': {
        get: {
          summary: 'Receita por período',
          tags: ['Reports'],
          parameters: [
            { name: 'startDate', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
            { name: 'endDate', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
          ],
          responses: { '200': { description: 'Receita total, por dia, ticket médio' } },
        },
      },
      '/orders-by-status': {
        get: {
          summary: 'Pedidos agrupados por status',
          tags: ['Reports'],
          responses: { '200': { description: 'Contagem por status' } },
        },
      },
      '/top-products': {
        get: {
          summary: 'Produtos mais vendidos',
          tags: ['Reports'],
          parameters: [
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: { '200': { description: 'Ranking de produtos' } },
        },
      },
      '/average-delivery-time': {
        get: {
          summary: 'Tempo médio de entrega',
          tags: ['Reports'],
          parameters: [
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          responses: { '200': { description: 'Tempo médio, mais rápido, mais lento, por veículo' } },
        },
      },
      '/ai-insights': {
        get: {
          summary: 'Insights com IA (AWS Bedrock)',
          tags: ['Reports'],
          parameters: [
            { name: 'startDate', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
            { name: 'endDate', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
          ],
          responses: { '200': { description: 'Summary, recommendations, highlights' } },
        },
      },
    },
};
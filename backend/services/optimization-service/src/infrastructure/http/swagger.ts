export const swaggerSpec = {
    openapi: '3.0.3',
    info: {
      title: 'FastMeals Optimization Service',
      version: '1.0.0',
      description: 'Otimização de atribuição usando Hungarian Algorithm O(n³) com Haversine para distância geodésica.',
    },
    servers: [{ url: '/api/orders', description: 'Optimization API' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/optimize-assignment': {
        post: {
          summary: 'Executar otimização de atribuição',
          description: 'Busca pedidos ready e entregadores disponíveis, calcula distâncias via Haversine e atribui via Hungarian Algorithm.',
          tags: ['Optimization'],
          responses: {
            '200': {
              description: 'Resultado da otimização',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      assignments: { type: 'array', items: { type: 'object' } },
                      unassigned: { type: 'array', items: { type: 'object' } },
                      totalDistanceKm: { type: 'number' },
                      algorithm: { type: 'string', example: 'hungarian' },
                      executionTimeMs: { type: 'number' },
                    },
                  },
                },
              },
            },
            '403': { description: 'Permissão insuficiente' },
          },
        },
      },
    },
};
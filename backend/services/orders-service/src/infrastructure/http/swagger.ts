export const swaggerSpec = {
    openapi: '3.0.3',
    info: {
      title: 'FastMeals Orders Service',
      version: '1.0.0',
      description: 'Gestão de pedidos com máquina de estados, comunicação inter-serviço e RabbitMQ.',
    },
    servers: [{ url: '/api/orders', description: 'Orders API' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/': {
        get: {
          summary: 'Listar pedidos',
          tags: ['Orders'],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'] } },
            { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'totalAmount'] } },
            { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
          ],
          responses: { '200': { description: 'Lista paginada de pedidos' } },
        },
        post: {
          summary: 'Criar pedido',
          tags: ['Orders'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['customerName', 'customerPhone', 'deliveryAddress', 'latitude', 'longitude', 'items'],
                  properties: {
                    customerName: { type: 'string', minLength: 3, maxLength: 100 },
                    customerPhone: { type: 'string', pattern: '^\\(\\d{2}\\) \\d{5}-\\d{4}$' },
                    deliveryAddress: { type: 'string', minLength: 10, maxLength: 300 },
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          productId: { type: 'string', format: 'uuid' },
                          quantity: { type: 'integer', minimum: 1 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Pedido criado' }, '422': { description: 'Produto indisponível' } },
        },
      },
      '/{id}': {
        get: {
          summary: 'Buscar pedido por ID',
          tags: ['Orders'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Pedido encontrado' }, '404': { description: 'Não encontrado' } },
        },
      },
      '/{id}/status': {
        patch: {
          summary: 'Atualizar status do pedido',
          tags: ['Orders'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['pending', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'] },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'Status atualizado' }, '422': { description: 'Transição inválida' } },
        },
      },
      '/{id}/assign': {
        patch: {
          summary: 'Atribuir entregador ao pedido',
          tags: ['Orders'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['deliveryPersonId'],
                  properties: {
                    deliveryPersonId: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'Entregador atribuído' }, '422': { description: 'Entregador indisponível' } },
        },
      },
    },
};
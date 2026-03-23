export const swaggerSpec = {
    openapi: '3.0.3',
    info: {
      title: 'FastMeals Delivery Service',
      version: '1.0.0',
      description: 'CRUD de entregadores com filtro de disponibilidade e consumo de eventos RabbitMQ.',
    },
    servers: [{ url: '/api/delivery-persons', description: 'Delivery API' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/': {
        get: {
          summary: 'Listar entregadores',
          tags: ['Delivery'],
          parameters: [
            { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
            { name: 'available', in: 'query', schema: { type: 'boolean' } },
          ],
          responses: { '200': { description: 'Lista de entregadores' } },
        },
        post: {
          summary: 'Criar entregador',
          tags: ['Delivery'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'phone', 'vehicleType'],
                  properties: {
                    name: { type: 'string', minLength: 3 },
                    phone: { type: 'string', pattern: '^\\(\\d{2}\\) \\d{5}-\\d{4}$' },
                    vehicleType: { type: 'string', enum: ['motorcycle', 'bicycle', 'car'] },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Entregador criado' } },
        },
      },
      '/{id}': {
        get: {
          summary: 'Buscar entregador por ID',
          tags: ['Delivery'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Entregador encontrado' }, '404': { description: 'Não encontrado' } },
        },
        put: {
          summary: 'Atualizar entregador',
          tags: ['Delivery'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Atualizado' } },
        },
        delete: {
          summary: 'Remover entregador',
          tags: ['Delivery'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'Removido' }, '409': { description: 'Entregador em entrega' } },
        },
      },
    },
};
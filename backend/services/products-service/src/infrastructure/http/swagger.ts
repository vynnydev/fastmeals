export const swaggerSpec = {
    openapi: '3.0.3',
    info: {
      title: 'FastMeals Products Service',
      version: '1.0.0',
      description: 'CRUD de produtos com paginação, busca e filtros por categoria.',
    },
    servers: [{ url: '/api/products', description: 'Products API' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/': {
        get: {
          summary: 'Listar produtos',
          tags: ['Products'],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'category', in: 'query', schema: { type: 'string', enum: ['meal', 'drink', 'dessert', 'side'] } },
            { name: 'isAvailable', in: 'query', schema: { type: 'boolean' } },
            { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'price', 'createdAt'] } },
            { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
          ],
          responses: { '200': { description: 'Lista paginada de produtos' } },
        },
        post: {
          summary: 'Criar produto',
          tags: ['Products'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'description', 'price', 'category', 'preparationTime'],
                  properties: {
                    name: { type: 'string', minLength: 3, maxLength: 120 },
                    description: { type: 'string', minLength: 10, maxLength: 500 },
                    price: { type: 'number', minimum: 0.01 },
                    category: { type: 'string', enum: ['meal', 'drink', 'dessert', 'side'] },
                    imageUrl: { type: 'string', format: 'uri' },
                    preparationTime: { type: 'integer', minimum: 1, maximum: 120 },
                    isAvailable: { type: 'boolean', default: true },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Produto criado' }, '400': { description: 'Validação falhou' } },
        },
      },
      '/{id}': {
        get: {
          summary: 'Buscar produto por ID',
          tags: ['Products'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Produto encontrado' }, '404': { description: 'Produto não encontrado' } },
        },
        put: {
          summary: 'Atualizar produto',
          tags: ['Products'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Produto atualizado' }, '404': { description: 'Não encontrado' } },
        },
        delete: {
          summary: 'Remover produto',
          tags: ['Products'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'Produto removido' }, '409': { description: 'Produto vinculado a pedidos ativos' } },
        },
      },
    },
};
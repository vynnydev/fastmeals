export const swaggerSpec = {
    openapi: '3.0.3',
    info: {
      title: 'FastMeals Auth Service',
      version: '1.0.0',
      description: 'Autenticação JWT com access + refresh tokens e Redis token store.',
    },
    servers: [{ url: '/api/auth', description: 'Auth API' }],
    paths: {
      '/login': {
        post: {
          summary: 'Login',
          description: 'Autentica um usuário e retorna access + refresh tokens.',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'admin@fastmeals.com' },
                    password: { type: 'string', example: 'Admin@123' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Login realizado com sucesso' },
            '401': { description: 'Credenciais inválidas' },
            '429': { description: 'Rate limit excedido' },
          },
        },
      },
      '/refresh-token': {
        post: {
          summary: 'Refresh Token',
          description: 'Gera um novo access token a partir de um refresh token válido.',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: {
                    refreshToken: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Token renovado' },
            '401': { description: 'Refresh token inválido ou expirado' },
          },
        },
      },
    },
};
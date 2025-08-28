import type { OpenAPIV3 } from 'openapi-types';

export const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'AI Chatbot API',
    version: '1.0.0',
    description: 'Groq Llama3 Chat API',
  },
  servers: [{ url: '/api/v1', description: 'v1 base' }],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': { description: 'OK' },
        },
      },
    },
    '/chat': {
      post: {
        summary: 'Create chat completion',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  messages: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        role: { type: 'string', enum: ['system', 'user', 'assistant'] },
                        content: { type: 'string' },
                      },
                      required: ['role', 'content'],
                    },
                    minItems: 1,
                  },
                  stream: { type: 'boolean' },
                  temperature: { type: 'number', minimum: 0, maximum: 2 },
                  max_tokens: { type: 'number', minimum: 1, maximum: 4096 },
                },
                required: ['messages'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Chat response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    content: { type: 'string' },
                    raw: { type: 'object' },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation failed' },
          '500': { description: 'Server error' },
        },
      },
    },
  },
  components: {},
};

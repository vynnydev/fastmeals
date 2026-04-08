import { describe, it, expect, vi } from 'vitest';

// rabbitmq-client uses module-level state (connection/channel singletons)
// which makes isolated unit testing unreliable with vi.resetModules().
// The actual RabbitMQ logic is tested via event-consumer.spec.ts.
// Here we test only the exported constants/types.

describe('RabbitMQ Client', () => {
  it('should export connectRabbitMQ function', async () => {
    const mod = await import('../../src/infrastructure/messaging/rabbitmq-client');
    expect(typeof mod.connectRabbitMQ).toBe('function');
  });

  it('should export getChannel function', async () => {
    const mod = await import('../../src/infrastructure/messaging/rabbitmq-client');
    expect(typeof mod.getChannel).toBe('function');
  });

  it('should export disconnectRabbitMQ function', async () => {
    const mod = await import('../../src/infrastructure/messaging/rabbitmq-client');
    expect(typeof mod.disconnectRabbitMQ).toBe('function');
  });

  it('getChannel should return null before connection', async () => {
    const mod = await import('../../src/infrastructure/messaging/rabbitmq-client');
    expect(mod.getChannel()).toBeNull();
  });
});
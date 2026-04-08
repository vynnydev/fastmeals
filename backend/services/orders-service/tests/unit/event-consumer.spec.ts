import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventConsumer } from '../../src/infrastructure/messaging/event-consumer';
import { EXCHANGE_NAME, EventRoutes, Queues } from '../../src/infrastructure/messaging/events';

const mockChannel = {
  assertQueue: vi.fn().mockResolvedValue({}),
  bindQueue: vi.fn().mockResolvedValue({}),
  consume: vi.fn().mockResolvedValue({}),
  ack: vi.fn(),
  nack: vi.fn(),
};

describe('EventConsumer', () => {
  let consumer: EventConsumer;

  beforeEach(() => {
    vi.clearAllMocks();
    consumer = new EventConsumer(mockChannel as any);
  });

  describe('setup', () => {
    it('should assert durable queue', async () => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
      await consumer.setup();
      expect(mockChannel.assertQueue).toHaveBeenCalledWith(Queues.DELIVERY_ASSIGNED, { durable: true });
    });

    it('should bind queue to exchange', async () => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
      await consumer.setup();
      expect(mockChannel.bindQueue).toHaveBeenCalledWith(
        Queues.DELIVERY_ASSIGNED, EXCHANGE_NAME, EventRoutes.DELIVERY_ASSIGNED,
      );
    });
  });

  describe('consumeDeliveryAssigned', () => {
    it('should consume from correct queue', async () => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
      await consumer.consumeDeliveryAssigned(vi.fn());
      expect(mockChannel.consume).toHaveBeenCalledWith(
        Queues.DELIVERY_ASSIGNED, expect.any(Function), { noAck: false },
      );
    });

    it('should parse, handle and ack on success', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      const event = { orderId: 'o-1', deliveryPersonId: 'dp-1', deliveryPersonName: 'X', estimatedDistanceKm: 5, assignedAt: '' };
      const msg = { content: Buffer.from(JSON.stringify(event)) };

      mockChannel.consume.mockImplementation(async (_q: string, cb: Function) => { await cb(msg); });
      vi.spyOn(console, 'log').mockImplementation(() => {});

      await consumer.consumeDeliveryAssigned(handler);
      expect(handler).toHaveBeenCalledWith(event);
      expect(mockChannel.ack).toHaveBeenCalledWith(msg);
    });

    it('should nack on handler error', async () => {
      const handler = vi.fn().mockRejectedValue(new Error('fail'));
      const msg = { content: Buffer.from(JSON.stringify({ orderId: 'o-1' })) };

      mockChannel.consume.mockImplementation(async (_q: string, cb: Function) => { await cb(msg); });
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await consumer.consumeDeliveryAssigned(handler);
      expect(mockChannel.nack).toHaveBeenCalledWith(msg, false, true);
    });

    it('should skip null messages', async () => {
      const handler = vi.fn();
      mockChannel.consume.mockImplementation(async (_q: string, cb: Function) => { await cb(null); });
      vi.spyOn(console, 'log').mockImplementation(() => {});

      await consumer.consumeDeliveryAssigned(handler);
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
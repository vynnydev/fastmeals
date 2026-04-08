import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeliveryEventConsumer } from '../../src/infrastructure/messaging/event-consumer';
import { EXCHANGE_NAME, EventRoutes, Queues } from '../../src/infrastructure/messaging/events';

const mockChannel = {
  assertQueue: vi.fn().mockResolvedValue({}),
  bindQueue: vi.fn().mockResolvedValue({}),
  consume: vi.fn().mockResolvedValue({}),
  ack: vi.fn(),
  nack: vi.fn(),
};

describe('DeliveryEventConsumer', () => {
  let consumer: DeliveryEventConsumer;

  beforeEach(() => {
    vi.clearAllMocks();
    consumer = new DeliveryEventConsumer(mockChannel as any);
  });

  describe('setup', () => {
    it('should assert durable queue', async () => {
      await consumer.setup();

      expect(mockChannel.assertQueue).toHaveBeenCalledWith(
        Queues.DELIVERY_ORDER_STATUS,
        { durable: true },
      );
    });

    it('should bind queue to exchange with correct routing key', async () => {
      await consumer.setup();

      expect(mockChannel.bindQueue).toHaveBeenCalledWith(
        Queues.DELIVERY_ORDER_STATUS,
        EXCHANGE_NAME,
        EventRoutes.ORDER_STATUS_CHANGED,
      );
    });
  });

  describe('consumeOrderStatusChanged', () => {
    it('should start consuming from the correct queue', async () => {
      const handler = vi.fn();

      await consumer.consumeOrderStatusChanged(handler);

      expect(mockChannel.consume).toHaveBeenCalledWith(
        Queues.DELIVERY_ORDER_STATUS,
        expect.any(Function),
        { noAck: false },
      );
    });

    it('should parse message, call handler and ack on success', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      const event = {
        orderId: 'order-001',
        customerName: 'Cliente',
        customerPhone: '11999999999',
        previousStatus: 'preparing',
        newStatus: 'delivering',
        deliveryPersonId: 'dp-001',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      const msg = { content: Buffer.from(JSON.stringify(event)) };

      mockChannel.consume.mockImplementation(async (_queue: string, callback: Function) => {
        await callback(msg);
      });

      vi.spyOn(console, 'log').mockImplementation(() => {});

      await consumer.consumeOrderStatusChanged(handler);

      expect(handler).toHaveBeenCalledWith(event);
      expect(mockChannel.ack).toHaveBeenCalledWith(msg);
    });

    it('should nack and requeue on handler error', async () => {
      const handler = vi.fn().mockRejectedValue(new Error('handler failed'));
      const event = { orderId: 'order-002', previousStatus: 'a', newStatus: 'b' };
      const msg = { content: Buffer.from(JSON.stringify(event)) };

      mockChannel.consume.mockImplementation(async (_queue: string, callback: Function) => {
        await callback(msg);
      });

      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await consumer.consumeOrderStatusChanged(handler);

      expect(mockChannel.nack).toHaveBeenCalledWith(msg, false, true);
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });

    it('should skip null messages', async () => {
      const handler = vi.fn();

      mockChannel.consume.mockImplementation(async (_queue: string, callback: Function) => {
        await callback(null);
      });

      await consumer.consumeOrderStatusChanged(handler);

      expect(handler).not.toHaveBeenCalled();
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });
  });
});
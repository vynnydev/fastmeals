import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventPublisher } from '../../src/infrastructure/messaging/event-publisher';
import { EXCHANGE_NAME, EventRoutes } from '../../src/infrastructure/messaging/events';

const mockChannel = {
  publish: vi.fn().mockReturnValue(true),
};

vi.mock('../../src/infrastructure/messaging/rabbitmq-client', () => ({
  getChannel: vi.fn(),
}));

import { getChannel } from '../../src/infrastructure/messaging/rabbitmq-client';
const mockGetChannel = vi.mocked(getChannel);

describe('EventPublisher', () => {
  let publisher: EventPublisher;

  beforeEach(() => {
    vi.clearAllMocks();
    publisher = new EventPublisher();
  });

  describe('publishOrderCreated', () => {
    it('should publish order created event', async () => {
      mockGetChannel.mockResolvedValue(mockChannel as any);
      vi.spyOn(console, 'log').mockImplementation(() => {});

      const event = {
        orderId: 'order-001',
        customerName: 'João',
        customerPhone: '11999998888',
        totalAmount: 59.8,
        itemCount: 2,
        createdAt: '2026-01-01T00:00:00Z',
      };

      await publisher.publishOrderCreated(event);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        EXCHANGE_NAME,
        EventRoutes.ORDER_CREATED,
        expect.any(Buffer),
        expect.objectContaining({ persistent: true, contentType: 'application/json' }),
      );
    });
  });

  describe('publishOrderStatusChanged', () => {
    it('should publish order status changed event', async () => {
      mockGetChannel.mockResolvedValue(mockChannel as any);
      vi.spyOn(console, 'log').mockImplementation(() => {});

      const event = {
        orderId: 'order-001',
        customerName: 'João',
        customerPhone: '11999998888',
        previousStatus: 'pending',
        newStatus: 'preparing',
        deliveryPersonId: null,
        updatedAt: '2026-01-01T00:00:00Z',
      };

      await publisher.publishOrderStatusChanged(event);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        EXCHANGE_NAME,
        EventRoutes.ORDER_STATUS_CHANGED,
        expect.any(Buffer),
        expect.objectContaining({ persistent: true }),
      );
    });
  });

  describe('when channel is null', () => {
    it('should warn and not throw', async () => {
      mockGetChannel.mockResolvedValue(null);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await publisher.publishOrderCreated({
        orderId: 'x', customerName: 'x', customerPhone: 'x',
        totalAmount: 0, itemCount: 0, createdAt: '',
      });

      expect(warnSpy).toHaveBeenCalled();
      expect(mockChannel.publish).not.toHaveBeenCalled();
    });
  });

  describe('when publish throws', () => {
    it('should catch error and not throw', async () => {
      mockGetChannel.mockResolvedValue(mockChannel as any);
      mockChannel.publish.mockImplementation(() => { throw new Error('publish failed'); });
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(console, 'log').mockImplementation(() => {});

      await expect(publisher.publishOrderStatusChanged({
        orderId: 'x', customerName: 'x', customerPhone: 'x',
        previousStatus: 'a', newStatus: 'b', deliveryPersonId: null, updatedAt: '',
      })).resolves.toBeUndefined();
    });
  });
});
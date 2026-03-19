import amqp from 'amqplib';
import type { Connection, Channel } from 'amqplib';
import { EXCHANGE_NAME, EXCHANGE_TYPE } from './events';

let connection: any = null;
let channel: Channel | null = null;

export async function connectRabbitMQ(url: string): Promise<Channel | null> {
  if (channel) {
    return channel;
  }

  try {
    connection = await amqp.connect(url);
    channel = await connection.createChannel();

    await channel!.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
      durable: true,
    });

    console.log('✅ RabbitMQ connected');
    console.log(`   Exchange: ${EXCHANGE_NAME} (${EXCHANGE_TYPE})`);

    connection!.on('error', (error: Error) => {
      console.error('RabbitMQ connection error:', error.message);
      channel = null;
      connection = null;
    });
    
    connection!.on('close', () => {
      console.log('RabbitMQ connection closed');
      channel = null;
      connection = null;
    });

    return channel;
  } catch (error) {
    console.error('❌ Failed to connect to RabbitMQ:', error);
    throw error;
  }
}

export function getChannel(): Channel | null {
  return channel;
}

export async function disconnectRabbitMQ(): Promise<void> {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    console.log('✅ RabbitMQ disconnected');
  } catch (error) {
    console.error('Error disconnecting RabbitMQ:', error);
  }
}
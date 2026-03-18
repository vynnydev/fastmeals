import amqp, { Connection, Channel } from 'amqplib';
import { EXCHANGE_NAME, EXCHANGE_TYPE } from './events';

let connection: Connection | null = null;
let channel: Channel | null = null;

export async function connectRabbitMQ(url: string): Promise<Channel> {
  if (channel) {
    return channel;
  }

  try {
    connection = await amqp.connect(url);
    channel = await connection.createChannel();

    // Declare the topic exchange
    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
      durable: true, // Exchange survives broker restart
    });

    console.log('✅ RabbitMQ connected');
    console.log(`   Exchange: ${EXCHANGE_NAME} (${EXCHANGE_TYPE})`);

    // Handle connection errors
    connection.on('error', (error) => {
      console.error('RabbitMQ connection error:', error.message);
      channel = null;
      connection = null;
    });

    connection.on('close', () => {
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

export async function getChannel(): Promise<Channel | null> {
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
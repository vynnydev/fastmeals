import type { WebSocketMessage, Order, DeliveryPerson } from '@/types'

type MessageHandler = (message: WebSocketMessage) => void
type ConnectionHandler = () => void

class OrderWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private messageHandlers: Set<MessageHandler> = new Set()
  private onConnectHandlers: Set<ConnectionHandler> = new Set()
  private onDisconnectHandlers: Set<ConnectionHandler> = new Set()
  private isIntentionallyClosed = false

  private get wsUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost'
    return `${baseUrl}/ws/orders`
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.isIntentionallyClosed = false

    try {
      this.ws = new WebSocket(this.wsUrl)

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected')
        this.reconnectAttempts = 0
        this.onConnectHandlers.forEach((handler) => handler())
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.messageHandlers.forEach((handler) => handler(message))
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('[WebSocket] Disconnected')
        this.onDisconnectHandlers.forEach((handler) => handler())

        if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          console.log(`[WebSocket] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts})`)
          setTimeout(() => this.connect(), this.reconnectDelay)
        }
      }

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
      }
    } catch (error) {
      console.error('[WebSocket] Failed to connect:', error)
    }
  }

  disconnect(): void {
    this.isIntentionallyClosed = true
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler)
    return () => {
      this.messageHandlers.delete(handler)
    }
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.onConnectHandlers.add(handler)
    return () => {
      this.onConnectHandlers.delete(handler)
    }
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.onDisconnectHandlers.add(handler)
    return () => {
      this.onDisconnectHandlers.delete(handler)
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Singleton instance
export const orderWebSocket = new OrderWebSocket()

// Polling fallback for when WebSocket is not available
export class OrderPolling {
  private intervalId: ReturnType<typeof setInterval> | null = null
  private onUpdate: ((orders: Order[]) => void) | null = null
  private pollInterval = 10000 // 10 seconds

  start(onUpdate: (orders: Order[]) => void): void {
    this.onUpdate = onUpdate
    this.poll() // Initial poll
    this.intervalId = setInterval(() => this.poll(), this.pollInterval)
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.onUpdate = null
  }

  private async poll(): Promise<void> {
    try {
      const response = await fetch('/api/orders?status=pending,preparing,ready,out_for_delivery')
      if (response.ok) {
        const data = await response.json()
        this.onUpdate?.(data.data || data)
      }
    } catch (error) {
      console.error('[Polling] Failed to fetch orders:', error)
    }
  }

  setInterval(ms: number): void {
    this.pollInterval = ms
    if (this.intervalId && this.onUpdate) {
      this.stop()
      this.start(this.onUpdate)
    }
  }
}

export const orderPolling = new OrderPolling()

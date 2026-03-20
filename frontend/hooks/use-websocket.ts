'use client'

import { useEffect, useState, useCallback } from 'react'
import { orderWebSocket, orderPolling } from '@/lib/websocket'
import { useOrdersStore } from '@/stores/orders-store'
import type { WebSocketMessage, Order } from '@/types'

interface UseWebSocketOptions {
  enabled?: boolean
  fallbackToPolling?: boolean
  pollInterval?: number
}

export function useOrderWebSocket(options: UseWebSocketOptions = {}) {
  const { 
    enabled = true, 
    fallbackToPolling = true,
    pollInterval = 10000 
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [isUsingPolling, setIsUsingPolling] = useState(false)
  const updateOrderInList = useOrdersStore((state) => state.updateOrderInList)
  const fetchOrders = useOrdersStore((state) => state.fetchOrders)

  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (
      message.event === 'order_updated' ||
      message.event === 'order_status_changed' ||
      message.event === 'delivery_assigned'
    ) {
      updateOrderInList(message.data as Order)
    } else if (message.event === 'order_created') {
      // Refetch orders to include the new one
      fetchOrders()
    }
  }, [updateOrderInList, fetchOrders])

  const handlePollingUpdate = useCallback((orders: Order[]) => {
    orders.forEach((order) => updateOrderInList(order))
  }, [updateOrderInList])

  useEffect(() => {
    if (!enabled) return

    // Try WebSocket first
    let wsConnectionFailed = false

    const unsubConnect = orderWebSocket.onConnect(() => {
      setIsConnected(true)
      setIsUsingPolling(false)
    })

    const unsubDisconnect = orderWebSocket.onDisconnect(() => {
      setIsConnected(false)
      
      // Fallback to polling after WebSocket fails
      if (fallbackToPolling && !isUsingPolling) {
        wsConnectionFailed = true
        setIsUsingPolling(true)
        orderPolling.setInterval(pollInterval)
        orderPolling.start(handlePollingUpdate)
      }
    })

    const unsubMessage = orderWebSocket.onMessage(handleMessage)

    // Attempt WebSocket connection
    orderWebSocket.connect()

    // Fallback to polling if WebSocket doesn't connect within 5 seconds
    const fallbackTimeout = setTimeout(() => {
      if (!orderWebSocket.isConnected() && fallbackToPolling && !isUsingPolling) {
        wsConnectionFailed = true
        setIsUsingPolling(true)
        orderPolling.setInterval(pollInterval)
        orderPolling.start(handlePollingUpdate)
      }
    }, 5000)

    return () => {
      clearTimeout(fallbackTimeout)
      unsubConnect()
      unsubDisconnect()
      unsubMessage()
      orderWebSocket.disconnect()
      orderPolling.stop()
    }
  }, [enabled, fallbackToPolling, pollInterval, handleMessage, handlePollingUpdate, isUsingPolling])

  return {
    isConnected,
    isUsingPolling,
  }
}

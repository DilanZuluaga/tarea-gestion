'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { OrderWithDetails, OrderStatusHistory } from '@/lib/types'

export function useRealtimeOrder(orderId: string) {
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial order data
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant:restaurants(*),
          order_items(
            *,
            product:products(*)
          )
        `)
        .eq('id', orderId)
        .single()

      if (!error && data) {
        setOrder(data as unknown as OrderWithDetails)
      }

      // Fetch status history
      const { data: history } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true })

      if (history) {
        setStatusHistory(history)
      }

      setLoading(false)
    }

    fetchOrder()

    // Subscribe to order updates
    const orderChannel = supabase
      .channel(`order:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder((prev) => {
            if (!prev) return null
            return { ...prev, ...payload.new }
          })
        }
      )
      .subscribe()

    // Subscribe to status history updates
    const statusChannel = supabase
      .channel(`order_status:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_status_history',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          setStatusHistory((prev) => [...prev, payload.new as OrderStatusHistory])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(orderChannel)
      supabase.removeChannel(statusChannel)
    }
  }, [orderId])

  return { order, statusHistory, loading }
}

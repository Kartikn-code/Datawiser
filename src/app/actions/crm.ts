'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Customers

export async function getCustomers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('crm_customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }
  return data
}

export async function addCustomer(name: string, phone: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('crm_customers')
    .insert({ user_id: user.id, name, phone })
    .select()

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/crm')
  return { success: true, data }
}

// Transactions

export async function getCustomerTransactions(customerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('crm_transactions')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }
  return data
}

export async function addTransaction(customerId: string, amount: number, type: 'sale' | 'payment' | 'credit', description: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('crm_transactions')
    .insert({ user_id: user.id, customer_id: customerId, amount, type, description })
    .select()

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/crm')
  return { success: true, data }
}

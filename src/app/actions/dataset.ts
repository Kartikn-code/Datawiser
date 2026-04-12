'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadDataset(name: string, data: any[], headers: string[]) {
  const supabase = await createClient()

  // Ensure user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'You must be logged in to upload datasets' }
  }

  // Insert dataset
  const { data: insertedData, error } = await supabase
    .from('datasets')
    .insert({
      user_id: user.id,
      name,
      data,
      headers
    })
    .select('id')
    .single()

  if (error) {
    console.error('Insert error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, datasetId: insertedData.id }
}

export async function getDatasets() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('datasets')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fetch datasets error:', error)
    return []
  }

  return data
}

export async function getDatasetById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('datasets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Fetch dataset error:', error)
    return null
  }

  return data
}

export async function deleteDataset(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('datasets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Delete dataset error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

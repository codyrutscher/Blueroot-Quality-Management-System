import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Supplier {
  id: string
  name: string
  type: string
  approval_status: string
  created_at: string
  updated_at: string
}

export interface SupplierDocument {
  id: string
  supplier_id: string
  title: string
  description?: string
  file_name: string
  file_size: number
  file_type: string
  file_path: string
  uploaded_by: string
  uploaded_at: string
  created_at: string
  updated_at: string
}

// Helper functions for file operations
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<{ data: any; error: any }> => {
  return await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false
  })
}

export const downloadFile = async (
  bucket: string,
  path: string
): Promise<{ data: any; error: any }> => {
  return await supabase.storage.from(bucket).download(path)
}

export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export const deleteFile = async (
  bucket: string,
  path: string
): Promise<{ data: any; error: any }> => {
  return await supabase.storage.from(bucket).remove([path])
}
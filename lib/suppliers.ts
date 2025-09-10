import { supabase } from './supabase'

export interface SupplierData {
  name: string
  type: 'supplier' | 'co-man'
  approval_status: 'approved' | 'conditionally approved' | 'pending' | 'rejected'
}

// Function to fetch suppliers from Supabase
export const fetchSuppliersFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching suppliers:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return []
  }
}

// Function to sync suppliers from CSV to Supabase (one-time setup)
export const syncSuppliersFromCSV = async () => {
  try {
    // First, check if suppliers already exist
    const { data: existingSuppliers } = await supabase
      .from('suppliers')
      .select('name')

    if (existingSuppliers && existingSuppliers.length > 0) {
      console.log('Suppliers already exist in database')
      return { success: true, message: 'Suppliers already exist' }
    }

    // Fetch CSV data
    const response = await fetch('/suppliers - Sheet1.csv')
    const csvText = await response.text()
    const lines = csvText.trim().split('\n').filter(line => line.trim())

    const suppliersData: SupplierData[] = lines.map(line => {
      const columns = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          columns.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      columns.push(current.trim())

      const [name, type, approvalStatus] = columns
      return {
        name: name ? name.replace(/^"|"$/g, '') : '',
        type: (type ? type.replace(/^"|"$/g, '') : 'supplier') as 'supplier' | 'co-man',
        approval_status: (approvalStatus ? approvalStatus.replace(/^"|"$/g, '') : 'pending') as any
      }
    }).filter(supplier => supplier.name) // Filter out empty names

    // Insert suppliers into Supabase
    const { data, error } = await supabase
      .from('suppliers')
      .insert(suppliersData)
      .select()

    if (error) {
      console.error('Error inserting suppliers:', error)
      return { success: false, error: error.message }
    }

    console.log(`Successfully inserted ${data?.length || 0} suppliers`)
    return { success: true, data, message: `Inserted ${data?.length || 0} suppliers` }

  } catch (error) {
    console.error('Error syncing suppliers:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Function to get supplier by name
export const getSupplierByName = async (name: string) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('name', name)
      .single()

    if (error) {
      console.error('Error fetching supplier:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return null
  }
}
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MagnifyingGlassIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { fetchSuppliersFromDB, syncSuppliersFromCSV } from '../../lib/suppliers'
import { testSupabaseConnection, setupDatabase } from '../../lib/test-supabase'

interface Supplier {
  id: string
  name: string
  type: string
  approval_status: string
  created_at: string
  updated_at: string
}

interface SupplierIndexProps {
  onSupplierSelect: (supplierName: string) => void
}

export default function SupplierIndex({ onSupplierSelect }: SupplierIndexProps) {
  const { data: session } = useSession()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    approvalStatus: ''
  })
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      // Test Supabase connection first
      console.log('🔄 Testing Supabase connection...')
      const connectionTest = await testSupabaseConnection()
      
      if (!connectionTest.success) {
        console.warn('⚠️ Supabase connection failed, falling back to CSV:', connectionTest.error)
        return await fetchSuppliersFromCSV()
      }
      
      // Test database setup
      const dbTest = await setupDatabase()
      if (!dbTest.success) {
        console.warn('⚠️ Database setup issue, falling back to CSV:', dbTest.error)
        return await fetchSuppliersFromCSV()
      }
      
      // Fetch from Supabase
      let suppliersData = await fetchSuppliersFromDB()
      
      // If no suppliers in database, sync from CSV first
      if (suppliersData.length === 0) {
        console.log('📥 No suppliers found in database, syncing from CSV...')
        const syncResult = await syncSuppliersFromCSV()
        if (syncResult.success) {
          suppliersData = await fetchSuppliersFromDB()
          console.log('✅ Successfully synced suppliers to database!')
        } else {
          console.error('❌ Failed to sync suppliers:', syncResult.error)
          return await fetchSuppliersFromCSV()
        }
      }
      
      console.log(`✅ Loaded ${suppliersData.length} suppliers from Supabase database`)
      setSuppliers(suppliersData)
    } catch (error) {
      console.error('❌ Error with Supabase, falling back to CSV:', error)
      await fetchSuppliersFromCSV()
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliersFromCSV = async () => {
    try {
      const response = await fetch('/suppliers - Sheet1.csv')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const csvText = await response.text()
      
      const lines = csvText.trim().split('\n').filter(line => line.trim())
      const suppliersData = lines.map((line, index) => {
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
          id: `csv-${index}`,
          name: name ? name.replace(/^"|"$/g, '') : `Supplier ${index + 1}`,
          type: type ? type.replace(/^"|"$/g, '') : 'unknown',
          approval_status: approvalStatus ? approvalStatus.replace(/^"|"$/g, '') : 'unknown',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })
      
      console.log('Fallback: loaded suppliers from CSV:', suppliersData.length)
      setSuppliers(suppliersData)
    } catch (error) {
      console.error('Error fetching suppliers from CSV:', error)
      setSuppliers([])
    }
  }

  const filteredAndSortedSuppliers = () => {
    let filtered = suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.approval_status.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = !filters.type || supplier.type === filters.type
      const matchesStatus = !filters.approvalStatus || supplier.approval_status === filters.approvalStatus

      return matchesSearch && matchesType && matchesStatus
    })

    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Supplier] || ''
      const bValue = b[sortBy as keyof Supplier] || ''
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue)
      }
      return 0
    })

    return filtered
  }

  const filterOptions = {
    type: [...new Set(suppliers.map(s => s.type).filter(Boolean))],
    approvalStatus: [...new Set(suppliers.map(s => s.approval_status).filter(Boolean))]
  }

  const filteredSuppliers = filteredAndSortedSuppliers()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'conditionally approved':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'co-man':
        return 'bg-blue-100 text-blue-800'
      case 'supplier':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-700 to-blue-900 p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Suppliers...</h2>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-700 to-blue-900 p-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Supplier Directory</h2>
        <p className="text-gray-600">Manage approved suppliers and co-manufacturers</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers by name, type, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="type">Sort by Type</option>
            <option value="approvalStatus">Sort by Status</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Types</option>
            {filterOptions.type.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filters.approvalStatus}
            onChange={(e) => setFilters({...filters, approvalStatus: e.target.value})}
            className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Statuses</option>
            {filterOptions.approvalStatus.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setFilters({
                type: '',
                approvalStatus: ''
              })
              setSearchTerm('')
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
          >
            Clear All Filters
          </button>
        </div>

        {Object.values(filters).some(filter => filter !== '') && (
          <div className="flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
            <span className="font-medium">
              {Object.values(filters).filter(filter => filter !== '').length} active filters
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier, index) => (
          <button
            key={`${supplier.name}-${index}`}
            onClick={() => onSupplierSelect(supplier.name)}
            className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow text-left w-full"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {supplier.name}
                  </h3>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Type:</span>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeColor(supplier.type)}`}>
                  {supplier.type}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Status:</span>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(supplier.approval_status)}`}>
                  {supplier.approval_status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-600">Click to view details</span>
              <span className="text-xs text-blue-600 font-medium">View Details →</span>
            </div>
          </button>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      <div className="mt-6 bg-white rounded-lg shadow-lg p-4 text-sm text-gray-600 text-center">
        Showing {filteredSuppliers.length} of {suppliers.length} suppliers
      </div>
    </div>
  )
}
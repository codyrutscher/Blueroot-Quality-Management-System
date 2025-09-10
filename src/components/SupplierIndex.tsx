'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MagnifyingGlassIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'

interface Supplier {
  name: string
  type: string
  approvalStatus: string
}

export default function SupplierIndex() {
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
      const response = await fetch('/suppliers - Sheet1.csv')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const csvText = await response.text()
      console.log('Raw CSV text:', csvText.substring(0, 200) + '...')
      
      const lines = csvText.trim().split('\n').filter(line => line.trim())
      console.log('Number of lines:', lines.length)
      
      const suppliersData = lines.map((line, index) => {
        // Handle CSV parsing with proper quote handling
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
        const supplier = {
          name: name ? name.replace(/^"|"$/g, '') : `Supplier ${index + 1}`,
          type: type ? type.replace(/^"|"$/g, '') : 'unknown',
          approvalStatus: approvalStatus ? approvalStatus.replace(/^"|"$/g, '') : 'unknown'
        }
        
        if (index < 5) {
          console.log(`Supplier ${index + 1}:`, supplier)
        }
        
        return supplier
      })
      
      console.log('Total suppliers loaded:', suppliersData.length)
      setSuppliers(suppliersData)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      // Set some dummy data for debugging
      setSuppliers([
        { name: 'Test Supplier 1', type: 'supplier', approvalStatus: 'approved' },
        { name: 'Test Co-man 1', type: 'co-man', approvalStatus: 'conditionally approved' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedSuppliers = () => {
    let filtered = suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.approvalStatus.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = !filters.type || supplier.type === filters.type
      const matchesStatus = !filters.approvalStatus || supplier.approvalStatus === filters.approvalStatus

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
    approvalStatus: [...new Set(suppliers.map(s => s.approvalStatus).filter(Boolean))]
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
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading suppliers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Supplier Directory</h2>
        <p className="text-gray-600">Manage approved suppliers and co-manufacturers</p>
      </div>

      <div className="mb-6 space-y-4">
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
          <div
            key={`${supplier.name}-${index}`}
            className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
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
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(supplier.approvalStatus)}`}>
                  {supplier.approvalStatus}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600 text-center">
        Showing {filteredSuppliers.length} of {suppliers.length} suppliers
      </div>
    </div>
  )
}
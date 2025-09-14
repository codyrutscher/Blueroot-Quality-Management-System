'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MagnifyingGlassIcon, BeakerIcon } from '@heroicons/react/24/outline'

interface RawMaterial {
  id: string
  item: string
  description: string
}

export default function RawMaterials() {
  const { data: session } = useSession()
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('item')

  useEffect(() => {
    fetchRawMaterials()
  }, [])

  const fetchRawMaterials = async () => {
    try {
      const response = await fetch('/rawmaterials.csv')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const csvText = await response.text()
      const lines = csvText.trim().split('\n').filter(line => line.trim())
      
      // Skip header row and parse data
      const rawMaterialsData = lines.slice(1).map((line, index) => {
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
        
        const [item, description] = columns
        return {
          id: `rm-${index}`,
          item: item ? item.replace(/^"|"$/g, '') : '',
          description: description ? description.replace(/^"|"$/g, '') : ''
        }
      }).filter(rm => rm.item) // Filter out entries without item codes
      
      // Remove duplicates based on item code
      const uniqueRawMaterials = rawMaterialsData.reduce((acc, current) => {
        const existing = acc.find(rm => rm.item === current.item)
        if (!existing) {
          acc.push(current)
        }
        return acc
      }, [] as RawMaterial[])
      
      console.log(`Loaded ${uniqueRawMaterials.length} unique raw materials`)
      setRawMaterials(uniqueRawMaterials)
    } catch (error) {
      console.error('Error fetching raw materials:', error)
      setRawMaterials([])
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedRawMaterials = () => {
    let filtered = rawMaterials.filter(rm => {
      const matchesSearch = rm.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rm.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })

    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof RawMaterial] || ''
      const bValue = b[sortBy as keyof RawMaterial] || ''
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue)
      }
      return 0
    })

    return filtered
  }

  const filteredRawMaterials = filteredAndSortedRawMaterials()

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading raw materials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-700 to-blue-900 p-6">
      {/* Description */}
      <div className="mb-6">
        <p className="text-white">Manage quality documentation for raw materials and ingredients</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 space-y-4">

        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search raw materials by item code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="item">Sort by Item Code</option>
            <option value="description">Sort by Description</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('')
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
          >
            Clear Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRawMaterials.map((rawMaterial) => (
          <div
            key={rawMaterial.id}
            className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <BeakerIcon className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm font-mono">
                    {rawMaterial.item}
                  </h3>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div>
                <span className="text-gray-500 text-xs block mb-1">Description:</span>
                <span className="text-black text-sm leading-relaxed">
                  {rawMaterial.description}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRawMaterials.length === 0 && !loading && (
        <div className="text-center py-12">
          <BeakerIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No raw materials found</h3>
          <p className="text-gray-600">Try adjusting your search criteria.</p>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600 text-center">
        Showing {filteredRawMaterials.length} of {rawMaterials.length} raw materials
      </div>
    </div>
  )
}
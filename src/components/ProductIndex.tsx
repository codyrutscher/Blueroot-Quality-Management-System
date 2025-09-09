'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MagnifyingGlassIcon, DocumentIcon, BeakerIcon } from '@heroicons/react/24/outline'

interface Product {
  id: string
  brand: string
  sku: string
  productName: string
  healthCategory?: string
  therapeuticPlatform?: string
  nutrientType?: string
  format?: string
  unitCount: number
  manufacturer?: string
  containsIron: boolean
  documents: any[]
}

interface ProductIndexProps {
  onProductSelect: (sku: string) => void
}

export default function ProductIndex({ onProductSelect }: ProductIndexProps) {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      // Try debug endpoint first, then fall back to regular API
      let response = await fetch('/api/debug/products')
      if (!response.ok) {
        response = await fetch('/api/products')
      }
      const data = await response.json()
      console.log('Products data:', data) // Debug log
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || product.healthCategory === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(products.map(p => p.healthCategory).filter(Boolean))]

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Directory</h2>
        <p className="text-gray-600">Manage quality documentation for all products</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => onProductSelect(product.sku)}
            className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow text-left w-full"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <BeakerIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {product.productName}
                  </h3>
                  <p className="text-xs text-gray-600 font-mono">{product.sku}</p>
                </div>
              </div>
              {product.containsIron && (
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                  Iron
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Brand:</span>
                <span className="font-medium text-black">{product.brand}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Format:</span>
                <span className="font-medium text-black">{product.format}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Count:</span>
                <span className="font-medium text-black">{product.unitCount}</span>
              </div>
              {product.healthCategory && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium text-black text-xs">{product.healthCategory}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-600">
                <DocumentIcon className="h-4 w-4 mr-1" />
                {product.documents.length} documents
              </div>
              <span className="text-xs text-blue-600 font-medium">View Details →</span>
            </div>
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <BeakerIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600 text-center">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  )
}
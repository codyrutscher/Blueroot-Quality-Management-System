'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

interface SearchResult {
  type: 'document' | 'product' | 'template'
  document?: {
    id: string
    title: string
    filename: string
    category: string
    createdAt: string
    user: {
      name: string
    }
    product?: {
      productName: string
      sku: string
    }
    template?: {
      name: string
      type: string
    }
  }
  product?: {
    id: string
    productName: string
    sku: string
    brand: string
    healthCategory?: string
    manufacturer?: string
    format?: string
  }
  template?: {
    id: string
    name: string
    type: string
    description?: string
    creator: {
      name: string
    }
  }
  score: number
  relevantChunk?: string
}

export default function SearchInterface() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [aiResponse, setAiResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          chatMode: true, // Always use AI chat mode
        }),
      })

      const data = await response.json()
      setResults(data.results || [])
      setAiResponse(data.aiResponse || '')
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">AI-Powered Search</h2>
            <p className="text-slate-600 mt-1">Search products, documents, forms, and get AI-powered insights</p>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search products, documents, or ask AI: 'What are the safety requirements for Product X?'"
            className="w-full px-6 py-4 pr-16 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg text-black placeholder-slate-400 form-input"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl disabled:opacity-50 btn-primary shadow-lg"
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-200 border-t-blue-600"></div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Generating AI Response...
          </h3>
          <p className="text-slate-600">
            Our AI is analyzing your products, documents, and forms to provide the best answer
          </p>
        </div>
      )}

      {aiResponse && (
        <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
          <div className="flex items-start space-x-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-xl">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <h3 className="font-bold text-blue-900 text-lg">AI Response:</h3>
          </div>
          <div className="text-slate-800 whitespace-pre-wrap leading-relaxed pl-11">{aiResponse}</div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              Related Results
            </h3>
            <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {results.length} {results.length === 1 ? 'result' : 'results'} found
            </div>
          </div>
          {results.map((result, index) => {
            const getResultId = () => {
              if (result.type === 'product') return result.product?.id
              if (result.type === 'template') return result.template?.id
              return result.document?.id
            }
            
            const getResultTitle = () => {
              if (result.type === 'product') return result.product?.productName
              if (result.type === 'template') return result.template?.name
              return result.document?.title
            }

            const getResultCategory = () => {
              if (result.type === 'product') return 'Product'
              if (result.type === 'template') return 'Template'
              return result.document?.category || 'Document'
            }

            const getCategoryColor = () => {
              if (result.type === 'product') return 'bg-purple-100 text-purple-700'
              if (result.type === 'template') return 'bg-green-100 text-green-700'
              return 'bg-blue-100 text-blue-700'
            }

            return (
              <div key={`${result.type}-${getResultId()}`} className="border-2 border-slate-200 rounded-2xl p-6 hover:border-blue-300 transition-all duration-200 card bg-white">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-slate-900 text-lg leading-tight">
                    {getResultTitle()}
                  </h4>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-slate-600 font-medium">{(result.score * 100).toFixed(1)}% match</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full font-semibold ${getCategoryColor()}`}>
                      {getResultCategory()}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-slate-600 mb-4 flex items-center space-x-4">
                  {result.type === 'product' && result.product ? (
                    <>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
                        </svg>
                        {result.product.sku}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                        </svg>
                        {result.product.brand}
                      </span>
                      {result.product.healthCategory && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12,2L13.09,8.26L19,7L17.74,13.09L24,12L18.26,17.74L19,24L13.09,17.74L12,24L8.91,17.74L3,19L4.26,13.09L-2,12L3.74,8.91L3,2L8.91,4.26L12,2Z"/>
                          </svg>
                          {result.product.healthCategory}
                        </span>
                      )}
                    </>
                  ) : result.type === 'template' && result.template ? (
                    <>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        {result.template.creator.name}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                        {result.template.type.replace(/_/g, ' ').toLowerCase()}
                      </span>
                      {result.template.description && (
                        <span className="flex items-center truncate max-w-xs">
                          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
                          </svg>
                          {result.template.description}
                        </span>
                      )}
                    </>
                  ) : result.document ? (
                    <>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        {result.document.user.name}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                        {result.document.filename}
                      </span>
                    </>
                  ) : null}
                </div>
                {result.relevantChunk && (
                  <div className="bg-slate-50 border-l-4 border-blue-500 p-4 rounded-lg">
                    <h5 className="font-semibold text-slate-900 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"/>
                      </svg>
                      Relevant Excerpt
                    </h5>
                    <p className="text-slate-700 leading-relaxed italic">{result.relevantChunk}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {query && !loading && results.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Results Found</h3>
          <p className="text-slate-600">
            No documents found matching your search. Try different keywords or check your spelling.
          </p>
        </div>
      )}
    </div>
  )
}
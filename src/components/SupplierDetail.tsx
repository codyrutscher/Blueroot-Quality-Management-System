'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ArrowLeftIcon, DocumentIcon, BuildingOfficeIcon, CalendarIcon, UserIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { getSupplierByName } from '../../lib/suppliers'

interface Supplier {
  name: string
  type: string
  approvalStatus: string
}

interface SupplierDocument {
  id: string
  title: string
  description?: string
  fileName: string
  fileSize: number
  uploadDate: string
  uploader: string
  fileType: string
  fileData?: string // Base64 encoded file data (localStorage)
  filePath?: string // Supabase Storage file path
}

interface SupplierDetailProps {
  supplierName: string
  onBack: () => void
}

export default function SupplierDetail({ supplierName, onBack }: SupplierDetailProps) {
  const { data: session } = useSession()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [documents, setDocuments] = useState<SupplierDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSupplierDetails()
    fetchSupplierDocuments()
  }, [supplierName])

  // Listen for custom events and storage changes to refresh documents when new ones are uploaded
  useEffect(() => {
    const handleDocumentUpdate = (event: CustomEvent) => {
      if (event.detail.supplier === supplierName) {
        fetchSupplierDocuments()
      }
    }
    
    const handleStorageChange = () => {
      fetchSupplierDocuments()
    }
    
    window.addEventListener('supplierDocumentsUpdated', handleDocumentUpdate as EventListener)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('supplierDocumentsUpdated', handleDocumentUpdate as EventListener)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [supplierName])

  const fetchSupplierDetails = async () => {
    try {
      const response = await fetch('/suppliers - Sheet1.csv')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const csvText = await response.text()
      const lines = csvText.trim().split('\n').filter(line => line.trim())
      
      const suppliersData = lines.map((line) => {
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
          type: type ? type.replace(/^"|"$/g, '') : 'unknown',
          approvalStatus: approvalStatus ? approvalStatus.replace(/^"|"$/g, '') : 'unknown'
        }
      })
      
      const foundSupplier = suppliersData.find(s => s.name === supplierName)
      setSupplier(foundSupplier || null)
    } catch (error) {
      console.error('Error fetching supplier details:', error)
    }
  }

  const fetchSupplierDocuments = async () => {
    try {
      let documents: SupplierDocument[] = []
      
      // Try to fetch from Supabase first
      try {
        const supplier = await getSupplierByName(supplierName)
        if (supplier) {
          console.log(`📥 Fetching documents for supplier: ${supplierName} (ID: ${supplier.id})`)
          
          // First try to get supplier-specific documents
          const supplierResponse = await fetch(`/api/documents/by-association?type=supplier&id=${supplier.id}`)
          
          if (supplierResponse.ok) {
            const supplierData = await supplierResponse.json()
            documents.push(...supplierData.documents.map((doc: any) => ({
              id: doc.id,
              title: doc.filename,
              description: doc.document_type,
              fileName: doc.filename,
              fileSize: doc.file_size,
              uploadDate: doc.uploaded_at ? doc.uploaded_at.split('T')[0] : new Date().toISOString().split('T')[0],
              uploader: 'System',
              fileType: doc.file_type,
              fileData: undefined,
              filePath: doc.storage_path
            })))
          }
          
          // Then get all documents uploaded to the suppliers destination
          const generalResponse = await fetch(`/api/documents/by-association?type=supplier&id=general`)
          
          if (generalResponse.ok) {
            const generalData = await generalResponse.json()
            // Add general supplier documents that aren't already included
            const newDocs = generalData.documents.filter((doc: any) => 
              !documents.some(existing => existing.id === doc.id)
            ).map((doc: any) => ({
              id: doc.id,
              title: doc.filename,
              description: doc.document_type,
              fileName: doc.filename,
              fileSize: doc.file_size,
              uploadDate: doc.uploaded_at ? doc.uploaded_at.split('T')[0] : new Date().toISOString().split('T')[0],
              uploader: 'System',
              fileType: doc.file_type,
              fileData: undefined,
              filePath: doc.storage_path
            }))
            documents.push(...newDocs)
          }
          
          console.log(`✅ Found ${documents.length} documents for ${supplierName}`)
        }
      } catch (supabaseError) {
        console.warn('⚠️ Supabase fetch failed, checking localStorage:', supabaseError)
      }
      
      // Also check localStorage for fallback documents
      try {
        const allSupplierDocs = localStorage.getItem('supplierDocuments')
        const supplierDocs = allSupplierDocs ? JSON.parse(allSupplierDocs) : {}
        const localDocuments = supplierDocs[supplierName] || []
        
        if (localDocuments.length > 0) {
          console.log(`📦 Found ${localDocuments.length} documents in localStorage for ${supplierName}`)
          
          // Transform localStorage documents to match interface
          const transformedLocalDocs = localDocuments.map((doc: any) => ({
            id: doc.id,
            title: doc.title,
            description: doc.description,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            uploadDate: doc.uploadDate,
            uploader: doc.uploader,
            fileType: doc.fileType,
            fileData: doc.fileData, // localStorage documents have base64 data
            filePath: undefined // localStorage documents don't have file paths
          }))
          
          // Combine with Supabase documents (avoid duplicates by ID)
          const existingIds = new Set(documents.map(d => d.id))
          const newLocalDocs = transformedLocalDocs.filter((doc: any) => !existingIds.has(doc.id))
          documents = [...documents, ...newLocalDocs]
        }
      } catch (localError) {
        console.warn('⚠️ localStorage fetch failed:', localError)
      }
      
      setDocuments(documents)
      console.log(`📄 Total documents found for ${supplierName}: ${documents.length}`)
      
    } catch (error) {
      console.error('❌ Error fetching supplier documents:', error)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDocumentDownload = async (document: SupplierDocument) => {
    try {
      console.log(`🔽 Downloading document: ${document.fileName}`)
      
      // Check if it's a Supabase document (has filePath)
      if (document.filePath) {
        console.log(`📁 Downloading from Supabase Storage: ${document.filePath}`)
        
        try {
          // Download from Supabase Storage
          const { data, error } = await supabase.storage
            .from('supplier-documents')
            .download(document.filePath)

          if (error) {
            throw new Error(`Supabase download failed: ${error.message}`)
          }

          // Create download link
          const url = URL.createObjectURL(data)
          const link = window.document.createElement('a')
          link.href = url
          link.download = document.fileName
          window.document.body.appendChild(link)
          link.click()
          
          // Cleanup
          window.document.body.removeChild(link)
          URL.revokeObjectURL(url)
          
          console.log(`✅ Downloaded from Supabase: ${document.fileName}`)
          return
          
        } catch (supabaseError) {
          console.error('❌ Supabase download failed:', supabaseError)
          alert(`Download failed: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`)
          return
        }
      }
      
      // Check if it's a localStorage document (has fileData)
      if (document.fileData) {
        console.log(`💾 Downloading from localStorage: ${document.fileName}`)
        
        try {
          // Convert base64 data URL back to blob
          const response = await fetch(document.fileData)
          const blob = await response.blob()
          
          // Create download link
          const url = URL.createObjectURL(blob)
          const link = window.document.createElement('a')
          link.href = url
          link.download = document.fileName
          window.document.body.appendChild(link)
          link.click()
          
          // Cleanup
          window.document.body.removeChild(link)
          URL.revokeObjectURL(url)
          
          console.log(`✅ Downloaded from localStorage: ${document.fileName}`)
          return
          
        } catch (localError) {
          console.error('❌ localStorage download failed:', localError)
          alert(`Download failed: ${localError instanceof Error ? localError.message : 'Unknown error'}`)
          return
        }
      }
      
      // No file data available
      console.warn('⚠️ No file data available for download')
      alert('This document has no file data and cannot be downloaded. It may be a metadata-only entry.')
      
    } catch (error) {
      console.error('❌ Download error:', error)
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading supplier details...</p>
        </div>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Supplier not found</h3>
          <p className="text-gray-600 mb-4">The requested supplier could not be found.</p>
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Suppliers
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Suppliers
        </button>
        
        <div className="flex items-center mb-4">
          <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
            <div className="flex gap-2 mt-2">
              <span className={`px-3 py-1 text-sm rounded-full font-medium ${getTypeColor(supplier.type)}`}>
                {supplier.type}
              </span>
              <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(supplier.approvalStatus)}`}>
                {supplier.approvalStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Documents ({documents.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              All documents uploaded for {supplier.name}
            </p>
          </div>
          <button
            onClick={fetchSupplierDocuments}
            className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Refresh
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="p-12 text-center">
            <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-600">
              Documents uploaded for this supplier will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {documents.map((document) => (
              <div
                key={document.id}
                className="p-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleDocumentDownload(document)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <DocumentIcon className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {document.title}
                      </h3>
                      {document.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {document.description}
                        </p>
                      )}
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span className="font-mono">{document.fileName}</span>
                        <span>{formatFileSize(document.fileSize)}</span>
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {formatDate(document.uploadDate)}
                        </div>
                        <div className="flex items-center">
                          <UserIcon className="h-3 w-3 mr-1" />
                          {document.uploader}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="text-xs text-blue-600 font-medium hover:text-blue-800">
                      Download →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
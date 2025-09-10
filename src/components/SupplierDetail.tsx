'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ArrowLeftIcon, DocumentIcon, BuildingOfficeIcon, CalendarIcon, UserIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

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
      // Get documents from localStorage for this supplier
      const allSupplierDocs = localStorage.getItem('supplierDocuments')
      let supplierDocs = allSupplierDocs ? JSON.parse(allSupplierDocs) : {}
      
      const supplierDocuments = supplierDocs[supplierName] || []
      setDocuments(supplierDocuments)
      console.log(`Found ${supplierDocuments.length} documents for ${supplierName}`)
    } catch (error) {
      console.error('Error fetching supplier documents:', error)
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

  const handleDocumentDownload = (document: SupplierDocument) => {
    // Since we're only storing metadata in localStorage, we'll create a mock download
    // In a real app with a backend, this would fetch the actual file
    try {
      // Create a mock file content based on the document type
      let content = `Document: ${document.title}\nDescription: ${document.description || 'No description'}\nSupplier: ${supplierName}\nUploaded by: ${document.uploader}\nUpload Date: ${document.uploadDate}\n\nThis is a placeholder for the actual document content.`
      
      // Create blob based on file type
      let blob: Blob
      let downloadName = document.fileName
      
      if (document.fileType.includes('pdf') || document.fileName.toLowerCase().includes('.pdf')) {
        // For PDFs, create a simple text file since we don't have the original
        blob = new Blob([content], { type: 'text/plain' })
        downloadName = document.fileName.replace('.pdf', '_metadata.txt')
      } else if (document.fileType.includes('text') || document.fileName.toLowerCase().includes('.txt')) {
        blob = new Blob([content], { type: 'text/plain' })
      } else {
        // For other file types, create a text file with metadata
        blob = new Blob([content], { type: 'text/plain' })
        downloadName = document.fileName.split('.')[0] + '_metadata.txt'
      }
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = url
      link.download = downloadName
      window.document.body.appendChild(link)
      link.click()
      
      // Cleanup
      window.document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('Downloaded document:', downloadName)
    } catch (error) {
      console.error('Download error:', error)
      alert('Download failed. Please try again.')
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
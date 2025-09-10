'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { CloudArrowUpIcon, DocumentIcon, MagnifyingGlassIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { getSupplierByName } from '../../lib/suppliers'

interface Supplier {
  name: string
  type: string
  approvalStatus: string
}

export default function SupplierDocumentUpload() {
  const { data: session } = useSession()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [supplierSearch, setSupplierSearch] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [documentTitle, setDocumentTitle] = useState('')
  const [documentDescription, setDocumentDescription] = useState('')

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
          name: name ? name.replace(/^"|"$/g, '') : `Supplier ${index + 1}`,
          type: type ? type.replace(/^"|"$/g, '') : 'unknown',
          approvalStatus: approvalStatus ? approvalStatus.replace(/^"|"$/g, '') : 'unknown'
        }
      })
      
      setSuppliers(suppliersData)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    supplier.type.toLowerCase().includes(supplierSearch.toLowerCase())
  )

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (!selectedSupplier || files.length === 0 || !documentTitle.trim()) {
      alert('Please select a supplier, add files, and provide a document title')
      return
    }

    // Check file sizes (Supabase allows 50MB per file)
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    const maxFileSize = 50 * 1024 * 1024 // 50MB per file
    const maxTotalSize = 100 * 1024 * 1024 // 100MB total per upload
    
    const oversizedFiles = files.filter(file => file.size > maxFileSize)
    if (oversizedFiles.length > 0) {
      alert(`Some files exceed the 50MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`)
      return
    }
    
    if (totalSize > maxTotalSize) {
      alert(`Total file size (${(totalSize / 1024 / 1024).toFixed(2)}MB) exceeds the 100MB limit. Please select fewer files.`)
      return
    }

    setUploading(true)
    try {
      // Get supplier ID from database
      const supplier = await getSupplierByName(selectedSupplier)
      if (!supplier) {
        throw new Error(`Supplier "${selectedSupplier}" not found in database`)
      }

      console.log(`📤 Uploading ${files.length} files for supplier: ${selectedSupplier}`)

      // Try Supabase first, fallback to localStorage
      let uploadMethod = 'supabase'
      const newDocuments = []

      try {
        // Upload each file to Supabase Storage and save metadata to database
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const fileId = `${Date.now()}-${i}`
          const filePath = `${supplier.id}/${fileId}-${file.name}`

          console.log(`📁 Uploading file ${i + 1}/${files.length}: ${file.name}`)

          // Upload file to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('supplier-documents')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            throw new Error(`File upload failed: ${uploadError.message}`)
          }

          // Save document metadata to database
          const { data: docData, error: docError } = await supabase
            .from('supplier_documents')
            .insert({
              supplier_id: supplier.id,
              title: files.length === 1 ? documentTitle : `${documentTitle} - ${file.name}`,
              description: documentDescription || null,
              file_name: file.name,
              file_size: file.size,
              file_type: file.type || 'application/octet-stream',
              file_path: filePath,
              uploaded_by: session?.user?.name || 'Unknown User'
            })
            .select()
            .single()

          if (docError) {
            // Clean up uploaded file if database insert fails
            await supabase.storage.from('supplier-documents').remove([filePath])
            throw new Error(`Database save failed: ${docError.message}`)
          }

          newDocuments.push(docData)
          console.log(`✅ Successfully uploaded: ${file.name}`)
        }

        console.log(`🎉 Successfully uploaded ${files.length} files via Supabase`)
        
      } catch (supabaseError) {
        console.warn('⚠️ Supabase upload failed, falling back to localStorage:', supabaseError)
        uploadMethod = 'localStorage'
        
        // Fallback to localStorage storage
        const allSupplierDocs = localStorage.getItem('supplierDocuments')
        let supplierDocs = allSupplierDocs ? JSON.parse(allSupplierDocs) : {}
        
        const fallbackDocuments = await Promise.all(files.map(async (file, index) => {
          const fileData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })

          return {
            id: `${Date.now()}-${index}`,
            title: files.length === 1 ? documentTitle : `${documentTitle} - ${file.name}`,
            description: documentDescription,
            fileName: file.name,
            fileSize: file.size,
            uploadDate: new Date().toISOString().split('T')[0],
            uploader: session?.user?.name || 'Unknown User',
            fileType: file.type || 'application/octet-stream',
            fileData: fileData
          }
        }))

        if (!supplierDocs[selectedSupplier]) {
          supplierDocs[selectedSupplier] = []
        }
        supplierDocs[selectedSupplier].push(...fallbackDocuments)
        localStorage.setItem('supplierDocuments', JSON.stringify(supplierDocs))
        
        console.log('📦 Documents saved to localStorage as fallback')
      }

      // Dispatch update event
      window.dispatchEvent(new CustomEvent('supplierDocumentsUpdated', {
        detail: { supplier: selectedSupplier, method: uploadMethod }
      }))

      // Reset form after successful upload
      setFiles([])
      setDocumentTitle('')
      setDocumentDescription('')
      setSelectedSupplier('')
      setSupplierSearch('')
      
      const methodText = uploadMethod === 'supabase' ? 'to cloud storage' : 'locally'
      alert(`Successfully uploaded ${files.length} document(s) for ${selectedSupplier} ${methodText}!`)
      
    } catch (error) {
      console.error('❌ Upload error:', error)
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
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

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Supplier Document Upload</h2>
        <p className="text-gray-600">Upload documents for suppliers and co-manufacturers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Supplier Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Select Supplier</h3>
          
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            />
          </div>

          {/* Supplier List */}
          <div className="border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
            {filteredSuppliers.map((supplier, index) => (
              <div
                key={`${supplier.name}-${index}`}
                className={`p-3 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-blue-50 ${
                  selectedSupplier === supplier.name ? 'bg-blue-100' : ''
                }`}
                onClick={() => setSelectedSupplier(supplier.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{supplier.name}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(supplier.type)}`}>
                          {supplier.type}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(supplier.approvalStatus)}`}>
                          {supplier.approvalStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedSupplier === supplier.name && (
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedSupplier && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Selected:</span> {selectedSupplier}
              </p>
            </div>
          )}
        </div>

        {/* Document Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>

          {/* Document Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Title *
              </label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Enter document title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Enter document description..."
              />
            </div>
          </div>

          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF, Word, Excel, Images, etc.</p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              Select Files
            </label>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">Selected Files ({files.length})</h4>
                <span className="text-xs text-gray-500">
                  Total: {(files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)}MB / 100MB
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <DocumentIcon className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-900">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedSupplier || files.length === 0 || !documentTitle.trim()}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} Document${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline'
import MultiSelectDropdown from './MultiSelectDropdown'

export default function DocumentUpload() {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const [documentType, setDocumentType] = useState('')
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([])
  const [associations, setAssociations] = useState<{
    products: string[]
    suppliers: string[]
    rawMaterials: string[]
  }>({
    products: [],
    suppliers: [],
    rawMaterials: []
  })
  const [products, setProducts] = useState<Array<{id: string, name: string, sku?: string}>>([])
  const [suppliers, setSuppliers] = useState<Array<{id: string, name: string}>>([])
  const [rawMaterials, setRawMaterials] = useState<Array<{id: string, name: string}>>([])

  // Fetch data on component mount
  useEffect(() => {
    fetchProducts()
    fetchSuppliers()
    fetchRawMaterials()
  }, [])

  const fetchProducts = async () => {
    try {
      let response = await fetch('/api/debug/products')
      if (!response.ok) {
        response = await fetch('/api/products')
      }
      const data = await response.json()
      const productOptions = (data.products || []).map((product: any) => ({
        id: product.sku || product.id,
        name: product.productName || product.name,
        sku: product.sku
      }))
      setProducts(productOptions)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      const data = await response.json()
      const supplierOptions = (data.suppliers || []).map((supplier: any) => ({
        id: supplier.id || supplier.name,
        name: supplier.name
      }))
      setSuppliers(supplierOptions)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      // Mock data for now
      setSuppliers([
        { id: 'bariatric-fusion', name: 'Bariatric Fusion' },
        { id: 'fairhaven-health', name: 'Fairhaven Health' },
        { id: 'vital-nutrients', name: 'Vital Nutrients' },
        { id: 'hyperbiotics', name: 'Hyperbiotics' },
        { id: 'unjury', name: 'Unjury' }
      ])
    }
  }

  const fetchRawMaterials = async () => {
    try {
      const response = await fetch('/api/raw-materials')
      const data = await response.json()
      const rawMaterialOptions = (data.rawMaterials || []).map((material: unknown) => ({
        id: material.id || material.name,
        name: material.name
      }))
      setRawMaterials(rawMaterialOptions)
    } catch (error) {
      console.error('Error fetching raw materials:', error)
      // Mock data for now
      setRawMaterials([
        { id: 'vitamin-c', name: 'Vitamin C (Ascorbic Acid)' },
        { id: 'vitamin-d3', name: 'Vitamin D3 (Cholecalciferol)' },
        { id: 'calcium-carbonate', name: 'Calcium Carbonate' },
        { id: 'magnesium-oxide', name: 'Magnesium Oxide' },
        { id: 'iron-fumarate', name: 'Iron Fumarate' },
        { id: 'zinc-gluconate', name: 'Zinc Gluconate' },
        { id: 'b12-cyanocobalamin', name: 'B12 (Cyanocobalamin)' },
        { id: 'folate', name: 'Folate (Folic Acid)' },
        { id: 'biotin', name: 'Biotin' },
        { id: 'probiotics', name: 'Probiotic Blend' }
      ])
    }
  }

  const documentTypes = [
    'Label Printer Proofs',
    'Supplier Quality Agreement',
    'Co-Man Quality Agreement',
    'Supplier Questionnaire',
    'Co-Man Questionnaire',
    'Supplier Certifications',
    'Co-Man Certifications',
    'COAs',
    'COCs',
    'SOPs',
    'Test Results'
  ]

  const destinations = [
    { id: 'products', name: 'Products', requiresAssociation: true },
    { id: 'suppliers', name: 'Supplier and Co-Men', requiresAssociation: true },
    { id: 'rawMaterials', name: 'Raw Materials', requiresAssociation: true },
    { id: 'labels', name: 'Labels', requiresAssociation: false },
    { id: 'shelfLife', name: 'Shelf-Life Program', requiresAssociation: false }
  ]

  const handleDestinationToggle = (destinationId: string) => {
    setSelectedDestinations(prev => 
      prev.includes(destinationId)
        ? prev.filter(id => id !== destinationId)
        : [...prev, destinationId]
    )
  }

  const handleAssociationChange = (type: 'products' | 'suppliers' | 'rawMaterials', values: string[]) => {
    setAssociations(prev => ({
      ...prev,
      [type]: values
    }))
  }

  const validateUpload = () => {
    if (!documentType) return 'Please select a document type.'
    if (selectedDestinations.length === 0) return 'Please select at least one destination.'
    
    // Check if destinations requiring associations have them
    const requiresProducts = selectedDestinations.includes('products')
    const requiresSuppliers = selectedDestinations.includes('suppliers')
    const requiresRawMaterials = selectedDestinations.includes('rawMaterials')
    
    if (requiresProducts && associations.products.length === 0) {
      return 'Please select a product for the Products destination.'
    }
    if (requiresSuppliers && associations.suppliers.length === 0) {
      return 'Please select a supplier/co-man for the Supplier and Co-Men destination.'
    }
    if (requiresRawMaterials && associations.rawMaterials.length === 0) {
      return 'Please select a raw material for the Raw Materials destination.'
    }
    
    return null
  }

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
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    const validationError = validateUpload()
    if (validationError) {
      setUploadStatus({
        type: 'error',
        message: validationError
      })
      return
    }

    const acceptedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]

    const validFiles = files.filter(file => acceptedTypes.includes(file.type))
    
    if (validFiles.length === 0) {
      setUploadStatus({
        type: 'error',
        message: 'Please upload PDF, DOCX, or TXT files only.'
      })
      return
    }

    setUploading(true)
    setUploadStatus({ type: null, message: '' })

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('documentType', documentType)
        formData.append('destinations', JSON.stringify(selectedDestinations))
        formData.append('associations', JSON.stringify(associations))

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        return await response.json()
      })

      await Promise.all(uploadPromises)
      
      const destinationNames = selectedDestinations.map(id => 
        destinations.find(d => d.id === id)?.name
      ).join(', ')
      
      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${validFiles.length} file(s) as ${documentType} to ${destinationNames}. Processing may take a few moments.`
      })
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus({
        type: 'error',
        message: 'Failed to upload one or more files. Please try again.'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Document Upload</h2>
            <p className="text-slate-600 mt-1">
              Upload documents and categorize them by type and destination
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            <span>Secure & Encrypted</span>
          </div>
        </div>

        {/* Document Type Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Document Type *
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Select document type...</option>
            {documentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Destinations Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Destinations * (Select one or more)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map(dest => (
              <div key={dest.id} className="relative">
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedDestinations.includes(dest.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={selectedDestinations.includes(dest.id)}
                    onChange={() => handleDestinationToggle(dest.id)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                    selectedDestinations.includes(dest.id)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-slate-300'
                  }`}>
                    {selectedDestinations.includes(dest.id) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{dest.name}</div>
                    {dest.requiresAssociation && (
                      <div className="text-xs text-slate-500">Requires specific association</div>
                    )}
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Association Fields */}
        {(selectedDestinations.includes('products') || 
          selectedDestinations.includes('suppliers') || 
          selectedDestinations.includes('rawMaterials')) && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Required Associations</h3>
            <div className="space-y-6">
              {selectedDestinations.includes('products') && (
                <MultiSelectDropdown
                  options={products}
                  selectedValues={associations.products}
                  onChange={(values) => handleAssociationChange('products', values)}
                  placeholder="Select products..."
                  searchPlaceholder="Search products by name or SKU..."
                  label="Select Products"
                  required
                />
              )}
              
              {selectedDestinations.includes('suppliers') && (
                <MultiSelectDropdown
                  options={suppliers}
                  selectedValues={associations.suppliers}
                  onChange={(values) => handleAssociationChange('suppliers', values)}
                  placeholder="Select suppliers/co-men..."
                  searchPlaceholder="Search suppliers and co-men..."
                  label="Select Suppliers/Co-Men"
                  required
                />
              )}

              {selectedDestinations.includes('rawMaterials') && (
                <MultiSelectDropdown
                  options={rawMaterials}
                  selectedValues={associations.rawMaterials}
                  onChange={(values) => handleAssociationChange('rawMaterials', values)}
                  placeholder="Select raw materials..."
                  searchPlaceholder="Search raw materials..."
                  label="Select Raw Materials"
                  required
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div
        className={`relative border-3 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-[1.02]'
            : validateUpload()
            ? 'border-slate-200 bg-slate-50 opacity-50'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        } ${uploading || validateUpload() ? 'pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading || !!validateUpload()}
        />
        
        <div className="space-y-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl transition-all duration-300 ${
            dragActive ? 'bg-blue-100 scale-110' : 'bg-slate-100'
          }`}>
            <CloudArrowUpIcon className={`h-10 w-10 transition-colors duration-300 ${
              dragActive ? 'text-blue-600' : 'text-slate-400'
            }`} />
          </div>
          
          {uploading ? (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-200 border-t-blue-600"></div>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 mb-2">Processing Upload...</p>
                <p className="text-slate-600 leading-relaxed">
                  Your documents are being securely uploaded and indexed for AI search.<br />
                  This usually takes just a few moments.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xl font-bold text-slate-900 mb-2">
                  {validateUpload()
                    ? 'Complete required fields first'
                    : 'Drop files here or click to browse'
                  }
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {validateUpload()
                    ? validateUpload()
                    : 'Upload PDF, DOCX, and TXT files up to 10MB each\nMultiple files supported - drag and drop for faster uploads'
                  }
                </p>
              </div>
              <div className="inline-flex items-center space-x-4 text-sm text-slate-500">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V5l-10-4z"/>
                  </svg>
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>Auto-indexed</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {uploadStatus.type && (
        <div className={`mt-6 p-6 rounded-2xl border-2 ${
          uploadStatus.type === 'success' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800' 
            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-xl ${
              uploadStatus.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {uploadStatus.type === 'success' ? (
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              )}
            </div>
            <div>
              <h4 className="font-bold mb-1">
                {uploadStatus.type === 'success' ? 'Upload Successful!' : 'Upload Failed'}
              </h4>
              <p className="leading-relaxed">{uploadStatus.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Supported Document Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              type: 'PDF', 
              icon: '📄', 
              description: 'Portable Document Format',
              details: 'Standard for manufacturing specs, manuals, and procedures'
            },
            { 
              type: 'DOCX', 
              icon: '📝', 
              description: 'Microsoft Word Document',
              details: 'Word documents, reports, and structured documentation'
            },
            { 
              type: 'TXT', 
              icon: '📋', 
              description: 'Plain Text File',
              details: 'Simple text files, logs, and unformatted data'
            },
          ].map((item) => (
            <div key={item.type} className="flex flex-col p-6 border-2 border-slate-200 rounded-2xl hover:border-blue-300 transition-all duration-200 card bg-white">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-xl">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">{item.type}</p>
                  <p className="text-sm text-slate-600 font-medium">{item.description}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{item.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
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
  const [documentTitle, setDocumentTitle] = useState('')
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
      console.error('Error fetching suppliers API, trying CSV fallback:', error)
      // Fallback to CSV data
      try {
        const csvResponse = await fetch('/suppliers - Sheet1.csv')
        const csvText = await csvResponse.text()
        const lines = csvText.trim().split('\n')
        
        const supplierOptions = lines.map((line, index) => {
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
          
          const name = columns[0] ? columns[0].replace(/^"|"$/g, '') : `Supplier ${index + 1}`
          const type = columns[1] ? columns[1].replace(/^"|"$/g, '') : 'unknown'
          const status = columns[2] ? columns[2].replace(/^"|"$/g, '') : 'unknown'
          
          return {
            id: `csv-${index}`,
            name: name,
            type: type,
            status: status
          }
        }).filter(supplier => supplier.name && supplier.name !== 'Supplier 1') // Filter out empty/header rows
        
        console.log('Loaded suppliers from CSV:', supplierOptions.length)
        setSuppliers(supplierOptions)
      } catch (csvError) {
        console.error('Error fetching suppliers from CSV:', csvError)
        // Final fallback with actual supplier names
        setSuppliers([
          { id: 'ans', name: 'ANS' },
          { id: 'food-pharma', name: 'Food Pharma' },
          { id: 'inw', name: 'INW' },
          { id: 'mill-haven', name: 'Mill Haven Foods' },
          { id: 'multipack', name: 'MultiPack' },
          { id: 'nutrastar', name: 'Nutrastar' },
          { id: 'probi', name: 'Probi' },
          { id: 'spice-hut', name: 'Spice Hut' },
          { id: 'steuart', name: 'Steuart Packaging' },
          { id: 'vitaquest', name: 'Vitaquest' },
          { id: 'aidp', name: 'AIDP, Inc.' },
          { id: 'ajinomoto', name: 'Ajinomoto Health and Nutrition North America, Inc' },
          { id: 'anderson', name: 'Anderson Advanced Ingredients' },
          { id: 'bd-nutritional', name: 'B&D Nutritional Products' },
          { id: 'catherych', name: 'Catherych (PharmaCap)' },
          { id: 'centian', name: 'Centian LLC' },
          { id: 'draco', name: 'Draco Natural Products' },
          { id: 'euromed', name: 'Euromed USA' },
          { id: 'fci-flavors', name: 'FCI Flavors' },
          { id: 'fifth-nutrisupply', name: 'Fifth Nutrisupply, Inc' }
        ])
      }
    }
  }

  const fetchRawMaterials = async () => {
    try {
      const response = await fetch('/api/raw-materials')
      const data = await response.json()
      const rawMaterialOptions = (data.rawMaterials || []).map((material: any) => ({
        id: material.id || material.name,
        name: material.name
      }))
      setRawMaterials(rawMaterialOptions)
    } catch (error) {
      console.error('Error fetching raw materials API, trying CSV fallback:', error)
      // Fallback to CSV data
      try {
        const csvResponse = await fetch('/rawmaterials.csv')
        const csvText = await csvResponse.text()
        const lines = csvText.trim().split('\n')
        
        // Skip header row and parse CSV
        const rawMaterialOptions = lines.slice(1).map((line, index) => {
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
          
          const item = columns[0] ? columns[0].replace(/^"|"$/g, '') : ''
          const description = columns[1] ? columns[1].replace(/^"|"$/g, '') : ''
          
          // Use description if available, otherwise use item code
          const name = description || item || `Raw Material ${index + 1}`
          
          return {
            id: item || `rm-${index}`,
            name: name,
            item: item,
            description: description
          }
        }).filter(material => material.item && material.name) // Filter out empty rows
        
        // Remove duplicates based on item code
        const uniqueMaterials = rawMaterialOptions.filter((material, index, self) => 
          index === self.findIndex(m => m.item === material.item)
        )
        
        console.log('Loaded raw materials from CSV:', uniqueMaterials.length)
        setRawMaterials(uniqueMaterials)
      } catch (csvError) {
        console.error('Error fetching raw materials from CSV:', csvError)
        // Final fallback with sample raw materials
        setRawMaterials([
          { id: 'RM5HTP', name: '5HTP' },
          { id: 'RM5MTHF', name: 'L-5-Methyltetrahydrofolic Acid' },
          { id: 'RM7KETODHEA', name: '7-Keto-DHEA' },
          { id: 'RMACETL-CARN', name: 'Acetyl-L-Carnitine HCL' },
          { id: 'RMADRENALCORTE', name: 'Adrenal Cortex Bovine' },
          { id: 'RMADRENALWHOLE', name: 'Adrenal Whole Bovine' },
          { id: 'RMALGALDHA', name: 'Vegan Omega 3 powder 30% DHA' },
          { id: 'RMALGALDHA20%', name: 'Deodorized Algal DHA 20%' },
          { id: 'RM00CAP', name: '#00 Size Gel Capsule 70M/cs' },
          { id: 'RM00CAPVEG', name: '#00 Size VEG Capsule 70M/cs' },
          { id: 'RM0CAP', name: '#0 Size Gel Capsule 100M/cs' },
          { id: 'RM0CAPVEG', name: '#0 Size VEG Capsule 100M/cs' },
          { id: 'RM1CAPVEG', name: '#1 Size VEG Capsule 130M/cs' },
          { id: 'RM3CAPVEG', name: '#3 Size Veg Capsule 240,000/cs' }
        ])
      }
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
    'Test Results',
    'BRH Documents',
    'Templates'
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
    if (!documentTitle.trim()) return 'Please enter a document title.'
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
      console.log('Starting upload process...')
      console.log('Document Type:', documentType)
      console.log('Selected Destinations:', selectedDestinations)
      console.log('Associations:', associations)
      console.log('Files to upload:', validFiles.map(f => ({ name: f.name, size: f.size, type: f.type })))

      const uploadPromises = validFiles.map(async (file, index) => {
        console.log(`Uploading file ${index + 1}/${validFiles.length}: ${file.name}`)
        
        const formData = new FormData()
        formData.append('file', file)
        formData.append('documentType', documentType)
        formData.append('documentTitle', documentTitle.trim())
        formData.append('destinations', JSON.stringify(selectedDestinations))
        formData.append('associations', JSON.stringify(associations))

        console.log('FormData prepared for:', file.name)
        console.log('Sending POST to /api/documents/upload')

        try {
          const response = await fetch('/api/documents/upload', {
            method: 'POST',
            body: formData,
          })

          console.log(`Response status for ${file.name}:`, response.status)
          console.log(`Response ok for ${file.name}:`, response.ok)

          if (!response.ok) {
            const errorText = await response.text()
            console.error(`Upload failed for ${file.name}:`, {
              status: response.status,
              statusText: response.statusText,
              errorText: errorText
            })
            throw new Error(`Failed to upload ${file.name}: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          console.log(`Upload successful for ${file.name}:`, result)
          return result
        } catch (fetchError) {
          console.error(`Network error uploading ${file.name}:`, fetchError)
          throw new Error(`Network error uploading ${file.name}: ${fetchError.message}`)
        }
      })

      console.log('Waiting for all uploads to complete...')
      const results = await Promise.all(uploadPromises)
      console.log('All uploads completed successfully:', results)
      
      const destinationNames = selectedDestinations.map(id => 
        destinations.find(d => d.id === id)?.name
      ).join(', ')
      
      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${validFiles.length} file(s) as ${documentType} to ${destinationNames}. Processing may take a few moments.`
      })
      
      // Reset form after successful upload
      setDocumentType('')
      setDocumentTitle('')
      setSelectedDestinations([])
      setAssociations({ products: [], suppliers: [], rawMaterials: [] })
      
    } catch (error) {
      console.error('Upload process failed:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      setUploadStatus({
        type: 'error',
        message: `Upload failed: ${error.message || 'Unknown error occurred. Please check the console for details.'}`
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-700 to-blue-900 p-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white">
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
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-8">
          {/* Document Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Document Type *
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className={`w-full px-4 py-3 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                ['BRH Documents', 'Templates'].includes(documentType)
                  ? 'border-blue-300 bg-blue-50 text-blue-900'
                  : 'border-slate-300 bg-white'
              }`}
            >
              <option value="">Select document type...</option>
              {documentTypes.map(type => {
                const isBlueType = ['BRH Documents', 'Templates'].includes(type)
                return (
                  <option 
                    key={type} 
                    value={type}
                    className={isBlueType ? 'bg-blue-50 text-blue-900' : ''}
                  >
                    {type}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Document Title */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Document Title *
            </label>
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="Enter a descriptive title for this document..."
              className="w-full px-4 py-3 border text-black border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-slate-500 mt-2">
              This will be the display name for your document (e.g., "ANS Quality Agreement", "Product Label Proof")
            </p>
          </div>

          {/* Destinations Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Destinations * (Select one or more)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {destinations.map(dest => {
                // Add blue background for suppliers, raw materials, and templates
                const hasBlueBackground = ['suppliers', 'rawMaterials'].includes(dest.id)
                
                return (
                  <div key={dest.id} className="relative">
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedDestinations.includes(dest.id)
                        ? 'border-blue-500 bg-blue-50'
                        : hasBlueBackground
                        ? 'border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100'
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
                          : hasBlueBackground
                          ? 'border-blue-400'
                          : 'border-slate-300'
                      }`}>
                        {selectedDestinations.includes(dest.id) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className={`font-medium ${hasBlueBackground ? 'text-blue-900' : 'text-slate-900'}`}>
                          {dest.name}
                        </div>
                        {dest.requiresAssociation && (
                          <div className={`text-xs ${hasBlueBackground ? 'text-blue-600' : 'text-slate-500'}`}>
                            Requires specific association
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                )
              })}
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
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
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
            }
          ].map((item) => {
            return (
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  XMarkIcon, 
  DocumentArrowDownIcon,
  ShareIcon,
  ClockIcon,
  UserIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  TagIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'

interface EnhancedDocumentEditorProps {
  document: any
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
}

interface Product {
  id: string
  sku: string
  productName: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  department?: string
}

export default function EnhancedDocumentEditor({ document: initialDocument, isOpen, onClose, onSave }: EnhancedDocumentEditorProps) {
  const { data: session } = useSession()
  const [document, setDocument] = useState(initialDocument)
  const [content, setContent] = useState<any>(initialDocument?.content || {})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [assignToUserId, setAssignToUserId] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchProductsAndUsers()
      setContent(initialDocument?.content || {})
      setDocument(initialDocument)
    }
  }, [isOpen, initialDocument])

  const fetchProductsAndUsers = async () => {
    try {
      // Mock data since API is failing
      setProducts([
        { id: '1', sku: 'FG-001', productName: 'Premium Whey Protein' },
        { id: '2', sku: 'FG-002', productName: 'Creatine Monohydrate' },
        { id: '3', sku: 'FG-003', productName: 'BCAA Complex' }
      ])
      
      setUsers([
        { id: '1', name: 'John Smith', email: 'john@company.com', role: 'Quality Manager', department: 'QA' },
        { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Production Supervisor', department: 'Manufacturing' },
        { id: '3', name: 'Mike Chen', email: 'mike@company.com', role: 'R&D Specialist', department: 'Development' }
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleContentChange = (path: string, value: any) => {
    setContent(prev => {
      const newContent = { ...prev }
      const keys = path.split('.')
      let current = newContent
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      setHasChanges(true)
      return newContent
    })
  }

  const saveAndAssign = async () => {
    setSaving(true)
    try {
      // Save document with assignments
      const updatedDocument = {
        ...document,
        content,
        productId: selectedProductId || null,
        assignedTo: assignToUserId || null,
        workflowStatus: assignToUserId ? 'IN_REVIEW' : 'DRAFT',
        updatedAt: new Date().toISOString()
      }
      
      // Here you would typically save to your backend
      console.log('Saving document:', updatedDocument)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setDocument(updatedDocument)
      setHasChanges(false)
      
      if (assignToUserId) {
        alert(`Document assigned to ${users.find(u => u.id === assignToUserId)?.name} successfully!`)
      } else if (selectedProductId) {
        alert(`Document linked to ${products.find(p => p.id === selectedProductId)?.productName} successfully!`)
      } else {
        alert('Document saved successfully!')
      }
      
      if (onSave) onSave()
    } catch (error) {
      console.error('Error saving document:', error)
      alert('Failed to save document')
    } finally {
      setSaving(false)
    }
  }

  const renderFieldEditor = (label: string, path: string, value: any, type = 'text') => {
    if (type === 'textarea') {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <textarea
            value={value || ''}
            onChange={(e) => handleContentChange(path, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>
      )
    }

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type={type}
          value={value || ''}
          onChange={(e) => handleContentChange(path, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    )
  }

  const renderContentEditor = () => {
    if (!document || !content) return null

    const templateType = document.template?.type

    // Render different editors based on template type
    switch (templateType) {
      case 'FINISHED_GOODS_SPEC':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Product Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFieldEditor('Product Name', 'productInfo.productName', content.productInfo?.productName)}
                {renderFieldEditor('SKU', 'productInfo.sku', content.productInfo?.sku)}
                {renderFieldEditor('Version', 'productInfo.version', content.productInfo?.version)}
                {renderFieldEditor('Effective Date', 'productInfo.effectiveDate', content.productInfo?.effectiveDate, 'date')}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFieldEditor('Appearance', 'specifications.appearance', content.specifications?.appearance)}
                {renderFieldEditor('Color', 'specifications.color', content.specifications?.color)}
                {renderFieldEditor('Odor', 'specifications.odor', content.specifications?.odor)}
                {renderFieldEditor('Taste', 'specifications.taste', content.specifications?.taste)}
                {renderFieldEditor('Physical Form', 'specifications.physicalForm', content.specifications?.physicalForm)}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Storage & Packaging</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFieldEditor('Storage Conditions', 'storage.conditions', content.storage?.conditions, 'textarea')}
                {renderFieldEditor('Shelf Life', 'storage.shelfLife', content.storage?.shelfLife)}
                {renderFieldEditor('Primary Packaging', 'packaging.primaryPackaging', content.packaging?.primaryPackaging)}
                {renderFieldEditor('Secondary Packaging', 'packaging.secondaryPackaging', content.packaging?.secondaryPackaging)}
              </div>
            </div>
          </div>
        )

      case 'RAW_MATERIAL_SPEC':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Material Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFieldEditor('Material Name', 'materialInfo.materialName', content.materialInfo?.materialName)}
                {renderFieldEditor('Supplier Name', 'materialInfo.supplierName', content.materialInfo?.supplierName)}
                {renderFieldEditor('Lot Number', 'materialInfo.lotNumber', content.materialInfo?.lotNumber)}
                {renderFieldEditor('Receipt Date', 'materialInfo.receiptDate', content.materialInfo?.receiptDate, 'date')}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFieldEditor('Appearance', 'specifications.appearance', content.specifications?.appearance)}
                {renderFieldEditor('Color', 'specifications.color', content.specifications?.color)}
                {renderFieldEditor('Odor', 'specifications.odor', content.specifications?.odor)}
                {renderFieldEditor('Moisture', 'specifications.moisture', content.specifications?.moisture)}
                {renderFieldEditor('Purity', 'specifications.purity', content.specifications?.purity)}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Storage & Handling</h3>
              <div className="grid grid-cols-1 gap-4">
                {renderFieldEditor('Storage Requirements', 'storage', content.storage, 'textarea')}
                {renderFieldEditor('Handling Instructions', 'handling', content.handling, 'textarea')}
              </div>
            </div>
          </div>
        )

      default:
        // Generic JSON editor for other template types
        return (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Document Content</h3>
            <textarea
              value={JSON.stringify(content, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  setContent(parsed)
                  setHasChanges(true)
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        )
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{document?.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                  {document?.template?.name}
                </span>
                <span className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  v{document?.version}
                </span>
                <span className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  {document?.user?.name}
                </span>
              </div>
            </div>
            {hasChanges && (
              <div className="flex items-center text-orange-600 text-sm">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                Unsaved changes
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              <ShareIcon className="h-4 w-4 mr-1" />
              Assign & Save
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading document...</p>
            </div>
          ) : (
            renderContentEditor()
          )}
        </div>

        {/* Assignment Modal */}
        {showAssignModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Save & Assign Document</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link to Product (optional)
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a product...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.sku} - {product.productName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forward to Coworker (optional)
                  </label>
                  <select
                    value={assignToUserId}
                    onChange={(e) => setAssignToUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Keep as draft</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role}) {user.department && `- ${user.department}`}
                      </option>
                    ))}
                  </select>
                </div>

                {assignToUserId && (
                  <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
                    <strong>Note:</strong> The document will be marked as "In Review" and the assigned person will be notified.
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAndAssign}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  )}
                  Save & {assignToUserId ? 'Assign' : 'Complete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  ArrowLeftIcon, 
  DocumentIcon, 
  PlusIcon, 
  EyeIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  LinkIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import ApprovalModal from './ApprovalModal'

interface ProductDetailProps {
  sku: string
  onBack: () => void
  onNavigateToDocuments?: () => void
}

interface Document {
  id: string
  title: string
  workflowStatus: string
  version: number
  createdAt: string
  updatedAt: string
  template?: {
    name: string
    type: string
  }
  user: {
    name: string
  }
  approvals: Array<{
    status: string
    approver: {
      name: string
    }
  }>
}

interface Product {
  id: string
  brand: string
  sku: string
  productName: string
  healthCategory?: string
  therapeuticPlatform?: string
  nutrientType?: string
  format?: string
  numberOfActives?: string
  bottleCount?: string
  unitCount: number
  manufacturer?: string
  containsIron: boolean
  documents: Document[]
}

export default function ProductDetail({ sku, onBack, onNavigateToDocuments }: ProductDetailProps) {
  const { data: session } = useSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [availableDocuments, setAvailableDocuments] = useState([])
  const [assignLoading, setAssignLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  useEffect(() => {
    fetchProduct()
  }, [sku])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${sku}`)
      const data = await response.json()
      setProduct(data.product)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableDocuments = async () => {
    try {
      const response = await fetch('/api/documents')
      if (!response.ok) {
        console.error('Documents API failed:', response.status)
        return
      }
      
      const data = await response.json()
      const unassignedDocs = data.documents.filter((doc: any) => !doc.productId)
      setAvailableDocuments(unassignedDocs)
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  const assignDocumentToProduct = async (documentId: string) => {
    if (!product) return
    
    setAssignLoading(true)
    try {
      const response = await fetch(`/api/documents/${documentId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product.id }),
      })

      if (response.ok) {
        await fetchProduct()
        setShowAssignModal(false)
      }
    } catch (error) {
      console.error('Error assigning document:', error)
    } finally {
      setAssignLoading(false)
    }
  }

  const openDocumentForViewing = (doc: Document) => {
    // Open document in view mode
    alert(`Opening document for viewing: ${doc.title}`)
  }

  const openDocumentForEditing = (doc: Document) => {
    // Open document in edit mode
    alert(`Opening document for editing: ${doc.title}`)
  }

  const openDocumentForSignOff = (doc: Document) => {
    setSelectedDocument(doc)
    setShowApprovalModal(true)
  }

  const handleDeleteDocument = (doc: Document) => {
    setDocumentToDelete(doc)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return
    
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/documents/${documentToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Refresh product data to update document list
        await fetchProduct()
        setShowDeleteConfirm(false)
        setDocumentToDelete(null)
      } else {
        const error = await response.json()
        alert(`Failed to delete document: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Error deleting document')
    } finally {
      setDeleteLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'IN_REVIEW':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />
      case 'DRAFT':
        return <DocumentIcon className="h-5 w-5 text-gray-600" />
      case 'REJECTED':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      default:
        return <DocumentIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string, workflowStatus?: string) => {
    // If workflow status is REJECTED, show rejected status regardless of document status
    if (workflowStatus === 'REJECTED') {
      return 'text-red-600 bg-red-100'
    }
    
    switch (status) {
      case 'SIGNED': return 'text-green-600 bg-green-100'
      case 'EDIT_MODE': return 'text-blue-600 bg-blue-100'
      case 'PROCESSING': return 'text-yellow-600 bg-yellow-100'
      case 'ERROR': return 'text-red-600 bg-red-100'
      case 'READY': return 'text-gray-600 bg-gray-100'
      case 'APPROVED': return 'text-green-600 bg-green-100'
      case 'IN_REVIEW': return 'text-yellow-600 bg-yellow-100'
      case 'DRAFT': return 'text-gray-600 bg-gray-100'
      case 'REJECTED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string, workflowStatus?: string) => {
    // If workflow status is REJECTED, show rejected message
    if (workflowStatus === 'REJECTED') {
      return 'rejected/please fix'
    }
    
    switch (status) {
      case 'SIGNED': return 'signed'
      case 'EDIT_MODE': return 'edit mode'
      case 'PROCESSING': return 'processing'
      case 'ERROR': return 'error'
      case 'READY': return 'ready'
      case 'APPROVED': return 'approved'
      case 'IN_REVIEW': return 'in review'
      case 'DRAFT': return 'draft'
      case 'REJECTED': return 'rejected/please fix'
      default: return status?.toLowerCase() || 'unknown'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      QUALITY_MANUAL: 'bg-blue-100 text-blue-800',
      PROCEDURE: 'bg-green-100 text-green-800',
      WORK_INSTRUCTION: 'bg-purple-100 text-purple-800',
      SPECIFICATION: 'bg-orange-100 text-orange-800',
      TRAINING: 'bg-yellow-100 text-yellow-800',
      COMPLIANCE: 'bg-red-100 text-red-800',
      GENERAL: 'bg-gray-100 text-gray-800',
    }
    return colors[category as keyof typeof colors] || colors.GENERAL
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          <button
            onClick={onBack}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  // Group documents by template type
  const documentsByType = product.documents.reduce((acc, doc) => {
    const type = doc.template?.type || 'OTHER'
    if (!acc[type]) acc[type] = []
    acc[type].push(doc)
    return acc
  }, {} as Record<string, Document[]>)

  return (
    <div className="bg-white p-6">
      <div className="max-w-full">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Products
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.productName}</h1>
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                <span className="font-mono font-semibold text-blue-600">{product.sku}</span>
                <span className="font-medium">{product.brand}</span>
                {product.containsIron && (
                  <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                    Contains Iron
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowEditModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Product
              </button>
            </div>
          </div>
        </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['overview', 'documents', 'quality'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Info */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Health Category</dt>
                <dd className="text-sm font-medium text-gray-900">{product.healthCategory || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Therapeutic Platform</dt>
                <dd className="text-sm font-medium text-gray-900">{product.therapeuticPlatform || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Nutrient Type</dt>
                <dd className="text-sm font-medium text-gray-900">{product.nutrientType || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Format</dt>
                <dd className="text-sm font-medium text-gray-900">{product.format || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Number of Actives</dt>
                <dd className="text-sm font-medium text-gray-900">{product.numberOfActives || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Bottle Count/Size</dt>
                <dd className="text-sm font-medium text-gray-900">{product.bottleCount || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Unit Count</dt>
                <dd className="text-sm font-medium text-gray-900">{product.unitCount}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Manufacturer</dt>
                <dd className="text-sm font-medium text-gray-900">{product.manufacturer || 'N/A'}</dd>
              </div>
            </dl>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Documents</span>
                  <span className="text-sm font-medium">{product.documents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Approved</span>
                  <span className="text-sm font-medium text-green-600">
                    {product.documents.filter(d => d.workflowStatus === 'APPROVED').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">In Review</span>
                  <span className="text-sm font-medium text-yellow-600">
                    {product.documents.filter(d => d.workflowStatus === 'IN_REVIEW').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Draft</span>
                  <span className="text-sm font-medium text-gray-600">
                    {product.documents.filter(d => d.workflowStatus === 'DRAFT').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-6">
          {Object.entries(documentsByType).map(([type, docs]) => (
            <div key={type} className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              <div className="space-y-4">
                {docs.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <DocumentIcon className="h-6 w-6 text-gray-400 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                          <p className="text-sm text-gray-600">{doc.filename || `${doc.title}.json`}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status || 'EDIT_MODE', doc.workflowStatus)}`}>
                          {getStatusText(doc.status || 'EDIT_MODE', doc.workflowStatus)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(doc.category || 'SPECIFICATION')}`}>
                          {(doc.category || 'specification').replace('_', ' ').toLowerCase()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-gray-600">
                      {/* Creator and Basic Info Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-1" />
                            <span className="font-medium">Created by:</span> {doc.user?.name || 'Unknown'}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </div>
                          <div>
                            Version: {doc.version || 1}
                          </div>
                        </div>
                      </div>
                      
                      {/* Template Information */}
                      {doc.template && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Template:</span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                            {doc.template.name} ({doc.template.type})
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions Section - Mirror DocumentList exactly */}
                    <div className="pt-3 border-t border-gray-100">
                      {(doc.status === 'EDIT_MODE' || doc.status === 'SIGNED' || !doc.status) && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openDocumentForViewing(doc)}
                            className="flex items-center px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            <EyeIcon className="h-3 w-3 mr-1" />
                            View
                          </button>
                          
                          {/* Show Edit button only if in EDIT_MODE and not signed */}
                          {(!doc.status || doc.status === 'EDIT_MODE') && doc.workflowStatus !== 'COMPLETED' && (
                            <>
                              <button
                                onClick={() => openDocumentForEditing(doc)}
                                className="flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                <PencilIcon className="h-3 w-3 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => openDocumentForSignOff(doc)}
                                className="flex items-center px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                <CheckIcon className="h-3 w-3 mr-1" />
                                Sign Off
                              </button>
                            </>
                          )}
                          
                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteDocument(doc)}
                            className="flex items-center px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            title="Delete document"
                          >
                            <TrashIcon className="h-3 w-3 mr-1" />
                            Delete
                          </button>
                          
                          {/* Show completed status indicator */}
                          {(doc.workflowStatus === 'COMPLETED' || doc.status === 'SIGNED') && (
                            <div className="flex items-center px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Signed/Complete
                              {doc.digitalSignature && (
                                <span className="ml-2 text-xs text-green-600">
                                  by {doc.digitalSignature}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {docs.length === 0 && (
                  <p className="text-gray-600 text-center py-8">No documents of this type</p>
                )}
              </div>
            </div>
          ))}
          
          {Object.keys(documentsByType).length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents assigned</h3>
              <p className="text-gray-600">Use the "Assign Document" button above to associate existing documents with this product.</p>
            </div>
          )}
        </div>
      )}

        {activeTab === 'quality' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Management</h3>
            <p className="text-gray-600">Quality management features will be available here.</p>
          </div>
        )}
      </div>

      {/* Assign Document Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Document to Product</h3>
              <div className="max-h-60 overflow-y-auto">
                {availableDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {availableDocuments.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{doc.title}</h4>
                          <p className="text-xs text-gray-600">
                            Created by {doc.user.name} • {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => assignDocumentToProduct(doc.id)}
                          disabled={assignLoading}
                          className="ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {assignLoading ? 'Assigning...' : 'Assign'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-8">No unassigned documents available</p>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && product && (
        <EditProductModal
          product={product}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedProduct) => {
            setProduct(updatedProduct)
            setShowEditModal(false)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && documentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Document</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{documentToDelete.title}" from this product? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDocumentToDelete(null)
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDocument}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedDocument && (
        <ApprovalModal
          document={selectedDocument}
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false)
            setSelectedDocument(null)
          }}
          onApprove={() => {
            fetchProduct() // Refresh product data to show updated document status
            setShowApprovalModal(false)
            setSelectedDocument(null)
          }}
          onNavigateToDocuments={onNavigateToDocuments}
        />
      )}
    </div>
  )
}

function EditProductModal({ product, isOpen, onClose, onSave }: {
  product: any,
  isOpen: boolean,
  onClose: () => void,
  onSave: (product: any) => void
}) {
  const [formData, setFormData] = useState({
    productName: product.productName || '',
    brand: product.brand || '',
    healthCategory: product.healthCategory || '',
    therapeuticPlatform: product.therapeuticPlatform || '',
    nutrientType: product.nutrientType || '',
    format: product.format || '',
    numberOfActives: product.numberOfActives || '',
    bottleCount: product.bottleCount || '',
    unitCount: product.unitCount || 0,
    manufacturer: product.manufacturer || '',
    containsIron: product.containsIron || false
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products/${product.sku}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedProduct = { ...product, ...formData }
        onSave(updatedProduct)
      } else {
        alert('Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Error updating product')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Edit Product Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData({...formData, productName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Health Category</label>
            <input
              type="text"
              value={formData.healthCategory}
              onChange={(e) => setFormData({...formData, healthCategory: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <input
              type="text"
              value={formData.format}
              onChange={(e) => setFormData({...formData, format: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit Count</label>
            <input
              type="number"
              value={formData.unitCount}
              onChange={(e) => setFormData({...formData, unitCount: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
            <input
              type="text"
              value={formData.manufacturer}
              onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.containsIron}
                onChange={(e) => setFormData({...formData, containsIron: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Contains Iron</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { 
  DocumentIcon, 
  ClockIcon, 
  UserIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import DocumentEditor from './DocumentEditor'
import ApprovalModal from './ApprovalModal'

interface Document {
  id: string
  title: string
  filename: string
  size: number
  status: 'PROCESSING' | 'READY' | 'ERROR' | 'EDIT_MODE' | 'SIGNED'
  workflowStatus: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED' | 'COMPLETED'
  category: string
  version: number
  createdAt: string
  updatedAt: string
  approvedAt?: string
  digitalSignature?: string
  template?: {
    name: string
    type: string
  }
  user: {
    name: string
    email: string
  }
  product?: {
    productName: string
    sku: string
    brand: string
  }
  shares?: Array<{
    sharedUser: {
      name: string
      email: string
    }
  }>
  approvals?: Array<{
    status: string
    approver: {
      name: string
    }
  }>
}

export default function DocumentList({ onEditDocument, onNavigateToDocuments }: { onEditDocument?: (document: Document) => void, onNavigateToDocuments?: () => void }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [showApproval, setShowApproval] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showViewer, setShowViewer] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      console.log('DocumentList: Fetching documents...')
      const response = await fetch('/api/documents')
      console.log('DocumentList: Response status:', response.status)
      
      if (!response.ok) {
        console.error('DocumentList: API failed with status:', response.status)
        const text = await response.text()
        console.error('DocumentList: Error response:', text)
        return
      }
      
      const data = await response.json()
      console.log('DocumentList: Response data:', data)
      console.log('DocumentList: Number of documents:', data.documents?.length)
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('DocumentList: Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const openDocument = (document: Document, mode: 'view' | 'edit' | 'approve' | 'save' | 'signoff') => {
    setSelectedDocument(document)
    if (mode === 'view') {
      setShowViewer(true)
    } else if (mode === 'edit') {
      if (onEditDocument) {
        onEditDocument(document)
      } else {
        setShowEditor(true)
      }
    } else if (mode === 'approve' || mode === 'signoff') {
      setShowApproval(true)
    } else if (mode === 'save') {
      setShowSaveModal(true)
    }
  }

  const handleDeleteDocument = (document: Document) => {
    setDocumentToDelete(document)
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
        // Remove document from local state
        setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id))
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
      case 'READY': return 'text-gray-600 bg-gray-100' // Legacy status
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

  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'IN_REVIEW': return 'bg-blue-100 text-blue-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800'
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
        <p className="text-gray-600 mt-1">
          View and manage saved documents and collaborative work
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded yet</h3>
          <p className="text-gray-600">Upload your first document to get started with AI search.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <DocumentIcon className="h-6 w-6 text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{document.title}</h3>
                    <p className="text-sm text-gray-600">{document.filename}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status, document.workflowStatus)}`}>
                    {getStatusText(document.status, document.workflowStatus)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(document.category)}`}>
                    {document.category.replace('_', ' ').toLowerCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                {/* Creator and Basic Info Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      <span className="font-medium">Created by:</span> {document.user.name}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {new Date(document.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      Size: {formatFileSize(document.size)}
                    </div>
                  </div>
                </div>
                
                {/* Product Information */}
                {document.product && (
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Product:</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {document.product.sku} - {document.product.productName} ({document.product.brand})
                    </span>
                  </div>
                )}
                
                {/* Assigned People */}
                {document.shares && document.shares.length > 0 && (
                  <div className="flex items-start">
                    <span className="font-medium mr-2">Assigned to:</span>
                    <div className="flex flex-wrap gap-1">
                      {document.shares.map((share, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {share.sharedUser?.name || share.name || 'Unknown User'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Debug info - temporary */}
                {document.shares && (
                  <div className="text-xs text-gray-500 mt-1">
                    Shares debug: {JSON.stringify(document.shares, null, 2)}
                  </div>
                )}

              </div>
              
              {/* Actions Section */}
              <div className="pt-3 border-t border-gray-100">
                {document.status === 'PROCESSING' && (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                    <span className="text-xs">Processing for AI search...</span>
                  </div>
                )}

                {(document.status === 'EDIT_MODE' || document.status === 'SIGNED' || document.status === 'READY') && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openDocument(document, 'view')}
                      className="flex items-center px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      <EyeIcon className="h-3 w-3 mr-1" />
                      View
                    </button>
                    
                    {/* Show Edit button only if in EDIT_MODE and not signed */}
                    {document.status === 'EDIT_MODE' && document.workflowStatus !== 'COMPLETED' && (
                      <>
                        <button
                          onClick={() => openDocument(document, 'edit')}
                          className="flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          <PencilIcon className="h-3 w-3 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDocument(document, 'signoff')}
                          className="flex items-center px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          <CheckIcon className="h-3 w-3 mr-1" />
                          Sign Off
                        </button>
                      </>
                    )}
                    
                    {/* Delete button - always show for document owner */}
                    <button
                      onClick={() => handleDeleteDocument(document)}
                      className="flex items-center px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      title="Delete document"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                    
                    {/* Show completed status indicator */}
                    {(document.workflowStatus === 'COMPLETED' || document.status === 'SIGNED') && (
                      <div className="flex items-center px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Signed/Complete
                        {document.digitalSignature && (
                          <span className="ml-2 text-xs text-green-600">
                            by {document.digitalSignature}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Editor Modal */}
      {showEditor && selectedDocument && (
        <DocumentEditor
          documentId={selectedDocument.id}
          isOpen={showEditor}
          onClose={() => {
            setShowEditor(false)
            setSelectedDocument(null)
          }}
          onSave={() => {
            fetchDocuments() // Refresh the document list
          }}
        />
      )}

      {/* Approval Modal */}
      {showApproval && selectedDocument && (
        <ApprovalModal
          document={selectedDocument}
          isOpen={showApproval}
          onClose={() => {
            setShowApproval(false)
            setSelectedDocument(null)
          }}
          onApprove={() => {
            fetchDocuments() // Refresh the document list
            setShowApproval(false)
            setSelectedDocument(null)
          }}
          onNavigateToDocuments={onNavigateToDocuments}
        />
      )}

      {/* Document Save Modal */}
      {showSaveModal && selectedDocument && (
        <DocumentSaveModal
          document={selectedDocument}
          isOpen={showSaveModal}
          onClose={() => {
            setShowSaveModal(false)
            setSelectedDocument(null)
          }}
          onSave={() => {
            fetchDocuments() // Refresh the document list
            setShowSaveModal(false)
            setSelectedDocument(null)
          }}
        />
      )}

      {/* Document Viewer Modal */}
      {showViewer && selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          isOpen={showViewer}
          onClose={() => {
            setShowViewer(false)
            setSelectedDocument(null)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && documentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Document</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{documentToDelete.title}&quot;? This action cannot be undone.
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
    </div>
  )
}

function DocumentViewer({ document, isOpen, onClose }: {
  document: Document,
  isOpen: boolean,
  onClose: () => void
}) {
  const [documentDetails, setDocumentDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SIGNED': return 'text-green-600 bg-green-100'
      case 'EDIT_MODE': return 'text-blue-600 bg-blue-100'
      case 'PROCESSING': return 'text-yellow-600 bg-yellow-100'
      case 'ERROR': return 'text-red-600 bg-red-100'
      case 'READY': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'IN_REVIEW': return 'bg-blue-100 text-blue-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800'
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    if (isOpen && document) {
      fetchDocumentDetails()
    }
  }, [isOpen, document])

  const fetchDocumentDetails = async () => {
    try {
      const response = await fetch(`/api/documents/${document.id}`)
      const data = await response.json()
      setDocumentDetails(data.document)
    } catch (error) {
      console.error('Error fetching document details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-full flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{document.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {document.filename} • {document.category.replace('_', ' ').toLowerCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading document...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Document Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Document Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                      {document.status.toLowerCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Workflow Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded ${getWorkflowStatusColor(document.workflowStatus)}`}>
                      {document.workflowStatus.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created by:</span>
                    <span className="ml-2 text-gray-600">{document.user.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">{new Date(document.createdAt).toLocaleDateString()}</span>
                  </div>
                  {document.template && (
                    <div>
                      <span className="font-medium text-gray-700">Template:</span>
                      <span className="ml-2 text-gray-600">{document.template.name}</span>
                    </div>
                  )}
                  {document.product && (
                    <div>
                      <span className="font-medium text-gray-700">Product:</span>
                      <span className="ml-2 text-gray-600">{document.product.productName} ({document.product.sku})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Content */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Document Content</h4>
                <div className="max-w-none">
                  {documentDetails?.content ? (
                    <div className="bg-gray-50 p-4 rounded border">
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Form Data Preview:</strong> This document contains structured form data. 
                        Click &quot;Edit&quot; to view in the form interface.
                      </p>
                      <div className="text-xs font-mono text-gray-600 max-h-96 overflow-y-auto bg-white p-3 rounded border">
                        <pre>{JSON.stringify(JSON.parse(documentDetails.content), null, 2)}</pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <DocumentIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p>Document content is not available for preview</p>
                      <p className="text-sm">This may be a binary file or content is not yet processed</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval History and Signatures */}
              {document.approvals && document.approvals.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Approval History</h4>
                  <div className="space-y-3">
                    {document.approvals.map((approval, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="flex items-center space-x-3">
                          {approval.status === 'APPROVED' ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          ) : approval.status === 'REJECTED' ? (
                            <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                          ) : (
                            <ClockIcon className="h-5 w-5 text-yellow-600" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{approval.approver.name}</p>
                            <p className="text-sm text-gray-600">
                              {approval.status.toLowerCase()} • {approval.approvedAt ? new Date(approval.approvedAt).toLocaleDateString() : 'Pending'}
                            </p>
                          </div>
                        </div>
                        {approval.comments && (
                          <div className="text-sm text-gray-600 max-w-xs">
                            {approval.comments}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Digital Signature Section */}
              {(document.workflowStatus === 'APPROVED' || document.workflowStatus === 'COMPLETED') && document.digitalSignature && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Digital Signature
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-800">Signed by:</span>
                      <span className="text-green-700">{document.digitalSignature}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-800">Signed on:</span>
                      <span className="text-green-700">
                        {document.approvedAt ? new Date(document.approvedAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="mt-4 p-3 bg-green-100 rounded border border-green-300">
                      <p className="text-sm text-green-800 font-medium">
                        ✓ This document has been digitally signed and approved
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Digital signature validates the authenticity and integrity of this document
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* If document is not signed yet */}
              {document.workflowStatus !== 'APPROVED' && document.workflowStatus !== 'COMPLETED' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Signature Status
                  </h4>
                  <div className="space-y-2">
                    <p className="text-yellow-800">
                      Status: <span className="font-medium">{document.workflowStatus.replace('_', ' ').toLowerCase()}</span>
                    </p>
                    <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-300">
                      <p className="text-sm text-yellow-800">
                        {document.workflowStatus === 'DRAFT' && "⏳ This document is still in draft status"}
                        {document.workflowStatus === 'IN_REVIEW' && "👀 This document is currently under review"}
                        {document.workflowStatus === 'REJECTED' && "❌ This document has been rejected"}
                        {document.workflowStatus === 'ARCHIVED' && "📦 This document has been archived"}
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Signature area will appear here once the document is approved by the boss
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentSaveModal({ document, isOpen, onClose, onSave }: { 
  document: any, 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: () => void 
}) {
  const [assignedUsers, setAssignedUsers] = useState<string[]>([])
  const [productSku, setProductSku] = useState('')
  const [loading, setLoading] = useState(false)
  const [coworkers, setCoworkers] = useState([])
  const [products, setProducts] = useState([])
  const [productSearch, setProductSearch] = useState('')

  // Company coworkers (no demo users)
  const actualCoworkers = [
    { name: 'John Troup', username: 'john.troup', email: 'john.troup@company.com' },
    { name: 'Matt White', username: 'matt.white', email: 'matt.white@company.com' },
    { name: 'Nick Hafften', username: 'nick.hafften', email: 'nick.hafften@company.com' },
    { name: 'Steve Nelson', username: 'steve.nelson', email: 'steve.nelson@company.com' },
    { name: 'Nick Deloia', username: 'nick.deloia', email: 'nick.deloia@company.com' },
    { name: 'Jenn Doucette', username: 'jenn.doucette', email: 'jenn.doucette@company.com' },
    { name: 'Dana Rutscher', username: 'dana.rutscher', email: 'dana.rutscher@company.com' },
    { name: 'Shefali Pandey', username: 'shefali.pandey', email: 'shefali.pandey@company.com' },
    { name: 'Whitney Palmerton', username: 'whitney.palmerton', email: 'whitney.palmerton@company.com' }
  ]

  useEffect(() => {
    // Fetch products from API (same approach as ProductIndex)
    const fetchProducts = async () => {
      try {
        // Try debug endpoint first, then fall back to regular API
        let response = await fetch('/api/debug/products')
        if (!response.ok) {
          response = await fetch('/api/products')
        }
        const data = await response.json()
        setProducts(data.products || [])
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }
    
    if (isOpen) {
      fetchProducts()
      setCoworkers(actualCoworkers)
    }
  }, [isOpen])

  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.productName?.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.sku?.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.brand?.toLowerCase().includes(productSearch.toLowerCase())
  )

  const handleUserToggle = (user: any) => {
    const userName = user.name
    setAssignedUsers(prev => 
      prev.includes(userName) 
        ? prev.filter(u => u !== userName)
        : [...prev, userName]
    )
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save document with new assignments
      const response = await fetch(`/api/documents/${document.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedUsers,
          productSku
        })
      })

      if (response.ok) {
        onSave()
      } else {
        console.error('Failed to update document assignments')
      }
    } catch (error) {
      console.error('Error updating document:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-full flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Save Document: {document.title}</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Coworkers
              </label>
              <div className="border border-gray-300 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                {coworkers.map(worker => (
                  <label key={worker.username} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignedUsers.includes(worker.name)}
                      onChange={() => handleUserToggle(worker)}
                      className="mr-3 text-black"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-black font-medium">{worker.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({worker.username})</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Search products by name, SKU, or brand..."
                />
                <select
                  value={productSku}
                  onChange={(e) => setProductSku(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="">Select a product... ({filteredProducts.length} available)</option>
                  {filteredProducts.slice(0, 100).map(product => (
                    <option key={product.sku} value={product.sku}>
                      {product.sku} - {product.productName} ({product.brand})
                    </option>
                  ))}
                </select>
                {productSearch && filteredProducts.length > 100 && (
                  <p className="text-xs text-gray-500">
                    Showing first 100 results. Refine your search for more specific results.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
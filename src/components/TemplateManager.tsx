'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DocumentDuplicateIcon, PlusIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline'
import DocumentWorkflow from './DocumentWorkflow'
import DocumentEditor from './DocumentEditor'
import EnhancedDocumentEditor from './EnhancedDocumentEditor'
import DocxEditor from './DocxEditor'

interface Template {
  id: string
  name: string
  description?: string
  type: string
  content: any
  createdAt: string
  creator: {
    name: string
  }
}

export default function TemplateManager({ onEditTemplate }: { onEditTemplate?: (template: any) => void }) {
  const { data: session } = useSession()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [workflowTemplate, setWorkflowTemplate] = useState<Template | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [currentDocument, setCurrentDocument] = useState<any>(null)
  const [showDocxEditor, setShowDocxEditor] = useState(false)
  const [selectedTemplatePath, setSelectedTemplatePath] = useState('')
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [assignmentData, setAssignmentData] = useState({
    assignedUsers: [],
    productSku: ''
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  // Cleanup function to close all modals when component unmounts
  useEffect(() => {
    return () => {
      setShowCreateModal(false)
      setShowWorkflow(false)
      setShowEditor(false)
      setShowDocxEditor(false)
      setShowAssignmentModal(false)
      setSelectedTemplate(null)
      setWorkflowTemplate(null)
      setCurrentDocument(null)
      setSelectedTemplatePath('')
    }
  }, [])

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCreateModal(false)
        setShowWorkflow(false)
        setShowEditor(false)
        setShowDocxEditor(false)
        setShowAssignmentModal(false)
        setSelectedTemplate(null)
        setWorkflowTemplate(null)
        setCurrentDocument(null)
        setSelectedTemplatePath('')
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const fetchTemplates = async () => {
    try {
      console.log('TemplateManager: Starting to fetch templates')
      const response = await fetch('/api/templates')
      console.log('TemplateManager: Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('TemplateManager: Response data:', data)
        console.log('TemplateManager: Templates count:', data.templates?.length)
        setTemplates(data.templates || [])
      } else {
        console.error('TemplateManager: Failed to fetch templates:', response.status)
        const errorData = await response.json()
        console.error('TemplateManager: Error details:', errorData)
        setTemplates([])
      }
    } catch (error) {
      console.error('TemplateManager: Error fetching templates:', error)
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const createDocumentFromTemplate = async (template: Template) => {
    console.log('Creating document from template:', template.name, template.type)
    setSelectedTemplate(template)
    if (onEditTemplate) {
      console.log('Using onEditTemplate callback')
      onEditTemplate(template)
      setTimeout(() => window.scrollTo(0, 0), 100)
    } else {
      console.log('Using internal DocxEditor')
      setSelectedTemplatePath(template.name)
      setShowDocxEditor(true)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-700 to-blue-900 p-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Templates</h2>
            <p className="text-gray-600">
              Create documents from pre-built templates
            </p>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <DocumentDuplicateIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates available</h3>
            <p className="text-gray-600">Create your first template to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {template.type.replace('_', ' ').toLowerCase()}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <p>Created by {template.creator.name}</p>
                  <p>{new Date(template.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => createDocumentFromTemplate(template)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600">{selectedTemplate.description}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-medium mb-2">Template Content:</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(selectedTemplate.content, null, 2)}
              </pre>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => createDocumentFromTemplate(selectedTemplate)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Workflow Modal */}
      <DocumentWorkflow
        isOpen={showWorkflow}
        onClose={() => {
          setShowWorkflow(false)
          setWorkflowTemplate(null)
        }}
        onSuccess={() => {
          setShowWorkflow(false)
          setWorkflowTemplate(null)
          // Could refresh documents list here if needed
        }}
        template={workflowTemplate}
      />

      {/* Create Template Modal */}
      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchTemplates()
          }}
        />
      )}

      {/* DOCX Editor Modal */}
      {showDocxEditor && selectedTemplatePath && (
        <DocxEditor
          templatePath={selectedTemplatePath}
          templateName={selectedTemplatePath}
          isOpen={showDocxEditor}
          onClose={() => {
            setShowDocxEditor(false)
            setSelectedTemplatePath('')
          }}
          onSave={() => {
            // Close the editor and show assignment modal
            setShowDocxEditor(false)
            setShowAssignmentModal(true)
          }}
        />
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && selectedTemplate && (
        <AssignmentModal
          template={selectedTemplate}
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false)
            setSelectedTemplate(null)
            setAssignmentData({ assignedUsers: [], productSku: '' })
          }}
          onSave={async (assignedUsers: string[], productSku: string, documentName: string) => {
            try {
              // Create a document from the template
              const documentData = {
                title: documentName,
                templateId: selectedTemplate.id,
                productId: productSku || null,
                assignedTo: assignedUsers.length > 0 ? assignedUsers[0] : null // API expects single assignee
              }
              
              // Create document from template
              const response = await fetch('/api/documents/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(documentData)
              })
              
              if (response.ok) {
                console.log('Template converted to document and assigned to:', assignedUsers, 'for product:', productSku)
              } else {
                console.error('Failed to create document from template')
              }
            } catch (error) {
              console.error('Error creating document:', error)
            } finally {
              setShowAssignmentModal(false)
              setSelectedTemplate(null)
              setAssignmentData({ assignedUsers: [], productSku: '' })
            }
          }}
        />
      )}
    </div>
  )
}

function AssignmentModal({ template, isOpen, onClose, onSave }: { 
  template: Template, 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (assignedUsers: string[], productSku: string, documentName: string) => void 
}) {
  const [assignedUsers, setAssignedUsers] = useState<string[]>([])
  const [productSku, setProductSku] = useState('')
  const [documentName, setDocumentName] = useState(template.name.replace('.docx', '').replace('.doc', ''))
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
        console.log('Fetching products...')
        // Try debug endpoint first, then fall back to regular API
        let response = await fetch('/api/debug/products')
        if (!response.ok) {
          response = await fetch('/api/products')
        }
        const data = await response.json()
        console.log('Products data:', data)
        console.log('Number of products:', data.products?.length)
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

  const handleSave = () => {
    if (assignedUsers.length === 0 || !productSku || !documentName.trim()) {
      alert('Please enter a document name, select at least one coworker, and select a product')
      return
    }
    
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      onSave(assignedUsers, productSku, documentName.trim())
      setLoading(false)
    }, 500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-full flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg text-black font-semibold">Create Document from Template</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Name *
              </label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Enter document name..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Coworkers *
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
                Product *
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
                  {filteredProducts.slice(0, 100).map(product => {
                    console.log('Rendering product:', product);
                    return (
                      <option key={product.sku} value={product.sku}>
                        {product.sku} - {product.productName} ({product.brand})
                      </option>
                    );
                  })}
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
              className="px-4 py-2 border text-black border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save & Assign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateTemplateModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'FINISHED_PRODUCT_SPEC',
  })
  const [loading, setLoading] = useState(false)

  const getTemplateContent = (type: string) => {
    const templates = {
      'RAW_MATERIAL_SPEC': {
        materialInfo: { materialName: '', supplierName: '', lotNumber: '', receiptDate: '' },
        specifications: { appearance: '', color: '', odor: '', moisture: '', purity: '' },
        tests: [], storage: '', handling: '', approvals: {}
      },
      'FINISHED_GOODS_SPEC': {
        productInfo: { productName: '', sku: '', version: '1.0', effectiveDate: '' },
        specifications: { appearance: '', color: '', odor: '', taste: '', physicalForm: '' },
        ingredients: [], nutritionalInfo: {}, qualityTests: [], packaging: {}, storage: {}, approvals: {}
      },
      'CCR': {
        batchInfo: { batchNumber: '', productName: '', manufacturingDate: '', expiryDate: '' },
        criticalControlPoints: [], monitoring: [], correctionActions: [], verification: '', approvals: {}
      },
      'LABEL_MANUSCRIPT': {
        productInfo: { productName: '', sku: '', version: '' },
        labelSpecs: { dimensions: '', material: '', colors: '', finish: '' },
        textContent: {}, nutritionalPanel: {}, claims: [], warnings: [], approvals: {}
      },
      'PSF': {
        productDetails: { name: '', sku: '', version: '', category: '' },
        formulation: {}, manufacturing: {}, packaging: {}, labeling: {}, storage: {}, distribution: {}, approvals: {}
      },
      'BOM': {
        productInfo: { productName: '', sku: '', version: '', revision: '' },
        materials: [], packaging: [], labels: [], totalWeight: '', yield: '', approvals: {}
      },
      'MMR': {
        productInfo: { productName: '', batchSize: '', version: '', revision: '' },
        ingredients: [], equipment: [], procedures: [], qualityControls: [], packaging: [], approvals: {}
      },
      'COA': {
        batchInfo: { batchNumber: '', productName: '', testDate: '', releaseDate: '' },
        specifications: [], testResults: [], conclusion: '', testedBy: '', approvedBy: '', approvals: {}
      },
      'COC': {
        productInfo: { productName: '', batchNumber: '', complianceDate: '' },
        regulations: [], standards: [], certifications: [], complianceStatement: '', approvals: {}
      },
      'PIS': {
        productInfo: { productName: '', sku: '', version: '', lastUpdated: '' },
        description: '', indications: '', dosage: '', ingredients: [], warnings: [], storageInstructions: '', manufacturerInfo: {}, approvals: {}
      }
    }
    return templates[type] || templates['FINISHED_GOODS_SPEC']
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          content: getTemplateContent(formData.type),
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        console.error('Failed to create template')
      }
    } catch (error) {
      console.error('Error creating template:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Create New Template</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="e.g., Finished Product Specification"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              rows={3}
              placeholder="Brief description of this template..."
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            >
              <option value="RAW_MATERIAL_SPEC">Raw Material Specification</option>
              <option value="FINISHED_GOODS_SPEC">Finished Goods Specification</option>
              <option value="CCR">Critical Control Record (CCR)</option>
              <option value="LABEL_MANUSCRIPT">Label Manuscript</option>
              <option value="PSF">Product Specification File (PSF)</option>
              <option value="BOM">Bill of Materials (BOM)</option>
              <option value="MMR">Master Manufacturing Record (MMR)</option>
              <option value="COA">Certificate of Analysis (COA)</option>
              <option value="COC">Certificate of Compliance (COC)</option>
              <option value="PIS">Product Information Sheet (PIS)</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
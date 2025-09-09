'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  XMarkIcon, 
  UserIcon,
  BeakerIcon,
  DocumentDuplicateIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'

interface Template {
  id: string
  name: string
  type: string
  description?: string
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

interface DocumentWorkflowProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  template?: Template
  product?: Product
}

export default function DocumentWorkflow({ 
  isOpen, 
  onClose, 
  onSuccess, 
  template, 
  product 
}: DocumentWorkflowProps) {
  const { data: session } = useSession()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    templateId: template?.id || '',
    productId: product?.id || '',
    title: '',
    assignedTo: '',
  })
  const [templates, setTemplates] = useState<Template[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchData()
      if (template) {
        setFormData(prev => ({
          ...prev,
          templateId: template.id,
          title: `${template.name} - ${new Date().toLocaleDateString()}`
        }))
      }
      if (product) {
        setFormData(prev => ({
          ...prev,
          productId: product.id,
          title: prev.title || `${product.productName} Specification`
        }))
      }
    }
  }, [isOpen, template, product])

  const fetchData = async () => {
    try {
      const [templatesRes, productsRes, usersRes] = await Promise.all([
        fetch('/api/templates'),
        fetch('/api/products'),
        fetch('/api/users')
      ])

      const [templatesData, productsData, usersData] = await Promise.all([
        templatesRes.json(),
        productsRes.json(),
        usersRes.json()
      ])

      setTemplates(templatesData.templates || [])
      setProducts(productsData.products || [])
      setUsers(usersData.users || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSubmit = async () => {
    if (!formData.templateId || !formData.title) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/documents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
        onClose()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create document')
      }
    } catch (error) {
      console.error('Error creating document:', error)
      alert('Failed to create document')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      templateId: '',
      productId: '',
      title: '',
      assignedTo: '',
    })
    setStep(1)
  }

  // Add missing handleSubmit function
  const handleSubmitStep = () => {
    handleSubmit()
  }

  const selectedTemplate = templates.find(t => t.id === formData.templateId)
  const selectedProduct = products.find(p => p.id === formData.productId)
  const selectedAssignee = users.find(u => u.id === formData.assignedTo)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Create New Document</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step >= stepNum 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`
                      w-16 h-0.5 mx-2
                      ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Template</span>
              <span>Product</span>
              <span>Assignment</span>
            </div>
          </div>

          {/* Step 1: Select Template */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Template Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {templates.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => setFormData({ ...formData, templateId: tmpl.id })}
                      className={`
                        p-4 border-2 rounded-lg text-left transition-colors
                        ${formData.templateId === tmpl.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center mb-2">
                        <DocumentDuplicateIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium text-gray-900">{tmpl.name}</span>
                      </div>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {tmpl.type.replace(/_/g, ' ')}
                      </span>
                      {tmpl.description && (
                        <p className="text-sm text-gray-600 mt-2">{tmpl.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.templateId}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Select Product
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Product & Title */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Document Details</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Finished Product Specification - Product Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Associated Product (optional)
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="">Select a product...</option>
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.sku} - {prod.productName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.title}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Assignment
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Assignment & Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment & Review</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to (optional)
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="">Keep as draft (assign later)</option>
                    {users.filter(u => u.id !== session?.user?.id).map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role}) {user.department && `- ${user.department}`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-600 mt-1">
                    If assigned, the person will receive an email notification and the document will be marked as "In Review"
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Document Summary</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Template:</dt>
                      <dd className="text-gray-900">{selectedTemplate?.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Title:</dt>
                      <dd className="text-gray-900">{formData.title}</dd>
                    </div>
                    {selectedProduct && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Product:</dt>
                        <dd className="text-gray-900">{selectedProduct.productName}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Status:</dt>
                      <dd className="text-gray-900">
                        {formData.assignedTo ? 'In Review' : 'Draft'}
                      </dd>
                    </div>
                    {selectedAssignee && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Assigned to:</dt>
                        <dd className="text-gray-900">{selectedAssignee.name}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitStep}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  )}
                  Create Document
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
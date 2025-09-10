'use client'

import { useState, useCallback, memo, useEffect, useRef } from 'react'
import { AutoResizingInput, AutoResizingTextarea, AutoResizingSelect } from './AutoResizingInputs'

// Completely isolated input that manages its own state
const IsolatedInput = memo(function IsolatedInput({
  value: initialValue,
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
  className = "",
  path = ""
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  readOnly?: boolean
  className?: string
  path?: string
}) {
  const [localValue, setLocalValue] = useState(initialValue)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Only update local value when prop changes from external source
  useEffect(() => {
    if (initialValue !== localValue) {
      setLocalValue(initialValue)
    }
  }, [initialValue])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue)
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Only debounced update for stable cursor behavior
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        console.log('IsolatedInput: Sending debounced update to parent:', newValue)
        onChange(newValue)
      }
    }, 500)
  }, [onChange])

  // Expose a method to flush pending changes immediately
  useEffect(() => {
    const element = inputRef.current
    if (element) {
      element.flushPendingChanges = () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          console.log('IsolatedInput: Force flushing update:', localValue)
          onChange(localValue)
        }
      }
    }
  }, [localValue, onChange])

  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <input
      ref={inputRef}
      data-path={path}
      type={type}
      value={localValue}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={className}
    />
  )
})

// Isolated textarea
const IsolatedTextarea = memo(function IsolatedTextarea({
  value: initialValue,
  onChange,
  placeholder,
  rows = 3,
  readOnly = false,
  className = "",
  path = ""
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  readOnly?: boolean
  className?: string
  path?: string
}) {
  const [localValue, setLocalValue] = useState(initialValue)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    if (initialValue !== localValue) {
      setLocalValue(initialValue)
    }
  }, [initialValue])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        console.log('IsolatedInput: Sending update to parent:', newValue)
        onChange(newValue)
      }
    }, 300) // Reduced from 500ms to 300ms
  }, [onChange])

  return (
    <textarea
      data-path={path}
      value={localValue}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      readOnly={readOnly}
      className={className}
    />
  )
})

// Isolated select
const IsolatedSelect = memo(function IsolatedSelect({
  value: initialValue,
  onChange,
  options,
  readOnly = false,
  className = ""
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
  readOnly?: boolean
  className?: string
}) {
  const [localValue, setLocalValue] = useState(initialValue)

  useEffect(() => {
    if (initialValue !== localValue) {
      setLocalValue(initialValue)
    }
  }, [initialValue])

  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue)
    onChange(newValue) // Select doesn't need debouncing
  }, [onChange])

  return (
    <select
      value={localValue}
      onChange={(e) => handleChange(e.target.value)}
      disabled={readOnly}
      className={className}
    >
      <option value="">Select option...</option>
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  )
})

interface COAData {
  header: {
    companyName: string
    address: string
    phone: string
    email: string
    documentNumber: string
    revision: string
    effectiveDate: string
  }
  product: {
    productName: string
    productCode: string
    sku: string
    batchNumber: string
    lotNumber: string
    manufacturingDate: string
    testingDate: string
    releaseDate: string
    expiryDate: string
    packageSize: string
    quantity: string
  }
  specifications: Array<{
    parameter: string
    specification: string
    method: string
    result: string
    status: string
  }>
  microbiological: Array<{
    test: string
    specification: string
    result: string
    method: string
    status: string
  }>
  chemical: Array<{
    test: string
    specification: string
    result: string
    method: string
    status: string
  }>
  physical: Array<{
    test: string
    specification: string
    result: string
    method: string
    status: string
  }>
  conclusion: {
    overallResult: string
    conclusion: string
    releaseStatus: string
    comments: string
  }
  signatures: {
    testedBy: string
    testedByTitle: string
    testedDate: string
    reviewedBy: string
    reviewedByTitle: string
    reviewedDate: string
    approvedBy: string
    approvedByTitle: string
    approvedDate: string
  }
}

interface COAFormProps {
  data: COAData
  onChange: (data: COAData) => void
  readOnly?: boolean
  companyName?: string
}

export default function COAForm({ data, onChange, readOnly = false, companyName = "Company" }: COAFormProps) {
  // Ensure data structure exists with defaults
  const safeData = {
    header: data?.header || {},
    product: data?.product || {},
    specifications: data?.specifications || [],
    microbiological: data?.microbiological || [],
    chemical: data?.chemical || [],
    physical: data?.physical || [],
    conclusion: data?.conclusion || {},
    signatures: data?.signatures || {}
  }

  const updateField = (path: string, value: string) => {
    const keys = path.split('.')
    const newData = { ...safeData }
    let current: any = newData
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {}
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
    onChange(newData)
  }

  const addSpecification = () => {
    const newData = { ...safeData }
    if (!newData.specifications) newData.specifications = []
    newData.specifications.push({
      parameter: '',
      specification: '',
      method: '',
      result: '',
      status: ''
    })
    onChange(newData)
  }

  const removeSpecification = (index: number) => {
    const newData = { ...safeData }
    if (newData.specifications) {
      newData.specifications.splice(index, 1)
    }
    onChange(newData)
  }

  const addMicrobiological = () => {
    const newData = { ...safeData }
    if (!newData.microbiological) newData.microbiological = []
    newData.microbiological.push({
      test: '',
      specification: '',
      result: '',
      method: '',
      status: ''
    })
    onChange(newData)
  }

  const removeMicrobiological = (index: number) => {
    const newData = { ...safeData }
    if (newData.microbiological) {
      newData.microbiological.splice(index, 1)
    }
    onChange(newData)
  }

  const getValue = useCallback((path: string) => {
    const keys = path.split('.')
    let current: any = safeData
    for (const key of keys) {
      current = current?.[key]
    }
    return current || ''
  }, [safeData])

  const inputClassName = `w-full px-3 py-2 border rounded-lg text-black placeholder-black ${
    readOnly 
      ? 'bg-gray-100 border-gray-300' 
      : 'bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  }`

  const FormField = ({ label, path, placeholder, type = "text", rows, options }: {
    label: string
    path: string
    placeholder?: string
    type?: string
    rows?: number
    options?: string[]
  }) => {
    if (options) {
      return (
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-900 mb-2">{label}</label>
          <AutoResizingSelect
            value={getValue(path)}
            onChange={(value) => updateField(path, value)}
            options={options}
            readOnly={readOnly}
            className={inputClassName}
          />
        </div>
      )
    }

    return (
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-900 mb-2">{label}</label>
        {rows ? (
          <AutoResizingTextarea
            value={getValue(path)}
            onChange={(value) => updateField(path, value)}
            placeholder={placeholder}
            rows={rows}
            readOnly={readOnly}
            className={inputClassName}
            path={path}
          />
        ) : (
          <AutoResizingInput
            value={getValue(path)}
            onChange={(value) => updateField(path, value)}
            placeholder={placeholder}
            type={type}
            readOnly={readOnly}
            className={inputClassName}
            path={path}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-blue-50 p-6 rounded-lg border">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">CERTIFICATE OF ANALYSIS</h1>
          <p className="text-gray-600 mt-2">{companyName}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Company Name" path="header.companyName" placeholder="Company name" />
          <FormField label="Document Number" path="header.documentNumber" placeholder="COA-XXXX" />
          <FormField label="Address" path="header.address" placeholder="Complete address" rows={2} />
          <FormField label="Revision" path="header.revision" placeholder="01" />
          <FormField label="Phone" path="header.phone" placeholder="Phone number" />
          <FormField label="Effective Date" path="header.effectiveDate" type="date" />
          <FormField label="Email" path="header.email" placeholder="contact@company.com" type="email" />
        </div>
      </div>

      {/* Product Information */}
      <div className="bg-green-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Product Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Product Name" path="product.productName" placeholder="Enter product name" />
          <FormField label="Product Code" path="product.productCode" placeholder="Product code" />
          <FormField label="SKU" path="product.sku" placeholder="Product SKU" />
          <FormField label="Batch Number" path="product.batchNumber" placeholder="Batch number" />
          <FormField label="Lot Number" path="product.lotNumber" placeholder="Lot number" />
          <FormField label="Manufacturing Date" path="product.manufacturingDate" type="date" />
          <FormField label="Testing Date" path="product.testingDate" type="date" />
          <FormField label="Release Date" path="product.releaseDate" type="date" />
          <FormField label="Expiry Date" path="product.expiryDate" type="date" />
          <FormField label="Package Size" path="product.packageSize" placeholder="Package size/format" />
          <FormField label="Quantity Tested" path="product.quantity" placeholder="Quantity tested" />
        </div>
      </div>

      {/* General Specifications */}
      <div className="bg-yellow-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">General Specifications</h2>
        
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-3 bg-gray-100 rounded font-bold text-sm">
            <div>Parameter</div>
            <div>Specification</div>
            <div>Method</div>
            <div>Result</div>
            <div>Status</div>
            <div>Action</div>
          </div>
          
          {safeData.specifications.map((spec, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-white rounded border">
              <AutoResizingInput
                value={spec.parameter}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.specifications[index]) {
                    newData.specifications[index].parameter = value
                  }
                  onChange(newData)
                }}
                placeholder="Parameter name"
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <AutoResizingInput
                value={spec.specification}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.specifications[index]) {
                    newData.specifications[index].specification = value
                  }
                  onChange(newData)
                }}
                placeholder="Specification"
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <AutoResizingInput
                value={spec.method}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.specifications[index]) {
                    newData.specifications[index].method = value
                  }
                  onChange(newData)
                }}
                placeholder="Test method"
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <AutoResizingInput
                value={spec.result}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.specifications[index]) {
                    newData.specifications[index].result = value
                  }
                  onChange(newData)
                }}
                placeholder="Result"
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <AutoResizingSelect
                value={spec.status}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.specifications[index]) {
                    newData.specifications[index].status = value
                  }
                  onChange(newData)
                }}
                options={['Pass', 'Fail', 'N/A']}
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              {!readOnly && (
                <button
                  onClick={() => removeSpecification(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          {!readOnly && (
            <button
              onClick={addSpecification}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Specification
            </button>
          )}
        </div>
      </div>

      {/* Microbiological Testing */}
      <div className="bg-red-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Microbiological Testing</h2>
        
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-3 bg-gray-100 rounded font-bold text-sm">
            <div>Test</div>
            <div>Specification</div>
            <div>Result</div>
            <div>Method</div>
            <div>Status</div>
            <div>Action</div>
          </div>
          
          {safeData.microbiological.map((test, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-white rounded border">
              <AutoResizingInput
                value={test.test}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.microbiological[index]) {
                    newData.microbiological[index].test = value
                  }
                  onChange(newData)
                }}
                placeholder="Microbiological test"
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <AutoResizingInput
                value={test.specification}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.microbiological[index]) {
                    newData.microbiological[index].specification = value
                  }
                  onChange(newData)
                }}
                placeholder="Limit"
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <AutoResizingInput
                value={test.result}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.microbiological[index]) {
                    newData.microbiological[index].result = value
                  }
                  onChange(newData)
                }}
                placeholder="Result"
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <AutoResizingInput
                value={test.method}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.microbiological[index]) {
                    newData.microbiological[index].method = value
                  }
                  onChange(newData)
                }}
                placeholder="USP method"
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <AutoResizingSelect
                value={test.status}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.microbiological[index]) {
                    newData.microbiological[index].status = value
                  }
                  onChange(newData)
                }}
                options={['Pass', 'Fail', 'N/A']}
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              {!readOnly && (
                <button
                  onClick={() => removeMicrobiological(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          {!readOnly && (
            <button
              onClick={addMicrobiological}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Microbiological Test
            </button>
          )}
        </div>
      </div>

      {/* Conclusion */}
      <div className="bg-purple-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Conclusion</h2>
        <div className="space-y-4">
          <FormField 
            label="Overall Result" 
            path="conclusion.overallResult" 
            options={['Pass', 'Fail', 'Pass with Conditions']}
          />
          <FormField 
            label="Conclusion Statement" 
            path="conclusion.conclusion" 
            placeholder="This product meets all specified requirements for release..."
            rows={3}
          />
          <FormField 
            label="Release Status" 
            path="conclusion.releaseStatus" 
            options={['Released', 'Quarantined', 'Rejected']}
          />
          <FormField 
            label="Additional Comments" 
            path="conclusion.comments" 
            placeholder="Any additional notes or observations..."
            rows={3}
          />
        </div>
      </div>

      {/* Signatures */}
      <div className="bg-gray-100 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Testing & Approval Signatures</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Tested By" path="signatures.testedBy" placeholder="Analyst name" />
            <FormField label="Title" path="signatures.testedByTitle" placeholder="Quality Analyst" />
            <FormField label="Date" path="signatures.testedDate" type="date" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Reviewed By" path="signatures.reviewedBy" placeholder="Reviewer name" />
            <FormField label="Title" path="signatures.reviewedByTitle" placeholder="Senior Analyst" />
            <FormField label="Date" path="signatures.reviewedDate" type="date" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Approved By" path="signatures.approvedBy" placeholder="Approver name" />
            <FormField label="Title" path="signatures.approvedByTitle" placeholder="Quality Manager" />
            <FormField label="Date" path="signatures.approvedDate" type="date" />
          </div>
        </div>
      </div>
    </div>
  )
}
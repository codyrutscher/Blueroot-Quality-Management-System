'use client'

import { useState, useCallback, memo, useEffect, useRef } from 'react'

// Completely isolated input that manages its own state
const IsolatedInput = memo(function IsolatedInput({
  value: initialValue,
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
  className = ""
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  readOnly?: boolean
  className?: string
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
    
    // Debounced update to parent
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        onChange(newValue)
      }
    }, 500)
  }, [onChange])

  return (
    <input
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
  className = ""
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  readOnly?: boolean
  className?: string
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
        onChange(newValue)
      }
    }, 500)
  }, [onChange])

  return (
    <textarea
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

interface LabelManuscriptData {
  productInfo: {
    productName: string
    labelRevision: string
    productSku: string
    containerSize: string
    coMan: string
    bulkFormulaNumber: string
    brandName: string
  }
  revision: {
    isNewLabel: string
    requestor: string
    newProduct: string
  }
  revisionUpdates: {
    logo: string
    storageStatement: string
    productName: string
    precautionaryStatement: string
    trademark: string
    directions: string
    tagline: string
    warningStatement: string
    statementOfIdentity: string
    dietaryRestrictions: string
    ingredients: string
    nutritionalInfo: string
    claims: string
    contact: string
    netWeight: string
    servingSize: string
    warnings: string
    distributedBy: string
  }
  labelSpecs: {
    labelSize: string
    labelShape: string
    labelMaterial: string
    labelColors: string
    labelFinish: string
    adhesive: string
  }
  approval: {
    preparedBy: string
    preparedDate: string
    approvedBy: string
    approvedDate: string
  }
}

interface LabelManuscriptFormProps {
  data: LabelManuscriptData
  onChange: (data: LabelManuscriptData) => void
  readOnly?: boolean
}

export default function LabelManuscriptForm({ data, onChange, readOnly = false }: LabelManuscriptFormProps) {
  // Ensure data structure exists with defaults
  const safeData = {
    productInfo: data?.productInfo || {},
    revision: data?.revision || {},
    revisionUpdates: data?.revisionUpdates || {},
    labelSpecs: data?.labelSpecs || {},
    approval: data?.approval || {}
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
          <IsolatedSelect
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
          <IsolatedTextarea
            value={getValue(path)}
            onChange={(value) => updateField(path, value)}
            placeholder={placeholder}
            rows={rows}
            readOnly={readOnly}
            className={inputClassName}
          />
        ) : (
          <IsolatedInput
            value={getValue(path)}
            onChange={(value) => updateField(path, value)}
            placeholder={placeholder}
            type={type}
            readOnly={readOnly}
            className={inputClassName}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Product Information */}
      <div className="bg-blue-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">1.1 Product Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Product Name" path="productInfo.productName" placeholder="Enter product name" />
          <FormField label="Label Revision" path="productInfo.labelRevision" placeholder="Revision number" />
          <FormField label="Product SKU" path="productInfo.productSku" placeholder="Enter SKU" />
          <FormField label="Container Size" path="productInfo.containerSize" placeholder="Container size" />
          <FormField 
            label="Co-Man" 
            path="productInfo.coMan" 
            options={['Yes', 'No']}
          />
          <FormField label="Bulk Formula #" path="productInfo.bulkFormulaNumber" placeholder="Formula number" />
        </div>
        <div className="mt-4">
          <FormField label="Brand Name" path="productInfo.brandName" placeholder="Enter brand name" />
        </div>
      </div>

      {/* Revision Log */}
      <div className="bg-yellow-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">1.2 Revision Log</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField 
            label="Is this a New Label?" 
            path="revision.isNewLabel" 
            options={['YES', 'NO']}
          />
          <FormField label="Requestor" path="revision.requestor" placeholder="Name of requestor" />
          <FormField label="New Product" path="revision.newProduct" placeholder="Product details" />
        </div>
        <div className="mt-4 p-3 bg-white rounded border-l-4 border-yellow-400">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> If NO to new label, complete table 1.3 for revision location
          </p>
        </div>
      </div>

      {/* Revision Location Updates */}
      <div className="bg-green-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">1.3 Revision Location Update</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Logo" path="revisionUpdates.logo" placeholder="Logo changes" />
          <FormField label="Storage Statement" path="revisionUpdates.storageStatement" placeholder="Storage updates" />
          <FormField label="Product Name" path="revisionUpdates.productName" placeholder="Name changes" />
          <FormField label="Precautionary Statement" path="revisionUpdates.precautionaryStatement" placeholder="Precaution updates" />
          <FormField label="Trademark (if present)" path="revisionUpdates.trademark" placeholder="Trademark changes" />
          <FormField label="Directions/Suggested Use" path="revisionUpdates.directions" placeholder="Direction updates" />
          <FormField label="Tagline/SF Claim" path="revisionUpdates.tagline" placeholder="Tagline changes" />
          <FormField label="Warning Statement" path="revisionUpdates.warningStatement" placeholder="Warning updates" />
          <FormField label="Statement of Identity" path="revisionUpdates.statementOfIdentity" placeholder="Identity changes" />
          <FormField label="Dietary Restriction Claims" path="revisionUpdates.dietaryRestrictions" placeholder="Dietary changes" />
          <FormField label="Ingredients" path="revisionUpdates.ingredients" placeholder="Ingredient updates" rows={3} />
          <FormField label="Nutritional Information" path="revisionUpdates.nutritionalInfo" placeholder="Nutrition updates" rows={3} />
          <FormField label="Claims" path="revisionUpdates.claims" placeholder="Claim updates" rows={2} />
          <FormField label="Contact Information" path="revisionUpdates.contact" placeholder="Contact updates" rows={2} />
          <FormField label="Net Weight" path="revisionUpdates.netWeight" placeholder="Weight changes" />
          <FormField label="Serving Size" path="revisionUpdates.servingSize" placeholder="Serving changes" />
          <FormField label="Warnings" path="revisionUpdates.warnings" placeholder="Warning changes" rows={2} />
          <FormField label="Distributed By" path="revisionUpdates.distributedBy" placeholder="Distribution changes" />
        </div>
      </div>

      {/* Label Specifications */}
      <div className="bg-purple-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Label Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Label Size" path="labelSpecs.labelSize" placeholder="e.g., 4&quot; x 3&quot;" />
          <FormField 
            label="Label Shape" 
            path="labelSpecs.labelShape" 
            placeholder="Shape description"
            options={['Rectangle', 'Square', 'Round', 'Oval', 'Custom']}
          />
          <FormField 
            label="Label Material" 
            path="labelSpecs.labelMaterial" 
            placeholder="Material type"
            options={['Paper', 'Vinyl', 'Clear Film', 'Foil', 'Other']}
          />
          <FormField label="Label Colors" path="labelSpecs.labelColors" placeholder="Color specifications" />
          <FormField 
            label="Label Finish" 
            path="labelSpecs.labelFinish" 
            placeholder="Finish type"
            options={['Matte', 'Gloss', 'Semi-Gloss', 'Satin', 'Other']}
          />
          <FormField 
            label="Adhesive" 
            path="labelSpecs.adhesive" 
            placeholder="Adhesive type"
            options={['Permanent', 'Removable', 'Repositionable', 'High-Tack', 'Other']}
          />
        </div>
      </div>

      {/* Approval Section */}
      <div className="bg-gray-100 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Approvals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormField label="Prepared By" path="approval.preparedBy" placeholder="Name" />
            <FormField label="Date" path="approval.preparedDate" type="date" />
          </div>
          <div>
            <FormField label="Approved By" path="approval.approvedBy" placeholder="Name" />
            <FormField label="Date" path="approval.approvedDate" type="date" />
          </div>
        </div>
      </div>
    </div>
  )
}
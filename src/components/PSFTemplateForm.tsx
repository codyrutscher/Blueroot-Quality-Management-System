'use client'

import { useState, useCallback, memo, useEffect, useRef }
import { AutoResizingInput, AutoResizingTextarea, AutoResizingSelect } from './AutoResizingInputs'

// Auto-resizing input that manages its own state
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
  const inputRef = useRef<HTMLInputElement>(null)
  const hiddenSpanRef = useRef<HTMLSpanElement>(null)

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

  // Auto-resize functionality
  const adjustWidth = useCallback(() => {
    const input = inputRef.current
    const hiddenSpan = hiddenSpanRef.current
    if (input && hiddenSpan) {
      hiddenSpan.textContent = localValue || placeholder || ''
      const newWidth = Math.max(hiddenSpan.scrollWidth + 20, 100) // 20px padding, 100px minimum
      input.style.width = `${newWidth}px`
    }
  }, [localValue, placeholder])

  useEffect(() => {
    adjustWidth()
  }, [localValue, adjustWidth])

  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue)
    
    // Adjust width immediately for better UX
    setTimeout(adjustWidth, 0)
    
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
  }, [onChange, adjustWidth])

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type={type}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`${className} min-w-[100px]`}
        style={{ minWidth: '100px' }}
      />
      <span
        ref={hiddenSpanRef}
        className={`absolute invisible whitespace-pre ${className}`}
        style={{ 
          fontSize: 'inherit',
          fontFamily: 'inherit',
          padding: 'inherit',
          border: 'inherit'
        }}
        aria-hidden="true"
      />
    </div>
  )
})

// Auto-resizing textarea
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  // Auto-resize functionality
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.max(textarea.scrollHeight, rows * 24) + 'px'
    }
  }, [rows])

  useEffect(() => {
    adjustHeight()
  }, [localValue, adjustHeight])

  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue)
    
    // Adjust height immediately for better UX
    setTimeout(adjustHeight, 0)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        onChange(newValue)
      }
    }, 500)
  }, [onChange, adjustHeight])

  return (
    <textarea
      ref={textareaRef}
      value={localValue}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`${className} resize-none overflow-hidden`}
      style={{ minHeight: `${rows * 24}px` }}
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

interface PSFData {
  productSummary: {
    sku: string
    salesDescription: string
    psfSubmittalDate: string
    psfRevision: string
    productType: string
    brand: string
    healthCategory: string
    nutrientType: string
    therapeuticPlatform: string
    pilotRequired: string
    intendedReleaseDate: string
  }
  rawMaterials: string
  blending: {
    routing: string
  }
  bulkBOM: {
    items: Array<{
      itemCode: string
      itemDescription: string
      bomQuantity: string
      units: string
    }>
    routing: string
  }
  label: {
    labelItemCode: string
    labelItemDescription: string
    upc: string
  }
  finishedGoodsBOM: {
    items: Array<{
      inventoryItem: string
      itemDescription: string
      bomQty: string
      units: string
    }>
  }
  demandPlanning: {
    forecastNext12Months: string
    requestedOrderQuantity: string
    requestedOrderCapsules: string
    monthsOnHand: string
  }
  formularySheet: string
}

interface PSFTemplateFormProps {
  data: PSFData
  onChange: (data: PSFData) => void
  readOnly?: boolean
}

const PSFTemplateForm = memo(function PSFTemplateForm({ data, onChange, readOnly = false }: PSFTemplateFormProps) {
  
  // Helper to get nested value
  const getValue = useCallback((path: string) => {
    const keys = path.split('.')
    let current: any = data
    for (const key of keys) {
      current = current?.[key]
    }
    return current || ''
  }, [data])

  // Helper to update nested value
  const updateField = useCallback((path: string, value: string) => {
    const keys = path.split('.')
    const newData = { ...data }
    let current: any = newData
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
    onChange(newData)
  }, [data, onChange])

  const inputClassName = `w-full px-3 py-2 border rounded-lg text-black placeholder-black ${
    readOnly 
      ? 'bg-gray-100 border-gray-300' 
      : 'bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  }`

  return (
    <div className="space-y-8">
      {/* Product Summary */}
      <div className="bg-blue-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Product Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">SKU</label>
            <AutoResizingInput
              value={getValue('productSummary.sku')}
              onChange={(value) => updateField('productSummary.sku', value)}
              placeholder="Enter SKU"
              readOnly={readOnly}
              className={inputClassName}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">Sales Description</label>
            <AutoResizingInput
              value={getValue('productSummary.salesDescription')}
              onChange={(value) => updateField('productSummary.salesDescription', value)}
              placeholder="Product description"
              readOnly={readOnly}
              className={inputClassName}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">PSF Submittal Date</label>
            <AutoResizingInput
              value={getValue('productSummary.psfSubmittalDate')}
              onChange={(value) => updateField('productSummary.psfSubmittalDate', value)}
              type="date"
              readOnly={readOnly}
              className={inputClassName}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">PSF Revision</label>
            <AutoResizingInput
              value={getValue('productSummary.psfRevision')}
              onChange={(value) => updateField('productSummary.psfRevision', value)}
              placeholder="Revision number"
              readOnly={readOnly}
              className={inputClassName}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">Product Type</label>
            <AutoResizingSelect
              value={getValue('productSummary.productType')}
              onChange={(value) => updateField('productSummary.productType', value)}
              options={['Insourcing', 'New', 'Change']}
              readOnly={readOnly}
              className={inputClassName}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">Brand</label>
            <AutoResizingInput
              value={getValue('productSummary.brand')}
              onChange={(value) => updateField('productSummary.brand', value)}
              placeholder="Brand name"
              readOnly={readOnly}
              className={inputClassName}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">Health Category</label>
            <AutoResizingInput
              value={getValue('productSummary.healthCategory')}
              onChange={(value) => updateField('productSummary.healthCategory', value)}
              placeholder="Health category"
              readOnly={readOnly}
              className={inputClassName}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">Nutrient Type</label>
            <AutoResizingInput
              value={getValue('productSummary.nutrientType')}
              onChange={(value) => updateField('productSummary.nutrientType', value)}
              placeholder="Type of nutrients"
              readOnly={readOnly}
              className={inputClassName}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">Therapeutic Platform</label>
            <AutoResizingInput
              value={getValue('productSummary.therapeuticPlatform')}
              onChange={(value) => updateField('productSummary.therapeuticPlatform', value)}
              placeholder="Platform"
              readOnly={readOnly}
              className={inputClassName}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">Pilot Required</label>
            <AutoResizingSelect
              value={getValue('productSummary.pilotRequired')}
              onChange={(value) => updateField('productSummary.pilotRequired', value)}
              options={['Yes', 'No']}
              readOnly={readOnly}
              className={inputClassName}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">Intended Release Date (only for new)</label>
            <AutoResizingInput
              value={getValue('productSummary.intendedReleaseDate')}
              onChange={(value) => updateField('productSummary.intendedReleaseDate', value)}
              type="date"
              readOnly={readOnly}
              className={inputClassName}
            />
          </div>

        </div>
      </div>

      {/* Raw Materials */}
      <div className="bg-green-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Raw Materials</h2>
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-900 mb-2">Raw Materials List</label>
          <AutoResizingTextarea
            value={getValue('rawMaterials')}
            onChange={(value) => updateField('rawMaterials', value)}
            placeholder="List all raw materials and specifications"
            rows={5}
            readOnly={readOnly}
            className={inputClassName}
          />
        </div>
      </div>

      {/* Rest of the form - you can continue this pattern for all other fields */}
      <div className="bg-yellow-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Blending Bill of Materials</h2>
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-900 mb-2">Routing (select one)</label>
          <AutoResizingSelect
            value={getValue('blending.routing')}
            onChange={(value) => updateField('blending.routing', value)}
            options={[
              'Routing-Blending PK20 4 hours',
              'Routing-Blending PK20 8 hours',
              'Routing-Blending PK5 4 hours',
              'Routing-Blending PK5 8 hours',
              'Routing-Blending Munson 8 hours',
              'Routing-Blending Munson 16 hours'
            ]}
            readOnly={readOnly}
            className={inputClassName}
          />
        </div>
      </div>

      {/* Continue with other sections... */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Formulary Sheet</h2>
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-900 mb-2">Formulary Details</label>
          <AutoResizingTextarea
            value={getValue('formularySheet')}
            onChange={(value) => updateField('formularySheet', value)}
            placeholder="<PASTE FORMULARY>"
            rows={8}
            readOnly={readOnly}
            className={inputClassName}
          />
        </div>
        <div className="mt-4 p-3 bg-white rounded border-l-4 border-gray-400">
          <p className="text-sm text-gray-600">
            Paste the complete formulary information including ingredients, quantities, and specifications.
          </p>
        </div>
      </div>
    </div>
  )
})

export default PSFTemplateForm
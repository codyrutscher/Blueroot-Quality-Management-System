'use client'

import { AutoResizingInput, AutoResizingTextarea, AutoResizingSelect } from './AutoResizingInputs'
import { useState, useCallback, memo, useEffect, useRef } from 'react'

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

interface COCData {
  header: {
    companyName: string
    documentTitle: string
    documentNumber: string
    revision: string
    effectiveDate: string
  }
  productInfo: {
    productName: string
    sku: string
    batchNumber: string
    lotNumber: string
    manufacturingDate: string
    expiryDate: string
    quantity: string
    packageSize: string
  }
  compliance: {
    regulations: Array<{
      regulation: string
      standard: string
      compliance: string
      notes: string
    }>
    certifications: Array<{
      certification: string
      certifyingBody: string
      certificateNumber: string
      validUntil: string
    }>
    claims: Array<{
      claim: string
      basis: string
      evidence: string
    }>
  }
  testing: {
    microbiological: {
      totalPlateCount: string
      yeastMold: string
      coliforms: string
      salmonella: string
      ecoli: string
      staph: string
    }
    chemical: {
      heavyMetals: string
      pesticides: string
      residualSolvents: string
      allergens: string
    }
    physical: {
      appearance: string
      color: string
      odor: string
      moisture: string
    }
  }
  statement: {
    complianceStatement: string
    limitations: string
    validityPeriod: string
  }
  signatures: {
    preparedBy: string
    preparedTitle: string
    preparedDate: string
    approvedBy: string
    approvedTitle: string
    approvedDate: string
    qualityManager: string
    qualityManagerDate: string
  }
}

interface COCFormProps {
  data: COCData
  onChange: (data: COCData) => void
  readOnly?: boolean
  companyName?: string
}

const COCForm = memo(function COCForm({ data, onChange, readOnly = false, companyName = "Company" }: COCFormProps) {
  // Ensure data structure exists with defaults
  const safeData = {
    header: data?.header || {},
    productInfo: data?.productInfo || {},
    compliance: {
      regulations: data?.compliance?.regulations || [],
      certifications: data?.compliance?.certifications || [],
      claims: data?.compliance?.claims || []
    },
    testing: {
      microbiological: data?.testing?.microbiological || {},
      chemical: data?.testing?.chemical || {},
      physical: data?.testing?.physical || {}
    },
    statement: data?.statement || {},
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

  const addRegulation = () => {
    const newData = { ...safeData }
    if (!newData.compliance.regulations) newData.compliance.regulations = []
    newData.compliance.regulations.push({
      regulation: '',
      standard: '',
      compliance: '',
      notes: ''
    })
    onChange(newData)
  }

  const removeRegulation = (index: number) => {
    const newData = { ...safeData }
    if (newData.compliance.regulations) {
      newData.compliance.regulations.splice(index, 1)
    }
    onChange(newData)
  }

  const addCertification = () => {
    const newData = { ...safeData }
    if (!newData.compliance.certifications) newData.compliance.certifications = []
    newData.compliance.certifications.push({
      certification: '',
      certifyingBody: '',
      certificateNumber: '',
      validUntil: ''
    })
    onChange(newData)
  }

  const removeCertification = (index: number) => {
    const newData = { ...safeData }
    if (newData.compliance.certifications) {
      newData.compliance.certifications.splice(index, 1)
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
          <h1 className="text-2xl font-bold text-gray-900">CERTIFICATE OF COMPLIANCE</h1>
          <p className="text-gray-600 mt-2">{companyName}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Company Name" path="header.companyName" placeholder="Company name" />
          <FormField label="Document Number" path="header.documentNumber" placeholder="COC-XXXX" />
          <FormField label="Revision" path="header.revision" placeholder="01" />
          <FormField label="Effective Date" path="header.effectiveDate" type="date" />
        </div>
      </div>

      {/* Product Information */}
      <div className="bg-green-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Product Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Product Name" path="productInfo.productName" placeholder="Enter product name" />
          <FormField label="SKU" path="productInfo.sku" placeholder="Product SKU" />
          <FormField label="Batch Number" path="productInfo.batchNumber" placeholder="Batch/Lot number" />
          <FormField label="Lot Number" path="productInfo.lotNumber" placeholder="Lot identifier" />
          <FormField label="Manufacturing Date" path="productInfo.manufacturingDate" type="date" />
          <FormField label="Expiry Date" path="productInfo.expiryDate" type="date" />
          <FormField label="Quantity" path="productInfo.quantity" placeholder="Quantity produced" />
          <FormField label="Package Size" path="productInfo.packageSize" placeholder="Package size/format" />
        </div>
      </div>

      {/* Compliance & Regulations */}
      <div className="bg-yellow-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Regulatory Compliance</h2>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regulations & Standards</h3>
        <div className="space-y-4 mb-6">
          {safeData.compliance.regulations.map((reg, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-white rounded border">
              <AutoResizingInput
                value={reg.regulation}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.compliance.regulations[index]) {
                    newData.compliance.regulations[index].regulation = value
                  }
                  onChange(newData)
                }}
                placeholder="Regulation (e.g., FDA, USDA)"
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg"
              />
              <AutoResizingInput
                value={reg.standard}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.compliance.regulations[index]) {
                    newData.compliance.regulations[index].standard = value
                  }
                  onChange(newData)
                }}
                placeholder="Standard/Code"
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg"
              />
              <AutoResizingSelect
                value={reg.compliance}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.compliance.regulations[index]) {
                    newData.compliance.regulations[index].compliance = value
                  }
                  onChange(newData)
                }}
                options={['Compliant', 'Not Applicable', 'Pending']}
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg"
              />
              <AutoResizingInput
                value={reg.notes}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.compliance.regulations[index]) {
                    newData.compliance.regulations[index].notes = value
                  }
                  onChange(newData)
                }}
                placeholder="Notes"
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg"
              />
              {!readOnly && (
                <button
                  onClick={() => removeRegulation(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {!readOnly && (
            <button
              onClick={addRegulation}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Regulation
            </button>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
        <div className="space-y-4">
          {safeData.compliance.certifications.map((cert, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-white rounded border">
              <AutoResizingInput
                value={cert.certification}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.compliance.certifications[index]) {
                    newData.compliance.certifications[index].certification = value
                  }
                  onChange(newData)
                }}
                placeholder="Certification Type"
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg"
              />
              <AutoResizingInput
                value={cert.certifyingBody}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.compliance.certifications[index]) {
                    newData.compliance.certifications[index].certifyingBody = value
                  }
                  onChange(newData)
                }}
                placeholder="Certifying Body"
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg"
              />
              <AutoResizingInput
                value={cert.certificateNumber}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.compliance.certifications[index]) {
                    newData.compliance.certifications[index].certificateNumber = value
                  }
                  onChange(newData)
                }}
                placeholder="Certificate Number"
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg"
              />
              <AutoResizingInput
                value={cert.validUntil}
                onChange={(value) => {
                  const newData = { ...safeData }
                  if (newData.compliance.certifications[index]) {
                    newData.compliance.certifications[index].validUntil = value
                  }
                  onChange(newData)
                }}
                type="date"
                readOnly={readOnly}
                className="px-3 py-2 border rounded-lg"
              />
              {!readOnly && (
                <button
                  onClick={() => removeCertification(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {!readOnly && (
            <button
              onClick={addCertification}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Certification
            </button>
          )}
        </div>
      </div>

      {/* Testing Results */}
      <div className="bg-red-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Testing & Quality Assurance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Microbiological Testing</h3>
            <FormField label="Total Plate Count" path="testing.microbiological.totalPlateCount" placeholder="< 10,000 cfu/g" />
            <FormField label="Yeast & Mold" path="testing.microbiological.yeastMold" placeholder="< 300 cfu/g" />
            <FormField label="Coliforms" path="testing.microbiological.coliforms" placeholder="< 1,000 cfu/g" />
            <FormField label="Salmonella" path="testing.microbiological.salmonella" placeholder="Absent/10g" />
            <FormField label="E. coli" path="testing.microbiological.ecoli" placeholder="Absent/10g" />
            <FormField label="S. aureus" path="testing.microbiological.staph" placeholder="Absent/10g" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chemical Testing</h3>
            <FormField label="Heavy Metals" path="testing.chemical.heavyMetals" placeholder="Within USP limits" />
            <FormField label="Pesticides" path="testing.chemical.pesticides" placeholder="Within FDA limits" />
            <FormField label="Residual Solvents" path="testing.chemical.residualSolvents" placeholder="Within USP limits" />
            <FormField label="Allergens" path="testing.chemical.allergens" placeholder="As declared" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Testing</h3>
            <FormField label="Appearance" path="testing.physical.appearance" placeholder="Conforms to spec" />
            <FormField label="Color" path="testing.physical.color" placeholder="Conforms to spec" />
            <FormField label="Odor" path="testing.physical.odor" placeholder="Characteristic" />
            <FormField label="Moisture" path="testing.physical.moisture" placeholder="< 5%" />
          </div>
        </div>
      </div>

      {/* Compliance Statement */}
      <div className="bg-purple-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Compliance Statement</h2>
        <FormField 
          label="Compliance Statement" 
          path="statement.complianceStatement" 
          placeholder="This product has been manufactured and tested in accordance with all applicable regulations..."
          rows={4}
        />
        <FormField 
          label="Limitations" 
          path="statement.limitations" 
          placeholder="This certificate applies only to the specific lot/batch tested..."
          rows={3}
        />
        <FormField 
          label="Validity Period" 
          path="statement.validityPeriod" 
          placeholder="This certificate is valid for the shelf life of the product"
        />
      </div>

      {/* Signatures */}
      <div className="bg-gray-100 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Approvals & Signatures</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Prepared By" path="signatures.preparedBy" placeholder="Name" />
            <FormField label="Title" path="signatures.preparedTitle" placeholder="Quality Analyst" />
            <FormField label="Date" path="signatures.preparedDate" type="date" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Approved By" path="signatures.approvedBy" placeholder="Name" />
            <FormField label="Title" path="signatures.approvedTitle" placeholder="Quality Manager" />
            <FormField label="Date" path="signatures.approvedDate" type="date" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Quality Manager" path="signatures.qualityManager" placeholder="Name" />
            <FormField label="Title" path="signatures.qualityManagerTitle" placeholder="QA Manager" />
            <FormField label="Date" path="signatures.qualityManagerDate" type="date" />
          </div>
        </div>
      </div>
    </div>
  )
})

export default COCForm
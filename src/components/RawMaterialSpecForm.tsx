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

interface RawMaterialSpecData {
  header: {
    dateEffective: string
    revision: string
    rawMaterialCode: string
    revisionNumber: string
    rawMaterialName: string
    botanical: string
  }
  testing: {
    physicalAppearance: string
    identity: string
    plantPartUsed: string
    extractSolvent: string
    potency: string
    bulkDensity: string
    meshSize: string
  }
  microbiology: {
    totalAerobicCount: string
    yeastMold: string
    enterobacteriaceae: string
    salmonella: string
    ecoli: string
    staph: string
  }
  heavyMetals: {
    arsenic: string
    cadmium: string
    lead: string
    mercury: string
  }
  safety: {
    pesticides: string
    residualSolvents: string
  }
  storage: {
    dateOfManufacture: string
    storageConditions: string
    samplingPlan: string
    minimumSampleQuantity: string
    storageTimeRetest: string
  }
  regulatory: {
    additives: string
    allergens: string
    claims: string
  }
  approval: {
    preparedBy: string
    preparedTitle: string
    preparedDate: string
    approvedBy: string
    approvedTitle: string
    approvedDate: string
  }
}

interface RawMaterialSpecFormProps {
  data: RawMaterialSpecData
  onChange: (data: RawMaterialSpecData) => void
  readOnly?: boolean
}

const RawMaterialSpecForm = memo(function RawMaterialSpecForm({ data, onChange, readOnly = false }: RawMaterialSpecFormProps) {
  console.log('RawMaterialSpecForm: Rendering at', Date.now())
  const updateField = useCallback((path: string, value: string) => {
    console.log('RawMaterialSpecForm: updateField called for path:', path, 'value:', value)
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
    console.log('RawMaterialSpecForm: calling onChange with new data')
    onChange(newData)
  }, [data, onChange])

  const FormField = ({ label, path, placeholder, type = "text", rows }: {
    label: string
    path: string
    placeholder?: string
    type?: string
    rows?: number
  }) => {
    const getValue = () => {
      const keys = path.split('.')
      let current: any = data
      for (const key of keys) {
        current = current?.[key]
      }
      return current || ''
    }

    const inputClassName = `w-full px-3 py-2 border rounded-lg text-black placeholder-black ${
      readOnly 
        ? 'bg-gray-100 border-gray-300' 
        : 'bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
    }`

    return (
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-900 mb-2">{label}</label>
        {rows ? (
          <IsolatedTextarea
            value={getValue()}
            onChange={(value) => updateField(path, value)}
            placeholder={placeholder}
            rows={rows}
            readOnly={readOnly}
            className={inputClassName}
          />
        ) : (
          <IsolatedInput
            value={getValue()}
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
      {/* Header */}
      <div className="bg-blue-50 p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Raw Material Specification</h1>
            <p className="text-gray-600">QA-004-01</p>
          </div>
          <div className="text-right">
            <div className="grid grid-cols-1 gap-2">
              <FormField label="Date Effective" path="header.dateEffective" type="date" />
              <FormField label="Revision" path="header.revision" placeholder="03" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Raw Material Code" path="header.rawMaterialCode" placeholder="Enter material code" />
          <FormField label="Revision #" path="header.revisionNumber" placeholder="Enter revision number" />
          <FormField label="Raw Material Name" path="header.rawMaterialName" placeholder="Enter material name" />
          <FormField label="Botanical" path="header.botanical" placeholder="Scientific name (if applicable)" />
        </div>
      </div>

      {/* Test Methods & Criteria */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Test Methods & Acceptance Criteria</h2>
        
        <div className="space-y-6">
          <FormField 
            label="Physical Appearance" 
            path="testing.physicalAppearance" 
            placeholder="Describe physical characteristics"
            rows={2}
          />
          
          <FormField 
            label="Identity" 
            path="testing.identity" 
            placeholder="Identity testing method and criteria"
            rows={2}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              label="Plant Part Used" 
              path="testing.plantPartUsed" 
              placeholder="Root, leaf, stem, etc."
            />
            <FormField 
              label="Extract Solvent" 
              path="testing.extractSolvent" 
              placeholder="Water, ethanol, etc."
            />
          </div>

          <FormField 
            label="Potency (HPLC or equivalent)" 
            path="testing.potency" 
            placeholder="Active compound concentration"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              label="Bulk Density (USP <616>)" 
              path="testing.bulkDensity" 
              placeholder="Loose density specification"
            />
            <FormField 
              label="Mesh Size (USP <786>)" 
              path="testing.meshSize" 
              placeholder="Particle size specification"
            />
          </div>
        </div>
      </div>

      {/* Microbiology */}
      <div className="bg-yellow-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Microbiology (USP &lt;62&gt;, &lt;2021&gt;, &lt;2022&gt;)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField 
            label="Total Aerobic Count" 
            path="microbiology.totalAerobicCount" 
            placeholder="NMT 3,000 cfu/g" 
          />
          <FormField 
            label="Combined Yeast and Mold" 
            path="microbiology.yeastMold" 
            placeholder="NMT 300 cfu/g" 
          />
          <FormField 
            label="Enterobacteriaceae" 
            path="microbiology.enterobacteriaceae" 
            placeholder="NMT 1,000 cfu/g" 
          />
          <FormField 
            label="Salmonella sp." 
            path="microbiology.salmonella" 
            placeholder="Absent" 
          />
          <FormField 
            label="Escherichia coli" 
            path="microbiology.ecoli" 
            placeholder="Absent" 
          />
          <FormField 
            label="Staphylococcus aureus" 
            path="microbiology.staph" 
            placeholder="Absent" 
          />
        </div>
      </div>

      {/* Heavy Metals */}
      <div className="bg-red-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Heavy Metals (USP &lt;2232&gt; ICP-MS)</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField 
            label="Arsenic" 
            path="heavyMetals.arsenic" 
            placeholder="NMT 1.5 ppm" 
          />
          <FormField 
            label="Cadmium" 
            path="heavyMetals.cadmium" 
            placeholder="NMT 0.5 ppm" 
          />
          <FormField 
            label="Lead" 
            path="heavyMetals.lead" 
            placeholder="NMT 1.0 ppm" 
          />
          <FormField 
            label="Mercury" 
            path="heavyMetals.mercury" 
            placeholder="NMT 0.2 ppm" 
          />
        </div>
      </div>

      {/* Safety Testing */}
      <div className="bg-orange-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Safety Testing</h2>
        <div className="space-y-4">
          <FormField 
            label="Pesticides (USP <561>, GC-MS and LC-MS)" 
            path="safety.pesticides" 
            placeholder="FDA/USDA/EPA Tolerance Limits for Food, Spices or Herbals"
            rows={2}
          />
          <FormField 
            label="Residual Solvents (USP <467>)" 
            path="safety.residualSolvents" 
            placeholder="USP <467> PDE Limits"
            rows={2}
          />
        </div>
        <div className="mt-4 p-3 bg-white rounded border-l-4 border-orange-400">
          <p className="text-sm text-orange-800">
            <strong>*</strong> Acceptance criteria verified through supplier Certificate of Analysis
          </p>
        </div>
      </div>

      {/* Storage and Handling */}
      <div className="bg-green-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Storage and Handling</h2>
        <div className="space-y-4">
          <FormField 
            label="Date of Manufacture" 
            path="storage.dateOfManufacture" 
            placeholder="75% or 18mo shelf life remaining"
          />
          <FormField 
            label="Storage Conditions" 
            path="storage.storageConditions" 
            placeholder="Temperature between 55° and 86° Fahrenheit, humidity at 60% or less"
            rows={2}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              label="Sampling Plan" 
              path="storage.samplingPlan" 
              placeholder="Per QC-002"
            />
            <FormField 
              label="Minimum Sample Quantity" 
              path="storage.minimumSampleQuantity" 
              placeholder="Per QC-002"
            />
          </div>
          <FormField 
            label="Storage Time Requiring Retest" 
            path="storage.storageTimeRetest" 
            placeholder="Retest date provided by Mfg on current COA"
          />
        </div>
      </div>

      {/* Regulatory Compliance */}
      <div className="bg-purple-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Regulatory Compliance</h2>
        <div className="space-y-4">
          <FormField 
            label="Additives" 
            path="regulatory.additives" 
            placeholder="N/A"
          />
          <FormField 
            label="Allergens (201qq FD&C)" 
            path="regulatory.allergens" 
            placeholder="N/A"
          />
          <FormField 
            label="Claims" 
            path="regulatory.claims" 
            placeholder="Gluten Free, Non-GMO, Vegan (as applicable)"
          />
        </div>
      </div>

      {/* Approval Section */}
      <div className="bg-gray-100 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Approvals</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Prepared by" path="approval.preparedBy" placeholder="Name" />
            <FormField label="Title" path="approval.preparedTitle" placeholder="Technical Director" />
            <FormField label="Date" path="approval.preparedDate" type="date" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Approved by" path="approval.approvedBy" placeholder="Name" />
            <FormField 
              label="Title" 
              path="approval.approvedTitle" 
              placeholder="Chief Science, Education, Quality & Regulatory Officer" 
            />
            <FormField label="Date" path="approval.approvedDate" type="date" />
          </div>
        </div>
      </div>
    </div>
  )
})

export default RawMaterialSpecForm
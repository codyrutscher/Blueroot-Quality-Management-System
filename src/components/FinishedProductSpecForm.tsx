'use client'

import { useState, useCallback, memo, useEffect, useRef } from 'react'

// Isolated input components
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

  useEffect(() => {
    if (initialValue !== localValue) {
      setLocalValue(initialValue)
    }
  }, [initialValue])

  useEffect(() => {
    return () => {
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
      onChange(newValue)
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

  useEffect(() => {
    if (initialValue !== localValue) {
      setLocalValue(initialValue)
    }
  }, [initialValue])

  useEffect(() => {
    return () => {
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
      onChange(newValue)
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

interface FinishedProductSpecData {
  productName: string
  productCode: string
  sizes: string
  revision: string
  dateRevised: string
  physicalAppearance: string
  dosingInfo: string
  organolepticTaste: string
  organolepticOdor: string
  fillWeight: string
  tabletingHardness: string
  tabletingFriability: string
  tabletingDisintegration: string
  bulkDensity: string
  particleSize: string
  microbiology: {
    totalAerobicCount: string
    enterobacteriaceae: string
    yeastMold: string
    salmonella: string
    ecoli: string
    staph: string
  }
  allergens: {
    peanuts: string
    treeNuts: string
    soy: string
    milk: string
    wheat: string
    gluten: string
    egg: string
    fish: string
    shellfish: string
    sesame: string
  }
  heavyMetals: {
    cadmium: string
    lead: string
    mercury: string
    arsenic: string
  }
  formulation: {
    ingredients: string
    analyticalMethod: string
    acceptableRange: string
    otherIngredients: string
    claims: string
  }
  packaging: {
    bulkProduct: string
    finishedProduct: string
    bottle: string
    cap: string
    neckBand: string
    label: string
    inserts: string
    secondaryPackaging: string
  }
  expiration: {
    expirationDate: string
    samplingPlan: string
    storageConditions: string
    storageTimeRetest: string
    minimumSampleQuantity: string
    retestSamplingPlan: string
    retestParameters: string
  }
  supplier: {
    site: string
    address: string
    phone: string
  }
  approval: {
    preparedBy: string
    preparedTitle: string
    preparedDate: string
    reviewedBy: string
    reviewedTitle: string
    reviewedDate: string
  }
}

interface FinishedProductSpecFormProps {
  data: FinishedProductSpecData
  onChange: (data: FinishedProductSpecData) => void
  readOnly?: boolean
}

export default function FinishedProductSpecForm({ data, onChange, readOnly = false }: FinishedProductSpecFormProps) {
  const updateField = (path: string, value: string) => {
    const keys = path.split('.')
    const newData = { ...data }
    let current: any = newData
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
    onChange(newData)
  }

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
      {/* Product Information Header */}
      <div className="bg-blue-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Product Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Product Name" path="productName" placeholder="Enter product name" />
          <FormField label="Product Code" path="productCode" placeholder="Enter product code" />
          <FormField label="Sizes" path="sizes" placeholder="Enter sizes" />
          <FormField label="Revision #" path="revision" placeholder="Enter revision number" />
          <FormField label="Date Revised" path="dateRevised" type="date" />
        </div>
      </div>

      {/* Test Methods & Acceptance Criteria */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Test Methods & Acceptance Criteria</h2>
        
        <div className="space-y-6">
          <FormField 
            label="Physical Appearance" 
            path="physicalAppearance" 
            placeholder="Include description of color, format (e.g., capsule, powder, softgel), and format size (e.g., #00)"
            rows={2}
          />
          
          <FormField 
            label="Dosing Information" 
            path="dosingInfo" 
            placeholder="Xx per serving, Xx per day"
            rows={2}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              label="Organoleptic - Taste" 
              path="organolepticTaste" 
              placeholder="Sweet-Sour-Bitter-Salty-Umami"
            />
            <FormField 
              label="Organoleptic - Odor" 
              path="organolepticOdor" 
              placeholder="1 None, 2 Faint/Mild, 3 Moderate, 4 Strong/Overpowering"
            />
          </div>

          <FormField 
            label="Fill Weight (USP <2091>)" 
            path="fillWeight" 
            placeholder="Target Weight (Powder + Shell), Fill Weight (Powder only)"
            rows={2}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField 
              label="Tableting Hardness" 
              path="tabletingHardness" 
              placeholder="Soft: 20–40 N, Moderate: 40–80 N, Hard: 80–160 N"
            />
            <FormField 
              label="Tableting Friability" 
              path="tabletingFriability" 
              placeholder="< 1.0% weight loss after 100 tumbles"
            />
            <FormField 
              label="Tableting Disintegration" 
              path="tabletingDisintegration" 
              placeholder="30 minutes or less"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Bulk Density" path="bulkDensity" />
            <FormField label="Particle Size" path="particleSize" />
          </div>
        </div>
      </div>

      {/* Microbiology */}
      <div className="bg-yellow-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Microbiology (USP &lt;62&gt;, &lt;2021&gt;, &lt;2022&gt;)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Total Aerobic Plate Count" path="microbiology.totalAerobicCount" placeholder="NMT 10,000 cfu/g" />
          <FormField label="Enterobacteriaceae" path="microbiology.enterobacteriaceae" placeholder="NMT 1,000 cfu/g" />
          <FormField label="Combined Yeast and Mold" path="microbiology.yeastMold" placeholder="NMT 300 cfu/g" />
          <FormField label="Salmonella sp." path="microbiology.salmonella" placeholder="Absent / 10g" />
          <FormField label="Escherichia coli" path="microbiology.ecoli" placeholder="Absent / 10g" />
          <FormField label="Staphylococcus aureus" path="microbiology.staph" placeholder="Absent / 10g" />
        </div>
      </div>

      {/* Allergens */}
      <div className="bg-red-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Allergens (ELISA / PCR Method)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Peanuts and peanut derivatives" path="allergens.peanuts" placeholder="If yes, list source" />
          <FormField label="Tree Nuts" path="allergens.treeNuts" placeholder="Specify type: almonds, walnuts, etc." />
          <FormField label="Soybean and soybean products" path="allergens.soy" placeholder="Soy flour, protein, lecithin" />
          <FormField label="Milk and milk derivatives" path="allergens.milk" />
          <FormField label="Wheat" path="allergens.wheat" />
          <FormField label="Gluten" path="allergens.gluten" placeholder="Wheat, rye, barley, oats, spelt" />
          <FormField label="Egg and egg derivatives" path="allergens.egg" />
          <FormField label="Fish and fish products" path="allergens.fish" placeholder="Specify species" />
          <FormField label="Shellfish and shellfish derivatives" path="allergens.shellfish" placeholder="Specify species" />
          <FormField label="Sesame" path="allergens.sesame" />
        </div>
      </div>

      {/* Heavy Metals */}
      <div className="bg-orange-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Heavy Metals (USP &lt;2232&gt; / CA Prop 65)</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField label="Cadmium" path="heavyMetals.cadmium" placeholder="NMT 5mcg/day (USP) / 4.1mcg/day (Prop 65)" />
          <FormField label="Lead" path="heavyMetals.lead" placeholder="NMT 10mcg/day (USP) / 0.5mcg/day (Prop 65)" />
          <FormField label="Mercury" path="heavyMetals.mercury" placeholder="NMT 15mcg/day (USP) / 0.3mcg/day (Prop 65)" />
          <FormField label="Arsenic" path="heavyMetals.arsenic" placeholder="NMT 15mcg/day (USP) / 10mcg/day (Prop 65)" />
        </div>
      </div>

      {/* Formulation */}
      <div className="bg-green-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Formulation</h2>
        <div className="space-y-4">
          <FormField label="Ingredients" path="formulation.ingredients" rows={3} placeholder="List all ingredients" />
          <FormField label="Analytical Method" path="formulation.analyticalMethod" placeholder="Testing method used" />
          <FormField label="Acceptable Range" path="formulation.acceptableRange" placeholder="NLT xx mg" />
          <FormField label="Other Ingredients" path="formulation.otherIngredients" rows={2} />
          <FormField label="Claims (Vegan, Non-GMO, Hypoallergenic)" path="formulation.claims" />
        </div>
      </div>

      {/* Packing Specifications */}
      <div className="bg-purple-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Packing Specifications</h2>
        <div className="space-y-4">
          <FormField 
            label="Bulk Product" 
            path="packaging.bulkProduct" 
            placeholder="Bulk packaged in double lined food grade plastic liner..." 
            rows={2}
          />
          <FormField label="Finished Product Description" path="packaging.finishedProduct" rows={2} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Bottle" path="packaging.bottle" />
            <FormField label="Cap" path="packaging.cap" placeholder="Child-resistant cap for iron products" />
            <FormField label="Neck Band" path="packaging.neckBand" />
            <FormField label="Label" path="packaging.label" />
            <FormField label="Inserts (i.e., Scoop)" path="packaging.inserts" />
            <FormField label="Secondary Packaging - Box" path="packaging.secondaryPackaging" />
          </div>
        </div>
      </div>

      {/* Expiration, Storage, and Sampling */}
      <div className="bg-indigo-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Expiration, Storage, and Sampling Plan</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              label="Expiration Date" 
              path="expiration.expirationDate" 
              placeholder="Based on stability data, XX months from manufacture"
            />
            <FormField label="Sampling Plan" path="expiration.samplingPlan" placeholder="Per QC-013" />
          </div>
          <FormField 
            label="Storage Conditions" 
            path="expiration.storageConditions" 
            placeholder="Temperature between 55°-86°F, humidity ≤70%"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Storage Time Requiring Retest" path="expiration.storageTimeRetest" placeholder="24mo, 36mo" />
            <FormField label="Minimum Sample Quantity" path="expiration.minimumSampleQuantity" placeholder="Per QC-013" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Re-Test Sampling Plan" path="expiration.retestSamplingPlan" placeholder="Per QC-013" />
            <FormField 
              label="Re-Test Parameters Required" 
              path="expiration.retestParameters" 
              placeholder="Potency and/or Microbiology profile as indicated in QC-013"
            />
          </div>
        </div>
      </div>

      {/* Supplier/Manufacturer */}
      <div className="bg-teal-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Supplier/Manufacturer Site</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Site" path="supplier.site" placeholder="Supplier/Manufacturer name" />
          <FormField label="Phone" path="supplier.phone" placeholder="Phone number" />
        </div>
        <FormField label="Address" path="supplier.address" rows={2} placeholder="Complete address" />
      </div>

      {/* Approval Section */}
      <div className="bg-gray-100 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Approvals</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Prepared By" path="approval.preparedBy" placeholder="Name" />
            <FormField label="Title" path="approval.preparedTitle" placeholder="Job title" />
            <FormField label="Date" path="approval.preparedDate" type="date" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Reviewed By" path="approval.reviewedBy" placeholder="Name" />
            <FormField label="Title" path="approval.reviewedTitle" placeholder="Job title" />
            <FormField label="Date" path="approval.reviewedDate" type="date" />
          </div>
        </div>
      </div>

      <div className="bg-blue-100 p-4 rounded-lg">
        <p className="text-sm text-blue-800 font-medium">
          <strong>Note:</strong> These specifications also apply to all private label Blueroot Health® products for contract customers.
        </p>
      </div>
    </div>
  )
}
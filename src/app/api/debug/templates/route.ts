import { NextResponse } from 'next/server'

// All 10 QMS Templates for Manufacturing Portal
const debugTemplates = [
  {
    id: 'tmpl-raw-material',
    name: 'Raw Material Specification',
    description: 'Template for raw material specifications and quality requirements',
    type: 'RAW_MATERIAL_SPEC',
    content: {
      materialInfo: { materialName: '', supplierName: '', lotNumber: '', receiptDate: '', certificateNumber: '' },
      specifications: { appearance: '', color: '', odor: '', moisture: '', purity: '', pH: '', density: '' },
      tests: [
        { testName: 'Identity Test', method: '', specification: '', result: '', passFail: '' },
        { testName: 'Purity Assay', method: '', specification: '', result: '', passFail: '' },
        { testName: 'Moisture Content', method: '', specification: '', result: '', passFail: '' }
      ],
      storage: 'Store in cool, dry place away from direct sunlight',
      handling: 'Handle with appropriate PPE. Avoid contamination.',
      approvals: { qualityManager: '', regulatoryApproval: '', finalApproval: '' }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    creator: { name: 'Demo User' }
  },
  {
    id: 'tmpl-finished-goods',
    name: 'Finished Goods Specification',
    description: 'Template for finished product specifications',
    type: 'FINISHED_GOODS_SPEC',
    content: {
      productInfo: { productName: '', sku: '', version: '1.0', effectiveDate: '', revision: '' },
      specifications: { 
        appearance: 'White to off-white powder/capsule', 
        color: 'White to off-white', 
        odor: 'Characteristic, no off odors', 
        taste: 'Characteristic, acceptable', 
        physicalForm: 'Capsule/Tablet/Powder' 
      },
      ingredients: [
        { name: '', amount: '', unit: 'mg', function: '', specifications: '' }
      ],
      nutritionalInfo: {
        servingSize: '1 capsule',
        servingsPerContainer: '',
        nutrients: [
          { name: 'Vitamin A', amount: '', unit: 'mcg', dailyValue: '' },
          { name: 'Vitamin C', amount: '', unit: 'mg', dailyValue: '' }
        ]
      },
      qualityTests: [
        { test: 'Disintegration', specification: 'NMT 30 minutes', method: 'USP <701>' },
        { test: 'Content Uniformity', specification: '85-115%', method: 'USP <905>' }
      ],
      packaging: {
        primaryPackaging: 'HDPE bottle with child-resistant closure',
        secondaryPackaging: 'Carton box',
        labeling: 'FDA compliant labeling'
      },
      storage: { conditions: 'Store at 20-25°C (68-77°F)', shelfLife: '24 months' },
      approvals: { qualityAssurance: '', regulatory: '', management: '' }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    creator: { name: 'Demo User' }
  },
  {
    id: 'tmpl-ccr',
    name: 'Critical Control Record (CCR)',
    description: 'Template for critical control records and monitoring',
    type: 'CCR',
    content: {
      batchInfo: { batchNumber: '', productName: '', manufacturingDate: '', expiryDate: '', operator: '' },
      criticalControlPoints: [
        { step: 'Weighing', hazard: 'Incorrect weights', criticalLimit: '±2%', monitoring: 'Scale verification', correctionAction: 'Re-weigh materials' },
        { step: 'Mixing', hazard: 'Inadequate blending', criticalLimit: '95% blend uniformity', monitoring: 'Blend time monitoring', correctionAction: 'Continue mixing' }
      ],
      monitoring: [
        { time: '', temperature: '', pH: '', moisture: '', operator: '', action: 'Within limits' }
      ],
      correctionActions: [],
      verification: 'All critical control points monitored and within specifications',
      approvals: { productionManager: '', qualityManager: '', finalApproval: '' }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    creator: { name: 'Demo User' }
  },
  {
    id: 'tmpl-label-manuscript',
    name: 'Label Manuscript',
    description: 'Template for product label manuscripts and artwork specifications',
    type: 'LABEL_MANUSCRIPT',
    content: {
      productInfo: { productName: '', sku: '', version: '', artworkVersion: '', effectiveDate: '' },
      labelSpecs: { 
        dimensions: 'Length x Width', 
        material: 'Paper/Film', 
        colors: 'CMYK + Spot colors', 
        finish: 'Matte/Gloss',
        printMethod: 'Flexographic/Digital'
      },
      textContent: {
        productName: '',
        brandName: '',
        netWeight: '',
        ingredients: 'List in descending order by weight',
        directions: 'Take 1 capsule daily with food',
        warnings: 'Keep out of reach of children'
      },
      nutritionalPanel: {
        servingSize: '1 capsule',
        calories: '',
        nutrients: [
          { name: 'Vitamin A', amount: '', unit: 'mcg', dailyValue: '' }
        ]
      },
      claims: ['Supports daily nutrition', 'Third-party tested'],
      warnings: ['Keep out of reach of children', 'Do not exceed recommended dose'],
      approvals: { marketing: '', regulatory: '', qualityAssurance: '', finalApproval: '' }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    creator: { name: 'Demo User' }
  },
  {
    id: 'tmpl-psf',
    name: 'Product Specification File (PSF)',
    description: 'Template for comprehensive product specification files',
    type: 'PSF',
    content: {
      productDetails: { name: '', sku: '', version: '', category: '', description: '', targetMarket: '' },
      formulation: {
        activeIngredients: [
          { name: '', amount: '', unit: '', function: '', source: '', specifications: '' }
        ],
        inactiveIngredients: [
          { name: '', amount: '', unit: '', function: '' }
        ],
        totalWeight: ''
      },
      manufacturing: {
        process: 'Blending, Encapsulation, Quality Testing, Packaging',
        equipment: 'Blender, Encapsulator, Testing equipment',
        batchSize: '',
        yield: '95-98%'
      },
      packaging: {
        primaryPackage: 'HDPE bottle',
        secondaryPackage: 'Carton',
        shippingContainer: 'Corrugated box'
      },
      labeling: {
        frontPanel: 'Product name, brand, net weight',
        backPanel: 'Ingredients, directions, warnings',
        nutritionFacts: 'FDA format'
      },
      storage: {
        temperature: '20-25°C (68-77°F)',
        humidity: '<60% RH',
        lightProtection: 'Protect from light',
        shelfLife: '24 months'
      },
      distribution: {
        shippingRequirements: 'Ambient temperature',
        handlingInstructions: 'Handle with care'
      },
      approvals: { formulation: '', manufacturing: '', packaging: '', regulatory: '', finalApproval: '' }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    creator: { name: 'Demo User' }
  },
  {
    id: 'tmpl-bom',
    name: 'Bill of Materials (BOM)',
    description: 'Template for bill of materials and component specifications',
    type: 'BOM',
    content: {
      productInfo: { productName: '', sku: '', version: '', revision: '', batchSize: '10,000 units' },
      materials: [
        { itemNumber: '', description: '', supplier: '', quantity: '', unit: 'kg', cost: '', specifications: 'USP grade' }
      ],
      packaging: [
        { component: 'HDPE Bottle', supplier: '', quantity: '', unit: 'pieces', cost: '' },
        { component: 'Child-resistant cap', supplier: '', quantity: '', unit: 'pieces', cost: '' }
      ],
      labels: [
        { labelType: 'Primary label', supplier: '', quantity: '', specifications: 'FDA compliant' }
      ],
      totalWeight: '',
      yield: '95%',
      costSummary: {
        materialCost: '',
        packagingCost: '',
        labelCost: '',
        totalCost: ''
      },
      approvals: { procurement: '', manufacturing: '', qualityAssurance: '', finalApproval: '' }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    creator: { name: 'Demo User' }
  },
  {
    id: 'tmpl-mmr',
    name: 'Master Manufacturing Record (MMR)',
    description: 'Template for master manufacturing records and procedures',
    type: 'MMR',
    content: {
      productInfo: { productName: '', batchSize: '', version: '', revision: '', effectiveDate: '' },
      ingredients: [
        { ingredient: '', quantity: '', unit: 'kg', specifications: 'USP grade', supplier: '', lotNumber: '' }
      ],
      equipment: [
        { equipmentId: '', description: 'Blender', settings: 'Speed: 50 RPM, Time: 10 min', calibrationDue: '' }
      ],
      procedures: [
        { step: '1', instruction: 'Weigh all ingredients according to BOM', criticalParameter: 'Weight accuracy', acceptanceCriteria: '±2%', operator: '' },
        { step: '2', instruction: 'Blend ingredients for specified time', criticalParameter: 'Blend time', acceptanceCriteria: '10 ± 1 min', operator: '' }
      ],
      qualityControls: [
        { testPoint: 'After blending', test: 'Blend uniformity', method: 'Visual inspection', acceptanceCriteria: 'Uniform color', frequency: 'Each batch' }
      ],
      packaging: [
        { component: 'Capsules', quantity: '', specifications: 'Size 0, clear', supplier: '' }
      ],
      approvals: { production: '', quality: '', regulatory: '', finalApproval: '' }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    creator: { name: 'Demo User' }
  },
  {
    id: 'tmpl-coa',
    name: 'Certificate of Analysis (COA)',
    description: 'Template for certificate of analysis documents',
    type: 'COA',
    content: {
      batchInfo: {
        batchNumber: '',
        productName: '',
        lotNumber: '',
        manufacturingDate: '',
        expiryDate: '',
        testDate: '',
        releaseDate: ''
      },
      specifications: [
        { parameter: 'Appearance', specification: 'White to off-white powder', method: 'Visual', result: '', passFail: '' },
        { parameter: 'Identity', specification: 'Positive', method: 'HPLC', result: '', passFail: '' }
      ],
      microbiological: [
        { test: 'Total Plate Count', method: 'USP <61>', specification: '<1000 CFU/g', result: '', passFail: '' },
        { test: 'E. coli', method: 'USP <61>', specification: 'Negative', result: '', passFail: '' }
      ],
      physical: [
        { parameter: 'Loss on Drying', specification: '≤5.0%', result: '', passFail: '' },
        { parameter: 'Particle Size', specification: '90% through 40 mesh', result: '', passFail: '' }
      ],
      chemical: [
        { parameter: 'Assay', specification: '90.0-110.0%', result: '', passFail: '' },
        { parameter: 'Heavy Metals', specification: '≤10 ppm', result: '', passFail: '' }
      ],
      conclusion: 'This batch meets all specifications and is released for distribution.',
      testedBy: '',
      reviewedBy: '',
      approvedBy: '',
      approvals: { analyst: '', supervisor: '', qualityManager: '', finalApproval: '' }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    creator: { name: 'Demo User' }
  },
  {
    id: 'tmpl-coc',
    name: 'Certificate of Compliance (COC)',
    description: 'Template for certificate of compliance documents',
    type: 'COC',
    content: {
      productInfo: {
        productName: '',
        batchNumber: '',
        lotNumber: '',
        complianceDate: '',
        certificateNumber: ''
      },
      regulations: [
        { regulation: 'FDA 21 CFR Part 111', requirement: 'cGMP compliance', complianceStatus: 'Compliant', evidence: 'Manufacturing records' },
        { regulation: 'DSHEA', requirement: 'Dietary supplement regulations', complianceStatus: 'Compliant', evidence: 'Product formulation' }
      ],
      standards: [
        { standard: 'USP', requirement: 'Ingredient standards', complianceStatus: 'Compliant', testMethod: 'HPLC', result: 'Meets specification' }
      ],
      certifications: [
        { certification: 'NSF Certified', issuingBody: 'NSF International', certificateNumber: '', expiryDate: '', scope: 'Manufacturing facility' }
      ],
      complianceStatement: 'This product has been manufactured and tested in accordance with applicable regulations and standards.',
      manufacturingFacility: {
        name: '',
        address: '',
        license: 'FDA Food Facility Registration',
        inspectionDate: ''
      },
      approvals: { qualityManager: '', regulatoryAffairs: '', authorizedSignatory: '', finalApproval: '' }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    creator: { name: 'Demo User' }
  },
  {
    id: 'tmpl-pis',
    name: 'Product Information Sheet (PIS)',
    description: 'Template for product information sheets',
    type: 'PIS',
    content: {
      productInfo: {
        productName: '',
        sku: '',
        version: '',
        lastUpdated: '',
        category: 'Dietary Supplement'
      },
      description: '',
      intendedUse: 'For healthy adults',
      targetAudience: '',
      indications: '',
      dosage: {
        recommendedDose: '1 capsule',
        frequency: 'Once daily',
        duration: 'As needed',
        specialInstructions: 'Take with food'
      },
      ingredients: [
        { name: '', amount: '', unit: 'mg', function: '', source: 'Natural/Synthetic' }
      ],
      nutritionalInformation: {
        servingSize: '1 capsule',
        nutrients: [
          { name: 'Vitamin A', amount: '', unit: 'mcg', dailyValue: '' }
        ]
      },
      warnings: [
        'Keep out of reach of children',
        'Do not exceed recommended dose',
        'Consult healthcare professional before use'
      ],
      contraindications: [],
      sideEffects: 'No known side effects when used as directed',
      storageInstructions: 'Store in a cool, dry place',
      manufacturerInfo: {
        name: 'Blue Root Holdings',
        address: '',
        phone: '',
        email: '',
        website: ''
      },
      regulatoryInfo: {
        fdaStatus: 'Dietary Supplement',
        claims: [],
        disclaimers: '*This statement has not been evaluated by the FDA'
      },
      approvals: { marketing: '', regulatory: '', medical: '', finalApproval: '' }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    creator: { name: 'Demo User' }
  }
]

// Add the 3 missing templates to make it 10 total
debugTemplates.splice(7, 0, 
  {
    id: 'tmpl-validation',
    name: 'Process Validation Protocol',
    description: 'Template for manufacturing process validation',
    type: 'VALIDATION',
    content: {
      processInfo: { processName: '', version: '', validationDate: '', nextRevalidation: '' },
      equipment: [{ name: '', model: '', calibrationStatus: '', qualificationStatus: '' }],
      parameters: [{ parameter: '', target: '', range: '', method: '' }],
      testResults: [],
      conclusion: '',
      approvals: { validation: '', quality: '', finalApproval: '' }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    creator: { name: 'Demo User' }
  },
  {
    id: 'tmpl-deviation',
    name: 'Deviation Report',
    description: 'Template for documenting and investigating deviations',
    type: 'DEVIATION',
    content: {
      deviationInfo: { number: '', date: '', reporter: '', severity: 'Minor' },
      description: '',
      investigation: { rootCause: '', evidence: '', impact: '' },
      correctiveActions: [{ action: '', responsible: '', dueDate: '', status: 'Open' }],
      preventiveActions: [],
      approvals: { investigator: '', qualityManager: '', finalApproval: '' }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    creator: { name: 'Demo User' }
  },
  {
    id: 'tmpl-change-control',
    name: 'Change Control Record',
    description: 'Template for managing changes to processes, equipment, or documents',
    type: 'CHANGE_CONTROL',
    content: {
      changeInfo: { number: '', requestDate: '', requestor: '', priority: 'Medium' },
      description: '',
      justification: '',
      impact: { quality: '', safety: '', regulatory: '', cost: '' },
      implementation: { steps: [], timeline: '', responsible: '' },
      testing: { required: false, plan: '', results: '' },
      approvals: { technical: '', quality: '', regulatory: '', management: '', finalApproval: '' }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    creator: { name: 'Demo User' }
  }
)

export async function GET() {
  return NextResponse.json({ templates: debugTemplates })
}
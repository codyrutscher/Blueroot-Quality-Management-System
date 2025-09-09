const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const templates = [
  {
    id: 'tmpl-raw-material',
    name: 'Raw Material Spec Template.docx',
    description: 'Template for raw material specifications and quality requirements',
    type: 'RAW_MATERIAL_SPEC',
    content: {
      materialInfo: { materialName: '', supplierName: '', lotNumber: '', receiptDate: '' },
      specifications: { appearance: '', color: '', odor: '', moisture: '', purity: '' },
      tests: [], storage: '', handling: '', approvals: {}
    }
  },
  {
    id: 'tmpl-finished-goods',
    name: 'QA-004-02 Finished Product Specification Rev 05.docx',
    description: 'Template for finished product specifications',
    type: 'FINISHED_GOODS_SPEC',
    content: {
      productInfo: { productName: '', sku: '', version: '1.0', effectiveDate: '' },
      specifications: { appearance: '', color: '', odor: '', taste: '', physicalForm: '' },
      ingredients: [], nutritionalInfo: {}, qualityTests: [], packaging: {}, storage: {}, approvals: {}
    }
  },
  {
    id: 'tmpl-psf',
    name: 'PSF TEMPLATE BRH.docx',
    description: 'Template for comprehensive product specification files',
    type: 'PSF',
    content: {
      productDetails: { name: '', sku: '', version: '', category: '' },
      formulation: {}, manufacturing: {}, packaging: {}, labeling: {}, storage: {}, distribution: {}, approvals: {}
    }
  },
  {
    id: 'tmpl-label-manuscript',
    name: 'Label Manuscript.docx',
    description: 'Template for product label manuscripts and artwork specifications',
    type: 'LABEL_MANUSCRIPT',
    content: {
      productInfo: { productName: '', sku: '', version: '' },
      labelSpecs: { dimensions: '', material: '', colors: '', finish: '' },
      textContent: {}, nutritionalPanel: {}, claims: [], warnings: [], approvals: {}
    }
  },
  {
    id: 'tmpl-coc-1',
    name: 'COC - Vital Nutrients.docx',
    description: 'Certificate of Compliance - Vital Nutrients',
    type: 'COC',
    content: {
      productInfo: { productName: '', batchNumber: '', complianceDate: '' },
      regulations: [], standards: [], certifications: [], complianceStatement: '', approvals: {}
    }
  },
  {
    id: 'tmpl-coc-2',
    name: 'COC - Fairhaven Health.docx',
    description: 'Certificate of Compliance - Fairhaven Health',
    type: 'COC',
    content: {
      productInfo: { productName: '', batchNumber: '', complianceDate: '' },
      regulations: [], standards: [], certifications: [], complianceStatement: '', approvals: {}
    }
  },
  {
    id: 'tmpl-coc-3',
    name: 'COC - Bariatric Fusion.docx',
    description: 'Certificate of Compliance - Bariatric Fusion',
    type: 'COC',
    content: {
      productInfo: { productName: '', batchNumber: '', complianceDate: '' },
      regulations: [], standards: [], certifications: [], complianceStatement: '', approvals: {}
    }
  },
  {
    id: 'tmpl-coa-1',
    name: 'COA - Vital Nutrients.doc',
    description: 'Certificate of Analysis - Vital Nutrients',
    type: 'COA',
    content: {
      batchInfo: { batchNumber: '', productName: '', testDate: '', releaseDate: '' },
      specifications: [], testResults: [], conclusion: '', testedBy: '', approvedBy: '', approvals: {}
    }
  },
  {
    id: 'tmpl-coa-2',
    name: 'COA - Fairhaven Health.doc',
    description: 'Certificate of Analysis - Fairhaven Health',
    type: 'COA',
    content: {
      batchInfo: { batchNumber: '', productName: '', testDate: '', releaseDate: '' },
      specifications: [], testResults: [], conclusion: '', testedBy: '', approvedBy: '', approvals: {}
    }
  },
  {
    id: 'tmpl-coa-3',
    name: 'COA - Bariatric Fusion.doc',
    description: 'Certificate of Analysis - Bariatric Fusion',
    type: 'COA',
    content: {
      batchInfo: { batchNumber: '', productName: '', testDate: '', releaseDate: '' },
      specifications: [], testResults: [], conclusion: '', testedBy: '', approvedBy: '', approvals: {}
    }
  }
]

async function main() {
  // Get admin user
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!adminUser) {
    console.log('No admin user found, creating templates with placeholder user')
    return
  }

  for (const template of templates) {
    try {
      await prisma.template.upsert({
        where: { id: template.id },
        update: {},
        create: {
          ...template,
          createdBy: adminUser.id
        }
      })
      console.log(`✅ Created template: ${template.name}`)
    } catch (error) {
      console.error(`❌ Error creating template ${template.name}:`, error)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
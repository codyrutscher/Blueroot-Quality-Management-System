'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { 
  XMarkIcon, 
  DocumentArrowDownIcon,
  ShareIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ClockIcon,
  PencilIcon,
  DocumentCheckIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import mammoth from 'mammoth'
import { saveAs } from 'file-saver'
import FinishedProductSpecForm from './FinishedProductSpecForm'
import RawMaterialSpecForm from './RawMaterialSpecForm'
import PSFTemplateForm from './PSFTemplateForm'
import LabelManuscriptForm from './LabelManuscriptForm'
import COCForm from './COCForm'
import COAForm from './COAForm'

interface DocxEditorProps {
  templatePath: string
  templateName: string
  documentId?: string
  documentData?: any
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
}

interface WorkflowStep {
  id: string
  name: string
  email: string
  role: string
  department?: string
  status: 'pending' | 'editing' | 'completed' | 'approved'
  completedAt?: string
  comments?: string
}

interface DocumentVersion {
  id: string
  version: number
  editedBy: string
  editedAt: string
  content: string
  comments: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

export default function DocxEditor({ templatePath, templateName, documentId, documentData, isOpen, onClose, onSave }: DocxEditorProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showWorkflowModal, setShowWorkflowModal] = useState(false)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [collaborators, setCollaborators] = useState<string[]>([])
  const [activeCollaborators, setActiveCollaborators] = useState<User[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [realtimeChanges, setRealtimeChanges] = useState<{[key: string]: string}>({})
  const [collaboratorCursors, setCollaboratorCursors] = useState<{[key: string]: {x: number, y: number, user: User}}>({})
  const [isCollaborating, setIsCollaborating] = useState(false)
  const [documentTitle, setDocumentTitle] = useState('')
  const [productAssignment, setProductAssignment] = useState('')
  const [editComments, setEditComments] = useState('')
  const [isReadOnly, setIsReadOnly] = useState(false)
  
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Company users - will be fetched from API
  const [companyUsers, setCompanyUsers] = useState<User[]>([
    {
      id: 'user-john-troup',
      name: 'John Troup',
      email: 'john.troup@company.com',
      role: 'MANAGER',
      department: 'Quality Assurance'
    },
    {
      id: 'user-matt-white',
      name: 'Matt White',
      email: 'matt.white@company.com',
      role: 'USER',
      department: 'Manufacturing'
    },
    {
      id: 'user-nick-hafften',
      name: 'Nick Hafften',
      email: 'nick.hafften@company.com',
      role: 'USER',
      department: 'Manufacturing'
    },
    {
      id: 'user-steve-nelson',
      name: 'Steve Nelson',
      email: 'steve.nelson@company.com',
      role: 'MANAGER',
      department: 'Operations'
    },
    {
      id: 'user-nick-deloia',
      name: 'Nick Deloia',
      email: 'nick.deloia@company.com',
      role: 'USER',
      department: 'Manufacturing'
    },
    {
      id: 'user-jenn-doucette',
      name: 'Jenn Doucette',
      email: 'jenn.doucette@company.com',
      role: 'USER',
      department: 'Quality Assurance'
    },
    {
      id: 'user-dana-rutscher',
      name: 'Dana Rutscher',
      email: 'dana.rutscher@company.com',
      role: 'ADMIN',
      department: 'Management'
    },
    {
      id: 'user-shefali-pandey',
      name: 'Shefali Pandey',
      email: 'shefali.pandey@company.com',
      role: 'USER',
      department: 'R&D'
    },
    {
      id: 'user-whitney-palmerton',
      name: 'Whitney Palmerton',
      email: 'whitney.palmerton@company.com',
      role: 'USER',
      department: 'Quality Assurance'
    }
  ])

  // Workflow steps with real company users
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    {
      id: '1',
      name: 'Jenn Doucette',
      email: 'jenn.doucette@company.com',
      role: 'Quality Specialist',
      department: 'Quality Assurance',
      status: 'editing'
    },
    {
      id: '2',
      name: 'Matt White',
      email: 'matt.white@company.com',
      role: 'Manufacturing Lead',
      department: 'Manufacturing',
      status: 'pending'
    },
    {
      id: '3',
      name: 'Dana Rutscher',
      email: 'dana.rutscher@company.com',
      role: 'Department Head',
      department: 'Management',
      status: 'pending'
    }
  ])

  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchCompanyUsers()
      if (documentId) {
        loadDocument()
      } else if (templatePath) {
        loadTemplate()
        setDocumentTitle(`${templateName} - ${new Date().toLocaleDateString()}`)
      }
    }
  }, [isOpen, templatePath, templateName, documentId])

  const fetchCompanyUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      if (data.users) {
        setCompanyUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching company users:', error)
      // Keep the default users if API fails
    }
  }

  // Simulate real-time collaboration effects
  useEffect(() => {
    if (activeCollaborators.length > 0 && !isCollaborating) {
      setIsCollaborating(true)
      
      // Simulate collaborative cursors and edits
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {  // 30% chance of simulated activity
          const randomUser = activeCollaborators[Math.floor(Math.random() * activeCollaborators.length)]
          
          // Simulate cursor movement
          setCollaboratorCursors(prev => ({
            ...prev,
            [randomUser.id]: {
              x: Math.random() * 800 + 100,
              y: Math.random() * 400 + 200,
              user: randomUser
            }
          }))

          // Simulate small text changes occasionally
          if (Math.random() > 0.9) {
            console.log(`✨ ${randomUser.name} is typing...`)
            // You could show typing indicators here
          }
        }
      }, 3000)

      return () => {
        clearInterval(interval)
        setIsCollaborating(false)
        setCollaboratorCursors({})
      }
    }
  }, [activeCollaborators])

  const loadTemplate = async () => {
    setLoading(true)
    try {
      // Initialize form data based on template type
      const initialFormData = initializeFormData(templateName)
      setFormData(initialFormData)
      setOriginalContent(JSON.stringify(initialFormData))
    } catch (error) {
      console.error('Error loading template:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDocument = async () => {
    setLoading(true)
    try {
      if (documentData) {
        // Use provided document data
        console.log('Loading document from provided data:', documentData)
        const parsedContent = typeof documentData === 'string' ? JSON.parse(documentData) : documentData
        console.log('Parsed content for form:', parsedContent)
        setFormData(parsedContent)
        setOriginalContent(JSON.stringify(parsedContent))
        setDocumentTitle(templateName) // Use templateName as document title
      } else {
        // Fetch document from API
        console.log('Fetching document from API:', documentId)
        const response = await fetch(`/api/documents/${documentId}`)
        if (response.ok) {
          const data = await response.json()
          const document = data.document
          console.log('Document loaded from API:', document)
          console.log('Document content (raw):', document.content)
          
          const parsedContent = typeof document.content === 'string' ? JSON.parse(document.content) : document.content
          console.log('Parsed content for form:', parsedContent)
          
          setFormData(parsedContent || {})
          setOriginalContent(JSON.stringify(parsedContent || {}))
          setDocumentTitle(document.title)
          
          // Update templateName to match the document's template for proper form rendering
          if (document.template?.name) {
            console.log('Document template name:', document.template.name)
          }
        }
      }
    } catch (error) {
      console.error('Error loading document:', error)
      // Fallback - show JSON editor
      setFormData({})
      setOriginalContent('{}')
    } finally {
      setLoading(false)
    }
  }

  const initializeFormData = useCallback((templateName: string) => {
    switch (templateName) {
      case 'QA-004-02 Finished Product Specification Rev 05.docx':
        return {
          productName: '',
          productCode: '',
          sizes: '',
          revision: '',
          dateRevised: '',
          physicalAppearance: '',
          dosingInfo: '',
          organolepticTaste: '',
          organolepticOdor: '',
          fillWeight: '',
          tabletingHardness: '',
          tabletingFriability: '',
          tabletingDisintegration: '',
          bulkDensity: '',
          particleSize: '',
          microbiology: {
            totalAerobicCount: '',
            enterobacteriaceae: '',
            yeastMold: '',
            salmonella: '',
            ecoli: '',
            staph: ''
          },
          allergens: {
            peanuts: '',
            treeNuts: '',
            soy: '',
            milk: '',
            wheat: '',
            gluten: '',
            egg: '',
            fish: '',
            shellfish: '',
            sesame: ''
          },
          heavyMetals: {
            cadmium: '',
            lead: '',
            mercury: '',
            arsenic: ''
          },
          formulation: {
            ingredients: '',
            analyticalMethod: '',
            acceptableRange: '',
            otherIngredients: '',
            claims: ''
          },
          packaging: {
            bulkProduct: '',
            finishedProduct: '',
            bottle: '',
            cap: '',
            neckBand: '',
            label: '',
            inserts: '',
            secondaryPackaging: ''
          },
          expiration: {
            expirationDate: '',
            samplingPlan: '',
            storageConditions: '',
            storageTimeRetest: '',
            minimumSampleQuantity: '',
            retestSamplingPlan: '',
            retestParameters: ''
          },
          supplier: {
            site: '',
            address: '',
            phone: ''
          },
          approval: {
            preparedBy: '',
            preparedTitle: '',
            preparedDate: '',
            reviewedBy: '',
            reviewedTitle: '',
            reviewedDate: ''
          }
        }

      case 'Raw Material Spec Template.docx':
        return {
          header: {
            dateEffective: new Date().toISOString().split('T')[0],
            revision: '01',
            rawMaterialCode: '',
            revisionNumber: '',
            rawMaterialName: '',
            botanical: ''
          },
          testing: {
            physicalAppearance: '',
            identity: '',
            plantPartUsed: '',
            extractSolvent: '',
            potency: '',
            bulkDensity: '',
            meshSize: ''
          },
          microbiology: {
            totalAerobicCount: '',
            yeastMold: '',
            enterobacteriaceae: '',
            salmonella: '',
            ecoli: '',
            staph: ''
          },
          heavyMetals: {
            arsenic: '',
            cadmium: '',
            lead: '',
            mercury: ''
          },
          safety: {
            pesticides: '',
            residualSolvents: ''
          },
          storage: {
            dateOfManufacture: '',
            storageConditions: '',
            samplingPlan: '',
            minimumSampleQuantity: '',
            storageTimeRetest: ''
          },
          regulatory: {
            additives: '',
            allergens: '',
            claims: ''
          },
          approval: {
            preparedBy: '',
            preparedTitle: '',
            preparedDate: '',
            approvedBy: '',
            approvedTitle: '',
            approvedDate: ''
          }
        }

      case 'PSF TEMPLATE BRH.docx':
        return {
          productSummary: {
            sku: '',
            salesDescription: '',
            psfSubmittalDate: '',
            psfRevision: '',
            productType: '',
            brand: '',
            healthCategory: '',
            nutrientType: '',
            therapeuticPlatform: '',
            pilotRequired: '',
            intendedReleaseDate: ''
          },
          rawMaterials: '',
          blending: {
            routing: ''
          },
          bulkBOM: {
            items: [
              { itemCode: '', itemDescription: 'Blend Item', bomQuantity: '', units: 'G' },
              { itemCode: '', itemDescription: 'Capsule', bomQuantity: '1', units: 'Each' }
            ],
            routing: ''
          },
          label: {
            labelItemCode: '',
            labelItemDescription: '',
            upc: ''
          },
          finishedGoodsBOM: {
            items: [
              { inventoryItem: '', itemDescription: 'Bulk', bomQty: '', units: 'each' },
              { inventoryItem: '', itemDescription: 'Bottle', bomQty: '1', units: 'each' },
              { inventoryItem: '', itemDescription: 'Lid', bomQty: '1', units: 'each' },
              { inventoryItem: '', itemDescription: 'Shrink', bomQty: '1', units: 'each' },
              { inventoryItem: '', itemDescription: 'Label', bomQty: '1', units: 'each' }
            ]
          },
          demandPlanning: {
            forecastNext12Months: '',
            requestedOrderQuantity: '',
            requestedOrderCapsules: '',
            monthsOnHand: ''
          },
          formularySheet: ''
        }

      case 'Label Manuscript.docx':
        return {
          productInfo: {
            productName: '',
            labelRevision: '',
            productSku: '',
            containerSize: '',
            coMan: '',
            bulkFormulaNumber: '',
            brandName: ''
          },
          revision: {
            isNewLabel: '',
            requestor: '',
            newProduct: ''
          },
          revisionUpdates: {
            logo: '',
            storageStatement: '',
            productName: '',
            precautionaryStatement: '',
            trademark: '',
            directions: '',
            tagline: '',
            warningStatement: '',
            statementOfIdentity: '',
            dietaryRestrictions: '',
            ingredients: '',
            nutritionalInfo: '',
            claims: '',
            contact: '',
            netWeight: '',
            servingSize: '',
            warnings: '',
            distributedBy: ''
          },
          labelSpecs: {
            labelSize: '',
            labelShape: '',
            labelMaterial: '',
            labelColors: '',
            labelFinish: '',
            adhesive: ''
          },
          approval: {
            preparedBy: '',
            preparedDate: '',
            approvedBy: '',
            approvedDate: ''
          }
        }

      case 'COC - Vital Nutrients.docx':
      case 'COC - Fairhaven Health.docx':
      case 'COC - Bariatric Fusion.docx':
        return {
          header: {
            companyName: templateName.includes('Vital Nutrients') ? 'Vital Nutrients' :
                        templateName.includes('Fairhaven Health') ? 'Fairhaven Health' :
                        templateName.includes('Bariatric Fusion') ? 'Bariatric Fusion' : '',
            documentTitle: 'Certificate of Compliance',
            documentNumber: '',
            revision: '',
            effectiveDate: ''
          },
          productInfo: {
            productName: '',
            sku: '',
            batchNumber: '',
            lotNumber: '',
            manufacturingDate: '',
            expiryDate: '',
            quantity: '',
            packageSize: ''
          },
          compliance: {
            regulations: [],
            certifications: [],
            claims: []
          },
          testing: {
            microbiological: {
              totalPlateCount: '',
              yeastMold: '',
              coliforms: '',
              salmonella: '',
              ecoli: '',
              staph: ''
            },
            chemical: {
              heavyMetals: '',
              pesticides: '',
              residualSolvents: '',
              allergens: ''
            },
            physical: {
              appearance: '',
              color: '',
              odor: '',
              moisture: ''
            }
          },
          statement: {
            complianceStatement: '',
            limitations: '',
            validityPeriod: ''
          },
          signatures: {
            preparedBy: '',
            preparedTitle: '',
            preparedDate: '',
            approvedBy: '',
            approvedTitle: '',
            approvedDate: '',
            qualityManager: '',
            qualityManagerDate: ''
          }
        }

      case 'COA - Vital Nutrients.doc':
      case 'COA - Fairhaven Health.doc':
      case 'COA - Bariatric Fusion.doc':
        return {
          header: {
            companyName: templateName.includes('Vital Nutrients') ? 'Vital Nutrients' :
                        templateName.includes('Fairhaven Health') ? 'Fairhaven Health' :
                        templateName.includes('Bariatric Fusion') ? 'Bariatric Fusion' : '',
            address: '',
            phone: '',
            email: '',
            documentNumber: '',
            revision: '',
            effectiveDate: ''
          },
          product: {
            productName: '',
            productCode: '',
            sku: '',
            batchNumber: '',
            lotNumber: '',
            manufacturingDate: '',
            testingDate: '',
            releaseDate: '',
            expiryDate: '',
            packageSize: '',
            quantity: ''
          },
          specifications: [],
          microbiological: [],
          chemical: [],
          physical: [],
          conclusion: {
            overallResult: '',
            conclusion: '',
            releaseStatus: '',
            comments: ''
          },
          signatures: {
            testedBy: '',
            testedByTitle: '',
            testedDate: '',
            reviewedBy: '',
            reviewedByTitle: '',
            reviewedDate: '',
            approvedBy: '',
            approvedByTitle: '',
            approvedDate: ''
          }
        }

      default:
        return {}
    }
  }, [])

  // Stable form data change handler
  const handleFormDataChange = useCallback((newFormData: any) => {
    console.log('DocxEditor: handleFormDataChange called with:', newFormData)
    console.log('DocxEditor: Form data keys changed:', Object.keys(newFormData))
    setFormData(newFormData)
    setHasChanges(true)
  }, [])

  // Memoized computed values
  const currentUser = useMemo(() => session?.user?.name || 'Current User', [session?.user?.name])
  const canEdit = useMemo(() => !isReadOnly && workflowSteps[currentStep]?.status === 'editing', [isReadOnly, workflowSteps, currentStep])
  const canSign = useMemo(() => currentStep === workflowSteps.length - 1 && workflowSteps[currentStep]?.status === 'editing', [currentStep, workflowSteps])
  const isComplete = useMemo(() => workflowSteps[workflowSteps.length - 1]?.status === 'approved', [workflowSteps])

  const saveDocument = async (moveToNext = false) => {
    setSaving(true)
    try {
      // Generate unique document ID for this working copy
      const workingDocId = `working-doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Create new version of the WORKING DOCUMENT (not the original template)
      const newVersion: DocumentVersion = {
        id: `version-${Date.now()}`,
        version: documentVersions.length + 1,
        editedBy: session?.user?.name || 'Current User',
        editedAt: new Date().toISOString(),
        content: JSON.stringify(formData, null, 2),
        comments: editComments
      }

      setDocumentVersions(prev => [...prev, newVersion])

      // Save working document to a separate location (not overwriting template)
      const workingDocument = {
        id: workingDocId,
        originalTemplate: templateName,
        title: documentTitle,
        content: JSON.stringify(formData, null, 2),
        formData,
        versions: [...documentVersions, newVersion],
        workflow: workflowSteps,
        currentStep,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }

      // In a real app, this would save to a separate "working_documents" table/folder
      console.log('Saving working document (NOT overwriting template):', workingDocument)
      
      // Update workflow if moving to next step
      if (moveToNext && currentStep < workflowSteps.length - 1) {
        const updatedSteps = [...workflowSteps]
        updatedSteps[currentStep].status = 'completed'
        updatedSteps[currentStep].completedAt = new Date().toISOString()
        updatedSteps[currentStep].comments = editComments
        
        if (currentStep + 1 < workflowSteps.length) {
          updatedSteps[currentStep + 1].status = 'editing'
        }
        
        setWorkflowSteps(updatedSteps)
        setCurrentStep(prev => prev + 1)
        setIsReadOnly(true) // Make read-only for current user
      }

      setHasChanges(false)
      setEditComments('')
      
      const message = moveToNext 
        ? `Working document saved and forwarded to ${workflowSteps[currentStep + 1]?.name}! Original template remains unchanged.`
        : `Working document saved successfully! Original template "${templateName}" remains unchanged.`
      
      alert(message)
    } catch (error) {
      console.error('Error saving working document:', error)
      alert('Failed to save working document')
    } finally {
      setSaving(false)
    }
  }

  const signDocument = async (signatureData: { name: string; title: string }) => {
    setSaving(true)
    try {
      // Add signature to the final step
      const updatedSteps = [...workflowSteps]
      updatedSteps[workflowSteps.length - 1].status = 'approved'
      updatedSteps[workflowSteps.length - 1].completedAt = new Date().toISOString()
      
      // Add signature to document content
      const signatureHtml = `
        <div style="margin-top: 50px; border-top: 2px solid #000; padding-top: 20px;">
          <h2>FINAL APPROVAL</h2>
          <table border="1" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td><strong>Approved By:</strong></td>
              <td>${signatureData.name}</td>
            </tr>
            <tr>
              <td><strong>Title:</strong></td>
              <td>${signatureData.title}</td>
            </tr>
            <tr>
              <td><strong>Digital Signature:</strong></td>
              <td>DIGITALLY SIGNED</td>
            </tr>
            <tr>
              <td><strong>Date:</strong></td>
              <td>${new Date().toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
      `
      
      setContent(prev => prev + signatureHtml)
      setWorkflowSteps(updatedSteps)
      setShowSignatureModal(false)
      
      alert('Document has been digitally signed and approved!')
    } catch (error) {
      console.error('Error signing document:', error)
      alert('Failed to sign document')
    } finally {
      setSaving(false)
    }
  }

  const saveDocumentWithName = async (customName: string) => {
    setSaving(true)
    try {
      const savedDocument = {
        id: `saved-doc-${Date.now()}`,
        name: customName,
        originalTemplate: templateName,
        content,
        createdBy: session?.user?.name || 'Current User',
        createdAt: new Date().toISOString(),
        collaborators,
        status: 'saved'
      }

      // In real app, this would save to "Documents" collection
      console.log('Saving document to Documents:', savedDocument)
      
      alert(`Document "${customName}" saved to Documents successfully!`)
      setShowSaveModal(false)
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving document:', error)
      alert('Failed to save document')
    } finally {
      setSaving(false)
    }
  }

  const shareDocumentWithUsers = async (selectedUserIds: string[], message: string) => {
    setSaving(true)
    try {
      const sharedWith = companyUsers.filter(user => selectedUserIds.includes(user.id))
      
      setCollaborators(prev => [...prev, ...selectedUserIds.filter(id => !prev.includes(id))])
      setActiveCollaborators(sharedWith)

      // In real app, this would create notifications for each user
      sharedWith.forEach(user => {
        console.log(`📧 Notification sent to ${user.name} (${user.email}): ${message}`)
      })

      alert(`Document shared with ${sharedWith.length} people! They will receive notifications.`)
      setShowShareModal(false)
    } catch (error) {
      console.error('Error sharing document:', error)
      alert('Failed to share document')
    } finally {
      setSaving(false)
    }
  }

  // Memoized template form render to prevent unnecessary re-renders
  const renderTemplateForm = useMemo(() => {
    const formProps = {
      data: formData,
      onChange: handleFormDataChange,
      readOnly: !canEdit
    }

    switch (templateName) {
      case 'QA-004-02 Finished Product Specification Rev 05.docx':
        return <FinishedProductSpecForm {...formProps} />
      
      case 'Raw Material Spec Template.docx':
        return <RawMaterialSpecForm {...formProps} />
      
      case 'PSF TEMPLATE BRH.docx':
        return <PSFTemplateForm {...formProps} />

      case 'Label Manuscript.docx':
        return <LabelManuscriptForm {...formProps} />

      case 'COC - Vital Nutrients.docx':
        return <COCForm {...formProps} companyName="Vital Nutrients" />

      case 'COC - Fairhaven Health.docx':
        return <COCForm {...formProps} companyName="Fairhaven Health" />

      case 'COC - Bariatric Fusion.docx':
        return <COCForm {...formProps} companyName="Bariatric Fusion" />

      case 'COA - Vital Nutrients.doc':
        return <COAForm {...formProps} companyName="Vital Nutrients" />

      case 'COA - Fairhaven Health.doc':
        return <COAForm {...formProps} companyName="Fairhaven Health" />

      case 'COA - Bariatric Fusion.doc':
        return <COAForm {...formProps} companyName="Bariatric Fusion" />
      
      default:
        return (
          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Template: {templateName}</h3>
            <p className="text-gray-600 mb-4">
              This template type doesn't have a structured form yet. You can still save and share this document.
            </p>
            <textarea
              value={JSON.stringify(formData, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  handleFormDataChange(parsed)
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              readOnly={!canEdit}
            />
          </div>
        )
    }
  }, [templateName, formData, handleFormDataChange, canEdit])

  const downloadDocument = () => {
    const content = JSON.stringify(formData, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    saveAs(blob, `${documentTitle}.json`)
  }

  if (!isOpen) return null

  return (
    <div className="bg-white min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 mr-4"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{documentTitle}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                {documentId ? 'Document' : 'Template'}: {templateName}
              </span>
              {!documentId && (
                <span className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium text-xs">
                  ⚠️ Initial Setup - Click Save to create editable document
                </span>
              )}
              {documentId && (
                <span className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                  <PencilIcon className="h-3 w-3 mr-1" />
                  Editable Document
                </span>
              )}
            </div>
          </div>
          {hasChanges && (
            <div className="flex items-center text-orange-600 text-sm">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              Unsaved changes
            </div>
          )}
        </div>
          
        <div className="flex items-center space-x-2">
          {/* Show active collaborators */}
          {activeCollaborators.length > 0 && (
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-gray-600">Collaborating:</span>
              {activeCollaborators.slice(0, 3).map(user => (
                <div key={user.id} className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                  {user.name.charAt(0)}
                </div>
              ))}
              {activeCollaborators.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center font-medium">
                  +{activeCollaborators.length - 3}
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={async () => {
              if (documentId) {
                // Save document changes
                try {
                  setSaving(true)
                  
                  // Capture current state directly from all form inputs
                  const currentFormData = {}
                  
                  // Get all input values directly from DOM
                  document.querySelectorAll('input[data-path], textarea[data-path], select[data-path]').forEach(input => {
                    const path = input.getAttribute('data-path')
                    const value = (input as HTMLInputElement).value
                    if (path && value) {
                      console.log('Capturing input:', path, '=', value)
                      
                      // Set nested value in currentFormData
                      const keys = path.split('.')
                      let current = currentFormData
                      for (let i = 0; i < keys.length - 1; i++) {
                        if (!current[keys[i]]) current[keys[i]] = {}
                        current = current[keys[i]]
                      }
                      current[keys[keys.length - 1]] = value
                    }
                  })
                  
                  // Merge with existing formData structure
                  const finalFormData = { ...formData, ...currentFormData }
                  console.log('Saving document with captured data:', finalFormData)
                  const response = await fetch(`/api/documents/${documentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: finalFormData })
                  })
                  
                  const responseData = await response.json()
                  console.log('Save response:', responseData)
                  
                  if (response.ok) {
                    console.log('Document updated successfully')
                    // Update the originalContent to reflect the new saved state
                    setOriginalContent(JSON.stringify(formData))
                    setHasChanges(false)
                    alert('Document saved successfully!')
                    if (onSave) onSave()
                  } else {
                    console.error('Failed to update document:', responseData)
                    alert('Failed to save document: ' + (responseData.error || 'Unknown error'))
                  }
                } catch (error) {
                  console.error('Error updating document:', error)
                  alert('Error saving document')
                } finally {
                  setSaving(false)
                }
              } else {
                // Template save (existing logic)
                if (onSave) onSave()
              }
            }}
            disabled={saving}
            className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <DocumentCheckIcon className="h-4 w-4 mr-2" />
            Save
          </button>
        </div>
      </div>

      {/* Document Editor - Full Page */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {!documentId && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-yellow-800">Template Setup Mode</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You're setting up a new document from this template. Fill in any initial information, then click <strong>"Save"</strong> to create your editable document. 
                  Once created, you'll be able to edit and save changes continuously.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading {documentId ? 'document' : 'template'}...</p>
          </div>
        ) : (
          renderTemplateForm
        )}
      </div>
    </div>
  )
}
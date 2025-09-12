'use client'

import Link from 'next/link'
import { 
  CheckIcon, 
  DocumentIcon, 
  ShieldCheckIcon, 
  UsersIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  ArrowRightIcon,
  BeakerIcon,
  BuildingOfficeIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'

export default function LandingPage() {
  const features = [
    {
      icon: DocumentIcon,
      title: "Template Management",
      description: "Pre-built quality templates for COA, COC, PSF, and more manufacturing documents"
    },
    {
      icon: ClipboardDocumentListIcon,
      title: "Document Workflow",
      description: "Create, edit, and collaborate on documents with digital signature approval process"
    },
    {
      icon: BeakerIcon,
      title: "Product Catalog",
      description: "Comprehensive product database with advanced filtering and document linking"
    },
    {
      icon: UsersIcon,
      title: "Team Collaboration",
      description: "Multi-user editing, document sharing, and real-time collaboration across teams"
    },
    {
      icon: ShieldCheckIcon,
      title: "Digital Signatures",
      description: "DocuSign-style digital approval workflow with timestamps and audit trails"
    },
    {
      icon: CogIcon,
      title: "Quality Control",
      description: "Manufacturing specifications, compliance tracking, and regulatory documentation"
    }
  ]

  const benefits = [
    "Streamline document creation and approval processes",
    "Ensure regulatory compliance with standardized templates",
    "Reduce errors with structured form-based document editing",
    "Track document status and approval history",
    "Enable team collaboration with real-time editing",
    "Maintain audit trails with digital signatures"
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <img src="/logo.png" alt="Blue Root Health" className="h-24 w-24 object-contain" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Blue Root Health
              <span className="block text-3xl text-blue-600 mt-2">Quality Management System</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your manufacturing operations with our comprehensive quality management platform. 
              Create, manage, and approve documents with ease while ensuring regulatory compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
              >
                Access Portal
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <button className="inline-flex items-center px-8 py-4 border-2 border-blue-600 text-blue-600 text-lg font-semibold rounded-xl hover:bg-blue-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Quality Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides everything you need to manage quality documentation, 
              ensure compliance, and streamline manufacturing operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose Our QMS Platform?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built specifically for manufacturing companies, our Quality Management System 
                simplifies complex processes while maintaining the highest standards of compliance 
                and documentation.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <CheckIcon className="h-6 w-6 text-green-500 mt-0.5" />
                    </div>
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Capabilities</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Enterprise-Ready</h4>
                    <p className="text-gray-600 text-sm">Scalable for teams of any size</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <AcademicCapIcon className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Compliance Focused</h4>
                    <p className="text-gray-600 text-sm">Built for FDA and industry standards</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <CogIcon className="h-8 w-8 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Process Automation</h4>
                    <p className="text-gray-600 text-sm">Streamlined workflows and approvals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Quality Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join manufacturing teams who trust Blue Root Health for their quality management needs.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-lg"
          >
            Get Started Today
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <img src="/logo.png" alt="Blue Root Health" className="h-12 w-12 object-contain" />
            <div className="text-white">
              <h3 className="text-xl font-bold">Blue Root Health</h3>
              <p className="text-gray-400">Quality Management Solutions</p>
            </div>
          </div>
          
          <div className="text-center text-gray-400 border-t border-gray-800 pt-8">
            <p>&copy; 2024 Blue Root Health. All rights reserved.</p>
            <p className="mt-2 text-sm">Professional Quality Management System for Manufacturing Excellence</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
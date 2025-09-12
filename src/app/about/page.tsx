import Link from 'next/link'
import { 
  ArrowLeftIcon,
  BeakerIcon,
  UsersIcon,
  ShieldCheckIcon,
  DocumentIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function AboutPage() {
  const features = [
    {
      icon: DocumentIcon,
      title: "Template Management",
      description: "Pre-built quality templates for COA, COC, PSF, and manufacturing documents with auto-resizing inputs"
    },
    {
      icon: ClipboardDocumentListIcon,
      title: "Document Workflow",
      description: "Create, edit, and collaborate on documents with digital signature approval process and real-time updates"
    },
    {
      icon: BeakerIcon,
      title: "Product & Raw Materials Catalog",
      description: "Comprehensive databases with advanced filtering, search, and document linking for products and ingredients"
    },
    {
      icon: BuildingOfficeIcon,
      title: "Supplier Management",
      description: "Complete supplier directory with document upload, cloud storage, and approval status tracking"
    },
    {
      icon: UsersIcon,
      title: "Multi-User Collaboration",
      description: "Team editing, document sharing, and real-time collaboration with Supabase cloud storage"
    },
    {
      icon: ShieldCheckIcon,
      title: "Digital Signatures & Compliance",
      description: "DocuSign-style approval workflow with timestamps, audit trails, and regulatory compliance"
    }
  ]

  const stats = [
    { number: "300+", label: "Raw Materials Tracked" },
    { number: "50MB", label: "File Upload Limit" },
    { number: "90+", label: "Approved Suppliers" },
    { number: "100%", label: "Cloud-Based Storage" }
  ]

  const capabilities = [
    "Advanced product filtering and sorting with real-time search",
    "Auto-resizing input fields that adapt to content length",
    "Supabase cloud storage for multi-user document access",
    "Supplier document management with type and approval tracking",
    "Raw materials inventory with comprehensive search capabilities",
    "Template-based document creation with structured workflows",
    "Digital approval processes with audit trail maintenance",
    "Responsive design optimized for desktop and mobile use",
    "Real-time collaboration with live document updates",
    "Secure authentication and user role management"
  ]

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15)), url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
      }}
    >
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <img src="/logo.png" alt="Blue Root Health" className="w-16 h-16 object-contain" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                Blue Root Health
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* About Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50 max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                About Our Quality Management System
              </h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Built specifically for Blue Root Health's manufacturing operations, our comprehensive QMS platform 
                streamlines document management, ensures regulatory compliance, and enhances team collaboration 
                across all quality control processes.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-700 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Comprehensive Platform Features
                </h2>
                <p className="text-xl text-gray-700">
                  Everything you need for modern quality management in one integrated system.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 rounded-xl p-4">
                      <feature.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 ml-4">{feature.title}</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Capabilities Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-white/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-8">
                  Technical Capabilities
                </h2>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Our platform leverages modern web technologies and cloud infrastructure to deliver 
                  a seamless, scalable quality management experience for manufacturing teams.
                </p>
                
                <div className="flex items-center space-x-4 p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <AcademicCapIcon className="h-12 w-12 text-blue-600" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Enterprise Architecture</h3>
                    <p className="text-gray-700">Built with Next.js, Supabase, and modern cloud infrastructure</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Capabilities</h3>
                {capabilities.map((capability, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{capability}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-white/50">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                Experience the power of modern quality management designed specifically for Blue Root Health's manufacturing excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Access Portal
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center px-8 py-4 border-2 border-blue-600 text-blue-600 text-lg font-semibold rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
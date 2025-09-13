"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import SearchInterface from "./SearchInterface";
import DocumentUpload from "./DocumentUpload";
import DocumentList from "./DocumentList";
import TemplateManager from "./TemplateManager";
import ProductIndex from "./ProductIndex";
import ProductDetail from "./ProductDetail";
import SupplierIndex from "./SupplierIndex";
import SupplierDetail from "./SupplierDetail";
import SupplierDocumentUpload from "./SupplierDocumentUpload";
import RawMaterials from "./RawMaterials";
import NotificationCenter from "./NotificationCenter";
import DocxEditor from "./DocxEditor";

export default function Dashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("products");
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [selectedProductSku, setSelectedProductSku] = useState(null);
  const [selectedSupplierName, setSelectedSupplierName] = useState(null);
  const [showDashboardLanding, setShowDashboardLanding] = useState(true);

  const handleTabSelection = (tabName: string) => {
    setActiveTab(tabName);
    setShowDashboardLanding(false);
  };

  // Dashboard Landing Component
  const DashboardLanding = () => (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Company Logo"
                  className="w-20 h-20 object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                  Quality Management System
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <NotificationCenter />
              <div className="flex items-center space-x-3">
                <span className="text-base text-slate-700 font-medium">
                  Welcome, {session?.user?.name}
                </span>
                <div className="h-11 w-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-100">
                  <span className="text-white text-lg font-semibold">
                    {session?.user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => {
                    console.log("Logging out...");
                    window.location.href = "/api/auth/signout";
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Landing Content */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center py-12">
        <div className="w-full text-center px-4">
          {/* Large Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full">
            <button
              onClick={() => handleTabSelection("products")}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-blue-200"
            >
              <div className="text-6xl mb-4">🏭</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Products
              </h3>
              <p className="text-gray-600">
                Manage product catalog and documentation
              </p>
            </button>

            <button
              onClick={() => handleTabSelection("suppliers")}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-blue-200"
            >
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Suppliers & Co-Men
              </h3>
              <p className="text-gray-600">
                View suppliers and co-men and uploaded documents
              </p>
            </button>

            <button
              onClick={() => handleTabSelection("raw-materials")}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-blue-200"
            >
              <div className="text-6xl mb-4">🧪</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Raw Materials
              </h3>
              <p className="text-gray-600">
                Browse ingredient inventory and specs
              </p>
            </button>

            <button
              onClick={() => handleTabSelection("templates")}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-blue-200"
            >
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Templates
              </h3>
              <p className="text-gray-600">
                Create documents from quality templates
              </p>
            </button>

            <button
              onClick={() => handleTabSelection("documents")}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-blue-200"
            >
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                BRH Documents
              </h3>
              <p className="text-gray-600">
                Access and manage company documents
              </p>
            </button>

            <button
              onClick={() => handleTabSelection("document-upload")}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-blue-200"
            >
              <div className="text-6xl mb-4">📤</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Document Upload
              </h3>
              <p className="text-gray-600">Upload documents for suppliers</p>
            </button>

            <button
              onClick={() => handleTabSelection("labels")}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-blue-200"
            >
              <div className="text-6xl mb-4">🏷️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Labels</h3>
              <p className="text-gray-600">
                Manage product labels and specifications
              </p>
            </button>

            <button
              onClick={() => handleTabSelection("allergens")}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-blue-200"
            >
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Allergens
              </h3>
              <p className="text-gray-600">
                Track and manage allergen information
              </p>
            </button>

            <button
              onClick={() => handleTabSelection("ccrs")}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-blue-200"
            >
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">CCRs</h3>
              <p className="text-gray-600">
                Critical Control Records management
              </p>
            </button>

            <button
              onClick={() => handleTabSelection("shelf-life")}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-blue-200"
            >
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Shelf-Life Program
              </h3>
              <p className="text-gray-600">
                Monitor product shelf-life and expiration
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (showDashboardLanding) {
    return <DashboardLanding />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Enhanced Header with Blue Root Health styling */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowDashboardLanding(true)}
                className="flex items-center justify-center hover:bg-blue-50 rounded-lg p-2 transition-colors"
              >
                <img
                  src="/logo.png"
                  alt="Company Logo"
                  className="w-20 h-20 object-contain"
                />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                  Quality Management System
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <NotificationCenter />
              <div className="flex items-center space-x-3">
                <span className="text-base text-slate-700 font-medium">
                  Welcome, {session?.user?.name}
                </span>
                <div className="h-11 w-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-100">
                  <span className="text-white text-lg font-semibold">
                    {session?.user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => {
                    console.log("Logging out...");
                    window.location.href = "/api/auth/signout";
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white rounded-2xl p-2 shadow-md border border-slate-200">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === "products"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]"
                  : "text-slate-600 hover:text-blue-700 hover:bg-blue-50"
              }`}
            >
              🏭 Products
            </button>
            <button
              onClick={() => setActiveTab("suppliers")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === "suppliers"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]"
                  : "text-slate-600 hover:text-blue-700 hover:bg-blue-50"
              }`}
            >
              🏢 Suppliers & Co-Men
            </button>
            <button
              onClick={() => setActiveTab("raw-materials")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === "raw-materials"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]"
                  : "text-slate-600 hover:text-blue-700 hover:bg-blue-50"
              }`}
            >
              🧪 Raw Materials
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === "templates"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]"
                  : "text-slate-600 hover:text-blue-700 hover:bg-blue-50"
              }`}
            >
              📋 Templates
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === "documents"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]"
                  : "text-slate-600 hover:text-blue-700 hover:bg-blue-50"
              }`}
            >
              📄 BRH Documents
            </button>
            <button
              onClick={() => setActiveTab("document-upload")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === "document-upload"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]"
                  : "text-slate-600 hover:text-blue-700 hover:bg-blue-50"
              }`}
            >
              📤 Document Upload
            </button>
          </nav>
        </div>

        {/* Content Container with Enhanced Styling */}
        {editingTemplate ? (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <DocxEditor
              templatePath={editingTemplate.name}
              templateName={editingTemplate.name}
              isOpen={true}
              onClose={() => {
                setEditingTemplate(null);
                setActiveTab("templates");
                window.scrollTo(0, 0);
              }}
              onSave={() => {
                setShowAssignmentModal(true);
                // Don't clear editingTemplate yet - we need it for the assignment modal
              }}
            />
          </div>
        ) : editingDocument ? (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <DocxEditor
              templatePath={
                editingDocument.template?.name || editingDocument.filename
              }
              templateName={
                editingDocument.template?.name || editingDocument.title
              }
              documentId={editingDocument.id}
              isOpen={true}
              onClose={() => {
                setEditingDocument(null);
                setActiveTab("documents");
                window.scrollTo(0, 0);
              }}
              onSave={() => {
                // Save document changes and refresh
                setEditingDocument(null);
                setRefreshDocuments((prev) => prev + 1);
                setActiveTab("documents");
              }}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden card">
            <div className="p-1">
              {activeTab === "search" && <SearchInterface />}
              {activeTab === "upload" && <DocumentUpload />}
              {activeTab === "suppliers" && !selectedSupplierName && (
                <SupplierIndex onSupplierSelect={setSelectedSupplierName} />
              )}
              {activeTab === "suppliers" && selectedSupplierName && (
                <SupplierDetail
                  supplierName={selectedSupplierName}
                  onBack={() => setSelectedSupplierName(null)}
                />
              )}
              {activeTab === "products" && !selectedProductSku && (
                <ProductIndex onProductSelect={setSelectedProductSku} />
              )}
              {activeTab === "products" && selectedProductSku && (
                <ProductDetail
                  sku={selectedProductSku}
                  onBack={() => setSelectedProductSku(null)}
                  onNavigateToDocuments={() => setActiveTab("documents")}
                />
              )}
              {activeTab === "raw-materials" && <RawMaterials />}
              {activeTab === "templates" && (
                <TemplateManager onEditTemplate={setEditingTemplate} />
              )}
              {activeTab === "document-upload" && <DocumentUpload />}
              {activeTab === "documents" && (
                <DocumentList
                  key={refreshDocuments}
                  onEditDocument={setEditingDocument}
                  onNavigateToDocuments={() => setActiveTab("documents")}
                />
              )}
              {activeTab === "labels" && (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">🏷️</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Labels Management
                  </h2>
                  <p className="text-gray-600">
                    Product labels and specifications management coming soon.
                  </p>
                </div>
              )}
              {activeTab === "allergens" && (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Allergens Management
                  </h2>
                  <p className="text-gray-600">
                    Allergen tracking and management system coming soon.
                  </p>
                </div>
              )}
              {activeTab === "ccrs" && (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    CCRs Management
                  </h2>
                  <p className="text-gray-600">
                    Critical Control Records management system coming soon.
                  </p>
                </div>
              )}
              {activeTab === "shelf-life" && (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Shelf-Life Program
                  </h2>
                  <p className="text-gray-600">
                    Product shelf-life monitoring and expiration tracking coming
                    soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assignment Modal for completed template edits */}
        {showAssignmentModal && editingTemplate && (
          <AssignmentModal
            template={editingTemplate}
            isOpen={showAssignmentModal}
            onClose={() => {
              setShowAssignmentModal(false);
              setEditingTemplate(null);
            }}
            onSave={async (assignedUsers, productSku, documentName) => {
              try {
                console.log("Creating document with data:", {
                  documentName,
                  assignedUsers,
                  productSku,
                  templateId: editingTemplate.id,
                });

                // Create document from template
                const documentData = {
                  title: documentName,
                  templateId: editingTemplate.id,
                  productSku: productSku || null, // API will convert SKU to ID
                };

                console.log("Creating document:", documentData);
                const response = await fetch("/api/documents/create", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(documentData),
                });

                const responseData = await response.json();
                console.log("Document creation response:", responseData);

                if (response.ok && responseData.document) {
                  const documentId = responseData.document.id;

                  // Now assign users to the document if any were selected
                  if (assignedUsers.length > 0) {
                    console.log("Assigning users to document:", assignedUsers);
                    const assignResponse = await fetch(
                      `/api/documents/${documentId}/assign`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          assignedUsers,
                          productSku,
                        }),
                      }
                    );

                    const assignData = await assignResponse.json();
                    console.log("Assignment response:", assignData);
                  }

                  console.log("Document created and assigned successfully");
                  setShowAssignmentModal(false);
                  setEditingTemplate(null);
                  setRefreshDocuments((prev) => prev + 1);
                  setActiveTab("documents");
                } else {
                  console.error("Failed to create document:", responseData);
                  alert(
                    "Failed to create document: " +
                      (responseData.error || "Unknown error")
                  );
                }
              } catch (error) {
                console.error("Error creating document:", error);
                alert("Error creating document: " + error.message);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

function AssignmentModal({
  template,
  isOpen,
  onClose,
  onSave,
}: {
  template: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    assignedUsers: string[],
    productSku: string,
    documentName: string
  ) => void;
}) {
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [productSku, setProductSku] = useState("");
  const [documentName, setDocumentName] = useState(
    template?.name?.replace(".docx", "").replace(".doc", "") || ""
  );
  const [loading, setLoading] = useState(false);
  const [coworkers, setCoworkers] = useState([]);
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");

  // Company coworkers (no demo users)
  const actualCoworkers = [
    {
      name: "John Troup",
      username: "john.troup",
      email: "john.troup@company.com",
    },
    {
      name: "Matt White",
      username: "matt.white",
      email: "matt.white@company.com",
    },
    {
      name: "Nick Hafften",
      username: "nick.hafften",
      email: "nick.hafften@company.com",
    },
    {
      name: "Steve Nelson",
      username: "steve.nelson",
      email: "steve.nelson@company.com",
    },
    {
      name: "Nick Deloia",
      username: "nick.deloia",
      email: "nick.deloia@company.com",
    },
    {
      name: "Jenn Doucette",
      username: "jenn.doucette",
      email: "jenn.doucette@company.com",
    },
    {
      name: "Dana Rutscher",
      username: "dana.rutscher",
      email: "dana.rutscher@company.com",
    },
    {
      name: "Shefali Pandey",
      username: "shefali.pandey",
      email: "shefali.pandey@company.com",
    },
    {
      name: "Whitney Palmerton",
      username: "whitney.palmerton",
      email: "whitney.palmerton@company.com",
    },
  ];

  useEffect(() => {
    // Fetch products from API (same approach as ProductIndex)
    const fetchProducts = async () => {
      try {
        let response = await fetch("/api/debug/products");
        if (!response.ok) {
          response = await fetch("/api/products");
        }
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (isOpen) {
      fetchProducts();
      setCoworkers(actualCoworkers);
    }
  }, [isOpen]);

  // Filter products based on search
  const filteredProducts = products.filter(
    (product) =>
      product.productName
        ?.toLowerCase()
        .includes(productSearch.toLowerCase()) ||
      product.sku?.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.brand?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleUserToggle = (user: unknown) => {
    const userName = user.name;
    setAssignedUsers((prev) =>
      prev.includes(userName)
        ? prev.filter((u) => u !== userName)
        : [...prev, userName]
    );
  };

  const handleSave = () => {
    if (assignedUsers.length === 0 || !productSku || !documentName.trim()) {
      alert(
        "Please enter a document name, select at least one coworker, and select a product"
      );
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onSave(assignedUsers, productSku, documentName.trim());
      setLoading(false);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-full flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg text-black font-semibold">
            Create Document from Template
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Name *
              </label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Enter document name..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Coworkers *
              </label>
              <div className="border border-gray-300 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                {coworkers.map((worker) => (
                  <label
                    key={worker.username}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={assignedUsers.includes(worker.name)}
                      onChange={() => handleUserToggle(worker)}
                      className="mr-3 text-black"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-black font-medium">
                        {worker.name}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({worker.username})
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product *
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Search products by name, SKU, or brand..."
                />
                <select
                  value={productSku}
                  onChange={(e) => setProductSku(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="">
                    Select a product... ({filteredProducts.length} available)
                  </option>
                  {filteredProducts.slice(0, 100).map((product) => (
                    <option key={product.sku} value={product.sku}>
                      {product.sku} - {product.productName} ({product.brand})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-black rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save & Assign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

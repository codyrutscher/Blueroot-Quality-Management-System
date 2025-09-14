"use client";

import { useState } from "react";

export default function NewProducts() {
  const [activeSection, setActiveSection] = useState("pipeline");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">New Product Development</h2>
          <p className="text-gray-600">Product development pipeline and launch management</p>
        </div>
        <div className="text-4xl">✨</div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "pipeline", name: "Development Pipeline", icon: "🚀" },
            { id: "research", name: "Research & Development", icon: "🔬" },
            { id: "testing", name: "Product Testing", icon: "🧪" },
            { id: "launch", name: "Launch Planning", icon: "📈" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeSection === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeSection === "pipeline" && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Product Development Pipeline
            </h3>
            <p className="text-gray-600 mb-4">
              Track new products from concept to market launch
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl mb-2">💡</div>
                <h4 className="font-medium text-gray-900">Concept</h4>
                <p className="text-sm text-gray-600">Initial product ideas</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">🔬</div>
                <h4 className="font-medium text-gray-900">Development</h4>
                <p className="text-sm text-gray-600">R&D and formulation</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl mb-2">🧪</div>
                <h4 className="font-medium text-gray-900">Testing</h4>
                <p className="text-sm text-gray-600">Quality and safety testing</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">🚀</div>
                <h4 className="font-medium text-gray-900">Launch</h4>
                <p className="text-sm text-gray-600">Market introduction</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "research" && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Research & Development
            </h3>
            <p className="text-gray-600">
              R&D project management and documentation system coming soon.
            </p>
          </div>
        )}

        {activeSection === "testing" && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🧪</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Product Testing
            </h3>
            <p className="text-gray-600">
              New product testing and validation system coming soon.
            </p>
          </div>
        )}

        {activeSection === "launch" && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Launch Planning
            </h3>
            <p className="text-gray-600">
              Product launch planning and execution system coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
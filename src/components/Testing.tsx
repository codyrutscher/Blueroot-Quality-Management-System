"use client";

import { useState } from "react";

export default function Testing() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Testing Management</h2>
          <p className="text-gray-600">Laboratory testing and analysis system</p>
        </div>
        <div className="text-4xl">🔬</div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", name: "Overview", icon: "📊" },
            { id: "pending", name: "Pending Tests", icon: "⏳" },
            { id: "results", name: "Test Results", icon: "📋" },
            { id: "schedule", name: "Test Schedule", icon: "📅" },
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
        {activeSection === "overview" && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Testing System Overview
            </h3>
            <p className="text-gray-600 mb-4">
              Comprehensive laboratory testing and quality analysis platform
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">🧪</div>
                <h4 className="font-medium text-gray-900">Sample Testing</h4>
                <p className="text-sm text-gray-600">Track sample analysis and results</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-medium text-gray-900">Quality Control</h4>
                <p className="text-sm text-gray-600">Monitor quality metrics and standards</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">📈</div>
                <h4 className="font-medium text-gray-900">Analytics</h4>
                <p className="text-sm text-gray-600">Generate testing reports and insights</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "pending" && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Pending Tests
            </h3>
            <p className="text-gray-600">
              No pending tests at this time. Test scheduling system coming soon.
            </p>
          </div>
        )}

        {activeSection === "results" && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Test Results
            </h3>
            <p className="text-gray-600">
              Test results database and reporting system coming soon.
            </p>
          </div>
        )}

        {activeSection === "schedule" && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Test Schedule
            </h3>
            <p className="text-gray-600">
              Automated testing schedule and calendar system coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
'use client'

import { BeakerIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function RawMaterials() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Raw Materials</h2>
        <p className="text-gray-600">Manage quality documentation for raw materials</p>
      </div>

      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <BeakerIcon className="h-24 w-24 text-blue-300" />
              <ClockIcon className="h-8 w-8 text-blue-600 absolute -bottom-1 -right-1 bg-white rounded-full p-1" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Coming Soon</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            The Raw Materials section is currently under development. This will include:
          </p>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <ul className="text-sm text-left text-gray-700 space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Raw material specifications and documentation
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Supplier certifications and test results
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Batch tracking and quality control data
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Compliance and regulatory documentation
              </li>
            </ul>
          </div>
          
          <div className="text-sm text-gray-500">
            <p className="font-medium">Stay tuned for updates!</p>
            <p>This feature will be available soon.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
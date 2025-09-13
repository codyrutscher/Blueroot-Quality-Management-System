'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Option {
  id: string
  name: string
  sku?: string
}

interface MultiSelectDropdownProps {
  options: Option[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder: string
  searchPlaceholder: string
  label: string
  required?: boolean
}

export default function MultiSelectDropdown({
  options,
  selectedValues,
  onChange,
  placeholder,
  searchPlaceholder,
  label,
  required = false
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.sku && option.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const selectedOptions = options.filter(option => selectedValues.includes(option.id))

  const handleToggleOption = (optionId: string) => {
    if (selectedValues.includes(optionId)) {
      onChange(selectedValues.filter(id => id !== optionId))
    } else {
      onChange([...selectedValues, optionId])
    }
  }

  const handleRemoveOption = (optionId: string) => {
    onChange(selectedValues.filter(id => id !== optionId))
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} {required && '*'}
      </label>
      
      {/* Selected Items Display */}
      {selectedOptions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedOptions.map(option => (
            <div
              key={option.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              <span className="mr-2">
                {option.sku ? `${option.sku} - ${option.name}` : option.name}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveOption(option.id)}
                className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-600"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
      >
        <span className={selectedOptions.length > 0 ? 'text-slate-900' : 'text-slate-500'}>
          {selectedOptions.length > 0 
            ? `${selectedOptions.length} selected`
            : placeholder
          }
        </span>
        <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-slate-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <label
                  key={option.id}
                  className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.id)}
                    onChange={() => handleToggleOption(option.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <span className="ml-3 text-sm text-slate-900">
                    {option.sku ? `${option.sku} - ${option.name}` : option.name}
                  </span>
                </label>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
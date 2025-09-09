'use client'

import { useState } from 'react'
import { CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline'

export default function DocumentUpload() {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    const acceptedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]

    const validFiles = files.filter(file => acceptedTypes.includes(file.type))
    
    if (validFiles.length === 0) {
      setUploadStatus({
        type: 'error',
        message: 'Please upload PDF, DOCX, or TXT files only.'
      })
      return
    }

    setUploading(true)
    setUploadStatus({ type: null, message: '' })

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        return await response.json()
      })

      await Promise.all(uploadPromises)
      
      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${validFiles.length} file(s). Processing may take a few moments.`
      })
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus({
        type: 'error',
        message: 'Failed to upload one or more files. Please try again.'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Document Upload</h2>
            <p className="text-slate-600 mt-1">
              Upload manufacturing documents to make them searchable with AI
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            <span>Secure & Encrypted</span>
          </div>
        </div>
      </div>

      <div
        className={`relative border-3 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-[1.02]'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        } ${uploading ? 'pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="space-y-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl transition-all duration-300 ${
            dragActive ? 'bg-blue-100 scale-110' : 'bg-slate-100'
          }`}>
            <CloudArrowUpIcon className={`h-10 w-10 transition-colors duration-300 ${
              dragActive ? 'text-blue-600' : 'text-slate-400'
            }`} />
          </div>
          
          {uploading ? (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-200 border-t-blue-600"></div>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 mb-2">Processing Upload...</p>
                <p className="text-slate-600 leading-relaxed">
                  Your documents are being securely uploaded and indexed for AI search.<br />
                  This usually takes just a few moments.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xl font-bold text-slate-900 mb-2">
                  Drop files here or click to browse
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Upload PDF, DOCX, and TXT files up to 10MB each<br />
                  Multiple files supported - drag and drop for faster uploads
                </p>
              </div>
              <div className="inline-flex items-center space-x-4 text-sm text-slate-500">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V5l-10-4z"/>
                  </svg>
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>Auto-indexed</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {uploadStatus.type && (
        <div className={`mt-6 p-6 rounded-2xl border-2 ${
          uploadStatus.type === 'success' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800' 
            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-xl ${
              uploadStatus.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {uploadStatus.type === 'success' ? (
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              )}
            </div>
            <div>
              <h4 className="font-bold mb-1">
                {uploadStatus.type === 'success' ? 'Upload Successful!' : 'Upload Failed'}
              </h4>
              <p className="leading-relaxed">{uploadStatus.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Supported Document Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              type: 'PDF', 
              icon: '📄', 
              description: 'Portable Document Format',
              details: 'Standard for manufacturing specs, manuals, and procedures'
            },
            { 
              type: 'DOCX', 
              icon: '📝', 
              description: 'Microsoft Word Document',
              details: 'Word documents, reports, and structured documentation'
            },
            { 
              type: 'TXT', 
              icon: '📋', 
              description: 'Plain Text File',
              details: 'Simple text files, logs, and unformatted data'
            },
          ].map((item) => (
            <div key={item.type} className="flex flex-col p-6 border-2 border-slate-200 rounded-2xl hover:border-blue-300 transition-all duration-200 card bg-white">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-xl">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">{item.type}</p>
                  <p className="text-sm text-slate-600 font-medium">{item.description}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{item.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  XMarkIcon, 
  CheckIcon, 
  XCircleIcon,
  PencilSquareIcon 
} from '@heroicons/react/24/outline'

interface ApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  document: any
  onApprove?: () => void
  onNavigateToDocuments?: () => void
}

export default function ApprovalModal({ isOpen, onClose, document, onApprove, onNavigateToDocuments }: ApprovalModalProps) {
  const { data: session } = useSession()
  const [action, setAction] = useState<'approve' | 'reject' | 'edit'>('approve')
  const [comments, setComments] = useState('')
  const [signature, setSignature] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (action === 'approve' && !signature) {
      alert('Digital signature is required for approval')
      return
    }

    if (action === 'reject' && !comments.trim()) {
      alert('Comments are required when rejecting a document')
      return
    }

    setLoading(true)
    try {
      if (action === 'edit') {
        // Redirect to edit mode
        onClose()
        // Open document editor (this would be handled by parent component)
        return
      }

      const response = await fetch(`/api/documents/${document.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          comments,
          signature: action === 'approve' ? signature : null,
          timestamp: new Date().toISOString(),
        }),
      })

      const responseData = await response.json()

      if (response.ok) {
        const message = action === 'approve' ? 'Document approved and signed!' : 'Document rejected'
        console.log(message)
        
        if (onApprove) onApprove()
        onClose()
        
        // Navigate to documents page if callback is provided
        if (onNavigateToDocuments) {
          setTimeout(() => {
            onNavigateToDocuments()
          }, 100)
        }
      } else {
        alert(`Error ${response.status}: ${responseData.error || 'Failed to process approval'}`)
      }
    } catch (error) {
      console.error('Error processing approval:', error)
      alert('Error processing approval')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Document Review</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-2">{document?.title}</h3>
          <p className="text-sm text-gray-600">
            Template: {document?.template?.name} | Created by: {document?.user?.name}
          </p>
        </div>

        {/* Action Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Choose Action:</label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="action"
                value="edit"
                checked={action === 'edit'}
                onChange={(e) => setAction(e.target.value as any)}
                className="mr-2 text-gray-900"
              />
              <PencilSquareIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-black">Edit document (assign back for more edits)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="action"
                value="approve"
                checked={action === 'approve'}
                onChange={(e) => setAction(e.target.value as any)}
                className="mr-2 text-gray-900"
              />
              <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-black">Approve & Sign (final approval)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="action"
                value="reject"
                checked={action === 'reject'}
                onChange={(e) => setAction(e.target.value as any)}
                className="mr-2 text-gray-900"
              />
              <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-black">Reject document</span>
            </label>
          </div>
        </div>

        {/* Comments */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments {action === 'reject' ? '(required)' : '(optional)'}
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            rows={3}
            placeholder="Add your comments here..."
          />
        </div>

        {/* Digital Signature (for approval) */}
        {action === 'approve' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Digital Signature * <span className="text-xs text-gray-500">(Type your full name)</span>
            </label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Type your full name to sign"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              By typing your name, you digitally sign this document with timestamp: {new Date().toLocaleString()}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-black hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (action === 'approve' && !signature) || (action === 'reject' && !comments)}
            className={`px-4 py-2 rounded text-white disabled:opacity-50 ${
              action === 'approve' 
                ? 'bg-green-600 hover:bg-green-700' 
                : action === 'reject'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              action === 'approve' ? 'Sign & Approve' : 
              action === 'reject' ? 'Reject' : 'Continue Editing'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
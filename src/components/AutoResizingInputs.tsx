'use client'

import { useState, useCallback, memo, useEffect, useRef } from 'react'

// Auto-resizing input that manages its own state
export const AutoResizingInput = memo(function AutoResizingInput({
  value: initialValue,
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
  className = "",
  path = ""
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  readOnly?: boolean
  className?: string
  path?: string
}) {
  const [localValue, setLocalValue] = useState(initialValue)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const hiddenSpanRef = useRef<HTMLSpanElement>(null)

  // Only update local value when prop changes from external source
  useEffect(() => {
    if (initialValue !== localValue) {
      setLocalValue(initialValue)
    }
  }, [initialValue])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Auto-resize functionality
  const adjustWidth = useCallback(() => {
    const input = inputRef.current
    const hiddenSpan = hiddenSpanRef.current
    if (input && hiddenSpan) {
      const textToMeasure = localValue || placeholder || ''
      hiddenSpan.textContent = textToMeasure
      const newWidth = Math.max(hiddenSpan.scrollWidth + 24, 120) // 24px padding, 120px minimum
      input.style.width = `${newWidth}px`
    }
  }, [localValue, placeholder])

  useEffect(() => {
    adjustWidth()
  }, [localValue, adjustWidth])

  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue)
    
    // Adjust width immediately for better UX
    setTimeout(adjustWidth, 0)
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Debounced update to parent
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        onChange(newValue)
      }
    }, 500)
  }, [onChange, adjustWidth])

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type={type}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`${className} min-w-[120px]`}
        style={{ minWidth: '120px' }}
      />
      <span
        ref={hiddenSpanRef}
        className={`absolute invisible whitespace-pre pointer-events-none`}
        style={{ 
          fontSize: 'inherit',
          fontFamily: 'inherit',
          fontWeight: 'inherit',
          letterSpacing: 'inherit',
          padding: '0.5rem 0.75rem', // Match typical input padding
          top: 0,
          left: 0,
          zIndex: -1
        }}
        aria-hidden="true"
      />
    </div>
  )
})

// Auto-resizing textarea
export const AutoResizingTextarea = memo(function AutoResizingTextarea({
  value: initialValue,
  onChange,
  placeholder,
  rows = 3,
  readOnly = false,
  className = "",
  path = ""
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  readOnly?: boolean
  className?: string
  path?: string
}) {
  const [localValue, setLocalValue] = useState(initialValue)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (initialValue !== localValue) {
      setLocalValue(initialValue)
    }
  }, [initialValue])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Auto-resize functionality
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const minHeight = rows * 24 // Approximate line height
      const newHeight = Math.max(textarea.scrollHeight, minHeight)
      textarea.style.height = `${newHeight}px`
    }
  }, [rows])

  useEffect(() => {
    adjustHeight()
  }, [localValue, adjustHeight])

  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue)
    
    // Adjust height immediately for better UX
    setTimeout(adjustHeight, 0)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        onChange(newValue)
      }
    }, 500)
  }, [onChange, adjustHeight])

  return (
    <textarea
      ref={textareaRef}
      value={localValue}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`${className} resize-none overflow-hidden`}
      style={{ minHeight: `${rows * 24}px` }}
    />
  )
})

// Auto-resizing select (doesn't need resizing, but maintaining consistency)
export const AutoResizingSelect = memo(function AutoResizingSelect({
  value: initialValue,
  onChange,
  options,
  readOnly = false,
  className = "",
  path = ""
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
  readOnly?: boolean
  className?: string
  path?: string
}) {
  const [localValue, setLocalValue] = useState(initialValue)

  useEffect(() => {
    if (initialValue !== localValue) {
      setLocalValue(initialValue)
    }
  }, [initialValue])

  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue)
    onChange(newValue)
  }, [onChange])

  return (
    <select
      value={localValue}
      onChange={(e) => handleChange(e.target.value)}
      disabled={readOnly}
      className={className}
    >
      <option value="">Select...</option>
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  )
})
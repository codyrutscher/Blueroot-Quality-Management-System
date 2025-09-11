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
  const [useTextarea, setUseTextarea] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
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

  // Check if content is too long for input, switch to textarea
  const checkContentLength = useCallback(() => {
    const text = localValue || ''
    const shouldUseTextarea = text.length > 100 || text.includes('\n')
    setUseTextarea(shouldUseTextarea)
  }, [localValue])

  useEffect(() => {
    checkContentLength()
  }, [localValue, checkContentLength])

  // Auto-resize functionality for input
  const adjustInputWidth = useCallback(() => {
    const input = inputRef.current
    const hiddenSpan = hiddenSpanRef.current
    if (input && hiddenSpan && !useTextarea) {
      const textToMeasure = localValue || placeholder || ''
      hiddenSpan.textContent = textToMeasure
      
      // Get container width to set responsive limits
      const container = input.closest('.grid, .flex, [class*="col"], .form-field') as HTMLElement
      const maxWidth = container ? Math.min(container.clientWidth * 0.8, 500) : 350 // Max 80% of container or 500px
      const minWidth = 120
      
      const idealWidth = hiddenSpan.scrollWidth + 24 // 24px padding
      const newWidth = Math.min(Math.max(idealWidth, minWidth), maxWidth)
      
      input.style.width = `${newWidth}px`
    }
  }, [localValue, placeholder, useTextarea])

  // Auto-resize functionality for textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea && useTextarea) {
      textarea.style.height = 'auto'
      const newHeight = Math.max(textarea.scrollHeight, 40) // 40px minimum
      textarea.style.height = `${newHeight}px`
    }
  }, [useTextarea])

  useEffect(() => {
    if (useTextarea) {
      adjustTextareaHeight()
    } else {
      adjustInputWidth()
    }
  }, [localValue, useTextarea, adjustInputWidth, adjustTextareaHeight])

  // Adjust on window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (useTextarea) {
        adjustTextareaHeight()
      } else {
        adjustInputWidth()
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [adjustInputWidth, adjustTextareaHeight, useTextarea])

  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue)
    
    // Adjust size immediately for better UX
    setTimeout(() => {
      if (useTextarea) {
        adjustTextareaHeight()
      } else {
        adjustInputWidth()
      }
    }, 0)
    
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
  }, [onChange, adjustInputWidth, adjustTextareaHeight, useTextarea])

  if (useTextarea) {
    return (
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`${className} w-full resize-none overflow-hidden`}
          style={{ 
            minHeight: '40px',
            maxWidth: '100%'
          }}
        />
      </div>
    )
  }

  return (
    <div className="relative inline-block max-w-full">
      <input
        ref={inputRef}
        type={type}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`${className} min-w-[120px] max-w-full`}
        style={{ 
          minWidth: '120px',
          maxWidth: '100%'
        }}
      />
      <span
        ref={hiddenSpanRef}
        className={`absolute invisible whitespace-pre pointer-events-none`}
        style={{ 
          fontSize: 'inherit',
          fontFamily: 'inherit',
          fontWeight: 'inherit',
          letterSpacing: 'inherit',
          padding: '0.5rem 0.75rem',
          top: 0,
          left: 0,
          zIndex: -1,
          maxWidth: '500px'
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
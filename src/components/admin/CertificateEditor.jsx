import { useState, useRef } from 'react'

function CertificateEditor({ templateUrl, mappings, onMappingsChange, previewData }) {
  const [selectedField, setSelectedField] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)

  const handleMouseDown = (index, e) => {
    e.preventDefault()
    setSelectedField(index)
    setIsDragging(true)
  }

  const handleMouseMove = (e) => {
    if (!isDragging || selectedField === null || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height))

    const newMappings = [...mappings]
    newMappings[selectedField] = {
      ...newMappings[selectedField],
      x: Math.round(x),
      y: Math.round(y)
    }
    onMappingsChange(newMappings)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const getFieldValue = (field) => {
    if (!previewData) return field.label
    
    switch (field.field) {
      case 'name':
        return previewData.name || 'Student Name'
      case 'event':
        return previewData.event || 'Event Title'
      case 'date':
        return previewData.date || new Date().toLocaleDateString()
      case 'custom':
        return field.customText || field.label
      default:
        return field.label
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
        <p className="text-yellow-400 text-sm">
          💡 <strong>Drag and drop</strong> the text fields on the certificate to position them. Click a field to select it.
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700 cursor-crosshair"
        style={{ 
          width: '100%',
          minHeight: '500px',
          maxHeight: '700px',
          position: 'relative'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Certificate Template */}
        {templateUrl ? (
          <img
            src={templateUrl}
            alt="Certificate template"
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
            style={{ maxHeight: '700px' }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">📜</div>
              <p>Upload a certificate template to get started</p>
            </div>
          </div>
        )}

        {/* Draggable Text Fields */}
        {mappings && mappings.length > 0 && mappings.map((field, index) => (
          <div
            key={index}
            className={`absolute cursor-move select-none transition-all ${
              selectedField === index ? 'ring-2 ring-akatsuki-red' : ''
            }`}
            style={{
              left: `${field.x}px`,
              top: `${field.y}px`,
              fontSize: `${field.fontSize}px`,
              color: field.color,
              fontFamily: field.fontFamily,
              transform: 'translate(-50%, -50%)',
              textShadow: '0 0 8px rgba(0,0,0,0.8), 0 0 4px rgba(255,255,255,0.3)',
              whiteSpace: 'nowrap',
              fontWeight: 'bold',
              zIndex: 10,
              padding: '4px 8px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
              backdropFilter: 'blur(2px)'
            }}
            onMouseDown={(e) => handleMouseDown(index, e)}
          >
            {getFieldValue(field)}
            
            {/* Selection indicator */}
            {selectedField === index && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-akatsuki-red text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
                {field.label}
              </div>
            )}
          </div>
        ))}

        {/* Grid overlay when dragging */}
        {isDragging && (
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        )}
      </div>

      {/* Coordinates Display */}
      {selectedField !== null && (
        <div className="bg-black/40 border border-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              <strong className="text-white">{mappings[selectedField].label}</strong> position:
            </span>
            <span className="text-akatsuki-red font-mono">
              X: {mappings[selectedField].x}px, Y: {mappings[selectedField].y}px
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CertificateEditor

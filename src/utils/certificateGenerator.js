// Client-side certificate generator using Canvas API

export async function generateCertificateImage(templateUrl, certificateData, mappings) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw template image
      ctx.drawImage(img, 0, 0)
      
      // Draw text fields based on mappings
      mappings.forEach(mapping => {
        let text = ''
        
        // Get text based on field type
        switch (mapping.field) {
          case 'name':
            text = certificateData.student_name
            break
          case 'event':
            text = certificateData.event_title
            break
          case 'date':
            text = certificateData.event_date
            break
          case 'custom':
            text = mapping.customText || ''
            break
          default:
            text = ''
        }
        
        if (!text) return
        
        // Set text style
        ctx.font = `${mapping.fontSize}px ${mapping.fontFamily}`
        ctx.fillStyle = mapping.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // Draw text
        ctx.fillText(text, mapping.x, mapping.y)
      })
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/png')
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load certificate template'))
    }
    
    img.src = templateUrl
  })
}

export function downloadCertificate(blob, studentName) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Certificate_${studentName.replace(/\s+/g, '_')}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

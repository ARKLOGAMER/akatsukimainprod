import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import CertificateEditor from './CertificateEditor'
import { generateCertificateImage, downloadCertificate } from '../../utils/certificateGenerator'

function CertificatesTab({ eventId, token }) {
  const [template, setTemplate] = useState(null)
  const [issuedCerts, setIssuedCerts] = useState([])
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [templatePreview, setTemplatePreview] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewCert, setPreviewCert] = useState(null)
  const [previewData, setPreviewData] = useState({
    name: 'John Doe',
    event: 'Sample Event',
    date: new Date().toLocaleDateString()
  })
  
  const [mappings, setMappings] = useState([
    { field: 'name', label: 'Student Name', x: 400, y: 500, fontSize: 48, color: '#000000', fontFamily: 'Arial' },
    { field: 'event', label: 'Event Title', x: 400, y: 600, fontSize: 36, color: '#000000', fontFamily: 'Arial' },
    { field: 'date', label: 'Date', x: 400, y: 700, fontSize: 24, color: '#666666', fontFamily: 'Arial' }
  ])

  useEffect(() => {
    loadTemplate()
    loadIssuedCertificates()
  }, [eventId])

  const loadTemplate = async () => {
    try {
      const data = await api.getCertificateTemplate(eventId, token)
      if (data) {
        setTemplate(data)
        setTemplatePreview(data.template_url)
        if (data.mappings && data.mappings.length > 0) {
          setMappings(data.mappings)
        }
      }
    } catch (err) {
      console.error('Failed to load template:', err)
      // Template doesn't exist yet - this is OK for first time
      setTemplate(null)
    }
  }

  const loadIssuedCertificates = async () => {
    try {
      const data = await api.getIssuedCertificates(eventId, token)
      setIssuedCerts(data || [])
    } catch (err) {
      console.error('Failed to load certificates:', err)
      setIssuedCerts([])
    }
  }

  const handleTemplateUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    setUploading(true)
    try {
      const imageUrl = await api.uploadImage(file)
      setTemplatePreview(imageUrl)
      
      if (template) {
        await api.updateCertificateTemplate(eventId, { template_url: imageUrl, mappings: mappings }, token)
      } else {
        await api.createCertificateTemplate(eventId, { template_url: imageUrl, mappings: mappings }, token)
      }
      
      await loadTemplate()
      alert('✅ Template uploaded!')
    } catch (err) {
      alert('❌ Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleMappingChange = (index, field, value) => {
    const newMappings = [...mappings]
    newMappings[index][field] = value
    setMappings(newMappings)
  }

  const addMapping = () => {
    setMappings([...mappings, { 
      field: 'custom', 
      label: 'Custom Field', 
      x: 400, 
      y: 800, 
      fontSize: 24, 
      color: '#000000',
      fontFamily: 'Arial'
    }])
  }

  const removeMapping = (index) => {
    setMappings(mappings.filter((_, i) => i !== index))
  }

  const saveMappings = async () => {
    if (!template) {
      alert('Please upload a template first')
      return
    }

    try {
      await api.updateCertificateTemplate(eventId, { mappings }, token)
      await loadTemplate()
      alert('✅ Mappings saved!')
    } catch (err) {
      alert('❌ Failed to save mappings')
    }
  }

  const generateCertificates = async () => {
    if (!template) {
      alert('Please upload and configure a template first')
      return
    }

    if (!confirm('Generate certificates for all registered students?')) return

    setGenerating(true)
    try {
      await api.generateCertificates(eventId, token)
      await loadIssuedCertificates()
      setShowPreview(true)
      alert('✅ Certificates generated! Review them below before sending.')
    } catch (err) {
      alert('❌ Generation failed: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  const previewCertificate = (cert) => {
    setPreviewCert(cert)
    setPreviewData({
      name: cert.student_name,
      event: cert.event?.title || 'Event',
      date: new Date(cert.issued_at).toLocaleDateString()
    })
  }

  const handleDownloadCertificate = async (cert) => {
    try {
      const event = await api.getEvent(eventId)
      const certificateData = {
        student_name: cert.student_name,
        event_title: event.title,
        event_date: new Date(event.start_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
      
      const blob = await generateCertificateImage(
        template.template_url,
        certificateData,
        mappings
      )
      
      downloadCertificate(blob, cert.student_name)
    } catch (err) {
      alert('❌ Failed to generate certificate: ' + err.message)
    }
  }

  const resendCertificate = async (cert) => {
    if (!confirm(`Resend certificate to ${cert.student_email}?`)) return

    try {
      // Mark as unsent first
      await fetch(`${api.BASE_URL || 'https://gupuawcqhvnifwayotot.supabase.co'}/rest/v1/issued_certificates?id=eq.${cert.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1cHVhd2NxaHZuaWZ3YXlvdG90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MzM4NzMsImV4cCI6MjA3OTAwOTg3M30.Ms5GXPD3MParkWpA0HRq7wZJ9O5I_Drxinw4KjRb4hU',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email_sent: false,
          email_sent_at: null
        })
      })

      // Send email
      await api.sendCertificateEmails(eventId, token)
      await loadIssuedCertificates()
      alert('✅ Certificate resent!')
    } catch (err) {
      alert('❌ Failed to resend: ' + err.message)
    }
  }

  const sendCertificates = async () => {
    if (issuedCerts.length === 0) {
      alert('No certificates to send. Generate them first.')
      return
    }

    if (!confirm(`Send certificates to ${issuedCerts.filter(c => !c.email_sent).length} students?`)) return

    setSending(true)
    try {
      await api.sendCertificateEmails(eventId, token)
      await loadIssuedCertificates()
      alert('✅ Certificates sent!')
    } catch (err) {
      alert('❌ Failed to send: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Template Upload */}
      <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">📜 Step 1: Upload Certificate Template</h3>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleTemplateUpload}
          disabled={uploading}
          className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-akatsuki-red file:text-white"
        />
        {uploading && <p className="text-blue-400 text-sm mt-2">Uploading...</p>}
      </div>

      {/* Visual Editor */}
      {template && (
        <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">🎯 Step 2: Position Text Fields (Drag & Drop)</h3>
          
          <CertificateEditor
            templateUrl={templatePreview}
            mappings={mappings}
            onMappingsChange={setMappings}
            previewData={previewData}
          />
        </div>
      )}

      {/* Field Configuration */}
      {template && (
        <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">⚙️ Step 3: Configure Fields</h3>
            <button
              onClick={addMapping}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold"
            >
              + Add Field
            </button>
          </div>
          
          <div className="space-y-4">
            {mappings.map((mapping, index) => (
              <div key={index} className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-white font-semibold">{mapping.label}</h4>
                  {mappings.length > 1 && (
                    <button
                      onClick={() => removeMapping(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Field Type</label>
                    <select
                      value={mapping.field}
                      onChange={(e) => handleMappingChange(index, 'field', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm"
                    >
                      <option value="name">Student Name</option>
                      <option value="event">Event Title</option>
                      <option value="date">Date</option>
                      <option value="custom">Custom Text</option>
                    </select>
                  </div>
                  
                  {mapping.field === 'custom' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Custom Text</label>
                      <input
                        type="text"
                        value={mapping.customText || ''}
                        onChange={(e) => handleMappingChange(index, 'customText', e.target.value)}
                        placeholder="Enter text..."
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Font Size</label>
                    <input
                      type="number"
                      value={mapping.fontSize}
                      onChange={(e) => handleMappingChange(index, 'fontSize', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Color</label>
                    <input
                      type="color"
                      value={mapping.color}
                      onChange={(e) => handleMappingChange(index, 'color', e.target.value)}
                      className="w-full h-9 bg-gray-800/50 border border-gray-700 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Font Family</label>
                    <select
                      value={mapping.fontFamily}
                      onChange={(e) => handleMappingChange(index, 'fontFamily', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={saveMappings}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            💾 Save Configuration
          </button>
        </div>
      )}

      {/* Actions */}
      {template && (
        <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">⚡ Step 4: Generate & Send</h3>
          
          <div className="flex gap-4">
            <button
              onClick={generateCertificates}
              disabled={generating}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {generating ? (
                <>⏳ Generating...</>
              ) : (
                <>🎨 Generate Certificates</>
              )}
            </button>
            
            <button
              onClick={sendCertificates}
              disabled={sending || issuedCerts.length === 0}
              className="px-6 py-3 bg-akatsuki-red hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {sending ? (
                <>⏳ Sending...</>
              ) : (
                <>📧 Send to All Students</>
              )}
            </button>
          </div>
          
          {issuedCerts.length > 0 && (
            <p className="text-gray-400 text-sm mt-3">
              ✓ {issuedCerts.length} certificates ready • {issuedCerts.filter(c => c.email_sent).length} already sent
            </p>
          )}
        </div>
      )}

      {/* Issued Certificates List */}
      <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">📋 Generated Certificates ({issuedCerts.length})</h3>
        
        {issuedCerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">📜</div>
            <p className="text-gray-400">No certificates generated yet. Click "Generate Certificates" above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Student</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Issued</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Email Status</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issuedCerts.map(cert => (
                  <tr key={cert.id} className="border-b border-gray-800 hover:bg-white/5">
                    <td className="py-3 px-4 text-white">{cert.student_name}</td>
                    <td className="py-3 px-4 text-gray-400">{cert.student_email}</td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(cert.issued_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {cert.email_sent ? (
                        <span className="text-green-400">✓ Sent</span>
                      ) : (
                        <span className="text-yellow-400">⏳ Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => previewCertificate(cert)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          👁️ Preview
                        </button>
                        <button
                          onClick={() => handleDownloadCertificate(cert)}
                          className="text-green-400 hover:text-green-300 text-sm"
                        >
                          📥 Download
                        </button>
                        {cert.email_sent && (
                          <button
                            onClick={() => resendCertificate(cert)}
                            className="text-yellow-400 hover:text-yellow-300 text-sm"
                          >
                            🔄 Resend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewCert(null)}>
          <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-4xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Certificate Preview - {previewCert.student_name}</h3>
              <button
                onClick={() => setPreviewCert(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <CertificateEditor
                templateUrl={templatePreview}
                mappings={mappings}
                onMappingsChange={() => {}}
                previewData={{
                  name: previewCert.student_name,
                  event: previewCert.event?.title || 'Event',
                  date: new Date(previewCert.issued_at).toLocaleDateString()
                }}
              />
            </div>
            
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setPreviewCert(null)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadCertificate(previewCert)}
                className="flex-1 px-4 py-2 bg-akatsuki-red hover:bg-red-700 text-white rounded-lg"
              >
                📥 Download Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CertificatesTab

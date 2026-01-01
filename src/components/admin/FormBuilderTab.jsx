import { useState, useEffect } from 'react'
import { api } from '../../services/api'

function FormBuilderTab({ eventId, token }) {
  const [fields, setFields] = useState([
    { label: 'Full Name', type: 'text', required: true },
    { label: 'Email', type: 'email', required: true },
    { label: 'Phone', type: 'tel', required: true },
    { label: 'Age', type: 'number', required: true },
    { label: 'College', type: 'text', required: true },
    { label: 'Department', type: 'text', required: true },
    { label: 'Reason', type: 'textarea', required: true },
    { label: 'Payment Screenshot URL', type: 'url', required: false }
  ])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSchema()
  }, [eventId])

  const loadSchema = async () => {
    const schema = await api.getFormSchema(eventId, token)
    if (schema?.schema_json) {
      setFields(schema.schema_json)
    }
  }

  const addField = () => {
    setFields([...fields, { label: '', type: 'text', required: false }])
  }

  const updateField = (index, key, value) => {
    const updated = [...fields]
    updated[index][key] = value
    setFields(updated)
  }

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const saveSchema = async () => {
    await api.updateFormSchema(eventId, fields, token)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Form Fields</h3>
          <button
            onClick={addField}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Field
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Field Label"
                  value={field.label}
                  onChange={(e) => updateField(index, 'label', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
                
                <div className="flex gap-4">
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, 'type', e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="number">Number</option>
                    <option value="textarea">Textarea</option>
                    <option value="url">URL</option>
                    <option value="dropdown">Dropdown</option>
                  </select>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, 'required', e.target.checked)}
                    />
                    <span className="text-sm">Required</span>
                  </label>
                </div>
              </div>

              <button
                onClick={() => removeField(index)}
                className="text-red-600 hover:text-red-800 px-3 py-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={saveSchema}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Save Form Schema
          </button>
          {saved && (
            <span className="text-green-600 flex items-center">✓ Saved successfully</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default FormBuilderTab

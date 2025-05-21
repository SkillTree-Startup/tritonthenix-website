import React, { useState } from 'react'; // Import React
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Event } from '../types/Event';

interface EventEditPopupProps {
  event: Event
  onClose: () => void
  onDelete: (eventId: string) => void
}

interface EditableFields {
  name: string;
  date: string;
  time: string;
  description: string;
  additionalDetails?: string;
  tags?: string;
  type: 'Event' | 'Workout';
}

interface EditingFields {
  name: boolean;
  date: boolean;
  time: boolean;
  description: boolean;
  additionalDetails: boolean;
  tags: boolean;
  type: boolean;
}

// Common edit button component (simplified)
const EditButton = ({ onClick }: { onClick: () => void }) => (
  <button
    className="button" // Basic button styling
    style={{
      backgroundColor: 'var(--blue2)',
      padding: 'var(--space-2)',
      borderRadius: 'var(--border-radius-medium)'
    }}
    onClick={onClick}
    onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--blue3)'}
    onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--blue2)'}
  >
    {/* Replace Pencil icon */}
    ✏️
  </button>
)

// Import the helper functions from AdminPanel
const generateTimeOptions = () => {
  const times = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      const hourStr = hour.toString().padStart(2, '0')
      const minStr = minute.toString().padStart(2, '0')
      const timeStr = `${hourStr}:${minStr}`
      const label = `${hour % 12 || 12}:${minStr} ${hour < 12 ? 'AM' : 'PM'}`
      times.push({ value: timeStr, label })
    }
  }
  return times
}

const generateDateOptions = () => {
  const dates = []
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))

  for (let i = 0; i < 365; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const pacificDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
    const year = pacificDate.getFullYear()
    const month = String(pacificDate.getMonth() + 1).padStart(2, '0')
    const day = String(pacificDate.getDate()).padStart(2, '0')
    const value = `${year}-${month}-${day}`
    const label = pacificDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/Los_Angeles'
    })
    dates.push({ value, label })
  }
  return dates
}

// Add this helper function at the top of the file (same as AdminPanel)
const formatEventDate = (dateStr: string) => {
  // Add Pacific Time zone offset to ensure correct date
  const date = new Date(`${dateStr}T00:00:00-08:00`)
  return date.toLocaleDateString()
}

export const EventEditPopup = ({ event, onClose, onDelete }: EventEditPopupProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editedEvent, setEditedEvent] = useState<EditableFields>({
    name: event.name,
    date: event.date,
    time: event.time,
    description: event.description,
    additionalDetails: event.additionalDetails,
    tags: event.tags,
    type: event.type
  })
  const [editing, setEditing] = useState<EditingFields>({
    name: false,
    description: false,
    date: false,
    time: false,
    tags: false,
    additionalDetails: false,
    type: false
  })
  const [dateOptions] = useState(generateDateOptions())
  const [timeOptions] = useState(generateTimeOptions())

  // Add save function
  const handleSave = async (field: keyof EditableFields) => {
    try {
      await updateDoc(doc(db, 'events', event.id), {
        [field]: editedEvent[field],
        updatedAt: new Date()
      })
      setEditing(prev => ({ ...prev, [field]: false }))
    } catch (error) {
      console.error('Error updating event:', error)
    }
  }

  const handleFieldChange = (field: keyof EditableFields, value: string) => {
    setEditedEvent(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}> {/* Use modal-overlay from index.css */}
      <div className="modal-content flex flex-col" style={{ gap: 'var(--space-4)' }} onClick={(e) => e.stopPropagation()}> {/* Use modal-content */}
        {/* Header */}
        <header className="flex justify-between items-center">
          <h2 style={{ fontSize: 'var(--font-size-6)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Event Details
          </h2>
          <button
            className="button"
            style={{ backgroundColor: 'transparent', borderRadius: 'var(--border-radius-round)', padding: 'var(--space-1)' }}
            onClick={onClose}
          >
            {/* Replace X icon */}
            ❌
          </button>
        </header>

        <div className="scroll-view" style={{ maxHeight: 'calc(80vh - 150px)', overflowY: 'auto' }}> {/* Adjust maxHeight as needed */}
          <div className="flex flex-col" style={{ gap: 'var(--space-4)', padding: 'var(--space-2)' }}>
            {/* Name Field */}
            <div className="form-field flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-3)', fontWeight: 'bold' }}>Name</label>
              <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                {editing.name ? (
                  <div className="flex" style={{ flex: 1, gap: 'var(--space-2)' }}>
                    <input
                      type="text"
                      style={{ flex: 1 }} // Uses global input styles
                      value={editedEvent.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                    />
                    <button
                      className="button"
                      style={{ backgroundColor: 'var(--blue8)', color: 'white' }}
                      onClick={() => handleSave('name')}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center" style={{ flex: 1, gap: 'var(--space-2)' }}>
                    <p style={{ flex: 1, color: 'var(--text-primary)' }}>{editedEvent.name}</p>
                    <EditButton onClick={() => setEditing(prev => ({ ...prev, name: true }))} />
                  </div>
                )}
              </div>
            </div>

            {/* Type Field */}
            <div className="form-field flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-3)', fontWeight: 'bold' }}>Event Type</label>
              <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                {editing.type ? (
                  <div className="flex" style={{ flex: 1, gap: 'var(--space-2)' }}>
                    <div className="flex" style={{ flex: 1, gap: 'var(--space-2)' }}>
                      <button
                        className="button"
                        style={{
                          flex: 1,
                          backgroundColor: editedEvent.type === 'Workout' ? 'var(--blue8)' : 'var(--gray4)',
                          color: editedEvent.type === 'Workout' ? 'white' : 'var(--text-primary)',
                          padding: 'var(--space-2)'
                        }}
                        onClick={() => handleFieldChange('type', 'Workout')}
                      >
                        Workout
                      </button>
                      <button
                        className="button"
                        style={{
                          flex: 1,
                          backgroundColor: editedEvent.type === 'Event' ? 'var(--blue8)' : 'var(--gray4)',
                          color: editedEvent.type === 'Event' ? 'white' : 'var(--text-primary)',
                          padding: 'var(--space-2)'
                        }}
                        onClick={() => handleFieldChange('type', 'Event')}
                      >
                        Event
                      </button>
                    </div>
                    <button
                      className="button"
                      style={{ backgroundColor: 'var(--blue8)', color: 'white', padding: 'var(--space-2)' }}
                      onClick={() => handleSave('type')}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center" style={{ flex: 1, gap: 'var(--space-2)' }}>
                    <p style={{ flex: 1, color: 'var(--text-primary)' }}>
                      {editedEvent.type}
                    </p>
                    <EditButton onClick={() => setEditing(prev => ({ ...prev, type: true }))} />
                  </div>
                )}
              </div>
            </div>

            {/* Date Field */}
            <div className="form-field flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-3)', fontWeight: 'bold' }}>Date</label>
              <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                {editing.date ? (
                  <div className="flex" style={{ flex: 1, gap: 'var(--space-2)' }}>
                    <select
                      value={editedEvent.date}
                      onChange={(e) => handleFieldChange('date', e.target.value)}
                      style={{ /* Uses global select styles from index.css */ flex: 1 }}
                    >
                      <option value="">Select Date</option>
                      {dateOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      className="button"
                      style={{ backgroundColor: 'var(--blue8)', color: 'white', padding: 'var(--space-2)' }}
                      onClick={() => handleSave('date')}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center" style={{ flex: 1, gap: 'var(--space-2)' }}>
                    <p style={{ flex: 1, color: 'var(--text-primary)' }}>
                      {formatEventDate(editedEvent.date)}
                    </p>
                    <EditButton onClick={() => setEditing(prev => ({ ...prev, date: true }))} />
                  </div>
                )}
              </div>
            </div>

            {/* Time Field */}
            <div className="form-field flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-3)', fontWeight: 'bold' }}>Time</label>
              <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                {editing.time ? (
                  <div className="flex" style={{ flex: 1, gap: 'var(--space-2)' }}>
                    <select
                      value={editedEvent.time}
                      onChange={(e) => handleFieldChange('time', e.target.value)}
                      style={{ flex: 1 }} // Uses global select styles
                    >
                      <option value="">Select Time</option>
                      {timeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      className="button"
                      style={{ backgroundColor: 'var(--blue8)', color: 'white', padding: 'var(--space-2)' }}
                      onClick={() => handleSave('time')}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center" style={{ flex: 1, gap: 'var(--space-2)' }}>
                    <p style={{ flex: 1, color: 'var(--text-primary)' }}>
                      {editedEvent.time}
                    </p>
                    <EditButton onClick={() => setEditing(prev => ({ ...prev, time: true }))} />
                  </div>
                )}
              </div>
            </div>

            {/* Description Field */}
            <div className="form-field flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-3)', fontWeight: 'bold' }}>Description</label>
              <div className="flex items-start" style={{ gap: 'var(--space-2)' }}> {/* alignItems="flex-start" */}
                {editing.description ? (
                  <div className="flex" style={{ flex: 1, gap: 'var(--space-2)' }}>
                    <textarea
                      style={{ flex: 1, minHeight: '100px' }} // Uses global textarea styles
                      value={editedEvent.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                    />
                    <button
                      className="button"
                      style={{ backgroundColor: 'var(--blue8)', color: 'white' }}
                      onClick={() => handleSave('description')}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start" style={{ flex: 1, gap: 'var(--space-2)' }}>
                    <p style={{ flex: 1, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{editedEvent.description}</p>
                    <EditButton onClick={() => setEditing(prev => ({ ...prev, description: true }))} />
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details Field */}
            <div className="form-field flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-3)', fontWeight: 'bold' }}>Additional Details</label>
              <div className="flex items-start" style={{ gap: 'var(--space-2)' }}>
                {editing.additionalDetails ? (
                  <div className="flex" style={{ flex: 1, gap: 'var(--space-2)' }}>
                    <textarea
                      style={{ flex: 1, minHeight: '100px' }} // Uses global textarea styles
                      value={editedEvent.additionalDetails || ''}
                      onChange={(e) => handleFieldChange('additionalDetails', e.target.value)}
                      placeholder="Add any additional information..."
                    />
                    <button
                      className="button"
                      style={{ backgroundColor: 'var(--blue8)', color: 'white' }}
                      onClick={() => handleSave('additionalDetails')}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start" style={{ flex: 1, gap: 'var(--space-2)' }}>
                    <p style={{ flex: 1, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                      {editedEvent.additionalDetails || 'No additional details'}
                    </p>
                    <EditButton onClick={() => setEditing(prev => ({ ...prev, additionalDetails: true }))} />
                  </div>
                )}
              </div>
            </div>

            {/* Tags Field */}
            <div className="form-field flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-3)', fontWeight: 'bold' }}>Tags</label>
              <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                {editing.tags ? (
                  <div className="flex" style={{ flex: 1, gap: 'var(--space-2)' }}>
                    <input
                      type="text"
                      style={{ flex: 1 }} // Uses global input styles
                      value={editedEvent.tags}
                      onChange={(e) => handleFieldChange('tags', e.target.value)}
                    />
                    <button
                      className="button"
                      style={{ backgroundColor: 'var(--blue8)', color: 'white' }}
                      onClick={() => handleSave('tags')}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center" style={{ flex: 1, gap: 'var(--space-2)' }}>
                    <p style={{ flex: 1, color: 'var(--text-primary)' }}>{editedEvent.tags || 'No tags'}</p>
                    <EditButton onClick={() => setEditing(prev => ({ ...prev, tags: true }))} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete button and confirmation */}
        {!showDeleteConfirm ? (
          <button
            className="button"
            style={{
              backgroundColor: 'var(--red8)',
              color: 'white',
              fontSize: 'var(--font-size-3)',
              width: '100%' // Make button full width
            }}
            onClick={() => setShowDeleteConfirm(true)}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--red7)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--red8)'}
          >
            Delete Event
          </button>
        ) : (
          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            <p style={{ color: 'var(--text-primary)', textAlign: 'center', fontWeight: 'bold' }}>
              Are you sure you want to delete this event?
            </p>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: 'var(--font-size-3)' }}>
              This action cannot be undone.
            </p>
            <div className="flex" style={{ gap: 'var(--space-2)', justifyContent: 'center' }}>
              <button
                className="button"
                style={{
                  backgroundColor: 'var(--gray8)',
                  color: 'white',
                  fontSize: 'var(--font-size-3)',
                  flex: 1
                }}
                onClick={() => setShowDeleteConfirm(false)}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--gray7)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--gray8)'}
              >
                Cancel
              </button>
              <button
                className="button"
                style={{
                  backgroundColor: 'var(--red8)',
                  color: 'white',
                  fontSize: 'var(--font-size-3)',
                  flex: 1
                }}
                onClick={() => onDelete(event.id)}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--red7)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--red8)'}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
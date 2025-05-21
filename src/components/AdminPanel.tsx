import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, getDoc } from 'firebase/firestore'
import { RSVPListPopup } from './RSVPListPopup'
import { EventEditPopup } from './EventEditPopup'
import { Event, EventWithTimestamp } from '../types/Event'

// Add helper function to generate time options
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

// Add this helper function next to generateTimeOptions
const generateDateOptions = () => {
  const dates = []
  // Start with Pacific time
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))

  for (let i = 0; i < 365; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    // Force the date to be interpreted in Pacific time
    const pacificDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))

    // Format the date components
    const year = pacificDate.getFullYear()
    const month = String(pacificDate.getMonth() + 1).padStart(2, '0')
    const day = String(pacificDate.getDate()).padStart(2, '0')
    const value = `${year}-${month}-${day}`

    // Format the label
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

// Add this helper function at the top of the file
const formatEventDate = (dateStr: string) => {
  // Add Pacific Time zone offset to ensure correct date
  const date = new Date(`${dateStr}T00:00:00-08:00`);
  return date.toLocaleDateString();
};

interface AdminPanelProps {
  userEmail?: string;
}

export const AdminPanel = ({ userEmail = '' }: AdminPanelProps) => {
  const [eventData, setEventData] = useState<Event>({
    id: '',
    name: '',
    type: 'Workout',
    date: '',
    time: '',
    description: '',
    tags: '',
    additionalDetails: ''
  })

  // Add state to track if form has been submitted
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  // Initialize date and time options
  const [dateOptions] = useState(generateDateOptions())
  const [timeOptions] = useState(generateTimeOptions())

  const [eventHistory, setEventHistory] = useState<EventWithTimestamp[]>([])

  // Add a function to check window width
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024)

  // Add state for showing RSVPs
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  // Add state for RSVP list popup
  const [rsvpEventId, setRsvpEventId] = useState<string | null>(null)

  // Add useEffect to fetch and listen to events
  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const events: EventWithTimestamp[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        events.push({
          ...data,
          id: doc.id,
          name: data.name,
          date: data.date,
          time: data.time,
          description: data.description,
          type: data.type,
          tags: data.tags || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt.toDate(),
          maxRSVPs: data.maxRSVPs,
          attendees: data.attendees || [],
          creatorName: data.creatorName,
          creatorProfilePicture: data.creatorProfilePicture
        } as EventWithTimestamp)
      })
      setEventHistory(events)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1024)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSubmit = async () => {
    // Validate required fields including additionalDetails
    if (!eventData.name.trim() || !eventData.date || !eventData.time ||
      !eventData.description.trim() || !eventData.additionalDetails?.trim()) {
      setHasAttemptedSubmit(true)
      return
    }

    try {
      // Get creator's info from Firestore
      const userDoc = await getDoc(doc(db, 'users', userEmail))
      const userData = userDoc.data()

      // Create the event document
      const newEvent = {
        ...eventData,
        creatorEmail: userEmail,
        creatorName: userData?.name || 'Anonymous',
        creatorProfilePicture: userData?.profilePicture || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        attendees: [],
        date: eventData.date, // Ensure date is included
        time: eventData.time, // Ensure time is included
        type: eventData.type || 'Workout', // Ensure type has a default
        description: eventData.description.trim(),
        tags: eventData.tags?.trim() || '',
        additionalDetails: eventData.additionalDetails?.trim() || ''
      }

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'events'), newEvent)
      console.log('Event added with ID:', docRef.id)

      // Reset form
      setEventData({
        id: '',
        name: '',
        type: 'Workout',
        date: '',
        time: '',
        description: '',
        tags: '',
        additionalDetails: ''
      })

      // Reset submit attempt flag
      setHasAttemptedSubmit(false)

    } catch (error) {
      console.error('Error adding event:', error)
      // Optionally add error handling UI here
    }
  }

  const handleCopyEvent = (event: EventWithTimestamp) => {
    setEventData({
      id: '',
      name: event.name,
      type: event.type,
      date: event.date,
      time: event.time,
      description: event.description,
      tags: event.tags,
      additionalDetails: event.additionalDetails || ''
    })
    // Scroll to top of form on mobile
    if (!isDesktop) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'events', id))
      console.log('Event deleted successfully')
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  // Add a helper function to check if an event is in the past
  const isEventPast = (eventDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)  // Reset time to start of day
    const date = new Date(`${eventDate}T00:00:00-08:00`)
    return date < today
  }

  // Add helper function to check if event is today
  const isEventToday = (eventDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)  // Reset time to start of day
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const date = new Date(`${eventDate}T00:00:00-08:00`)
    return date >= today && date < tomorrow
  }

  return (
    <div
      className="admin-panel-container flex flex-col items-center"
      style={{ padding: 'var(--space-4)', width: '100%', gap: 'var(--space-4)' }}
    >
      {/* Form Panel */}
      <div
        className="form-panel flex flex-col"
        style={{ gap: 'var(--space-4)', maxWidth: '500px', width: '100%' }}
      >
        <h1
          style={{
            fontSize: 'var(--font-size-8)',
            fontWeight: 'bold',
            color: 'var(--text-primary)'
          }}
        >
          Admin Panel
        </h1>

        {/* Name Input */}
        <div className="form-group flex flex-col" style={{ gap: 'var(--space-2)' }}>
          <label htmlFor="eventName" style={{ color: 'var(--text-primary)' }}>Name *</label>
          <input
            type="text"
            id="eventName"
            value={eventData.name}
            onChange={(e) => setEventData(prev => ({ ...prev, name: e.target.value }))}
            placeholder={`Enter ${eventData.type.toLowerCase()} name`}
            style={{
              border: `1px solid ${!eventData.name.trim() && hasAttemptedSubmit ? 'red' : 'var(--border-color)'}`,
              // backgroundColor: 'var(--input-background)', // Covered by global input style
              // padding: 'var(--space-3)', // Covered by global input style
              // color: 'var(--input-text-color)', // Covered by global input style
            }}
          // placeholderTextColor handled by ::placeholder in CSS
          />
        </div>

        {/* Type Toggle */}
        <div
          className="type-toggle flex"
          style={{ backgroundColor: 'var(--card-background)', borderRadius: 'var(--border-radius-medium)', overflow: 'hidden' }}
        >
          <button
            style={{
              flex: 1,
              backgroundColor: eventData.type === 'Workout' ? 'var(--background)' : 'transparent',
              color: 'var(--text-primary)',
              padding: 'var(--space-3)',
            }}
            onClick={() => setEventData(prev => ({ ...prev, type: 'Workout' }))}
          >
            Workout
          </button>
          <button
            style={{
              flex: 1,
              backgroundColor: eventData.type === 'Event' ? 'var(--background)' : 'transparent',
              color: 'var(--text-primary)',
              padding: 'var(--space-3)',
            }}
            onClick={() => setEventData(prev => ({ ...prev, type: 'Event' }))}
          >
            Event
          </button>
        </div>

        {/* Date/Time Selection */}
        <div className="form-group flex flex-col" style={{ gap: 'var(--space-2)' }}>
          <label style={{ color: 'var(--text-primary)' }}>Date/Time *</label>
          <div className="flex" style={{ gap: 'var(--space-4)', width: '100%' }}>
            {/* Date Input */}
            <div style={{ flex: 1 }}>
              <select
                value={eventData.date}
                onChange={(e) => setEventData(prev => ({ ...prev, date: e.target.value }))}
              // Basic styling, can be enhanced with .custom-select-container if needed
              >
                <option value="">Select Date</option>
                {dateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Input */}
            <div style={{ flex: 1 }}>
              <select
                value={eventData.time}
                onChange={(e) => setEventData(prev => ({ ...prev, time: e.target.value }))}
              >
                <option value="">Select Time</option>
                {timeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="form-group flex flex-col" style={{ gap: 'var(--space-2)' }}>
          <label htmlFor="eventDescription" style={{ color: 'var(--text-primary)' }}>Description *</label>
          <textarea
            id="eventDescription"
            value={eventData.description}
            onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Short sentence about the workout/event"
            style={{
              border: `1px solid ${!eventData.description.trim() && hasAttemptedSubmit ? 'red' : 'var(--border-color)'}`,
              minHeight: '40px',
              maxHeight: '40px', // This might be tricky with standard textarea, consider fixed height or JS resize
              // padding: 'var(--space-3)', // Covered by global
              // paddingVertical: 'var(--space-2)', // Adjust padding if needed
              // textAlignVertical: 'center', // CSS: display:flex; align-items:center for wrapper or padding
            }}
          />
        </div>

        {/* Additional Details Field */}
        <div className="form-group flex flex-col" style={{ gap: 'var(--space-2)' }}>
          <label htmlFor="eventAdditionalDetails" style={{ color: 'var(--text-primary)' }}>Full Description *</label>
          <textarea
            id="eventAdditionalDetails"
            value={eventData.additionalDetails}
            onChange={(e) => setEventData(prev => ({ ...prev, additionalDetails: e.target.value }))}
            placeholder="Provide a more detailed description..."
            style={{
              border: `1px solid ${!eventData.additionalDetails?.trim() && hasAttemptedSubmit ? 'red' : 'var(--border-color)'}`,
              minHeight: '100px',
            }}
          />
        </div>

        {/* Tags */}
        <div className="form-group flex flex-col" style={{ gap: 'var(--space-2)' }}>
          <label htmlFor="eventTags" style={{ color: 'var(--text-primary)' }}>Tags (Optional)</label>
          <input
            type="text"
            id="eventTags"
            value={eventData.tags}
            onChange={(e) => setEventData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="(core, upper, beginner-friendly)"
          // Basic styling from global input style
          />
        </div>

        {hasAttemptedSubmit &&
          (!eventData.name.trim() || !eventData.date || !eventData.time ||
            !eventData.description.trim() || !eventData.additionalDetails?.trim()) && (
            <p style={{ color: 'red', textAlign: 'center' }}>
              Please fill out all required fields
            </p>
          )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          style={{
            backgroundColor: 'var(--card-background)',
            color: 'var(--text-primary)',
            marginTop: 'var(--space-4)',
            padding: 'var(--space-3)', // Ensure button class provides this
          }}
        >
          Post
        </button>
      </div>

      {/* History Panel */}
      <div
        className="history-panel flex flex-col"
        style={{
          width: isDesktop ? '400px' : '100%',
          maxWidth: '500px',
          backgroundColor: 'var(--background)',
          borderRadius: 'var(--border-radius-medium)',
          border: '1px solid var(--border-color)',
          position: isDesktop ? 'absolute' : 'relative',
          right: isDesktop ? 'var(--space-4)' : undefined,
          top: isDesktop ? 'var(--space-4)' : undefined,
          marginTop: isDesktop ? undefined : 'var(--space-4)',
        }}
      >
        <h2
          style={{
            fontSize: 'var(--font-size-6)',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            padding: 'var(--space-4)',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          Schedule Management
        </h2>
        <div
          className="scroll-view"
          style={{
            height: isDesktop ? '600px' : '400px',
            overflowY: 'auto',
            padding: 'var(--space-4)',
          }}
        >
          <div className="flex flex-col" style={{ gap: 'var(--space-4)' }}>
            {/* Today's Events Section */}
            <section className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <h3 style={{ fontSize: 'var(--font-size-5)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                Today
              </h3>
              {eventHistory
                .filter(event => isEventToday(event.date))
                .map((event) => (
                  <article
                    key={event.id}
                    className="event-card flex flex-col"
                    style={{
                      backgroundColor: 'var(--card-background)',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--border-radius-soft)',
                      border: '1px solid var(--border-color)',
                      gap: 'var(--space-1)',
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div style={{ flex: 1, gap: 'var(--space-1)' }} className="flex flex-col">
                        <p style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                          {event.type}: {event.name}
                        </p>
                        <p style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-3)' }}>
                          {formatEventDate(event.date)} at {event.time}
                        </p>
                        <p style={{ fontSize: 'var(--font-size-3)', color: 'var(--text-primary)', opacity: 0.7 }}>
                          Created: {event.createdAt.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex" style={{ gap: 'var(--space-2)' }}>
                        <button
                          style={{ padding: 'var(--space-2)', backgroundColor: 'transparent', fontSize: 'var(--font-size-3)', color: 'var(--text-primary)' }}
                          onClick={() => handleCopyEvent(event)}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--gray4)'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          Copy
                        </button>
                        <button
                          style={{ padding: 'var(--space-2)', backgroundColor: 'var(--blue8)', fontSize: 'var(--font-size-3)', color: 'white' }}
                          onClick={() => setRsvpEventId(event.id)}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--blue7)'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--blue8)'}
                        >
                          RSVPs
                        </button>
                        <button
                          style={{ padding: 'var(--space-2)', backgroundColor: 'var(--gray8)', fontSize: 'var(--font-size-3)', color: 'white' }}
                          onClick={() => setSelectedEventId(event.id)}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--gray7)'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--gray8)'}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              {!eventHistory.some(event => isEventToday(event.date)) && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-3)' }}>
                  Nothing scheduled for today
                </p>
              )}
            </section>

            {/* Upcoming Events Section (similar structure to Today) */}
            <section className="flex flex-col" style={{ gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--font-size-5)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                Upcoming
              </h3>
              {eventHistory
                .filter(event => !isEventPast(event.date) && !isEventToday(event.date))
                .map((event) => (
                  <article
                    key={event.id}
                    className="event-card flex flex-col"
                    style={{
                      backgroundColor: 'var(--card-background)',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--border-radius-soft)',
                      border: '1px solid var(--border-color)',
                      gap: 'var(--space-1)',
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div style={{ flex: 1, gap: 'var(--space-1)' }} className="flex flex-col">
                        <p style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                          {event.type}: {event.name}
                        </p>
                        <p style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-3)' }}>
                          {formatEventDate(event.date)} at {event.time}
                        </p>
                        <p style={{ fontSize: 'var(--font-size-3)', color: 'var(--text-primary)', opacity: 0.7 }}>
                          Created: {event.createdAt.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex" style={{ gap: 'var(--space-2)' }}>
                        <button
                          style={{ padding: 'var(--space-2)', backgroundColor: 'transparent', fontSize: 'var(--font-size-3)', color: 'var(--text-primary)' }}
                          onClick={() => handleCopyEvent(event)}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--gray4)'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          Copy
                        </button>
                        <button
                          style={{ padding: 'var(--space-2)', backgroundColor: 'var(--blue8)', fontSize: 'var(--font-size-3)', color: 'white' }}
                          onClick={() => setRsvpEventId(event.id)}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--blue7)'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--blue8)'}
                        >
                          RSVPs
                        </button>
                        <button
                          style={{ padding: 'var(--space-2)', backgroundColor: 'var(--gray8)', fontSize: 'var(--font-size-3)', color: 'white' }}
                          onClick={() => setSelectedEventId(event.id)}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--gray7)'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--gray8)'}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              {!eventHistory.some(event => !isEventPast(event.date) && !isEventToday(event.date)) && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-3)' }}>
                  Nothing scheduled for the future
                </p>
              )}
            </section>

            {/* Past Events Section (similar structure to Today) */}
            <section className="flex flex-col" style={{ gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--font-size-5)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                Past
              </h3>
              {eventHistory
                .filter(event => isEventPast(event.date))
                .map((event) => (
                  <article
                    key={event.id}
                    className="event-card flex flex-col"
                    style={{
                      backgroundColor: 'var(--card-background)',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--border-radius-soft)',
                      border: '1px solid var(--border-color)',
                      gap: 'var(--space-1)',
                      opacity: 0.7,  // Dim past events
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div style={{ flex: 1, gap: 'var(--space-1)' }} className="flex flex-col">
                        <p style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                          {event.type}: {event.name}
                        </p>
                        <p style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-3)' }}>
                          {formatEventDate(event.date)} at {event.time}
                        </p>
                        <p style={{ fontSize: 'var(--font-size-3)', color: 'var(--text-primary)', opacity: 0.7 }}>
                          Created: {event.createdAt.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex" style={{ gap: 'var(--space-2)' }}>
                        <button
                          style={{ padding: 'var(--space-2)', backgroundColor: 'transparent', fontSize: 'var(--font-size-3)', color: 'var(--text-primary)' }}
                          onClick={() => handleCopyEvent(event)}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--gray4)'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          Copy
                        </button>
                        <button
                          style={{ padding: 'var(--space-2)', backgroundColor: 'var(--blue8)', fontSize: 'var(--font-size-3)', color: 'white' }}
                          onClick={() => setRsvpEventId(event.id)}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--blue7)'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--blue8)'}
                        >
                          RSVPs
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
            </section>
          </div>
        </div>
      </div>

      {/* Popups - Assuming these are refactored to use HTML/CSS modals */}
      {selectedEventId && (
        <EventEditPopup
          event={eventHistory.find(e => e.id === selectedEventId)!}
          onClose={() => setSelectedEventId(null)}
          onDelete={handleDelete}
        />
      )}

      {rsvpEventId && (
        <RSVPListPopup
          event={eventHistory.find(e => e.id === rsvpEventId)!}
          onClose={() => setRsvpEventId(null)}
        />
      )}
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { Event } from '../types/Event'

interface EventDetailsPopupProps {
  event: Event
  onClose: () => void
  userEmail?: string
  onRSVP: () => void
  isRSVPd?: boolean
}

const formatEventDate = (dateStr: string) => {
  const date = new Date(`${dateStr}T00:00:00-08:00`)
  return date.toLocaleDateString()
}

export const EventDetailsPopup = ({ event, onClose, onRSVP, isRSVPd }: EventDetailsPopupProps) => {
  const [attendeeCount, setAttendeeCount] = useState(event.attendees?.length || 0)

  useEffect(() => {
    const fetchAttendeeCount = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', event.id))
        const eventData = eventDoc.data()
        const attendees = eventData?.attendees || []
        setAttendeeCount(attendees.length)
      } catch (error) {
        console.error('Error fetching attendees:', error)
      }
    }

    fetchAttendeeCount()
  }, [event.id, event.attendees]) // Add event.attendees to dependency array to refetch if it changes externally

  return (
    <div className="modal-overlay" onClick={onClose}> {/* Use modal-overlay from index.css */}
      <div className="modal-content flex flex-col" style={{ gap: 'var(--space-4)' }} onClick={(e) => e.stopPropagation()}> {/* Use modal-content */}
        {/* Header with close button */}
        <header className="flex justify-between items-center">
          <h2 style={{ fontSize: 'var(--font-size-6)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {event.name}
          </h2>
          <button
            className="button" // Basic button styling
            style={{ backgroundColor: 'transparent', borderRadius: 'var(--border-radius-round)', padding: 'var(--space-1)' }}
            onClick={onClose}
          >
            {/* Replace X icon */}
            ❌
          </button>
        </header>

        {/* Event details */}
        <section className="flex flex-col" style={{ gap: 'var(--space-4)' }}>
          {event.type !== 'Event' && (
            <div className="creator-info flex items-center" style={{ gap: 'var(--space-2)' }}>
              {event.creatorProfilePicture && (
                <div
                  className="profile-image-container"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '20px', // 50% of width/height
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={event.creatorProfilePicture}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    alt="Creator's profile"
                  />
                </div>
              )}
              <div className="flex flex-col">
                <p style={{ fontSize: 'var(--font-size-3)', color: 'var(--text-secondary)' }}>
                  Posted by {event.creatorName || 'Anonymous'}
                </p>
                <p style={{ fontSize: 'var(--font-size-4)', color: 'var(--text-primary)' }}> {/* Use text-primary */}
                  {formatEventDate(event.date)} at {event.time}
                </p>
              </div>
            </div>
          )}

          {event.type === 'Event' && (
            <p style={{ fontSize: 'var(--font-size-4)', color: 'var(--text-primary)' }}> {/* Use text-primary */}
              {formatEventDate(event.date)} at {event.time}
            </p>
          )}

          <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {event.additionalDetails || event.description}
          </p>

          {event.tags && (
            <p style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-3)', opacity: 0.7 }}> {/* Use text-primary */}
              Tags: {event.tags}
            </p>
          )}

          {/* RSVP section */}
          <div className="rsvp-section flex flex-col" style={{ gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <button
              className="button" // Basic button styling
              style={{
                backgroundColor: isRSVPd ? 'var(--red8)' : 'var(--blue8)',
                color: 'white',
                width: '100%' // Make button full width
              }}
              onClick={onRSVP}
              disabled={isRSVPd ? false : (event.maxRSVPs != null ? attendeeCount >= event.maxRSVPs : false)}
            >
              {isRSVPd ? 'Cancel RSVP' : 'RSVP'}
            </button>

            {event.maxRSVPs != null && ( // Check for null or undefined explicitly
              <p style={{ fontSize: 'var(--font-size-3)', color: 'var(--text-secondary)', textAlign: 'center' }}>
                {`${event.maxRSVPs - attendeeCount} spots remaining`}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
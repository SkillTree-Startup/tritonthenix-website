import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Event } from '../types/Event';

interface RSVPListPopupProps {
  event: Event
  onClose: () => void
}

interface UserInfo {
  email: string;
  name?: string;
}

export const RSVPListPopup = ({ event, onClose }: RSVPListPopupProps) => {
  const [attendees, setAttendees] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxRSVPs, setMaxRSVPs] = useState(event.maxRSVPs || 0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingLimit, setEditingLimit] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailContent, setEmailContent] = useState('');

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        setIsLoading(true)
        const attendeePromises = (event.attendees || []).map(async (email: string) => {
          const userDoc = await getDoc(doc(db, 'users', email))
          const userData = userDoc.data()
          return {
            email,
            name: userData?.name || email
          }
        })

        const attendeeInfo = await Promise.all(attendeePromises)
        setAttendees(attendeeInfo)
      } catch (error) {
        console.error('Error fetching attendees:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (event.attendees?.length) {
      fetchAttendees()
    } else {
      setIsLoading(false); // No attendees to load
    }
  }, [event.attendees])

  const handleUpdateMaxRSVPs = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'events', event.id), {
        maxRSVPs: parseInt(maxRSVPs.toString()) || 0
      });

      event.maxRSVPs = parseInt(maxRSVPs.toString()) || 0;
      setEditingLimit(false);
    } catch (error) {
      console.error('Error updating max RSVPs:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendEmail = () => {
    console.log('Email would be sent with the following details:');
    console.log('To:', attendees.map(a => a.email).join(', '));
    console.log('Event:', event.name);
    console.log('Message:', emailContent);

    setShowEmailDialog(false);
    setEmailContent('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content flex flex-col" style={{ gap: 'var(--space-4)' }} onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center">
          <h2 style={{ fontSize: 'var(--font-size-6)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            RSVPs ({attendees.length})
          </h2>
          <div className="flex" style={{ gap: 'var(--space-2)' }}>
            {attendees.length > 0 && (
              <button
                className="button" // Basic button styling
                style={{ backgroundColor: 'var(--blue8)', color: 'white' }}
                onClick={() => setShowEmailDialog(true)}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--blue7)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--blue8)'}
              >
                📧 Mail
              </button>
            )}
            <button
              className="button"
              style={{ backgroundColor: 'transparent', borderRadius: 'var(--border-radius-round)', padding: 'var(--space-1)' }}
              onClick={onClose}
            >
              ❌
            </button>
          </div>
        </header>

        <section className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
          <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-3)', fontWeight: 'bold' }}>RSVP Limit:</p>
            {editingLimit ? (
              <div className="flex" style={{ flex: 1, gap: 'var(--space-2)' }}>
                <input
                  type="number"
                  style={{ flex: 1 }} // Uses global input styles
                  value={maxRSVPs.toString()}
                  onChange={(e) => setMaxRSVPs(parseInt(e.target.value) || 0)}
                  placeholder="Enter max RSVPs"
                />
                <button
                  className="button"
                  style={{ backgroundColor: 'var(--blue8)', color: 'white', padding: 'var(--space-2)' }}
                  onClick={handleUpdateMaxRSVPs}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <div className="flex items-center" style={{ flex: 1, gap: 'var(--space-2)' }}>
                <p style={{ color: 'var(--text-primary)' }}>
                  {maxRSVPs ? `${maxRSVPs} spots` : 'Unlimited spots'}
                </p>
                <button
                  className="button"
                  style={{ backgroundColor: 'var(--blue2)', padding: 'var(--space-2)', borderRadius: 'var(--border-radius-medium)' }}
                  onClick={() => setEditingLimit(true)}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--blue3)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--blue2)'}
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
        </section>

        {isLoading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading attendees...</p>
        ) : attendees.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No RSVPs yet</p>
        ) : (
          <div className="scroll-view" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
              {attendees.map((attendee) => (
                <div
                  key={attendee.email}
                  className="attendee-item flex" // Use flex for layout
                  style={{
                    backgroundColor: 'var(--gray8)', // Example hover/item background
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--border-radius-soft)',
                    gap: 'var(--space-2)',
                  }}
                >
                  <p style={{ flex: 1, color: 'var(--text-primary)' }}>
                    {attendee.name || attendee.email}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-2)' }}>
                    {attendee.email}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showEmailDialog && (
        <div className="modal-overlay" onClick={() => setShowEmailDialog(false)}>
          <div className="modal-content flex flex-col" style={{ gap: 'var(--space-4)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 'var(--font-size-5)', color: 'var(--text-primary)' }}>
              Message Attendees
            </h3>
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Type your message here..."
              style={{ minHeight: '150px' }} // Uses global textarea styles
            />
            <div className="flex justify-end" style={{ gap: 'var(--space-3)' }}>
              <button
                className="button"
                style={{ backgroundColor: 'transparent', color: 'var(--text-primary)' }}
                onClick={() => {
                  setShowEmailDialog(false);
                  setEmailContent('');
                }}
              >
                Cancel
              </button>
              <button
                className="button"
                style={{ backgroundColor: 'var(--blue8)', color: 'white' }}
                onClick={handleSendEmail}
                disabled={!emailContent.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
import React, { useState, useEffect } from 'react'; // Import React
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { EventDetailsPopup } from './EventDetailsPopup'

// Add the default profile image constant
const DEFAULT_PROFILE_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNEMUQxRDEiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4NSIgcj0iMzUiIGZpbGw9IiM5NDk0OTQiLz4KICA8cGF0aCBkPSJNMTAwIDE0MEMxMzYuMDQ0IDE0MCAxNjUgMTY4Ljk1NiAxNjUgMjA1SDE2NUgzNUgzNUMzNSAxNjguOTU2IDYzLjk1NiAxNDAgMTAwIDE0MFoiIGZpbGw9IiM9NDk0OTQiLz4KPC9zdmc+Cg=='

interface Event {
  id: string;
  name: string;
  type: 'Workout' | 'Event';
  date: string;
  time: string;
  description: string;
  instructor: string;
  location: string;
  subLocation: string;
  createdAt: Date;
  tags?: string;
  creatorEmail: string;
  creatorName?: string;
  creatorProfilePicture?: string;
  maxRSVPs?: number;
  attendees?: string[];
}

interface ScheduleProps {
  defaultTab?: 'Workouts' | 'Events';
}

// Helper function to generate week dates
const generateWeekDates = (selectedDate: Date) => {
  const dates = [];
  const startDate = new Date(selectedDate);
  startDate.setDate(startDate.getDate() - 3); // Start 3 days before

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  return dates;
};

// Add this helper function at the top of the file
const formatTime = (timeStr: string) => {
  try {
    // Parse the time string (assuming it's in 24hr format like "14:00")
    const [hours, minutes] = timeStr.split(':').map(Number)

    // Convert to 12hr format
    const period = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12 // Convert 0 to 12 for midnight

    // Return formatted time
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
  } catch {
    return timeStr // Return original string if parsing fails
  }
}

const Schedule = ({ defaultTab = 'Workouts', userEmail }: ScheduleProps & { userEmail?: string }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'Workouts' | 'Events'>(defaultTab);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState(generateWeekDates(new Date()));
  const [attendeeCounts, setAttendeeCounts] = useState<{ [key: string]: number }>({});
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Update activeTab when URL changes
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('events')) {
      setActiveTab('Events');
    } else if (path.includes('workouts')) {
      setActiveTab('Workouts');
    }
  }, [location.pathname]);

  // Update the handleTabChange function
  const handleTabChange = (tab: 'Workouts' | 'Events') => {
    setActiveTab(tab);
    navigate(tab === 'Events' ? '/schedule/events' : '/schedule/workouts');
  };

  // Update week dates when selected date changes
  useEffect(() => {
    setWeekDates(generateWeekDates(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    // Query events from Firebase
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsList: Event[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        eventsList.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate()
        } as Event);
      });
      setEvents(eventsList);
    });

    return () => unsubscribe();
  }, []);

  // Fetch attendee counts when events change
  useEffect(() => {
    const fetchAttendeeCounts = async () => {
      const counts: { [key: string]: number } = {}

      // Combine all events
      const allEvents = [...events]

      // Fetch counts for each event
      for (const event of allEvents) {
        try {
          const eventDoc = await getDoc(doc(db, 'events', event.id))
          const eventData = eventDoc.data()
          counts[event.id] = eventData?.attendees?.length || 0
        } catch (error) {
          console.error('Error fetching attendees for event:', event.id, error)
          counts[event.id] = 0
        }
      }

      setAttendeeCounts(counts)
    }

    fetchAttendeeCounts()
  }, [events])

  // Filter events based on active tab and date
  const now = new Date();
  const today = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  today.setHours(0, 0, 0, 0); // Set to start of day

  const filteredEvents = events.filter(event => {
    const isCorrectType = activeTab === 'Events' ?
      event.type === 'Event' :
      event.type === 'Workout';

    if (activeTab === 'Events') {
      return isCorrectType;
    } else {
      // For workouts, convert both dates to Pacific Time for comparison
      const eventDate = new Date(`${event.date}T00:00:00-08:00`);
      const selectedPacificDate = new Date(selectedDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
      return isCorrectType &&
        eventDate.toDateString() === selectedPacificDate.toDateString();
    }
  });

  const upcomingEvents = filteredEvents.filter(event => {
    const eventDate = new Date(`${event.date}T${event.time}-08:00`);
    const nowPacific = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    return eventDate >= nowPacific;
  });

  const pastEvents = filteredEvents.filter(event => {
    const eventDate = new Date(`${event.date}T${event.time}-08:00`);
    const nowPacific = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    return eventDate < nowPacific;
  });

  const formatDate = (date: Date) => {
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      weekday: date.toLocaleString('default', { weekday: 'short' })
    };
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleRSVP = async (event: Event) => {
    // Check if user is logged in
    if (!userEmail) {
      // Redirect to profile page
      navigate('/profile');
      return;
    }

    try {
      const eventRef = doc(db, 'events', event.id);
      const currentAttendees = event.attendees || [];
      const isCurrentlyRSVPd = currentAttendees.includes(userEmail);

      // Check if event is full when trying to RSVP
      if (!isCurrentlyRSVPd && event.maxRSVPs && currentAttendees.length >= event.maxRSVPs) {
        console.error('Event is full');
        return;
      }

      const updatedAttendees = isCurrentlyRSVPd
        ? currentAttendees.filter((email: string) => email !== userEmail)
        : [...currentAttendees, userEmail];

      await updateDoc(eventRef, {
        attendees: updatedAttendees
      });

      // Update selected event
      if (selectedEvent?.id === event.id) {
        setSelectedEvent({
          ...selectedEvent,
          attendees: updatedAttendees
        });
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
    }
  };

  return (
    <div className="schedule-container flex flex-col items-center" style={{ padding: 'var(--space-4)', width: '100%', gap: 'var(--space-4)' }}>
      <div className="schedule-content flex flex-col" style={{ gap: 'var(--space-4)', maxWidth: '800px', width: '100%' }}>
        <h1 style={{ fontSize: 'var(--font-size-8)', fontWeight: 'bold', color: 'var(--text-primary)' }}>Schedule</h1>

        {/* Tabs */}
        <div className="tabs-container flex" style={{ backgroundColor: 'var(--card-background)', borderRadius: 'var(--border-radius-medium)', overflow: 'hidden' }}>
          <button
            className="tab-button"
            style={{
              flex: 1,
              backgroundColor: activeTab === 'Workouts' ? 'var(--background)' : 'transparent',
              color: 'var(--text-primary)',
              padding: 'var(--space-3)'
            }}
            onClick={() => handleTabChange('Workouts')}
          >
            Workouts
          </button>
          <button
            className="tab-button"
            style={{
              flex: 1,
              backgroundColor: activeTab === 'Events' ? 'var(--background)' : 'transparent',
              color: 'var(--text-primary)',
              padding: 'var(--space-3)'
            }}
            onClick={() => handleTabChange('Events')}
          >
            Events
          </button>
        </div>

        {/* Date Selector - Only show for Workouts */}
        {activeTab === 'Workouts' && (
          <div
            className="date-selector flex items-center"
            style={{
              backgroundColor: 'var(--card-background)',
              borderRadius: 'var(--border-radius-medium)',
              padding: 'var(--space-2)',
              gap: 'var(--space-2)',
            }}
          >
            <button
              className="nav-button"
              style={{ padding: 'var(--space-2)', backgroundColor: 'transparent', color: 'var(--text-primary)' }}
              onClick={() => navigateWeek('prev')}
            >
              ←
            </button>
            {weekDates.map((date) => {
              const formattedDate = formatDate(date);
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateSelect(date)}
                  className="date-button"
                  style={{
                    backgroundColor: isSelected ? 'var(--text-primary)' : 'transparent', // Use text-primary for selected background
                    color: isSelected ? 'var(--background)' : 'var(--text-primary)', // Text color contrast
                    borderRadius: 'var(--border-radius-medium)',
                    padding: 'var(--space-2)',
                    flex: 1,
                    border: isToday && !isSelected ? `1px solid var(--text-primary)` : '1px solid transparent',
                  }}
                >
                  <div className="flex flex-col items-center" style={{ gap: 'var(--space-1)' }}>
                    <span style={{ fontSize: 'var(--font-size-2)' }}>
                      {formattedDate.weekday}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-4)', fontWeight: 'bold' }}>
                      {formattedDate.day}
                    </span>
                    {isToday && (
                      <span style={{ fontSize: 'var(--font-size-2)' }}>
                        Today
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
            <button
              className="nav-button"
              style={{ padding: 'var(--space-2)', backgroundColor: 'transparent', color: 'var(--text-primary)' }}
              onClick={() => navigateWeek('next')}
            >
              →
            </button>
          </div>
        )}

        {/* Events List */}
        <div className="events-scroll-view" style={{ height: '600px', width: '100%', overflowY: 'auto' }}>
          <div className="flex flex-col" style={{ gap: 'var(--space-8)' }}>
            {activeTab === 'Events' ? (
              <>
                {/* Upcoming Events */}
                <section className="flex flex-col" style={{ gap: 'var(--space-8)' }}>
                  <h2 style={{ fontSize: 'var(--font-size-6)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    Upcoming Events
                  </h2>
                  {upcomingEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      userEmail={userEmail}
                      isRSVPd={event.attendees?.includes(userEmail || '')}
                      attendeeCount={attendeeCounts[event.id] || 0}
                      onRSVP={() => handleRSVP(event)}
                      onViewDetails={() => handleViewDetails(event)}
                    />
                  ))}
                  {upcomingEvents.length === 0 && (
                    <p style={{ color: 'var(--text-primary)', textAlign: 'center' }}>
                      No upcoming events scheduled
                    </p>
                  )}
                </section>

                {/* Past Events */}
                <section className="flex flex-col" style={{ gap: 'var(--space-8)', marginTop: 'var(--space-8)' }}>
                  <h2 style={{ fontSize: 'var(--font-size-6)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    Past Events
                  </h2>
                  {pastEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      userEmail={userEmail}
                      isRSVPd={event.attendees?.includes(userEmail || '')}
                      attendeeCount={attendeeCounts[event.id] || 0}
                      onRSVP={() => handleRSVP(event)}
                      onViewDetails={() => handleViewDetails(event)}
                    />
                  ))}
                  {pastEvents.length === 0 && (
                    <p style={{ color: 'var(--text-primary)', textAlign: 'center' }}>
                      No past events
                    </p>
                  )}
                </section>
              </>
            ) : (
              // Workouts View
              <section className="flex flex-col" style={{ gap: 'var(--space-8)' }}>
                {filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    userEmail={userEmail}
                    isRSVPd={event.attendees?.includes(userEmail || '')}
                    attendeeCount={attendeeCounts[event.id] || 0}
                    onRSVP={() => handleRSVP(event)}
                    onViewDetails={() => handleViewDetails(event)}
                  />
                ))}
                {filteredEvents.length === 0 && (
                  <p style={{ color: 'var(--text-primary)', textAlign: 'center' }}>
                    No workouts scheduled for this date
                  </p>
                )}
              </section>
            )}
          </div>
        </div>
      </div>

      {selectedEvent && (
        <EventDetailsPopup
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRSVP={() => handleRSVP(selectedEvent)}
          isRSVPd={selectedEvent.attendees?.includes(userEmail || '') || false}
        />
      )}
    </div>
  );
};

interface EventCardProps {
  event: Event;
  userEmail?: string;
  isRSVPd: boolean | undefined;
  attendeeCount: number;
  onRSVP: () => void;
  onViewDetails: () => void;
}

const EventCard = ({
  event,
  attendeeCount,
  onViewDetails
}: EventCardProps) => {
  // Remove unused functions and variables
  const getSpotsText = () => {
    if (event.maxRSVPs) {
      const spots = event.maxRSVPs - attendeeCount
      return `${spots} ${spots === 1 ? 'spot' : 'spots'} left`
    }
    return null
  }

  // Add helper to get first name
  const getFirstName = (fullName?: string) => {
    if (!fullName) return 'Anonymous';
    return fullName.split(' ')[0];
  };

  const formatEventDateDisplay = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00-08:00`);
    return {
      month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
      day: date.getDate()
    };
  };

  return (
    <article
      className="event-card flex flex-col"
      style={{
        backgroundColor: 'var(--card-background)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--border-radius-medium)',
        border: '1px solid var(--border-color)',
        gap: 'var(--space-2)',
      }}
    >
      <div className="flex"> {/* Replaces XStack */}
        {/* Date display for events */}
        {event.type === 'Event' && (
          <div
            className="date-display flex flex-col items-center justify-center"
            style={{
              width: '50px',
              marginRight: 'var(--space-4)',
              padding: 'var(--space-2)',
            }}
          >
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-3)',
                fontWeight: '500',
              }}
            >
              {formatEventDateDisplay(event.date).month}
            </p>
            <p
              style={{
                color: 'var(--text-primary)',
                fontSize: 'var(--font-size-6)',
                fontWeight: 'bold',
              }}
            >
              {formatEventDateDisplay(event.date).day}
            </p>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-3)',
                marginTop: 'var(--space-1)',
              }}
            >
              {formatTime(event.time)}
            </p>
          </div>
        )}

        {/* Left side content */}
        <div className="event-info flex flex-col" style={{ flex: 1, gap: 'var(--space-2)' }}>
          {event.type === 'Workout' ? (
            <div className="creator-info flex items-center" style={{ gap: 'var(--space-2)' }}>
              <div
                className="profile-picture-container"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <img
                  src={event.creatorProfilePicture || DEFAULT_PROFILE_IMAGE}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  alt={`${getFirstName(event.creatorName)}'s profile picture`}
                />
              </div>

              <div className="flex flex-col">
                <p style={{ fontSize: 'var(--font-size-3)', color: 'var(--text-secondary)' }}>
                  {getFirstName(event.creatorName)}
                </p>
                <p style={{ fontWeight: 'bold', fontSize: 'var(--font-size-5)', color: 'var(--text-primary)' }}>
                  {event.name}
                </p>
              </div>
            </div>
          ) : (
            <p style={{ fontWeight: 'bold', fontSize: 'var(--font-size-5)', color: 'var(--text-primary)' }}>
              {event.name}
            </p>
          )}

          <div className="event-meta flex items-center" style={{ gap: event.type === 'Event' ? 'var(--space-2)' : '0' }}>
            {event.type === 'Workout' && (
              <p style={{ color: 'var(--text-primary)', marginLeft: event.type === 'Workout' ? '0' : undefined }}>
                {formatTime(event.time)}
              </p>
            )}
            <p style={{ color: 'var(--text-primary)', marginLeft: 'var(--space-2' }}>
              {event.instructor}
            </p>
          </div>

          {event.subLocation && (
            <p style={{ color: 'var(--text-primary)', opacity: 0.8 }}>
              {event.subLocation}
            </p>
          )}

          <p style={{ color: 'var(--text-secondary)' }}>
            {event.description}
          </p>
        </div>

        {/* Right side content */}
        <div className="actions flex flex-col justify-center" style={{ marginLeft: 'var(--space-4)' }}>
          <button
            className="details-button"
            onClick={() => onViewDetails()}
            style={{
              backgroundColor: 'var(--gray8)',
              minHeight: '36px',
              width: '100px',
              padding: '0 var(--space-3)',
              color: 'white',
              // hoverStyle handled by global button:hover or specific class
            }}
          >
            Details
          </button>

          {event.maxRSVPs && (
            <p
              style={{
                fontSize: 'var(--font-size-3)',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                marginTop: 'var(--space-1)',
                width: '100px',
              }}
            >
              {getSpotsText()}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

export default Schedule;
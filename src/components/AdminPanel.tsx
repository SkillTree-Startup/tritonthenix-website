import { YStack, Text, Input, Button, XStack, TextArea, Select, ScrollView } from 'tamagui'
import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react'
import { db } from '../firebase'
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, getDoc } from 'firebase/firestore'
import { RSVPListPopup } from './RSVPListPopup'
import { EventEditPopup } from './EventEditPopup'
import { Event, EventWithTimestamp } from '../types/Event'
import { debounce } from 'lodash'
import { EventForm } from './EventForm'

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

// First, move these helper functions before they're used
const isEventPast = (eventDate: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(`${eventDate}T00:00:00-08:00`)
  return date < today
}

const isEventToday = (eventDate: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const date = new Date(`${eventDate}T00:00:00-08:00`)
  return date >= today && date < tomorrow
}

// Move timeOptions and dateOptions declarations before they're used
const timeOptions = generateTimeOptions()
const dateOptions = generateDateOptions()

// Create memoized components for expensive parts
const EventCard = memo(({ 
  event, 
  onCopy, 
  onRSVP,
  onEdit,
  showEdit = true
}: { 
  event: EventWithTimestamp
  onCopy: (event: EventWithTimestamp) => void
  onRSVP: (id: string) => void
  onEdit?: (id: string) => void
  showEdit?: boolean
}) => (
  <YStack 
    backgroundColor="$cardBackground"
    padding="$3"
    borderRadius="$2"
    borderWidth={1}
    borderColor="$borderColor"
    space="$1"
  >
    <XStack justifyContent="space-between" alignItems="flex-start">
      <YStack flex={1} space="$1">
        <Text fontWeight="bold" color="$textPrimary">
          {event.type}: {event.name}
        </Text>
        <Text color="$textPrimary" fontSize="$3">
          {formatEventDate(event.date)} at {event.time}
        </Text>
        <Text fontSize="$3" color="$textPrimary" opacity={0.7}>
          Created: {event.createdAt.toLocaleString()}
        </Text>
      </YStack>

      <XStack space="$2">
        <Button
          size="$2"
          padding="$2"
          backgroundColor="transparent"
          onPress={() => onCopy(event)}
          hoverStyle={{ backgroundColor: '$gray4' }}
        >
          <Text color="$textPrimary" fontSize="$3">Copy</Text>
        </Button>
        <Button
          size="$2"
          backgroundColor="$red8"
          padding="$2"
          onPress={() => onRSVP(event.id)}
          hoverStyle={{ backgroundColor: '$red7' }}
        >
          <Text color="white" fontSize="$3">Delete</Text>
        </Button>
      </XStack>
    </XStack>
  </YStack>
))

const EventSection = memo(({ 
  title, 
  events, 
  onCopy, 
  onRSVP, 
  onEdit, 
  showEdit = true 
}: {
  title: string
  events: EventWithTimestamp[]
  onCopy: (event: EventWithTimestamp) => void
  onRSVP: (id: string) => void
  onEdit?: (id: string) => void
  showEdit?: boolean
}) => (
  <YStack space="$2" marginTop="$4">
    <Text fontSize="$5" fontWeight="bold" color="$textPrimary">
      {title}
    </Text>
    {events.length > 0 ? (
      events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onCopy={onCopy}
          onRSVP={onRSVP}
          onEdit={onEdit}
          showEdit={showEdit}
        />
      ))
    ) : (
      <Text color="$textSecondary" fontSize="$3">
        No events scheduled
      </Text>
    )}
  </YStack>
))

export const AdminPanel = ({ userEmail = '' }: AdminPanelProps) => {
  const [eventHistory, setEventHistory] = useState<EventWithTimestamp[]>([])
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [rsvpEventId, setRsvpEventId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedEventData, setCopiedEventData] = useState<Partial<Event> | null>(null)

  // Handle form submission
  const handleSubmit = useCallback(async (formData: Event) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userEmail))
      const userData = userDoc.data()

      const newEvent = {
        ...formData,
        creatorEmail: userEmail,
        creatorName: userData?.name || 'Anonymous',
        creatorProfilePicture: userData?.profilePicture || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        attendees: []
      }

      await addDoc(collection(db, 'events'), newEvent)
      console.log('Event added successfully')

    } catch (error) {
      console.error('Error adding event:', error)
      // Optionally add error handling UI here
    }
  }, [userEmail])

  // Optimize the Firestore listener
  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        const events: EventWithTimestamp[] = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            ...data,
            id: doc.id,
            name: data.name,
            date: data.date,
            time: data.time,
            description: data.description,
            type: data.type || 'Workout',
            tags: data.tags || '',
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt ? 
              (typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : new Date(data.updatedAt)) 
              : new Date(),
            maxRSVPs: data.maxRSVPs,
            attendees: data.attendees || [],
            creatorName: data.creatorName || 'Anonymous',
            creatorProfilePicture: data.creatorProfilePicture || null
          } as EventWithTimestamp
        })
        
        setEventHistory(events)
        setIsLoading(false)
      } catch (error) {
        console.error('Error processing Firestore data:', error)
        setIsLoading(false)
      }
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

  // Add performance monitoring
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      console.log(`Component render time: ${endTime - startTime}ms`)
    }
  })

  // Optimize event filtering with useMemo
  const { todayEvents, upcomingEvents, pastEvents } = useMemo(() => ({
    todayEvents: eventHistory.filter(event => isEventToday(event.date)),
    upcomingEvents: eventHistory.filter(event => !isEventPast(event.date) && !isEventToday(event.date)),
    pastEvents: eventHistory.filter(event => isEventPast(event.date))
  }), [eventHistory])

  // Update handleCopy function to directly set the copied data
  const handleCopy = useCallback((event: EventWithTimestamp) => {
    // Set selected event data
    const eventData = {
      type: event.type,
      name: event.name,
      date: event.date,
      time: event.time,
      description: event.description,
      tags: event.tags || '',
      additionalDetails: event.additionalDetails || ''
    }

    // Set the copied data directly
    setCopiedEventData(eventData)
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Update EventSection usage in HistoryPanel
  const HistoryPanel = useMemo(() => (
    <YStack 
      width={isDesktop ? 400 : "100%"}
      maxWidth={500}
      backgroundColor="$background" 
      borderRadius="$4" 
      borderWidth={1} 
      borderColor="$borderColor"
      {...(isDesktop ? {
        position: "absolute",
        right: "$4",
        top: "$4"
      } : {
        marginTop: "$4"
      })}
    >
      <Text 
        fontSize="$6" 
        fontWeight="bold" 
        color="$textPrimary"
        padding="$4"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        Schedule Management
      </Text>
      <ScrollView height={isDesktop ? 600 : 400} padding="$4">
        <YStack space="$4">
          <EventSection
            title="Today"
            events={todayEvents}
            onCopy={handleCopy}
            onRSVP={async (id) => {
              try {
                if (window.confirm('Are you sure you want to delete this event?')) {
                  await deleteDoc(doc(db, 'events', id))
                  // Clear any selected event IDs to prevent popup rendering
                  setSelectedEventId(null)
                  setRsvpEventId(null)
                }
              } catch (error) {
                console.error('Error deleting event:', error)
              }
            }}
            onEdit={(id) => setSelectedEventId(id)}
          />
          <EventSection
            title="Upcoming"
            events={upcomingEvents}
            onCopy={handleCopy}
            onRSVP={async (id) => {
              try {
                if (window.confirm('Are you sure you want to delete this event?')) {
                  await deleteDoc(doc(db, 'events', id))
                  setSelectedEventId(null)
                  setRsvpEventId(null)
                }
              } catch (error) {
                console.error('Error deleting event:', error)
              }
            }}
            onEdit={(id) => setSelectedEventId(id)}
          />
          <EventSection
            title="Past"
            events={pastEvents}
            onCopy={handleCopy}
            onRSVP={async (id) => {
              try {
                if (window.confirm('Are you sure you want to delete this event?')) {
                  await deleteDoc(doc(db, 'events', id))
                  setSelectedEventId(null)
                  setRsvpEventId(null)
                }
              } catch (error) {
                console.error('Error deleting event:', error)
              }
            }}
            showEdit={false}
          />
        </YStack>
      </ScrollView>
    </YStack>
  ), [isDesktop, todayEvents, upcomingEvents, pastEvents, handleCopy, setRsvpEventId, setSelectedEventId])

  return (
    <YStack padding="$4" space="$4" width="100%" alignItems="center">
      {isLoading ? (
        <Text color="$textPrimary">Loading events...</Text>
      ) : eventHistory.length === 0 ? (
        <Text color="$textPrimary">No events found</Text>
      ) : (
        <YStack space="$4" width="100%" alignItems="center">
          <EventForm 
            onSubmit={handleSubmit} 
            initialData={copiedEventData || {
              type: 'Workout',
              name: '',
              date: '',
              time: '',
              description: '',
              tags: '',
              additionalDetails: ''
            }} 
          />
          {HistoryPanel}
          {selectedEventId && (
            <EventEditPopup
              event={eventHistory.find(e => e.id === selectedEventId)!}
              onClose={() => setSelectedEventId(null)}
              onDelete={async (id: string) => {
                try {
                  await deleteDoc(doc(db, 'events', id))
                  setSelectedEventId(null)
                } catch (error) {
                  console.error('Error deleting event:', error)
                }
              }}
            />
          )}
          {rsvpEventId && (
            <RSVPListPopup
              event={eventHistory.find(e => e.id === rsvpEventId)!}
              onClose={() => setRsvpEventId(null)}
            />
          )}
        </YStack>
      )}
    </YStack>
  )
} 
import { YStack, Text, Input, Button, XStack, TextArea, Select, ScrollView } from 'tamagui'
import { useState, useEffect } from 'react'
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
    <YStack 
      padding="$4" 
      space="$4" 
      width="100%" 
      alignItems="center"
    >
      {/* Form Panel */}
      <YStack space="$4" maxWidth={500} width="100%">
        <Text 
          fontSize="$8" 
          fontWeight="bold" 
          color="$color"
        >
          Admin Panel
        </Text>

        {/* Name Input */}
        <YStack space="$2">
          <Text color="$color">Name *</Text>
          <Input
            value={eventData.name}
            onChangeText={(text) => setEventData(prev => ({ ...prev, name: text }))}
            placeholder={`Enter ${eventData.type.toLowerCase()} name`}
            borderWidth={1}
            borderColor={!eventData.name.trim() && hasAttemptedSubmit ? 'red' : '$borderColor'}
            backgroundColor="white"
            padding="$3"
            color="#4A5568"
            placeholderTextColor="#A0AEC0"
          />
        </YStack>

        {/* Type Toggle */}
        <XStack backgroundColor="$cardBackground" borderRadius="$4" overflow="hidden">
          <Button
            flex={1}
            backgroundColor={eventData.type === 'Workout' ? '$background' : 'transparent'}
            color="$textPrimary"
            onPress={() => setEventData(prev => ({ ...prev, type: 'Workout' }))}
          >
            Workout
          </Button>
          <Button
            flex={1}
            backgroundColor={eventData.type === 'Event' ? '$background' : 'transparent'}
            color="$textPrimary"
            onPress={() => setEventData(prev => ({ ...prev, type: 'Event' }))}
          >
            Event
          </Button>
        </XStack>

        {/* Date/Time Selection */}
        <YStack space="$2">
          <Text color="$color">Date/Time *</Text>
          <XStack space="$4" width="100%">
            {/* Date Input */}
            <YStack flex={1}>
              <Select
                value={eventData.date}
                onValueChange={(value) => setEventData(prev => ({ ...prev, date: value }))}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select Date" />
                </Select.Trigger>
                <Select.Content>
                  <Select.ScrollUpButton />
                  <Select.Viewport>
                    <Select.Group>
                      {dateOptions.map((option, index) => (
                        <Select.Item 
                          key={option.value} 
                          value={option.value}
                          index={index}
                        >
                          <Select.ItemText>{option.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Viewport>
                  <Select.ScrollDownButton />
                </Select.Content>
              </Select>
            </YStack>

            {/* Time Input */}
            <YStack flex={1}>
              <Select
                value={eventData.time}
                onValueChange={(value) => setEventData(prev => ({ ...prev, time: value }))}
              >
                <Select.Trigger>
                  <Select.Value 
                    placeholder="Select Time"
                  />
                </Select.Trigger>
                <Select.Content>
                  <Select.ScrollUpButton />
                  <Select.Viewport>
                    <Select.Group>
                      {timeOptions.map((option, index) => (
                        <Select.Item 
                          key={option.value} 
                          value={option.value}
                          index={index}
                        >
                          <Select.ItemText>{option.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Viewport>
                  <Select.ScrollDownButton />
                </Select.Content>
              </Select>
            </YStack>
          </XStack>
        </YStack>

        {/* Description */}
        <YStack space="$2">
          <Text color="$color">Description *</Text>
          <TextArea
            value={eventData.description}
            onChangeText={(text) => setEventData(prev => ({ ...prev, description: text }))}
            placeholder="Short sentence about the workout/event"
            borderWidth={1}
            borderColor={!eventData.description.trim() && hasAttemptedSubmit ? 'red' : '$borderColor'}
            backgroundColor="white"
            padding="$3"
            paddingVertical="$2"
            color="#4A5568"
            placeholderTextColor="#A0AEC0"
            minHeight={40}
            maxHeight={40}
            textAlignVertical="center"
          />
        </YStack>

        {/* Additional Details Field */}
        <YStack space="$2">
          <Text color="$color">Full Description *</Text>
          <TextArea
            value={eventData.additionalDetails}
            onChangeText={(text) => setEventData(prev => ({ ...prev, additionalDetails: text }))}
            placeholder="Provide a more detailed description of the workout/event along with any additional information"
            borderWidth={1}
            borderColor={!eventData.additionalDetails?.trim() && hasAttemptedSubmit ? 'red' : '$borderColor'}
            backgroundColor="white"
            padding="$3"
            color="#4A5568"
            placeholderTextColor="#A0AEC0"
            minHeight={100}
          />
        </YStack>

        {/* Tags */}
        <YStack space="$2">
          <Text color="$color">Tags (Optional)</Text>
          <Input
            value={eventData.tags}
            onChangeText={(text) => setEventData(prev => ({ ...prev, tags: text }))}
            placeholder="(core, upper, beginner-friendly)"
            borderWidth={1}
            borderColor="$borderColor"
            backgroundColor="white"
            padding="$3"
            color="#4A5568"
            placeholderTextColor="#A0AEC0"
          />
        </YStack>

        {/* Error message only shows if submit was attempted and fields are missing */}
        {hasAttemptedSubmit && 
         (!eventData.name.trim() || !eventData.date || !eventData.time || 
          !eventData.description.trim() || !eventData.additionalDetails?.trim()) && (
          <Text color="red" textAlign="center">
            Please fill out all required fields
          </Text>
        )}

        {/* Submit Button */}
        <Button
          backgroundColor="$cardBackground"
          color="$textPrimary"
          onPress={handleSubmit}
          marginTop="$4"
        >
          <Text>Post</Text>
        </Button>
      </YStack>

      {/* History Panel - Desktop: Absolute position, Mobile: Below form */}
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
        <ScrollView 
          height={isDesktop ? 600 : 400} 
          padding="$4"
        >
          <YStack space="$4">
            {/* Today's Events Section */}
            <YStack space="$2">
              <Text fontSize="$5" fontWeight="bold" color="$textPrimary">
                Today
              </Text>
              {eventHistory
                .filter(event => isEventToday(event.date))
                .map((event) => (
                  <YStack 
                    key={event.id}
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
                          onPress={() => handleCopyEvent(event)}
                          hoverStyle={{ backgroundColor: '$gray4' }}
                        >
                          <Text color="$textPrimary" fontSize="$3">Copy</Text>
                        </Button>
                        <Button
                          size="$2"
                          backgroundColor="$blue8"
                          padding="$2"
                          onPress={() => setRsvpEventId(event.id)}
                          hoverStyle={{ backgroundColor: '$blue7' }}
                        >
                          <Text color="white" fontSize="$3">RSVPs</Text>
                        </Button>
                        <Button
                          size="$2"
                          backgroundColor="$gray8"
                          padding="$2"
                          onPress={() => setSelectedEventId(event.id)}
                          hoverStyle={{ backgroundColor: '$gray7' }}
                        >
                          <Text color="white" fontSize="$3">Edit</Text>
                        </Button>
                      </XStack>
                    </XStack>
                  </YStack>
                ))}
              {!eventHistory.some(event => isEventToday(event.date)) && (
                <Text color="$textSecondary" fontSize="$3">
                  Nothing scheduled for today
                </Text>
              )}
            </YStack>

            {/* Upcoming Events Section */}
            <YStack space="$2" marginTop="$4">
              <Text fontSize="$5" fontWeight="bold" color="$textPrimary">
                Upcoming
              </Text>
              {eventHistory
                .filter(event => !isEventPast(event.date) && !isEventToday(event.date))
                .map((event) => (
                  <YStack 
                    key={event.id}
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
                          onPress={() => handleCopyEvent(event)}
                          hoverStyle={{ backgroundColor: '$gray4' }}
                        >
                          <Text color="$textPrimary" fontSize="$3">Copy</Text>
                        </Button>
                        <Button
                          size="$2"
                          backgroundColor="$blue8"
                          padding="$2"
                          onPress={() => setRsvpEventId(event.id)}
                          hoverStyle={{ backgroundColor: '$blue7' }}
                        >
                          <Text color="white" fontSize="$3">RSVPs</Text>
                        </Button>
                        <Button
                          size="$2"
                          backgroundColor="$gray8"
                          padding="$2"
                          onPress={() => setSelectedEventId(event.id)}
                          hoverStyle={{ backgroundColor: '$gray7' }}
                        >
                          <Text color="white" fontSize="$3">Edit</Text>
                        </Button>
                      </XStack>
                    </XStack>
                  </YStack>
                ))}
              {!eventHistory.some(event => !isEventPast(event.date) && !isEventToday(event.date)) && (
                <Text color="$textSecondary" fontSize="$3">
                  Nothing scheduled for the future
                </Text>
              )}
            </YStack>

            {/* Past Events Section */}
            <YStack space="$2" marginTop="$4">
              <Text fontSize="$5" fontWeight="bold" color="$textPrimary">
                Past
              </Text>
              {eventHistory
                .filter(event => isEventPast(event.date))
                .map((event) => (
                  <YStack 
                    key={event.id}
                    backgroundColor="$cardBackground"
                    padding="$3"
                    borderRadius="$2"
                    borderWidth={1}
                    borderColor="$borderColor"
                    space="$1"
                    opacity={0.7}  // Dim past events
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
                          onPress={() => handleCopyEvent(event)}
                          hoverStyle={{ backgroundColor: '$gray4' }}
                        >
                          <Text color="$textPrimary" fontSize="$3">Copy</Text>
                        </Button>
                        <Button
                          size="$2"
                          backgroundColor="$blue8"
                          padding="$2"
                          onPress={() => setRsvpEventId(event.id)}
                          hoverStyle={{ backgroundColor: '$blue7' }}
                        >
                          <Text color="white" fontSize="$3">RSVPs</Text>
                        </Button>
                      </XStack>
                    </XStack>
                  </YStack>
                ))}
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>

      {/* Update the popup */}
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
    </YStack>
  )
} 
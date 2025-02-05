import { YStack, Text, Input, Button, XStack, TextArea, Select, ScrollView } from 'tamagui'
import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, getDoc } from 'firebase/firestore'
import { RSVPListPopup } from './RSVPListPopup'

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

interface EventData {
  name: string
  type: 'Workout' | 'Event'
  date: string
  time: string
  description: string
  tags: string
  creatorEmail: string
  creatorName?: string
  creatorProfilePicture?: string
}

// Add interface for event with timestamps
interface EventWithTimestamp extends EventData {
  createdAt: Date
  updatedAt: Date
  id: string
}

interface AdminPanelProps {
  userEmail?: string;
}

export const AdminPanel = ({ userEmail = '' }: AdminPanelProps) => {
  const [eventData, setEventData] = useState<EventData>({
    name: '',
    type: 'Workout',
    date: '',
    time: '',
    description: '',
    tags: '',
    creatorEmail: ''
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
  const [selectedEventId, setShowRSVPs] = useState<string | null>(null)

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
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
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
    setHasAttemptedSubmit(true)

    if (!eventData.name.trim() || !eventData.date || !eventData.time || !eventData.description.trim()) {
      return
    }

    try {
      console.log('Original date:', eventData.date); // Debug log

      // Get creator's info from Firestore
      const userDoc = await getDoc(doc(db, 'users', userEmail));
      const userData = userDoc.data();

      // Keep the date as is since it's already in YYYY-MM-DD format
      const formattedDate = eventData.date;
      console.log('Formatted date:', formattedDate); // Debug log

      // Create a new document in the events collection
      const docRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        date: formattedDate,
        creatorEmail: userEmail,
        creatorName: userData?.name,
        creatorProfilePicture: userData?.profilePicture,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      // Log the stored date
      const savedData = (await getDoc(docRef)).data();
      console.log('Stored date:', savedData?.date); // Debug log
      
      // Clear the form and reset submit attempt
      setEventData({
        name: '',
        type: 'Workout',
        date: '',
        time: '',
        description: '',
        tags: '',
        creatorEmail: ''
      })
      setHasAttemptedSubmit(false)
      
    } catch (error) {
      console.error('Error adding event:', error)
    }
  }

  const handleCopyEvent = (event: EventWithTimestamp) => {
    setEventData({
      name: event.name,
      type: event.type,
      date: event.date,
      time: event.time,
      description: event.description,
      tags: event.tags,
      creatorEmail: event.creatorEmail,
      creatorName: event.creatorName,
      creatorProfilePicture: event.creatorProfilePicture
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
            placeholder={`Say a little bit about your ${eventData.type.toLowerCase()}`}
            borderWidth={1}
            borderColor={!eventData.description.trim() && hasAttemptedSubmit ? 'red' : '$borderColor'}
            backgroundColor="white"
            padding="$3"
            minHeight={100}
            color="#4A5568"
            placeholderTextColor="#A0AEC0"
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
         (!eventData.name.trim() || !eventData.date || !eventData.time || !eventData.description.trim()) && (
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
          Recent Activity
        </Text>
        <ScrollView 
          height={isDesktop ? 600 : 400} 
          padding="$4"
        >
          <YStack space="$4">
            {eventHistory.map((event) => (
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
                  </YStack>

                  <XStack space="$2">
                    <Button
                      size="$2"
                      backgroundColor="$gray8"
                      padding="$2"
                      onPress={() => setShowRSVPs(event.id)}
                      hoverStyle={{ backgroundColor: '$gray7' }}
                    >
                      <Text color="white" fontSize="$3">RSVPs</Text>
                    </Button>
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
                      backgroundColor="transparent"
                      padding="$2"
                      onPress={() => handleDelete(event.id)}
                      hoverStyle={{ 
                        opacity: 0.7,
                        backgroundColor: '$red10'
                      }}
                    >
                      <Text color="$color" fontSize="$3">Delete</Text>
                    </Button>
                  </XStack>
                </XStack>
                <Text color="$textPrimary" numberOfLines={2}>
                  {event.description}
                </Text>
                {event.tags && (
                  <Text color="$textPrimary" fontSize="$3" opacity={0.7}>
                    Tags: {event.tags}
                  </Text>
                )}
                <Text fontSize="$2" color="$textPrimary" opacity={0.5}>
                  Created: {event.createdAt.toLocaleString()}
                </Text>
              </YStack>
            ))}
          </YStack>
        </ScrollView>
      </YStack>

      {/* Add the popup */}
      {selectedEventId && (
        <RSVPListPopup
          event={eventHistory.find(e => e.id === selectedEventId)!}
          onClose={() => setShowRSVPs(null)}
        />
      )}
    </YStack>
  )
} 
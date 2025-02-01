import { YStack, Text, Input, Button, XStack, TextArea, Select, ScrollView } from 'tamagui'
import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore'

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
  const today = new Date()
  
  // Generate dates for the next 365 days
  for (let i = 0; i < 365; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    const value = date.toISOString().split('T')[0]
    const label = date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
    
    dates.push({ value, label })
  }
  return dates
}

interface EventData {
  name: string
  type: 'Workout' | 'Event'
  date: string
  time: string
  description: string
  tags: string
}

// Add interface for event with timestamps
interface EventWithTimestamp extends EventData {
  createdAt: Date
  updatedAt: Date
  id: string
}

export const AdminPanel = () => {
  const [eventData, setEventData] = useState<EventData>({
    name: '',
    type: 'Workout',
    date: '',
    time: '',
    description: '',
    tags: ''
  })

  // Add state to track if form has been submitted
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  const timeOptions = generateTimeOptions()
  const dateOptions = generateDateOptions()

  const [eventHistory, setEventHistory] = useState<EventWithTimestamp[]>([])

  // Add a function to check window width
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024)

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
    setHasAttemptedSubmit(true)  // Set to true when submit is attempted

    // Check for required fields
    if (!eventData.name.trim() || !eventData.date || !eventData.time || !eventData.description.trim()) {
      return
    }

    try {
      // Create a new document in the events collection
      const docRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      console.log('Event added with ID:', docRef.id)
      
      // Clear the form and reset submit attempt
      setEventData({
        name: '',
        type: 'Workout',
        date: '',
        time: '',
        description: '',
        tags: ''
      })
      setHasAttemptedSubmit(false)  // Reset after successful submit
      
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
      tags: event.tags
    })
    // Scroll to top of form on mobile
    if (!isDesktop) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
          <Text color="$color">{eventData.type} Name *</Text>
          <Input
            value={eventData.name}
            onChangeText={(text) => setEventData(prev => ({ ...prev, name: text }))}
            placeholder="Value"
            borderWidth={1}
            borderColor={!eventData.name.trim() && hasAttemptedSubmit ? 'red' : '$borderColor'}
            backgroundColor="white"
            padding="$3"
          />
        </YStack>

        {/* Type Toggle */}
        <XStack 
          backgroundColor="#f0f0f0" 
          borderRadius="$4"
          overflow="hidden"
        >
          <Button
            flex={1}
            backgroundColor={eventData.type === 'Workout' ? 'white' : 'transparent'}
            color="black"
            onPress={() => setEventData(prev => ({ ...prev, type: 'Workout' }))}
          >
            Workout
          </Button>
          <Button
            flex={1}
            backgroundColor={eventData.type === 'Event' ? 'white' : 'transparent'}
            color="black"
            onPress={() => setEventData(prev => ({ ...prev, type: 'Event' }))}
          >
            Event
          </Button>
        </XStack>

        {/* Date/Time Selection */}
        <YStack space="$2">
          <Text color="$color">Date/Time *</Text>
          <XStack space="$2">
            <YStack flex={1}>
              <Select
                value={eventData.date}
                onValueChange={(value) => setEventData(prev => ({ ...prev, date: value }))}
              >
                <Select.Trigger 
                  width="100%" 
                  padding="$3" 
                  borderWidth={1} 
                  borderColor={!eventData.date && hasAttemptedSubmit ? 'red' : '$borderColor'} 
                  backgroundColor="white"
                >
                  <Select.Value placeholder="Select date" />
                </Select.Trigger>

                <Select.Content>
                  <Select.ScrollUpButton />
                  <Select.Viewport>
                    <Select.Group>
                      {dateOptions.map((date, index) => (
                        <Select.Item key={date.value} value={date.value} index={index}>
                          <Select.ItemText>{date.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Viewport>
                  <Select.ScrollDownButton />
                </Select.Content>
              </Select>
            </YStack>
            <YStack flex={1}>
              <Select
                value={eventData.time}
                onValueChange={(value) => setEventData(prev => ({ ...prev, time: value }))}
              >
                <Select.Trigger 
                  width="100%" 
                  padding="$3" 
                  borderWidth={1} 
                  borderColor={!eventData.time && hasAttemptedSubmit ? 'red' : '$borderColor'} 
                  backgroundColor="white"
                >
                  <Select.Value placeholder="Select time" />
                </Select.Trigger>

                <Select.Content>
                  <Select.ScrollUpButton />
                  <Select.Viewport>
                    <Select.Group>
                      {timeOptions.map((time, index) => (
                        <Select.Item key={time.value} value={time.value} index={index}>
                          <Select.ItemText>{time.label}</Select.ItemText>
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
          backgroundColor="#d4d4d4"
          color="black"
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
          color="$color"
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
                backgroundColor="white"
                padding="$3"
                borderRadius="$2"
                borderWidth={1}
                borderColor="$borderColor"
                space="$2"
              >
                <XStack justifyContent="space-between" alignItems="flex-start">
                  <Text fontWeight="bold" color="$color">
                    {event.type}: {event.name}
                  </Text>
                  <Button
                    size="$2"
                    padding="$2"
                    backgroundColor="transparent"
                    onPress={() => handleCopyEvent(event)}
                    aria-label="Copy event"
                    hoverStyle={{ backgroundColor: '$gray4' }}
                  >
                    <Text color="$color" fontSize="$3">Copy</Text>
                  </Button>
                </XStack>
                <Text color="$color" fontSize="$3">
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </Text>
                <Text color="$color" numberOfLines={2}>
                  {event.description}
                </Text>
                {event.tags && (
                  <Text color="$color" fontSize="$3" opacity={0.7}>
                    Tags: {event.tags}
                  </Text>
                )}
                <Text fontSize="$2" color="$color" opacity={0.5}>
                  Created: {event.createdAt.toLocaleString()}
                </Text>
              </YStack>
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    </YStack>
  )
} 
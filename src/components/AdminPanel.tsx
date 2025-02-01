import { YStack, Text, Input, Button, XStack, TextArea, Select } from 'tamagui'
import { useState } from 'react'
import { db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'

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

export const AdminPanel = () => {
  const [eventData, setEventData] = useState<EventData>({
    name: '',
    type: 'Workout',
    date: '',
    time: '',
    description: '',
    tags: ''
  })

  const timeOptions = generateTimeOptions()
  const dateOptions = generateDateOptions()

  const handleSubmit = async () => {
    try {
      // Create a new document in the events collection
      const docRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      console.log('Event added with ID:', docRef.id)
      
      // Clear the form
      setEventData({
        name: '',
        type: 'Workout',
        date: '',
        time: '',
        description: '',
        tags: ''
      })
      
    } catch (error) {
      console.error('Error adding event:', error)
    }
  }

  return (
    <YStack padding="$4" space="$4" maxWidth={500} width="100%">
      <Text 
        fontSize="$8" 
        fontWeight="bold" 
        color="$color"
      >
        ADMIN PANEL
      </Text>

      {/* Name Input - Updated to be dynamic */}
      <YStack space="$2">
        <Text color="$color">{eventData.type} Name</Text>
        <Input
          value={eventData.name}
          onChangeText={(text) => setEventData(prev => ({ ...prev, name: text }))}
          placeholder="Value"
          borderWidth={1}
          borderColor="$borderColor"
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
        <Text color="$color">Date/Time</Text>
        <XStack space="$2">
          <YStack flex={1}>
            <Select
              value={eventData.date}
              onValueChange={(value) => setEventData(prev => ({ ...prev, date: value }))}
            >
              <Select.Trigger width="100%" padding="$3" borderWidth={1} borderColor="$borderColor" backgroundColor="white">
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
              <Select.Trigger width="100%" padding="$3" borderWidth={1} borderColor="$borderColor" backgroundColor="white">
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
        <Text color="$color">Description</Text>
        <TextArea
          value={eventData.description}
          onChangeText={(text) => setEventData(prev => ({ ...prev, description: text }))}
          placeholder={`Say a little bit about your ${eventData.type.toLowerCase()}`}
          borderWidth={1}
          borderColor="$borderColor"
          backgroundColor="white"
          padding="$3"
          minHeight={100}
        />
      </YStack>

      {/* Tags */}
      <YStack space="$2">
        <Text color="$color">Tags</Text>
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

      {/* Submit Button */}
      <Button
        backgroundColor="#d4d4d4"
        color="black"
        onPress={handleSubmit}
        marginTop="$4"
      >
        Post
      </Button>
    </YStack>
  )
} 
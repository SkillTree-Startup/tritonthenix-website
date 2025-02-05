import { YStack, Text, Button, XStack, Stack, Image, ScrollView, Input, TextArea, Select } from 'tamagui'
import { X, Edit2, Pencil } from '@tamagui/lucide-icons'
import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { Event } from '../types/Event'

interface EventEditPopupProps {
  event: Event
  onClose: () => void
  onDelete: (eventId: string) => void
}

interface UserInfo {
  email: string
  name?: string
}

interface EditableFields {
  name: string
  date: string
  time: string
  description: string
  additionalDetails?: string
  tags?: string
}

// Common edit button component style
const EditButton = ({ onPress }: { onPress: () => void }) => (
  <Button
    size="$3"
    backgroundColor="$blue2"
    padding="$2"
    onPress={onPress}
    hoverStyle={{ backgroundColor: '$blue3' }}
    borderRadius="$4"
  >
    <Pencil size={18} color="$blue8" />
  </Button>
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
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Add state for edited values
  const [editedEvent, setEditedEvent] = useState<EditableFields>({
    name: event.name,
    date: event.date,
    time: event.time,
    description: event.description,
    additionalDetails: event.additionalDetails,
    tags: event.tags
  })
  const [editing, setEditing] = useState<EditableFields>({
    name: false,
    description: false,
    date: false,
    time: false,
    tags: false,
    additionalDetails: false
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
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0,0,0,0.5)"
      justifyContent="center"
      alignItems="center"
      zIndex={1000}
      padding="$4"
    >
      <YStack
        backgroundColor="$background"
        borderRadius="$4"
        padding="$4"
        width="100%"
        maxWidth={500}
        space="$4"
      >
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="bold" color="$textPrimary">
            Event Details
          </Text>
          <Button
            size="$3"
            circular
            backgroundColor="transparent"
            onPress={onClose}
          >
            <X size={24} color="$color" />
          </Button>
        </XStack>

        <ScrollView>
          <YStack space="$4" padding="$2">
            {/* Name Field */}
            <YStack space="$2">
              <Text color="$textSecondary" fontSize="$3" fontWeight="bold">Name</Text>
              <XStack space="$2" alignItems="center">
                {editing.name ? (
                  <XStack flex={1} space="$2">
                    <Input
                      flex={1}
                      value={editedEvent.name}
                      onChangeText={(text) => handleFieldChange('name', text)}
                      backgroundColor="$background"
                      borderColor="$borderColor"
                    />
                    <Button
                      size="$3"
                      backgroundColor="$blue8"
                      onPress={() => handleSave('name')}
                    >
                      <Text color="white">Save</Text>
                    </Button>
                  </XStack>
                ) : (
                  <XStack flex={1} space="$2" alignItems="center">
                    <Text flex={1} color="$textPrimary">{editedEvent.name}</Text>
                    <EditButton onPress={() => setEditing(prev => ({ ...prev, name: true }))} />
                  </XStack>
                )}
              </XStack>
            </YStack>

            {/* Date and Time Fields */}
            <YStack space="$2">
              <Text color="$textSecondary" fontSize="$3" fontWeight="bold">Date & Time</Text>
              <XStack space="$2" alignItems="center">
                {editing.date || editing.time ? (
                  <YStack flex={1} space="$2">
                    <Select
                      value={editedEvent.date}
                      onValueChange={(value: string) => handleFieldChange('date', value)}
                    >
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        {dateOptions.map((option, index) => (
                          <Select.Item 
                            key={option.value} 
                            value={option.value}
                            index={index}
                          >
                            <Select.ItemText>{option.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>

                    <Select
                      value={editedEvent.time}
                      onValueChange={(value) => handleFieldChange('time', value)}
                      items={timeOptions}
                    >
                      <Select.Trigger width="100%" iconAfter={Pencil}>
                        <Select.Value placeholder="Select Time" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.ScrollUpButton />
                        <Select.Viewport>
                          <Select.Group>
                            {timeOptions.map((option) => (
                              <Select.Item key={option.value} value={option.value}>
                                <Select.ItemText>{option.label}</Select.ItemText>
                              </Select.Item>
                            ))}
                          </Select.Group>
                        </Select.Viewport>
                        <Select.ScrollDownButton />
                      </Select.Content>
                    </Select>

                    <Button
                      size="$3"
                      backgroundColor="$blue8"
                      onPress={() => {
                        handleSave('date')
                        handleSave('time')
                      }}
                    >
                      <Text color="white">Save</Text>
                    </Button>
                  </YStack>
                ) : (
                  <XStack flex={1} space="$2" alignItems="center">
                    <Text flex={1} color="$textPrimary">
                      {formatEventDate(editedEvent.date)} at {editedEvent.time}
                    </Text>
                    <EditButton onPress={() => setEditing(prev => ({ ...prev, date: true, time: true }))} />
                  </XStack>
                )}
              </XStack>
            </YStack>

            {/* Description Field */}
            <YStack space="$2">
              <Text color="$textSecondary" fontSize="$3" fontWeight="bold">Description</Text>
              <XStack space="$2" alignItems="flex-start">
                {editing.description ? (
                  <XStack flex={1} space="$2">
                    <TextArea
                      flex={1}
                      value={editedEvent.description}
                      onChangeText={(text) => handleFieldChange('description', text)}
                      backgroundColor="$background"
                      borderColor="$borderColor"
                      minHeight={100}
                    />
                    <Button
                      size="$3"
                      backgroundColor="$blue8"
                      onPress={() => handleSave('description')}
                    >
                      <Text color="white">Save</Text>
                    </Button>
                  </XStack>
                ) : (
                  <XStack flex={1} space="$2" alignItems="flex-start">
                    <Text flex={1} color="$textPrimary">{editedEvent.description}</Text>
                    <EditButton onPress={() => setEditing(prev => ({ ...prev, description: true }))} />
                  </XStack>
                )}
              </XStack>
            </YStack>

            {/* Additional Details Field */}
            <YStack space="$2">
              <Text color="$textSecondary" fontSize="$3" fontWeight="bold">Additional Details</Text>
              <XStack space="$2" alignItems="flex-start">
                {editing.additionalDetails ? (
                  <XStack flex={1} space="$2">
                    <TextArea
                      flex={1}
                      value={editedEvent.additionalDetails || ''}
                      onChangeText={(text) => handleFieldChange('additionalDetails', text)}
                      backgroundColor="$background"
                      borderColor="$borderColor"
                      minHeight={100}
                      placeholder="Add any additional information that will be shown to users"
                    />
                    <Button
                      size="$3"
                      backgroundColor="$blue8"
                      onPress={() => handleSave('additionalDetails')}
                    >
                      <Text color="white">Save</Text>
                    </Button>
                  </XStack>
                ) : (
                  <XStack flex={1} space="$2" alignItems="flex-start">
                    <Text flex={1} color="$textPrimary">
                      {editedEvent.additionalDetails || 'No additional details'}
                    </Text>
                    <EditButton onPress={() => setEditing(prev => ({ ...prev, additionalDetails: true }))} />
                  </XStack>
                )}
              </XStack>
            </YStack>

            {/* Tags Field */}
            <YStack space="$2">
              <Text color="$textSecondary" fontSize="$3" fontWeight="bold">Tags</Text>
              <XStack space="$2" alignItems="center">
                {editing.tags ? (
                  <XStack flex={1} space="$2">
                    <Input
                      flex={1}
                      value={editedEvent.tags}
                      onChangeText={(text) => handleFieldChange('tags', text)}
                      backgroundColor="$background"
                      borderColor="$borderColor"
                    />
                    <Button
                      size="$3"
                      backgroundColor="$blue8"
                      onPress={() => handleSave('tags')}
                    >
                      <Text color="white">Save</Text>
                    </Button>
                  </XStack>
                ) : (
                  <XStack flex={1} space="$2" alignItems="center">
                    <Text flex={1} color="$textPrimary">{editedEvent.tags || 'No tags'}</Text>
                    <EditButton onPress={() => setEditing(prev => ({ ...prev, tags: true }))} />
                  </XStack>
                )}
              </XStack>
            </YStack>
          </YStack>
        </ScrollView>

        {/* Delete button and confirmation */}
        {!showDeleteConfirm ? (
          <Button
            backgroundColor="$red8"
            padding="$2"
            onPress={() => setShowDeleteConfirm(true)}
            hoverStyle={{ backgroundColor: '$red7' }}
          >
            <Text color="white" fontSize="$3">Delete Event</Text>
          </Button>
        ) : (
          <YStack space="$2">
            <Text color="$textPrimary" textAlign="center" fontWeight="bold">
              Are you sure you want to delete this event?
            </Text>
            <Text color="$textSecondary" textAlign="center" fontSize="$3">
              This action cannot be undone.
            </Text>
            <XStack space="$2" justifyContent="center">
              <Button
                backgroundColor="$gray8"
                padding="$2"
                onPress={() => setShowDeleteConfirm(false)}
                hoverStyle={{ backgroundColor: '$gray7' }}
                flex={1}
              >
                <Text color="white" fontSize="$3">Cancel</Text>
              </Button>
              <Button
                backgroundColor="$red8"
                padding="$2"
                onPress={() => {
                  onDelete(event.id)
                }}
                hoverStyle={{ backgroundColor: '$red7' }}
                flex={1}
              >
                <Text color="white" fontSize="$3">Confirm Delete</Text>
              </Button>
            </XStack>
          </YStack>
        )}
      </YStack>
    </YStack>
  )
} 
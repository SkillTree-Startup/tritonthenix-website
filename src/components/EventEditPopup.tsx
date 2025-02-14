import { YStack, Text, Button, XStack } from 'tamagui'
import { Event } from '../types/Event'
import { EventForm } from './EventForm'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { X } from '@tamagui/lucide-icons'

interface EventEditPopupProps {
  event: Event;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const EventEditPopup = ({ event, onClose, onDelete }: EventEditPopupProps) => {
  const handleSubmit = async (updatedData: Event) => {
    try {
      const eventRef = doc(db, 'events', event.id)
      await updateDoc(eventRef, {
        ...updatedData,
        updatedAt: new Date()
      })
      onClose()
    } catch (error) {
      console.error('Error updating event:', error)
    }
  }

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0,0,0,0.75)"
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
        maxWidth={600}
        space="$4"
      >
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="bold" color="$textPrimary">
            Edit Event
          </Text>
          <Button
            size="$3"
            circular
            backgroundColor="transparent"
            onPress={onClose}
            aria-label="Close dialog"
          >
            <X size={24} color="$color" />
          </Button>
        </XStack>

        {/* Form */}
        <EventForm
          onSubmit={handleSubmit}
          initialData={event}
        />

        {/* Delete Button */}
        <Button
          backgroundColor="$red8"
          onPress={() => {
            if (window.confirm('Are you sure you want to delete this event?')) {
              onDelete(event.id)
            }
          }}
          marginTop="$2"
        >
          <Text color="white">Delete Event</Text>
        </Button>
      </YStack>
    </YStack>
  )
} 
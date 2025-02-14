import { YStack, Text, Input, Button, XStack, TextArea, Select } from 'tamagui'
import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react'
import { Event } from '../types/Event'
import { generateTimeOptions, generateDateOptions } from '../utils/dateUtils'

// Memoize options outside component
const timeOptions = generateTimeOptions()
const dateOptions = generateDateOptions()

interface EventFormProps {
  onSubmit: (data: Event) => void
  initialData?: Partial<Event>
}

export const EventForm = memo(({ onSubmit, initialData }: EventFormProps) => {
  // Track all form values in state
  const [formState, setFormState] = useState({
    type: initialData?.type || 'Workout',
    name: initialData?.name || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    description: initialData?.description || '',
    additionalDetails: initialData?.additionalDetails || '',
    tags: initialData?.tags || ''
  })
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  // Update form state when initialData changes (for copy functionality)
  useEffect(() => {
    if (initialData) {
      setFormState({
        type: initialData.type || 'Workout',
        name: initialData.name || '',
        date: initialData.date || '',
        time: initialData.time || '',
        description: initialData.description || '',
        additionalDetails: initialData.additionalDetails || '',
        tags: initialData.tags || ''
      })
      setHasAttemptedSubmit(false)
    }
  }, [initialData])

  // Handle individual field changes
  const handleChange = useCallback((field: string, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }, [])

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields (remove additionalDetails check)
    const isValid = 
      formState.name.trim() !== '' && 
      formState.date !== '' && 
      formState.time !== '' && 
      formState.description.trim() !== ''

    if (!isValid) {
      setHasAttemptedSubmit(true)
      return
    }

    onSubmit(formState as Event)
    
    // Reset form
    setFormState({
      type: 'Workout',
      name: '',
      date: '',
      time: '',
      description: '',
      additionalDetails: '',
      tags: ''
    })
    setHasAttemptedSubmit(false)
  }, [formState, onSubmit])

  // Validation state
  const validationState = useMemo(() => ({
    name: hasAttemptedSubmit && !formState.name.trim(),
    date: hasAttemptedSubmit && !formState.date,
    time: hasAttemptedSubmit && !formState.time,
    description: hasAttemptedSubmit && !formState.description.trim(),
  }), [hasAttemptedSubmit, formState])

  return (
    <form onSubmit={handleSubmit}>
      <YStack space="$4" maxWidth={500} width="100%">
        <Text fontSize="$8" fontWeight="bold" color="$color">
          Admin Panel
        </Text>

        {/* Name Input */}
        <YStack space="$2">
          <Text color="$color">Name *</Text>
          <Input
            value={formState.name}
            onChangeText={(text) => handleChange('name', text)}
            placeholder={`Enter ${formState.type.toLowerCase()} name`}
            borderWidth={1}
            borderColor={validationState.name ? 'red' : '$borderColor'}
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
            backgroundColor={formState.type === 'Workout' ? '$background' : 'transparent'}
            color="$textPrimary"
            onPress={() => handleChange('type', 'Workout')}
            themeInverse
          >
            Workout
          </Button>
          <Button
            flex={1}
            backgroundColor={formState.type === 'Event' ? '$background' : 'transparent'}
            color="$textPrimary"
            onPress={() => handleChange('type', 'Event')}
            themeInverse
          >
            Event
          </Button>
        </XStack>

        {/* Date/Time Selection */}
        <YStack space="$2">
          <Text color="$color">Date/Time *</Text>
          <XStack space="$4" width="100%">
            <YStack flex={1}>
              <Select
                value={formState.date}
                onValueChange={(value) => handleChange('date', value)}
              >
                <Select.Trigger borderColor={validationState.date ? 'red' : '$borderColor'}>
                  <Select.Value placeholder="Select Date" />
                </Select.Trigger>
                <Select.Content>
                  <Select.ScrollUpButton />
                  <Select.Viewport>
                    {dateOptions.map((option, index) => (
                      <Select.Item key={option.value} value={option.value} index={index}>
                        <Select.ItemText>{option.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                  <Select.ScrollDownButton />
                </Select.Content>
              </Select>
            </YStack>

            <YStack flex={1}>
              <Select
                value={formState.time}
                onValueChange={(value) => handleChange('time', value)}
              >
                <Select.Trigger borderColor={validationState.time ? 'red' : '$borderColor'}>
                  <Select.Value placeholder="Select Time" />
                </Select.Trigger>
                <Select.Content>
                  <Select.ScrollUpButton />
                  <Select.Viewport>
                    {timeOptions.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        <Select.ItemText>{option.label}</Select.ItemText>
                      </Select.Item>
                    ))}
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
            value={formState.description}
            onChangeText={(text) => handleChange('description', text)}
            placeholder="Short sentence about the workout/event"
            minHeight={80}
            maxHeight={120}
            borderWidth={1}
            borderColor={validationState.description ? 'red' : '$borderColor'}
            backgroundColor="white"
            padding="$3"
            paddingVertical="$2"
            color="#4A5568"
            placeholderTextColor="#A0AEC0"
            textAlignVertical="center"
          />
        </YStack>

        {/* Additional Details */}
        <YStack space="$2">
          <Text color="$textSecondary">Full Description (Coming Soon)</Text>
          <TextArea
            value={formState.additionalDetails}
            onChangeText={(text) => handleChange('additionalDetails', text)}
            placeholder="This feature is temporarily disabled"
            borderWidth={1}
            borderColor="$borderColor"
            backgroundColor="$gray3"
            padding="$3"
            color="$textSecondary"
            placeholderTextColor="$textSecondary"
            minHeight={100}
            disabled={true}
            opacity={0.5}
          />
        </YStack>

        {/* Tags */}
        <YStack space="$2">
          <Text color="$color">Tags (Optional)</Text>
          <Input
            value={formState.tags}
            onChangeText={(text) => handleChange('tags', text)}
            placeholder="(core, upper, beginner-friendly)"
            borderWidth={1}
            borderColor="$borderColor"
            backgroundColor="white"
            padding="$3"
            color="#4A5568"
            placeholderTextColor="#A0AEC0"
          />
        </YStack>

        {/* Error message */}
        {hasAttemptedSubmit && Object.values(validationState).some(Boolean) && (
          <Text color="red" textAlign="center">
            Please fill out all required fields
          </Text>
        )}

        {/* Submit Button */}
        <Button
          backgroundColor="$blue8"
          paddingVertical="$3"
          paddingHorizontal="$4"
          borderRadius="$2"
          marginTop="$4"
          onPress={(e) => {
            e.preventDefault?.()
            handleSubmit(e as any)
          }}
        >
          <Text color="white" fontWeight="bold">
            Post
          </Text>
        </Button>
      </YStack>
    </form>
  )
})

EventForm.displayName = 'EventForm' 
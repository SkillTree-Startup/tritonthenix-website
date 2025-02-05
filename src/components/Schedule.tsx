import { useState, useEffect } from 'react';
import { YStack, Text, XStack, Button, ScrollView, tokens } from 'tamagui';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';

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

const Schedule = ({ defaultTab = 'Workouts' }: ScheduleProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'Workouts' | 'Events'>(defaultTab);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState(generateWeekDates(new Date()));

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

  // Filter events based on active tab and date
  const now = new Date();
  const today = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

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
    const eventDate = new Date(`${event.date}T00:00:00-08:00`);
    return eventDate >= today;
  });

  const pastEvents = filteredEvents.filter(event => 
    new Date(event.date) < now
  );

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

  return (
    <YStack padding="$4" space="$4" width="100%" alignItems="center">
      <YStack space="$4" maxWidth={800} width="100%">
        <Text fontSize="$8" fontWeight="bold" color="$textPrimary">Schedule</Text>

        {/* Tabs */}
        <XStack backgroundColor="$cardBackground" borderRadius="$4" overflow="hidden">
          <Button
            flex={1}
            backgroundColor={activeTab === 'Workouts' ? '$background' : 'transparent'}
            color="$textPrimary"
            onPress={() => handleTabChange('Workouts')}
          >
            Workouts
          </Button>
          <Button
            flex={1}
            backgroundColor={activeTab === 'Events' ? '$background' : 'transparent'}
            color="$textPrimary"
            onPress={() => handleTabChange('Events')}
          >
            Events
          </Button>
        </XStack>

        {/* Date Selector - Only show for Workouts */}
        {activeTab === 'Workouts' && (
          <XStack 
            backgroundColor="$cardBackground" 
            borderRadius="$4" 
            padding="$2"
            space="$2"
            alignItems="center"
            pressStyle={{ backgroundColor: 'transparent' }}
          >
            <Button
              size="$2"
              onPress={() => navigateWeek('prev')}
              backgroundColor="transparent"
            >
              ←
            </Button>
            {weekDates.map((date) => {
              const formattedDate = formatDate(date);
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <Button
                  key={date.toISOString()}
                  onPress={() => handleDateSelect(date)}
                  backgroundColor={isSelected ? '$color' : 'transparent'}
                  borderRadius="$4"
                  padding="$2"
                  flex={1}
                  hoverStyle={isToday ? {
                    borderColor: '$color',
                    borderWidth: 1
                  } : undefined}
                  borderWidth={0}
                >
                  <YStack alignItems="center" space="$1">
                    <Text 
                      color={isSelected ? 'white' : '$color'} 
                      fontSize="$2"
                    >
                      {formattedDate.weekday}
                    </Text>
                    <Text 
                      color={isSelected ? 'white' : '$color'} 
                      fontSize="$4" 
                      fontWeight="bold"
                    >
                      {formattedDate.day}
                    </Text>
                    {isToday && (
                      <Text 
                        color={isSelected ? 'white' : '$color'} 
                        fontSize="$2"
                      >
                        Today
                      </Text>
                    )}
                  </YStack>
                </Button>
              );
            })}
            <Button
              size="$2"
              onPress={() => navigateWeek('next')}
              backgroundColor="transparent"
            >
              →
            </Button>
          </XStack>
        )}

        {/* Events List */}
        <ScrollView height={600} width="100%">
          <YStack space="$8">
            {activeTab === 'Events' ? (
              // Events View
              <>
                {/* Upcoming Events */}
                <YStack space="$8">
                  <Text fontSize="$6" fontWeight="bold" color="$color">
                    Upcoming Events
                  </Text>
                  {upcomingEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                  {upcomingEvents.length === 0 && (
                    <Text color="$color" textAlign="center">
                      No upcoming events scheduled
                    </Text>
                  )}
                </YStack>

                {/* Past Events */}
                <YStack space="$8" marginTop="$8">
                  <Text fontSize="$6" fontWeight="bold" color="$color">
                    Past Events
                  </Text>
                  {pastEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                  {pastEvents.length === 0 && (
                    <Text color="$color" textAlign="center">
                      No past events
                    </Text>
                  )}
                </YStack>
              </>
            ) : (
              // Workouts View
              <YStack space="$8">
                {filteredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
                {filteredEvents.length === 0 && (
                  <Text color="$color" textAlign="center">
                    No workouts scheduled for this date
                  </Text>
                )}
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </YStack>
  );
};

// Event Card Component
const EventCard = ({ event }: { event: Event }) => {
  const formatEventDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00-08:00`);
    return date.toLocaleDateString();
  };

  return (
    <YStack
      backgroundColor="$cardBackground"
      padding="$4"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      space="$2"
    >
      <Text fontWeight="bold" fontSize="$5" color="$textPrimary">
        {event.name}
      </Text>
      
      <XStack space={event.type === 'Event' ? '$2' : '$0'} alignItems="center">
        {event.type === 'Event' && (
          <>
            <Text fontWeight="500" color="$color">
              {formatEventDate(event.date)}
            </Text>
          </>
        )}
        <Text 
          color="$color"
          marginLeft={event.type === 'Workout' ? '$0' : undefined}
        >
          {formatTime(event.time)}
        </Text>
        <Text 
          color="$color"
          marginLeft="$2"
        >
          {event.instructor}
        </Text>
      </XStack>

      {event.subLocation && (
        <Text color="$color" opacity={0.8}>
          {event.subLocation}
        </Text>
      )}

      <Text 
        color="$textSecondary"
        marginTop="$2"
      >
        {event.description}
      </Text>

      {event.tags && (
        <Text color="$color" fontSize="$3" opacity={0.7} marginTop="$2">
          Tags: {event.tags}
        </Text>
      )}
    </YStack>
  );
};

export default Schedule; 
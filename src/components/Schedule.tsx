import { useState, useEffect } from 'react';
import { YStack, Text, XStack, Button, ScrollView, Stack, Image } from 'tamagui';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { EventDetailsPopup } from './EventDetailsPopup'

// Add the default profile image constant
const DEFAULT_PROFILE_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNEMUQxRDEiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4NSIgcj0iMzUiIGZpbGw9IiM5NDk0OTQiLz4KICA8cGF0aCBkPSJNMTAwIDE0MEMxMzYuMDQ0IDE0MCAxNjUgMTY4Ljk1NiAxNjUgMjA1SDE2NUgzNUgzNUMzNSAxNjguOTU2IDYzLjk1NiAxNDAgMTAwIDE0MFoiIGZpbGw9IiM5NDk0OTQiLz4KPC9zdmc+Cg=='

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

// Update the helper function to generate dates based on screen size
const generateWeekDates = (selectedDate: Date, isSmallScreen: boolean) => {
  const dates = [];
  const startDate = new Date(selectedDate);
  startDate.setDate(startDate.getDate() - (isSmallScreen ? 1 : 3)); // Start 1 or 3 days before

  const daysToShow = isSmallScreen ? 3 : 7;
  for (let i = 0; i < daysToShow; i++) {
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
  const [weekDates, setWeekDates] = useState(generateWeekDates(new Date(), false));
  const [attendeeCounts, setAttendeeCounts] = useState<{ [key: string]: number }>({});
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

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

  // Add useEffect to handle screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640); // Adjust breakpoint as needed
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Update weekDates useEffect to use screen size
  useEffect(() => {
    setWeekDates(generateWeekDates(selectedDate, isSmallScreen));
  }, [selectedDate, isSmallScreen]);

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
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? (isSmallScreen ? 1 : 7) : (isSmallScreen ? -1 : -7)));
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
                  backgroundColor="transparent"
                  borderRadius="$4"
                  padding="$3"
                  paddingVertical="$4"
                  flex={1}
                  pressStyle={{
                    scale: 0.98,
                  }}
                  hoverStyle={{
                    ...(isToday && {
                      borderColor: '$gray8',
                      borderWidth: 1,
                    })
                  }}
                  borderWidth={0}
                >
                  <YStack 
                    alignItems="center" 
                    space="$2"
                    backgroundColor="transparent"
                    padding="$2"
                    borderRadius="$2"
                    borderBottomWidth={isSelected ? 2 : 0}
                    borderBottomColor="$color"
                  >
                    {isSmallScreen ? (
                      <>
                        <Text 
                          color={isSelected ? '$color' : '$gray10'} 
                          fontSize="$4"
                        >
                          {isToday ? 'Today' : formattedDate.weekday}
                        </Text>
                        <Text 
                          color={isSelected ? '$color' : '$gray10'} 
                          fontSize="$6" 
                          fontWeight="bold"
                        >
                          {formattedDate.day}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text 
                          color={isSelected ? '$color' : '$gray10'} 
                          fontSize="$4"
                        >
                          {`${formattedDate.month} ${formattedDate.day}`}
                        </Text>
                        <Text 
                          color={isSelected ? '$color' : '$gray10'}
                          fontSize="$6"
                          fontWeight="bold"
                        >
                          {isToday ? 'Today' : formattedDate.weekday}
                        </Text>
                      </>
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
                  <Text color="$color" textAlign="center">
                    No workouts scheduled for this date
                  </Text>
                )}
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </YStack>

      {/* Add the EventDetailsPopup at the root level */}
      {selectedEvent && (
        <EventDetailsPopup
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRSVP={() => handleRSVP(selectedEvent)}
          isRSVPd={selectedEvent.attendees?.includes(userEmail || '') || false}
        />
      )}
    </YStack>
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
    <YStack
      backgroundColor="$cardBackground"
      padding="$4"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      space="$2"
    >
      <XStack>
        {/* Date display for events */}
        {event.type === 'Event' && (
          <YStack
            width={50}
            alignItems="center"
            justifyContent="center"
            marginRight="$4"
            padding="$2"
          >
            <Text 
              color="$textSecondary"
              fontSize="$3"
              fontWeight="500"
            >
              {formatEventDateDisplay(event.date).month}
            </Text>
            <Text 
              color="$textPrimary"
              fontSize="$6"
              fontWeight="bold"
            >
              {formatEventDateDisplay(event.date).day}
            </Text>
            <Text 
              color="$textSecondary"
              fontSize="$3"
              marginTop="$1"
            >
              {formatTime(event.time)}
            </Text>
          </YStack>
        )}

        {/* Left side content */}
        <YStack flex={1} space="$2">
          {event.type === 'Workout' ? (
            <XStack space="$2" alignItems="center">
              <Stack
                width={32}
                height={32}
                borderRadius={16}
                overflow="hidden"
                backgroundColor="$background"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Image
                  source={{ uri: event.creatorProfilePicture || DEFAULT_PROFILE_IMAGE }}
                  width="100%"
                  height="100%"
                  resizeMode="cover"
                  alt={`${getFirstName(event.creatorName)}'s profile picture`}
                />
              </Stack>
              
              <YStack>
                <Text fontSize="$3" color="$textSecondary">
                  {getFirstName(event.creatorName)}
                </Text>
                <Text fontWeight="bold" fontSize="$5" color="$textPrimary">
                  {event.name}
                </Text>
              </YStack>
            </XStack>
          ) : (
            <Text fontWeight="bold" fontSize="$5" color="$textPrimary">
              {event.name}
            </Text>
          )}

          {/* Remove date/time from here for Events */}
          <XStack space={event.type === 'Event' ? '$2' : '$0'} alignItems="center">
            {event.type === 'Workout' && (
              <Text 
                color="$color"
                marginLeft={event.type === 'Workout' ? '$0' : undefined}
              >
                {formatTime(event.time)}
              </Text>
            )}
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

          <Text color="$textSecondary">
            {event.description}
          </Text>
        </YStack>

        {/* Right side content */}
        <YStack justifyContent="center" marginLeft="$4">
          <Button
            size="$3"
            backgroundColor="black"
            onPress={() => onViewDetails()}
            minHeight={36}
            width={100}
            paddingHorizontal="$3"
            alignItems="center"
            justifyContent="center"
            hoverStyle={{ backgroundColor: '$gray7' }}
          >
            <Text color="white">Details</Text>
          </Button>

          {/* Only show spots text if there's a limit */}
          {event.maxRSVPs && (
            <Text 
              fontSize="$3" 
              color="$textSecondary" 
              textAlign="center" 
              marginTop="$1"
              width={100}
            >
              {getSpotsText()}
            </Text>
          )}
        </YStack>
      </XStack>
    </YStack>
  );
};

export default Schedule; 
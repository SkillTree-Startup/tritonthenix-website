import { useState, useEffect } from 'react';
import { YStack, Text, XStack, Button, ScrollView } from 'tamagui';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

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

const Schedule = () => {
  // Initialize activeTab based on URL
  const [activeTab, setActiveTab] = useState<'Workouts' | 'Events'>(() => {
    const path = window.location.pathname;
    return path.includes('events') ? 'Events' : 'Workouts';
  });
  const [events, setEvents] = useState<Event[]>([]);

  // Add URL change listener
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      setActiveTab(path.includes('events') ? 'Events' : 'Workouts');
    };

    // Listen for both popstate and our custom urlchange event
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('urlchange', handleUrlChange);
    
    // Initial check
    handleUrlChange();

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('urlchange', handleUrlChange);
    };
  }, []);

  // Add URL handling when tab changes
  const handleTabChange = (tab: 'Workouts' | 'Events') => {
    setActiveTab(tab);
    const newPath = tab === 'Events' ? '/schedule/events' : '/schedule/workouts';
    window.history.pushState({}, '', newPath);
  };

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
  const filteredEvents = events.filter(event => {
    const isCorrectType = activeTab === 'Events' ? 
      event.type === 'Event' : 
      event.type === 'Workout';
    return isCorrectType;
  });

  const upcomingEvents = filteredEvents.filter(event => 
    new Date(event.date) >= now
  );

  return (
    <YStack 
      padding="$4" 
      space="$4" 
      width="100%" 
      alignItems="center"
    >
      {/* Main Panel */}
      <YStack space="$4" maxWidth={500} width="100%">
        <Text 
          fontSize="$8" 
          fontWeight="bold" 
          color="$color"
        >
          Schedule
        </Text>

        {/* Tabs - Updated with new handler */}
        <XStack 
          backgroundColor="#f0f0f0" 
          borderRadius="$4"
          overflow="hidden"
        >
          <Button
            flex={1}
            backgroundColor={activeTab === 'Workouts' ? 'white' : 'transparent'}
            color="black"
            onPress={() => handleTabChange('Workouts')}
          >
            Workouts
          </Button>
          <Button
            flex={1}
            backgroundColor={activeTab === 'Events' ? 'white' : 'transparent'}
            color="black"
            onPress={() => handleTabChange('Events')}
          >
            Events
          </Button>
        </XStack>

        {/* Events List */}
        <YStack 
          backgroundColor="$background" 
          borderRadius="$4" 
          borderWidth={1} 
          borderColor="$borderColor"
          width="100%"
        >
          <Text 
            fontSize="$6" 
            fontWeight="bold" 
            color="$color"
            padding="$4"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
          >
            {`Upcoming ${activeTab}`}
          </Text>
          <ScrollView height={400} padding="$4">
            <YStack space="$4">
              {upcomingEvents.map(event => (
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
                      {event.name}
                    </Text>
                  </XStack>
                  <Text color="$color" fontSize="$3">
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </Text>
                  <Text color="$color">
                    {event.instructor}
                  </Text>
                  <Text color="$color">
                    {event.location}
                  </Text>
                  <Text color="$color">
                    {event.subLocation}
                  </Text>
                  <Text color="$color" fontSize="$3">
                    {event.description}
                  </Text>
                  {event.tags && (
                    <Text color="$color" fontSize="$3" opacity={0.7}>
                      Tags: {event.tags}
                    </Text>
                  )}
                </YStack>
              ))}
              {upcomingEvents.length === 0 && (
                <Text color="$color" textAlign="center">
                  No upcoming {activeTab.toLowerCase()} scheduled
                </Text>
              )}
            </YStack>
          </ScrollView>
        </YStack>
      </YStack>
    </YStack>
  );
};

export default Schedule; 
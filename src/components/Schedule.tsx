import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Event } from '../types/Event';

// Temporary mock data - remove this when connecting to real backend
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    type: 'ABS + UPPER',
    instructor: 'KEARA',
    date: new Date('2024-01-21'),
    time: '6:00AM',
    location: 'Pacific Beach Classroom',
    subLocation: 'Pacific Beach-SD'
  },
  {
    id: '2',
    type: 'ABS + UPPER',
    instructor: 'SOPHIE',
    date: new Date('2024-01-30'),
    time: '7:10AM',
    location: 'Pacific Beach Classroom',
    subLocation: 'Pacific Beach-SD'
  },
  {
    id: '3',
    type: 'ABS + UPPER',
    instructor: 'KEARA',
    date: new Date('2023-12-25'),
    time: '6:00AM',
    location: 'Pacific Beach Classroom',
    subLocation: 'Pacific Beach-SD'
  },
  // Add event type entries for the Events tab
  {
    id: '4',
    type: 'SPECIAL EVENT',
    instructor: 'TEAM',
    date: new Date('2024-02-15'),
    time: '8:00AM',
    location: 'Pacific Beach Classroom',
    subLocation: 'Pacific Beach-SD'
  }
];

const Schedule = () => {
  const [activeTab, setActiveTab] = useState<'Workouts' | 'Events'>('Workouts');
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS); // Use mock data for now

  // Comment out or remove this useEffect when using mock data
  /*useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);*/

  const sortedEvents = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const now = new Date();
  const upcomingEvents = sortedEvents.filter(event => new Date(event.date) >= now);
  const pastEvents = sortedEvents.filter(event => new Date(event.date) < now);

  const EventCard = ({ event }: { event: Event }) => (
    <div className="flex items-start gap-6 p-4 bg-white">
      <div className="flex flex-col items-center min-w-[60px]">
        <span className="text-gray-400 text-sm font-medium">
          {format(new Date(event.date), 'MMM').toUpperCase()}
        </span>
        <span className="text-5xl font-light text-gray-500">
          {format(new Date(event.date), 'd')}
        </span>
        <span className="text-gray-400 text-sm">
          {event.time}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-400 uppercase">{event.type}</span>
        <span className="text-gray-400 uppercase">{event.instructor}</span>
        <span className="text-gray-400">{event.location}</span>
        <span className="text-gray-400">{event.subLocation}</span>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'Events') {
      return (
        <div className="max-w-md mx-auto mt-8 px-4">
          <section>
            <h2 className="text-2xl font-bold mb-4">Events</h2>
            <div className="divide-y">
              {events
                .filter(event => event.type.toLowerCase().includes('event'))
                .map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
            </div>
          </section>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto mt-8 px-4">
        {upcomingEvents
          .filter(event => !event.type.toLowerCase().includes('event'))
          .length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Upcoming</h2>
            <div className="divide-y">
              {upcomingEvents
                .filter(event => !event.type.toLowerCase().includes('event'))
                .map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
            </div>
          </section>
        )}

        {pastEvents
          .filter(event => !event.type.toLowerCase().includes('event'))
          .length > 0 && (
          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Past</h2>
            <div className="divide-y">
              {pastEvents
                .filter(event => !event.type.toLowerCase().includes('event'))
                .map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Background Image Section */}
      <div className="relative h-[300px] bg-gradient-to-b from-black to-transparent">
        <div className="absolute inset-0 bg-cover bg-center" 
             style={{ backgroundImage: 'url(/beach-workout.jpg)' }} />
        <h1 className="absolute w-full text-center text-white text-5xl font-bold top-1/2">
          SCHEDULE
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex justify-center -mt-6 px-4">
        <div className="flex w-full max-w-md bg-gray-200 rounded-full p-1">
          <button
            className={`flex-1 py-2 px-4 rounded-full text-center transition-colors
              ${activeTab === 'Workouts' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setActiveTab('Workouts')}
          >
            Workouts
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-full text-center transition-colors
              ${activeTab === 'Events' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setActiveTab('Events')}
          >
            Events
          </button>
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default Schedule; 
import React from 'react';
import { 
  startOfWeek as dateFnsStartOfWeek, 
  addDays,
  format, 
  isSameDay, 
  setHours, 
  setMinutes,
  isWithinInterval,
  isBefore,
  isAfter,
  differenceInMinutes,
  getHours,
  getMinutes
} from 'date-fns';
import styles from './WeekView.module.scss';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'field_rental' | 'training' | 'camp' | 'birthday' | 'league' | 'pickup';
    data: any;
  };
}

interface WeekViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ events, currentDate, onEventClick }) => {
  // Generate array of 7 days for the week
  const weekStart = dateFnsStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(weekStart, i)
  );

  // Generate time slots (48 half-hour slots for 24 hours)
  const timeSlots = Array.from({ length: 48 }, (_, i) => ({
    hour: Math.floor(i / 2),
    minute: (i % 2) * 30,
    label: i % 2 === 0 ? format(setMinutes(setHours(new Date(), Math.floor(i / 2)), 0), 'h a') : '',
  }));

  // Color mapping for event types
  const eventColors: Record<string, string> = {
    field_rental: '#3b82f6',
    training: '#8b5cf6',
    camp: '#f59e0b',
    birthday: '#ec4899',
    league: '#10b981',
    pickup: '#ef4444',
  };

  // Helper to check if event occurs on a specific day and time slot
  const getEventsForDayAndSlot = (day: Date, hour: number, minute: number) => {
    return events.filter(event => {
      const eventStart = event.start;
      const eventEnd = event.end;
      const slotStart = setMinutes(setHours(day, hour), minute);
      const slotEnd = setMinutes(setHours(day, hour), minute + 29);

      return isSameDay(eventStart, day) && 
             (isWithinInterval(eventStart, { start: slotStart, end: slotEnd }) ||
              (isBefore(eventStart, slotEnd) && isAfter(eventEnd, slotStart)));
    });
  };

  const today = new Date();

  return (
    <div className={styles.weekView}>
      {/* Header with day names and dates */}
      <div className={styles.header}>
        <div className={styles.timeGutter}></div>
        {weekDays.map((day, index) => {
          const isToday = isSameDay(day, today);
          return (
            <div key={index} className={styles.dayHeader}>
              <div className={styles.dayName}>{format(day, 'EEE')}</div>
              <div className={`${styles.dayNumber} ${isToday ? styles.today : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className={styles.timeGrid}>
        {timeSlots.map((slot, index) => (
          <React.Fragment key={index}>
            {/* Time label - only show on hour marks */}
            <div className={`${styles.timeLabel} ${slot.label ? '' : styles.timeLabelEmpty}`}>
              {slot.label}
            </div>

            {/* Day cells for this time slot */}
            {weekDays.map((day, dayIndex) => {
              const eventsInSlot = getEventsForDayAndSlot(day, slot.hour, slot.minute);
              
              return (
                <div key={`${index}-${dayIndex}`} className={styles.timeCell}>
                  {eventsInSlot.map(event => {
                    const eventStart = event.start;
                    const eventEnd = event.end;
                    const slotStart = setMinutes(setHours(day, slot.hour), slot.minute);
                    
                    // Calculate position within the 30-minute slot
                    const minutesFromSlotStart = differenceInMinutes(eventStart, slotStart);
                    const topPercentage = Math.max(0, (minutesFromSlotStart / 30) * 100);
                    
                    // Calculate duration
                    const durationMinutes = differenceInMinutes(eventEnd, eventStart);
                    const heightPercentage = Math.min((durationMinutes / 30) * 100, 100);

                    // Only render if event starts in this slot
                    const eventHour = getHours(eventStart);
                    const eventMinute = getMinutes(eventStart);
                    if (eventHour !== slot.hour || eventMinute < slot.minute || eventMinute >= slot.minute + 30) {
                      return null;
                    }

                    return (
                      <div
                        key={event.id}
                        className={styles.event}
                        style={{
                          top: `${topPercentage}%`,
                          height: `${heightPercentage}%`,
                          backgroundColor: eventColors[event.resource.type] || '#667eea',
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        <div className={styles.eventTitle}>{event.title}</div>
                        <div className={styles.eventTime}>
                          {format(eventStart, 'h:mm a')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WeekView;

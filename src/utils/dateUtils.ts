// Extract date utilities
export const generateTimeOptions = () => {
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

export const generateDateOptions = () => {
  const dates = []
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const pacificDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
    
    const value = pacificDate.toISOString().split('T')[0]
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
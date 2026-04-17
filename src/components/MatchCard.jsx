import React from 'react'
import { Clock, Goal } from 'lucide-react'

const MatchCard = ({ match }) => {
  const { fixture, teams, goals, score } = match
  const isLive = fixture.status.short === '1H' || fixture.status.short === '2H' || fixture.status.short === 'HT'
  
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`card ${isLive ? 'border-l-4 border-l-green-500' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm text-gray-400">
          <Clock className="w-4 h-4 mr-2" />
          {isLive ? (
            <span className="text-green-400 font-medium animate-pulse">
              LIVE {fixture.status.elapsed}'
            </span>
          ) : (
            <span>{formatTime(fixture.date)}</span>
          )}
        </div>
        <span className="text-xs text-gray-500">{fixture.venue.name}</span>
      </div>

      <div className="flex items-center justify-between">
        {/* Home Team */}
        <div className="flex-1 flex items-center space-x-3">
          <img src={teams.home.logo} alt={teams.home.name} className="w-10 h-10 object-contain" />
          <div>
            <p className="font-medium">{teams.home.name}</p>
            {isLive && (
              <div className="flex items-center text-xs text-yellow-400 mt-1">
                {match.events?.filter(e => e.team.id === teams.home.id && e.type === 'Goal').length > 0 && (
                  <Goal className="w-3 h-3 mr-1" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="px-6 py-2 bg-gray-900 rounded-lg mx-4">
          <span className="text-2xl font-bold">
            {goals.home !== null ? goals.home : '-'} : {goals.away !== null ? goals.away : '-'}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex-1 flex items-center justify-end space-x-3">
          <div className="text-right">
            <p className="font-medium">{teams.away.name}</p>
            {isLive && (
              <div className="flex items-center justify-end text-xs text-yellow-400 mt-1">
                {match.events?.filter(e => e.team.id === teams.away.id && e.type === 'Goal').length > 0 && (
                  <Goal className="w-3 h-3 ml-1" />
                )}
              </div>
            )}
          </div>
          <img src={teams.away.logo} alt={teams.away.name} className="w-10 h-10 object-contain" />
        </div>
      </div>

      {/* Additional Info */}
      {isLive && match.events && match.events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="space-y-1">
            {match.events.slice(-3).map((event, idx) => (
              <div key={idx} className="text-sm text-gray-400 flex items-center">
                <span className="w-8 text-xs">{event.time.elapsed}'</span>
                <span className={event.team.id === teams.home.id ? 'text-blue-400' : 'text-purple-400'}>
                  {event.player.name} {event.type === 'Goal' ? '⚽' : event.type === 'Card' ? '🟨' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MatchCard

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Globe, Star } from 'lucide-react'

// Configurazione leghe disponibili
const AVAILABLE_LEAGUES = {
  serie_a: {
    id: 135,
    name: 'Serie A',
    country: 'Italia',
    icon: Trophy,
    color: 'bg-blue-600',
    description: 'Campionato italiano di Serie A'
  },
  champions_league: {
    id: 2,
    name: 'Champions League',
    country: 'Europa',
    icon: Star,
    color: 'bg-purple-600',
    description: 'UEFA Champions League'
  },
  europa_league: {
    id: 3,
    name: 'Europa League',
    country: 'Europa',
    icon: Star,
    color: 'bg-orange-600',
    description: 'UEFA Europa League'
  },
  premier_league: {
    id: 39,
    name: 'Premier League',
    country: 'Inghilterra',
    icon: Trophy,
    color: 'bg-green-600',
    description: 'Campionato inglese'
  },
  la_liga: {
    id: 140,
    name: 'La Liga',
    country: 'Spagna',
    icon: Trophy,
    color: 'bg-red-600',
    description: 'Campionato spagnolo'
  },
  bundesliga: {
    id: 78,
    name: 'Bundesliga',
    country: 'Germania',
    icon: Trophy,
    color: 'bg-red-500',
    description: 'Campionato tedesco'
  },
  ligue_1: {
    id: 61,
    name: 'Ligue 1',
    country: 'Francia',
    icon: Trophy,
    color: 'bg-blue-500',
    description: 'Campionato francese'
  },
  world_cup: {
    id: 1,
    name: 'Mondiali',
    country: 'Mondo',
    icon: Globe,
    color: 'bg-yellow-600',
    description: 'Campionato del Mondo FIFA'
  },
  euro: {
    id: 4,
    name: 'Europei',
    country: 'Europa',
    icon: Globe,
    color: 'bg-indigo-600',
    description: 'Campionato Europeo UEFA'
  }
}

const LeagueSelector = ({ user }) => {
  const navigate = useNavigate()
  const userLeagues = user?.leagues || []

  // Filtra solo le leghe a cui l'utente è abbonato
  const subscribedLeagues = Object.entries(AVAILABLE_LEAGUES)
    .filter(([key]) => userLeagues.includes(key))
    .map(([key, value]) => ({ ...value, key }))

  if (subscribedLeagues.length === 0) {
    return (
      <div className="card text-center py-12">
        <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Nessuna competizione attiva</h2>
        <p className="text-gray-400">
          Contatta l'amministratore per attivare un abbonamento.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Le tue competizioni</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscribedLeagues.map((league) => {
          const Icon = league.icon
          return (
            <button
              key={league.key}
              onClick={() => navigate(`/league/${league.id}`)}
              className="card hover:border-blue-500 transition cursor-pointer text-left group"
            >
              <div className={`${league.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-1">{league.name}</h3>
              <p className="text-sm text-gray-400 mb-2">{league.country}</p>
              <p className="text-xs text-gray-500">{league.description}</p>
              <div className="mt-4 text-blue-400 text-sm font-medium">
                Visualizza statistiche →
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LeagueSelector

import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Activity, Users, Goal } from 'lucide-react'
import { useFootballData } from '../hooks/useFootballData'
import StandingsTable from './StandingsTable'
import MatchCard from './MatchCard'

const StatsDashboard = ({ user }) => {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('football_stats_token')
  const [activeTab, setActiveTab] = useState('standings') // standings, live, scorers
  
  const { standings, live, topScorers, loading, error } = useFootballData(leagueId, token)

  const leagueNames = {
    135: 'Serie A',
    2: 'Champions League',
    3: 'Europa League',
    39: 'Premier League',
    140: 'La Liga',
    78: 'Bundesliga',
    61: 'Ligue 1',
    1: 'Mondiali',
    4: 'Europei'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center py-12 text-red-400">
        <p>Errore caricamento dati: {error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-4">
          Riprova
        </button>
      </div>
    )
  }

  return (
    <div>
      <button 
        onClick={() => navigate('/')}
        className="flex items-center text-gray-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Torna alle competizioni
      </button>

      <h2 className="text-2xl font-bold mb-6">{leagueNames[leagueId] || 'Competizione'}</h2>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-700 pb-2">
        <TabButton 
          active={activeTab === 'standings'} 
          onClick={() => setActiveTab('standings')}
          icon={Activity}
          label="Classifica"
        />
        <TabButton 
          active={activeTab === 'live'} 
          onClick={() => setActiveTab('live')}
          icon={Goal}
          label="Live"
          badge={live?.length > 0 ? live.length : null}
        />
        <TabButton 
          active={activeTab === 'scorers'} 
          onClick={() => setActiveTab('scorers')}
          icon={Users}
          label="Marcatori"
        />
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'standings' && <StandingsTable standings={standings} />}
        
        {activeTab === 'live' && (
          <div className="space-y-4">
            {live.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nessuna partita in corso</p>
            ) : (
              live.map(match => <MatchCard key={match.fixture.id} match={match} />)
            )}
          </div>
        )}
        
        {activeTab === 'scorers' && (
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Top Marcatori</h3>
            <div className="space-y-3">
              {topScorers.map((player, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500 w-6">{idx + 1}</span>
                    <div>
                      <p className="font-medium">{player.player.name}</p>
                      <p className="text-sm text-gray-400">{player.statistics[0].team.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-green-400">{player.statistics[0].goals.total} gol</span>
                    <span className="text-gray-500">{player.statistics[0].games.appearences} pres.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const TabButton = ({ active, onClick, icon: Icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
      active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
    {badge && (
      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
)

export default StatsDashboard

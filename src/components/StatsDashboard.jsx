import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Activity, Users, Goal } from 'lucide-react'
import { useFootballData } from '../hooks/useFootballData'
import StandingsTable from './StandingsTable'
import MatchCard from './MatchCard'

const StatsDashboard = ({ user }) => {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('football_stats_token')
  const [activeTab, setActiveTab] = useState('standings')
  const [apiStatus, setApiStatus] = useState('In attesa...')
  const [debugLog, setDebugLog] = useState([])
  
  const { standings, live, topScorers, loading, error } = useFootballData(leagueId, token)

  const addLog = (msg) => {
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
  }

  useEffect(() => {
    addLog(`Mount - League: ${leagueId}, Token: ${token ? 'OK' : 'NO'}`)
    
    if (loading) setApiStatus('Caricamento dati...')
    else if (error) {
      setApiStatus(`Errore: ${error}`)
      addLog(`Errore ricevuto: ${error}`)
    }
    else if (standings?.length > 0) {
      setApiStatus(`Dati ricevuti: ${standings.length} squadre`)
      addLog(`Standings ricevuti: ${standings.length}`)
    }
    else {
      setApiStatus('Nessun dato ricevuto')
      addLog('Array standings vuoto o undefined')
    }
  }, [loading, error, standings, leagueId, token])

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

  if (!token) {
    return (
      <div className="card text-center py-12 text-red-400">
        <p>Token mancante. Riapri l'app dal bot.</p>
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

      {/* DEBUG PANEL */}
      <div style={{
        background: '#1a1a2e', 
        border: '2px solid #e94560', 
        padding: '15px', 
        margin: '10px 0 20px 0',
        borderRadius: '8px',
        fontSize: '13px',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        <p style={{color: '#e94560', fontWeight: 'bold', marginBottom: '8px'}}>
          🔧 DEBUG CONSOLE
        </p>
        <p style={{color: '#fff', marginBottom: '5px'}}>Status: {apiStatus}</p>
        <p style={{color: '#aaa', fontSize: '11px', marginBottom: '10px'}}>
          Token: {token ? '✅' : '❌'} | User: {user?.username || 'N/A'}
        </p>
        <div style={{borderTop: '1px solid #333', paddingTop: '8px'}}>
          {debugLog.map((log, i) => (
            <p key={i} style={{color: '#0f0', fontSize: '11px', margin: '2px 0'}}>
              {log}
            </p>
          ))}
        </div>
      </div>

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
        {activeTab === 'standings' && (
          standings?.length > 0 ? (
            <StandingsTable standings={standings} />
          ) : (
            <div className="card text-center py-8 text-gray-400">
              <p>Nessuna classifica disponibile</p>
              <p className="text-sm mt-2">Stagione: 2025</p>
            </div>
          )
        )}
        
        {activeTab === 'live' && (
          <div className="space-y-4">
            {live?.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nessuna partita in corso</p>
            ) : (
              live.map(match => <MatchCard key={match.fixture.id} match={match} />)
            )}
          </div>
        )}
        
        {activeTab === 'scorers' && (
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Top Marcatori</h3>
            {topScorers?.length > 0 ? (
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
            ) : (
              <p className="text-gray-400 text-center py-4">Nessun dato disponibile</p>
            )}
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

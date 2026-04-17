import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const StandingsTable = ({ standings }) => {
  if (!standings || standings.length === 0) {
    return <p className="text-gray-400 text-center py-8">Classifica non disponibile</p>
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-700">
              <th className="pb-3 pl-4">Pos</th>
              <th className="pb-3">Squadra</th>
              <th className="pb-3 text-center">Pt</th>
              <th className="pb-3 text-center">G</th>
              <th className="pb-3 text-center">V</th>
              <th className="pb-3 text-center">N</th>
              <th className="pb-3 text-center">P</th>
              <th className="pb-3 text-center">GF</th>
              <th className="pb-3 text-center">GS</th>
              <th className="pb-3 text-center">DR</th>
              <th className="pb-3 pr-4 text-center">Forma</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team) => (
              <tr key={team.team.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                <td className="py-3 pl-4 font-medium">
                  <RankIndicator rank={team.rank} />
                </td>
                <td className="py-3">
                  <div className="flex items-center space-x-3">
                    <img src={team.team.logo} alt={team.team.name} className="w-6 h-6 object-contain" />
                    <span className="font-medium">{team.team.name}</span>
                  </div>
                </td>
                <td className="py-3 text-center font-bold text-blue-400">{team.points}</td>
                <td className="py-3 text-center text-gray-400">{team.all.played}</td>
                <td className="py-3 text-center text-gray-400">{team.all.win}</td>
                <td className="py-3 text-center text-gray-400">{team.all.draw}</td>
                <td className="py-3 text-center text-gray-400">{team.all.lose}</td>
                <td className="py-3 text-center text-green-400">{team.all.goals.for}</td>
                <td className="py-3 text-center text-red-400">{team.all.goals.against}</td>
                <td className="py-3 text-center">{team.goalsDiff > 0 ? `+${team.goalsDiff}` : team.goalsDiff}</td>
                <td className="py-3 pr-4">
                  <FormIndicator form={team.form} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const RankIndicator = ({ rank }) => {
  let color = 'text-gray-400'
  if (rank === 1) color = 'text-yellow-400'
  else if (rank <= 4) color = 'text-blue-400'
  else if (rank <= 6) color = 'text-green-400'
  else if (rank >= 18) color = 'text-red-400'
  
  return <span className={`font-bold ${color}`}>{rank}</span>
}

const FormIndicator = ({ form }) => {
  if (!form) return null
  
  return (
    <div className="flex justify-center space-x-1">
      {form.split('').map((result, idx) => {
        let Icon = Minus
        let color = 'bg-gray-600'
        
        if (result === 'W') {
          Icon = TrendingUp
          color = 'bg-green-500'
        } else if (result === 'L') {
          Icon = TrendingDown
          color = 'bg-red-500'
        } else if (result === 'D') {
          color = 'bg-yellow-500'
        }
        
        return (
          <div key={idx} className={`w-5 h-5 rounded ${color} flex items-center justify-center`}>
            <Icon className="w-3 h-3 text-white" />
          </div>
        )
      })}
    </div>
  )
}

export default StandingsTable

const StatsDashboard = ({ user }) => {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('football_stats_token')
  const [activeTab, setActiveTab] = useState('standings')
  
  // DATI DI TEST HARDCODED - rimuovi dopo il test
  const standings = [
    { rank: 1, team: { id: 1, name: 'Inter', logo: '' }, points: 80, all: { played: 30, win: 25, draw: 5, lose: 0, goals: { for: 70, against: 20 } }, goalsDiff: 50, form: 'WWWDW' },
    { rank: 2, team: { id: 2, name: 'Milan', logo: '' }, points: 70, all: { played: 30, win: 20, draw: 10, lose: 0, goals: { for: 60, against: 25 } }, goalsDiff: 35, form: 'WDWWW' },
    { rank: 3, team: { id: 3, name: 'Juventus', logo: '' }, points: 65, all: { played: 30, win: 18, draw: 11, lose: 1, goals: { for: 55, against: 30 } }, goalsDiff: 25, form: 'DWWDL' }
  ]
  const live = []
  const topScorers = []
  const loading = false
  const error = null
  
  // COMMENTA IL HOOK PER IL TEST
  // const { standings, live, topScorers, loading, error } = useFootballData(leagueId, token)

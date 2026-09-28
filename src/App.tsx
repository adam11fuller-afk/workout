import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { TabBar } from './components/TabBar'
import { useSettings } from './db/hooks'
import { setSoundEnabled } from './timers/audio'
import { setVibrationEnabled } from './timers/vibrate'
import Today from './screens/Today'
import Program from './screens/Program'
import ProgramDetail from './screens/ProgramDetail'
import ExerciseDetail from './screens/ExerciseDetail'
import History from './screens/History'
import SessionDetail from './screens/SessionDetail'
import Coverage from './screens/Coverage'
import Settings from './screens/Settings'
import Bodyweight from './screens/Bodyweight'
import Player from './screens/player/Player'

export default function App() {
  const loc = useLocation()
  const settings = useSettings()
  useEffect(() => {
    if (!settings) return
    setSoundEnabled(settings.soundEnabled)
    setVibrationEnabled(settings.vibrationEnabled)
  }, [settings?.soundEnabled, settings?.vibrationEnabled, settings])
  useEffect(() => { window.scrollTo(0, 0) }, [loc.pathname])

  const inPlayer = loc.pathname.startsWith('/session/')
  return (
    <div className="min-h-dvh safe-t">
      <div className={inPlayer ? '' : 'pb-24'}>
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/session/:id" element={<Player />} />
          <Route path="/program" element={<Program />} />
          <Route path="/program/:templateId" element={<ProgramDetail />} />
          <Route path="/exercise/:exerciseId" element={<ExerciseDetail />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:sessionId" element={<SessionDetail />} />
          <Route path="/coverage" element={<Coverage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/bodyweight" element={<Bodyweight />} />
          <Route path="*" element={<Today />} />
        </Routes>
      </div>
      {!inPlayer && <TabBar />}
    </div>
  )
}

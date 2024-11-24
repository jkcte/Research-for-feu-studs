'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugData() {
  const [scheduleData, setScheduleData] = useState<any[]>([])
  const [researchData, setResearchData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Schedule data
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('Schedule')
          .select('*')
        
        if (scheduleError) throw scheduleError
        setScheduleData(scheduleData || [])

        // Fetch Research data
        const { data: researchData, error: researchError } = await supabase
          .from('Research')
          .select('*')
        
        if (researchError) throw researchError
        setResearchData(researchData || [])

      } catch (error:any) {
        console.error('Error fetching data:', error)
        setError(error.message)
      }
    }

    fetchData()
  }, [])

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Debug Data</h1>
      
      <h2 className="text-2xl font-semibold mt-6 mb-2">Schedule Table</h2>
      {scheduleData.length === 0 ? (
        <p>No data in Schedule table</p>
      ) : (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(scheduleData, null, 2)}
        </pre>
      )}

      <h2 className="text-2xl font-semibold mt-6 mb-2">Research Table</h2>
      {researchData.length === 0 ? (
        <p>No data in Research table</p>
      ) : (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(researchData, null, 2)}
        </pre>
      )}
    </div>
  )
}
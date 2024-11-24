'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import nlp from 'compromise'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'


interface Schedule {
  Schedule_ID: number
  research_ID: number
  criteria: string
  date: string
  time: string
  location: string
  Incentives: string
  Registration_Link: string
  course_code: string
  research_name: string
}

export default function ResearchDashboard() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        console.log('Fetching schedules...')
        const { data, error } = await supabase
          .from('Schedule')
          .select(`
            *,
            Research (research_name)
          `)
          console.log('Fetched data:', data)
        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        console.log('Fetched data:', data)

        if (!data || data.length === 0) {
          console.log('No data returned from Supabase')
          setError('No schedules found')
          setIsLoading(false)
          return
        }

        const schedulesWithResearchName = data.map(schedule => ({
          ...schedule,
          research_name: schedule.Research?.research_name || 'Unknown Research'
        }))

        console.log('Processed schedules:', schedulesWithResearchName)

        setSchedules(schedulesWithResearchName)
        setIsLoading(false)
      } catch (error) {
        console.error('Error in fetchSchedules:', error)
        setError('Failed to fetch data')
        setIsLoading(false)
      }
    }

    fetchSchedules()
  }, [])

  const handleRowClick = (id: number) => {
    router.push(`/research/${id}`)
  }

  const lemmatize = (text: string) => {
    return nlp(text).normalize().out('text')
  }

  const filteredSchedules = useMemo(() => {
    if (!searchTerm) return schedules

    const lemmatizedSearchTerm = lemmatize(searchTerm.toLowerCase())

    return schedules.filter(schedule => {
      const lemmatizedCriteria = lemmatize(schedule.criteria.toLowerCase())
      const lemmatizedLocation = lemmatize(schedule.location.toLowerCase())
      const lemmatizedResearchName = lemmatize(schedule.research_name.toLowerCase())

      return lemmatizedCriteria.includes(lemmatizedSearchTerm) ||
             lemmatizedLocation.includes(lemmatizedSearchTerm) ||
             lemmatizedResearchName.includes(lemmatizedSearchTerm)
    })
  }, [schedules, searchTerm])

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8">Error: {error}</div>
  }



  return (
    <div className="min-h-screen flex flex-col bg-[#0A1E3D]">
      {/* Header */}
      <header className="w-full">
        <Image
          src="/images/psych-soc-header.jpg"
          alt="FEU Psychology Society Header"
          width={1500}
          height={100}
          className="w-full h-auto"
          priority
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 bg-white">
        <h1 className="text-3xl font-bold mb-4">Research Study Schedules</h1>
        <p className="text-lg text-gray-600 mb-6">
          Below is a list of all currently scheduled research studies. Click on a row to view more details.
        </p>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search schedules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
            aria-label="Search schedules"
          />
        </div>
        {filteredSchedules.length === 0 ? (
          <p>No schedules found.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Research Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Incentives</TableHead>
                  <TableHead className="text-right">Register</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((schedule) => (
                  <TableRow 
                    key={schedule.Schedule_ID} 
                    onClick={() => router.push(`/research/${schedule.Schedule_ID}`)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <TableCell className="font-medium">{schedule.research_name}</TableCell>
                    <TableCell>{schedule.date}</TableCell>
                    <TableCell>{schedule.location}</TableCell>
                    <TableCell>{schedule.Incentives}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        asChild
                        size="sm"
                        onClick={(e) => e.stopPropagation()} // Prevent row click when clicking the button
                      >
                        <Link href={schedule.Registration_Link}>Register</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <p className="text-sm text-gray-500 mt-4">
          Showing {filteredSchedules.length} out of {schedules.length} schedules
        </p>
      </main>

      {/* Footer */}
      <footer className="w-full">
        <Image
          src="/images/psych-soc-footer.jpg"
          alt="FEU Psychology Society Footer"
          width={1920}
          height={100}
          className="w-full h-auto"
        />
      </footer>
    </div>
  )

}
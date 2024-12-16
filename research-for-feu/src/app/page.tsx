'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import Image from 'next/image'
import nlp from 'compromise'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, ChevronRight } from 'lucide-react'



interface FormStatus {
  url: string
  status: string
}

interface HomeProps {
  formStatuses: FormStatus[]
}

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
  Research: {
    research_name: string
  }
}

export default function ResearchDashboard() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  const itemsPerPage = 10


  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('Schedule')
          .select(`
            *,
            Research (research_name)
          `)
          .eq('isAccessible', true)
          .or('Deadline.is.null,Deadline.gte.now()')

        if (error) throw error
        setSchedules(data || [])
        setIsLoading(false)
      } catch (error: any) {
        console.error('Error fetching data:', error)
        setError(error.message)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredSchedules = useMemo(() => {
    if (!searchTerm) return schedules

    const lemmatize = (text: string) => {
      return nlp(text).normalize().out('text')
    }

    const lemmatizedSearchTerm = lemmatize(searchTerm.toLowerCase())

    return schedules.filter(schedule => {
      const lemmatizedCriteria = lemmatize(schedule.criteria.toLowerCase())
      const lemmatizedLocation = lemmatize(schedule.location.toLowerCase())
      const lemmatizedResearchName = lemmatize(schedule.Research.research_name.toLowerCase())

      return lemmatizedCriteria.includes(lemmatizedSearchTerm) ||
             lemmatizedLocation.includes(lemmatizedSearchTerm) ||
             lemmatizedResearchName.includes(lemmatizedSearchTerm)
    })
  }, [schedules, searchTerm])

  const paginatedSchedules = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredSchedules.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredSchedules, currentPage])

  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage)

  const goToNextPage = () => {
    setCurrentPage(page => Math.min(page + 1, totalPages))
  }

  const goToPreviousPage = () => {
    setCurrentPage(page => Math.max(page - 1, 1))
  }

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
          width={1920}
          height={200}
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
            className="w-full max-w-sm"
            aria-label="Search schedules"
          />
        </div>
        {paginatedSchedules.length === 0 ? (
          <p>No schedules found.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
              <TableRow>
                <TableHead className="text-left">Research Title</TableHead>
                <TableHead className="text-left" style={{ minWidth: '150px' }}>Date</TableHead>
                <TableHead className="text-left">Criteria</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
              {paginatedSchedules.map((schedule) => (
                <TableRow 
                key={schedule.Schedule_ID} 
                onClick={() => router.push(`/research/${schedule.Schedule_ID}`)}
                className="cursor-pointer hover:bg-gray-50"
                >
                <TableCell>{schedule.Research.research_name}</TableCell>
                <TableCell>{schedule.date}</TableCell>
                <TableCell>{schedule.criteria}</TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {paginatedSchedules.length} out of {filteredSchedules.length} schedules
          </p>
          <div className="flex space-x-2">
            <Button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
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
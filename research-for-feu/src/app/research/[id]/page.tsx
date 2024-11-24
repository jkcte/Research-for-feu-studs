'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Clock, Users, Gift, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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

export default function ResearchDetails() {
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { id } = useParams()

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const { data, error } = await supabase
          .from('Schedule')
          .select(`
            *,
            Research (research_name)
          `)
          .eq('Schedule_ID', id)
          .single()

        if (error) throw error

        setSchedule({
          ...data,
          research_name: data.Research.research_name
        })
        setIsLoading(false)
      } catch (error) {
        setError('Failed to fetch schedule')
        setIsLoading(false)
      }
    }

    fetchSchedule()
  }, [id])

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (error || !schedule) {
    return <div className="container mx-auto px-4 py-8">Error: {error || 'Schedule not found'}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Schedules
      </Button>
      
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{schedule.research_name}</CardTitle>
              <CardDescription>Schedule ID: {schedule.Schedule_ID}</CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg">
              Course Code: {schedule.course_code}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-1 flex items-center">
                <Calendar className="mr-2 h-4 w-4" /> Date
              </h3>
              <p>{schedule.date}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1 flex items-center">
                <Clock className="mr-2 h-4 w-4" /> Time
              </h3>
              <p>{schedule.time}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1 flex items-center">
                <MapPin className="mr-2 h-4 w-4" /> Location
              </h3>
              <p>{schedule.location}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1 flex items-center">
                <Gift className="mr-2 h-4 w-4" /> Incentives
              </h3>
              <p>{schedule.Incentives}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-1 flex items-center">
              <Users className="mr-2 h-4 w-4" /> Criteria
            </h3>
            <p>{schedule.criteria}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1 flex items-center">
              <BookOpen className="mr-2 h-4 w-4" /> Research ID
            </h3>
            <p>{schedule.research_ID}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild>
            <a href={schedule.Registration_Link} target="_blank" rel="noopener noreferrer">
              Register for Study
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
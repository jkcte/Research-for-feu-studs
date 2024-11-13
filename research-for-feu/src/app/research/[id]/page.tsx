'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Papa from 'papaparse'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, ClipboardList, Calendar, DollarSign } from 'lucide-react'

interface Study {
  id: string
  name: string
  requirements: string
  activeParticipants: string
  requiredParticipants: string
  reward: string
}

export default function ResearchDetails() {
  const [study, setStudy] = useState<Study | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { id } = useParams()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/data-kk626MKqbOIDHGD6pvnw91vuhcyuWP.csv')
        const csvText = await response.text()
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const studies = results.data as Study[]
            const foundStudy = studies.find(s => s.id === id)
            if (foundStudy) {
              setStudy(foundStudy)
            } else {
              setError('Study not found')
            }
            setIsLoading(false)
          },
          error: (error:any) => {
            setError('Failed to parse CSV data')
            setIsLoading(false)
          }
        })
      } catch (error) {
        setError('Failed to fetch data')
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (error || !study) {
    return <div className="container mx-auto px-4 py-8">Error: {error || 'Study not found'}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Studies
      </Button>
      
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{study.name}</CardTitle>
              <CardDescription>{study.requirements}</CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg">
              <Users className="mr-1 h-4 w-4" />
              {study.activeParticipants} / {study.requiredParticipants} participants
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-1 flex items-center">
                <ClipboardList className="mr-2 h-4 w-4" /> Requirements
              </h3>
              <p>{study.requirements}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1 flex items-center">
                <DollarSign className="mr-2 h-4 w-4" /> Reward
              </h3>
              <p>{study.reward}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-1 flex items-center">
              <Calendar className="mr-2 h-4 w-4" /> Participation Status
            </h3>
            <p>{study.activeParticipants} out of {study.requiredParticipants} required participants</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={() => router.push(`/register/${study.id}`)}>
            Register for Study
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
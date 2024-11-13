'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface Study {
  id: string
  name: string
  requirements: string
  activeParticipants: string
  requiredParticipants: string
  reward: string
}

export default function ResearchDashboard() {
  const [studies, setStudies] = useState<Study[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/data-kk626MKqbOIDHGD6pvnw91vuhcyuWP.csv')
        const csvText = await response.text()
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            setStudies(results.data as Study[])
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
  }, [])

  const handleRowClick = (id: string) => {
    router.push(`/research/${id}`)
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8">Error: {error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Active Research Studies</h1>
      <p className="text-lg text-gray-600 mb-6">
        Below is a list of all currently active research studies. Click on a row to view more details about the study.
      </p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Study Name</TableHead>
              <TableHead className="w-[300px]">Requirements</TableHead>
              <TableHead className="text-right">Active Participants</TableHead>
              <TableHead className="text-right">Required Participants</TableHead>
              <TableHead className="text-right">Reward</TableHead>
              <TableHead className="text-right">Register</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studies.map((study) => (
              <TableRow 
                key={study.id} 
                onClick={() => handleRowClick(study.id)}
                className="cursor-pointer hover:bg-gray-100"
              >
                <TableCell className="font-medium">{study.name}</TableCell>
                <TableCell>{study.requirements}</TableCell>
                <TableCell className="text-right">{study.activeParticipants}</TableCell>
                <TableCell className="text-right">{study.requiredParticipants}</TableCell>
                <TableCell className="text-right">{study.reward}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    asChild
                    size="sm"
                    onClick={(e) => e.stopPropagation()} // Prevent row click when clicking the button
                  >
                    <Link href={`/register/${study.id}`}>Register</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-gray-500 mt-4">
        Total number of studies: {studies.length}
      </p>
    </div>
  )
}
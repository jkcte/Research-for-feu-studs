'use client'

import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

// Mock data to simulate database records
const researchStudies = [
  { id: 1, name: "Cognitive Effects of Sleep Deprivation", requirements: "Adults 18-35, good health", activeParticipants: 42 },
  { id: 2, name: "Impact of Diet on Gut Microbiome", requirements: "No dietary restrictions, age 25-50", activeParticipants: 78 },
  { id: 3, name: "Exercise and Mental Health", requirements: "Sedentary adults, age 30-55", activeParticipants: 56 },
  { id: 4, name: "Genetic Factors in Longevity", requirements: "Individuals over 80 and their children", activeParticipants: 120 },
  { id: 5, name: "Effects of Meditation on Stress Levels", requirements: "High-stress professionals, age 25-45", activeParticipants: 35 },
]

export function ResearchDashboardComponent() {
  const router = useRouter()

  const handleRowClick = (id: number) => {
    router.push(`/research/${id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Active Research Studies</h1>
      <p className="text-lg text-gray-600 mb-6">
        Below is a list of all currently active research studies in our database. Click on a row to view more details about the study.
      </p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Study Name</TableHead>
              <TableHead className="w-[250px]">Requirements</TableHead>
              <TableHead className="text-right">Active Participants</TableHead>
              <TableHead className="text-right">Register</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {researchStudies.map((study) => (
              <TableRow 
                key={study.id} 
                onClick={() => handleRowClick(study.id)}
                className="cursor-pointer hover:bg-gray-100"
              >
                <TableCell className="font-medium">{study.name}</TableCell>
                <TableCell>{study.requirements}</TableCell>
                <TableCell className="text-right">{study.activeParticipants}</TableCell>
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
        Total number of studies: {researchStudies.length}
      </p>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function NewResearchEntry() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    requirements: '',
    requiredParticipants: '',
    reward: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Basic form validation
    if (!formData.name || !formData.requirements || !formData.requiredParticipants || !formData.reward) {
      setError('Please fill in all fields')
      return
    }

    // Here you would typically send the data to your backend
    // For this example, we'll just simulate a successful submission
    console.log('Submitting new research entry:', formData)
    setSuccess(true)

    // Reset form after successful submission
    setFormData({
      name: '',
      requirements: '',
      requiredParticipants: '',
      reward: ''
    })

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Research Study</CardTitle>
          <CardDescription>Enter the details for the new research study below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Study Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter the name of the study"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Enter the study requirements"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredParticipants">Required Participants</Label>
                <Input
                  id="requiredParticipants"
                  name="requiredParticipants"
                  type="number"
                  value={formData.requiredParticipants}
                  onChange={handleChange}
                  placeholder="Enter the number of required participants"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward">Reward</Label>
                <Input
                  id="reward"
                  name="reward"
                  value={formData.reward}
                  onChange={handleChange}
                  placeholder="Enter the reward for participation"
                  required
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>New research study has been created successfully!</AlertDescription>
              </Alert>
            )}
            <CardFooter className="flex justify-end space-x-4 px-0 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push('/')}>Cancel</Button>
              <Button type="submit">Create Study</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
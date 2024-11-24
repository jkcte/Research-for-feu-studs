'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

const formSchema = z.object({
  researchName: z.string().min(2, {
    message: "Research name must be at least 2 characters.",
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a valid date in YYYY-MM-DD format.",
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Please enter a valid time in HH:MM format.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  criteria: z.string().min(10, {
    message: "Criteria must be at least 10 characters.",
  }),
  incentives: z.string().min(2, {
    message: "Incentives must be at least 2 characters.",
  }),
  registrationLink: z.string().url({
    message: "Please enter a valid URL.",
  }),
  courseCode: z.string().min(2, {
    message: "Course code must be at least 2 characters.",
  }),
})

export default function NewScheduleEntry() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      researchName: "",
      date: "",
      time: "",
      location: "",
      criteria: "",
      incentives: "",
      registrationLink: "",
      courseCode: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // First, insert the research name into the Research table
      const { data: researchData, error: researchError } = await supabase
        .from('Research')
        .insert({ research_name: values.researchName })
        .select()

      if (researchError) throw researchError

      // Now, insert the schedule entry
      const { error: scheduleError } = await supabase
        .from('Schedule')
        .insert({
          research_ID: researchData[0].research_id,
          date: values.date,
          time: values.time,
          location: values.location,
          criteria: values.criteria,
          Incentives: values.incentives,
          Registration_Link: values.registrationLink,
          course_code: values.courseCode,
        })

      if (scheduleError) throw scheduleError

      toast({
        title: "Success",
        description: "New research schedule has been created successfully!"
      })
      router.push('/')
    } catch (error) {

    } finally {
      setIsSubmitting(false)
    }
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
        <h1 className="text-3xl font-bold mb-6">Create New Research Schedule</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="researchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Research Study Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the name of the research study" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will create a new research study entry.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" placeholder="YYYY-MM-DD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" placeholder="HH:MM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="criteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Criteria</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the criteria for participants" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="incentives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incentives</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the incentives" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registrationLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/register" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="courseCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the course code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Create Schedule"}
            </Button>
          </form>
        </Form>
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
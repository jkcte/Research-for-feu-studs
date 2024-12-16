'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const formSchema = z.object({
  researchName: z.string().min(2, {
    message: "Research name must be at least 2 characters.",
  }),
  isSurvey: z.enum(["survey", "experimental"]),
  schedules: z.array(z.object({
    criteria: z.string().min(10, "Criteria must be at least 10 characters."),
    date: z.date({
      required_error: "A date is required.",
    }),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Please enter a valid time in HH:MM format."),
    location: z.string().min(2, "Location must be at least 2 characters.").optional(),
    incentives: z.string().min(2, "Incentives must be at least 2 characters."),
    registrationLink: z.string().url("Please enter a valid URL."),
    courseCode: z.string().min(2, "Course code must be at least 2 characters."),
    deadline: z.date({
      required_error: "A deadline is required.",
    }),
  })).min(1, "At least one schedule is required.")
})

export default function ResearchInput() {
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      researchName: "",
      isSurvey: "survey",
      schedules: [
        {
          criteria: "",
          date: new Date(),
          time: "",
          location: "",
          incentives: "",
          registrationLink: "",
          courseCode: "",
          deadline: new Date(),
        }
      ]
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schedules"
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Insert into Research table
      const { data: researchData, error: researchError } = await supabase
        .from('Research')
        .insert({ 
          research_name: values.researchName, 
          isSurvey: values.isSurvey === "survey" 
        })
        .select()

      if (researchError) throw researchError

      const researchId = researchData[0].research_id
      console.log("researchId", researchId)
      // Insert into Schedule table
      
      const schedulePromises = values.schedules.map(schedule => 
        supabase
          .from('Schedule')
          .upsert({
            research_id: researchId,
            criteria: schedule.criteria,
            date: schedule.date.toISOString(),
            time: schedule.time,
            location: schedule.location || null,
            Incentives: schedule.incentives,
            Registration_Link: schedule.registrationLink,
            course_code: schedule.courseCode,
            Deadline: schedule.deadline.toISOString(),
            isAccessible: true
          })
          .select()
      )
      
      console.log("schedulePromises", schedulePromises)
      await Promise.all(schedulePromises)

      // Set the submitted ID for display
      setSubmittedId(`${researchId}:${Math.floor(values.schedules[0].deadline.getTime() / 1000)}`)

    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Research Study</CardTitle>
        <CardDescription>Enter the details for your new research study.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="researchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Research Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the name of the research study" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isSurvey"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Study Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="survey" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Survey
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="experimental" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Experimental
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4">
                <FormField
                  control={form.control}
                  name={`schedules.${index}.criteria`}
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
                  name={`schedules.${index}.date`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`schedules.${index}.time`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("isSurvey") === "experimental" && (
                  <FormField
                    control={form.control}
                    name={`schedules.${index}.location`}
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
                )}
                <FormField
                  control={form.control}
                  name={`schedules.${index}.incentives`}
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
                  name={`schedules.${index}.registrationLink`}
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
                  name={`schedules.${index}.courseCode`}
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
                <FormField
                  control={form.control}
                  name={`schedules.${index}.deadline`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Deadline</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {index > 0 && (
                  <Button type="button" variant="destructive" onClick={() => remove(index)}>
                    Remove Schedule
                  </Button>
                )}
              </div>
            ))}
            {form.watch("isSurvey") === "experimental" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => append({
                  criteria: "",
                  date: new Date(),
                  time: "",
                  location: "",
                  incentives: "",
                  registrationLink: "",
                  courseCode: "",
                  deadline: new Date(),
                })}
              >
                Add Another Schedule
              </Button>
            )}
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
      {submittedId && (
        <CardFooter>
          <p>Your submission ID is: {submittedId}</p>
        </CardFooter>
      )}
    </Card>
  )
}
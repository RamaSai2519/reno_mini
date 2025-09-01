"use client"

import { z } from "zod"
import axios from "axios"
import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BASE } from "@/app/api/schools/route"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

const formSchema = z.object({
  name: z.string().min(2, "School name is required"),
  address: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  contact: z.string().regex(/^[0-9]{10,15}$/, "Contact must be 10-15 digits"),
  email_id: z.string().email("Enter a valid email"),
})

type FormValues = z.infer<typeof formSchema>

export default function AddSchoolPage() {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null
    if (!f) {
      setFile(null)
      setPreview(null)
      return
    }
    if (!f.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" })
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max image size is 5MB.", variant: "destructive" })
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function onSubmit(values: FormValues) {
    try {
      if (!file) {
        toast({ title: "Image required", description: "Please upload a school image.", variant: "destructive" })
        return
      }

      // Upload image
      const fd = new FormData()
      fd.append("file", file)
      debugger;
      const uploadResponse = await axios.post(`${BASE}/upload`, {
        filename: (file as File).name,
        filetype: (file as File).type || 'image/heic'
      })

      const presignedUrl = uploadResponse.data.data.url
      await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': (file as File).type
        }
      })

      const url = presignedUrl.split('?')[0]

      // Post school data to backend via proxy
      const payload = { ...values, image: url }

      const postRes = await fetch("/api/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!postRes.ok) {
        const t = await postRes.text()
        throw new Error(t || "Failed to save school")
      }

      toast({ title: "Success", description: "School added successfully." })
      reset()
      setFile(null)
      setPreview(null)
      window.location.href = "/showSchools"
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Something went wrong", variant: "destructive" })
    }
  }

  return (
    <main className="page-shell max-w-3xl">
      <Card className="bg-card text-card-foreground border border-border shadow-sm motion-safe:animate-fade-in">
        <CardHeader className="pb-2">
          <CardTitle className="text-balance font-heading text-2xl md:text-3xl text-primary">Add School</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid gap-2">
              <Label htmlFor="name">School Name</Label>
              <Input id="name" placeholder="e.g., Greenwood High" {...register("name")} className="bg-input" />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Street, Area" {...register("address")} className="bg-input" />
              {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="City" {...register("city")} className="bg-input" />
                {errors.city && <p className="text-sm text-red-600">{errors.city.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="State" {...register("state")} className="bg-input" />
                {errors.state && <p className="text-sm text-red-600">{errors.state.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  inputMode="numeric"
                  placeholder="10-15 digits"
                  {...register("contact")}
                  className="bg-input"
                />
                {errors.contact && <p className="text-sm text-red-600">{errors.contact.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email_id">Email</Label>
                <Input
                  id="email_id"
                  type="email"
                  placeholder="admin@school.edu"
                  {...register("email_id")}
                  className="bg-input"
                />
                {errors.email_id && <p className="text-sm text-red-600">{errors.email_id.message}</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">School Image</Label>
              <Input id="image" type="file" accept="image/*" onChange={onFileChange} className="bg-input" />
              {preview ? (
                <div className="mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview || "/placeholder.svg?height=160&width=320&query=school%20preview"}
                    alt="Selected school preview"
                    className="h-40 w-full object-cover rounded-md border border-border"
                  />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Upload a JPG/PNG image (max 5MB).</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? "Saving..." : "Save School"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter />
      </Card>
    </main>
  )
}

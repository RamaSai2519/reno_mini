"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

type School = {
  id?: number | string
  name: string
  address: string
  city: string
  state?: string
  contact?: string
  image?: string
  email_id?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SchoolsExplorer() {
  const [query, setQuery] = useState("")

  const url = useMemo(() => {
    const q = query.trim()
    return q ? `/api/schools?search=${encodeURIComponent(q)}` : "/api/schools"
  }, [query])

  const { data, isLoading, error } = useSWR<{ data?: School[]; items?: School[]; schools?: School[] } | School[]>(
    url,
    fetcher,
  )

  // Normalize possible response shapes
  const list: School[] = useMemo(() => {
    if (!data) return []
    if (Array.isArray(data)) return data
    return (data.data || data.items || data.schools || []) as School[]
  }, [data])

  return (
    <section className="grid gap-6">
      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="pt-6">
          <div className="grid gap-2">
            <Label htmlFor="search" className="text-foreground">
              Search by name
            </Label>
            <Input
              id="search"
              placeholder="e.g., Greenwood"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-input"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading && <p className="text-sm text-muted-foreground">Loading schools…</p>}
      {error && <p className="text-sm text-red-600">Failed to load schools.</p>}
      {!isLoading && !error && list.length === 0 && <p className="text-sm text-muted-foreground">No schools found.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((s, idx) => {
          const key = s.id ?? `${s.name}-${idx}`
          const img = s.image && s.image.length > 0 ? s.image : "/school-image.png"
          return (
            <Card
              key={key}
              className="overflow-hidden flex flex-col bg-card text-card-foreground border border-border shadow-sm card-hover motion-safe:animate-fade-in"
              style={{ animationDelay: `${Math.min(idx, 6) * 40}ms` }}
            >
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img || "/placeholder.svg?height=176&width=320&query=school%20image"}
                  alt={`Image of ${s.name}`}
                  className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="pointer-events-none absolute inset-0 ring-0 group-hover:ring-1 ring-primary/20 transition"></div>
              </div>
              <div className="px-4 pt-3">
                <h3 className="font-heading text-lg text-foreground">{s.name}</h3>
              </div>
              <CardContent className="text-sm text-muted-foreground">
                <p className="text-pretty">{s.address}</p>
                <p className="mt-1">{s.city}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

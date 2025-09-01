"use client"

import type React from "react"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<School | null>(null)

  const url = useMemo(() => {
    const q = query.trim()
    return q ? `/api/schools?search=${encodeURIComponent(q)}` : "/api/schools"
  }, [query])

  const { data, isLoading, error } = useSWR<{ data?: School[]; items?: School[]; schools?: School[] } | School[]>(
    url,
    fetcher,
  )

  const list: School[] = useMemo(() => {
    if (!data) return []
    if (Array.isArray(data)) return data
    return (data.data || data.items || data.schools || []) as School[]
  }, [data])

  const idParam = selected?.id != null ? String(selected.id) : null
  const { data: detailResp, isLoading: detailLoading } = useSWR<
    { data?: School[]; items?: School[]; schools?: School[] } | School | School[]
  >(open && idParam ? `/api/schools?id=${encodeURIComponent(idParam)}` : null, fetcher)

  const detailed: School | null = useMemo(() => {
    if (!open) return null
    if (!detailResp) return selected || null
    if (Array.isArray(detailResp)) {
      return (detailResp[0] as School) ?? selected ?? null
    }
    if (typeof detailResp === "object") {
      const arr = (detailResp as any).data || (detailResp as any).items || (detailResp as any).schools
      if (Array.isArray(arr) && arr.length > 0) return arr[0] as School
      return (detailResp as School) ?? selected ?? null
    }
    return selected ?? null
  }, [detailResp, selected, open])

  function openDetails(s: School) {
    setSelected(s)
    setOpen(true)
  }

  function onKeyActivate(e: React.KeyboardEvent, s: School) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      openDetails(s)
    }
  }

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
              className="overflow-hidden flex flex-col bg-card text-card-foreground border border-border shadow-sm card-hover motion-safe:animate-fade-in cursor-pointer outline-hidden focus:ring-2 focus:ring-ring"
              style={{ animationDelay: `${Math.min(idx, 6) * 40}ms` }}
              role="button"
              tabIndex={0}
              aria-label={`View details for ${s.name}`}
              onClick={() => openDetails(s)}
              onKeyDown={(e) => onKeyActivate(e, s)}
            >
              <div className="relative group">
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {detailed?.name || selected?.name || "School Details"}
            </DialogTitle>
          </DialogHeader>

          {detailLoading && <div className="text-sm text-muted-foreground">Loading details…</div>}

          {!detailLoading && (detailed || selected) && (
            <div className="grid gap-4">
              <img
                src={
                  (detailed?.image && detailed.image.length > 0 ? detailed.image : selected?.image) ||
                  "/school-image.png"
                }
                alt={`Image of ${(detailed?.name || selected?.name) ?? "school"}`}
                className="w-full h-56 object-cover rounded-md border border-border"
              />

              <div className="grid gap-2 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Name</span>
                  <span className="col-span-2 text-foreground">{detailed?.name || selected?.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Address</span>
                  <span className="col-span-2 text-foreground">{detailed?.address || selected?.address}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">City</span>
                  <span className="col-span-2 text-foreground">{detailed?.city || selected?.city}</span>
                </div>
                {(detailed?.state || selected?.state) && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">State</span>
                    <span className="col-span-2 text-foreground">{detailed?.state || selected?.state}</span>
                  </div>
                )}
                {(detailed?.contact || selected?.contact) && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Contact</span>
                    <span className="col-span-2 text-foreground">
                      <a
                        className="underline underline-offset-2 hover:text-primary"
                        href={`tel:${(detailed?.contact || selected?.contact) ?? ""}`}
                      >
                        {detailed?.contact || selected?.contact}
                      </a>
                    </span>
                  </div>
                )}
                {(detailed?.email_id || selected?.email_id) && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Email</span>
                    <span className="col-span-2 text-foreground">
                      <a
                        className="underline underline-offset-2 hover:text-primary"
                        href={`mailto:${(detailed?.email_id || selected?.email_id) ?? ""}`}
                      >
                        {detailed?.email_id || selected?.email_id}
                      </a>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

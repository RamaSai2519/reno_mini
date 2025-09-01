import { NextResponse, type NextRequest } from "next/server"

export const BASE = "https://uo5exhg7ej.execute-api.ap-south-1.amazonaws.com/main/con"
export const BASE_URL = "https://uo5exhg7ej.execute-api.ap-south-1.amazonaws.com/main/con/schools"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const id = searchParams.get("id")

    const url = new URL(BASE_URL)
    if (search) url.searchParams.set("search_name", search)
    if (id) url.searchParams.set("id", id)

    const res = await fetch(url.toString(), { cache: "no-store" })
    const text = await res.text()
    try {
      const json = JSON.parse(text)
      return NextResponse.json(json, { status: res.status })
    } catch {
      return new NextResponse(text, { status: res.status })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to fetch schools" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    try {
      const json = JSON.parse(text)
      return NextResponse.json(json, { status: res.status })
    } catch {
      return new NextResponse(text, { status: res.status })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to save school" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { mkdir, stat, writeFile } from "fs/promises"
import path from "path"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }
    const max = 5 * 1024 * 1024 // 5MB
    if ((file as any).size && (file as any).size > max) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : ""
    const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`

    const dir = path.join(process.cwd(), "public", "schoolImages")
    try {
      await stat(dir)
    } catch {
      await mkdir(dir, { recursive: true })
    }

    const filePath = path.join(dir, filename)
    await writeFile(filePath, buffer)

    const urlPath = `/schoolImages/${filename}`
    return NextResponse.json({ url: urlPath })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Upload failed" }, { status: 500 })
  }
}

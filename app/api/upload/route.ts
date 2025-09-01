import { NextResponse } from "next/server"
import axios from "axios"

const UPLOAD_ENDPOINT = "https://uo5exhg7ej.execute-api.ap-south-1.amazonaws.com/main/con/upload"

export async function POST(request: Request) {
  try {
    debugger;
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

    debugger;

    const uploadResponse = await axios.post(UPLOAD_ENDPOINT, {
      filename: file.name,
      filetype: file.type
    })
    console.log("🚀 ~ POST ~ uploadResponse:", uploadResponse)

    const presignedUrl = uploadResponse.data.data.url

    // Upload the file to the presigned URL
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': (file as File).type
      }
    })

    // Extract the file URL (remove query parameters)
    const fileUrl = presignedUrl.split('?')[0]

    return NextResponse.json({ url: fileUrl })
  } catch (e: any) {
    const log = NextResponse.json({ error: e?.message || "Upload failed" }, { status: 500 })
    console.log("🚀 ~ Upload ~ log:", log)
    return log
  }
}

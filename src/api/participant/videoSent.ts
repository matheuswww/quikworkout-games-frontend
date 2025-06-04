import { api } from "../path";
import { ResponseErr } from "../responseErr";
import { participantPath } from "./participantPath";

interface Params {
  video_id: string
}

type Status = 200 | 401 | 400 | 500

export type VideoSentResponse =
  | Status
  | "video not found"
  | "error"

export default async function VideoSent(params: Params): Promise<VideoSentResponse> {
  const url = `${api}/${participantPath}/videoSent`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(params),
    })

    const status = response.status
    if (status == 400) {
      const error: ResponseErr = await response.json()
      if (error?.message.includes("video not found")) return "video not found";
    }
    if (status == 200) return 200
    if (status === 401) return 401
    if (status === 500) return 500

    return "error"
  } catch (err) {
    console.error("Error trying VideoSent:", err)
    return "error"
  }
}

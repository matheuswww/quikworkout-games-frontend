import { api } from "../path";
import { userPath } from "./userPath";

interface GetParticipationsParams {
  cursor?: string
  limit?: number
  width?: number
  autoplay?: boolean
  muted?: boolean
  background?: boolean
}

interface Participations {
  participations: Participation[]
  user: User

}

interface Participation {
  video: string | null
  thumbnail_url: string | null
  video_id: string
  title: string | null
  edition: number
  placing: number | null
  user_time: string | null
  gain: number | null
  desqualified: string | null
  checked: boolean
  sent: boolean
  createdAt: string
}

interface User {
  user_id: string
  name: string
  user: string
  photo: string | null
}

type Status = 404 | 401 | 500

export type GetParticipationsResponse =
  Participations |  
  Status |
  "error"

  export default async function GetParticipations(
    params: GetParticipationsParams = {}
  ): Promise<GetParticipationsResponse> {
    const query = new URLSearchParams()
  
    if (params.cursor) query.append("cursor", params.cursor)
    if (params.limit) query.append("width", params.limit.toString())
    if (params.width) query.append("width", params.width.toString())
    if (params.autoplay) query.append("autoplay", String(+params.autoplay))
    if (params.muted) query.append("muted", String(+params.muted))
    if (params.background) query.append("background", String(+params.background))
  
    const url = `${api}/${userPath}/getParticipations${
      query.toString() ? `?${query.toString()}` : ""
    }`
  
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
      const status = response.status
      if (status === 200) {
        const body: Participations = await response.json()
        return body
      }
      if (status === 404) return 404
      if (status === 401) return 401
      if (status === 500) return 500
  
      return "error"
    } catch (err) {
      console.error("Error trying GetParticipations:", err)
      return "error"
    }
  }
  
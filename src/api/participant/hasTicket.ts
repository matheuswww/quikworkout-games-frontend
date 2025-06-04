import { api } from "../path";
import { ResponseErr } from "../responseErr";
import { participantPath } from "./participantPath";

type Status =  200 | 404 | 401 | 500

export type HasTicketResponse =
  "payment is still being processed, please wait a few minutes and try again" |
  "unknown payment status" |
  Status |
  "error"

export default async function HasTicket(): Promise<HasTicketResponse> {
  const url = `${api}/${participantPath}/hasTicket`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    const status = response.status
    if (status == 200) {
      return status
    }
    if (status == 400 || status == 500) {
      const body: ResponseErr = await response.json()
      if (body.message.includes("payment is still being processed, please wait a few minutes and try again")) {
        return "payment is still being processed, please wait a few minutes and try again"
      }
      if (body.message.includes("unknown payment status")) {
        return "unknown payment status"
      }
    }

    if (status == 404) return 404
    if (status == 401) return 401
    if (status == 500) return 500

    return "error"
  } catch (err) {
    console.error("Error trying HasTicket:", err)
    return "error"
  }
}

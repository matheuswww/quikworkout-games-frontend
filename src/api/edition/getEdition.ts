import { api } from "../path";
import { editionPath } from "./editionPath";

interface GetEditionParams {
  cursor?: string
  limit?: number
}

interface Top {
  top: number;
  gain: number;
}

interface Edition {
  id: string;
  start_date: string;
  closing_date: string;
  rules: string;
  challenge: string;
  number: number;
  created_at: string;
  tops: Top[];
}

type Status =  200 | 404 | 500

export type GetEditionResponse =
  Edition[] |
  Status |
  "error"

export default async function GetEdition(params: GetEditionParams = {}): Promise<GetEditionResponse> {
  const query = new URLSearchParams()
  
  if (params.cursor) query.append("cursor", params.cursor)
  if (params.limit) query.append("limit", params.limit.toString())
      
  const url = `${api}/${editionPath}/getEdition${
    query.toString() ? `?${query.toString()}` : ""
  }`

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const status = response.status
    if (status == 200) {
      const body: Edition[] = await response.json()
      return body
    }

    if (status == 404) return 404
    if (status == 500) return 500

    return "error"
  } catch (err) {
    console.error("Error trying GetEdition:", err)
    return "error"
  }
}

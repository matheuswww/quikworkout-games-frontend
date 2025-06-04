import { api } from "../path";
import { ResponseErr } from "../responseErr";
import { participantPath } from "./participantPath";

interface Form {
  form: string
}

interface Params {
  Title: string
  instagram: string
  size: number
}

type Status = 201 | 404 | 401 | 400 | 500

export type CreateParticipantResponse =
  | Status
  | Form
  | "no edition found"
  | "is not possible to register"
  | "user is already in edition"
  | "error"

export default async function CreateParticipant(params: Params): Promise<CreateParticipantResponse> {
  const url = `${api}/${participantPath}/createParticipant`;

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
    if (status === 201) {
      const body: Form = await response.json()
      return body;
    }

    if (status === 400) {
      const body: ResponseErr = await response.json()
      const error = body?.message?.toLowerCase()
  
      if (error?.includes("no edition found")) return "no edition found";
      if (error?.includes("is not possible to register")) return "is not possible to register";
      if (error?.includes("user is already in edition")) return "user is already in edition";

      return 400
    }

    if (status == 404) return 404
    if (status === 401) return 401
    if (status === 500) return 500

    return "error"
  } catch (err) {
    console.error("Error trying CreateParticipant:", err)
    return "error"
  }
}

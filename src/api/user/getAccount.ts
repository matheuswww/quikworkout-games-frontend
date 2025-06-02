import { api } from "../path";
import { userPath } from "./userPath";

interface User {
  name: string
  user: string
  category: string
  earnings: number
  photo: string | null
}

type Status = 401 | 500

export type GetAccountResponse =
  User |  
  Status |
  "error"

export default async function GetAccount(): Promise<GetAccountResponse> {
  const url = `${api}/${userPath}/getAccount`;

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
      const body: User = await response.json()
      return body
    }
    if (status == 401) return 401
    if (status == 500) return 500

    return "error"
  } catch (err) {
    console.error("Error trying getAccount:", err)
    return "error"
  }
}

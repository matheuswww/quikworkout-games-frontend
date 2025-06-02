import { api } from "../path";
import { ResponseErr } from "../responseErr";
import { userPath } from "./userPath";

type Status = 200 | 401 | 500

export type EnterAccountResponse =
  "não foi possível criar uma sessão" |
  "usuário não encontrado" |  
  Status |
  "error"

export default async function EnterAccount(): Promise<EnterAccountResponse> {
  const url = `${api}/${userPath}/enterAccount`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    const status = response.status
    if (status == 400) {
      const body: ResponseErr = await response.json()
      if (body.message.includes("não foi possível criar uma sessão")) {
        return "não foi possível criar uma sessão"
      }
      if (body.message.includes("usuário não encontrado")) {
        return "usuário não encontrado"
      }
    }
    if (status == 200) return 200
    if (status == 401) return 401
    if (status == 500) return 500

    return "error"
  } catch (err) {
    console.error("Error trying EnterAccount:", err)
    return "error"
  }
}

import { api } from "../path";
import { ResponseErr } from "../responseErr";
import { userPath } from "./userPath";

interface Params {
  user: string
  cpf: string
  category: string
  token: string
}

type Status = 201 | 400 | 401 | 500

export type CreateAccountResponse =
  | Status
  | "conta já criada"
  | "cpf já cadastrado"
  | "usuário já cadastrado"
  | "recaptcha inválido"
  | "usuário criado porém não foi possível criar uma sessão"
  | "error"

export default async function CreateAccount(params: Params): Promise<CreateAccountResponse> {
  const url = `${api}/${userPath}/createAccount`;

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
      return 201;
    }

    if (status === 400) {
      const body: ResponseErr = await response.json()
      const error = body?.message?.toLowerCase()
  
      if (error?.includes("conta já criada")) return "conta já criada";
      if (error?.includes("cpf já cadastrado")) return "cpf já cadastrado";
      if (error?.includes("usuário já cadastrado")) return "usuário já cadastrado";
      if (error?.includes("recaptcha")) return "recaptcha inválido";
      if (error?.includes("sessão")) return "usuário criado porém não foi possível criar uma sessão"

      return 400
    }

    if (status === 401) return 401
    if (status === 500) return 500

    return "error"
  } catch (err) {
    console.error("Error trying createAcount:", err)
    return "error"
  }
}

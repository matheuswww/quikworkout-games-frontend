"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Menu from "../menu/menu";
import styles from "./createAccount.module.css";
import CreateAccount from "@/api/user/createAccount";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Recaptcha from "../recaptcha/recaptcha";
import PopupError from "../popupError/popupError";
import RecaptchaForm from "@/funcs/recaptchaForm";
import SpinLoading from "../spinLoading/spinLoading";
import { quikworkoutPath } from "@/api/quikworkoutPath";

function validateCPF(cpf: string): boolean {
  let sum = 0
  let rest

  const strCPF = String(cpf).replace(/[^\d]/g, '')
  
  if (strCPF.length !== 11)
     return false
  
  if ([
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999',
    ].indexOf(strCPF) !== -1)
    return false

  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(strCPF.substring(i-1, i)) * (11 - i)
  }

  rest = (sum * 10) % 11

  if ((rest == 10) || (rest == 11)) 
    rest = 0

  if (rest != parseInt(strCPF.substring(9, 10)) )
    return false

  sum = 0

  for (let i = 1; i <= 10; i++)
    sum = sum + parseInt(strCPF.substring(i-1, i)) * (12 - i)

  rest = (sum * 10) % 11

  if ((rest == 10) || (rest == 11)) 
    rest = 0

  if (rest != parseInt(strCPF.substring(10, 11) ) )
    return false

  return true
}

const schema = z.object({
  usuario: z
    .string()
    .min(1, "Usuário é obrigatório")
    .max(30, "Usuário deve ter no máximo 30 caracteres"),

  categoria: z
    .string()
    .min(1, "Categoria é obrigatória")
    .max(10, "Categoria deve ter no máximo 10 caracteres"),

  cpf: z
    .string()
    .refine((val) => validateCPF(val), {
      message: "CPF inválido",
    })
});

type FormProps = z.infer<typeof schema>;

interface props {
  userCookieName?: string;
  userCookieVal?: string;
  userGamesCookieName?: string;
  userGamesCookieVal?: string;
}

export default function CreateAccountForm({...props}: props) {
  const [popupError, setPopupError] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null)
  const [load, setLoad] =  useState<boolean>(true)
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormProps>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormProps) {
    setRecaptchaError(null)
    setError(null)
    const token = RecaptchaForm(setRecaptchaError);
    if (token == '') {
     return
    }
    setLoad(true)
    const res = await CreateAccount({
      user: data.usuario,
      cpf: data.cpf,
      category: data.categoria,
      token: token
    })
   
    if (res == 201) {
      router.push('/')
      return
    }
    if (res == "conta já criada") {
      router.push('/account')
      return
    }
    if (res == "cpf já cadastrado") {
      setLoad(false)
      setError(res)
      return
    }
    if (res == "usuário já cadastrado") {
      setLoad(false)
      setError(res)
      return
    }
    if (res == "recaptcha inválido") {
      setLoad(false)
      setRecaptchaError('preencha o recaptcha novamente');
      //@ts-ignore
      window.grecaptcha.reset();
      return
    }
    if (res == "usuário criado porém não foi possível criar uma sessão") {
      router.push("/account")
      return
    }
    if (res == 401) {
      window.location.href = quikworkoutPath+'/auth/entrar'
      return
    }
    setLoad(false)
    setPopupError(true)
    return
  }

  useEffect(() => {
    console.log(quikworkoutPath)
    if (props.userCookieName == undefined || props.userCookieVal == undefined) {
      window.location.href = quikworkoutPath+'/auth/entrar'
      return
    }
    if (props.userGamesCookieName && props.userGamesCookieVal) {
      router.push('/')
      return
    }
    setLoad(false)
  }, [])

  return (
    <>
    {load && <SpinLoading />}
    <div className={`${styles.container} ${load && styles.lowOpacity}`}>
      <Menu />
      {popupError && <PopupError handleOut={() => setPopupError(false)} />}
      <main className={styles.main} id="main">
        <h1 className={styles.title}>Cadastro de Usuário</h1>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <label>
            Usuário
            <input type="text" {...register("usuario")} placeholder="Digite o nome" />
            {errors.usuario && <p className={styles.error}>{errors.usuario.message}</p>}
          </label>

          <label>
            Categoria
            <select {...register("categoria")}>
              <option value="">Selecione</option>
              <option value="rx">Rx</option>
              <option value="scalled">Scalled</option>
              <option value="iniciante">Iniciante</option>
            </select>
            {errors.categoria && <p className={styles.error}>{errors.categoria.message}</p>}
          </label>

          <label>
            CPF
            <input type="text" {...register("cpf")} placeholder="000.000.000-00" />
            {errors.cpf && <p className={styles.error}>{errors.cpf.message}</p>}
          </label>

          {error && <p className={styles.error} style={{paddingTop: "0px"}}>{error}</p>}
          {recaptchaError && <p className={styles.error} style={{paddingTop: "0px"}}>{recaptchaError}</p>}
          <Recaptcha className={styles.recaptcha}/>
          <button type="submit">Cadastrar</button>
        </form>
      </main>
    </div>
    </>
  );
}

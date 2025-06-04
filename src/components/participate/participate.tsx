"use client"

import { z } from "zod";
import Menu from "../menu/menu";
import styles from "./participate.module.css"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import EnterAccount from "@/api/user/enterAccount";
import { deleteCookie } from "@/action/deleteCookie";
import { quikworkoutPath } from "@/api/quikworkoutPath";
import { useRouter } from "next/navigation";
import SpinLoading from "../spinLoading/spinLoading";
import GetEdition, { GetEditionResponse } from "@/api/edition/getEdition";
import CreateParticipant from "@/api/participant/createParticipant";
import HasTicket from "@/api/participant/hasTicket";
import Link from "next/link";
import PopupError from "../popupError/popupError";
import GetParticipations from "@/api/user/getParticipations";

interface props {
  userCookieName?: string;
  userCookieVal?: string;
  userGamesCookieName?: string;
  userGamesCookieVal?: string;
  ticketLink?: string;
}

const schema = z.object({
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(30, "Título deve ter no máximo 30 caracteres"),
  instagram: z
    .string()
    .min(1, "Instagram é obrigatório")
    .max(30, "Instagram deve ter no máximo 30 caracteres"),
  video: z
    .custom<FileList>((file) => file instanceof FileList && file[0].size > 0 && file.length == 1, {
      message: "É necessário enviar um vídeo",
    })
    .refine(file =>
      ["video/mp4", "video/webm", "video/ogg"].includes(file[0].type),
      { message: "Apenas vídeos MP4, WebM ou Ogg são permitidos" }
    ),
});

type FormProps = z.infer<typeof schema>;

export default function Participate({...props}: props) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormProps>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
  });
  const [cookie, setCookie] = useState<boolean>(false)
  const [loaded, setLoaded] = useState<number>(0)
  const [load, setLoad] = useState<boolean>(true)
  const [getEditionResponse, setGetEditionResponse] = useState<GetEditionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<"processing payment" | "no ticket found" | null>()
  const [apiError, setApiError] = useState<boolean>(false)
  const [popupError, setPopupError] = useState<boolean>(false)
  const [form, setForm] = useState<string | null>(null)
  const divRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function enterAccount() {
    const res = await EnterAccount()
    if(res == 200) {
      setCookie(true)
      return
    }
    if(res == 401) {
      await deleteCookie("userProfile")
      window.location.href = quikworkoutPath+'/auth/entrar'
      return
    }
    if(res == "usuário não encontrado") {
      router.push("/auth/criar-conta")
      return
    }
    if(res == "não foi possível criar uma sessão" || res == "error" || res == 500) {
      setApiError(true)
      setLoad(false)
      return
    }
  }

  function isPastDate(dateString: string) {
    const targetDate = new Date(dateString + "T23:59:59");
    const now = new Date();
    return now > targetDate;
  }

  useEffect(() => {
    if (!props.userGamesCookieName || !props.userGamesCookieVal) {
      if (props.userCookieName && props.userCookieVal) {
        enterAccount()
        return
      } else {
        window.location.href = quikworkoutPath+'/auth/entrar'
        return
      }
    }
    setCookie(true)
  }, [])

  useEffect(() => {
    if(cookie) {
      (async function() {
        const res = await GetEdition({
          limit: 1
        })
        if(res && typeof res == "object" && res.length > 0) {
          setGetEditionResponse(res)
          if(isPastDate(res[0].closing_date)) {
            router.push("/")
            return
          }
        }
        if (res == 404) {
          router.push("/")
          return
        }
        if (res == 500 || res == "error") {
          setApiError(true)
          setLoaded((l) => l+1)
          return
        }
        setLoaded((l) => l+1)
      }());
      (async function() {
        const res = await HasTicket()
        if (res == 200) {
          setLoaded((l) => l+1)
          return
        }
        if (res == 401) {
          await deleteCookie("userGames")
          enterAccount()
          window.location.reload()
          return
        }
        if (res == 404) {
          setMessage("no ticket found")
          setLoaded((l) => l+1)
          return
        }
        if (res == "payment is still being processed, please wait a few minutes and try again") {
          setMessage("processing payment")
          setLoaded((l) => l+1)
          return
        }
        if (res == 500 || res == "error" || res == "unknown payment status") {
          setApiError(true)
          setLoaded((l) => l+1)
          return
        }
      }())
    }
  }, [cookie])

  useEffect(() => {
    if(getEditionResponse && typeof getEditionResponse == "object") {
      (async function(){
        const res = await GetParticipations({
          width: 350,
          limit: 1,
        })
        if (res && typeof res == "object") {
          if((res.participations[0].edition == getEditionResponse[0].number) && (res.participations[0].sent)) {
            router.push("/conta/minha-conta")
            return
          }
        }
        if(res == 401) {
          await deleteCookie("userGames")
          enterAccount()
          window.location.reload()
          return
        }
        if (res == 500) {
          setApiError(true)
          setLoaded((l) => l+1)
          return
        }
        setLoaded((l) => l+1)
      }())
    }
  }, [getEditionResponse])

  useEffect(() => {
    if(loaded == 3) {
      setLoad(false)
    }
  }, [loaded])

  useEffect(() => {
    if(form) {
      if(divRef.current && formRef.current) {
        divRef.current.innerHTML += form
        const formEl = divRef.current.querySelector("form")
        if(formEl) {
          const newInputfile = formRef.current.querySelector("#file")
          const inputs = divRef.current.querySelectorAll("input")
          let oldInputFile: HTMLInputElement | null = null;
          let submit: HTMLInputElement | null = null
          inputs.forEach((i) => {
            if (i.type == "file") {
              oldInputFile = i
            }
            if (i.type == "submit") {
              submit = i
            }
          })
  
          if (oldInputFile !== null && submit !== null && newInputfile instanceof HTMLInputElement) {
            oldInputFile = oldInputFile as HTMLInputElement
            submit = submit as HTMLInputElement
            newInputfile.id = oldInputFile.id
            newInputfile.name = oldInputFile.name
            oldInputFile.remove()
            formEl.appendChild(newInputfile)
            submit.click()
            return
          }
        }
      }
      setLoad(false)
      setPopupError(true)
    }
  }, [form])


  async function onSubmit(data: FormProps) {
    setError(null)
    setLoad(true)
    const res = await CreateParticipant({
      Title: data.title,
      instagram: data.instagram,
      size: data.video[0].size
    })
    if (typeof res == "object") {
      setForm(res.form)
      return
    }
    if (res == 401) {
      await deleteCookie("userGames")
      enterAccount()
      window.location.reload()
      return
    }
    if (res == 404 || res == "no edition found") {
      setError("edição não encontrada")
      return
    }
    if (res == "is not possible to register") {
      setError("o tempo para inscrição já passou")
      setLoad(false)
      return
    }
    if (res == "user is already in edition") {
      router.push("/conta/minha-conta")
      return
    }
    if (res == 500 || res == "error") {
      setPopupError(true)
      setLoad(false)
      return
    }
  }

  return (
    <div className={styles.container}>
      {popupError && <PopupError handleOut={() => setPopupError(false)} />}
      {load && <SpinLoading />}
      <Menu />
      <main className={`${styles.main} ${load && styles.lowOpacity}`} id="main">
      {!apiError ?
        <>
        {getEditionResponse && typeof getEditionResponse == "object" && getEditionResponse.length > 0 ? <h1 className={styles.title}>Participar {getEditionResponse[0].number}ª edição</h1> : <h1 className={styles.title}>Participar</h1>}
        {(!message || load) ? 
          <>
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} ref={formRef}>
            <h2>Regulamento</h2>
            <div className={styles.regulation} >
              {getEditionResponse && typeof getEditionResponse == "object" && getEditionResponse.length > 0 && 
                <div dangerouslySetInnerHTML={{ __html: getEditionResponse[0].rules }}></div>
              }
            </div>
            <label>
              Títutlo
              <input type="text" {...register("title")} placeholder="Digite o título do vídeo" />
              {errors.title && <p className={styles.error}>{errors.title.message}</p>}
            </label>
            <label>
              Instagram
              <input type="text" {...register("instagram")} placeholder="Digite o instagram" />
              {errors.instagram && <p className={styles.error}>{errors.instagram.message}</p>}
            </label>
            <label>
              Vídeo
              <input type="file" id="file" {...register("video")} className={styles.inputFile}/>
              {errors.video && <p className={`${styles.error} ${styles.errorVideo}`}>{errors.video.message}</p>}
            </label>
            {error && <p className={`${styles.error} ${styles.errorVideo}`}>{error}</p>}
            <button type="submit" disabled={load}>Participar</button>
          </form>
          {form && <div className={styles.vimeoForm} ref={divRef}/>}
          </>
        :
        <div className={styles.ticketInfo}>
          { 
          message == "processing payment" ? <p>Parece que o pagamento do seu tíquete esta sendo processado, aguarde alguns minutos e tente novamente</p> : <p>Parece que você não possui um tíquete <Link href={props.ticketLink ? props.ticketLink : ""}>clique aqui para comprar</Link></p>
          }
        </div>
        }
        </>
      :
      <div className={styles.pageError}>
        <p>Parece que houve um erro, tente recarregar a página</p>
      </div>
      }
      </main>
    </div>
  )
}
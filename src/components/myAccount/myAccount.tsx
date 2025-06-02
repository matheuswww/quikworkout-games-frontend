"use client"

import styles from "./myAccount.module.css"
import Menu from "../menu/menu";
import Image from 'next/image';
import React, { useCallback, useEffect, useState } from "react";
import GetAccount, { GetAccountResponse } from "@/api/user/getAccount";
import { deleteCookie } from "@/action/deleteCookie";
import SkeletonImage from "../skeletonImage/skeletonImage";
import GetParticipations, { GetParticipationsResponse } from "@/api/user/getParticipations";
import EnterAccount from "@/api/user/enterAccount";
import { quikworkoutPath } from "@/api/quikworkoutPath";
import { useRouter } from "next/navigation";
import VideoThumb from "@/app/video/videoThumb";
import GetEdition, { GetEditionResponse } from "@/api/edition/getEdition";
import Link from "next/link";

interface props {
  userCookieName?: string;
  userCookieVal?: string;
  userGamesCookieName?: string;
  userGamesCookieVal?: string;
}

export default function MyAccountPage({...props}: props) {
  const router = useRouter()
  const [getUserResponse, setGetUserResponse] = useState<GetAccountResponse | null>(null)
  const [getParticipationsResponse, setGetParticipationsResponse] = useState<GetParticipationsResponse | null>(null)
  const [getEditionResponse, setGetEditionResponse] = useState<GetEditionResponse | null>(null)
  const [cookie, setCookie] = useState<boolean>(false)
  const [loadMore, setLoadMore] = useState<boolean>(false)
  const [load, setLoad] = useState<boolean>(false)

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
      setGetUserResponse("error")
      setGetParticipationsResponse("error")
      return
    }
  }

  const onscroll = useCallback(() => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;
    if (scrollPosition >= pageHeight - 100) {
      setLoadMore(true);
    }
  }, [])

  
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
    if (cookie) {
      (async function() {
        const res = await GetAccount()
        if(res == 401) {
          await deleteCookie("userGames")
          enterAccount()
          window.location.reload()
          return
        }
        setGetUserResponse(res)
      }());
      (async function() {
        const res = await GetParticipations({
          width: 350,
          autoplay: true,
          muted: true,
          background: true
        })
        if(res == 401) {
          await deleteCookie("userGames")
          enterAccount()
          window.location.reload()
          return
        }
        setGetParticipationsResponse(res)
        window.addEventListener('scroll', onscroll);
        if (document.documentElement.scrollHeight <= window.innerHeight && res && typeof res == "object") {
          setLoadMore(true);
        }
      }());
      (async function() {
        const res = await GetEdition()
        setGetEditionResponse(res)
      }())
    }
  }, [cookie])
  
  useEffect(() => {
    async function more(cursor: string) {
        if (loadMore && !load) {
        setLoad(true)
        const res = await GetParticipations({
          cursor: cursor,
          width: 350,
          autoplay: true,
          muted: true,
          background: true
        })
        if(res == 401) {
          await deleteCookie("userGames")
          enterAccount()
          window.location.reload()
          return
        }
        if(res == "error" || res == 500) {
          setLoad(false)
          setGetParticipationsResponse("error")
          return
        }
        if(res == 404) {
          window.removeEventListener('scroll', onscroll);
          setLoad(false)
          setLoadMore(false)
          return
        }
     
        setGetParticipationsResponse(prev => {
          if (prev && typeof prev == "object") {
            return {
              participations: [...prev.participations, ...res.participations],
              user: prev.user
            }
          }
          return res
        })
        
        setLoad(false)
        setLoadMore(false)
        if (document.documentElement.scrollHeight <= window.innerHeight) {
          more(res.participations[res.participations.length - 1].createdAt);
        }
      }
    }
    if (getParticipationsResponse && typeof getParticipationsResponse == "object") {
      more(getParticipationsResponse.participations[getParticipationsResponse.participations.length - 1].createdAt);
    }
  }, [loadMore])

  return (
    <div className={styles.container}>
      <Menu />
      <main className={`${styles.main}`} id="main">
        <h1 className={styles.title}>Minha Conta</h1>
        {(getUserResponse && typeof getUserResponse == "object") ?
          <section className={styles.profile}>
          <div className={styles.userImage}><SkeletonImage src={getUserResponse.photo ? getUserResponse.photo : "/img/avatar.png"} alt="imagem do usuário" width={100} height={100} className={styles.avatar} skeletonClassName={styles.avatarSkeleton}/></div>
          <div className={styles.userInfo}>
            <div className={`${styles.userField} ${styles.userNameField}`}><span className={styles.field}>Nome:</span>{getUserResponse.name}</div>
            <div className={styles.userField}><span className={styles.field}>Categoria:</span>{getUserResponse.category}</div>
            <div className={`${styles.userField} ${styles.userUserField}`}><span className={styles.field}>User:</span>{getUserResponse.user}</div>
          </div>
          <div className={styles.earnings}>Ganhos: <span className={getUserResponse.earnings > 0 ? styles.green : styles.yellow}>R${getUserResponse.earnings}</span></div>
          </section>
        : !getUserResponse ? <section className={styles.profile} aria-label="carregando perfil" tabIndex={0}>
          <div className={styles.userImgSkeleton}></div>
          <div className={styles.infosSkeleton}>
            <div className={styles.userInfosSkeleton}></div>
            <div className={styles.userInfosSkeleton}></div>
            <div className={styles.userInfosSkeleton}></div>
          </div>
          <div className={styles.userInfosSkeleton}></div>
        </section>
        : <p>Parece que houve um erro, tente recarregar a página</p>
      }

        {getEditionResponse == null ? 
        <div className={styles.linkLoad}>
          <span></span>
        </div>
        : (getEditionResponse && typeof getEditionResponse == "object" && getEditionResponse.length > 0) && 
        !isPastDate(getEditionResponse[0].closing_date) && 
        <Link href={"/participar"} className={styles.link} aria-label="carregando link" tabIndex={0}>Participar {getEditionResponse[0].number}ª edição</Link> }

        <h2 className={styles.h2}>Edições participadas</h2>

        {(getParticipationsResponse && typeof getParticipationsResponse == "object") ? <div className={styles.editions}>
          {getParticipationsResponse.participations.map((participation) => (
            <React.Fragment key={participation.edition}>
              <div className={styles.card}>
              <h3 className={styles.titleCard}>Edição - {participation.edition}</h3>
              
              <VideoThumb video={participation.video} thumbnail={participation.thumbnail_url} width={350} />

              <div className={styles.videoInfo}>
                <div className={styles.videoUserImage}>
                <SkeletonImage src={getParticipationsResponse.user.photo ? getParticipationsResponse.user.photo : "/img/avatar.png"} alt={getParticipationsResponse.user.name} width={40} height={40} className={styles.avatarVideo} skeletonClassName={styles.avatarVideoSkeleton} />
                </div>
                <div className={styles.userContent}>
                  <p className={styles.videoTitle}>{participation.title}</p>
                  <p className={styles.userName}>{getParticipationsResponse.user.user}</p>
                </div>
                {participation.user_time && <>
                  <p className={styles.user_time}>{participation.user_time}</p>
                  <Image src="/img/timer.png" alt="ícone de cronômetro" width={20} height={20} />
                </>}
              </div>
              <div className={styles.footer}>
                {participation.placing && <p className={styles.placement}>Colocação: {participation.placing}º lugar</p>}
                {participation.gain && <p className={styles.gains}>Ganho: <span className={10 > 0 ? styles.green : styles.yellow}>R${participation.gain}</span></p>}
                {!participation.checked && <p className={styles.analisy}>Vídeo em análise <br /> Estamos verificando o conteúdo do seu vídeo</p>}
              </div>
            </div>
            </React.Fragment>
          ))}
        </div> 
        : !getParticipationsResponse ?
        <div className={styles.editions} aria-label="carregando edições" tabIndex={0}>
          {
            [0,1,2].map(() => {
              return (
                <div className={styles.card} key={Math.random()}>
                  <h3 className={styles.titleCardSkeleton}></h3>
                  <div></div>
                  <div className={styles.videoInfoLoad}>
                    <div className={styles.videoUserImageSkeleton}>         
                    </div>
                    <div className={styles.userContentSkeleton}>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <div className={styles.footer}>
              
                  </div>
                </div>
              )
            })
          }
        </div>
       : 
        getParticipationsResponse == 404 ? 
        <p>Você ainda não participou de nenhuma edição</p> : 
        <p>Parece que houve um erro, tente recarregar a página</p>
        }
        <span></span>
      </main>
    </div>
  );
}
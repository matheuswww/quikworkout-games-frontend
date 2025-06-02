import { useRef, useState, useEffect } from "react"
import styles from "./videoThumb.module.css"
import Image from "next/image"
import Player from '@vimeo/player'

interface Props {
  video: string | null
  thumbnail: string | null
  width: number
}

export default function VideoThumb({ video, thumbnail, width }: Props) {
  const iframeContainerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const imgLoadRef = useRef<HTMLDivElement | null>(null)
  const [hovered, setHovered] = useState(false)
  const [videoLoad, setVideoLoad] = useState(true)
  const [iframeLoad, setIframeLoad] = useState<boolean | null>(null)
  const [imgLoad, setImgLoad] = useState(true)

  useEffect(() => {
    if (video && iframeContainerRef.current && iframeLoad == true && imgRef.current) {
      iframeContainerRef.current.innerHTML = video
      const iframe = iframeContainerRef.current.querySelector("iframe")
      if (iframe) {
        iframeContainerRef.current.style.width = width+"px"
        imgRef.current.style.width = width+"px"
        iframe.classList.add(styles.iframe)
        playerRef.current = new Player(iframe)
        playerRef.current.on('bufferstart', () => {
          setVideoLoad(true)
        })
        playerRef.current.on('bufferend', () => {
          setVideoLoad(false)
          if (!hovered) {
            playerRef.current?.pause()
          }
        })
      }
    }
  }, [iframeLoad])

  useEffect(() => {
    if (!imgLoad) {
      setTimeout(() => {
        if(imgLoadRef.current) {
          imgLoadRef.current.style.display = "none"
        }
      }, 500);
    }
  }, [imgLoad])

  function handleMouseEnter() {
    if (iframeLoad == null) {
      setHovered(true)
      if(iframeLoad == null) {
        setIframeLoad(true)
      }
      return
    }
    setHovered(true)
    playerRef.current?.play()
  }

  function handleMouseLeave() {
    if(videoLoad) {
      setHovered(false)
      return
    }
    setHovered(false)
    playerRef.current?.pause()
  }

  return (
    video && thumbnail && (
      <div
        className={styles.container}
        style={{ width: `${width}px` }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={iframeContainerRef} className={styles.iframeWrapper} />
        <Image
          onLoad={() => setImgLoad(false)}
          src={thumbnail}
          alt="Video thumbnail"
          fill
          sizes="100vw"
          style={{ objectFit: "cover", border: "0px" }}
          className={`${styles.thumbnail} ${(hovered && !videoLoad) ? styles.hide : ""}`}
          ref={imgRef}
        />
        {videoLoad && hovered &&
        <div className={styles.ldsRing} aria-label="carregando" tabIndex={0}>
          <div aria-hidden="true"></div>
          <div aria-hidden="true"></div>
          <div aria-hidden="true"></div>
          <div aria-hidden="true"></div>
        </div>}
        {<div ref={imgLoadRef} className={`${styles.loading} ${!imgLoad && styles.hide}`} aria-label="carregando" tabIndex={0}></div>}
      </div>
    )
  )
}

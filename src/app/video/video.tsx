"use client"

interface props {
  video: string
}

export default function Video({video}: props) {
  return (
    <div dangerouslySetInnerHTML={{ __html: video }}>

    </div>
  )
}
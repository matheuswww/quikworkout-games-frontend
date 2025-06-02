import { useState, useEffect, useRef } from "react"
import styles from "./menu.module.css"

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false)
  const asideRef = useRef<HTMLElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  function onClick(event: Event) {
    if (asideRef.current && event.target instanceof HTMLElement && !asideRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target) && isOpen) {
      window.removeEventListener("click", onClick)
      setIsOpen(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("click", onClick)
    } else {
      window.removeEventListener("click", onClick)
    }

    const main = document.getElementById('main')
    if (main instanceof HTMLElement) {
      if (isOpen) {
        main.style.pointerEvents = 'none'
        main.style.opacity = '.1'
      } else {
        main.style.pointerEvents = 'auto'
        main.style.opacity = '1'
      }
    }

  }, [isOpen])
  
  return (
    <>
      <button className={styles.toggleButton} onClick={(() => setIsOpen(!isOpen))} ref={buttonRef} aria-label="Menu">
        {isOpen ? "Fechar" : "Abrir"} Menu
      </button>

      <aside ref={asideRef} className={`${styles.sidebar} ${!isOpen ? styles.closed : ""}`}>
        <h2 className={styles.logo}>Quikworkout Games</h2>
        <nav>
          <ul>
            <li>Home</li>
            <li>Minha Conta</li>
            <li>Edições</li>
            <li>Participar</li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

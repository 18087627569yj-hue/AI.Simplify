const screens = [
  '../../assets/projects/resume-notes/screens/01-home.png',
  '../../assets/projects/resume-notes/screens/02-input.png',
  '../../assets/projects/resume-notes/screens/03-diagnosis.png',
  '../../assets/projects/resume-notes/screens/04-compare.png',
  '../../assets/projects/resume-notes/screens/05-compare-detail.png',
  '../../assets/projects/resume-notes/screens/06-export.png',
]
const dialog = document.querySelector('.lightbox')
const dialogImage = dialog?.querySelector('img')
const count = dialog?.querySelector('.lightbox-count')
let current = 0

const showScreen = index => {
  current = (index + screens.length) % screens.length
  if (dialogImage) {
    dialogImage.src = screens[current]
    dialogImage.alt = `稿定简历产品界面 ${String(current + 1).padStart(2, '0')}`
  }
  if (count) count.textContent = `${String(current + 1).padStart(2, '0')} / ${screens.length}`
}

document.querySelectorAll('[data-index]').forEach(button => {
  button.addEventListener('click', () => {
    showScreen(Number(button.dataset.index))
    dialog?.showModal()
    updateArchivePlayback()
  })
})

dialog?.querySelector('.lightbox-close')?.addEventListener('click', () => dialog.close())
dialog?.querySelector('.lightbox-prev')?.addEventListener('click', () => showScreen(current - 1))
dialog?.querySelector('.lightbox-next')?.addEventListener('click', () => showScreen(current + 1))
dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
dialog?.addEventListener('close', () => updateArchivePlayback())
document.addEventListener('keydown', event => {
  if (!dialog?.open) return
  if (event.key === 'ArrowLeft') showScreen(current - 1)
  if (event.key === 'ArrowRight') showScreen(current + 1)
})
const archiveCarousel = document.querySelector('.archive-carousel')
const archiveTrack = archiveCarousel?.querySelector('.screen-gallery')
const archiveSlides = Array.from(archiveTrack?.querySelectorAll('figure') || [])
const archiveStatusNumber = archiveCarousel?.querySelector('.archive-status strong')
const archiveStatusLabel = archiveCarousel?.querySelector('.archive-status em')
const archiveToggle = archiveCarousel?.querySelector('.archive-toggle')
const archiveTimerBar = archiveCarousel?.querySelector('.archive-timer span')
const archiveDelay = 2000
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
let archiveIndex = 0
let archiveTimeout = 0
let archiveVisible = false
let archiveUserPaused = reduceMotion.matches

const archiveLabel = slide => (slide?.querySelector('figcaption')?.textContent || '').replace(/^\d+\s*·\s*/, '')

const restartArchiveTimer = () => {
  if (!archiveTimerBar) return
  archiveTimerBar.style.animation = 'none'
  void archiveTimerBar.offsetWidth
  archiveTimerBar.style.animation = `archiveCountdown ${archiveDelay}ms linear forwards`
}

const archiveShouldPlay = () => archiveVisible && !archiveUserPaused && !document.hidden && !dialog?.open

function updateArchivePlayback() {
  window.clearTimeout(archiveTimeout)
  const playing = archiveShouldPlay()
  archiveCarousel?.classList.toggle('is-paused', !playing)
  archiveToggle?.setAttribute('aria-pressed', String(archiveUserPaused))
  if (archiveToggle) {
    archiveToggle.textContent = archiveUserPaused ? '播放' : '暂停'
    archiveToggle.setAttribute('aria-label', archiveUserPaused ? '开始自动轮播' : '暂停自动轮播')
  }
  if (!playing) return
  restartArchiveTimer()
  archiveTimeout = window.setTimeout(() => setArchiveIndex(archiveIndex + 1), archiveDelay)
}

function setArchiveIndex(index, restart = true) {
  if (!archiveSlides.length) return
  archiveIndex = (index + archiveSlides.length) % archiveSlides.length
  archiveTrack?.style.setProperty('--archive-index', archiveIndex)
  archiveSlides.forEach((slide, slideIndex) => {
    const active = slideIndex === archiveIndex
    slide.classList.toggle('is-active', active)
    slide.setAttribute('aria-hidden', String(!active))
    slide.querySelector('button')?.setAttribute('tabindex', active ? '0' : '-1')
  })
  if (archiveStatusNumber) archiveStatusNumber.textContent = String(archiveIndex + 1).padStart(2, '0')
  if (archiveStatusLabel) archiveStatusLabel.textContent = archiveLabel(archiveSlides[archiveIndex])
  if (restart) updateArchivePlayback()
}

archiveCarousel?.querySelector('.archive-prev')?.addEventListener('click', () => setArchiveIndex(archiveIndex - 1))
archiveCarousel?.querySelector('.archive-next')?.addEventListener('click', () => setArchiveIndex(archiveIndex + 1))
archiveToggle?.addEventListener('click', () => {
  archiveUserPaused = !archiveUserPaused
  updateArchivePlayback()
})

archiveCarousel?.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    setArchiveIndex(archiveIndex - 1)
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    setArchiveIndex(archiveIndex + 1)
  }
  if (event.key === ' ') {
    event.preventDefault()
    archiveUserPaused = !archiveUserPaused
    updateArchivePlayback()
  }
})

if (archiveCarousel) {
  const archiveObserver = new IntersectionObserver(entries => {
    archiveVisible = entries[0]?.isIntersecting || false
    updateArchivePlayback()
  }, { threshold: 0.35 })
  archiveObserver.observe(archiveCarousel)
  setArchiveIndex(0, false)
}

document.addEventListener('visibilitychange', updateArchivePlayback)
reduceMotion.addEventListener?.('change', event => {
  archiveUserPaused = event.matches
  updateArchivePlayback()
})

const revealItems = document.querySelectorAll('.case-cover, .case-facts, .story-block, .story-figure, .archive-carousel, .project-pager')
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return
    entry.target.classList.add('is-visible')
    revealObserver.unobserve(entry.target)
  })
}, { rootMargin: '0px 0px -10%', threshold: 0.08 })

revealItems.forEach(item => {
  item.classList.add('case-reveal')
  revealObserver.observe(item)
})

const progressBar = document.querySelector('.case-progress span')
const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0
  progressBar?.style.setProperty('--case-progress', progress)
}

updateProgress()
window.addEventListener('scroll', updateProgress, { passive: true })

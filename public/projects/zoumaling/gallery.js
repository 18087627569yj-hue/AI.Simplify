const screens = Array.from({ length: 24 }, (_, index) => `/assets/projects/zoumaling/screens/${String(index + 1).padStart(2, '0')}.jpg`)
const dialog = document.querySelector('.lightbox')
const dialogImage = dialog?.querySelector('img')
const count = dialog?.querySelector('.lightbox-count')
let current = 0

const showScreen = index => {
  current = (index + screens.length) % screens.length
  if (dialogImage) {
    dialogImage.src = screens[current]
    dialogImage.alt = `走马岭系统界面 ${String(current + 1).padStart(2, '0')}`
  }
  if (count) count.textContent = `${String(current + 1).padStart(2, '0')} / ${screens.length}`
}

document.querySelectorAll('.screen-gallery button').forEach(button => {
  button.addEventListener('click', () => {
    showScreen(Number(button.dataset.index))
    dialog?.showModal()
  })
})

dialog?.querySelector('.lightbox-close')?.addEventListener('click', () => dialog.close())
dialog?.querySelector('.lightbox-prev')?.addEventListener('click', () => showScreen(current - 1))
dialog?.querySelector('.lightbox-next')?.addEventListener('click', () => showScreen(current + 1))
dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
document.addEventListener('keydown', event => {
  if (!dialog?.open) return
  if (event.key === 'ArrowLeft') showScreen(current - 1)
  if (event.key === 'ArrowRight') showScreen(current + 1)
})
const siteLink = document.querySelector('.site-link')
if (siteLink) {
  const projectUrl = new URL(window.location.href)
  projectUrl.port = '5174'
  projectUrl.pathname = '/'
  projectUrl.search = ''
  projectUrl.hash = ''
  siteLink.href = projectUrl.href
}

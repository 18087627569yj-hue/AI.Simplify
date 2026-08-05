const menuButton = document.querySelector('.menu-button')
const nav = document.querySelector('.nav')

menuButton?.addEventListener('click', () => {
  const isOpen = nav?.classList.toggle('is-open') ?? false
  menuButton.setAttribute('aria-expanded', String(isOpen))
})

nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('is-open')
  menuButton?.setAttribute('aria-expanded', 'false')
}))

const observer = new IntersectionObserver(
  entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible')),
  { threshold: 0.12 },
)

document.querySelectorAll('.reveal').forEach(element => observer.observe(element))

const heroSocials = document.querySelector('.hero-socials')
const contactPopover = heroSocials?.querySelector('.contact-popover')
const contactLabel = contactPopover?.querySelector('.contact-popover-label')
const contactValue = contactPopover?.querySelector('.contact-popover-value')
const copyContact = contactPopover?.querySelector('.copy-contact')
let selectedContact = ''

const closeContactPopover = () => {
  if (contactPopover) contactPopover.hidden = true
  heroSocials?.querySelectorAll('.contact-trigger').forEach(button => button.setAttribute('aria-expanded', 'false'))
}

heroSocials?.querySelectorAll('.contact-trigger').forEach(button => {
  button.addEventListener('click', event => {
    event.stopPropagation()
    const value = button.dataset.contactValue ?? ''
    const isCurrentAndOpen = selectedContact === value && contactPopover && !contactPopover.hidden
    closeContactPopover()
    if (isCurrentAndOpen || !contactPopover) return
    selectedContact = value
    if (contactLabel) contactLabel.textContent = button.dataset.contactLabel ?? '联系方式'
    if (contactValue) contactValue.textContent = value
    if (copyContact) copyContact.textContent = '复制'
    contactPopover.hidden = false
    button.setAttribute('aria-expanded', 'true')
  })
})

copyContact?.addEventListener('click', async event => {
  event.stopPropagation()
  try {
    await navigator.clipboard.writeText(selectedContact)
    copyContact.textContent = '已复制'
  } catch {
    const input = document.createElement('textarea')
    input.value = selectedContact
    document.body.append(input)
    input.select()
    document.execCommand('copy')
    input.remove()
    copyContact.textContent = '已复制'
  }
})

document.addEventListener('click', event => {
  if (!heroSocials?.contains(event.target)) closeContactPopover()
})

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeContactPopover()
})

const form = document.querySelector('.contact-form')
form?.addEventListener('submit', event => {
  event.preventDefault()
  const notice = form.querySelector('.form-notice')
  if (notice) notice.hidden = false
})

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

const navLinks = [...(nav?.querySelectorAll('a[href^="#"]') ?? [])]
const navTargets = navLinks.map(link => {
  const hash = link.getAttribute('href')
  const element = hash === '#top' ? document.querySelector('.hero') : document.querySelector(hash)
  return { link, element }
}).filter(item => item.element)

const navObserver = new IntersectionObserver(entries => {
  const visibleEntry = entries
    .filter(entry => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
  if (!visibleEntry) return
  navTargets.forEach(({ link, element }) => link.classList.toggle('is-active', element === visibleEntry.target))
}, { rootMargin: '-28% 0px -58%', threshold: [0, 0.15, 0.5] })

navTargets.forEach(({ element }) => navObserver.observe(element))

const observer = new IntersectionObserver(
  entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible')),
  { threshold: 0.12 },
)

document.querySelectorAll('.reveal').forEach(element => observer.observe(element))

const projectFolders = [...document.querySelectorAll('.project-folder')]
let projectFolderFrame = 0

const updateProjectFolders = () => {
  projectFolderFrame = 0
  if (!projectFolders.length) return
  const stickyTop = window.innerWidth <= 700 ? window.innerHeight * 0.45 : 86
  let activeIndex = 0
  projectFolders.forEach((folder, index) => {
    if (folder.getBoundingClientRect().top <= stickyTop) activeIndex = index
  })
  projectFolders.forEach((folder, index) => folder.classList.toggle('is-current', index === activeIndex))
}

const requestProjectFolderUpdate = () => {
  if (projectFolderFrame) return
  projectFolderFrame = window.requestAnimationFrame(updateProjectFolders)
}

updateProjectFolders()
window.addEventListener('scroll', requestProjectFolderUpdate, { passive: true })
window.addEventListener('resize', requestProjectFolderUpdate)

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

const siteShell = document.querySelector('.site-shell')
const resumeModal = document.querySelector('.resume-modal')
const resumeCloseButton = resumeModal?.querySelector('.resume-close')
const resumePage = resumeModal?.querySelector('.resume-page')
let resumeReturnFocus = null

const closeResumeModal = () => {
  if (!resumeModal || resumeModal.hidden) return
  resumeModal.hidden = true
  document.body.classList.remove('resume-modal-open')
  if (siteShell) siteShell.inert = false
  resumeReturnFocus?.focus()
}

const openResumeModal = trigger => {
  if (!resumeModal) return
  resumeReturnFocus = trigger
  nav?.classList.remove('is-open')
  menuButton?.setAttribute('aria-expanded', 'false')
  closeContactPopover()
  resumeModal.hidden = false
  document.body.classList.add('resume-modal-open')
  if (siteShell) siteShell.inert = true
  resumeCloseButton?.focus()
}

document.querySelectorAll('.resume-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => openResumeModal(trigger))
})

resumeModal?.querySelectorAll('[data-resume-close]').forEach(element => {
  element.addEventListener('click', closeResumeModal)
})

resumePage?.addEventListener('contextmenu', event => event.preventDefault())

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeResumeModal()
})

const assetRoot = window.location.protocol === 'file:' ? './public/assets' : '/assets'

const galleryData = {
  community: {
    eyebrow: 'COMMUNITY OPERATIONS',
    title: 'AI 学习社群运营',
    mode: 'phone',
    items: [
      { src: `${assetRoot}/projects/community/group-01.jpg`, title: 'AI.Simplify 学习分享群 1', meta: '500 名成员' },
      { src: `${assetRoot}/projects/community/group-02.jpg`, title: 'AI.Simplify 学习分享群 2', meta: '499 名成员' },
      { src: `${assetRoot}/projects/community/group-03.jpg`, title: 'AI.Simplify 分享学习群 3', meta: '486 名成员' },
      { src: `${assetRoot}/projects/community/group-04.jpg`, title: 'AI.Simplify 学习分享群 4', meta: '456 名成员' },
      { src: `${assetRoot}/projects/community/group-05.jpg`, title: 'AI.Simplify 学习分享群 5', meta: '82 名成员' },
    ],
  },
  content: {
    eyebrow: 'CONTENT OPERATIONS',
    title: 'AI 内容运营成果',
    mode: 'phone',
    items: Array.from({ length: 12 }, (_, index) => {
      const number = String(index + 1).padStart(2, '0')
      const contentLabels = [
        { title: '小红书账号主页', meta: 'AI.Simplify 账号运营成果' },
        { title: '微信公众号账号界面', meta: '公众号内容运营' },
        { title: '抖音账号界面', meta: '短视频内容运营' },
      ]
      const xiaohongshuCaseNumber = String(index - 2).padStart(2, '0')
      return {
        src: `${assetRoot}/projects/content/content-${number}.jpg`,
        title: contentLabels[index]?.title ?? `小红书内容运营案例 ${xiaohongshuCaseNumber}`,
        meta: contentLabels[index]?.meta ?? '小红书笔记与内容成果',
      }
    }),
  },
  workflow: {
    eyebrow: 'AI WORKFLOW',
    title: '三个自定义 AI Skill',
    mode: 'workflow',
    items: [
      {
        type: 'workflow', kicker: '01 / ARTICLE GENERATOR', title: '文章生成 Skill',
        intro: '面向教程、方法论与产品解读等长文场景，从主题和资料出发建立完整叙事，而不是直接拼接一篇文案。',
        blocks: [
          { title: '适用场景', text: '深度教程、工具测评、产品分析、方法论总结和 AI＋建筑案例拆解。' },
          { title: '必要输入', text: '主题、目标读者、传播目标、文章篇幅、参考资料以及必须保留的核心观点。' },
          { title: '处理逻辑', text: '先提炼观点和读者问题，再搭建大纲、补充论据与案例，最后检查事实、语气和结构。' },
          { title: '最终输出', text: '标题方案、分层大纲、完整正文、摘要、金句和行动引导，可继续人工编辑。' },
        ],
        note: '人工介入点：判断选题价值、核实事实、补充个人经验，并对最终观点负责。',
      },
      {
        type: 'workflow', kicker: '02 / SOCIAL POST', title: '图文笔记文案 Skill',
        intro: '面向小红书图文发布场景，将图片内容、用户利益点和平台语感组合成简洁、可读、可直接发布的文案。',
        blocks: [
          { title: '适用场景', text: '作品展示、AI 工具教程、使用心得、案例拆解以及从图片出发的内容发布。' },
          { title: '必要输入', text: '待发布图片、内容主题、目标读者、核心关键词、期望语气与需要避免的表达。' },
          { title: '处理逻辑', text: '识别图片主题和信息层级，提炼对用户有价值的重点，再按平台的阅读节奏组织标题和正文。' },
          { title: '最终输出', text: '多个标题候选、精简正文、关键词与话题建议，并保留人工调整个人语气的空间。' },
        ],
        note: '人工介入点：确认图片与文字是否一致，删除套话，补充真实感受和具体经验。',
      },
      {
        type: 'workflow', kicker: '03 / PROMPT REVERSE', title: '图片提示词反推 Skill',
        intro: '从参考图中拆解可被生图模型理解的视觉语言，将“看起来像”转化为结构化、可调整的中文提示词。',
        blocks: [
          { title: '适用场景', text: '参考图复刻、风格研究、建筑效果图、海报视觉、人群行为分析图和系列配图生产。' },
          { title: '必要输入', text: '一张或多张参考图、目标生图工具、所需画面比例，以及希望保留或修改的视觉特征。' },
          { title: '处理逻辑', text: '依次拆解主体、构图、视角、光影、色彩、材质、风格和参数，并补充必要的反向约束。' },
          { title: '最终输出', text: '一段约 300 字的中文生图提示词，兼容 GPT Image、即梦、ComfyUI 等工具继续调整。' },
        ],
        note: '人工介入点：根据生成模型反复测试主体和风格词权重，保证结果可复现而不是只能偶然出现。',
      },
    ],
  },
  prompt: {
    eyebrow: 'PROMPT STRATEGY',
    title: 'AI.Simplify 提示词集合',
    mode: 'native',
    items: Array.from({ length: 68 }, (_, index) => {
      const number = String(index + 1).padStart(2, '0')
      return {
        src: `${assetRoot}/projects/prompt/prompt-${number}.jpg`,
        title: `AI.Simplify 提示词集合 ${number}`,
        meta: `Prompt 策略 · 第 ${index + 1} 页`,
      }
    }),
  },
  design: {
    eyebrow: 'DESIGN PORTFOLIO',
    title: '设计表达作品集',
    mode: 'native',
    items: Array.from({ length: 30 }, (_, index) => index + 1)
      .filter(sourcePage => sourcePage !== 28)
      .map((sourcePage, index) => {
        const sourceNumber = String(sourcePage).padStart(2, '0')
        const pageNumber = String(index + 1).padStart(2, '0')
        return {
          src: `${assetRoot}/projects/design/design-${sourceNumber}.jpg`,
          title: `设计作品集 ${pageNumber}`,
          meta: `设计表达 · 第 ${index + 1} 页`,
        }
      }),
  },
}

const communityModal = document.querySelector('.community-modal')
const communityCloseButton = communityModal?.querySelector('.community-close')
const communityImage = communityModal?.querySelector('.community-feature-phone img')
const communityCaptionTitle = communityModal?.querySelector('.community-feature figcaption strong')
const communityCaptionMembers = communityModal?.querySelector('.community-feature figcaption span')
const communityCounter = communityModal?.querySelector('.community-counter')
const communityModalTitle = communityModal?.querySelector('#community-modal-title')
const communityModalEyebrow = communityModal?.querySelector('.gallery-modal-eyebrow')
const communityThumbnailsContainer = communityModal?.querySelector('.community-thumbnails')
const workflowSlide = communityModal?.querySelector('.workflow-slide')
let communityThumbnails = []
let activeGallery = 'community'
let communityIndex = 0
let communityReturnFocus = null

const getActiveItems = () => galleryData[activeGallery].items

const renderWorkflowSlide = item => {
  if (!workflowSlide) return
  const blocks = item.blocks?.map((block, index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><h4>${block.title}</h4><p>${block.text}</p></article>`).join('') ?? ''
  const steps = item.steps?.map((step, index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><h4>${step.title}</h4><p>${step.text}</p></article>`).join('') ?? ''
  const stats = item.stats?.map(stat => `<article><strong>${stat.value}</strong><span>${stat.label}</span></article>`).join('') ?? ''
  workflowSlide.innerHTML = `
    <header><span>${item.kicker}</span><h3>${item.title}</h3><p>${item.intro}</p></header>
    ${blocks ? `<div class="workflow-blocks">${blocks}</div>` : ''}
    ${steps ? `<div class="workflow-steps">${steps}</div>` : ''}
    ${stats ? `<div class="workflow-stats">${stats}</div>` : ''}
    ${item.note ? `<aside>${item.note}</aside>` : ''}
    <footer><span>AI.Simplify</span><span>AI × Content Operations</span></footer>`
}

const renderCommunityThumbnails = () => {
  if (!communityThumbnailsContainer) return
  communityThumbnailsContainer.replaceChildren()
  communityThumbnailsContainer.classList.toggle('is-scrollable', getActiveItems().length > 8)
  communityThumbnails = getActiveItems().map((item, index) => {
    const button = document.createElement('button')
    const label = document.createElement('span')
    button.type = 'button'
    button.dataset.communityIndex = String(index)
    button.setAttribute('aria-label', `查看第 ${index + 1} 张`)
    if (item.type === 'workflow') {
      const preview = document.createElement('div')
      preview.className = 'workflow-thumbnail-preview'
      preview.innerHTML = `<small>${item.kicker}</small><strong>${item.title}</strong>`
      button.classList.add('workflow-thumbnail')
      button.append(preview)
    } else {
      const image = document.createElement('img')
      image.src = item.src
      image.alt = ''
      image.loading = 'lazy'
      button.append(image)
    }
    label.textContent = String(index + 1).padStart(2, '0')
    button.append(label)
    button.addEventListener('click', () => showCommunitySlide(index))
    communityThumbnailsContainer.append(button)
    return button
  })
}

const showCommunitySlide = nextIndex => {
  const items = getActiveItems()
  communityIndex = (nextIndex + items.length) % items.length
  const item = items[communityIndex]
  const isWorkflow = item.type === 'workflow'
  if (communityImage) {
    communityImage.hidden = isWorkflow
    if (!isWorkflow) {
      communityImage.src = item.src
      communityImage.alt = `${item.title}，${item.meta}`
    }
  }
  if (workflowSlide) workflowSlide.hidden = !isWorkflow
  if (isWorkflow) renderWorkflowSlide(item)
  if (communityCaptionTitle) communityCaptionTitle.textContent = item.title
  if (communityCaptionMembers) communityCaptionMembers.textContent = item.meta ?? `第 ${communityIndex + 1} 页`
  if (communityCounter) communityCounter.textContent = `${String(communityIndex + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`
  communityThumbnails.forEach((button, index) => {
    const isActive = index === communityIndex
    button.classList.toggle('is-active', isActive)
    button.setAttribute('aria-current', isActive ? 'true' : 'false')
  })
}

const closeCommunityModal = () => {
  if (!communityModal || communityModal.hidden) return
  communityModal.hidden = true
  document.body.classList.remove('community-modal-open')
  if (siteShell) siteShell.inert = false
  communityReturnFocus?.focus()
}

const openCommunityModal = trigger => {
  if (!communityModal) return
  communityReturnFocus = trigger
  activeGallery = galleryData[trigger.dataset.gallery] ? trigger.dataset.gallery : 'community'
  communityModal.classList.toggle('is-native-gallery', galleryData[activeGallery].mode === 'native')
  communityModal.classList.toggle('is-workflow-gallery', galleryData[activeGallery].mode === 'workflow')
  if (communityModalEyebrow) communityModalEyebrow.textContent = galleryData[activeGallery].eyebrow
  if (communityModalTitle) communityModalTitle.textContent = galleryData[activeGallery].title
  renderCommunityThumbnails()
  showCommunitySlide(Number(trigger.dataset.communityIndex ?? 0))
  communityModal.hidden = false
  document.body.classList.add('community-modal-open')
  if (siteShell) siteShell.inert = true
  communityCloseButton?.focus()
}

document.querySelectorAll('.community-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => openCommunityModal(trigger))
})

communityModal?.querySelectorAll('[data-community-close]').forEach(element => {
  element.addEventListener('click', closeCommunityModal)
})

communityModal?.querySelector('.community-prev')?.addEventListener('click', () => showCommunitySlide(communityIndex - 1))
communityModal?.querySelector('.community-next')?.addEventListener('click', () => showCommunitySlide(communityIndex + 1))
renderCommunityThumbnails()
showCommunitySlide(0)

document.addEventListener('keydown', event => {
  if (!communityModal || communityModal.hidden) return
  if (event.key === 'Escape') closeCommunityModal()
  if (event.key === 'ArrowLeft') showCommunitySlide(communityIndex - 1)
  if (event.key === 'ArrowRight') showCommunitySlide(communityIndex + 1)
})

const messageForm = document.querySelector('.message-form')
const messageBook = document.querySelector('.message-book')
const messageBookCover = messageForm?.querySelector('.message-book-cover')
const messageCollapseButton = messageForm?.querySelector('.message-collapse')
const messageBookTitle = messageBookCover?.querySelector('strong')
const messageComposeBody = messageForm?.querySelector('.message-compose-body')
const messageStatus = messageForm?.querySelector('.message-status')
const messageSuccess = messageForm?.querySelector('.message-success')
const messageContent = messageForm?.querySelector('#message-content')
const messageName = messageForm?.querySelector('#message-name')

const setMessageBookOpen = (isOpen, focusEditor = false) => {
  if (isOpen) messageBook?.classList.remove('is-forced-closed')
  messageBook?.classList.toggle('is-open', isOpen)
  messageBookCover?.setAttribute('aria-expanded', String(isOpen))
  if (messageBookTitle && (!messageSuccess || messageSuccess.hidden)) messageBookTitle.textContent = isOpen ? '正在写留言' : '点击写留言'
  if (focusEditor && isOpen) {
    window.setTimeout(() => {
      if (!messageComposeBody?.contains(document.activeElement)) messageContent?.focus()
    }, 360)
  }
}

messageBookCover?.addEventListener('click', () => setMessageBookOpen(!messageBook?.classList.contains('is-open'), true))
messageCollapseButton?.addEventListener('click', event => {
  event.preventDefault()
  event.stopPropagation()
  setMessageBookOpen(false)
  messageBook?.classList.add('is-forced-closed')
  messageCollapseButton.blur()
})

messageBook?.addEventListener('pointerleave', () => messageBook.classList.remove('is-forced-closed'))

messageBook?.querySelectorAll('[data-paper]').forEach((button, index) => {
  button.setAttribute('aria-pressed', String(index === 0))
  button.addEventListener('click', () => {
    const paper = button.dataset.paper ?? 'lined'
    messageForm.dataset.paper = paper
    messageBook.querySelectorAll('[data-paper]').forEach(option => option.setAttribute('aria-pressed', String(option === button)))
    setMessageBookOpen(true, true)
    button.blur()
  })
})

document.addEventListener('click', event => {
  if (messageBook?.classList.contains('is-open') && !messageBook.contains(event.target)) setMessageBookOpen(false)
})

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && messageBook?.classList.contains('is-open')) {
    setMessageBookOpen(false)
    messageBook.classList.add('is-forced-closed')
  }
})

const markMessageField = (field, message) => {
  if (!field) return false
  const isValid = field.checkValidity() && field.value.trim().length >= Number(field.minLength || 0)
  field.classList.toggle('is-invalid', !isValid)
  if (!isValid && messageStatus) messageStatus.textContent = message
  return isValid
}

messageForm?.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('input', () => {
    field.classList.remove('is-invalid')
    if (messageStatus) messageStatus.textContent = ''
  })
})

messageForm?.addEventListener('submit', event => {
  event.preventDefault()
  const isMessageValid = markMessageField(messageContent, '先写下至少 4 个字，让我知道你想聊什么。')
  const isNameValid = markMessageField(messageName, '请留下你的称呼。')
  if (!isMessageValid || !isNameValid) {
    const firstInvalidField = !isMessageValid ? messageContent : messageName
    firstInvalidField?.focus()
    return
  }

  const newCard = addUserMessageCard({
    name: messageName.value.trim(),
    message: messageContent.value.trim(),
    paper: messageForm.dataset.paper ?? 'lined',
    createdAt: Date.now(),
  })
  if (messageComposeBody) messageComposeBody.hidden = true
  if (messageSuccess) messageSuccess.hidden = false
  if (messageBookTitle) messageBookTitle.textContent = '留言已贴上墙'
  if (messageStatus) messageStatus.textContent = ''
  window.setTimeout(() => newCard?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 180)
})

messageForm?.querySelector('.message-reset')?.addEventListener('click', () => {
  messageForm.reset()
  messageForm.querySelectorAll('.is-invalid').forEach(field => field.classList.remove('is-invalid'))
  if (messageComposeBody) messageComposeBody.hidden = false
  if (messageSuccess) messageSuccess.hidden = true
  if (messageBookTitle) messageBookTitle.textContent = '正在写留言'
  if (messageStatus) messageStatus.textContent = ''
  setMessageBookOpen(true)
  messageContent?.focus()
})

const messageCardStack = document.querySelector('.message-card-stack')
const messageCards = [...(messageCardStack?.querySelectorAll('.message-card') ?? [])]
const userMessagesStorageKey = 'yangjin-portfolio-messages'
const messagePaperColors = {
  lined: '#f8e8ae',
  grid: '#ccebdd',
  dots: '#f7c5d7',
  plain: '#dce6ff',
}
let messageCardResizeFrame = 0
let highestMessageCardLayer = 10

const randomBetween = (minimum, maximum) => Math.random() * (maximum - minimum) + minimum
const clampNumber = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum)

const layoutMessageCards = () => {
  messageCardResizeFrame = 0
  if (!messageCardStack || !messageCards.length) return
  const stageWidth = messageCardStack.clientWidth
  const columns = stageWidth >= 760 ? 3 : stageWidth >= 500 ? 2 : 1
  const rows = Math.ceil(messageCards.length / columns)
  const horizontalPadding = 14
  const verticalPadding = 14
  const tallestCard = Math.max(...messageCards.map(card => card.offsetHeight))
  const cardWidth = messageCards[0].offsetWidth
  const rowGap = 28
  const naturalStageHeight = (rows * tallestCard) + ((rows - 1) * rowGap) + (verticalPadding * 2)
  const minimumStageHeight = columns === 3 ? 570 : columns === 2 ? 680 : 1040
  const stageHeight = Math.max(naturalStageHeight, minimumStageHeight)
  const horizontalSpace = Math.max(0, stageWidth - cardWidth - (horizontalPadding * 2))
  const verticalSpace = Math.max(0, stageHeight - tallestCard - (verticalPadding * 2))
  const slots = messageCards.map((_, index) => ({
    column: index % columns,
    row: Math.floor(index / columns),
  }))

  for (let index = slots.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[slots[index], slots[randomIndex]] = [slots[randomIndex], slots[index]]
  }

  messageCardStack.style.height = `${stageHeight}px`
  messageCards.forEach((card, index) => {
    const slot = slots[index]
    const baseLeft = horizontalPadding + (columns === 1 ? horizontalSpace / 2 : (horizontalSpace * slot.column) / (columns - 1))
    const baseTop = verticalPadding + (rows === 1 ? 0 : (verticalSpace * slot.row) / (rows - 1))
    card.style.left = `${clampNumber(baseLeft + randomBetween(-7, 7), 6, stageWidth - cardWidth - 6)}px`
    card.style.top = `${clampNumber(baseTop + randomBetween(-7, 7), 6, stageHeight - card.offsetHeight - 6)}px`
    card.style.setProperty('--card-rotate', `${randomBetween(-2.2, 2.2).toFixed(2)}deg`)
    card.style.zIndex = String(index + 1)
  })
}

const makeMessageCardDraggable = card => {
  let dragStartX = 0
  let dragStartY = 0
  let cardStartLeft = 0
  let cardStartTop = 0

  card.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !messageCardStack) return
    event.preventDefault()
    dragStartX = event.clientX
    dragStartY = event.clientY
    cardStartLeft = Number.parseFloat(card.style.left) || 0
    cardStartTop = Number.parseFloat(card.style.top) || 0
    card.classList.add('is-dragging')
    card.setAttribute('aria-grabbed', 'true')
    highestMessageCardLayer += 1
    card.style.zIndex = String(highestMessageCardLayer)
    card.setPointerCapture(event.pointerId)
  })

  card.addEventListener('pointermove', event => {
    if (!card.classList.contains('is-dragging') || !messageCardStack) return
    const maximumLeft = Math.max(0, messageCardStack.clientWidth - card.offsetWidth)
    const maximumTop = Math.max(0, messageCardStack.clientHeight - card.offsetHeight)
    card.style.left = `${clampNumber(cardStartLeft + event.clientX - dragStartX, 0, maximumLeft)}px`
    card.style.top = `${clampNumber(cardStartTop + event.clientY - dragStartY, 0, maximumTop)}px`
  })

  const endCardDrag = event => {
    if (!card.classList.contains('is-dragging')) return
    card.classList.remove('is-dragging')
    card.setAttribute('aria-grabbed', 'false')
    if (card.hasPointerCapture(event.pointerId)) card.releasePointerCapture(event.pointerId)
  }

  card.addEventListener('pointerup', endCardDrag)
  card.addEventListener('pointercancel', endCardDrag)
  card.addEventListener('keydown', event => {
    if (!messageCardStack || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    const movement = event.shiftKey ? 24 : 10
    const horizontalDirection = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0
    const verticalDirection = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0
    const maximumLeft = Math.max(0, messageCardStack.clientWidth - card.offsetWidth)
    const maximumTop = Math.max(0, messageCardStack.clientHeight - card.offsetHeight)
    card.style.left = `${clampNumber((Number.parseFloat(card.style.left) || 0) + horizontalDirection * movement, 0, maximumLeft)}px`
    card.style.top = `${clampNumber((Number.parseFloat(card.style.top) || 0) + verticalDirection * movement, 0, maximumTop)}px`
  })
}

const createUserMessageCard = ({ name, message, paper = 'lined' }) => {
  const card = document.createElement('article')
  card.className = 'message-card message-card-user is-new'
  card.tabIndex = 0
  card.setAttribute('aria-label', `${name}的留言，可拖动`)
  card.style.backgroundColor = messagePaperColors[paper] ?? messagePaperColors.lined
  card.innerHTML = '<header><span class="message-avatar"></span><div><strong></strong><small>刚刚</small></div></header><p></p><span class="message-card-mark">NEW NOTE</span>'
  card.querySelector('.message-avatar').textContent = Array.from(name)[0] ?? '你'
  card.querySelector('strong').textContent = name
  card.querySelector('p').textContent = message
  return card
}

const readSavedUserMessages = () => {
  try {
    const savedMessages = JSON.parse(window.localStorage.getItem(userMessagesStorageKey) ?? '[]')
    return Array.isArray(savedMessages) ? savedMessages : []
  } catch {
    return []
  }
}

const saveUserMessage = message => {
  try {
    const savedMessages = [...readSavedUserMessages(), message].slice(-18)
    window.localStorage.setItem(userMessagesStorageKey, JSON.stringify(savedMessages))
  } catch {
    // The new card still appears when browser storage is unavailable.
  }
}

const addUserMessageCard = (message, shouldSave = true) => {
  if (!messageCardStack) return null
  const card = createUserMessageCard(message)
  messageCardStack.prepend(card)
  messageCards.unshift(card)
  makeMessageCardDraggable(card)
  if (shouldSave) saveUserMessage(message)
  window.requestAnimationFrame(() => {
    layoutMessageCards()
  })
  window.setTimeout(() => card.classList.remove('is-new'), 650)
  return card
}

messageCards.forEach(makeMessageCardDraggable)
readSavedUserMessages().forEach(message => addUserMessageCard(message, false))

window.requestAnimationFrame(layoutMessageCards)
window.addEventListener('resize', () => {
  if (messageCardResizeFrame) window.cancelAnimationFrame(messageCardResizeFrame)
  messageCardResizeFrame = window.requestAnimationFrame(layoutMessageCards)
})

const messageSocials = document.querySelector('.message-socials')
const messageContactPopover = messageSocials?.querySelector('.message-contact-popover')
const messageContactLabel = messageContactPopover?.querySelector('.contact-popover-label')
const messageContactValue = messageContactPopover?.querySelector('.contact-popover-value')
const copyMessageContact = messageContactPopover?.querySelector('.copy-contact')
let selectedMessageContact = ''

const closeMessageContactPopover = () => {
  if (messageContactPopover) messageContactPopover.hidden = true
  messageSocials?.querySelectorAll('.contact-trigger').forEach(button => button.setAttribute('aria-expanded', 'false'))
}

messageSocials?.querySelectorAll('.contact-trigger').forEach(button => {
  button.addEventListener('click', event => {
    event.stopPropagation()
    const value = button.dataset.contactValue ?? ''
    const isCurrentAndOpen = selectedMessageContact === value && messageContactPopover && !messageContactPopover.hidden
    closeMessageContactPopover()
    if (isCurrentAndOpen || !messageContactPopover) return
    selectedMessageContact = value
    if (messageContactLabel) messageContactLabel.textContent = button.dataset.contactLabel ?? '联系方式'
    if (messageContactValue) messageContactValue.textContent = value
    if (copyMessageContact) copyMessageContact.textContent = '复制'
    messageContactPopover.hidden = false
    button.setAttribute('aria-expanded', 'true')
  })
})

copyMessageContact?.addEventListener('click', async event => {
  event.stopPropagation()
  try {
    await navigator.clipboard.writeText(selectedMessageContact)
    copyMessageContact.textContent = '已复制'
  } catch {
    const input = document.createElement('textarea')
    input.value = selectedMessageContact
    document.body.append(input)
    input.select()
    document.execCommand('copy')
    input.remove()
    copyMessageContact.textContent = '已复制'
  }
})

document.addEventListener('click', event => {
  if (!messageSocials?.contains(event.target)) closeMessageContactPopover()
})

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMessageContactPopover()
})

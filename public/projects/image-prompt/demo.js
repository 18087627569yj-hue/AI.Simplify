const samples = {
  architecture: {
    label: '建筑效果图',
    image: '../../assets/projects/prompt/prompt-18.jpg',
    title: '玻璃幕墙建筑提示词',
    prompt: '正立面视角的现代玻璃幕墙建筑，主体为横向舒展的三层矩形体量。高透明度玻璃外墙配合纤细、规则的银灰色钢结构网格，内部楼板、立柱、楼梯与开放空间清晰可见。建筑轻盈地落在低饱和草地之上，远景天空阴柔通透，采用冷调自然漫射光，弱化强烈阴影与高光。整体呈现克制、安静的建筑竞赛效果图质感，构图居中，视线接近平视，强调结构秩序、透明性与现代主义的轻盈感。',
  },
  city: {
    label: '城市插画',
    image: '../../assets/projects/prompt/prompt-40.jpg',
    title: '山水城市鸟瞰插画提示词',
    prompt: '以四十五度俯瞰视角绘制山水城市全景，河流从画面右侧向前景展开，桥梁连接两岸，高层建筑群、公共文化建筑、滨水步道与码头形成清晰层次。采用复古旅行海报与手绘建筑插画相结合的语言，线条细密、轮廓清楚，建筑体块简洁。主色为柔和的米白、湖水绿、陶土橙与灰蓝，树木以深浅绿色和秋色点缀。画面明快但不过度饱和，人物和船只以微缩比例分布，用温暖、亲切的方式表达城市地标与滨水生活。',
  },
  analysis: {
    label: '行为分析图',
    image: '../../assets/projects/prompt/prompt-66.jpg',
    title: '建筑活动分析图提示词',
    prompt: '建筑学活动分析图，采用干净白底、等轴测视角与柔和灰粉配色。左侧以虚线网络连接多个方形活动单元，每个单元内放置微缩人物、桌椅、绿植和简化建筑构件，分别表现实验、种植、阅读、社区交流、手工制作与休闲活动。右侧组织为概念流程图，用粉色箭头连接可持续性、创新、资源整合等关键词，并继续延伸至空间营造、活动激发和价值实现。人物以简洁拼贴风表现，图标、标题、注释保持统一网格与轻量线条，整体适用于建筑与社区规划汇报。',
  },
}

const thumbs = [...document.querySelectorAll('.demo-thumb')]
const image = document.querySelector('.demo-image img')
const card = document.querySelector('.demo-card')
const status = document.querySelector('.demo-status')
const title = document.querySelector('.demo-card-body h3')
const output = document.querySelector('.demo-output')
const generate = document.querySelector('.demo-generate')
const copy = document.querySelector('.demo-copy')
let active = 'architecture'
let timer

const selectSample = key => {
  active = key
  clearTimeout(timer)
  const sample = samples[key]
  image.src = sample.image
  image.alt = sample.label
  status.textContent = `准备分析 · ${sample.label}`
  title.textContent = '参考图已定位'
  output.textContent = '插件会从主体、构图、视角、材质、光线、色调和风格七个维度组织提示词。'
  card.classList.remove('is-loading')
  generate.disabled = false
  generate.textContent = '反推提示词'
  copy.disabled = true
  copy.textContent = '复制'
  thumbs.forEach(button => {
    const selected = button.dataset.sample === key
    button.classList.toggle('is-active', selected)
    button.setAttribute('aria-selected', String(selected))
  })
}

thumbs.forEach(button => button.addEventListener('click', () => selectSample(button.dataset.sample)))

generate.addEventListener('click', () => {
  const sample = samples[active]
  card.classList.add('is-loading')
  generate.disabled = true
  generate.textContent = '正在分析'
  status.textContent = `正在分析 · ${sample.label}`
  title.textContent = '提取构图、材质与光影'
  output.textContent = '模型正在把视觉事实整理为可被生图工具理解的语言……'
  timer = setTimeout(() => {
    card.classList.remove('is-loading')
    status.textContent = `分析完成 · ${sample.label}`
    title.textContent = sample.title
    output.textContent = sample.prompt
    generate.disabled = false
    generate.textContent = '重新生成'
    copy.disabled = false
  }, 900)
})

copy.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(samples[active].prompt) } catch {}
  copy.textContent = '已复制'
  setTimeout(() => { copy.textContent = '复制' }, 1600)
})

document.querySelector('.copy-hero-prompt')?.addEventListener('click', async event => {
  try { await navigator.clipboard.writeText(samples.architecture.prompt) } catch {}
  event.currentTarget.textContent = '已复制'
  setTimeout(() => { event.currentTarget.textContent = '复制提示词' }, 1600)
})

const progress = document.querySelector('.case-progress span')
window.addEventListener('scroll', () => {
  const distance = document.documentElement.scrollHeight - innerHeight
  progress.style.width = `${distance > 0 ? scrollY / distance * 100 : 0}%`
}, { passive: true })

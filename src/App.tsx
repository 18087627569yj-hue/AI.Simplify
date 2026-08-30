import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleCheckBig,
  Download,
  FileText,
  Highlighter,
  ImageUp,
  Info,
  Lightbulb,
  Link2,
  LockKeyhole,
  MessageCircleQuestion,
  PencilLine,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  UploadCloud,
  WandSparkles,
  X,
} from 'lucide-react'

type Screen = 'home' | 'input' | 'diagnosis' | 'workspace' | 'export'
type JDInputMode = 'text' | 'link' | 'image'
type ResumeItem = { id: number; section?: string; original: string; optimized: string; reason: string; jd: string; status: string }
type DiffPart = { type: 'equal' | 'added' | 'removed'; value: string }
type Dimension = { name: string; score: number; note: string; tone: 'blue' | 'yellow' | 'coral' }
type AnalysisResult = {
  candidate: { name: string; headline: string; contact: string; education: string }
  job: { title: string; company: string }
  headline: string
  overall_score: number
  level: string
  confidence: string
  strength: { title: string; detail: string }
  priority_improvement: { title: string; detail: string }
  question: { title: string; detail: string }
  dimensions: Dimension[]
  priorities: { title: string; action: string }[]
  items: ResumeItem[]
  gap: { title: string; detail: string }
}

const demoJD = `岗位名称：用户增长产品经理

岗位职责：
1. 负责新用户增长策略，围绕拉新、激活与留存设计产品方案；
2. 通过用户研究和数据分析定位问题，推进跨团队协作与实验落地；
3. 建立核心指标体系，持续复盘迭代。

任职要求：
1. 1-3 年互联网产品经验；
2. 具备数据分析、A/B 测试和项目推进能力；
3. 结果导向，具有良好的沟通协作能力。`

const initialItems: ResumeItem[] = [
  {
    id: 1,
    section: '个人总结',
    original: '信息管理专业本科生，有互联网产品实习和校园项目经验，熟悉需求分析、原型设计和数据分析，希望从事产品经理工作。',
    optimized: '用户增长方向产品经理候选人，具备互联网产品实习及 2 段完整项目经验；能够运用用户研究、漏斗分析和 A/B 测试定位增长问题，并推动方案从需求到上线复盘。',
    reason: '把泛化的求职意向改为岗位定位，并前置与 JD 最相关的方法和完整实践。',
    jd: '用户增长 · 数据分析 · A/B 测试 · 项目推进',
    status: '系统对已有事实的改写',
  },
  {
    id: 2,
    section: '实习经历｜星云科技 · 产品经理实习生｜2025.03–2025.08',
    original: '参与新用户引导流程改版，整理用户反馈和埋点数据，发现注册后的功能入口不清晰，输出需求文档并跟进上线，改版后关键功能激活率由 41% 提升到 53%。',
    optimized: '参与新用户激活链路改版，结合 120+ 条用户反馈与漏斗埋点定位“注册后核心入口不清晰”问题；输出需求文档并推动设计、研发上线，关键功能激活率由 41% 提升至 53%。',
    reason: '保留原有结果，补齐分析样本、问题判断和协作动作，形成完整的“发现—推进—结果”链路。',
    jd: '新用户激活 · 用户研究 · 数据分析 · 跨团队推进',
    status: '系统对已有事实的改写',
  },
  {
    id: 3,
    section: '实习经历｜星云科技 · 产品经理实习生｜2025.03–2025.08',
    original: '负责版本需求池维护，共整理 46 条来自客服、运营和用户访谈的需求，按照影响范围和紧急程度确定优先级，协助产品经理完成 3 个版本迭代。',
    optimized: '维护版本需求池，归集客服、运营及用户访谈中的 46 条需求，依据影响范围、用户价值与紧急程度完成优先级评估，协助产品经理推进 3 个版本按期迭代。',
    reason: '突出需求来源、优先级判断方法和交付结果，证明基础产品能力。',
    jd: '需求分析 · 项目推进 · 跨团队协作',
    status: '系统对已有事实的改写',
  },
  {
    id: 4,
    section: '实习经历｜星云科技 · 产品经理实习生｜2025.03–2025.08',
    original: '每周使用 Excel 和 SQL 整理新增、激活、次周留存等数据，制作周报，发现某渠道次周留存低于整体 8 个百分点，协助运营调整投放素材。',
    optimized: '使用 SQL 与 Excel 搭建新增—激活—次周留存周度看板；识别某渠道次周留存低于整体 8 个百分点，协同运营调整投放素材并持续跟踪渠道质量。',
    reason: '将“制作周报”提升为指标体系和决策支持，强调发现问题后的业务动作。',
    jd: '指标体系 · SQL · 数据分析 · 增长复盘',
    status: '系统对已有事实的改写',
  },
  {
    id: 5,
    section: '实习经历｜星云科技 · 产品经理实习生｜2025.03–2025.08',
    original: '协助组织 8 场用户访谈，整理访谈纪要和问题标签，输出关于消息提醒和任务进度反馈的优化建议，其中 2 条进入后续版本。',
    optimized: '协助完成 8 场用户访谈，通过纪要编码归纳消息提醒、任务反馈等高频问题，形成可执行的体验优化清单，其中 2 项建议进入后续版本。',
    reason: '补充研究过程和输出物，让用户研究能力更可信。',
    jd: '用户研究 · 需求洞察 · 产品迭代',
    status: '系统对已有事实的改写',
  },
  {
    id: 6,
    section: '项目经历｜新用户激活漏斗优化｜产品负责人｜2024.10–2024.12',
    original: '课程项目中负责一款校园学习 App 的新用户激活优化，团队 4 人，产品累计有 2,000 名校园用户。',
    optimized: '担任 4 人团队产品负责人，围绕一款拥有 2,000 名校园用户的学习 App 开展新用户激活专项，负责目标拆解、方案设计与项目排期。',
    reason: '明确项目规模、个人角色和负责范围，便于招聘方判断贡献度。',
    jd: '新用户增长 · 项目负责人 · 项目推进',
    status: '系统对已有事实的改写',
  },
  {
    id: 7,
    section: '项目经历｜新用户激活漏斗优化｜产品负责人｜2024.10–2024.12',
    original: '分析注册到完成首次学习任务的漏斗，并访谈 32 名新生，发现资料导入步骤长、首次任务缺少引导是主要问题。',
    optimized: '拆解“注册—资料导入—创建任务—首次完成”激活漏斗，并访谈 32 名新生，定位资料导入路径过长、首次任务缺少反馈为 2 个核心流失原因。',
    reason: '将分析对象和关键节点具体化，使问题定位过程可验证。',
    jd: '漏斗分析 · 用户研究 · 问题定位',
    status: '系统对已有事实的改写',
  },
  {
    id: 8,
    section: '项目经历｜新用户激活漏斗优化｜产品负责人｜2024.10–2024.12',
    original: '设计快捷导入、分步引导和完成反馈方案，使用 Figma 制作高保真原型并完成可用性测试，5 周内将首次任务完成率从 23% 提升到 31%，次周留存提升 6.3 个百分点。',
    optimized: '设计快捷导入、分步引导与完成反馈方案，使用 Figma 输出高保真原型并组织可用性测试；方案上线 5 周后，首次任务完成率由 23% 提升至 31%，次周留存提升 6.3 个百分点。',
    reason: '保留完整方法和结果，仅压缩表达并强化上线后的量化影响。',
    jd: '方案设计 · 原型能力 · 激活率 · 留存',
    status: '系统对已有事实的改写',
  },
  {
    id: 9,
    section: '项目经历｜会员召回活动实验｜产品经理｜2024.05–2024.07',
    original: '针对校园电商平台 8,000 名 30 天未活跃会员，和 3 名同学一起设计召回活动，我负责用户分层、活动规则和数据复盘。',
    optimized: '面向校园电商平台 8,000 名连续 30 天未活跃会员，负责用户分层、召回规则设计及数据复盘，并协调 3 人团队完成活动落地。',
    reason: '前置目标人群与规模，明确个人职责和团队协作范围。',
    jd: '用户召回 · 用户分层 · 跨团队协作',
    status: '系统对已有事实的改写',
  },
  {
    id: 10,
    section: '项目经历｜会员召回活动实验｜产品经理｜2024.05–2024.07',
    original: '根据历史浏览和购买频次把用户分成高意向、价格敏感和沉默用户，分别设计商品提醒、优惠券和内容推荐触达策略。',
    optimized: '基于历史浏览行为与购买频次，将流失会员划分为高意向、价格敏感及沉默用户，并分别设计商品提醒、优惠券和内容推荐策略，实现差异化触达。',
    reason: '用“依据—分层—策略”结构呈现增长策略的形成过程。',
    jd: '用户分层 · 精细化运营 · 增长策略',
    status: '系统对已有事实的改写',
  },
  {
    id: 11,
    section: '项目经历｜会员召回活动实验｜产品经理｜2024.05–2024.07',
    original: '对优惠券门槛做 A/B 测试，A 组满 59 减 8，B 组满 79 减 15，测试 14 天后 B 组召回率高 3.1 个百分点，最终活动召回率 9.8%，带来 5.6 万元 GMV。',
    optimized: '设计优惠券门槛 A/B 测试：A 组“满 59 减 8”、B 组“满 79 减 15”；运行 14 天后 B 组召回率高 3.1 个百分点，据此确定正式方案，最终实现 9.8% 召回率并贡献 5.6 万元 GMV。',
    reason: '补齐实验变量、周期、结论和决策动作，直接回应 JD 的 A/B 测试要求。',
    jd: 'A/B 测试 · 数据驱动决策 · 结果导向',
    status: '系统对已有事实的改写',
  },
  {
    id: 12,
    section: '专业技能',
    original: '产品工具：Axure、Figma、XMind、Visio；数据工具：SQL、Excel、Tableau；能够独立输出 PRD、流程图和高保真原型。',
    optimized: '产品：Axure、Figma、XMind、Visio，可独立输出 PRD、业务流程图及高保真原型；数据：掌握 SQL、Excel、Tableau，能够完成指标拆解、数据提取与可视化分析。',
    reason: '按产品和数据能力分类，并补充工具对应的实际产出。',
    jd: '产品基本功 · SQL · 数据分析',
    status: '系统对已有事实的改写',
  },
  {
    id: 13,
    section: '教育经历',
    original: '南方大学｜信息管理与信息系统｜本科｜2022.09–2026.06',
    optimized: '南方大学｜信息管理与信息系统｜本科｜2022.09–2026.06',
    reason: '学校、专业和时间信息完整清晰，保留原文。',
    jd: '教育背景',
    status: '原简历已有事实',
  },
  {
    id: 14,
    section: '教育经历',
    original: '主修课程：产品设计、用户研究、数据库原理、统计学；GPA 3.6/4.0，获校级二等奖学金。',
    optimized: '主修课程：产品设计、用户研究、数据库原理、统计学；GPA 3.6/4.0，获校级二等奖学金。',
    reason: '课程与岗位能力相关，成绩和奖项表达明确，保留原文。',
    jd: '专业基础 · 数据能力',
    status: '原简历已有事实',
  },
]

const demoDimensions: Dimension[] = [
  { name: '岗位相关性', score: 91, note: '实习和两个项目均覆盖用户增长场景', tone: 'blue' },
  { name: '硬性条件覆盖', score: 84, note: '具备数据分析和 A/B 测试证据，正式经验年限偏短', tone: 'yellow' },
  { name: '成果表达', score: 82, note: '关键项目有规模、指标与结果支撑', tone: 'yellow' },
  { name: '专业能力可信度', score: 88, note: '方法、工具和项目产出能够相互印证', tone: 'blue' },
  { name: '内容完整性', score: 94, note: '实习、项目、技能与教育模块完整', tone: 'blue' },
  { name: '信息优先级', score: 79, note: '高相关增长证据还可以进一步前置', tone: 'yellow' },
  { name: 'HR 阅读体验', score: 80, note: '个别长句需要拆分并突出个人贡献', tone: 'yellow' },
  { name: 'ATS 兼容性', score: 92, note: '结构规范，关键词可读取', tone: 'blue' },
]

const demoAnalysis: AnalysisResult = {
  candidate: { name: '林晓雨', headline: '用户增长产品经理｜2026 届', contact: '138-0000-0000｜lin@example.com｜上海', education: '南方大学｜信息管理与信息系统｜本科' },
  job: { title: '用户增长产品经理', company: '示例公司' },
  headline: '方向是对的，再把证据说清楚',
  overall_score: 84,
  level: '匹配良好',
  confidence: '较高',
  strength: { title: '增长方法形成了完整证据链', detail: '实习和项目同时覆盖用户研究、漏斗分析、A/B 测试与上线复盘。' },
  priority_improvement: { title: '还要更突出个人决策价值', detail: '部分描述有数据结果，但个人判断和推动动作仍可进一步前置。' },
  question: { title: '需要确认项目指标的统计口径', detail: '首次任务完成率、召回率和 GMV 的数据来源及统计周期应能在面试中解释。' },
  dimensions: demoDimensions,
  priorities: [
    { title: '前置增长主线', action: '让激活、留存和召回证据在每段开头出现。' },
    { title: '强化个人角色', action: '明确哪些判断和推进动作由候选人独立完成。' },
    { title: '核对指标口径', action: '确认样本、周期和计算方式，保证面试可追溯。' },
  ],
  items: initialItems,
  gap: { title: '正式商业产品的长期留存经验仍偏少', detail: '现有证据以实习和阶段性项目为主。如果后续有 30 日留存、持续迭代或商业化指标，可以补充到经历中；当前版本不会虚构。' },
}

const steps = [
  { id: 'input', label: '添加材料' },
  { id: 'diagnosis', label: '简历诊断' },
  { id: 'workspace', label: '对比优化' },
  { id: 'export', label: '确认导出' },
] as const

const screenOrder: Screen[] = ['home', 'input', 'diagnosis', 'workspace', 'export']

const tokenizeForDiff = (text: string) => text.match(/[\u3400-\u9fff]|[A-Za-z0-9]+(?:[.+#/%-][A-Za-z0-9]+)*|\s+|[^\s]/g) || []

const diffText = (original: string, optimized: string): DiffPart[] => {
  const before = tokenizeForDiff(original)
  const after = tokenizeForDiff(optimized)
  const table = Array.from({ length: before.length + 1 }, () => new Uint16Array(after.length + 1))

  for (let i = before.length - 1; i >= 0; i -= 1) {
    for (let j = after.length - 1; j >= 0; j -= 1) {
      table[i][j] = before[i] === after[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
    }
  }

  const raw: DiffPart[] = []
  let i = 0
  let j = 0
  while (i < before.length || j < after.length) {
    if (i < before.length && j < after.length && before[i] === after[j]) {
      raw.push({ type: 'equal', value: before[i] }); i += 1; j += 1
    } else if (j < after.length && (i === before.length || table[i][j + 1] >= table[i + 1][j])) {
      raw.push({ type: 'added', value: after[j] }); j += 1
    } else {
      raw.push({ type: 'removed', value: before[i] }); i += 1
    }
  }

  return raw.reduce<DiffPart[]>((parts, part) => {
    const previous = parts.at(-1)
    if (previous?.type === part.type) previous.value += part.value
    else parts.push({ ...part })
    return parts
  }, [])
}

const groupResumeItems = (items: ResumeItem[]) => {
  const groups: { title: string; items: ResumeItem[] }[] = []
  items.forEach((item) => {
    const title = item.section?.trim() || '简历正文'
    const group = groups.find((entry) => entry.title === title)
    if (group) group.items.push(item)
    else groups.push({ title, items: [item] })
  })
  return groups
}

const fileToDataURL = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result))
  reader.onerror = () => reject(new Error(`无法读取文件：${file.name}`))
  reader.readAsDataURL(file)
})

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jd, setJD] = useState('')
  const [jdImageFile, setJDImageFile] = useState<File | null>(null)
  const [jdInputMode, setJDInputMode] = useState<JDInputMode>('text')
  const [isDemoSession, setIsDemoSession] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [items, setItems] = useState<ResumeItem[]>(initialItems)
  const [analysis, setAnalysis] = useState<AnalysisResult>(demoAnalysis)
  const [history, setHistory] = useState<ResumeItem[][]>([])
  const [openReason, setOpenReason] = useState<number | null>(1)
  const [toast, setToast] = useState('')
  const [factChecked, setFactChecked] = useState(false)
  const [fileHover, setFileHover] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const progress = useMemo(() => Math.max(0, screenOrder.indexOf(screen) - 1), [screen])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [screen])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const useDemo = () => {
    setJD(demoJD)
    setJDImageFile(null)
    setJDInputMode('text')
    setIsDemoSession(true)
    const file = new File(['演示简历'], '林晓雨-产品经理简历.pdf', { type: 'application/pdf' })
    setResumeFile(file)
    setToast('示例材料已准备好')
  }

  const analyze = async () => {
    if (!resumeFile || (!jd.trim() && !jdImageFile)) {
      setToast('请先添加简历和岗位描述')
      return
    }
    if (jdInputMode === 'link') {
      try {
        const url = new URL(jd.trim())
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid protocol')
      } catch {
        setToast('请输入完整的 http:// 或 https:// 招聘链接')
        return
      }
    }
    setIsAnalyzing(true)
    if (isDemoSession) {
      window.setTimeout(() => {
        setAnalysis(demoAnalysis)
        setItems(demoAnalysis.items)
        setIsAnalyzing(false)
        setScreen('diagnosis')
      }, 900)
      return
    }

    try {
      const resumeData = await fileToDataURL(resumeFile)
      const jdImageData = jdImageFile ? await fileToDataURL(jdImageFile) : null
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: { name: resumeFile.name, mime: resumeFile.type, data: resumeData },
          jd: jdInputMode === 'image'
            ? { mode: 'image', file: jdImageFile ? { name: jdImageFile.name, mime: jdImageFile.type, data: jdImageData } : null }
            : { mode: jdInputMode, value: jd.trim() },
        }),
      })
      const payload = await response.json() as { analysis?: AnalysisResult; error?: string }
      if (!response.ok || !payload.analysis) throw new Error(payload.error || '诊断服务暂时不可用')
      setAnalysis(payload.analysis)
      setItems(payload.analysis.items)
      setHistory([])
      setOpenReason(payload.analysis.items[0]?.id ?? null)
      setScreen('diagnosis')
    } catch (error) {
      setToast(error instanceof Error ? error.message : '诊断失败，请稍后重试')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const updateItem = (id: number, text: string) => {
    setHistory((old) => [...old.slice(-9), items])
    setItems((all) => all.map((item) => (item.id === id ? { ...item, optimized: text } : item)))
  }

  const restoreItem = (id: number) => {
    setHistory((old) => [...old.slice(-9), items])
    setItems((all) => all.map((item) => (item.id === id ? { ...item, optimized: item.original } : item)))
    setToast('已恢复为原文')
  }

  const undo = () => {
    const previous = history.at(-1)
    if (!previous) return setToast('暂时没有可撤销的操作')
    setItems(previous)
    setHistory((old) => old.slice(0, -1))
    setToast('已撤销上一步')
  }

  const downloadBlob = (content: string, type: string, filename: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
    setToast(`${filename} 已开始下载`)
  }

  const exportDoc = async () => {
    if (!factChecked) return setToast('请先完成事实确认')
    const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import('docx')
    const document = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: analysis.candidate.name, heading: HeadingLevel.TITLE }),
          new Paragraph({ children: [new TextRun(`${analysis.candidate.headline}｜${analysis.candidate.contact}`)] }),
          ...groupResumeItems(items).flatMap((group) => [
            new Paragraph({ text: group.title, heading: HeadingLevel.HEADING_1 }),
            ...group.items.map((item) => new Paragraph({ text: item.optimized, bullet: { level: 0 }, spacing: { after: 180 } })),
          ]),
        ],
      }],
    })
    const blob = await Packer.toBlob(document)
    const url = URL.createObjectURL(blob)
    const anchor = window.document.createElement('a')
    anchor.href = url
    anchor.download = `${analysis.candidate.name}-${analysis.job.title}-优化版.docx`
    anchor.click()
    URL.revokeObjectURL(url)
    setToast('DOCX 文件已开始下载')
  }

  const exportReport = () => {
    if (!factChecked) return setToast('请先完成事实确认')
    const changedItems = items.filter((item) => item.original !== item.optimized)
    const changes = changedItems.map((item, index) => `### 修改 ${index + 1}｜${item.section || '简历正文'}\n- 原文：${item.original}\n- 优化：${item.optimized}\n- 理由：${item.reason}`).join('\n\n')
    downloadBlob(`# 简历诊断与修改报告\n\n目标岗位：${analysis.job.title}\n\n总体匹配度：${analysis.overall_score} / 100\n\n${changes}`, 'text/markdown;charset=utf-8', '简历诊断与修改报告.md')
  }

  const deleteData = () => {
    setResumeFile(null)
    setJD('')
    setJDImageFile(null)
    setJDInputMode('text')
    setIsDemoSession(false)
    setItems(initialItems)
    setAnalysis(demoAnalysis)
    setHistory([])
    setFactChecked(false)
    setScreen('home')
    setToast('本次会话数据已清除')
  }

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg']
    if (!allowed.includes(file.type)) return setToast('请上传 PDF、DOCX、PNG 或 JPG 文件')
    if (file.size > 10 * 1024 * 1024) return setToast('简历文件请控制在 10MB 以内')
    setResumeFile(file)
    setIsDemoSession(false)
  }

  const handleJDImage = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg'].includes(file.type)) return setToast('JD 截图仅支持 PNG 或 JPG 文件')
    if (file.size > 10 * 1024 * 1024) return setToast('JD 截图请控制在 10MB 以内')
    setJDImageFile(file)
    setIsDemoSession(false)
  }

  const changeJDInputMode = (mode: JDInputMode) => {
    if (mode === jdInputMode) return
    setJDInputMode(mode)
    setJD('')
    setJDImageFile(null)
    setIsDemoSession(false)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setScreen('home')} aria-label="返回首页">
          <span className="brand-mark">简</span>
          <span>简历手记</span>
        </button>
        <div className="topbar-note"><ShieldCheck size={16} /> 内容仅在本次浏览器会话中处理</div>
        {screen === 'home' ? (
          <button className="text-button" onClick={() => setScreen('input')}>体验示例 <ArrowRight size={16} /></button>
        ) : (
          <button className="text-button danger" onClick={deleteData}><Trash2 size={15} /> 清除数据</button>
        )}
      </header>

      {screen !== 'home' && <Progress current={progress} onNavigate={(id) => setScreen(id as Screen)} />}

      <main>
        {screen === 'home' && <Home onStart={() => setScreen('input')} onDemo={() => { useDemo(); setScreen('input') }} />}
        {screen === 'input' && (
          <InputScreen
            resumeFile={resumeFile}
            jd={jd}
            jdImageFile={jdImageFile}
            jdInputMode={jdInputMode}
            isAnalyzing={isAnalyzing}
            fileHover={fileHover}
            fileInput={fileInput}
            setJD={(value) => { setJD(value); setIsDemoSession(false) }}
            changeJDInputMode={changeJDInputMode}
            setFileHover={setFileHover}
            handleFiles={handleFiles}
            handleJDImage={handleJDImage}
            removeFile={() => setResumeFile(null)}
            removeJDImage={() => setJDImageFile(null)}
            useDemo={useDemo}
            analyze={analyze}
            onBack={() => setScreen('home')}
          />
        )}
        {screen === 'diagnosis' && <Diagnosis analysis={analysis} onBack={() => setScreen('input')} onNext={() => setScreen('workspace')} />}
        {screen === 'workspace' && (
          <Workspace
            items={items}
            analysis={analysis}
            resumeFile={isDemoSession ? null : resumeFile}
            openReason={openReason}
            setOpenReason={setOpenReason}
            updateItem={updateItem}
            restoreItem={restoreItem}
            undo={undo}
            onBack={() => setScreen('diagnosis')}
            onNext={() => setScreen('export')}
          />
        )}
        {screen === 'export' && (
          <ExportScreen
            items={items}
            analysis={analysis}
            checked={factChecked}
            setChecked={setFactChecked}
            onBack={() => setScreen('workspace')}
            exportDoc={exportDoc}
            exportReport={exportReport}
            exportPDF={() => factChecked ? window.print() : setToast('请先完成事实确认')}
            deleteData={deleteData}
          />
        )}
      </main>

      {toast && <div className="toast"><CircleCheckBig size={18} />{toast}</div>}
    </div>
  )
}

function Progress({ current, onNavigate }: { current: number; onNavigate: (id: string) => void }) {
  return (
    <nav className="progress-wrap" aria-label="优化进度">
      <div className="progress-line"><i style={{ width: `${Math.max(0, current) * 33.33}%` }} /></div>
      {steps.map((step, index) => (
        <button key={step.id} className={index <= current ? 'progress-step active' : 'progress-step'} onClick={() => index <= current && onNavigate(step.id)}>
          <span>{index < current ? <Check size={15} /> : index + 1}</span>
          {step.label}
        </button>
      ))}
    </nav>
  )
}

function Home({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) {
  return (
    <div className="home-page dotted-bg">
      <section className="hero page-width">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> 一位认真、坦诚的 AI 资深 HR</div>
          <h1>让你的经历，<br /><em>被好好看见。</em></h1>
          <p>不只润色句子。先读懂岗位，再帮你找出差距、讲清价值，生成一份有依据、可确认的针对性简历。</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={onStart}>开始优化简历 <ArrowRight size={18} /></button>
            <button className="secondary-button" onClick={onDemo}>用示例体验</button>
          </div>
          <div className="trust-row">
            <span><Check size={14} /> 无需登录</span>
            <span><Check size={14} /> 不编造经历</span>
            <span><Check size={14} /> 支持本地导出</span>
          </div>
        </div>

        <div className="hero-board" aria-label="简历优化示意">
          <div className="tape" />
          <div className="board-label">TODAY, WE WILL</div>
          <h2>把“我做过”<br />写成“我做到”</h2>
          <div className="scribble" />
          <div className="mini-change old"><span>原来</span> 负责活动运营和数据整理</div>
          <ArrowRight className="change-arrow" size={22} />
          <div className="mini-change new"><span>现在</span> 基于转化数据迭代活动路径，推动核心指标提升</div>
          <div className="score-sticker"><strong>+23</strong><small>表达清晰度</small></div>
          <div className="tab tab-a">读岗位</div><div className="tab tab-b">找证据</div><div className="tab tab-c">改表达</div>
        </div>
      </section>

      <section className="how page-width">
        <div className="section-heading"><span>HOW IT WORKS</span><h2>一次有来有回的简历修改</h2><p>每个结论都有依据，每次改写都由你做最后决定。</p></div>
        <div className="method-grid">
          <article className="method-card blue"><span className="number">01</span><Target /><h3>读懂岗位</h3><p>拆解硬性门槛、加分项与真正重要的能力，明确简历应该证明什么。</p></article>
          <article className="method-card yellow"><span className="number">02</span><Highlighter /><h3>找到证据</h3><p>从真实经历中找出优势、风险和可迁移能力，缺信息就先向你追问。</p></article>
          <article className="method-card coral"><span className="number">03</span><PencilLine /><h3>一起改好</h3><p>逐条解释修改理由，你可以编辑、恢复原文，确认后再进入最终版本。</p></article>
        </div>
      </section>

      <section className="truth-band">
        <div className="page-width truth-inner">
          <div className="truth-icon"><ShieldCheck /></div>
          <div><span>OUR PROMISE</span><h2>好的表达，不等于漂亮的编造。</h2><p>未经确认的推断、示例和占位数据不会进入导出简历。你的每一句话，都应该经得住面试追问。</p></div>
          <button className="cream-button" onClick={onStart}>开始整理我的经历</button>
        </div>
      </section>
    </div>
  )
}

type InputProps = {
  resumeFile: File | null; jd: string; jdImageFile: File | null; jdInputMode: JDInputMode; isAnalyzing: boolean; fileHover: boolean;
  fileInput: React.RefObject<HTMLInputElement | null>; setJD: (value: string) => void;
  changeJDInputMode: (mode: JDInputMode) => void;
  setFileHover: (value: boolean) => void; handleFiles: (files: FileList | null) => void;
  handleJDImage: (files: FileList | null) => void; removeFile: () => void; removeJDImage: () => void;
  useDemo: () => void; analyze: () => void; onBack: () => void;
}

function InputScreen(props: InputProps) {
  const jdImageInput = useRef<HTMLInputElement>(null)
  const [jdImageHover, setJDImageHover] = useState(false)

  return (
    <section className="flow-page page-width dotted-bg">
      <div className="flow-heading"><span className="eyebrow">STEP 01 · 添加材料</span><h1>先让我认识你和目标岗位</h1><p>信息越完整，诊断越准确。材料仅用于本次 AI 诊断，不会建立个人档案。</p></div>
      <div className="input-grid">
        <article className="paper-card">
          <div className="card-title"><span className="icon-box blue"><FileText /></span><div><small>ABOUT YOU</small><h2>添加你的简历</h2></div></div>
          {!props.resumeFile ? (
            <button
              className={`dropzone ${props.fileHover ? 'hover' : ''}`}
              onClick={() => props.fileInput.current?.click()}
              onDragOver={(e) => { e.preventDefault(); props.setFileHover(true) }}
              onDragLeave={() => props.setFileHover(false)}
              onDrop={(e) => { e.preventDefault(); props.setFileHover(false); props.handleFiles(e.dataTransfer.files) }}
            >
              <UploadCloud size={30} /><strong>拖放文件到这里，或点击上传</strong><span>支持 PDF、DOCX、PNG、JPG · 最大 10MB</span>
            </button>
          ) : (
            <div className="file-ready"><div className="file-icon">PDF</div><div><strong>{props.resumeFile.name}</strong><span>已就绪 · 将在本地模拟解析</span></div><button onClick={props.removeFile} aria-label="移除文件"><X /></button></div>
          )}
          <input ref={props.fileInput} type="file" hidden accept=".pdf,.docx,.png,.jpg,.jpeg" onChange={(e) => props.handleFiles(e.target.files)} />
          <div className="privacy-note"><LockKeyhole size={15} /><span><strong>隐私说明</strong>：点击诊断后，文件会加密发送给 AI 服务解析；本站默认不保存原文件。</span></div>
        </article>

        <article
          className={`paper-card jd-card ${jdImageHover ? 'jd-card-hover' : ''}`}
          onDragOver={(e) => {
            if (Array.from(e.dataTransfer.types).includes('Files')) {
              e.preventDefault()
              setJDImageHover(true)
            }
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setJDImageHover(false)
          }}
          onDrop={(e) => {
            if (!e.dataTransfer.files.length) return
            e.preventDefault()
            setJDImageHover(false)
            props.changeJDInputMode('image')
            props.handleJDImage(e.dataTransfer.files)
          }}
        >
          <div className="card-title"><span className="icon-box yellow"><BriefcaseBusiness /></span><div><small>YOUR TARGET</small><h2>添加目标岗位 JD</h2></div></div>
          <div className="jd-method-tabs" role="tablist" aria-label="岗位描述添加方式">
            <button role="tab" aria-selected={props.jdInputMode === 'text'} className={props.jdInputMode === 'text' ? 'active' : ''} onClick={() => props.changeJDInputMode('text')}><FileText /> 粘贴文字</button>
            <button role="tab" aria-selected={props.jdInputMode === 'link'} className={props.jdInputMode === 'link' ? 'active' : ''} onClick={() => props.changeJDInputMode('link')}><Link2 /> 招聘链接</button>
            <button role="tab" aria-selected={props.jdInputMode === 'image'} className={props.jdInputMode === 'image' ? 'active' : ''} onClick={() => props.changeJDInputMode('image')}><ImageUp /> 上传截图</button>
          </div>
          {props.jdInputMode === 'text' && <>
            <textarea className="jd-textarea" value={props.jd} onChange={(e) => props.setJD(e.target.value)} placeholder="请粘贴完整的岗位职责和任职要求…" aria-label="目标岗位描述" />
            <div className="textarea-footer"><span>{props.jd.length} 字</span><button onClick={() => props.setJD(demoJD)}>填入示例 JD</button></div>
          </>}
          {props.jdInputMode === 'link' && <div className="jd-link-panel">
            <div className="jd-link-input"><Link2 /><input type="url" value={props.jd} onChange={(e) => props.setJD(e.target.value)} placeholder="https://jobs.example.com/position/123" aria-label="招聘岗位链接" /></div>
            <p><Info /> 支持公开访问的招聘页面；需要登录或限制访问时，请改用文字或截图。</p>
          </div>}
          {props.jdInputMode === 'image' && <>
            {!props.jdImageFile ? <button
              className={`dropzone jd-dropzone ${jdImageHover ? 'hover' : ''}`}
              onClick={() => jdImageInput.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setJDImageHover(true) }}
              onDragLeave={() => setJDImageHover(false)}
              onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setJDImageHover(false); props.handleJDImage(e.dataTransfer.files) }}
            ><ImageUp size={30} /><strong>把 JD 图片拖到这里</strong><span>或点击选择 PNG、JPG 截图</span></button> :
            <div className="file-ready jd-image-ready"><div className="file-icon image">IMG</div><div><strong>{props.jdImageFile.name}</strong><span>截图已就绪 · 将进行文字识别</span></div><button onClick={props.removeJDImage} aria-label="移除 JD 截图"><X /></button></div>}
            <input ref={jdImageInput} type="file" hidden accept=".png,.jpg,.jpeg" onChange={(e) => props.handleJDImage(e.target.files)} />
          </>}
        </article>
      </div>
      <div className="input-tip"><Lightbulb size={20} /><span><strong>不知道从哪里开始？</strong> 使用准备好的产品经理案例，1 分钟体验完整流程。</span><button onClick={props.useDemo}>使用完整示例</button></div>
      <div className="flow-actions"><button className="secondary-button" onClick={props.onBack}><ArrowLeft size={17} /> 返回</button><button className="primary-button analyze" onClick={props.analyze} disabled={props.isAnalyzing}>{props.isAnalyzing ? <><span className="spinner" /> 正在阅读材料…</> : <>开始诊断 <WandSparkles size={18} /></>}</button></div>
    </section>
  )
}

function Diagnosis({ analysis, onBack, onNext }: { analysis: AnalysisResult; onBack: () => void; onNext: () => void }) {
  return (
    <section className="flow-page page-width diagnosis-page">
      <div className="diagnosis-head">
        <div><span className="eyebrow">STEP 02 · 简历诊断</span><h1>{analysis.headline}</h1><p>目标岗位：{analysis.job.title}{analysis.job.company ? ` · ${analysis.job.company}` : ''} · 诊断可信度{analysis.confidence}</p></div>
        <div className="score-card"><span>总体匹配度</span><strong>{analysis.overall_score}</strong><i>/ 100</i><small>{analysis.level}</small></div>
      </div>

      <div className="insight-row">
        <article className="insight success"><CircleCheckBig /><div><small>最强优势</small><h3>{analysis.strength.title}</h3><p>{analysis.strength.detail}</p></div></article>
        <article className="insight warn"><Highlighter /><div><small>优先改进</small><h3>{analysis.priority_improvement.title}</h3><p>{analysis.priority_improvement.detail}</p></div></article>
        <article className="insight question"><MessageCircleQuestion /><div><small>需要确认</small><h3>{analysis.question.title}</h3><p>{analysis.question.detail}</p></div></article>
      </div>

      <div className="diagnosis-grid">
        <article className="paper-card dimension-card">
          <div className="card-title compact"><div><small>DETAILS</small><h2>8 项诊断维度</h2></div><span className="score-explain"><Info size={14} /> 分数不是录取概率</span></div>
          <div className="dimension-list">
            {analysis.dimensions.map((item) => <div className="dimension" key={item.name}><div><strong>{item.name}</strong><span>{item.note}</span></div><div className="meter"><i className={item.tone} style={{ width: `${item.score}%` }} /></div><b>{item.score}</b></div>)}
          </div>
        </article>
        <aside className="priority-note">
          <div className="pin" />
          <span>MY TO-DO LIST</span><h2>这次先改 3 件事</h2>
          <ol>{analysis.priorities.map((item, index) => <li key={item.title}><b>{String(index + 1).padStart(2, '0')}</b><div><strong>{item.title}</strong><p>{item.action}</p></div></li>)}</ol>
          <div className="ask-box"><MessageCircleQuestion /><p><strong>有 1 个问题想问你</strong><br />{analysis.question.detail}</p></div>
        </aside>
      </div>
      <div className="flow-actions"><button className="secondary-button" onClick={onBack}><ArrowLeft size={17} /> 修改材料</button><button className="primary-button" onClick={onNext}>查看优化版 <ArrowRight size={18} /></button></div>
    </section>
  )
}

type WorkspaceProps = {
  items: ResumeItem[]; analysis: AnalysisResult; resumeFile: File | null; openReason: number | null; setOpenReason: (value: number | null) => void;
  updateItem: (id: number, text: string) => void; restoreItem: (id: number) => void; undo: () => void;
  onBack: () => void; onNext: () => void;
}

function Workspace(props: WorkspaceProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const groups = groupResumeItems(props.items)

  return (
    <section className="workspace-page page-width">
      <div className="workspace-head"><div><span className="eyebrow">STEP 03 · 对比优化</span><h1>左边原稿，右边只改该改的</h1><p>左侧保留上传文件的原始版式；右侧沿用简历排版，并在正文中直接显示修订痕迹。</p></div><button className="secondary-button small" onClick={props.undo}><RotateCcw size={15} /> 撤销</button></div>
      <div className="diff-toolbar">
        <div className="diff-legend" aria-label="修改颜色说明"><span><i className="legend-added" /> 新增内容</span><span><i className="legend-removed" /> 删除或被替换</span><span><i className="legend-equal" /> 未修改</span></div>
      </div>
      <div className="document-compare-grid">
        <section className="document-pane original-document-pane">
          <div className="document-pane-label"><div><strong>原版简历</strong><span>上传文件原样展示</span></div><span className="view-badge">仅查看</span></div>
          <OriginalResumePreview file={props.resumeFile} analysis={props.analysis} groups={groups} />
        </section>
        <section className="document-pane optimized-document-pane">
          <div className="document-pane-label"><div><strong>针对性优化版</strong><span>参考原版结构 · 显示修订痕迹</span></div><span className="edit-badge">可编辑</span></div>
          <ResumeDocument
            mode="optimized"
            analysis={props.analysis}
            groups={groups}
            editingId={editingId}
            openReason={props.openReason}
            onEdit={setEditingId}
            onChange={props.updateItem}
            onRestore={props.restoreItem}
            onToggleReason={(id) => props.setOpenReason(props.openReason === id ? null : id)}
          />
        </section>
      </div>
      <div className="gap-callout"><div className="gap-icon">?</div><div><span>EXPERIENCE GAP</span><h3>{props.analysis.gap.title}</h3><p>{props.analysis.gap.detail}</p></div><button className="secondary-button small" onClick={() => props.setOpenReason(props.items[0]?.id ?? null)}>查看相关修改</button></div>
      <div className="flow-actions"><button className="secondary-button" onClick={props.onBack}><ArrowLeft size={17} /> 返回诊断</button><button className="primary-button" onClick={props.onNext}>确认并导出 <ArrowRight size={18} /></button></div>
    </section>
  )
}

function OriginalResumePreview({ file, analysis, groups }: { file: File | null; analysis: AnalysisResult; groups: { title: string; items: ResumeItem[] }[] }) {
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!file || (!file.type.startsWith('image/') && file.type !== 'application/pdf')) {
      setPreviewUrl('')
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  if (previewUrl && file?.type === 'application/pdf') return <div className="original-file-shell"><iframe title="上传的原版简历 PDF" src={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`} /></div>
  if (previewUrl && file?.type.startsWith('image/')) return <div className="original-file-shell image-file"><img src={previewUrl} alt="上传的原版简历" /></div>
  return <ResumeDocument mode="original" analysis={analysis} groups={groups} />
}

const parseResumeSection = (title: string) => {
  const parts = title.split('｜').map((part) => part.trim()).filter(Boolean)
  const category = parts[0] || '简历正文'
  if (parts.length === 1) return { category, title: '', role: '', date: '' }
  const date = parts.at(-1) || ''
  let mainTitle = parts[1] || ''
  let role = parts.slice(2, -1).join(' · ')
  if (!role && mainTitle.includes('·')) {
    const splitAt = mainTitle.lastIndexOf('·')
    role = mainTitle.slice(splitAt + 1).trim()
    mainTitle = mainTitle.slice(0, splitAt).trim()
  }
  return { category, title: mainTitle, role, date }
}

type ResumeDocumentProps = {
  mode: 'original' | 'optimized' | 'final'; analysis: AnalysisResult; groups: { title: string; items: ResumeItem[] }[];
  editingId?: number | null; openReason?: number | null; onEdit?: (id: number | null) => void;
  onChange?: (id: number, value: string) => void; onRestore?: (id: number) => void; onToggleReason?: (id: number) => void;
}

function ResumeDocument(props: ResumeDocumentProps) {
  return <article className={`classic-resume-page ${props.mode}`}>
    <header className="classic-resume-header">
      <div className="classic-resume-identity">
        <h2>{props.analysis.candidate.name}</h2>
        <p><strong>求职意向：</strong>{props.analysis.job.title}</p>
        <p>{props.analysis.candidate.contact}</p>
      </div>
      <div className="resume-photo-placeholder"><span>{props.analysis.candidate.name.slice(0, 1)}</span><small>照片沿用原版</small></div>
    </header>
    {props.groups.map((group, groupIndex) => {
      const parsed = parseResumeSection(group.title)
      const previousCategory = groupIndex ? parseResumeSection(props.groups[groupIndex - 1].title).category : ''
      return <section className="classic-resume-section" key={group.title}>
        {parsed.category !== previousCategory && <h3>{parsed.category}</h3>}
        {parsed.title && <div className="classic-entry-meta"><strong>{parsed.date}</strong><b>{parsed.title}</b><span>{parsed.role}</span></div>}
        <div className="classic-entry-body">
          {group.items.map((item) => <ResumeContentBlock
            key={item.id}
            item={item}
            mode={props.mode}
            editing={props.editingId === item.id}
            openReason={props.openReason === item.id}
            onEdit={() => props.onEdit?.(props.editingId === item.id ? null : item.id)}
            onChange={(value) => props.onChange?.(item.id, value)}
            onRestore={() => props.onRestore?.(item.id)}
            onToggleReason={() => props.onToggleReason?.(item.id)}
          />)}
        </div>
      </section>
    })}
  </article>
}

function DiffText({ original, optimized, side }: { original: string; optimized: string; side: 'original' | 'optimized' }) {
  const parts = diffText(original, optimized)
  return <p className={`tracked-text ${side}`}>{parts.map((part, index) => {
    if (side === 'original' && part.type === 'added') return null
    if (side === 'optimized' && part.type === 'removed') return <del key={index}>{part.value}</del>
    if (part.type === 'added') return <ins key={index}>{part.value}</ins>
    if (part.type === 'removed') return <mark key={index}>{part.value}</mark>
    return <span key={index}>{part.value}</span>
  })}</p>
}

type ResumeContentBlockProps = {
  item: ResumeItem; mode: 'original' | 'optimized' | 'final'; editing: boolean; openReason: boolean;
  onEdit: () => void; onChange: (value: string) => void;
  onRestore: () => void; onToggleReason: () => void;
}

function ResumeContentBlock(props: ResumeContentBlockProps) {
  const changed = props.item.original !== props.item.optimized
  if (props.mode === 'original') return <p className="classic-resume-line">{props.item.original}</p>
  if (props.mode === 'final') return <p className="classic-resume-line">{props.item.optimized}</p>
  return <div className={`resume-diff-block ${changed ? 'has-change' : 'unchanged'}`}>
    <div className="resume-entry-actions"><span>{changed ? '已修改' : '未修改'}</span><button onClick={props.onRestore} disabled={!changed}><RotateCcw size={12} /> 恢复</button><button onClick={props.onEdit}><PencilLine size={12} /> {props.editing ? '完成' : '编辑'}</button>{changed && <button onClick={props.onToggleReason}><Lightbulb size={12} /> 依据 <ChevronDown size={12} className={props.openReason ? 'turn' : ''} /></button>}</div>
    {props.editing && <div className="inline-editor"><textarea autoFocus value={props.item.optimized} onChange={(e) => props.onChange(e.target.value)} aria-label="编辑优化后的简历内容" /><small>下方实时显示修订痕迹</small></div>}
    <DiffText original={props.item.original} optimized={props.item.optimized} side="optimized" />
    {changed && props.openReason && <div className="reason-panel"><p>{props.item.reason}</p><div><span>对应 JD</span>{props.item.jd}</div><div><span>事实状态</span><ShieldCheck size={13} /> {props.item.status}</div></div>}
  </div>
}

type ExportProps = { items: ResumeItem[]; analysis: AnalysisResult; checked: boolean; setChecked: (v: boolean) => void; onBack: () => void; exportDoc: () => void; exportReport: () => void; exportPDF: () => void; deleteData: () => void }

function ExportScreen(props: ExportProps) {
  const groups = groupResumeItems(props.items)
  const changedCount = props.items.filter((item) => item.original !== item.optimized).length
  return (
    <section className="flow-page page-width export-page dotted-bg">
      <div className="flow-heading"><span className="eyebrow">STEP 04 · 确认导出</span><h1>最后检查一次，就可以出发了</h1><p>优化版共 {changedCount} 处重点修改，所有内容均来自已有事实或你的确认。</p></div>
      <div className="export-grid">
        <div className="export-resume-preview">
          <div className="export-preview-label"><span>最终简历预览</span><small>A4 · 深蓝单栏版</small></div>
          <ResumeDocument mode="final" analysis={props.analysis} groups={groups} />
          <div className="ats-badge"><CircleCheckBig /> ATS 基础检查通过</div>
        </div>
        <div className="export-options">
          <article className="truth-check"><div className="truth-check-head"><ShieldCheck /><div><small>TRUTH CHECK</small><h2>真实性确认</h2></div></div><ul><li><Check /> 没有虚构公司、项目或职责</li><li><Check /> 所有数字来自原简历或用户确认</li><li><Check /> 未确认推断未进入最终版本</li><li><Check /> 简历中没有虚拟示例</li></ul><label className={props.checked ? 'check-row checked' : 'check-row'}><input type="checkbox" checked={props.checked} onChange={(e) => props.setChecked(e.target.checked)} /><span>{props.checked && <Check size={15} />}</span>我已检查以上内容，确认信息真实可证明</label></article>
          <article className="download-card"><small>CHOOSE A FORMAT</small><h2>下载你的针对性简历</h2><div className="download-buttons"><button onClick={props.exportDoc} disabled={!props.checked}><FileText /> <span><strong>DOCX 文档</strong><small>继续编辑内容</small></span><Download /></button><button onClick={props.exportPDF} disabled={!props.checked}><FileText /> <span><strong>PDF 文件</strong><small>通过打印保存</small></span><Download /></button><button onClick={props.exportReport} disabled={!props.checked}><Highlighter /> <span><strong>修改报告</strong><small>保留诊断与理由</small></span><Download /></button></div>{!props.checked && <p className="disabled-tip"><Info size={14} /> 完成真实性确认后即可下载</p>}</article>
        </div>
      </div>
      <div className="delete-note"><LockKeyhole /><div><strong>你的材料由你掌控</strong><p>本站不建立个人档案；诊断请求设置为不保存模型响应。</p></div><button onClick={props.deleteData}><Trash2 size={15} /> 删除本次数据</button></div>
      <div className="flow-actions"><button className="secondary-button" onClick={props.onBack}><ArrowLeft size={17} /> 返回修改</button></div>
    </section>
  )
}

export default App

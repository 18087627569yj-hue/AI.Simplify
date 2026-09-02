import type { AnalysisMode, AnalysisResult, PendingImage } from '../shared/types';

export interface AnalyzeInput {
  image: PendingImage;
  mode: AnalysisMode;
  adjustment?: string;
  onStage?: (stage: string) => void;
}

export interface VisionAnalyzer {
  analyze(input: AnalyzeInput): Promise<AnalysisResult>;
}

const wait = (duration: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, duration));

const generalPrompt =
  '画面呈现一处具有当代设计语言的核心场景，主体位于视觉中心略偏下区域，前景、中景与背景形成清晰的空间层次。采用平视偏广角构图，视线沿主要结构和环境边界自然延伸，主体轮廓明确，细部材质具有真实触感。环境以克制的几何秩序组织，表面包含细腻的纹理、柔和反射与局部磨砂质感，背景信息适度虚化以突出主体。自然光从画面侧上方进入，形成柔和明暗过渡和干净阴影，局部高光强调边缘与材质变化。整体使用低饱和暖灰、米白与少量深色作为对比，氛围安静、精致而富有叙事感。视觉风格结合写实摄影与高品质建筑可视化，细节清晰，比例准确，具有专业设计杂志般的完成度。';

const crowdPrompt =
  '生成一张用于建筑与规划汇报的人群行为分析图，采用轴测或轻微俯视视角，以低饱和灰白底图呈现完整场地、建筑轮廓、道路、绿地和主要公共空间。空间结构保持清晰的层级关系，通过简洁线稿、半透明色块和柔和投影区分不同功能区域。人物使用统一的扁平化剪影或简化模型表现，按照停留、步行、交谈、休憩、运动和亲子活动等类别分组布置，数量适中并符合真实空间尺度。使用方向箭头、虚线轨迹、圆形热点和编号标注表达行为路径与聚集强度，重点区域以橙红或珊瑚色强调，辅助信息采用蓝绿和浅灰色。整体排版克制、留白充分，图例与标注系统一致，兼具信息清晰度和视觉秩序，适用于建筑设计展板、城市公共空间研究与规划汇报。';

export const mockAnalyzer: VisionAnalyzer = {
  async analyze({ mode, adjustment, onStage }) {
    onStage?.('读取图片');
    await wait(420);
    onStage?.('分析构图与风格');
    await wait(560);
    onStage?.('整理提示词');
    await wait(480);

    const resolvedMode = mode === 'crowd_analysis' ? 'crowd_analysis' : 'general';
    const prompt = resolvedMode === 'crowd_analysis' ? crowdPrompt : generalPrompt;
    const adjustmentText = adjustment?.trim()
      ? ` 已按“${adjustment.trim()}”方向进行表达调整。`
      : '';

    return {
      mode: resolvedMode,
      confidence: mode === 'auto' ? 0.82 : 1,
      prompt: `${prompt}${adjustmentText}`,
      usageAdvice:
        '可直接粘贴到常用生图工具中，再根据目标平台补充分辨率、画幅和风格强度。正式模型接入后，内容将根据所选图片动态生成。',
      editableTags:
        resolvedMode === 'crowd_analysis'
          ? {
              subject: ['人群行为', '公共空间'],
              composition: ['轴测视角', '规划分析图'],
              lighting: ['柔和投影'],
              palette: ['灰白底图', '橙红强调'],
              style: ['建筑汇报', '信息可视化'],
            }
          : {
              subject: ['核心场景', '当代设计'],
              composition: ['平视广角', '三层景深'],
              lighting: ['自然侧光', '柔和阴影'],
              palette: ['暖灰', '米白', '深色点缀'],
              style: ['写实摄影', '建筑可视化'],
            },
      isMock: true,
    };
  },
};

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { mockAnalyzer } from '../../src/lib/analyzer';
import {
  addHistory,
  clearHistory,
  deleteHistory,
  getHistory,
} from '../../src/lib/history';
import { pickImageFromClipboard, prepareLocalImage } from '../../src/lib/image';
import type {
  AnalysisMode,
  AnalysisResult,
  HistoryItem,
  PendingImage,
} from '../../src/shared/types';
import { STORAGE_KEYS } from '../../src/shared/types';

type IconName =
  | 'arrow-left'
  | 'check'
  | 'clock'
  | 'copy'
  | 'history'
  | 'image'
  | 'refresh'
  | 'sparkles'
  | 'trash'
  | 'upload';

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    'arrow-left': <path d="m15 18-6-6 6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    copy: (
      <>
        <rect width="12" height="12" x="9" y="9" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </>
    ),
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5M12 7v5l3 2" />
      </>
    ),
    image: (
      <>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7h-5V2" />
        <path d="M20 7a9 9 0 1 0 1 8" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3-1.3 3.7L7 8l3.7 1.3L12 13l1.3-3.7L17 8l-3.7-1.3L12 3Z" />
        <path d="m5 14-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14ZM19 13l-.7 1.8-1.8.7 1.8.7L19 18l.7-1.8 1.8-.7-1.8-.7L19 13Z" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4M7 9l5-5 5 5" />
        <path d="M20 15v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const modeOptions: Array<{
  value: AnalysisMode;
  label: string;
  description: string;
}> = [
  { value: 'auto', label: '自动判断', description: '模型接入后自动选择' },
  { value: 'general', label: '通用图片', description: '摄影、效果图、海报' },
  {
    value: 'crowd_analysis',
    label: '人群分析图',
    description: '建筑与规划行为分析',
  },
];

const quickAdjustments = ['更写实', '强化构图', '强化材质', '更简洁'];

function getSourceLabel(image: PendingImage) {
  if (image.source === 'upload') return image.fileName || '本地上传';
  if (image.source === 'paste') return '剪贴板图片';
  try {
    return new URL(image.pageUrl || image.src).hostname;
  } catch {
    return '网页图片';
  }
}

function App() {
  const [image, setImage] = useState<PendingImage | null>(null);
  const [mode, setMode] = useState<AnalysisMode>('auto');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stage, setStage] = useState('');
  const [error, setError] = useState('');
  const [previewFailed, setPreviewFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [adjustment, setAdjustment] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback(async (nextImage: PendingImage) => {
    setImage(nextImage);
    setResult(null);
    setError('');
    setPreviewFailed(false);
    setShowHistory(false);
    setMode('auto');
    setAdjustment('');
    await browser.storage.local.set({ [STORAGE_KEYS.pendingImage]: nextImage });
  }, []);

  useEffect(() => {
    void browser.storage.local.get(STORAGE_KEYS.pendingImage).then((stored) => {
      const pending = stored[STORAGE_KEYS.pendingImage] as PendingImage | undefined;
      if (pending) setImage(pending);
    });
    void getHistory().then(setHistory);

    const onStorageChange = (
      changes: Record<string, Browser.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName !== 'local') return;
      const pendingChange = changes[STORAGE_KEYS.pendingImage];
      if (pendingChange?.newValue) {
        setImage(pendingChange.newValue as PendingImage);
        setResult(null);
        setError('');
        setPreviewFailed(false);
        setShowHistory(false);
        setMode('auto');
        setAdjustment('');
      }
      const historyChange = changes[STORAGE_KEYS.history];
      if (historyChange) {
        setHistory((historyChange.newValue as HistoryItem[] | undefined) ?? []);
      }
    };
    browser.storage.onChanged.addListener(onStorageChange);

    const onPaste = (event: ClipboardEvent) => {
      const file = pickImageFromClipboard(event);
      if (!file) return;
      event.preventDefault();
      void prepareLocalImage(file, 'paste')
        .then(loadImage)
        .catch((caught: unknown) =>
          setError(caught instanceof Error ? caught.message : '粘贴图片失败。'),
        );
    };
    window.addEventListener('paste', onPaste);

    return () => {
      browser.storage.onChanged.removeListener(onStorageChange);
      window.removeEventListener('paste', onPaste);
    };
  }, [loadImage]);

  const handleFile = useCallback(
    async (file?: File) => {
      if (!file) return;
      try {
        setError('');
        const prepared = await prepareLocalImage(file, 'upload');
        await loadImage(prepared);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : '读取图片失败。');
      }
    },
    [loadImage],
  );

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    void handleFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void handleFile(Array.from(event.dataTransfer.files)[0]);
  };

  const runAnalysis = async () => {
    if (!image || isAnalyzing) return;
    setIsAnalyzing(true);
    setResult(null);
    setError('');
    setCopied(false);
    try {
      const nextResult = await mockAnalyzer.analyze({
        image,
        mode,
        adjustment,
        onStage: setStage,
      });
      setResult(nextResult);
      const item: HistoryItem = {
        id: crypto.randomUUID(),
        image: {
          ...image,
          src: image.thumbnailSrc || image.src,
        },
        result: nextResult,
        createdAt: Date.now(),
      };
      setHistory(await addHistory(item));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '生成失败，请稍后重试。');
    } finally {
      setIsAnalyzing(false);
      setStage('');
    }
  };

  const copyText = async (includeAdvice = false) => {
    if (!result) return;
    const text = includeAdvice
      ? `${result.prompt}\n\n使用建议：${result.usageAdvice}`
      : result.prompt;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const restoreHistory = async (item: HistoryItem) => {
    setImage(item.image);
    setResult(item.result);
    setMode(item.result.mode);
    setShowHistory(false);
    setPreviewFailed(false);
    setError('');
    await browser.storage.local.set({
      [STORAGE_KEYS.pendingImage]: item.image,
    });
  };

  const promptLength = useMemo(
    () => (result ? Array.from(result.prompt).length : 0),
    [result],
  );

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Icon name="sparkles" size={19} />
          </div>
          <div>
            <div className="brand-name">Prompt Lens</div>
            <div className="brand-subtitle">AI.Simplify</div>
          </div>
        </div>
        <button
          className={`icon-button ${showHistory ? 'active' : ''}`}
          type="button"
          aria-label="查看历史"
          title="查看历史"
          onClick={() => setShowHistory((value) => !value)}
        >
          <Icon name={showHistory ? 'arrow-left' : 'history'} />
          {history.length > 0 && !showHistory ? (
            <span className="history-count">{history.length}</span>
          ) : null}
        </button>
      </header>

      <div className="dev-banner">
        <span className="dev-dot" />
        本地原型 · 当前使用 Mock 结果，未连接模型
      </div>

      {showHistory ? (
        <HistoryView
          items={history}
          onRestore={(item) => void restoreHistory(item)}
          onDelete={(id) => void deleteHistory(id).then(setHistory)}
          onClear={() => void clearHistory().then(setHistory)}
        />
      ) : (
        <div className="content">
          {image ? (
            <>
              <section className="preview-section" aria-label="图片预览">
                <div className="section-heading-row">
                  <div>
                    <p className="eyebrow">当前图片</p>
                    <p className="source-label" title={image.pageTitle || image.fileName}>
                      {getSourceLabel(image)}
                    </p>
                  </div>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => inputRef.current?.click()}
                  >
                    更换图片
                  </button>
                </div>
                <div className="image-frame">
                  {!previewFailed ? (
                    <img
                      src={image.src}
                      alt="待分析图片预览"
                      referrerPolicy="no-referrer"
                      onError={() => setPreviewFailed(true)}
                    />
                  ) : (
                    <div className="preview-error">
                      <Icon name="image" size={28} />
                      <strong>网页阻止了图片预览</strong>
                      <span>请将图片复制后粘贴，或从本地上传。</span>
                      <button
                        className="secondary-button compact"
                        type="button"
                        onClick={() => inputRef.current?.click()}
                      >
                        <Icon name="upload" size={16} />
                        本地上传
                      </button>
                    </div>
                  )}
                  <span className="source-pill">
                    {image.source === 'web'
                      ? '网页图片'
                      : image.source === 'paste'
                        ? '剪贴板'
                        : '本地图片'}
                  </span>
                </div>
              </section>

              <section className="panel-section">
                <div className="section-title-row">
                  <h2>选择分析模式</h2>
                  <span className="optional-label">可随时修改</span>
                </div>
                <div className="mode-grid">
                  {modeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`mode-card ${mode === option.value ? 'selected' : ''}`}
                      onClick={() => {
                        setMode(option.value);
                        setResult(null);
                      }}
                    >
                      <span className="mode-radio">
                        {mode === option.value ? <span /> : null}
                      </span>
                      <span>
                        <strong>{option.label}</strong>
                        <small>{option.description}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="panel-section adjustment-section">
                <div className="section-title-row">
                  <h2>调整方向</h2>
                  <span className="optional-label">选填</span>
                </div>
                <div className="chip-row">
                  {quickAdjustments.map((item) => (
                    <button
                      className={adjustment === item ? 'chip selected' : 'chip'}
                      type="button"
                      key={item}
                      onClick={() => setAdjustment(adjustment === item ? '' : item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <input
                  className="adjustment-input"
                  value={adjustment}
                  maxLength={100}
                  placeholder="或输入一句修改要求"
                  onChange={(event) => setAdjustment(event.target.value)}
                />
              </section>

              {error ? <div className="error-message">{error}</div> : null}

              <button
                className="primary-button"
                type="button"
                disabled={isAnalyzing || previewFailed}
                onClick={() => void runAnalysis()}
              >
                {isAnalyzing ? (
                  <>
                    <span className="spinner" />
                    {stage || '正在分析'}
                  </>
                ) : (
                  <>
                    <Icon name="sparkles" />
                    {result ? '重新生成' : '开始反推提示词'}
                  </>
                )}
              </button>

              {result ? (
                <ResultCard
                  result={result}
                  promptLength={promptLength}
                  copied={copied}
                  onCopy={(includeAdvice) => void copyText(includeAdvice)}
                  onRegenerate={() => void runAnalysis()}
                />
              ) : null}
            </>
          ) : (
            <EmptyState
              isDragging={isDragging}
              onBrowse={() => inputRef.current?.click()}
              onDragState={setIsDragging}
              onDrop={handleDrop}
            />
          )}
        </div>
      )}

      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInput}
      />
    </main>
  );
}

function EmptyState({
  isDragging,
  onBrowse,
  onDragState,
  onDrop,
}: {
  isDragging: boolean;
  onBrowse: () => void;
  onDragState: (value: boolean) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <section className="empty-state">
      <div className="empty-visual">
        <div className="mock-browser">
          <div className="browser-bar">
            <i />
            <i />
            <i />
          </div>
          <div className="mock-photo">
            <Icon name="image" size={30} />
          </div>
          <div className="mock-menu">
            <Icon name="sparkles" size={14} />
            反推提示词
          </div>
        </div>
      </div>
      <h1>从一张图片开始</h1>
      <p className="empty-description">
        在任意网页图片上点击右键，选择“反推提示词”，图片会自动出现在这里。
      </p>
      <div className="instruction-card">
        <span>1</span>
        <div>
          <strong>网页图片右键</strong>
          <small>选择菜单中的“反推提示词”</small>
        </div>
      </div>
      <div className="or-divider"><span>或者</span></div>
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault();
          onDragState(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => onDragState(false)}
        onDrop={onDrop}
      >
        <Icon name="upload" size={22} />
        <strong>拖入图片或粘贴</strong>
        <span>支持 JPEG、PNG、WebP，最大 10 MB</span>
        <button className="secondary-button" type="button" onClick={onBrowse}>
          选择本地图片
        </button>
      </div>
      <p className="privacy-note">本地原型不会向任何服务器发送图片</p>
    </section>
  );
}

function ResultCard({
  result,
  promptLength,
  copied,
  onCopy,
  onRegenerate,
}: {
  result: AnalysisResult;
  promptLength: number;
  copied: boolean;
  onCopy: (includeAdvice: boolean) => void;
  onRegenerate: () => void;
}) {
  return (
    <section className="result-card">
      <div className="result-header">
        <div>
          <p className="eyebrow">生成结果</p>
          <h2>{result.mode === 'crowd_analysis' ? '人群行为分析图' : '通用图片提示词'}</h2>
        </div>
        <span className="mock-badge">MOCK</span>
      </div>
      <div className="prompt-box">
        <p>{result.prompt}</p>
        <div className="prompt-meta">
          <span>{promptLength} 字</span>
          <span>置信度 {Math.round(result.confidence * 100)}%</span>
        </div>
      </div>
      <div className="tag-list">
        {Object.values(result.editableTags)
          .flat()
          .slice(0, 7)
          .map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
      </div>
      <div className="advice-box">
        <strong>使用建议</strong>
        <p>{result.usageAdvice}</p>
      </div>
      <div className="result-actions">
        <button className="copy-button" type="button" onClick={() => onCopy(false)}>
          <Icon name={copied ? 'check' : 'copy'} size={17} />
          {copied ? '已复制' : '复制提示词'}
        </button>
        <button className="action-button" type="button" onClick={() => onCopy(true)}>
          复制全部
        </button>
        <button className="action-button square" type="button" onClick={onRegenerate} title="重新生成">
          <Icon name="refresh" size={17} />
        </button>
      </div>
    </section>
  );
}

function HistoryView({
  items,
  onRestore,
  onDelete,
  onClear,
}: {
  items: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="history-view">
      <div className="history-heading">
        <div>
          <p className="eyebrow">保存在本机</p>
          <h1>最近记录</h1>
        </div>
        {items.length > 0 ? (
          <button className="text-button danger" type="button" onClick={onClear}>
            清空全部
          </button>
        ) : null}
      </div>
      {items.length === 0 ? (
        <div className="history-empty">
          <Icon name="clock" size={30} />
          <strong>还没有历史记录</strong>
          <span>完成一次反推后，结果会显示在这里。</span>
        </div>
      ) : (
        <div className="history-list">
          {items.map((item) => (
            <article className="history-item" key={item.id}>
              <button className="history-main" type="button" onClick={() => onRestore(item)}>
                <img src={item.image.thumbnailSrc || item.image.src} alt="历史图片缩略图" />
                <span className="history-info">
                  <strong>
                    {item.result.mode === 'crowd_analysis' ? '人群行为分析图' : '通用图片'}
                  </strong>
                  <small>{new Date(item.createdAt).toLocaleString('zh-CN', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}</small>
                  <span>{item.result.prompt.slice(0, 42)}…</span>
                </span>
              </button>
              <button
                className="delete-button"
                type="button"
                aria-label="删除记录"
                title="删除记录"
                onClick={() => onDelete(item.id)}
              >
                <Icon name="trash" size={16} />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default App;

import React, {useState, useEffect} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {driver} from 'driver.js';
import 'driver.js/dist/driver.css';
import {
  Briefcase,
  Cpu,
  Download,
  Edit3,
  Eye,
  FileText,
  Layers,
  Mail,
  Phone,
  Settings2,
  User,
  Wrench,
  GraduationCap,
  Award,
  Book,
  Code,
  Globe,
  Heart,
  Star,
  Target,
  Zap,
  Lightbulb,
  Compass,
  Smartphone,
  AtSign,
  Send,
  Link,
  Github,
  Linkedin
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase, Cpu, FileText, Layers, User, Wrench, GraduationCap, Award, Book, Code, Globe, Heart, Star, Target, Zap, Lightbulb, Compass, Phone, Mail, Smartphone, AtSign, Send, Link, Github, Linkedin
};
import MilkdownEditor from './components/MilkdownEditor';
import {cn} from './lib/utils';
import DEFAULT_MARKDOWN from './constants/template.md?raw';

type EditorMode = 'source' | 'milkdown';

type LayoutConfig = {
  marginX: number;
  marginY: number;
  lineHeight: number;
  h1Size: number;
  h2Size: number;
  h3Size: number;
  h4Size: number;
  bodySize: number;
};

const FONT_OPTIONS = [
  {
    label: '系统无衬线',
    value:
      '-apple-system, BlinkMacSystemFont, "SF Pro SC", "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  {label: '思源黑体', value: '"Noto Sans SC", sans-serif'},
  {label: '思源宋体', value: '"Noto Serif SC", serif'},
  {label: '霞鹜文楷', value: '"LXGW WenKai Screen", sans-serif'},
  {label: '微软雅黑', value: '"Microsoft YaHei", sans-serif'},
];

const DEFAULT_LAYOUT: LayoutConfig = {
  marginX: 12,
  marginY: 10,
  lineHeight: 1.7,
  h1Size: 30,
  h2Size: 18,
  h3Size: 16,
  h4Size: 14.5,
  bodySize: 13.5,
};

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object' && 'props' in node) {
    return extractText((node as {props?: {children?: React.ReactNode}}).props?.children);
  }
  return '';
}

function splitTitleAndDate(content: string) {
  const parts = content.split('|');
  if (parts.length > 1) {
    return {
      title: parts[0]?.trim() ?? '',
      meta: parts.slice(1).join('|').trim(),
    };
  }

  const dateRegex =
    /((?:\d{4}[./-]\d{1,2}|至今|Present|present|Now|now)\s*[-~]\s*(?:\d{4}[./-]\d{1,2}|至今|Present|present|Now|now))$/;
  const match = content.match(dateRegex);

  if (!match) {
    return {title: content.trim(), meta: ''};
  }

  return {
    title: content.replace(dateRegex, '').trim(),
    meta: match[0].trim(),
  };
}

function getDefaultIconName(text: string) {
  const normalized = text.toLowerCase();

  if (
    normalized.includes('experience') ||
    normalized.includes('work') ||
    normalized.includes('工作') ||
    (normalized.includes('经历') && !normalized.includes('项目'))
  ) {
    return 'Briefcase';
  }

  if (normalized.includes('project') || normalized.includes('项目')) {
    return 'Layers';
  }

  if (
    normalized.includes('education') ||
    normalized.includes('教育')
  ) {
    return 'GraduationCap';
  }

  if (
    normalized.includes('summary') ||
    normalized.includes('profile') ||
    normalized.includes('评价') ||
    normalized.includes('总结') ||
    normalized.includes('评估')
  ) {
    return 'Compass';
  }

  if (
    normalized.includes('skill') ||
    normalized.includes('技术') ||
    normalized.includes('技能')
  ) {
    return 'Cpu';
  }

  if (
    normalized.includes('award') ||
    normalized.includes('荣誉') ||
    normalized.includes('获奖') ||
    normalized.includes('证书')
  ) {
    return 'Award';
  }

  return 'Wrench';
}

function normalizeHref(href?: string) {
  if (!href) return undefined;

  const decoded = decodeURIComponent(href);
  const mailtoMatch = decoded.match(/mailto:([^&\s]+)/i);
  if (mailtoMatch) {
    return `mailto:${mailtoMatch[1]}`;
  }

  if (href.startsWith('mailto:') || href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }

  return undefined;
}

export default function App() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [editorMode, setEditorMode] = useState<EditorMode>('milkdown');
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);
  const [showSettings, setShowSettings] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState(DEFAULT_LAYOUT);
  // Initial custom icon map to handle the dynamic generation logic correctly.
  const [customIcons, setCustomIcons] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('resume-custom-icons');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });
  const [iconPickerTarget, setIconPickerTarget] = useState<string | null>(null);

  const updateLayout = (key: keyof LayoutConfig, value: number) => {
    setLayoutConfig((previous) => ({...previous, [key]: value}));
  };

  // Add onboarding logic using driver.js
  React.useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenResumeOnboarding');
    if (!hasSeenOnboarding) {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        nextBtnText: '下一步',
        prevBtnText: '上一步',
        doneBtnText: '完成',
        steps: [
          {
            element: '.action-buttons',
            popover: {
              title: '控制面板',
              description: '这里可以调整字体、间距、下载Markdown或直接打印PDF。',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '.custom-icon-trigger',
            popover: {
              title: '自定义图标',
              description: '点击这个小图标可以自由切换你喜欢的样式！电话和邮箱的图标也同样支持点击切换哦。',
              side: 'right',
              align: 'center'
            }
          },
          {
            element: '.editor-tabs',
            popover: {
              title: '编辑模式',
              description: '你可以选择源码模式或Milkdown模式（更接近所见即所得）来编辑你的简历内容。',
              side: 'bottom',
              align: 'start'
            }
          }
        ],
        onDestroyStarted: () => {
          localStorage.setItem('hasSeenResumeOnboarding', 'true');
          driverObj.destroy();
        }
      });
      
      // small delay to ensure DOM is fully rendered
      setTimeout(() => {
        driverObj.drive();
      }, 500);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdown], {type: 'text/markdown;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resume.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const components = {
    h1: ({children}: {children: React.ReactNode}) => (
      <h1 style={{fontSize: `${layoutConfig.h1Size}px`}} className="mb-1 mt-0 font-bold leading-tight text-black">
        {children}
      </h1>
    ),
    h2: ({children}: {children: React.ReactNode}) => {
      const text = extractText(children);
      const rawText = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s()/&+\-]/g, '').trim();
      const currentIconName = customIcons[rawText] || getDefaultIconName(text);
      const Icon = ICON_MAP[currentIconName] || Wrench;

      return (
        <h2
          style={{fontSize: `${layoutConfig.h2Size}px`}}
          className="mt-5 mb-3 flex items-center gap-2 border-b border-black pb-1.5 font-bold relative group"
        >
          <div
            className="custom-icon-trigger flex cursor-pointer items-center justify-center rounded-full bg-zinc-100 p-1.5 transition-colors hover:bg-zinc-200"
            onClick={() => setIconPickerTarget(rawText)}
            title="点击切换图标"
          >
            <Icon size={layoutConfig.h2Size - 2} strokeWidth={2.5} className="text-black" />
          </div>
          {rawText}
        </h2>
      );
    },
    h3: ({children}: {children: React.ReactNode}) => {
      const content = extractText(children);
      const {title, meta} = splitTitleAndDate(content);

      return (
        <div className="mb-1 mt-3 flex items-baseline justify-between gap-4">
          <span style={{fontSize: `${layoutConfig.h3Size}px`}} className="font-bold text-black">
            {title}
          </span>
          {meta ? (
            <span
              style={{fontSize: `${layoutConfig.h3Size - 1.5}px`}}
              className="shrink-0 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-0.5 font-bold text-black"
            >
              {meta}
            </span>
          ) : null}
        </div>
      );
    },
    h4: ({children}: {children: React.ReactNode}) => {
      const content = extractText(children);
      const {title, meta} = splitTitleAndDate(content);

      if (meta) {
        return (
          <div className="mb-1 mt-2 flex items-baseline justify-between gap-4">
            <span style={{fontSize: `${layoutConfig.h4Size}px`}} className="font-bold text-black">
              {title}
            </span>
            <span style={{fontSize: `${layoutConfig.h4Size - 0.5}px`}} className="shrink-0 font-bold text-black">
              {meta}
            </span>
          </div>
        );
      }

      return (
        <h4 style={{fontSize: `${layoutConfig.h4Size}px`}} className="mb-1 mt-2 font-bold text-black">
          {children}
        </h4>
      );
    },
    p: ({children}: {children: React.ReactNode}) => {
      const textContent = extractText(children);
      const lines = textContent.split('\n').map((line) => line.trim()).filter(Boolean);
      const hasPhone = /1[3-9]\d{9}/.test(textContent.replace(/-/g, ''));
      const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(textContent);

      if (lines.length > 1 && (hasPhone || hasEmail)) {
        return (
          <div className="flex flex-col gap-0.5">
            {lines.map((line, index) => {
              const phoneMatch = line.match(/(?:1[3-9]\d-\d{4}-\d{4}|1[3-9]\d{9})/);
              const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
              const isContactLine = Boolean(phoneMatch || emailMatch);

              if (isContactLine) {
                return (
                  <div
                    key={`${line}-${index}`}
                    style={{fontSize: `${layoutConfig.bodySize}px`}}
                    className="mt-0.5 flex items-center gap-4 leading-tight text-gray-800"
                  >
                    {phoneMatch ? (
                      <span className="flex items-center gap-1.5">
                        {(() => {
                          const currentIconName = customIcons['联系电话'] || 'Phone';
                          const IconComp = ICON_MAP[currentIconName] || Phone;
                          return (
                            <span
                              className="cursor-pointer transition-opacity hover:opacity-50"
                              onClick={() => setIconPickerTarget('联系电话')}
                              title="点击切换电话图标"
                            >
                              <IconComp size={layoutConfig.bodySize} strokeWidth={2.5} className="text-black" />
                            </span>
                          );
                        })()}
                        {phoneMatch[0]}
                      </span>
                    ) : null}
                    {phoneMatch && emailMatch ? <span className="text-neutral-300">|</span> : null}
                    {emailMatch ? (
                      <span className="flex items-center gap-1.5">
                        {(() => {
                          const currentIconName = customIcons['电子邮箱'] || 'Mail';
                          const IconComp = ICON_MAP[currentIconName] || Mail;
                          return (
                            <span
                              className="cursor-pointer transition-opacity hover:opacity-50"
                              onClick={() => setIconPickerTarget('电子邮箱')}
                              title="点击切换邮箱图标"
                            >
                              <IconComp size={layoutConfig.bodySize} strokeWidth={2.5} className="text-black" />
                            </span>
                          );
                        })()}
                        {emailMatch[0]}
                      </span>
                    ) : null}
                  </div>
                );
              }

              return (
                <div
                  key={`${line}-${index}`}
                  style={{fontSize: `${layoutConfig.bodySize + (index === 0 ? 0.5 : 0)}px`}}
                  className={cn('leading-tight', index === 0 ? 'font-bold text-black' : 'text-gray-800')}
                >
                  {line}
                </div>
              );
            })}
          </div>
        );
      }

      return (
        <p style={{fontSize: `${layoutConfig.bodySize}px`, lineHeight: layoutConfig.lineHeight}} className="mb-0.5 text-justify text-gray-900">
          {children}
        </p>
      );
    },
    ul: ({children}: {children: React.ReactNode}) => <ul className="mb-2 space-y-0.5">{children}</ul>,
    li: ({children}: {children: React.ReactNode}) => (
      <li
        style={{fontSize: `${layoutConfig.bodySize}px`, lineHeight: layoutConfig.lineHeight}}
        className="relative mb-0 pl-[14px] text-justify text-gray-900 before:absolute before:left-0 before:top-[1px] before:text-[11px] before:font-bold before:text-black before:content-['•']"
      >
        {children}
      </li>
    ),
    strong: ({children}: {children: React.ReactNode}) => <strong className="font-bold text-black">{children}</strong>,
    a: ({children, href}: {children: React.ReactNode; href?: string}) => {
      const safeHref = normalizeHref(href);
      return (
        <a
          href={safeHref}
          target={safeHref?.startsWith('http') ? '_blank' : undefined}
          rel={safeHref?.startsWith('http') ? 'noreferrer' : undefined}
          className="break-all text-blue-700 underline underline-offset-2"
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div className="min-h-screen bg-neutral-200 print:block print:bg-white">
      <style>
        {`
          @page {
            size: A4;
            margin: 0 !important;
          }
          @media print {
            body {
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact;
              background-color: white !important;
            }
            .resume-content {
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              outline: none !important;
              min-height: 0 !important;
            }
          }
        `}
      </style>

      <header className="no-print sticky top-0 z-50 border-b border-neutral-300 bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black">
              <FileText className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">ResumeEditor Pro</h1>
              <p className="text-xs text-neutral-500">左侧支持源码编辑和 Milkdown 编辑，右侧为可打印预览。</p>
            </div>
          </div>

          <div className="action-buttons flex items-center gap-3">
            <select
              value={selectedFont}
              onChange={(event) => setSelectedFont(event.target.value)}
              className="cursor-pointer rounded-md border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-600 outline-none transition-all hover:bg-neutral-200 focus:ring-2 focus:ring-neutral-300"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.label} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>

            <div className="relative flex items-center rounded-lg bg-neutral-100 p-1">
              <button
                onClick={() => setShowSettings((value) => !value)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all',
                  showSettings ? 'bg-white text-black shadow-sm' : 'text-neutral-500',
                )}
              >
                <Settings2 size={14} />
                样式
              </button>
              {showSettings ? (
                <div className="absolute top-[calc(100%+12px)] right-0 z-50 flex w-72 flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-2xl">
                  <div className="flex flex-col gap-3">
                    <div className="mb-1 text-xs font-bold tracking-wider text-neutral-500">页面</div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-medium text-neutral-700">
                        <span>左右边距</span>
                        <span>{layoutConfig.marginX} mm</span>
                      </div>
                      <input type="range" min="0" max="30" step="1" value={layoutConfig.marginX} onChange={(event) => updateLayout('marginX', Number(event.target.value))} className="w-full accent-black" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-medium text-neutral-700">
                        <span>上下边距</span>
                        <span>{layoutConfig.marginY} mm</span>
                      </div>
                      <input type="range" min="0" max="30" step="1" value={layoutConfig.marginY} onChange={(event) => updateLayout('marginY', Number(event.target.value))} className="w-full accent-black" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-medium text-neutral-700">
                        <span>行高</span>
                        <span>{layoutConfig.lineHeight}</span>
                      </div>
                      <input type="range" min="1" max="2.5" step="0.1" value={layoutConfig.lineHeight} onChange={(event) => updateLayout('lineHeight', Number(event.target.value))} className="w-full accent-black" />
                    </div>
                  </div>

                  <div className="h-px w-full bg-neutral-100" />

                  <div className="flex flex-col gap-3">
                    <div className="mb-1 text-xs font-bold tracking-wider text-neutral-500">字号</div>

                    {([
                      ['h1Size', '姓名 (H1)', 20, 40, 1],
                      ['h2Size', '模块标题 (H2)', 14, 24, 1],
                      ['h3Size', '项目标题 (H3)', 12, 20, 1],
                      ['h4Size', '小标题 (H4)', 12, 18, 0.5],
                      ['bodySize', '正文', 10, 18, 0.5],
                    ] as const).map(([key, label, min, max, step]) => (
                      <div key={key} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-medium text-neutral-700">
                          <span>{label}</span>
                          <span>{layoutConfig[key]} px</span>
                        </div>
                        <input type="range" min={min} max={max} step={step} value={layoutConfig[key]} onChange={(event) => updateLayout(key, Number(event.target.value))} className="w-full accent-black" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-2 rounded-lg bg-neutral-200 px-4 py-2 text-xs font-black text-black transition-all hover:bg-neutral-300 active:scale-95"
              title="下载当前 Markdown"
            >
              <FileText size={14} />
              下载 MD
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-black text-white transition-all hover:bg-neutral-800 active:scale-95"
            >
              <Download size={14} />
              打印 PDF
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1600px] gap-6 p-6 print:block print:m-0 print:max-w-none print:p-0">
        <section className="no-print flex min-h-[calc(100vh-120px)] flex-1 flex-col overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <Edit3 size={14} />
              <span className="font-bold text-neutral-700">Markdown 工作区</span>
            </div>
            <a href="https://markdown.com.cn/" target="_blank" rel="noreferrer" className="rounded-md px-2 py-1 transition-colors hover:text-blue-500">
              Markdown 语法指南
            </a>
          </div>

          <div className="border-b border-neutral-200 bg-white px-4 py-3">
            <div className="editor-tabs inline-flex rounded-lg bg-neutral-100 p-1">
              <button
                onClick={() => setEditorMode('source')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-bold transition-all',
                  editorMode === 'source' ? 'bg-white text-black shadow-sm' : 'text-neutral-500',
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Edit3 size={14} />
                  源码
                </span>
              </button>
              <button
                onClick={() => setEditorMode('milkdown')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-bold transition-all',
                  editorMode === 'milkdown' ? 'bg-white text-black shadow-sm' : 'text-neutral-500',
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Eye size={14} />
                  Milkdown
                </span>
              </button>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              温馨提示：可以在 Milkdown 模式下编辑，体验更接近原生 markdown 渲染所见即所得编辑。
            </p>
          </div>

          <div className="flex-1 overflow-hidden">
            {editorMode === 'source' ? (
              <textarea
                value={markdown}
                onChange={(event) => setMarkdown(event.target.value)}
                spellCheck={false}
                placeholder="在这里输入 Markdown..."
                className="h-full w-full resize-none bg-white p-6 font-mono text-[13px] leading-relaxed text-neutral-700 focus:outline-none"
              />
            ) : (
              <MilkdownEditor key={editorMode} value={markdown} onChange={setMarkdown} />
            )}
          </div>
        </section>

        <section className="flex flex-1 flex-col items-center pb-8 print:block print:w-full print:m-0 print:p-0">
          <div
            className="resume-content relative mt-4 min-h-[297mm] w-full sm:w-[210mm] overflow-visible bg-white shadow-2xl ring-1 ring-neutral-300 print:mx-auto print:mt-0 print:w-full print:shadow-none print:ring-0"
            style={{
              fontFamily: selectedFont,
              paddingTop: `${layoutConfig.marginY}mm`,
              paddingBottom: `${layoutConfig.marginY}mm`,
            }}
          >
            <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden print:hidden">
              {[...Array(10)].map((_, index) => {
                const topPosition = `calc(${(index + 1) * 297}mm - ${layoutConfig.marginY}mm)`;
                return (
                  <div key={index} className="absolute left-0 right-0 border-b border-dashed border-blue-400" style={{top: topPosition}} title={`A4 安全参考线 ${index + 1}`}>
                    <span className="absolute right-0 -top-5 rounded-tl-md rounded-bl-md border border-r-0 border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] text-blue-500 shadow-sm">
                      第 {index + 1} 页
                    </span>
                  </div>
                );
              })}
            </div>

            <table className="relative z-10 h-full w-full border-collapse">
              <thead className="hidden print:table-header-group">
                <tr>
                  <td style={{height: `${layoutConfig.marginY}mm`}} />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      paddingLeft: `${layoutConfig.marginX}mm`,
                      paddingRight: `${layoutConfig.marginX}mm`,
                      verticalAlign: 'top',
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components as never}>
                      {markdown}
                    </ReactMarkdown>
                  </td>
                </tr>
              </tbody>
              <tfoot className="hidden print:table-footer-group">
                <tr>
                  <td style={{height: `${layoutConfig.marginY}mm`}} />
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </main>

      {iconPickerTarget && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
          onClick={() => setIconPickerTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-bold">选择图标 - {iconPickerTarget}</h3>
            <div className="grid grid-cols-6 gap-4">
              {Object.entries(ICON_MAP).map(([name, IconComp]) => (
                <button
                  key={name}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg p-3 transition-colors hover:bg-zinc-100"
                  onClick={() => {
                    setCustomIcons((prev) => {
                      const next = {...prev, [iconPickerTarget]: name};
                      localStorage.setItem('resume-custom-icons', JSON.stringify(next));
                      return next;
                    });
                    setIconPickerTarget(null);
                  }}
                  title={name}
                >
                  <IconComp size={24} className="text-black" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

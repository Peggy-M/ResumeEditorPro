import React, {useEffect, useState} from 'react';
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
  Linkedin,
} from 'lucide-react';
import MilkdownEditor from './components/MilkdownEditor';
import LandingPage from './components/LandingPage';
import {cn} from './lib/utils';
import DEFAULT_MARKDOWN from './constants/template.md?raw';

type EditorMode = 'source' | 'milkdown';
type ResumeTemplate = 'classic' | 'accent-red' | 'teal-card' | 'minimal-gray';

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

type TemplateOption = {
  value: ResumeTemplate;
  label: string;
  description: string;
};

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase,
  Cpu,
  FileText,
  Layers,
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
  Phone,
  Mail,
  Smartphone,
  AtSign,
  Send,
  Link,
  Github,
  Linkedin,
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

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {value: 'classic', label: '经典专业', description: '黑白稳重，适合通用岗位'},
  {value: 'minimal-gray', label: '简洁灰阶', description: '极简线条风，更克制现代'},
  {value: 'teal-card', label: '青蓝卡片', description: '带卡片感和浅色背景，适合柔和风格'},
  {value: 'accent-red', label: '红线强调', description: '更接近红色线条型模板'},
];

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

  if (normalized.includes('education') || normalized.includes('教育')) {
    return 'GraduationCap';
  }

  if (
    normalized.includes('summary') ||
    normalized.includes('profile') ||
    normalized.includes('评价') ||
    normalized.includes('总结')
  ) {
    return 'Compass';
  }

  if (normalized.includes('skill') || normalized.includes('技术') || normalized.includes('技能')) {
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
  const [hasStarted, setHasStarted] = useState(() => window.location.hash === '#editor');
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [editorMode, setEditorMode] = useState<EditorMode>('milkdown');
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);
  const [showSettings, setShowSettings] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState(DEFAULT_LAYOUT);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>(() => {
    const stored = localStorage.getItem('resume-template');
    if (stored === 'classic' || stored === 'accent-red' || stored === 'teal-card' || stored === 'minimal-gray') {
      return stored;
    }
    return 'classic';
  });
  const [customIcons, setCustomIcons] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('resume-custom-icons');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [iconPickerTarget, setIconPickerTarget] = useState<string | null>(null);

  const updateLayout = (key: keyof LayoutConfig, value: number) => {
    setLayoutConfig((previous) => ({...previous, [key]: value}));
  };

  useEffect(() => {
    localStorage.setItem('resume-template', selectedTemplate);
  }, [selectedTemplate]);

  useEffect(() => {
    const handlePopState = () => {
      setHasStarted(window.location.hash === '#editor');
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!hasStarted || window.location.hash !== '#editor') {
      return;
    }

    const hasSeenOnboarding = localStorage.getItem('hasSeenResumeOnboarding');
    if (hasSeenOnboarding) {
      return;
    }

    const requiredSelectors = ['.action-buttons', '.custom-icon-trigger', '.editor-tabs', '.template-switcher'];
    const hasRequiredTargets = requiredSelectors.every((selector) => document.querySelector(selector));
    if (!hasRequiredTargets) {
      return;
    }

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
            title: '操作区',
            description: '这里可以切换模板、字体、版式参数，也可以下载 Markdown 或直接打印 PDF。',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '.template-switcher',
          popover: {
            title: '模板切换',
            description: '现在支持多种简历版式，你可以随时切换喜欢的模板风格。',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '.custom-icon-trigger',
          popover: {
            title: '自定义图标',
            description: '点击分区图标、电话图标或邮箱图标，可以替换成你更喜欢的样式。',
            side: 'right',
            align: 'center',
          },
        },
        {
          element: '.editor-tabs',
          popover: {
            title: '编辑模式',
            description: '你可以在源码模式和 Milkdown 模式之间切换，按自己习惯编辑简历内容。',
            side: 'bottom',
            align: 'start',
          },
        },
      ],
      onDestroyStarted: () => {
        localStorage.setItem('hasSeenResumeOnboarding', 'true');
        driverObj.destroy();
      },
    });

    const timer = window.setTimeout(() => {
      driverObj.drive();
    }, 300);

    return () => {
      window.clearTimeout(timer);
      driverObj.destroy();
    };
  }, [hasStarted]);

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

  if (!hasStarted) {
    return (
      <LandingPage
        onStart={() => {
          setHasStarted(true);
          window.location.hash = 'editor';
        }}
      />
    );
  }

  const templateMeta = TEMPLATE_OPTIONS.find((item) => item.value === selectedTemplate) ?? TEMPLATE_OPTIONS[0];
  const isClassicTemplate = selectedTemplate === 'classic';
  const isRedTemplate = selectedTemplate === 'accent-red';
  const isTealTemplate = selectedTemplate === 'teal-card';
  const isMinimalTemplate = selectedTemplate === 'minimal-gray';

  const iconColorClass = cn(
    isClassicTemplate && 'text-black',
    isRedTemplate && 'text-[#c62845]',
    isTealTemplate && 'text-[#0f766e]',
    isMinimalTemplate && 'text-neutral-700',
  );

  const components = {
    h1: ({children}: {children: React.ReactNode}) => (
      <h1
        style={{fontSize: `${layoutConfig.h1Size}px`}}
        className={cn(
          'mt-0 font-bold leading-tight',
          isClassicTemplate && 'mb-1 text-black',
          isRedTemplate && 'mb-2 text-[#2a2a2a]',
          isTealTemplate && 'mb-2 text-[#18324a]',
          isMinimalTemplate && 'mb-2 text-[#222222]',
        )}
      >
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
          className={cn(
            'relative group mt-5 mb-3 flex items-center gap-2 font-bold',
            isClassicTemplate && 'border-b border-black pb-1.5 text-black',
            isRedTemplate && 'border-b border-[#de6a7b] pb-1.5 text-[#c62845]',
            isTealTemplate && 'border-b border-[#d6e8ef] pb-2 text-[#0f766e]',
            isMinimalTemplate && 'border-b border-neutral-700 pb-1.5 text-[#303030]',
          )}
        >
          <div
            className={cn(
              'custom-icon-trigger flex cursor-pointer items-center justify-center transition-colors',
              isClassicTemplate && 'rounded-full bg-zinc-100 p-1.5 hover:bg-zinc-200',
              isRedTemplate && 'rounded-sm bg-[#c6282812] p-1.5 hover:bg-[#c6282820]',
              isTealTemplate && 'rounded-full bg-[#0e749014] p-1.5 hover:bg-[#0e749025]',
              isMinimalTemplate && 'rounded-full border border-neutral-300 bg-white p-1.5 hover:bg-neutral-100',
            )}
            onClick={() => setIconPickerTarget(rawText)}
            title="点击切换图标"
          >
            <Icon size={layoutConfig.h2Size - 2} strokeWidth={2.5} className={iconColorClass} />
          </div>
          {rawText}
        </h2>
      );
    },
    h3: ({children}: {children: React.ReactNode}) => {
      const content = extractText(children);
      const {title, meta} = splitTitleAndDate(content);

      return (
        <div
          className={cn(
            'mt-3 flex items-baseline justify-between gap-4',
            isClassicTemplate && 'mb-1',
            isRedTemplate && 'mb-1.5',
            isTealTemplate && 'mb-2 rounded-2xl border border-[#e3eef3] bg-white px-4 py-3 shadow-[0_1px_0_rgba(15,118,110,0.03)]',
            isMinimalTemplate && 'mb-1.5 border-b border-neutral-200 pb-1',
          )}
        >
          <span
            style={{fontSize: `${layoutConfig.h3Size}px`}}
            className={cn(
              'font-bold',
              isClassicTemplate && 'text-black',
              isRedTemplate && 'text-[#3a3a3a]',
              isTealTemplate && 'text-[#243b53]',
              isMinimalTemplate && 'text-[#222222]',
            )}
          >
            {title}
          </span>
          {meta ? (
            <span
              style={{fontSize: `${layoutConfig.h3Size - 1.5}px`}}
              className={cn(
                'shrink-0 font-bold',
                isClassicTemplate && 'rounded-full border border-zinc-200 bg-zinc-100 px-3 py-0.5 text-black',
                isRedTemplate && 'text-[#666666]',
                isTealTemplate && 'text-[#52606d]',
                isMinimalTemplate && 'text-[#555555]',
              )}
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
          <div className={cn('mb-1 mt-2 flex items-baseline justify-between gap-4', isTealTemplate && 'px-4')}>
            <span
              style={{fontSize: `${layoutConfig.h4Size}px`}}
              className={cn(
                'font-bold',
                isClassicTemplate && 'text-black',
                isRedTemplate && 'text-[#222222]',
                isTealTemplate && 'text-[#2b3e50]',
                isMinimalTemplate && 'text-[#222222]',
              )}
            >
              {title}
            </span>
            <span
              style={{fontSize: `${layoutConfig.h4Size - 0.5}px`}}
              className={cn(
                'shrink-0 font-bold',
                isClassicTemplate && 'text-black',
                isRedTemplate && 'text-[#555555]',
                isTealTemplate && 'text-[#52606d]',
                isMinimalTemplate && 'text-[#555555]',
              )}
            >
              {meta}
            </span>
          </div>
        );
      }

      return (
        <h4
          style={{fontSize: `${layoutConfig.h4Size}px`}}
          className={cn(
            'mb-1 mt-2 font-bold',
            isClassicTemplate && 'text-black',
            isRedTemplate && 'text-[#222222]',
            isTealTemplate && 'px-4 text-[#2b3e50]',
            isMinimalTemplate && 'text-[#222222]',
          )}
        >
          {children}
        </h4>
      );
    },
    p: ({children}: {children: React.ReactNode}) => {
      const textContent = extractText(children);
      const lines = textContent
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      const hasPhone = /1[3-9]\d{9}/.test(textContent.replace(/-/g, ''));
      const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(textContent);

      if (lines.length > 1 && (hasPhone || hasEmail)) {
        return (
          <div
            className={cn(
              'flex flex-col gap-0.5',
              isTealTemplate && 'mb-2 rounded-2xl border border-[#ddeaf0] bg-white/90 px-4 py-3',
              isMinimalTemplate && 'mb-1',
            )}
          >
            {lines.map((line, index) => {
              const phoneMatch = line.match(/(?:1[3-9]\d-\d{4}-\d{4}|1[3-9]\d{9})/);
              const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
              const isContactLine = Boolean(phoneMatch || emailMatch);

              if (isContactLine) {
                return (
                  <div
                    key={`${line}-${index}`}
                    style={{fontSize: `${layoutConfig.bodySize}px`}}
                    className={cn(
                      'mt-0.5 flex items-center gap-4 leading-tight',
                      isClassicTemplate && 'text-gray-800',
                      isRedTemplate && 'text-[#5f5f5f]',
                      isTealTemplate && 'text-[#486581]',
                      isMinimalTemplate && 'text-[#4a4a4a]',
                    )}
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
                              <IconComp size={layoutConfig.bodySize} strokeWidth={2.5} className={iconColorClass} />
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
                              <IconComp size={layoutConfig.bodySize} strokeWidth={2.5} className={iconColorClass} />
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
                  className={cn(
                    'leading-tight',
                    index === 0 &&
                      cn(
                        'font-bold',
                        isClassicTemplate && 'text-black',
                        isRedTemplate && 'text-[#303030]',
                        isTealTemplate && 'text-[#1f2937]',
                        isMinimalTemplate && 'text-[#222222]',
                      ),
                    index !== 0 &&
                      cn(
                        isClassicTemplate && 'text-gray-800',
                        isRedTemplate && 'text-[#686868]',
                        isTealTemplate && 'text-[#486581]',
                        isMinimalTemplate && 'text-[#555555]',
                      ),
                  )}
                >
                  {line}
                </div>
              );
            })}
          </div>
        );
      }

      return (
        <p
          style={{fontSize: `${layoutConfig.bodySize}px`, lineHeight: layoutConfig.lineHeight}}
          className={cn(
            'mb-0.5 text-justify',
            isClassicTemplate && 'text-gray-900',
            isRedTemplate && 'text-[#444444]',
            isTealTemplate && 'text-[#334e68]',
            isMinimalTemplate && 'text-[#444444]',
          )}
        >
          {children}
        </p>
      );
    },
    ul: ({children}: {children: React.ReactNode}) => (
      <ul className={cn('mb-2 space-y-0.5', isTealTemplate && 'px-4 pb-1')}>{children}</ul>
    ),
    li: ({children}: {children: React.ReactNode}) => (
      <li
        style={{fontSize: `${layoutConfig.bodySize}px`, lineHeight: layoutConfig.lineHeight}}
        className={cn(
          "relative mb-0 pl-[14px] text-justify before:absolute before:left-0 before:top-[1px] before:text-[11px] before:font-bold before:content-['•']",
          isClassicTemplate && 'text-gray-900 before:text-black',
          isRedTemplate && 'text-[#444444] before:text-[#c62845]',
          isTealTemplate && 'text-[#334e68] before:text-[#0f766e]',
          isMinimalTemplate && 'text-[#444444] before:text-neutral-700',
        )}
      >
        {children}
      </li>
    ),
    strong: ({children}: {children: React.ReactNode}) => (
      <strong
        className={cn(
          'font-bold',
          isClassicTemplate && 'text-black',
          isRedTemplate && 'text-[#111111]',
          isTealTemplate && 'text-[#102a43]',
          isMinimalTemplate && 'text-[#111111]',
        )}
      >
        {children}
      </strong>
    ),
    a: ({children, href}: {children: React.ReactNode; href?: string}) => {
      const safeHref = normalizeHref(href);
      return (
        <a
          href={safeHref}
          target={safeHref?.startsWith('http') ? '_blank' : undefined}
          rel={safeHref?.startsWith('http') ? 'noreferrer' : undefined}
          className={cn(
            'break-all underline underline-offset-2',
            isClassicTemplate && 'text-blue-700',
            isRedTemplate && 'text-[#b4233c]',
            isTealTemplate && 'text-[#0f766e]',
            isMinimalTemplate && 'text-[#374151]',
          )}
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
          <div
            className="group flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-80"
            onClick={() => {
              setHasStarted(false);
              window.location.hash = '';
            }}
            title="返回首页"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black transition-colors group-hover:bg-neutral-800">
              <FileText className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">ResumeEditor Pro</h1>
              <p className="text-xs text-neutral-500">左侧编辑内容，右侧实时预览，现在支持多模板切换。</p>
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
                <div className="absolute right-0 top-[calc(100%+12px)] z-50 flex w-72 flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-2xl">
                  <div className="flex flex-col gap-3">
                    <div className="mb-1 text-xs font-bold tracking-wider text-neutral-500">页面</div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-medium text-neutral-700">
                        <span>左右边距</span>
                        <span>{layoutConfig.marginX} mm</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="1"
                        value={layoutConfig.marginX}
                        onChange={(event) => updateLayout('marginX', Number(event.target.value))}
                        className="w-full accent-black"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-medium text-neutral-700">
                        <span>上下边距</span>
                        <span>{layoutConfig.marginY} mm</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="1"
                        value={layoutConfig.marginY}
                        onChange={(event) => updateLayout('marginY', Number(event.target.value))}
                        className="w-full accent-black"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-medium text-neutral-700">
                        <span>行高</span>
                        <span>{layoutConfig.lineHeight}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="2.5"
                        step="0.1"
                        value={layoutConfig.lineHeight}
                        onChange={(event) => updateLayout('lineHeight', Number(event.target.value))}
                        className="w-full accent-black"
                      />
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
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step={step}
                          value={layoutConfig[key]}
                          onChange={(event) => updateLayout(key, Number(event.target.value))}
                          className="w-full accent-black"
                        />
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
            <p className="mt-2 text-xs text-neutral-500">你可以在 Milkdown 模式中更接近所见即所得地编辑简历内容。</p>
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

        <section className="flex flex-1 flex-col items-center pb-8 print:block print:m-0 print:w-full print:p-0">
          <div className="template-switcher no-print mb-3 flex w-full max-w-[210mm] items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white/90 px-4 py-3 shadow-sm">
            <div>
              <div className="text-sm font-bold text-neutral-800">当前模板：{templateMeta.label}</div>
              <div className="text-xs text-neutral-500">{templateMeta.description}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_OPTIONS.map((template) => (
                <button
                  key={template.value}
                  onClick={() => setSelectedTemplate(template.value)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-bold transition-all',
                    selectedTemplate === template.value
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-800',
                  )}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          <div
            data-template={selectedTemplate}
            className={cn(
              'resume-content resume-template relative mt-4 min-h-[297mm] w-full overflow-visible shadow-2xl ring-1 sm:w-[210mm] print:mx-auto print:mt-0 print:w-full print:shadow-none print:ring-0',
              isClassicTemplate && 'bg-white ring-neutral-300',
              isRedTemplate && 'bg-[#fffdfd] ring-[#e8cfd3]',
              isTealTemplate && 'bg-[#f4f8fb] ring-[#c8dce6]',
              isMinimalTemplate && 'bg-[#fcfcfb] ring-neutral-300',
            )}
            style={{
              fontFamily: selectedFont,
              paddingTop: `${layoutConfig.marginY}mm`,
              paddingBottom: `${layoutConfig.marginY}mm`,
            }}
          >
            {isRedTemplate ? (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-0 right-0 top-0 h-3 bg-gradient-to-r from-[#d64f65] via-[#ef8b9a] to-[#d64f65]" />
                <div className="absolute right-6 top-8 h-24 w-24 rounded-full border border-[#f3d5da]" />
                <div className="absolute right-12 top-14 h-24 w-24 rounded-full border border-[#f8e8eb]" />
              </div>
            ) : null}

            {isTealTemplate ? (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-0 right-0 top-0 h-4 bg-[#0f766e]" />
                <div className="absolute right-[-30mm] top-[-10mm] h-[120mm] w-[120mm] rounded-full border-[20px] border-[#d7e8ef] opacity-60" />
                <div className="absolute right-[-18mm] top-[4mm] h-[90mm] w-[90mm] rounded-full border-[12px] border-[#e7f0f5] opacity-80" />
              </div>
            ) : null}

            {isMinimalTemplate ? (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-0 top-0 h-14 w-14 bg-[linear-gradient(135deg,#727272_0%,#a8a8a8_50%,transparent_50%)] opacity-40" />
                <div className="absolute right-8 top-6 h-24 w-40 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.06),transparent_60%)]" />
              </div>
            ) : null}

            <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden print:hidden">
              {[...Array(10)].map((_, index) => {
                const topPosition = `calc(${(index + 1) * 297}mm - ${layoutConfig.marginY}mm)`;
                return (
                  <div
                    key={index}
                    className="absolute left-0 right-0 border-b border-dashed border-blue-400"
                    style={{top: topPosition}}
                    title={`A4 安全参考线 ${index + 1}`}
                  >
                    <span className="absolute right-0 -top-5 rounded-bl-md rounded-tl-md border border-r-0 border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] text-blue-500 shadow-sm">
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

      {iconPickerTarget ? (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4" onClick={() => setIconPickerTarget(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
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
      ) : null}
    </div>
  );
}

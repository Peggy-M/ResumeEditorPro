import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Briefcase,
  FileText,
  Download,
  Edit3,
  Eye,
  Phone,
  Mail,
  User,
  Wrench,
  Layers,
  Settings2
} from 'lucide-react';
import { cn } from './lib/utils';
import DEFAULT_MARKDOWN from './constants/template.md?raw';

const FONT_OPTIONS = [
  { label: '系统默认 (苹果等)', value: '-apple-system, BlinkMacSystemFont, "SF Pro SC", "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif' },
  { label: '思源黑体 (Noto Sans)', value: '"Noto Sans SC", sans-serif' },
  { label: '思源宋体 (Noto Serif)', value: '"Noto Serif SC", serif' },
  { label: '霞鹜文楷 (LXGW)', value: '"LXGW WenKai Screen", sans-serif' },
  { label: '微软雅黑 (YaHei)', value: '"Microsoft YaHei", sans-serif' },
];

export default function App() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);
  const [showSettings, setShowSettings] = useState(false);

  const [layoutConfig, setLayoutConfig] = useState({
    marginX: 12, // mm
    marginY: 10, // mm
    lineHeight: 1.7,
    h1Size: 30, // px
    h2Size: 18,
    h3Size: 16,
    h4Size: 14.5,
    bodySize: 13.5
  });

  const updateLayout = (key: keyof typeof layoutConfig, value: number) => {
    setLayoutConfig(prev => ({ ...prev, [key]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const components = {
    h1: ({ children }: any) => (
      <h1 style={{ fontSize: `${layoutConfig.h1Size}px` }} className="font-bold text-black mb-1 mt-0 leading-tight">{children}</h1>
    ),
    h2: ({ children }: any) => {
      const text = String(children).toLowerCase();
      let Icon: any = Wrench;
      if (text.includes('工作') || text.includes('经历')) Icon = Briefcase;
      if (text.includes('项目')) Icon = Layers;
      if (text.includes('评估') || text.includes('总结')) Icon = User;
      if (text.includes('技能')) Icon = Wrench;

      return (
        <h2 style={{ fontSize: `${layoutConfig.h2Size}px` }} className="flex items-center gap-1.5 font-bold border-b border-black pb-0.5 mt-5 mb-3">
          <Icon size={layoutConfig.h2Size} strokeWidth={2.5} className="text-black" />
          {String(children).replace(/[^\u4e00-\u9fa5a-zA-Z]/g, '')}
        </h2>
      );
    },
    h3: ({ children }: any) => {
      const content = String(children);
      const parts = content.split('|');

      // If there's a date at the end but no pipe, try to split by date regex
      if (parts.length === 1) {
        const dateRegex = /((?:\d{4}[.\/-]\d{1,2}|至今)\s*[-~]\s*(?:\d{4}[.\/-]\d{1,2}|至今))$/;
        const match = content.match(dateRegex);
        if (match) {
          const title = content.replace(dateRegex, '').trim();
          const date = match[0].trim();
          return (
            <div className="flex justify-between items-baseline mb-1 mt-3">
              <span style={{ fontSize: `${layoutConfig.h3Size}px` }} className="font-bold text-black">{title}</span>
              <span style={{ fontSize: `${layoutConfig.h3Size - 1.5}px` }} className="font-bold text-black">{date}</span>
            </div>
          );
        }
      }

      return (
        <div className="flex justify-between items-baseline mb-1 mt-3">
          <span style={{ fontSize: `${layoutConfig.h3Size}px` }} className="font-bold text-black">{parts[0].trim()}</span>
          {parts[1] && <span style={{ fontSize: `${layoutConfig.h3Size - 1.5}px` }} className="font-bold text-black">{parts[1].trim()}</span>}
        </div>
      );
    },
    h4: ({ children }: any) => {
      const content = String(children);
      const dateRegex = /((?:\d{4}[.\/-]\d{1,2}|至今)\s*[-~]\s*(?:\d{4}[.\/-]\d{1,2}|至今))$/;
      const match = content.match(dateRegex);

      if (match) {
        const title = content.replace(dateRegex, '').trim();
        const date = match[0].trim();
        return (
          <div className="flex justify-between items-baseline mb-1 mt-2">
            <span style={{ fontSize: `${layoutConfig.h4Size}px` }} className="font-bold text-black">{title}</span>
            <span style={{ fontSize: `${layoutConfig.h4Size - 0.5}px` }} className="font-bold text-black">{date}</span>
          </div>
        );
      }

      return <h4 style={{ fontSize: `${layoutConfig.h4Size}px` }} className="font-bold text-black mb-1 mt-2">{children}</h4>;
    },
    p: ({ children }: any) => {
      const extractText = (node: any): string => {
        if (typeof node === 'string' || typeof node === 'number') return String(node);
        if (Array.isArray(node)) return node.map(extractText).join('');
        if (node?.props?.children) return extractText(node.props.children);
        return '';
      };

      const textContent = extractText(children);

      // Check if this paragraph contains the combined header info
      const isHeaderBlock = textContent.includes('男') || textContent.includes('15569732732') || textContent.includes('天水师范学院');

      if (isHeaderBlock) {
        // Find segments even if they are in one line
        const profileMatch = textContent.match(/男\s*\|\s*2000\s*\|\s*本科/);
        const schoolMatch = textContent.match(/天水师范学院\s*-\s*信息技术工程/);
        const contactMatch = textContent.match(/(?:📞|📧|1\d{10}).*$/);

        return (
          <div className="flex flex-col gap-0.5">
            {profileMatch && <div style={{ fontSize: `${layoutConfig.bodySize + 0.5}px` }} className="font-bold text-black leading-tight">{profileMatch[0]}</div>}
            {schoolMatch && <div style={{ fontSize: `${layoutConfig.bodySize + 0.5}px` }} className="text-gray-800 leading-tight">{schoolMatch[0]}</div>}
            {contactMatch && (
              <div style={{ fontSize: `${layoutConfig.bodySize}px` }} className="flex items-center gap-4 text-gray-800 mt-0.5 leading-tight">
                <span className="flex items-center gap-1.5">
                  <Phone size={layoutConfig.bodySize} strokeWidth={2.5} className="text-black" />
                  {textContent.match(/1\d{10}/)?.[0] || '15569732732'}
                </span>
                <span className="text-neutral-300">|</span>
                <span className="flex items-center gap-1.5">
                  <Mail size={layoutConfig.bodySize} strokeWidth={2.5} className="text-black" />
                  {textContent.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || 'E15569732732@163.com'}
                </span>
              </div>
            )}
            {!profileMatch && !schoolMatch && !contactMatch && <div style={{ fontSize: `${layoutConfig.bodySize}px` }} className="whitespace-pre-wrap">{children}</div>}
          </div>
        );
      }

      return <p style={{ fontSize: `${layoutConfig.bodySize}px`, lineHeight: layoutConfig.lineHeight }} className="text-gray-900 mb-0.5 text-justify">{children}</p>;
    },
    ul: ({ children }: any) => (
      <ul className="mb-2 space-y-0.5">{children}</ul>
    ),
    li: ({ children }: any) => (
      <li style={{ fontSize: `${layoutConfig.bodySize}px`, lineHeight: layoutConfig.lineHeight }} className="relative pl-[14px] text-gray-900 mb-0 text-justify before:content-['•'] before:absolute before:left-0 before:top-[1px] before:text-[11px] before:font-bold">
        {children}
      </li>
    ),
    strong: ({ children }: any) => <strong className="font-bold text-black">{children}</strong>
  };

  return (
    <div className="min-h-screen bg-neutral-200 flex flex-col items-center print:bg-white print:block">
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
      <header className="no-print w-full bg-white border-b border-neutral-300 sticky top-0 z-50 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
            <FileText className="text-white" size={18} />
          </div>
          <h1 className="font-bold text-base tracking-tight">ResumeEditor Pro</h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedFont}
            onChange={(e) => setSelectedFont(e.target.value)}
            className="no-print text-xs font-bold bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-md outline-none border border-neutral-200 cursor-pointer focus:ring-2 focus:ring-neutral-300 transition-all hover:bg-neutral-200"
          >
            {FONT_OPTIONS.map(font => (
              <option key={font.label} value={font.value}>{font.label}</option>
            ))}
          </select>
          <div className="bg-neutral-100 p-1 rounded-lg flex items-center relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                showSettings ? "bg-white text-black shadow-sm" : "text-neutral-500"
              )}
            >
              <Settings2 size={14} />
              STYLE
            </button>
            {showSettings && (
              <div className="absolute top-[calc(100%+12px)] right-0 w-72 bg-white border border-neutral-200 rounded-xl shadow-2xl p-4 z-50 flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">页面设置</div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-neutral-700">
                      <span>左右边距 (mm)</span>
                      <span>{layoutConfig.marginX}</span>
                    </div>
                    <input type="range" min="0" max="30" step="1" value={layoutConfig.marginX} onChange={(e) => updateLayout('marginX', Number(e.target.value))} className="w-full accent-black" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-neutral-700">
                      <span>上下边距 (mm)</span>
                      <span>{layoutConfig.marginY}</span>
                    </div>
                    <input type="range" min="0" max="30" step="1" value={layoutConfig.marginY} onChange={(e) => updateLayout('marginY', Number(e.target.value))} className="w-full accent-black" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-neutral-700">
                      <span>全局行距</span>
                      <span>{layoutConfig.lineHeight}</span>
                    </div>
                    <input type="range" min="1" max="2.5" step="0.1" value={layoutConfig.lineHeight} onChange={(e) => updateLayout('lineHeight', Number(e.target.value))} className="w-full accent-black" />
                  </div>
                </div>

                <div className="w-full h-px bg-neutral-100"></div>

                <div className="flex flex-col gap-3">
                  <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">字体大小</div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-neutral-700">
                      <span>姓名 (H1)</span>
                      <span>{layoutConfig.h1Size}px</span>
                    </div>
                    <input type="range" min="20" max="40" step="1" value={layoutConfig.h1Size} onChange={(e) => updateLayout('h1Size', Number(e.target.value))} className="w-full accent-black" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-neutral-700">
                      <span>模块标题 (H2)</span>
                      <span>{layoutConfig.h2Size}px</span>
                    </div>
                    <input type="range" min="14" max="24" step="1" value={layoutConfig.h2Size} onChange={(e) => updateLayout('h2Size', Number(e.target.value))} className="w-full accent-black" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-neutral-700">
                      <span>项目标题 (H3)</span>
                      <span>{layoutConfig.h3Size}px</span>
                    </div>
                    <input type="range" min="12" max="20" step="1" value={layoutConfig.h3Size} onChange={(e) => updateLayout('h3Size', Number(e.target.value))} className="w-full accent-black" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-neutral-700">
                      <span>小标题 (H4)</span>
                      <span>{layoutConfig.h4Size}px</span>
                    </div>
                    <input type="range" min="12" max="18" step="0.5" value={layoutConfig.h4Size} onChange={(e) => updateLayout('h4Size', Number(e.target.value))} className="w-full accent-black" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-neutral-700">
                      <span>正文</span>
                      <span>{layoutConfig.bodySize}px</span>
                    </div>
                    <input type="range" min="10" max="18" step="0.5" value={layoutConfig.bodySize} onChange={(e) => updateLayout('bodySize', Number(e.target.value))} className="w-full accent-black" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-neutral-100 p-1 rounded-lg flex items-center">
            <button
              onClick={() => setActiveTab('editor')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                activeTab === 'editor' ? "bg-white text-black shadow-sm" : "text-neutral-500"
              )}
            >
              EDIT
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                activeTab === 'preview' ? "bg-white text-black shadow-sm" : "text-neutral-500"
              )}
            >
              VIEW
            </button>
          </div>
          <button
            onClick={handlePrint}
            className="ml-2 bg-black text-white px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 hover:bg-neutral-800 transition-all active:scale-95"
          >
            <Download size={14} />
            PRINT PDF
          </button>
        </div>
      </header>

      <main className="w-full max-w-[1600px] flex flex-1 overflow-hidden p-6 gap-6 print:p-0 print:m-0 print:max-w-none print:block print:overflow-visible">
        <section className={cn(
          "flex-1 flex flex-col bg-white rounded-xl shadow-lg border border-neutral-300 no-print transition-all",
          activeTab === 'preview' ? 'hidden lg:flex' : 'flex'
        )}>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            spellCheck={false}
            className="flex-1 p-8 font-mono text-[13px] resize-none focus:outline-none leading-relaxed text-neutral-600 bg-neutral-50/30"
          />
        </section>

        <section className={cn(
          "flex-1 lg:flex flex-col print-only print:block print:w-full print:m-0 print:p-0",
          activeTab === 'editor' ? 'hidden lg:flex' : 'flex items-center'
        )}>
          <div
            className="bg-white shadow-2xl min-h-[297mm] w-full sm:w-[210mm] resume-content overflow-visible ring-1 ring-neutral-300 print:mx-auto print:shadow-none print:ring-0 print:w-full"
            style={{
              fontFamily: selectedFont,
              paddingTop: `${layoutConfig.marginY}mm`,
              paddingBottom: `${layoutConfig.marginY}mm`,
            }}
          >
            <table className="w-full border-collapse">
              <thead className="hidden print:table-header-group">
                <tr>
                  <td style={{ height: `${layoutConfig.marginY}mm` }}></td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      paddingLeft: `${layoutConfig.marginX}mm`,
                      paddingRight: `${layoutConfig.marginX}mm`
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={components as any}
                    >
                      {markdown}
                    </ReactMarkdown>
                  </td>
                </tr>
              </tbody>
              <tfoot className="hidden print:table-footer-group">
                <tr>
                  <td style={{ height: `${layoutConfig.marginY}mm` }}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

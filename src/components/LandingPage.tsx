import React, { useState, useEffect } from 'react';
import { FileText, ArrowRight, Github, CheckCircle2, Zap, PenTool } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onStart: () => void;
}

const Cursor = () => (
  <motion.span 
    animate={{ opacity: [1, 0] }} 
    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
    className="inline-block w-[3px] sm:w-1 h-[0.9em] bg-black ml-1 align-middle"
    style={{ marginTop: '-0.1em' }}
  />
);

const TypewriterText = () => {
  const text = "简历，不该如此复杂。";
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      if (charIndex > 0) {
        timer = setTimeout(() => setCharIndex(prev => prev - 1), 50);
      } else {
        timer = setTimeout(() => setIsDeleting(false), 800);
      }
    } else {
      if (charIndex < text.length) {
        timer = setTimeout(() => setCharIndex(prev => prev + 1), 150);
      } else {
        timer = setTimeout(() => setIsDeleting(true), 3000);
      }
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting]);

  return (
    <>
      {charIndex === 0 && <Cursor />}
      {text.split('').map((char, index) => {
        const isFz = char === '复' || char === '杂';
        const isVisible = index < charIndex;
        return (
          <React.Fragment key={index}>
            <span 
              className={isFz ? "text-neutral-400" : "text-black"}
              style={{ opacity: isVisible ? 1 : 0 }}
            >
              {char}
            </span>
            {index === charIndex - 1 && <Cursor />}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="relative min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-neutral-200/50 blur-3xl mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-neutral-200/50 blur-3xl mix-blend-multiply animate-pulse" style={{ animationDuration: '10s' }}></div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-lg">
            <FileText size={20} />
          </div>
          <span className="text-xl font-black tracking-tight">ResumeEditor<span className="text-neutral-400">Pro</span></span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-black transition-colors"
        >
          <Github size={20} />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-24 pb-32 px-6 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-bold text-neutral-600 mb-10 shadow-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          开源免费，基于 Markdown 的专业简历生成器
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-7xl font-black tracking-tighter mb-8 leading-[1.1] whitespace-nowrap"
        >
          <TypewriterText />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg sm:text-xl text-neutral-500 mb-12 max-w-2xl leading-relaxed"
        >
          告别繁琐的排版，回归内容的本质。只需编写简单的 Markdown，即可一键生成所见即所得的极简优雅 PDF 简历。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            onClick={onStart}
            className="group flex items-center justify-center gap-2 rounded-full bg-black px-10 py-4 text-base font-bold text-white transition-all hover:bg-neutral-800 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(0,0,0,0.2)]"
          >
            立即制作简历
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Feature Highlights - Clean Minimalist Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 grid w-full max-w-5xl grid-cols-1 gap-8 text-left md:grid-cols-3"
        >
          {/* Card 1 */}
          <div className="rounded-[24px] bg-[#fafafa] border border-neutral-100 p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-neutral-50">
              <Zap size={24} className="text-black" />
            </div>
            <h3 className="mb-4 text-xl font-bold tracking-tight text-black">极速渲染</h3>
            <p className="text-[15px] leading-relaxed text-neutral-500">
              基于 React 构建，支持所见即所得的实时预览。左侧修改，右侧毫秒级呈现效果。
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-[24px] bg-[#fafafa] border border-neutral-100 p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-neutral-50">
              <PenTool size={24} className="text-black" />
            </div>
            <h3 className="mb-4 text-xl font-bold tracking-tight text-black">高度自定义</h3>
            <p className="text-[15px] leading-relaxed text-neutral-500">
              提供字体切换、间距微调，更有海量图标支持一键点击替换，打造个性化专属简历。
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-[24px] bg-[#fafafa] border border-neutral-100 p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-neutral-50">
              <CheckCircle2 size={24} className="text-black" />
            </div>
            <h3 className="mb-4 text-xl font-bold tracking-tight text-black">完美打印</h3>
            <p className="text-[15px] leading-relaxed text-neutral-500">
              专门针对 A4 纸张进行 CSS 打印样式优化，确保导出的 PDF 无边距、不分页错乱。
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
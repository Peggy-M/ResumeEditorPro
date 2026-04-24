import {useLayoutEffect, useRef, useState} from 'react';
import {CrepeBuilder} from '@milkdown/crepe/builder';

type MilkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function MilkdownEditor({value, onChange}: MilkdownEditorProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);
  const [error, setError] = useState<string | null>(null);

  onChangeRef.current = onChange;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    setError(null);
    root.innerHTML = '';

    const editor = new CrepeBuilder({
      root,
      defaultValue: initialValueRef.current,
    });

    editor.on((listener) => {
      listener.markdownUpdated((_, markdown) => {
        onChangeRef.current(markdown);
      });
    });

    let disposed = false;

    void editor
      .create()
      .then(() => {
        if (disposed) {
          void editor.destroy();
          return;
        }

        requestAnimationFrame(() => {
          if (!root.querySelector('.milkdown') && !root.querySelector('.ProseMirror')) {
            setError('Milkdown 已初始化，但没有渲染出编辑器内容。');
          }
        });
      })
      .catch((reason) => {
        const message = reason instanceof Error ? reason.message : String(reason);
        setError(`Milkdown 初始化失败：${message}`);
      });

    return () => {
      disposed = true;
      void editor.destroy();
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-full min-h-[420px] items-start bg-white p-6">
        <div className="w-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  return <div ref={rootRef} className="milkdown-host h-full min-h-[420px] overflow-hidden bg-white" />;
}

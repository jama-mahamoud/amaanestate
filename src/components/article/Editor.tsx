import { useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Underline from '@tiptap/extension-underline';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { Extension, Node, mergeAttributes } from '@tiptap/core';
import { common, createLowlight } from 'lowlight';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { uploadFile } from '@/services/uploadService';
import { 
  Bold, Italic, Heading1, Heading2, Heading3, Heading4, 
  List, ListOrdered, Quote, Image as ImageIcon, 
  Link as LinkIcon, Unlink, Loader2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Underline as UnderlineIcon, Table as TableIcon,
  Minus, Code, Palette, Highlighter, Youtube as YoutubeIcon,
  Plus, Smartphone, Tablet, Monitor, Info, Timer,
  RemoveFormatting, Type, AlertCircle, GripHorizontal
} from 'lucide-react';

const lowlight = createLowlight(common);

// --- Custom Extensions ---

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize }).run()
      },
    }
  },
})

const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  draggable: true,
  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 
      'data-type': 'callout', 
      class: 'callout-block bg-luxury-gold/10 border-l-4 border-luxury-gold p-8 my-10 rounded-r-3xl relative' 
    }), 0]
  },
})

// --- End Extensions ---

const MenuButton = ({ onClick, isActive, icon: Icon, title, disabled, className = '' }: any) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-md transition-all ${isActive ? 'text-luxury-gold bg-luxury-gold/10' : 'text-white/60 hover:bg-white/10'} ${disabled ? 'opacity-30 cursor-not-allowed' : ''} ${className}`}
  >
    <Icon size={16} />
  </button>
);

export default function Editor({ content, onChange }: { content: string, onChange: (html: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadFile(file, 'articles_inline', (progress) => {
        setUploadProgress(progress);
      });
      
      if (editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        horizontalRule: false,
      }),
      Underline,
      Typography,
      TextStyle,
      Color,
      FontSize,
      Callout,
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-12 border-t border-white/10 h-0 w-full',
        },
      }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'callout'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full my-8 border border-white/10 transition-transform hover:scale-[1.01]',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-luxury-gold underline underline-offset-4 decoration-luxury-gold/50 hover:decoration-luxury-gold transition-colors',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-fixed w-full my-8 border border-white/10 rounded-xl overflow-hidden',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-white/5 border border-white/10 p-3 text-left font-bold text-luxury-gold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-white/10 p-3 text-white/70',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-luxury-black/80 rounded-xl p-6 my-8 font-mono text-sm border border-white/10 text-emerald-400 overflow-x-auto',
        },
      }),
      Youtube.configure({
        width: 840,
        height: 480,
        HTMLAttributes: {
          class: 'aspect-video rounded-3xl overflow-hidden border border-white/10 my-10 w-full',
        },
      }),
      CharacterCount,
      Placeholder.configure({
        placeholder: 'Begin your high-intelligence report here...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-luxury max-w-none prose-p:text-white/70 prose-headings:text-white focus:outline-none min-h-[600px] p-12 prose-blockquote:border-l-luxury-gold prose-blockquote:bg-white/5 prose-blockquote:p-8 prose-blockquote:rounded-r-3xl prose-blockquote:italic',
      },
    },
  });

  const addYoutubeVideo = useCallback(() => {
    const url = window.prompt('Enter YouTube URL');
    if (url && editor) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }, [editor]);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="border border-white/5 rounded-[2.5rem] bg-luxury-black/40 backdrop-blur-xl overflow-hidden focus-within:border-luxury-gold/20 transition-all relative shadow-2xl flex flex-col min-h-[800px]">
      {isUploading && (
        <div className="absolute inset-0 z-50 bg-luxury-black/80 backdrop-blur-md flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-luxury-gold animate-spin mb-4" />
          <p className="text-white font-bold text-base tracking-widest uppercase">Syncing Media Asset...</p>
          <div className="w-64 bg-white/5 h-1.5 rounded-full mt-6 overflow-hidden border border-white/5">
             <div className="bg-luxury-gold h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Primary Toolbar (Always Visible) */}
      <div className="flex flex-wrap items-center gap-1 p-3 bg-white/5 border-b border-white/5 sticky top-0 z-40 backdrop-blur-md">
        
        {/* Style Selector */}
        <Select 
          value={editor.isActive('heading', { level: 1 }) ? 'h1' : editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'}
          onValueChange={(val) => {
            if (val === 'p') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(val.substring(1)) as any }).run();
          }}
        >
          <SelectTrigger className="w-32 h-9 bg-white/5 border-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-lg">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent className="bg-luxury-black border-white/10 text-white">
            <SelectItem value="p">Paragraph</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Font Size Selector */}
        <Select 
          onValueChange={(size) => (editor.commands as any).setFontSize(size)}
        >
          <SelectTrigger className="w-24 h-9 bg-white/5 border-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-lg">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent className="bg-luxury-black border-white/10 text-white">
            <SelectItem value="12px">Small</SelectItem>
            <SelectItem value="16px">Medium</SelectItem>
            <SelectItem value="24px">Large</SelectItem>
            <SelectItem value="32px">X-Large</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Basic Formatting */}
        <MenuButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
        <MenuButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
        <MenuButton title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={UnderlineIcon} />
        
        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Alignment */}
        <MenuButton title="Align Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} />
        <MenuButton title="Align Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} />
        <MenuButton title="Align Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={AlignRight} />
        <MenuButton title="Justify" onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} icon={AlignJustify} />

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Color & Highlight */}
        <button 
          title="Text Color"
          type="button"
          onClick={() => {
            const color = window.prompt('Enter HEX color (e.g. #C5A059)');
            if (color) editor.chain().focus().setColor(color).run();
          }}
          className="p-2 rounded-md text-white/60 hover:bg-white/10 transition-colors"
        >
          <Palette size={16} />
        </button>
        <button 
          title="Highlight"
          type="button"
          onClick={() => {
            const color = window.prompt('Enter HEX for highlight (e.g. #C5A059)');
            if (color) editor.chain().focus().toggleHighlight({ color }).run();
          }}
          className="p-2 rounded-md text-white/60 hover:bg-white/10 transition-colors"
        >
          <Highlighter size={16} />
        </button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Lists & Blocks */}
        <MenuButton title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} />
        <MenuButton title="Ordered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} />
        <MenuButton title="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} />
        <MenuButton title="Callout" onClick={() => (editor.chain().focus() as any).insertContent({ type: 'callout', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Important intelligence briefing note...' }] }] }).run()} isActive={editor.isActive('callout')} icon={AlertCircle} />
        <MenuButton title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()} isActive={false} icon={Minus} />

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Advanced Media & Objects */}
        <MenuButton title="Table" onClick={addTable} isActive={editor.isActive('table')} icon={TableIcon} />
        <MenuButton title="Code Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} icon={Code} />
        <MenuButton title="Insert Image" onClick={() => fileInputRef.current?.click()} isActive={false} icon={ImageIcon} />
        <MenuButton title="YouTube Embed" onClick={addYoutubeVideo} isActive={false} icon={YoutubeIcon} />
        <MenuButton title="Hyperlink" onClick={setLink} isActive={editor.isActive('link')} icon={LinkIcon} />
        <MenuButton title="Unlink" onClick={() => editor.chain().focus().unsetLink().run()} isActive={false} icon={Unlink} />
      </div>

      {/* Editor Content Area */}
      <div className="relative flex-1 overflow-auto bg-transparent luxury-scroll">
        <EditorContent editor={editor} className="min-h-full" />
        
        {/* Editorial Stats Overlay */}
        <div className="sticky bottom-6 right-8 flex items-center justify-end pointer-events-none p-4">
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-black text-luxury-gold/40 border border-white/5 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl pointer-events-auto">
            <div className="flex items-center gap-2 border-r border-white/10 pr-4">
               <Type size={12} className="text-luxury-gold" />
               {editor.storage.characterCount.words()} Words
            </div>
            <div className="flex items-center gap-2">
               <Timer size={12} className="text-luxury-gold" />
               {Math.ceil(editor.storage.characterCount.words() / 200)} Min Read
            </div>
          </div>
        </div>
      </div>
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    </div>
  );
}



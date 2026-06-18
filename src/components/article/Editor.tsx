import { useState, useRef, useCallback, useEffect } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';
import { FloatingMenu } from '@tiptap/extension-floating-menu';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
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
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { Extension, Node as TiptapNode, mergeAttributes } from '@tiptap/core';
import { common, createLowlight } from 'lowlight';
import { motion, AnimatePresence } from 'framer-motion';
// ... (omitted) ...

const Callout = TiptapNode.create({
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
      class: 'callout-block bg-luxury-gold/5 border-l-4 border-luxury-gold p-8 my-10 rounded-r-3xl relative' 
    }), 0]
  },
})
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { uploadFile } from '@/services/uploadService';
import { 
  Bold, Italic, 
  List, ListOrdered, Quote, Image as ImageIcon, 
  Link as LinkIcon, Unlink, Loader2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Underline as UnderlineIcon, Table as TableIcon,
  Minus, Code, Palette, Highlighter, Youtube as YoutubeIcon,
  Plus, Smartphone, Tablet, Monitor, Info, Timer,
  RemoveFormatting, Type, AlertCircle, GripHorizontal,
  Eraser, Check, Hash, Activity, Terminal,
  X, Expand, Maximize, FileText, RefreshCw, Trash2
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

const FontWeight = Extension.create({
  name: 'fontWeight',
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
          fontWeight: {
            default: null,
            parseHTML: element => element.style.fontWeight,
            renderHTML: attributes => {
              if (!attributes.fontWeight) return {}
              return { style: `font-weight: ${attributes.fontWeight}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontWeight: (fontWeight: string) => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontWeight }).run()
      },
    } as any
  },
})

const LineHeight = Extension.create({
  name: 'lineHeight',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight,
            renderHTML: attributes => {
              if (!attributes.lineHeight) return {}
              return { style: `line-height: ${attributes.lineHeight}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setLineHeight: (lineHeight: string) => ({ commands }: any) => {
        return commands.updateAttributes('paragraph', { lineHeight }) || commands.updateAttributes('heading', { lineHeight })
      },
    } as any
  },
})

function ImageNodeView({ node, updateAttributes, deleteNode, selected }: any) {
  const { src, alt, width, align, caption, linkUrl } = node.attrs;
  const [isEditingAlt, setIsEditingAlt] = useState(false);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [altText, setAltText] = useState(alt || '');
  const [urlText, setUrlText] = useState(linkUrl || '');
  const [captionText, setCaptionText] = useState(caption || '');
  const [isKeyboardEditingCaption, setIsKeyboardEditingCaption] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const fileInputRefForReplace = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Sync state on change
  useEffect(() => {
    setAltText(alt || '');
  }, [alt]);

  useEffect(() => {
    setUrlText(linkUrl || '');
  }, [linkUrl]);

  useEffect(() => {
    setCaptionText(caption || '');
  }, [caption]);

  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = imgRef.current ? imgRef.current.offsetWidth : 300;
    const parentWidth = imgRef.current?.parentElement?.parentElement?.offsetWidth || 1;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidthPixels = Math.max(100, startWidth + deltaX);
      const newWidthPercent = Math.min(100, Math.round((newWidthPixels / parentWidth) * 100));
      updateAttributes({ width: `${newWidthPercent}%` });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleWidthPreset = (pct: string) => {
    updateAttributes({ width: pct });
  };

  const handleAlignment = (alignment: string) => {
    updateAttributes({ align: alignment });
  };

  const saveAlt = () => {
    updateAttributes({ alt: altText });
    setIsEditingAlt(false);
  };

  const saveLink = () => {
    updateAttributes({ linkUrl: urlText });
    setIsEditingLink(false);
  };

  const saveCaption = () => {
    updateAttributes({ caption: captionText });
    setIsKeyboardEditingCaption(false);
  };

  const handleReplaceImageClick = () => {
    fileInputRefForReplace.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        setIsReplacing(true);
        const url = await uploadFile(file, 'articles_inline');
        updateAttributes({ src: url });
      } catch (error) {
        console.error('Failed to replace image:', error);
      } finally {
        setIsReplacing(false);
      }
    }
  };

  // Determine wrapper classes based on alignment
  let alignClasses = 'mx-auto';
  if (align === 'left') {
    alignClasses = 'float-left mr-8 mb-4 max-w-[50%] clear-both';
  } else if (align === 'right') {
    alignClasses = 'float-right ml-8 mb-4 max-w-[50%] clear-both';
  } else if (align === 'full') {
    alignClasses = 'w-full block clear-both mx-0';
  }

  return (
    <NodeViewWrapper className={`relative my-8 group/img select-none ${alignClasses}`} style={{ width: align === 'full' ? '100%' : width }}>
      <div 
        className={`relative rounded-2xl overflow-visible border transition-all ${selected ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30' : 'border-white/10 group-hover/img:border-white/20'}`}
      >
        {/* Render Image optionally wrapped in a link */}
        <div className="relative">
          {isReplacing && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
              <Loader2 className="w-8 h-8 text-luxury-gold animate-spin" />
            </div>
          )}
          {linkUrl ? (
            <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block pointer-events-none">
              <img 
                ref={imgRef} 
                src={src} 
                alt={alt} 
                className="rounded-2xl w-full object-cover select-none pointer-events-none" 
              />
            </a>
          ) : (
            <img 
              ref={imgRef} 
              src={src} 
              alt={alt} 
              className="rounded-2xl w-full object-cover select-none pointer-events-none" 
            />
          )}

          {/* Clickable URL Status Indicator */}
          {linkUrl && (
            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 text-[10px] text-white/80 rounded-full font-mono flex items-center gap-1.5 border border-white/5 pointer-events-none">
              <LinkIcon size={12} className="text-[#C5A059]" /> Link Active
            </div>
          )}

          {/* Drag Resize Handle */}
          {selected && align !== 'full' && (
            <div 
              onMouseDown={handleResize}
              className="absolute bottom-2 right-2 w-6 h-6 bg-[#C5A059] hover:bg-white text-black rounded-lg cursor-se-resize flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
              title="Drag to Resize"
            >
              <Expand size={12} />
            </div>
          )}
        </div>

        {/* Caption Area */}
        <div className="mt-3 px-4 pb-2">
          {selected || isKeyboardEditingCaption ? (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                onFocus={() => setIsKeyboardEditingCaption(true)}
                onBlur={saveCaption}
                onKeyDown={(e) => e.key === 'Enter' && saveCaption()}
                placeholder="Enter caption for this image..."
                className="w-full bg-transparent border-0 border-b border-white/10 text-xs text-white/70 focus:outline-none focus:border-[#C5A059] py-1 italic text-center placeholder:text-white/20 font-serif"
              />
            </div>
          ) : caption ? (
            <p className="text-xs text-center text-white/50 italic font-serif leading-relaxed">
              {caption}
            </p>
          ) : (
            <p className="text-[10px] text-center text-white/20 hover:text-white/40 transition-colors uppercase tracking-wider font-semibold cursor-pointer" onClick={() => setIsKeyboardEditingCaption(true)}>
              + Add Caption
            </p>
          )}
        </div>

        {/* CMS Control Toolbar */}
        {selected && (
          <div className="absolute left-1/2 -translate-x-1/2 -top-16 bg-luxury-black/90 border border-white/10 p-2.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center gap-1.5 z-50 text-white min-w-max">
            {/* Alignment Controls */}
            <div className="flex items-center gap-1 border-r border-white/10 pr-2">
              <button 
                type="button" 
                onClick={() => handleAlignment('left')}
                className={`p-1.5 rounded-lg transition-colors ${align === 'left' ? 'bg-[#C5A059] text-black' : 'hover:bg-white/10 text-white/75'}`}
                title="Left Align"
              >
                <AlignLeft size={14} />
              </button>
              <button 
                type="button" 
                onClick={() => handleAlignment('center')}
                className={`p-1.5 rounded-lg transition-colors ${align === 'center' ? 'bg-[#C5A059] text-black' : 'hover:bg-white/10 text-white/75'}`}
                title="Center Align"
              >
                <AlignCenter size={14} />
              </button>
              <button 
                type="button" 
                onClick={() => handleAlignment('right')}
                className={`p-1.5 rounded-lg transition-colors ${align === 'right' ? 'bg-[#C5A059] text-black' : 'hover:bg-white/10 text-white/75'}`}
                title="Right Align"
              >
                <AlignRight size={14} />
              </button>
              <button 
                type="button" 
                onClick={() => handleAlignment('full')}
                className={`p-1.5 rounded-lg transition-colors ${align === 'full' ? 'bg-[#C5A059] text-black' : 'hover:bg-white/10 text-white/75'}`}
                title="Full Width"
              >
                <Maximize size={14} />
              </button>
            </div>

            {/* Width Presets */}
            {align !== 'full' && (
              <div className="flex items-center gap-1 border-r border-white/10 px-2">
                <button 
                  type="button" 
                  onClick={() => handleWidthPreset('25%')}
                  className={`px-2 py-1 text-[10px] font-black rounded-lg transition-colors uppercase ${width === '25%' ? 'bg-[#C5A059] text-black' : 'hover:bg-white/10 text-white/60'}`}
                  title="Small Width (25%)"
                >
                  S
                </button>
                <button 
                  type="button" 
                  onClick={() => handleWidthPreset('50%')}
                  className={`px-2 py-1 text-[10px] font-black rounded-lg transition-colors uppercase ${width === '50%' ? 'bg-[#C5A059] text-black' : 'hover:bg-white/10 text-white/60'}`}
                  title="Medium Width (50%)"
                >
                  M
                </button>
                <button 
                  type="button" 
                  onClick={() => handleWidthPreset('75%')}
                  className={`px-2 py-1 text-[10px] font-black rounded-lg transition-colors uppercase ${width === '75%' ? 'bg-[#C5A059] text-black' : 'hover:bg-white/10 text-white/60'}`}
                  title="Large Width (75%)"
                >
                  L
                </button>
                <button 
                  type="button" 
                  onClick={() => handleWidthPreset('100%')}
                  className={`px-2 py-1 text-[10px] font-black rounded-lg transition-colors uppercase ${width === '100%' ? 'bg-[#C5A059] text-black' : 'hover:bg-white/10 text-white/60'}`}
                  title="Full width (100%)"
                >
                  F
                </button>
              </div>
            )}

            {/* Clickable URL Link */}
            <div className="relative">
              <button 
                type="button" 
                onClick={() => { setIsEditingLink(!isEditingLink); setIsEditingAlt(false); }}
                className={`p-1.5 rounded-lg transition-colors hover:bg-white/10 ${linkUrl ? 'text-[#C5A059]' : 'text-white/75'}`}
                title="Add Clickable Link URL"
              >
                <LinkIcon size={14} />
              </button>

              {isEditingLink && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-luxury-black border border-white/10 p-3 rounded-xl shadow-2xl flex flex-col gap-2 z-50 w-64 text-left">
                  <div className="text-[9px] uppercase font-bold text-white/40 tracking-wider">Image Clickable URL</div>
                  <div className="flex gap-1.5">
                    <input 
                      type="text" 
                      value={urlText}
                      onChange={(e) => setUrlText(e.target.value)}
                      className="bg-white/15 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white flex-1 focus:outline-none focus:border-[#C5A059]/50 font-mono"
                      placeholder="https://example.com"
                    />
                    <button type="button" onClick={saveLink} className="bg-[#C5A059] text-black p-1 hover:bg-white rounded-lg transition-colors">
                      <Check size={14} />
                    </button>
                    <button type="button" onClick={() => setIsEditingLink(false)} className="bg-white/5 text-white p-1 hover:bg-white/10 rounded-lg transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Alt Tag SEO */}
            <div className="relative border-r border-[#ffffff20] pr-2">
              <button 
                type="button" 
                onClick={() => { setIsEditingAlt(!isEditingAlt); setIsEditingLink(false); }}
                className={`p-1.5 rounded-lg transition-colors hover:bg-white/10 ${alt ? 'text-[#C5A059]' : 'text-white/75'}`}
                title="Define SEO ALT Tag"
              >
                <FileText size={14} />
              </button>

              {isEditingAlt && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-luxury-black border border-white/10 p-3 rounded-xl shadow-2xl flex flex-col gap-2 z-50 w-64 text-left font-sans">
                  <div className="text-[9px] uppercase font-bold text-white/40 tracking-wider">SEO ALT Tag</div>
                  <div className="flex gap-1.5">
                    <input 
                      type="text" 
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      className="bg-white/15 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white flex-1 focus:outline-none focus:border-[#C5A059]/50"
                      placeholder="SEO ALT Text..."
                    />
                    <button type="button" onClick={saveAlt} className="bg-[#C5A059] text-black p-1 hover:bg-white rounded-lg transition-colors">
                      <Check size={14} />
                    </button>
                    <button type="button" onClick={() => setIsEditingAlt(false)} className="bg-white/5 text-white p-1 hover:bg-white/10 rounded-lg transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Replace Image and Delete Image */}
            <button 
              type="button" 
              onClick={handleReplaceImageClick}
              className="p-1.5 hover:bg-white/10 text-white/75 rounded-lg transition-all"
              title="Replace Media Source"
            >
              <RefreshCw size={14} />
            </button>

            <button 
              type="button" 
              onClick={deleteNode}
              className="p-1.5 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-all"
              title="Remove Media"
            >
              <Trash2 size={14} />
            </button>

            <input type="file" ref={fileInputRefForReplace} onChange={handleReplaceFile} accept="image/*" className="hidden" />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => ({
          src: attributes.src,
        }),
      },
      alt: {
        default: '',
        parseHTML: element => element.getAttribute('alt') || '',
        renderHTML: attributes => ({
          alt: attributes.alt,
        }),
      },
      width: {
        default: '100%',
        parseHTML: element => element.style.width || element.getAttribute('width') || '100%',
        renderHTML: attributes => ({
          style: `width: ${attributes.width}`,
          width: attributes.width,
        }),
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align') || 'center',
        renderHTML: attributes => ({
          'data-align': attributes.align,
        }),
      },
      caption: {
        default: '',
        parseHTML: element => element.getAttribute('data-caption') || '',
        renderHTML: attributes => ({
          'data-caption': attributes.caption,
        }),
      },
      linkUrl: {
        default: '',
        parseHTML: element => element.getAttribute('data-link-url') || '',
        renderHTML: attributes => ({
          'data-link-url': attributes.linkUrl,
        }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, width, align, caption, linkUrl } = HTMLAttributes;
    
    let inlineStyle = `width: ${width || '100%'}; max-width: 100%; display: block; margin-top: 2rem; margin-bottom: 2rem;`;
    if (align === 'left') {
      inlineStyle += ' float: left; margin-right: 1.5rem; margin-bottom: 1rem; max-width: 50%; clear: both;';
    } else if (align === 'right') {
      inlineStyle += ' float: right; margin-left: 1.5rem; margin-bottom: 1rem; max-width: 50%; clear: both;';
    } else if (align === 'center') {
      inlineStyle += ' margin-left: auto; margin-right: auto; text-align: center;';
    } else if (align === 'full') {
      inlineStyle += ' width: 100%; max-width: 100%; clear: both; margin-left: 0; margin-right: 0;';
    }

    return [
      'figure',
      {
        class: `tip-image-figure align-${align || 'center'}`,
        style: inlineStyle,
        'data-align': align || 'center',
        'data-caption': caption || '',
        'data-link-url': linkUrl || '',
      },
      [
        linkUrl ? 'a' : 'div',
        linkUrl ? { href: linkUrl, target: '_blank', rel: 'noopener noreferrer', style: 'display: block;' } : { style: 'display: block;' },
        ['img', { src: src || '', alt: alt || '', style: 'width: 100%; max-width: 100%; border-radius: 1rem; display: block;' }]
      ],
      caption ? ['figcaption', { class: 'image-caption', style: 'text-align: center; font-style: italic; font-size: 0.8125rem; opacity: 0.6; margin-top: 0.5rem; font-family: serif;' }, caption] : ['span', { class: 'hidden' }]
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

const StatisticsBlock = TiptapNode.create({
  name: 'statistics',
  group: 'block',
  content: 'inline*',
  draggable: true,
  addAttributes() {
    return {
      label: { default: 'Statistic Label' },
      value: { default: '0%' },
      trend: { default: '+0%' },
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-type="statistics"]' }]
  },
  renderHTML({ node }) {
    return ['div', { 
      'data-type': 'statistics', 
      class: 'stats-block bg-white/5 border border-white/5 p-8 rounded-[2rem] my-10 flex flex-col items-center justify-center text-center gap-2' 
    }, 
      ['p', { class: 'text-[10px] uppercase font-black tracking-[0.3em] text-white/40' }, node.attrs.label],
      ['h4', { class: 'text-5xl font-display font-black text-luxury-gold' }, node.attrs.value],
      ['p', { class: 'text-xs font-bold text-emerald-500' }, node.attrs.trend]
    ]
  },
})

// --- End Extensions ---

const MenuButton = ({ onClick, isActive, icon: Icon, title, disabled, className = '' }: any) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-md transition-all ${isActive ? 'text-luxury-gold bg-luxury-gold/10 shadow-lg shadow-luxury-gold/5' : 'text-white/60 hover:bg-white/10'} ${disabled ? 'opacity-30 cursor-not-allowed' : ''} ${className}`}
  >
    <Icon size={16} />
  </button>
);

// --- Custom Color Picker Component ---

const PRESET_COLORS = [
  { name: 'Luxury Gold', hex: '#C5A059' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Pure Black', hex: '#000000' },
  { name: 'Deep Gray', hex: '#222222' },
  { name: 'Muted Slate', hex: '#444444' },
  { name: 'Alert Red', hex: '#EF4444' },
  { name: 'Signal Blue', hex: '#3B82F6' },
  { name: 'Growth Green', hex: '#10B981' },
  { name: 'Soft Amber', hex: '#F59E0B' },
  { name: 'Royal Purple', hex: '#8B5CF6' },
];

const ColorPalette = ({ 
  onSelect, 
  onClose, 
  currentColor, 
  title, 
  onClear 
}: { 
  onSelect: (color: string) => void, 
  onClose: () => void, 
  currentColor?: string,
  title: string,
  onClear: () => void
}) => {
  const [customHex, setCustomHex] = useState(currentColor || '#');
  const paletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <motion.div
      ref={paletteRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute top-full left-0 mt-2 z-50 bg-luxury-black border border-white/10 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl w-64 space-y-6"
    >
      <div>
        <h4 className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-4">{title}</h4>
        <div className="grid grid-cols-5 gap-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.hex}
              type="button"
              onClick={() => onSelect(color.hex)}
              className="w-8 h-8 rounded-full border border-white/10 transition-all hover:scale-110 active:scale-95 group relative flex items-center justify-center p-0"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {(currentColor?.toLowerCase() === color.hex.toLowerCase()) && (
                <Check size={14} className={color.hex === '#FFFFFF' ? 'text-black' : 'text-white'} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[9px] uppercase font-black tracking-widest text-white/30 ml-1">Custom HEX Signature</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            className="flex-1 bg-white/5 border border-white/5 rounded-xl h-10 px-4 text-xs font-mono text-white focus:outline-none focus:border-luxury-gold/50"
            placeholder="#000000"
          />
          <button 
            type="button"
            onClick={() => onSelect(customHex)}
            className="bg-luxury-gold text-luxury-black p-2 rounded-xl transition-all hover:bg-white"
          >
            <Check size={16} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="w-full py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] uppercase font-black tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3"
      >
        <Eraser size={14} /> Reset Protocol
      </button>
    </motion.div>
  );
};

export default function Editor({ content, onChange }: { content: string, onChange: (html: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activePicker, setActivePicker] = useState<'text' | 'highlight' | null>(null);
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
      // Underline,
      Typography,
      TextStyle,
      Color,
      FontSize,
      FontWeight,
      LineHeight,
      Callout,
      StatisticsBlock,
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-12 border-t border-white/10 h-0 w-full',
        },
      }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'callout'],
      }),
      ResizableImage,
      // Link.configure({
      //   openOnClick: false,
      //   HTMLAttributes: {
      //     class: 'text-luxury-gold underline underline-offset-4 decoration-luxury-gold/50 hover:decoration-luxury-gold transition-colors',
      //   },
      // }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-fixed w-full my-8 border border-white/10 rounded-xl overflow-hidden',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-white/10 border border-white/10 p-4 text-left font-display font-black uppercase tracking-widest text-luxury-gold text-xs',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-white/10 p-4 text-white/70 text-lg',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-luxury-black/80 rounded-2xl p-8 my-10 font-mono text-sm border border-white/10 text-emerald-400 overflow-x-auto relative',
        },
      }),
      Youtube.configure({
        width: 840,
        height: 480,
        HTMLAttributes: {
          class: 'aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 my-12 w-full shadow-2xl',
        },
      }),
      CharacterCount,
      Placeholder.configure({
        placeholder: 'Intelligence core initialized. Begin drafting the briefing...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-luxury max-w-none prose-p:text-white/70 prose-headings:text-white focus:outline-none min-h-[800px] p-12 md:p-20 prose-blockquote:border-l-luxury-gold prose-blockquote:bg-white/5 prose-blockquote:p-10 prose-blockquote:rounded-r-[2.5rem] prose-blockquote:italic prose-blockquote:text-2xl prose-blockquote:font-serif',
      },
    },
  });

  const addYoutubeVideo = useCallback(() => {
    const url = window.prompt('Enter YouTube URL (e.g., https://www.youtube.com/watch?v=...)');
    if (url && editor) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }, [editor]);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Link URL', previousUrl);
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

  const addStatistics = () => {
    const label = window.prompt('Statistic Label', 'Market Growth');
    const value = window.prompt('Primary Value', '84.2%');
    const trend = window.prompt('Trend Factor', '+12.4% vs prev');
    if (label && value && editor) {
      (editor.chain().focus() as any).insertContent({ 
        type: 'statistics', 
        attrs: { label, value, trend } 
      }).run();
    }
  };

  const currentTextColor = editor.getAttributes('textStyle').color;
  const currentHighlightColor = editor.getAttributes('highlight').color;

  return (
    <div className="border border-white/5 rounded-[3rem] bg-luxury-black/40 backdrop-blur-xl transition-all relative shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col min-h-[900px]">
      {isUploading && (
        <div className="absolute inset-0 z-[100] bg-luxury-black/80 backdrop-blur-md flex flex-col items-center justify-center rounded-[3rem]">
          <Loader2 className="w-12 h-12 text-luxury-gold animate-spin mb-6" />
          <p className="text-white font-black text-xs tracking-[0.4em] uppercase">Processing Visual Intel...</p>
          <div className="w-80 bg-white/5 h-2 rounded-full mt-10 overflow-hidden border border-white/5">
             <div className="bg-luxury-gold h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Primary Toolbar (Always Visible) */}
      <div className="flex flex-wrap items-center gap-2 p-4 bg-white/5 border-b border-white/5 sticky top-0 z-[55] backdrop-blur-2xl rounded-t-[3rem]">
        
        {/* Style Selector */}
        <Select 
          value={editor.isActive('heading', { level: 1 }) ? 'h1' : editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : editor.isActive('heading', { level: 4 }) ? 'h4' : 'p'}
          onValueChange={(val) => {
            if (val === 'p') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(val.substring(1)) as any }).run();
          }}
        >
          <SelectTrigger className="w-36 h-10 bg-white/5 border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">
            <SelectValue placeholder="Style Profile" />
          </SelectTrigger>
          <SelectContent className="bg-luxury-black border-white/10 text-white p-2 rounded-2xl shadow-2xl">
            <SelectItem value="p" className="rounded-xl py-3 font-bold uppercase text-[9px]">Paragraph</SelectItem>
            <SelectItem value="h1" className="rounded-xl py-3 font-black uppercase text-[9px] text-luxury-gold">H1 Global</SelectItem>
            <SelectItem value="h2" className="rounded-xl py-3 font-black uppercase text-[9px]">H2 Section</SelectItem>
            <SelectItem value="h3" className="rounded-xl py-3 font-black uppercase text-[9px]">H3 Module</SelectItem>
            <SelectItem value="h4" className="rounded-xl py-3 font-black uppercase text-[9px]">H4 Descriptor</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Font Weight */}
        <Select 
          onValueChange={(weight) => (editor.commands as any).setFontWeight(weight)}
        >
          <SelectTrigger className="w-28 h-10 bg-white/5 border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">
            <SelectValue placeholder="Weight" />
          </SelectTrigger>
          <SelectContent className="bg-luxury-black border-white/10 text-white p-2 rounded-2xl">
            <SelectItem value="400" className="rounded-xl py-3 font-normal uppercase text-[9px]">Normal</SelectItem>
            <SelectItem value="500" className="rounded-xl py-3 font-medium uppercase text-[9px]">Medium</SelectItem>
            <SelectItem value="700" className="rounded-xl py-3 font-bold uppercase text-[9px]">Bold</SelectItem>
            <SelectItem value="900" className="rounded-xl py-3 font-black uppercase text-[9px]">Ultra Black</SelectItem>
          </SelectContent>
        </Select>

        {/* Font Size Selector */}
        <Select 
          onValueChange={(size) => (editor.commands as any).setFontSize(size)}
        >
          <SelectTrigger className="w-28 h-10 bg-white/5 border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">
            <SelectValue placeholder="Scale" />
          </SelectTrigger>
          <SelectContent className="bg-luxury-black border-white/10 text-white p-2 rounded-2xl">
            <SelectItem value="12px" className="rounded-xl py-3 font-black uppercase text-[9px]">T-Small</SelectItem>
            <SelectItem value="16px" className="rounded-xl py-3 font-black uppercase text-[9px]">T-Standard</SelectItem>
            <SelectItem value="24px" className="rounded-xl py-3 font-black uppercase text-[9px]">T-Large</SelectItem>
            <SelectItem value="36px" className="rounded-xl py-3 font-black uppercase text-[9px]">T-Major</SelectItem>
            <SelectItem value="48px" className="rounded-xl py-3 font-black uppercase text-[9px] text-luxury-gold">T-Cinema</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Basic Formatting */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
          <MenuButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
          <MenuButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
          <MenuButton title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={UnderlineIcon} />
        </div>
        
        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Alignment */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
          <MenuButton title="Align Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} />
          <MenuButton title="Align Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} />
          <MenuButton title="Align Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={AlignRight} />
          <MenuButton title="Justify" onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} icon={AlignJustify} />
        </div>

        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Color & Highlight System */}
        <div className="relative flex items-center gap-2">
          <button 
            title="Optical Pigment"
            type="button"
            onClick={() => setActivePicker(activePicker === 'text' ? null : 'text')}
            className={`p-2.5 rounded-xl transition-all flex items-center gap-2 border ${activePicker === 'text' || currentTextColor ? 'text-luxury-gold bg-luxury-gold/10 border-luxury-gold/30' : 'text-white/40 border-white/5 hover:bg-white/10'}`}
          >
            <Palette size={16} />
            {currentTextColor && <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: currentTextColor }} />}
          </button>
          
          <AnimatePresence>
            {activePicker === 'text' && (
              <ColorPalette 
                title="Optical Pigment (Text)"
                currentColor={currentTextColor}
                onSelect={(color) => {
                  editor.chain().focus().setColor(color).run();
                  setActivePicker(null);
                }}
                onClear={() => {
                  editor.chain().focus().unsetColor().run();
                  setActivePicker(null);
                }}
                onClose={() => setActivePicker(null)}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="relative flex items-center gap-2">
          <button 
            title="Saliency Highlight"
            type="button"
            onClick={() => setActivePicker(activePicker === 'highlight' ? null : 'highlight')}
            className={`p-2.5 rounded-xl transition-all flex items-center gap-2 border ${activePicker === 'highlight' || currentHighlightColor ? 'text-luxury-gold bg-luxury-gold/10 border-luxury-gold/30' : 'text-white/40 border-white/5 hover:bg-white/10'}`}
          >
            <Highlighter size={16} />
            {currentHighlightColor && <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: currentHighlightColor }} />}
          </button>

          <AnimatePresence>
            {activePicker === 'highlight' && (
              <ColorPalette 
                title="Saliency Vector (Highlight)"
                currentColor={currentHighlightColor}
                onSelect={(color) => {
                  editor.chain().focus().setHighlight({ color }).run();
                  setActivePicker(null);
                }}
                onClear={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setActivePicker(null);
                }}
                onClose={() => setActivePicker(null)}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Content Blocks */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
          <MenuButton title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} />
          <MenuButton title="Ordered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} />
          <MenuButton title="Executive Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} />
          <MenuButton title="Intel Callout" onClick={() => (editor.chain().focus() as any).insertContent({ type: 'callout', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Important intelligence briefing note...' }] }] }).run()} isActive={editor.isActive('callout')} icon={AlertCircle} />
          <MenuButton title="Stat Card" onClick={addStatistics} isActive={editor.isActive('statistics')} icon={Activity} />
          <MenuButton title="Vector Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()} isActive={false} icon={Minus} />
        </div>

        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Media & Advanced Integrations */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
          <MenuButton title="Data Matrix (Table)" onClick={addTable} isActive={editor.isActive('table')} icon={TableIcon} />
          <MenuButton title="Script Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} icon={Terminal} />
          <MenuButton title="Upload Visual" onClick={() => fileInputRef.current?.click()} isActive={false} icon={ImageIcon} />
          <MenuButton title="Video Stream" onClick={addYoutubeVideo} isActive={false} icon={YoutubeIcon} />
          <MenuButton title="Universal Link" onClick={setLink} isActive={editor.isActive('link')} icon={LinkIcon} />
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="relative flex-1 overflow-visible bg-transparent rounded-b-[3rem] focus-within:ring-2 ring-luxury-gold/5 transition-all">
        <EditorContent editor={editor} className="min-h-full" />
        

      </div>
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    </div>
  );
}




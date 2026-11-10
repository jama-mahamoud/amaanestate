import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Placeholder } from '@tiptap/extension-placeholder';

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Palette,
  Quote,
  Redo,
  RemoveFormatting,
  Strikethrough,
  Table as TableIcon,
  Type,
  Underline as UnderlineIcon,
  Undo,
  Unlink,
} from 'lucide-react';
import { resolveEditorialImage } from '../../lib/editorialImages';
import { isHtmlContent } from '../editorial/EditorialContent';

interface EditorialWysiwygEditorProps {
  content: string;
  onChange: (html: string) => void;
  onOpenMediaPicker: () => void;
  viewMode: 'write' | 'split' | 'preview';
  onViewModeChange: (mode: 'write' | 'split' | 'preview') => void;
}

export function convertMarkdownToHtml(md: string): string {
  if (!md) return '<p></p>';
  if (isHtmlContent(md)) return md;

  let html = md;
  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote><p>$1</p></blockquote>');
  // Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.*?)~~/g, '<s>$1</s>');
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  // Images
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
    const res = resolveEditorialImage(src);
    return `<img src="${res}" alt="${alt}" />`;
  });
  // Paragraphs
  const paragraphs = html.split(/\n\s*\n/).map((p) => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (/^<(h1|h2|h3|blockquote|ul|ol|table)/i.test(trimmed)) return trimmed;
    return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
  });
  return paragraphs.filter(Boolean).join('');
}

const TEXT_COLORS = [
  { label: 'Default Ink', value: '#141413' },
  { label: 'Navy Lapis', value: '#1E3A5F' },
  { label: 'Bronze Accent', value: '#8C4A27' },
  { label: 'Muted Gray', value: '#5C5A55' },
  { label: 'Forest Green', value: '#14532D' },
  { label: 'Crimson Red', value: '#991B1B' },
];

const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#FEF08A' },
  { label: 'Mint', value: '#BBF7D0' },
  { label: 'Peach', value: '#FED7AA' },
  { label: 'Sky Blue', value: '#BAE6FD' },
  { label: 'Soft Lavender', value: '#E9D5FF' },
];

export default function EditorialWysiwygEditor({
  content,
  onChange,
  onOpenMediaPicker,
  viewMode,
  onViewModeChange,
}: EditorialWysiwygEditorProps) {
  const [initialHtml] = useState(() => convertMarkdownToHtml(content));
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const [showColorPopover, setShowColorPopover] = useState(false);
  const [showHighlightPopover, setShowHighlightPopover] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-[#1E3A5F] underline underline-offset-2',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: 'Write your architectural essay, market analysis, or research paper here...',
      }),
    ],
    content: initialHtml,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      const converted = convertMarkdownToHtml(content);
      if (converted !== editor.getHTML()) {
        editor.commands.setContent(converted, { emitUpdate: false });
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  const handleSetLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl.trim(), target: '_blank' })
        .run();
    }
    setShowLinkModal(false);
    setLinkUrl('');
  };

  const handleUnlink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const openLinkModal = () => {
    const existingHref = editor.getAttributes('link').href || '';
    setLinkUrl(existingHref);
    setShowLinkModal(true);
  };

  const isInTable = editor.isActive('table');

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-md overflow-hidden flex flex-col shadow-sm">
      {/* Editorial WYSIWYG Toolbar */}
      <div className="bg-[#FAF8F5] border-b border-[#E5E0D8] p-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0 select-none">
        <div className="flex flex-wrap items-center gap-1">
          {/* History */}
          <button
            type="button"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-[#EFECE6] text-[#141413] disabled:opacity-30 cursor-pointer"
          >
            <Undo size={15} />
          </button>
          <button
            type="button"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded hover:bg-[#EFECE6] text-[#141413] disabled:opacity-30 cursor-pointer"
          >
            <Redo size={15} />
          </button>

          <span className="w-px h-5 bg-[#D6CEBE] mx-1" aria-hidden="true" />

          {/* Headings & Normal Text Dropdown */}
          <select
            value={
              editor.isActive('heading', { level: 1 })
                ? 'h1'
                : editor.isActive('heading', { level: 2 })
                ? 'h2'
                : editor.isActive('heading', { level: 3 })
                ? 'h3'
                : 'paragraph'
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
              else if (val === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
              else if (val === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
              else editor.chain().focus().setParagraph().run();
            }}
            className="h-8 px-2 bg-white border border-[#D6CEBE] rounded text-xs font-semibold text-[#141413] cursor-pointer"
          >
            <option value="paragraph">Normal Paragraph</option>
            <option value="h1">Heading 1 (Title)</option>
            <option value="h2">Heading 2 (Section)</option>
            <option value="h3">Heading 3 (Sub-section)</option>
          </select>

          <span className="w-px h-5 bg-[#D6CEBE] mx-1" aria-hidden="true" />

          {/* Basic Formatting: Bold, Italic, Underline, Strike */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
            className={`p-1.5 rounded cursor-pointer ${
              editor.isActive('bold') ? 'bg-[#1E3A5F] text-white font-bold' : 'hover:bg-[#EFECE6] text-[#141413]'
            }`}
          >
            <Bold size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
            className={`p-1.5 rounded cursor-pointer ${
              editor.isActive('italic') ? 'bg-[#1E3A5F] text-white' : 'hover:bg-[#EFECE6] text-[#141413]'
            }`}
          >
            <Italic size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline (Ctrl+U)"
            className={`p-1.5 rounded cursor-pointer ${
              editor.isActive('underline') ? 'bg-[#1E3A5F] text-white' : 'hover:bg-[#EFECE6] text-[#141413]'
            }`}
          >
            <UnderlineIcon size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
            className={`p-1.5 rounded cursor-pointer ${
              editor.isActive('strike') ? 'bg-[#1E3A5F] text-white' : 'hover:bg-[#EFECE6] text-[#141413]'
            }`}
          >
            <Strikethrough size={15} />
          </button>

          <span className="w-px h-5 bg-[#D6CEBE] mx-1" aria-hidden="true" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Align Left"
            className={`p-1.5 rounded cursor-pointer ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-[#1E3A5F] text-white' : 'hover:bg-[#EFECE6] text-[#141413]'
            }`}
          >
            <AlignLeft size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Align Center"
            className={`p-1.5 rounded cursor-pointer ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-[#1E3A5F] text-white' : 'hover:bg-[#EFECE6] text-[#141413]'
            }`}
          >
            <AlignCenter size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Align Right"
            className={`p-1.5 rounded cursor-pointer ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-[#1E3A5F] text-white' : 'hover:bg-[#EFECE6] text-[#141413]'
            }`}
          >
            <AlignRight size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            title="Justify"
            className={`p-1.5 rounded cursor-pointer ${
              editor.isActive({ textAlign: 'justify' }) ? 'bg-[#1E3A5F] text-white' : 'hover:bg-[#EFECE6] text-[#141413]'
            }`}
          >
            <AlignJustify size={15} />
          </button>

          <span className="w-px h-5 bg-[#D6CEBE] mx-1" aria-hidden="true" />

          {/* Color & Highlight */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowColorPopover((v) => !v);
                setShowHighlightPopover(false);
              }}
              title="Text Color"
              className="p-1.5 rounded hover:bg-[#EFECE6] text-[#141413] flex items-center gap-0.5 cursor-pointer"
            >
              <Palette size={15} />
            </button>
            {showColorPopover && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-[#E5E0D8] rounded shadow-lg z-30 space-y-1 w-40">
                <div className="text-[11px] font-semibold text-[#5C5A55] px-1">Text Color</div>
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setColor(c.value).run();
                      setShowColorPopover(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded text-xs hover:bg-[#FAF8F5] flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: c.value }} />
                    <span>{c.label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    setShowColorPopover(false);
                  }}
                  className="w-full text-left px-2 py-1 text-[11px] font-semibold text-[#991B1B] hover:bg-[#FEF2F2] rounded cursor-pointer"
                >
                  Reset Color
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowHighlightPopover((v) => !v);
                setShowColorPopover(false);
              }}
              title="Highlight Color"
              className="p-1.5 rounded hover:bg-[#EFECE6] text-[#141413] flex items-center gap-0.5 cursor-pointer"
            >
              <Highlighter size={15} />
            </button>
            {showHighlightPopover && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-[#E5E0D8] rounded shadow-lg z-30 space-y-1 w-40">
                <div className="text-[11px] font-semibold text-[#5C5A55] px-1">Highlight Color</div>
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().toggleHighlight({ color: c.value }).run();
                      setShowHighlightPopover(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded text-xs hover:bg-[#FAF8F5] flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded border border-black/10 shrink-0" style={{ backgroundColor: c.value }} />
                    <span>{c.label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetHighlight().run();
                    setShowHighlightPopover(false);
                  }}
                  className="w-full text-left px-2 py-1 text-[11px] font-semibold text-[#991B1B] hover:bg-[#FEF2F2] rounded cursor-pointer"
                >
                  Clear Highlight
                </button>
              </div>
            )}
          </div>

          <span className="w-px h-5 bg-[#D6CEBE] mx-1" aria-hidden="true" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
            className={`p-1.5 rounded cursor-pointer ${
              editor.isActive('bulletList') ? 'bg-[#1E3A5F] text-white' : 'hover:bg-[#EFECE6] text-[#141413]'
            }`}
          >
            <List size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
            className={`p-1.5 rounded cursor-pointer ${
              editor.isActive('orderedList') ? 'bg-[#1E3A5F] text-white' : 'hover:bg-[#EFECE6] text-[#141413]'
            }`}
          >
            <ListOrdered size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
            className={`p-1.5 rounded cursor-pointer ${
              editor.isActive('blockquote') ? 'bg-[#1E3A5F] text-white' : 'hover:bg-[#EFECE6] text-[#141413]'
            }`}
          >
            <Quote size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Divider"
            className="p-1.5 rounded hover:bg-[#EFECE6] text-[#141413] cursor-pointer"
          >
            <Minus size={15} />
          </button>

          <span className="w-px h-5 bg-[#D6CEBE] mx-1" aria-hidden="true" />

          {/* Link */}
          <button
            type="button"
            onClick={openLinkModal}
            title="Insert / Edit Link"
            className={`p-1.5 rounded cursor-pointer ${
              editor.isActive('link') ? 'bg-[#1E3A5F] text-white' : 'hover:bg-[#EFECE6] text-[#141413]'
            }`}
          >
            <Link2 size={15} />
          </button>

          {editor.isActive('link') && (
            <button
              type="button"
              onClick={handleUnlink}
              title="Remove Link"
              className="p-1.5 rounded hover:bg-[#FEF2F2] text-[#991B1B] cursor-pointer"
            >
              <Unlink size={15} />
            </button>
          )}

          {/* Insert Image from Media Library */}
          <button
            type="button"
            onClick={onOpenMediaPicker}
            title="Insert Image from Supabase Media Library"
            className="px-2.5 py-1 rounded hover:bg-[#EFECE6] text-xs font-semibold text-[#1E3A5F] inline-flex items-center gap-1 cursor-pointer"
          >
            <ImageIcon size={14} />
            <span>Image</span>
          </button>

          {/* Table Operations */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTableMenu((v) => !v)}
              title="Table Operations"
              className={`p-1.5 rounded cursor-pointer ${
                isInTable ? 'bg-[#1E3A5F] text-white' : 'hover:bg-[#EFECE6] text-[#141413]'
              }`}
            >
              <TableIcon size={15} />
            </button>
            {showTableMenu && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-[#E5E0D8] rounded shadow-lg z-30 space-y-1 w-48 text-xs">
                {!isInTable ? (
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                      setShowTableMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-[#FAF8F5] rounded font-semibold text-[#1E3A5F] cursor-pointer"
                  >
                    Insert 3x3 Table
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().addColumnBefore().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2 py-1 hover:bg-[#FAF8F5] rounded cursor-pointer"
                    >
                      Add Column Before
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().addColumnAfter().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2 py-1 hover:bg-[#FAF8F5] rounded cursor-pointer"
                    >
                      Add Column After
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().deleteColumn().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2 py-1 hover:bg-[#FEF2F2] text-[#991B1B] rounded cursor-pointer"
                    >
                      Delete Column
                    </button>
                    <div className="my-1 border-t border-[#E5E0D8]" />
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().addRowBefore().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2 py-1 hover:bg-[#FAF8F5] rounded cursor-pointer"
                    >
                      Add Row Before
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().addRowAfter().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2 py-1 hover:bg-[#FAF8F5] rounded cursor-pointer"
                    >
                      Add Row After
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().deleteRow().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2 py-1 hover:bg-[#FEF2F2] text-[#991B1B] rounded cursor-pointer"
                    >
                      Delete Row
                    </button>
                    <div className="my-1 border-t border-[#E5E0D8]" />
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().deleteTable().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2 py-1.5 font-semibold hover:bg-[#FEF2F2] text-[#991B1B] rounded cursor-pointer"
                    >
                      Delete Table
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <span className="w-px h-5 bg-[#D6CEBE] mx-1" aria-hidden="true" />

          {/* Clear Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            title="Clear Formatting"
            className="p-1.5 rounded hover:bg-[#EFECE6] text-[#5C5A55] hover:text-[#141413] cursor-pointer"
          >
            <RemoveFormatting size={15} />
          </button>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center gap-1 bg-white border border-[#D6CEBE] rounded p-0.5 shrink-0">
          {(['write', 'split', 'preview'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onViewModeChange(m)}
              className={`px-2.5 py-1 rounded text-xs font-semibold capitalize cursor-pointer ${
                viewMode === m ? 'bg-[#1E3A5F] text-white' : 'text-[#5C5A55] hover:text-[#141413]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Link Popover Modal */}
      {showLinkModal && (
        <form
          onSubmit={handleSetLink}
          className="bg-[#FAF8F5] border-b border-[#E5E0D8] px-4 py-3 flex flex-wrap items-end gap-3"
        >
          <div className="flex-1 min-w-[220px]">
            <label className="text-[11px] font-semibold text-[#5C5A55] block mb-1">
              Hyperlink Target URL
            </label>
            <input
              type="url"
              required
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://amaanestate.com/research/..."
              className="w-full h-9 px-3 bg-white border border-[#D6CEBE] rounded text-xs font-mono"
            />
          </div>
          <button
            type="submit"
            className="h-9 px-4 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer"
          >
            Apply Link
          </button>
          <button
            type="button"
            onClick={() => setShowLinkModal(false)}
            className="h-9 px-3 text-xs text-[#5C5A55] cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Editor Main Canvas Container */}
      <div className="flex-1 bg-white">
        <EditorContent editor={editor} className="min-h-[480px]" />
      </div>
    </div>
  );
}

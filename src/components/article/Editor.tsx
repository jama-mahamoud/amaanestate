import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Image as ImageIcon, Link as LinkIcon, Unlink } from 'lucide-react';

const MenuButton = ({ onClick, isActive, icon: Icon, title }: any) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`p-2.5 rounded-lg hover:bg-white/10 transition-colors ${isActive ? 'text-luxury-gold bg-white/5' : 'text-white/60'}`}
  >
    <Icon size={18} />
  </button>
);

export default function Editor({ content, onChange }: { content: string, onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full my-8 border border-white/10',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-luxury-gold underline underline-offset-4 decoration-luxury-gold/50 hover:decoration-luxury-gold transition-colors',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-luxury max-w-none prose-p:text-white/70 prose-headings:text-white focus:outline-none min-h-[400px] p-8',
      },
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('URL of the image (or use the Media Asset uploader above for featured images):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return; // cancelled
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border border-white/5 rounded-2xl bg-white/5 overflow-hidden focus-within:border-luxury-gold/30 transition-colors">
      <div className="flex flex-wrap gap-1 p-3 border-b border-white/5 bg-luxury-black/50 backdrop-blur-md">
        <MenuButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
        <MenuButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
        <div className="w-px h-6 bg-white/10 mx-2 my-auto" />
        <MenuButton title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={Heading1} />
        <MenuButton title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} />
        <div className="w-px h-6 bg-white/10 mx-2 my-auto" />
        <MenuButton title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} />
        <MenuButton title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} />
        <MenuButton title="Quote block" onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} />
        <div className="w-px h-6 bg-white/10 mx-2 my-auto" />
        <MenuButton title="Add Link" onClick={setLink} isActive={editor.isActive('link')} icon={LinkIcon} />
        <MenuButton title="Remove Link" onClick={() => editor.chain().focus().unsetLink().run()} isActive={false} icon={Unlink} />
        <MenuButton title="Insert Image" onClick={addImage} isActive={false} icon={ImageIcon} />
      </div>
      <EditorContent editor={editor} className="bg-transparent" />
    </div>
  );
}

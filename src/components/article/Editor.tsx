import { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Image as ImageIcon, Link as LinkIcon, Unlink, Loader2 } from 'lucide-react';
import { uploadFile } from '@/services/uploadService';

const MenuButton = ({ onClick, isActive, icon: Icon, title, disabled }: any) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`p-2.5 rounded-lg transition-colors ${isActive ? 'text-luxury-gold bg-white/5' : 'text-white/60 hover:bg-white/10'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <Icon size={18} />
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
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
      handleDrop: function(view, event, slice, moved) {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: function(view, event, slice) {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      }
    },
  });

  if (!editor) return null;

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
    <div className="border border-white/5 rounded-2xl bg-white/5 overflow-hidden focus-within:border-luxury-gold/30 transition-colors relative">
      {isUploading && (
        <div className="absolute inset-0 z-50 bg-luxury-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-luxury-gold animate-spin mb-4" />
          <p className="text-white font-bold text-sm">Uploading Image...</p>
          <div className="w-48 bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
             <div className="bg-luxury-gold h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1 p-3 border-b border-white/5 bg-luxury-black/50 backdrop-blur-md">
        <MenuButton disabled={isUploading} title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
        <MenuButton disabled={isUploading} title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
        <div className="w-px h-6 bg-white/10 mx-2 my-auto" />
        <MenuButton disabled={isUploading} title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={Heading1} />
        <MenuButton disabled={isUploading} title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} />
        <div className="w-px h-6 bg-white/10 mx-2 my-auto" />
        <MenuButton disabled={isUploading} title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} />
        <MenuButton disabled={isUploading} title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} />
        <MenuButton disabled={isUploading} title="Quote block" onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} />
        <div className="w-px h-6 bg-white/10 mx-2 my-auto" />
        <MenuButton disabled={isUploading} title="Add Link" onClick={setLink} isActive={editor.isActive('link')} icon={LinkIcon} />
        <MenuButton disabled={isUploading} title="Remove Link" onClick={() => editor.chain().focus().unsetLink().run()} isActive={false} icon={Unlink} />
        <MenuButton disabled={isUploading} title="Insert Image" onClick={triggerFileInput} isActive={false} icon={ImageIcon} />
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      <EditorContent editor={editor} className="bg-transparent" />
    </div>
  );
}

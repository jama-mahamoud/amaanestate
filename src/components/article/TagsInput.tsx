import { useState, KeyboardEvent, ClipboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
}

export default function TagsInput({ value = [], onChange, label = 'Tags', placeholder = 'Add tag (press Enter or Comma)...' }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTags = (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    // Split by comma, space, semicolon, or newline
    const newTags = trimmed
      .split(/[\s,;\n]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && !value.includes(tag));

    if (newTags.length > 0) {
      onChange([...value, ...newTags]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault();
      addTags(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag on backspace if input is empty
      onChange(value.slice(0, -1));
    }
  };

  const handleBlur = () => {
    addTags(inputValue);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    addTags(pastedText);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-3">
      <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">{label}</label>
      <div className="min-h-[56px] p-2 bg-white/5 rounded-xl border border-transparent focus-within:border-luxury-gold/50 flex flex-wrap gap-2 items-center transition-colors">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white rounded-lg text-sm font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-white/50 hover:text-white transition-colors focus:outline-none"
            >
              <X size={14} />
            </button>
          </span>
         ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onPaste={handlePaste}
          className="flex-1 min-w-[120px] bg-transparent border-none text-white text-sm focus:outline-none focus:ring-0 placeholder:text-white/20 px-2"
          placeholder={value.length === 0 ? placeholder : ''}
        />
      </div>
    </div>
  );
}

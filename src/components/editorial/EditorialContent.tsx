import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import { resolveEditorialImage } from '../../lib/editorialImages';

interface EditorialContentProps {
  content: string;
}

function getVideoEmbedUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.trim());
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const videoId = parsed.searchParams.get('v');
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`;
      const parts = parsed.pathname.split('/').filter(Boolean);
      if ((parts[0] === 'embed' || parts[0] === 'shorts') && parts[1]) {
        return `https://www.youtube-nocookie.com/embed/${parts[1]}`;
      }
    }

    if (host === 'youtu.be') {
      const videoId = parsed.pathname.replace(/^\//, '').split('/')[0];
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }

    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const parts = parsed.pathname.split('/').filter(Boolean);
      const id = parts[parts.length - 1];
      if (id && /^\d+$/.test(id)) {
        return `https://player.vimeo.com/video/${id}`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function isHtmlContent(input: string): boolean {
  if (!input) return false;
  const trimmed = input.trim();
  if (trimmed.startsWith('<') && (trimmed.endsWith('>') || trimmed.includes('</'))) return true;
  return /<\/(p|h1|h2|h3|h4|div|ul|ol|li|table|blockquote|figure|section|article|span|strong|em|u|s|mark)>/i.test(
    trimmed
  );
}

export default function EditorialContent({ content }: EditorialContentProps) {
  const isHtml = useMemo(() => isHtmlContent(content), [content]);

  const sanitizedHtml = useMemo(() => {
    if (!isHtml) return '';
    const clean = DOMPurify.sanitize(content, {
      ADD_TAGS: ['iframe', 'figure', 'figcaption', 'mark'],
      ADD_ATTR: [
        'target',
        'allow',
        'allowfullscreen',
        'frameborder',
        'scrolling',
        'referrerpolicy',
        'style',
        'class',
        'alt',
        'title',
        'src',
        'href',
      ],
    });

    // Resolve relative image URLs safely
    return clean.replace(/<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi, (match, p1, src, p2) => {
      const resolved = resolveEditorialImage(src);
      return `<img ${p1}src="${resolved}" ${p2}>`;
    });
  }, [content, isHtml]);

  if (isHtml) {
    return (
      <div
        className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-headings:font-semibold prose-headings:text-[#141413] prose-p:text-[#292825] prose-p:leading-[1.8] prose-a:text-[#1E3A5F] prose-th:text-[#141413] prose-td:text-[#292825] prose-img:rounded prose-img:my-6 prose-blockquote:bg-[#F4F1EA] prose-blockquote:border-y prose-blockquote:border-[#E5E0D8] prose-blockquote:font-serif prose-blockquote:not-italic prose-blockquote:py-4 prose-blockquote:px-6"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  return (
    <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-headings:font-semibold prose-headings:text-[#141413] prose-p:text-[#292825] prose-p:leading-[1.8] prose-a:text-[#1E3A5F] prose-th:text-[#141413] prose-td:text-[#292825]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img({ src, alt, title }) {
            const resolved = resolveEditorialImage(src || '');
            const caption = title || alt || '';
            return (
              <figure className="my-8">
                <div className="overflow-hidden rounded bg-[#EBE6DF]">
                  <img
                    src={resolved}
                    alt={alt || 'Editorial illustration'}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover m-0"
                  />
                </div>
                {caption && (
                  <figcaption className="text-xs font-serif italic text-[#5C5A55] mt-2 text-center">
                    {caption}
                  </figcaption>
                )}
              </figure>
            );
          },
          a({ href, children }) {
            const label = String(children ?? '').trim().toLowerCase();
            const embedUrl = href && (label === 'video' || label === 'embed') ? getVideoEmbedUrl(href) : null;
            if (embedUrl) {
              return (
                <div className="my-8 aspect-video w-full overflow-hidden rounded border border-[#E5E0D8] bg-[#141413]">
                  <iframe
                    src={embedUrl}
                    title="Embedded editorial video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );
            }
            const isExternal = Boolean(href && /^https?:\/\//i.test(href));
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-[#1E3A5F] underline underline-offset-2 hover:text-[#141413]"
              >
                {children}
              </a>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-8 px-6 py-5 bg-[#F4F1EA] border-y border-[#E5E0D8] not-italic font-serif text-lg text-[#141413] leading-relaxed">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="my-8 overflow-x-auto border border-[#E5E0D8] rounded bg-white">
                <table className="w-full text-left text-sm border-collapse m-0">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8]">{children}</thead>;
          },
          th({ children }) {
            return <th className="px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-[#5C5A55]">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-2.5 border-t border-[#E5E0D8] text-sm tabular-nums">{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

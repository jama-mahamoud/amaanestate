import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { resolveEditorialImage } from '../../lib/editorialImages';

interface EditorialMarkdownProps {
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

export default function EditorialMarkdown({ content }: EditorialMarkdownProps) {
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

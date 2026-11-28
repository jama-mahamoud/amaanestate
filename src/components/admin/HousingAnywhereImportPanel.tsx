import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Info,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { Property } from '../../types';
import {
  AuthorizedImpactLookupResponse,
  HousingAnywhereParseResult,
} from '../../lib/housingAnywhereImport';

interface HousingAnywhereImportPanelProps {
  htmlInput: string;
  onHtmlInputChange: (val: string) => void;
  onImport: () => void;
  onClear: () => void;
  importing: boolean;
  importError: string | null;
  parseResult: HousingAnywhereParseResult | null;
  apiLookup: AuthorizedImpactLookupResponse | null;
  duplicateMatch: Property | null;
  onOpenDuplicate?: (prop: Property) => void;
  onCopyUrl?: (url: string, label: string) => void;
}

export default function HousingAnywhereImportPanel({
  htmlInput,
  onHtmlInputChange,
  onImport,
  onClear,
  importing,
  importError,
  parseResult,
  apiLookup,
  duplicateMatch,
  onOpenDuplicate,
  onCopyUrl,
}: HousingAnywhereImportPanelProps) {
  return (
    <div className="bg-[#FAF8F5] border border-[#D6CEBE] rounded-md p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-[#E5E0D8] pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C4A27]">
              Partner Auto-Import
            </span>
            <span aria-hidden="true" className="text-[#9E988E]">
              &middot;
            </span>
            <span className="text-[11px] font-semibold text-[#1E3A5F]">
              Partner Listing (For Rent)
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-serif font-semibold text-[#141413]">
            Import Property from HousingAnywhere (Impact)
          </h3>
          <p className="text-xs text-[#5C5A55] leading-relaxed">
            Paste the complete HTML Creative copied from the HousingAnywhere Impact Marketplace. The parser safely extracts the SKU, exact Impact tracking link, original HousingAnywhere URL, location hints, and image URLs without executing HTML or scripts.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="ha-impact-html-input"
          className="block text-xs font-semibold text-[#4A4843]"
        >
          Impact HTML Creative Markup
        </label>
        <textarea
          id="ha-impact-html-input"
          rows={5}
          value={htmlInput}
          onChange={(e) => onHtmlInputChange(e.target.value)}
          placeholder='<a id="1538364" href="https://housinganywhere.pxf.io/c/..." target="_top"><img src="https://housinganywhere.imgix.net/..." border="0" alt=""/></a>'
          className="w-full p-3 bg-white border border-[#D6CEBE] rounded text-xs font-mono text-[#141413] leading-relaxed focus:outline-none focus:border-[#1E3A5F]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onImport}
          disabled={importing || !htmlInput.trim()}
          className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold rounded inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
        >
          {importing ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Parsing &amp; Checking Source...</span>
            </>
          ) : (
            <>
              <Download size={14} />
              <span>Parse Creative / Import Property</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={importing && !htmlInput}
          className="px-4 py-2.5 bg-white hover:bg-[#EFECE6] border border-[#D6CEBE] text-xs font-semibold text-[#4A4843] rounded inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
        >
          <RotateCcw size={13} />
          <span>Clear / Reset</span>
        </button>
      </div>

      {importError && (
        <div
          role="alert"
          className="bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] rounded p-3 text-xs flex items-start gap-2"
        >
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{importError}</span>
        </div>
      )}

      {duplicateMatch && (
        <div
          role="alert"
          className="bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] rounded p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        >
          <div className="flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>
              A HousingAnywhere listing with SKU{' '}
              <strong className="font-mono">{duplicateMatch.source_listing_id}</strong> already exists:{' '}
              <strong>{duplicateMatch.title}</strong> ({duplicateMatch.publication_status}).
            </span>
          </div>
          {onOpenDuplicate && (
            <button
              type="button"
              onClick={() => onOpenDuplicate(duplicateMatch)}
              className="px-3 py-1.5 bg-[#92400E] text-white rounded text-[11px] font-semibold cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              Open Existing Listing
            </button>
          )}
        </div>
      )}

      {parseResult && parseResult.success && (
        <div className="bg-white border border-[#E5E0D8] rounded p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0ECE1] pb-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#141413]">
              <CheckCircle2 size={15} className="text-[#16A34A]" />
              <span>Extracted Preview from Impact HTML Creative</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-[#5C5A55]">
              SKU: {parseResult.sku || 'Not detected'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {parseResult.images.length > 0 && (
              <div className="md:col-span-4 space-y-1.5">
                <div className="aspect-[4/3] bg-[#EBE6DF] rounded overflow-hidden border border-[#E5E0D8]">
                  <img
                    src={parseResult.images[0].image_url}
                    alt={parseResult.images[0].alt_text || 'Extracted property preview'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[11px] text-[#5C5A55] tabular-nums">
                  {parseResult.images.length} image{parseResult.images.length === 1 ? '' : 's'} extracted
                  {parseResult.images[0].alt_text
                    ? ` · Alt: "${parseResult.images[0].alt_text}"`
                    : ' · Alt text empty'}
                </p>
              </div>
            )}

            <div className={`${parseResult.images.length > 0 ? 'md:col-span-8' : 'md:col-span-12'} space-y-2.5 text-xs`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-[11px] text-[#7A7770] block">Country</span>
                  <span className="font-medium text-[#141413]">
                    {parseResult.country || 'Missing'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#7A7770] block">City</span>
                  <span className="font-medium text-[#141413]">
                    {parseResult.city || 'Missing'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#7A7770] block">Street / Location</span>
                  <span className="font-medium text-[#141413]">
                    {parseResult.addressLine || 'Not in URL'}
                  </span>
                </div>
              </div>

              {parseResult.impactTrackingUrl && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#7A7770]">
                      Exact Impact Tracking URL (preserved verbatim)
                    </span>
                    <div className="flex items-center gap-2">
                      {onCopyUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            onCopyUrl(parseResult.impactTrackingUrl!, 'Impact tracking URL')
                          }
                          className="text-[11px] font-semibold text-[#1E3A5F] hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Copy size={11} />
                          <span>Copy</span>
                        </button>
                      )}
                      <a
                        href={parseResult.impactTrackingUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="text-[11px] font-semibold text-[#1E3A5F] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Test Link</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                  <p className="font-mono text-[11px] text-[#4A4843] bg-[#FAF8F5] border border-[#E5E0D8] rounded p-2 break-all">
                    {parseResult.impactTrackingUrl}
                  </p>
                </div>
              )}

              {parseResult.originalListingUrl && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#7A7770]">
                      Decoded HousingAnywhere Destination URL (u parameter)
                    </span>
                    <a
                      href={parseResult.originalListingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-[#1E3A5F] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open Source</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                  <p className="font-mono text-[11px] text-[#4A4843] bg-[#FAF8F5] border border-[#E5E0D8] rounded p-2 break-all">
                    {parseResult.originalListingUrl}
                  </p>
                </div>
              )}

              {apiLookup && (
                <div
                  className={`rounded p-2.5 border text-[11px] flex items-start gap-2 ${
                    apiLookup.matched
                      ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                      : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#334155]'
                  }`}
                >
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">
                      {apiLookup.sourceName}:{' '}
                      {apiLookup.authorizedSourceAvailable
                        ? apiLookup.matched
                          ? 'Connected & Verified Match Found'
                          : 'Connected (No Matching Item)'
                        : 'Not Connected'}
                    </span>
                    {apiLookup.reason && <p className="mt-0.5 leading-relaxed">{apiLookup.reason}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

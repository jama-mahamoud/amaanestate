import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
} from 'lucide-react';
import { SavePropertyInput, isHousingAnywhereSource, isValidExternalPropertyUrl } from '../../services/propertyService';
import {
  FieldProvenanceMap,
  FieldProvenanceSource,
  TrackedPropertyField,
} from '../../lib/housingAnywhereImport';

interface PropertyEditorReviewPanelProps {
  form: SavePropertyInput;
  featuresCount: number;
  originalListingUrl: string | null;
  provenance: FieldProvenanceMap;
  reviewConfirmed: boolean;
  onReviewConfirmedChange: (checked: boolean) => void;
}

const TRACKED_FIELD_LABELS: Array<{ key: TrackedPropertyField; label: string }> = [
  { key: 'title', label: 'Property Title' },
  { key: 'source_listing_id', label: 'External Property ID / SKU' },
  { key: 'source_url', label: 'Impact Affiliate Tracking URL' },
  { key: 'original_listing_url', label: 'Original HousingAnywhere URL' },
  { key: 'transaction_type', label: 'Transaction Type (For Rent)' },
  { key: 'property_type', label: 'Property Type' },
  { key: 'price', label: 'Monthly Rent Price' },
  { key: 'currency', label: 'Currency' },
  { key: 'country', label: 'Country' },
  { key: 'city', label: 'City' },
  { key: 'address_line', label: 'Street Address' },
  { key: 'state_region', label: 'State / Region' },
  { key: 'bedrooms', label: 'Bedrooms' },
  { key: 'bathrooms', label: 'Bathrooms' },
  { key: 'area_value', label: 'Floor Area' },
  { key: 'description', label: 'Description' },
  { key: 'features', label: 'Features' },
  { key: 'images', label: 'Property Photos' },
];

export default function PropertyEditorReviewPanel({
  form,
  featuresCount,
  originalListingUrl,
  provenance,
  reviewConfirmed,
  onReviewConfirmedChange,
}: PropertyEditorReviewPanelProps) {
  const isAffiliate = isHousingAnywhereSource(form.source_name);

  const isFieldPopulated = (key: TrackedPropertyField): boolean => {
    switch (key) {
      case 'title':
        return Boolean(form.title.trim());
      case 'source_listing_id':
        return Boolean((form.source_listing_id || '').trim());
      case 'source_url':
        return Boolean((form.source_url || '').trim());
      case 'original_listing_url':
        return Boolean((originalListingUrl || '').trim());
      case 'transaction_type':
        return Boolean(form.transaction_type);
      case 'property_type':
        return Boolean(form.property_type) && provenance.property_type !== 'missing';
      case 'price':
        return form.price !== null && Number(form.price) > 0;
      case 'currency':
        return Boolean((form.currency || '').trim());
      case 'country':
        return Boolean(form.country.trim());
      case 'city':
        return Boolean(form.city.trim());
      case 'address_line':
        return Boolean((form.address_line || '').trim());
      case 'state_region':
        return Boolean((form.state_region || '').trim());
      case 'bedrooms':
        return form.bedrooms !== null && form.bedrooms !== undefined;
      case 'bathrooms':
        return form.bathrooms !== null && form.bathrooms !== undefined;
      case 'area_value':
        return form.area_value !== null && form.area_value !== undefined;
      case 'description':
        return Boolean(form.description.trim());
      case 'features':
        return featuresCount > 0;
      case 'images':
        return (form.images || []).length > 0;
      default:
        return false;
    }
  };

  const buckets: Record<FieldProvenanceSource, string[]> = {
    impact_html: [],
    authorized_api: [],
    manual: [],
    missing: [],
  };

  for (const item of TRACKED_FIELD_LABELS) {
    if (!isAffiliate && (item.key === 'source_url' || item.key === 'original_listing_url' || item.key === 'source_listing_id')) {
      continue;
    }
    const populated = isFieldPopulated(item.key);
    const recorded = provenance[item.key];
    if (!populated) {
      buckets.missing.push(item.label);
    } else if (recorded === 'impact_html') {
      buckets.impact_html.push(item.label);
    } else if (recorded === 'authorized_api') {
      buckets.authorized_api.push(item.label);
    } else {
      buckets.manual.push(item.label);
    }
  }

  const publishBlockers: string[] = [];
  if (!form.title.trim()) publishBlockers.push('Property Title is required.');
  if (!form.city.trim()) publishBlockers.push('City is required.');
  if (!form.country.trim()) publishBlockers.push('Country is required.');
  if (form.price === null || !(Number(form.price) > 0)) {
    publishBlockers.push('Verified price greater than 0 is required before publishing.');
  }
  if (isAffiliate) {
    if (!(form.source_url || '').trim()) {
      publishBlockers.push('Impact Affiliate Tracking URL is required before publishing.');
    } else if (!isValidExternalPropertyUrl(form.source_url)) {
      publishBlockers.push('Impact Affiliate Tracking URL must be a valid https:// or http:// URL.');
    }
  }

  const warnings: string[] = [];
  if (isAffiliate && !(form.source_listing_id || '').trim()) {
    warnings.push('External Property ID / SKU is empty.');
  }
  if ((form.images || []).length === 0) {
    warnings.push('No property photos attached yet.');
  } else if ((form.images || []).some((img) => !img.alt_text?.trim())) {
    warnings.push('One or more photos are missing descriptive alt text.');
  }
  if (!form.description.trim()) {
    warnings.push('Property description is empty.');
  }

  return (
    <div className="bg-[#FAF8F5] border border-[#D6CEBE] rounded-md p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E0D8] pb-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={17} className="text-[#1E3A5F]" />
          <h3 className="text-sm sm:text-base font-serif font-semibold text-[#141413]">
            Pre-Save Import &amp; Listing Review
          </h3>
        </div>
        <span className="text-xs font-medium text-[#5C5A55] tabular-nums">
          {(form.images || []).length} Photo{(form.images || []).length === 1 ? '' : 's'} &middot; Status:{' '}
          <strong className="capitalize text-[#141413]">{form.publication_status}</strong>
        </span>
      </div>

      {/* Key Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white border border-[#E5E0D8] rounded p-3 text-xs">
        <div>
          <span className="text-[11px] text-[#7A7770] block">Listing Title</span>
          <span className="font-semibold text-[#141413] break-words">
            {form.title.trim() || 'Missing — required to save'}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-[#7A7770] block">
            {isAffiliate ? 'External SKU / Source' : 'Listing Source'}
          </span>
          <span className="font-mono text-[#141413]">
            {isAffiliate
              ? `SKU ${form.source_listing_id?.trim() || 'Missing'} · Partner Listing`
              : form.source_name || 'manual'}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-[#7A7770] block">Price &amp; Location</span>
          <span className="font-mono tabular-nums text-[#141413]">
            {form.price !== null && Number(form.price) > 0
              ? `${form.currency || 'USD'} ${Number(form.price).toLocaleString()}`
              : 'Unverified / Blank'}
            {form.city || form.country
              ? ` · ${[form.city, form.country].filter(Boolean).join(', ')}`
              : ''}
          </span>
        </div>
      </div>

      {isAffiliate && form.source_url?.trim() && (
        <div className="bg-white border border-[#E5E0D8] rounded p-3 text-xs space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-[#4A4843]">
              Active Impact Affiliate Tracking URL
            </span>
            {isValidExternalPropertyUrl(form.source_url) && (
              <a
                href={form.source_url.trim()}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-[11px] font-semibold text-[#1E3A5F] hover:underline inline-flex items-center gap-1"
              >
                <span>Open Link</span>
                <ExternalLink size={11} />
              </a>
            )}
          </div>
          <p className="font-mono text-[11px] text-[#5C5A55] break-all">{form.source_url.trim()}</p>
        </div>
      )}

      {/* Provenance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="bg-white border border-[#E5E0D8] rounded p-3 space-y-1.5">
          <div className="font-semibold text-[#1E3A5F]">Imported from Impact HTML</div>
          {buckets.impact_html.length > 0 ? (
            <p className="text-[#4A4843] leading-relaxed">{buckets.impact_html.join(' · ')}</p>
          ) : (
            <p className="text-[#7A7770]">No fields from Impact HTML creative.</p>
          )}
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded p-3 space-y-1.5">
          <div className="font-semibold text-[#166534]">Retrieved from Authorized Source</div>
          {buckets.authorized_api.length > 0 ? (
            <p className="text-[#4A4843] leading-relaxed">{buckets.authorized_api.join(' · ')}</p>
          ) : (
            <p className="text-[#7A7770]">
              None — no verified fields returned by an authorized catalog/API.
            </p>
          )}
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded p-3 space-y-1.5">
          <div className="font-semibold text-[#141413]">Manually Entered / Edited</div>
          {buckets.manual.length > 0 ? (
            <p className="text-[#4A4843] leading-relaxed">{buckets.manual.join(' · ')}</p>
          ) : (
            <p className="text-[#7A7770]">No manual edits yet.</p>
          )}
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded p-3 space-y-1.5">
          <div className="font-semibold text-[#8C4A27]">Missing / Unverified</div>
          {buckets.missing.length > 0 ? (
            <p className="text-[#4A4843] leading-relaxed">{buckets.missing.join(' · ')}</p>
          ) : (
            <p className="text-[#166534]">All tracked property fields populated.</p>
          )}
        </div>
      </div>

      {/* Validation & Publishing Readiness */}
      {(publishBlockers.length > 0 || warnings.length > 0) ? (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded p-3 text-xs text-[#92400E] space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle size={14} className="shrink-0" />
            <span>Validation &amp; Publishing Notes</span>
          </div>
          {publishBlockers.length > 0 && (
            <ul className="list-disc pl-5 space-y-0.5">
              {publishBlockers.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}
          {warnings.length > 0 && (
            <ul className="list-disc pl-5 space-y-0.5 text-[#78350F]">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded p-3 text-xs text-[#166534] flex items-center gap-2">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>All mandatory publishing fields and tracking URL checks are satisfied.</span>
        </div>
      )}

      {isAffiliate && (
        <label className="flex items-start gap-2.5 pt-1 cursor-pointer text-xs text-[#141413]">
          <input
            type="checkbox"
            checked={reviewConfirmed}
            onChange={(e) => onReviewConfirmedChange(e.target.checked)}
            className="w-4 h-4 mt-0.5 shrink-0"
          />
          <span className="leading-relaxed">
            <strong>Confirm Review:</strong> I have reviewed the extracted Impact creative fields, verified the exact Impact tracking URL, and confirmed any missing or manually entered details before saving.
          </span>
        </label>
      )}
    </div>
  );
}

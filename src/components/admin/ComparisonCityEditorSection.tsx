import React, { useEffect, useState } from 'react';
import { Globe2, ImageOff, Link2, X } from 'lucide-react';
import 'flag-icons/css/flag-icons.min.css';
import { ComparisonCitySlot, MarketTrendDirection } from '../../types';
import { normalizeCountryInfo } from '../../lib/countries';
import { isValidHttpsUrl } from '../../lib/globalMarkets';
import { SaveComparisonCityInput } from '../../services/globalMarketsService';

interface ComparisonCityEditorSectionProps {
  slot: ComparisonCitySlot;
  city: SaveComparisonCityInput;
  onChange: (updater: (prev: SaveComparisonCityInput) => SaveComparisonCityInput) => void;
}

export default function ComparisonCityEditorSection({
  slot,
  city,
  onChange,
}: ComparisonCityEditorSectionProps) {
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const imageUrlTrimmed = (city.image_url || '').trim();
  const hasValidImageUrl = Boolean(imageUrlTrimmed) && isValidHttpsUrl(imageUrlTrimmed);

  useEffect(() => {
    setImagePreviewError(false);
  }, [imageUrlTrimmed]);

  const cleanIso = (city.country_code || '').trim().toLowerCase();
  const hasIsoFlag = /^[a-z]{2}$/.test(cleanIso);
  const idPrefix = `comp-city-${slot.toLowerCase()}`;
  const slotHeading = slot === 'A' ? 'City A' : 'City B';

  return (
    <section
      aria-labelledby={`${idPrefix}-heading`}
      className="border border-[#E5E0D8] rounded bg-[#FAF8F5]/60 p-4 sm:p-5 space-y-5 min-w-0"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E0D8] pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#1E3A5F] text-white text-xs font-bold shrink-0">
            {slot}
          </span>
          <h3
            id={`${idPrefix}-heading`}
            className="text-xs uppercase tracking-widest font-semibold text-[#141413]"
          >
            {slot === 'A' ? '2. City A — Primary Comparison Market' : '3. City B — Benchmark Comparison Market'}
          </h3>
        </div>
        {city.city_name.trim() && (
          <span className="text-xs font-serif font-semibold text-[#1E3A5F] truncate">
            {city.city_name.trim()}
            {city.country_name.trim() ? `, ${city.country_name.trim()}` : ''}
          </span>
        )}
      </div>

      {/* Identity & Country */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor={`${idPrefix}-city-name`}
            className="block text-xs font-semibold text-[#4A4843] mb-1"
          >
            City Name *
          </label>
          <input
            id={`${idPrefix}-city-name`}
            type="text"
            required
            value={city.city_name}
            onChange={(e) => {
              const val = e.target.value;
              onChange((prev) => ({ ...prev, city_name: val }));
            }}
            placeholder={slot === 'A' ? 'e.g., Dubai' : 'e.g., London'}
            className="w-full h-10 px-3 bg-white border border-[#D6CEBE] rounded text-sm text-[#141413]"
          />
        </div>

        <div>
          <label
            htmlFor={`${idPrefix}-country-name`}
            className="block text-xs font-semibold text-[#4A4843] mb-1"
          >
            Country Name *
          </label>
          <input
            id={`${idPrefix}-country-name`}
            type="text"
            required
            value={city.country_name}
            onChange={(e) => {
              const val = e.target.value;
              const info = normalizeCountryInfo(val);
              onChange((prev) => ({
                ...prev,
                country_name: val,
                country_code: info?.code || prev.country_code || '',
              }));
            }}
            placeholder={slot === 'A' ? 'e.g., United Arab Emirates' : 'e.g., United Kingdom'}
            className="w-full h-10 px-3 bg-white border border-[#D6CEBE] rounded text-sm text-[#141413]"
          />
        </div>

        <div>
          <label
            htmlFor={`${idPrefix}-country-code`}
            className="block text-xs font-semibold text-[#4A4843] mb-1"
          >
            Country ISO Code
          </label>
          <div className="flex items-center gap-2">
            <div className="h-10 w-12 border border-[#D6CEBE] rounded bg-white flex items-center justify-center shrink-0">
              {hasIsoFlag ? (
                <span
                  className={`fi fi-${cleanIso} w-6 h-[18px] rounded-[2px] ring-1 ring-black/10`}
                />
              ) : (
                <Globe2 size={16} className="text-[#8C4A27]" />
              )}
            </div>
            <input
              id={`${idPrefix}-country-code`}
              type="text"
              maxLength={2}
              value={city.country_code || ''}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                onChange((prev) => ({ ...prev, country_code: val }));
              }}
              placeholder={slot === 'A' ? 'AE' : 'GB'}
              className="w-full h-10 px-3 bg-white border border-[#D6CEBE] rounded text-sm font-mono uppercase"
            />
          </div>
        </div>
      </div>

      {/* City Visual (URL Input Only — No Upload / Media Library) */}
      <div className="border border-[#E5E0D8] rounded bg-white p-3.5 sm:p-4 space-y-3 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[#141413]">
            {slotHeading} Image (Public HTTPS URL Only)
          </p>
          <span className="text-[11px] text-[#7A7770]">
            Optional · External HTTPS image link only
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3.5 items-start min-w-0">
          {imageUrlTrimmed ? (
            hasValidImageUrl && !imagePreviewError ? (
              <div className="w-full sm:w-44 aspect-[16/10] rounded border border-[#D6CEBE] overflow-hidden bg-[#FAF8F5] shrink-0">
                <img
                  src={imageUrlTrimmed}
                  alt={city.image_alt || `${city.city_name || slotHeading} preview`}
                  onError={() => setImagePreviewError(true)}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full sm:w-44 aspect-[16/10] rounded border border-dashed border-[#D97706] bg-[#FFFBEB] flex flex-col items-center justify-center text-center p-2 text-[11px] text-[#92400E] shrink-0">
                <ImageOff size={16} className="mb-1 opacity-80" />
                <span>
                  {!hasValidImageUrl
                    ? 'Enter a valid public https:// URL'
                    : 'Preview could not load from URL'}
                </span>
              </div>
            )
          ) : (
            <div className="w-full sm:w-44 aspect-[16/10] rounded border border-dashed border-[#D6CEBE] bg-[#FAF8F5] flex flex-col items-center justify-center text-center p-2 text-[11px] text-[#7A7770] shrink-0">
              <Link2 size={15} className="mb-1 opacity-70" />
              <span>Optional {slotHeading} photo</span>
            </div>
          )}

          <div className="flex-1 w-full space-y-2.5 min-w-0">
            <div>
              <label
                htmlFor={`${idPrefix}-image-url`}
                className="block text-[11px] font-semibold text-[#4A4843] mb-1"
              >
                City Image URL
              </label>
              <div className="flex items-center gap-2 min-w-0">
                <input
                  id={`${idPrefix}-image-url`}
                  type="url"
                  value={city.image_url || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setImagePreviewError(false);
                    onChange((prev) => ({ ...prev, image_url: val }));
                  }}
                  placeholder={`https://example.com/images/${slot === 'A' ? 'dubai' : 'london'}-skyline.jpg`}
                  className="flex-1 min-w-0 h-9 px-3 bg-white border border-[#D6CEBE] rounded text-xs font-mono"
                />
                {Boolean(city.image_url && city.image_url.length > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreviewError(false);
                      onChange((prev) => ({ ...prev, image_url: '', image_alt: '' }));
                    }}
                    className="h-9 px-2.5 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D6CEBE] text-[#991B1B] text-xs font-semibold rounded inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <X size={13} />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor={`${idPrefix}-image-alt`}
                className="block text-[11px] font-semibold text-[#4A4843] mb-1"
              >
                Image Alt Text
              </label>
              <input
                id={`${idPrefix}-image-alt`}
                type="text"
                value={city.image_alt || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange((prev) => ({ ...prev, image_alt: val }));
                }}
                placeholder={`Descriptive alt text for ${city.city_name.trim() || slotHeading} photo`}
                className="w-full h-9 px-3 bg-white border border-[#D6CEBE] rounded text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Verified Metrics & Independent Currency */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[#141413]">
            {slotHeading} Quantitative Indicators (Original Local or Reporting Currency)
          </p>
          <span className="text-[11px] text-[#7A7770]">
            Leave blank if data is unavailable
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label
              htmlFor={`${idPrefix}-sale-price`}
              className="block text-xs font-semibold text-[#4A4843] mb-1"
            >
              Average Property Sale Price
            </label>
            <input
              id={`${idPrefix}-sale-price`}
              type="number"
              min={0}
              step="any"
              value={city.avg_sale_price ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                onChange((prev) => ({
                  ...prev,
                  avg_sale_price: val === '' ? null : val,
                }));
              }}
              placeholder="Optional numeric value"
              className="w-full h-10 px-3 bg-white border border-[#D6CEBE] rounded text-sm font-mono"
            />
          </div>

          <div>
            <label
              htmlFor={`${idPrefix}-monthly-rent`}
              className="block text-xs font-semibold text-[#4A4843] mb-1"
            >
              Average Monthly Rent
            </label>
            <input
              id={`${idPrefix}-monthly-rent`}
              type="number"
              min={0}
              step="any"
              value={city.avg_monthly_rent ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                onChange((prev) => ({
                  ...prev,
                  avg_monthly_rent: val === '' ? null : val,
                }));
              }}
              placeholder="Optional numeric value"
              className="w-full h-10 px-3 bg-white border border-[#D6CEBE] rounded text-sm font-mono"
            />
          </div>

          <div>
            <label
              htmlFor={`${idPrefix}-currency`}
              className="block text-xs font-semibold text-[#4A4843] mb-1"
            >
              Currency ISO Code *
            </label>
            <input
              id={`${idPrefix}-currency`}
              type="text"
              required
              maxLength={8}
              value={city.currency}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                onChange((prev) => ({ ...prev, currency: val }));
              }}
              placeholder={slot === 'A' ? 'AED' : 'GBP'}
              className="w-full h-10 px-3 bg-white border border-[#D6CEBE] rounded text-sm font-mono uppercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-3 bg-white border border-[#E5E0D8] rounded space-y-2 min-w-0">
            <label
              htmlFor={`${idPrefix}-price-trend-pct`}
              className="block text-xs font-semibold text-[#141413]"
            >
              Property Price Trend (% &amp; Direction)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                id={`${idPrefix}-price-trend-pct`}
                type="number"
                step="0.1"
                value={city.property_price_trend_pct ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const num = Number(val);
                  onChange((prev) => ({
                    ...prev,
                    property_price_trend_pct: val === '' ? null : val,
                    property_price_trend_dir:
                      val === ''
                        ? prev.property_price_trend_dir
                        : num > 0
                        ? 'up'
                        : num < 0
                        ? 'down'
                        : 'flat',
                  }));
                }}
                placeholder="e.g., 6.4"
                className="w-full min-w-0 h-9 px-3 bg-white border border-[#D6CEBE] rounded text-sm font-mono"
              />
              <select
                aria-label={`${slotHeading} Property Price Trend Direction`}
                value={city.property_price_trend_dir || ''}
                onChange={(e) => {
                  const dir = (e.target.value as MarketTrendDirection) || null;
                  onChange((prev) => ({ ...prev, property_price_trend_dir: dir }));
                }}
                className="w-full min-w-0 h-9 px-2.5 bg-white border border-[#D6CEBE] rounded text-xs"
              >
                <option value="">Direction (Auto / None)</option>
                <option value="up">Upward (+)</option>
                <option value="down">Downward (-)</option>
                <option value="flat">Stable / Flat</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-white border border-[#E5E0D8] rounded space-y-2 min-w-0">
            <label
              htmlFor={`${idPrefix}-rent-trend-pct`}
              className="block text-xs font-semibold text-[#141413]"
            >
              Rental Price Trend (% &amp; Direction)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                id={`${idPrefix}-rent-trend-pct`}
                type="number"
                step="0.1"
                value={city.rental_price_trend_pct ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const num = Number(val);
                  onChange((prev) => ({
                    ...prev,
                    rental_price_trend_pct: val === '' ? null : val,
                    rental_price_trend_dir:
                      val === ''
                        ? prev.rental_price_trend_dir
                        : num > 0
                        ? 'up'
                        : num < 0
                        ? 'down'
                        : 'flat',
                  }));
                }}
                placeholder="e.g., 8.1"
                className="w-full min-w-0 h-9 px-3 bg-white border border-[#D6CEBE] rounded text-sm font-mono"
              />
              <select
                aria-label={`${slotHeading} Rental Price Trend Direction`}
                value={city.rental_price_trend_dir || ''}
                onChange={(e) => {
                  const dir = (e.target.value as MarketTrendDirection) || null;
                  onChange((prev) => ({ ...prev, rental_price_trend_dir: dir }));
                }}
                className="w-full min-w-0 h-9 px-2.5 bg-white border border-[#D6CEBE] rounded text-xs"
              >
                <option value="">Direction (Auto / None)</option>
                <option value="up">Upward (+)</option>
                <option value="down">Downward (-)</option>
                <option value="flat">Stable / Flat</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Data Attribution */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <label
            htmlFor={`${idPrefix}-source-name`}
            className="block text-xs font-semibold text-[#4A4843] mb-1"
          >
            Data Source Name
          </label>
          <input
            id={`${idPrefix}-source-name`}
            type="text"
            value={city.data_source_name}
            onChange={(e) => {
              const val = e.target.value;
              onChange((prev) => ({ ...prev, data_source_name: val }));
            }}
            placeholder={slot === 'A' ? 'e.g., Dubai Land Department' : 'e.g., UK Land Registry'}
            className="w-full h-10 px-3 bg-white border border-[#D6CEBE] rounded text-sm"
          />
        </div>

        <div>
          <label
            htmlFor={`${idPrefix}-source-url`}
            className="block text-xs font-semibold text-[#4A4843] mb-1"
          >
            Data Source URL
          </label>
          <input
            id={`${idPrefix}-source-url`}
            type="url"
            value={city.data_source_url || ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange((prev) => ({ ...prev, data_source_url: val }));
            }}
            placeholder="https://..."
            className="w-full h-10 px-3 bg-white border border-[#D6CEBE] rounded text-xs font-mono"
          />
        </div>

        <div>
          <label
            htmlFor={`${idPrefix}-data-period`}
            className="block text-xs font-semibold text-[#4A4843] mb-1"
          >
            Data Period
          </label>
          <input
            id={`${idPrefix}-data-period`}
            type="text"
            value={city.data_period}
            onChange={(e) => {
              const val = e.target.value;
              onChange((prev) => ({ ...prev, data_period: val }));
            }}
            placeholder="e.g., Q3 2026"
            className="w-full h-10 px-3 bg-white border border-[#D6CEBE] rounded text-sm"
          />
        </div>
      </div>

      {/* Editorial Narrative */}
      <div className="space-y-3.5">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <label
              htmlFor={`${idPrefix}-overview`}
              className="block text-xs font-semibold text-[#4A4843]"
            >
              Market Overview
            </label>
            <span className="text-[11px] font-mono tabular-nums text-[#7A7770]">
              {city.market_overview.length.toLocaleString()} chars
            </span>
          </div>
          <textarea
            id={`${idPrefix}-overview`}
            rows={4}
            wrap="soft"
            value={city.market_overview}
            onChange={(e) => {
              const val = e.target.value;
              onChange((prev) => ({ ...prev, market_overview: val }));
            }}
            placeholder={`Executive summary of ${slotHeading} residential fundamentals and supply-demand balance...`}
            className="block w-full min-w-0 p-3 bg-white border border-[#D6CEBE] rounded text-sm text-[#141413] leading-[1.6] resize-y focus:outline-none focus:border-[#1E3A5F]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <label
              htmlFor={`${idPrefix}-analysis`}
              className="block text-xs font-semibold text-[#4A4843]"
            >
              Market Analysis
            </label>
            <span className="text-[11px] font-mono tabular-nums text-[#7A7770]">
              {city.market_analysis.length.toLocaleString()} chars
            </span>
          </div>
          <textarea
            id={`${idPrefix}-analysis`}
            rows={5}
            wrap="soft"
            value={city.market_analysis}
            onChange={(e) => {
              const val = e.target.value;
              onChange((prev) => ({ ...prev, market_analysis: val }));
            }}
            placeholder={`Detailed analysis of ${slotHeading} buyer demand, rental pricing, prime districts, and policy factors...`}
            className="block w-full min-w-0 p-3 bg-white border border-[#D6CEBE] rounded text-sm text-[#141413] leading-[1.6] resize-y focus:outline-none focus:border-[#1E3A5F]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <label
              htmlFor={`${idPrefix}-insights`}
              className="block text-xs font-semibold text-[#4A4843]"
            >
              Investment Insights
            </label>
            <span className="text-[11px] font-mono tabular-nums text-[#7A7770]">
              {city.investment_insights.length.toLocaleString()} chars
            </span>
          </div>
          <textarea
            id={`${idPrefix}-insights`}
            rows={4}
            wrap="soft"
            value={city.investment_insights}
            onChange={(e) => {
              const val = e.target.value;
              onChange((prev) => ({ ...prev, investment_insights: val }));
            }}
            placeholder={`Key takeaways, risks, and structural liquidity context for ${slotHeading}...`}
            className="block w-full min-w-0 p-3 bg-white border border-[#D6CEBE] rounded text-sm text-[#141413] leading-[1.6] resize-y focus:outline-none focus:border-[#1E3A5F]"
          />
        </div>
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import {
  Building2,
  Edit3,
  ExternalLink,
  ImagePlus,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import {
  AreaUnit,
  ListingStatus,
  Property,
  PropertyType,
  PublicationStatus,
  RentalPeriod,
  TransactionType,
} from '../../types';
import {
  SavePropertyInput,
  deleteProperty,
  formatListingStatusLabel,
  formatPropertyLocation,
  formatPropertyPrice,
  formatPropertyTypeLabel,
  saveProperty,
  slugifyPropertyTitle,
  uploadPropertyImage,
} from '../../services/propertyService';
import { toast } from 'sonner';

interface AdminPropertiesSectionProps {
  properties: Property[];
  schemaPending: boolean;
  onRefresh: () => Promise<void>;
}

const EMPTY_FORM: SavePropertyInput = {
  title: '',
  slug: '',
  transaction_type: 'sale',
  property_type: 'house',
  listing_status: 'available',
  publication_status: 'draft',
  price: 0,
  currency: 'USD',
  rental_period: 'month',
  available_from: '',
  bedrooms: null,
  bathrooms: null,
  area_value: null,
  area_unit: 'sqft',
  address_line: '',
  city: '',
  state_region: '',
  country: '',
  postal_code: '',
  description: '',
  features: [],
  is_featured: false,
  agent_name: '',
  agent_email: '',
  agent_phone: '',
  brokerage_name: '',
  source_name: 'manual',
  source_listing_id: '',
  source_url: '',
  images: [],
};

export default function AdminPropertiesSection({
  properties,
  schemaPending,
  onRefresh,
}: AdminPropertiesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [txFilter, setTxFilter] = useState<'all' | 'sale' | 'rent'>('all');
  const [pubFilter, setPubFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');

  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<SavePropertyInput>(EMPTY_FORM);
  const [featuresText, setFeaturesText] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  if (schemaPending) {
    return (
      <div className="bg-white border border-[#E5E0D8] rounded p-8 space-y-4">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
          Database Migration Required
        </p>
        <h2 className="text-xl font-serif font-semibold text-[#141413]">
          Property Marketplace Tables Not Found
        </h2>
        <p className="text-sm text-[#4A4843] max-w-2xl leading-relaxed">
          Run the SQL migration file <code className="font-mono bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E5E0D8]">supabase/migrations/20261111143000_create_property_marketplace.sql</code> in your Supabase Dashboard SQL Editor to enable property listings, storage, and enquiry management.
        </p>
        <p className="text-xs text-[#5C5A55]">
          See <code className="font-mono">docs/PROPERTY_MARKETPLACE_SETUP.md</code> for verification queries.
        </p>
      </div>
    );
  }

  const filtered = properties.filter((prop) => {
    if (txFilter !== 'all' && prop.transaction_type !== txFilter) return false;
    if (pubFilter !== 'all' && prop.publication_status !== pubFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        prop.title.toLowerCase().includes(q) ||
        prop.city.toLowerCase().includes(q) ||
        prop.country.toLowerCase().includes(q) ||
        (prop.source_listing_id || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openCreateModal = () => {
    setForm({ ...EMPTY_FORM, images: [] });
    setFeaturesText('');
    setNewImageUrl('');
    setEditorOpen(true);
  };

  const openEditModal = (prop: Property) => {
    setForm({
      id: prop.id,
      title: prop.title,
      slug: prop.slug,
      transaction_type: prop.transaction_type,
      property_type: prop.property_type,
      listing_status: prop.listing_status,
      publication_status: prop.publication_status,
      price: prop.price,
      currency: prop.currency || 'USD',
      rental_period: prop.rental_period || 'month',
      available_from: prop.available_from || '',
      bedrooms: prop.bedrooms ?? null,
      bathrooms: prop.bathrooms ?? null,
      area_value: prop.area_value ?? null,
      area_unit: prop.area_unit || 'sqft',
      address_line: prop.address_line || '',
      city: prop.city,
      state_region: prop.state_region || '',
      country: prop.country,
      postal_code: prop.postal_code || '',
      description: prop.description || '',
      features: prop.features || [],
      is_featured: prop.is_featured,
      agent_name: prop.agent_name || '',
      agent_email: prop.agent_email || '',
      agent_phone: prop.agent_phone || '',
      brokerage_name: prop.brokerage_name || '',
      source_name: prop.source_name || 'manual',
      source_listing_id: prop.source_listing_id || '',
      source_url: prop.source_url || '',
      images: (prop.images || []).map((img, idx) => ({
        image_url: img.image_url,
        alt_text: img.alt_text || '',
        is_primary: img.is_primary,
        display_order: idx,
      })),
    });
    setFeaturesText((prop.features || []).join('\n'));
    setNewImageUrl('');
    setEditorOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const res = await uploadPropertyImage(file);
    setUploadingImage(false);
    e.target.value = '';

    if (!res.success || !res.url) {
      toast.error(res.error || 'Image upload failed.');
      return;
    }

    setForm((prev) => {
      const existing = prev.images || [];
      return {
        ...prev,
        images: [
          ...existing,
          {
            image_url: res.url!,
            alt_text: prev.title || file.name,
            is_primary: existing.length === 0,
            display_order: existing.length,
          },
        ],
      };
    });
    toast.success('Image uploaded to property-media.');
  };

  const handleAddImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    setForm((prev) => {
      const existing = prev.images || [];
      return {
        ...prev,
        images: [
          ...existing,
          {
            image_url: url,
            alt_text: prev.title || 'Property photograph',
            is_primary: existing.length === 0,
            display_order: existing.length,
          },
        ],
      };
    });
    setNewImageUrl('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.city.trim() || !form.country.trim()) {
      toast.error('Title, City, and Country are required.');
      return;
    }

    const parsedFeatures = featuresText
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);

    setSaving(true);
    const result = await saveProperty({
      ...form,
      slug: form.slug.trim() || slugifyPropertyTitle(form.title),
      features: parsedFeatures,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error || 'Unable to save property listing.');
      return;
    }

    toast.success(form.id ? 'Property listing updated.' : 'Property listing created.');
    setEditorOpen(false);
    await onRefresh();
  };

  const handleDelete = async (prop: Property) => {
    const res = await deleteProperty(prop.id);
    if (!res.success) {
      toast.error(res.error || 'Unable to delete property.');
      return;
    }
    toast.success(`Deleted "${prop.title}".`);
    await onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E0D8] rounded p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
            Property Marketplace CMS
          </p>
          <h1 className="text-2xl font-serif font-semibold text-[#141413]">
            Manage Property Listings ({properties.length})
          </h1>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold rounded inline-flex items-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Property Listing</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E5E0D8] rounded p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7770]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, city, country, or listing ID..."
            className="w-full h-10 pl-9 pr-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
          />
        </div>
        <select
          value={txFilter}
          onChange={(e) => setTxFilter(e.target.value as 'all' | 'sale' | 'rent')}
          className="h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
        >
          <option value="all">All Transactions</option>
          <option value="sale">For Sale (Buy)</option>
          <option value="rent">For Rent</option>
        </select>
        <select
          value={pubFilter}
          onChange={(e) =>
            setPubFilter(e.target.value as 'all' | 'draft' | 'published' | 'archived')
          }
          className="h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
        >
          <option value="all">All Publication Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Building2 size={28} className="mx-auto text-[#8C4A27]" strokeWidth={1.5} />
            <p className="text-sm text-[#5C5A55]">
              {properties.length === 0
                ? 'No properties stored in Supabase yet.'
                : 'No properties match your active admin filters.'}
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer"
            >
              Add First Property
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[11px] uppercase tracking-wider text-[#5C5A55]">
                  <th className="py-3 px-4 font-semibold">Property</th>
                  <th className="py-3 px-4 font-semibold">Mode / Type</th>
                  <th className="py-3 px-4 font-semibold">Price</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Source</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8]">
                {filtered.map((prop) => (
                  <tr key={prop.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-[#141413] flex items-center gap-1.5">
                        {prop.is_featured && (
                          <Star size={13} className="text-[#8C4A27] fill-[#8C4A27] shrink-0" />
                        )}
                        <span className="truncate">{prop.title}</span>
                      </div>
                      <div className="text-xs text-[#5C5A55] truncate">
                        {formatPropertyLocation(prop)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#4A4843]">
                      <div className="font-semibold uppercase text-[#8C4A27]">
                        {prop.transaction_type === 'rent' ? 'Rent' : 'Buy / Sale'}
                      </div>
                      <div>{formatPropertyTypeLabel(prop.property_type)}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-[#141413]">
                      {formatPropertyPrice(
                        prop.price,
                        prop.currency,
                        prop.transaction_type,
                        prop.rental_period
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-semibold capitalize text-[#141413]">
                        {prop.publication_status}
                      </div>
                      <div className="text-[#5C5A55]">
                        {formatListingStatusLabel(prop.listing_status)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-[#5C5A55]">
                      {prop.source_name === 'showcase_sample' || prop.is_sample ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Showcase Sample
                        </span>
                      ) : (
                        prop.source_name
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {prop.publication_status === 'published' && (
                          <a
                            href={`/properties/${encodeURIComponent(prop.slug)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#5C5A55] hover:text-[#1E3A5F]"
                            title="View public listing"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditModal(prop)}
                          className="p-1.5 text-[#1E3A5F] hover:text-[#141413] cursor-pointer"
                          title="Edit listing"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(prop)}
                          className="p-1.5 text-[#991B1B] hover:text-[#7F1D1D] cursor-pointer"
                          title="Delete listing"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Property Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E5E0D8] rounded w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
                  Property Editor
                </p>
                <h2 className="text-xl font-serif font-semibold text-[#141413]">
                  {form.id ? 'Edit Property Listing' : 'Create Property Listing'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="p-2 text-[#5C5A55] hover:text-[#141413] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                        slug: prev.id ? prev.slug : slugifyPropertyTitle(e.target.value),
                      }))
                    }
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                    Transaction Type *
                  </label>
                  <select
                    value={form.transaction_type}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        transaction_type: e.target.value as TransactionType,
                      }))
                    }
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                  >
                    <option value="sale">For Sale (Buy)</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                    Property Type
                  </label>
                  <select
                    value={form.property_type}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        property_type: e.target.value as PropertyType,
                      }))
                    }
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                  >
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="condominium">Condominium</option>
                    <option value="land">Land</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                    Listing Status
                  </label>
                  <select
                    value={form.listing_status}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        listing_status: e.target.value as ListingStatus,
                      }))
                    }
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                  >
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="under_contract">Under Contract</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                    <option value="off_market">Off Market</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                    Publication Status
                  </label>
                  <select
                    value={form.publication_status}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        publication_status: e.target.value as PublicationStatus,
                      }))
                    }
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    id="prop-featured"
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, is_featured: e.target.checked }))
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="prop-featured" className="text-xs font-semibold text-[#141413]">
                    Featured on Homepage
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">Price *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, price: Number(e.target.value) || 0 }))
                    }
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">Currency</label>
                  <input
                    type="text"
                    maxLength={8}
                    value={form.currency}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))
                    }
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono"
                  />
                </div>

                {form.transaction_type === 'rent' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                        Rental Period
                      </label>
                      <select
                        value={form.rental_period || 'month'}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            rental_period: e.target.value as RentalPeriod,
                          }))
                        }
                        className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                      >
                        <option value="month">Monthly</option>
                        <option value="year">Yearly</option>
                        <option value="week">Weekly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                        Available From
                      </label>
                      <input
                        type="date"
                        value={form.available_from || ''}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, available_from: e.target.value }))
                        }
                        className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.country}
                    onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                    State / Region
                  </label>
                  <input
                    type="text"
                    value={form.state_region || ''}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, state_region: e.target.value }))
                    }
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={form.address_line || ''}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, address_line: e.target.value }))
                    }
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.bedrooms ?? ''}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          bedrooms: e.target.value === '' ? null : Number(e.target.value),
                        }))
                      }
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      value={form.bathrooms ?? ''}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          bathrooms: e.target.value === '' ? null : Number(e.target.value),
                        }))
                      }
                      className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                        Area
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={form.area_value ?? ''}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            area_value: e.target.value === '' ? null : Number(e.target.value),
                          }))
                        }
                        className="w-full h-10 px-2 border border-[#D6CEBE] rounded text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                        Unit
                      </label>
                      <select
                        value={form.area_unit}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            area_unit: e.target.value as AreaUnit,
                          }))
                        }
                        className="w-full h-10 px-2 border border-[#D6CEBE] rounded text-xs"
                      >
                        <option value="sqft">sqft</option>
                        <option value="sqm">sqm</option>
                        <option value="acres">acres</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-[#D6CEBE] rounded text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                    Features (one per line or comma-separated)
                  </label>
                  <textarea
                    rows={2}
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    placeholder="Private courtyard, Radiant floor heating, Double-glazed timber windows"
                    className="w-full p-3 border border-[#D6CEBE] rounded text-sm"
                  />
                </div>

                {/* Representative & Source Metadata */}
                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={form.agent_name || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, agent_name: e.target.value }))}
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                    Brokerage Name
                  </label>
                  <input
                    type="text"
                    value={form.brokerage_name || ''}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, brokerage_name: e.target.value }))
                    }
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                    Agent Phone
                  </label>
                  <input
                    type="text"
                    value={form.agent_phone || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, agent_phone: e.target.value }))}
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A4843] mb-1">
                    Listing Classification &amp; Source
                  </label>
                  <select
                    value={form.source_name || 'manual'}
                    onChange={(e) => setForm((prev) => ({ ...prev, source_name: e.target.value }))}
                    className="w-full h-10 px-3 border border-[#D6CEBE] rounded text-sm bg-white"
                  >
                    <option value="manual">Manual (Active Genuine Inventory)</option>
                    <option value="showcase_sample">Showcase Sample (Illustrative Portfolio Example)</option>
                    <option value="listhub">ListHub MLS Feed</option>
                    <option value="feed">Custom XML / RESO Feed</option>
                  </select>
                </div>
              </div>

              {/* Property Images */}
              <div className="border-t border-[#E5E0D8] pt-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55]">
                    Property Photos
                  </label>
                  <label className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D6CEBE] rounded text-xs font-semibold text-[#141413] inline-flex items-center gap-1.5 cursor-pointer">
                    <ImagePlus size={14} />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload to property-media'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={uploadingImage}
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Or paste verified HTTPS image URL..."
                    className="flex-1 h-10 px-3 border border-[#D6CEBE] rounded text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 h-10 bg-[#EFECE6] hover:bg-[#E5E0D8] text-xs font-semibold rounded cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                {(form.images || []).length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {(form.images || []).map((img, idx) => (
                      <div key={img.image_url + idx} className="border border-[#E5E0D8] rounded p-2 space-y-1.5">
                        <img
                          src={img.image_url}
                          alt={img.alt_text || 'Property preview'}
                          referrerPolicy="no-referrer"
                          className="w-full aspect-[4/3] object-cover rounded bg-[#EBE6DF]"
                        />
                        <div className="flex items-center justify-between text-[11px]">
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                images: (prev.images || []).map((item, i) => ({
                                  ...item,
                                  is_primary: i === idx,
                                })),
                              }))
                            }
                            className={`font-semibold cursor-pointer ${
                              img.is_primary ? 'text-[#8C4A27]' : 'text-[#5C5A55] hover:underline'
                            }`}
                          >
                            {img.is_primary ? 'Primary' : 'Set Primary'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                images: (prev.images || []).filter((_, i) => i !== idx),
                              }))
                            }
                            className="text-[#991B1B] cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-[#E5E0D8] pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-5 py-2.5 bg-[#FAF8F5] border border-[#D6CEBE] text-xs font-semibold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : form.id ? 'Update Property' : 'Save Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

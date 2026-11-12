import React, { useState } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { EnquiryStatus, PropertyEnquiry } from '../../types';
import {
  deletePropertyEnquiry,
  updateEnquiryStatus,
} from '../../services/propertyService';
import { toast } from 'sonner';

interface AdminEnquiriesSectionProps {
  enquiries: PropertyEnquiry[];
  schemaPending: boolean;
  canDelete: boolean;
  onRefresh: () => Promise<void>;
}

export default function AdminEnquiriesSection({
  enquiries,
  schemaPending,
  canDelete,
  onRefresh,
}: AdminEnquiriesSectionProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | EnquiryStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (schemaPending) {
    return (
      <div className="bg-white border border-[#E5E0D8] rounded p-8 space-y-3">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
          Database Migration Required
        </p>
        <h2 className="text-xl font-serif font-semibold text-[#141413]">
          Property Enquiries Table Not Found
        </h2>
        <p className="text-sm text-[#4A4843] max-w-2xl leading-relaxed">
          Run <code className="font-mono bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E5E0D8]">supabase/migrations/20261111143000_create_property_marketplace.sql</code> in Supabase SQL Editor to store and manage property enquiries.
        </p>
      </div>
    );
  }

  const filtered = enquiries.filter((item) =>
    statusFilter === 'all' ? true : item.status === statusFilter
  );

  const handleStatusChange = async (id: string, nextStatus: EnquiryStatus) => {
    setUpdatingId(id);
    const res = await updateEnquiryStatus(id, nextStatus);
    setUpdatingId(null);

    if (!res.success) {
      toast.error(res.error || 'Unable to update enquiry status.');
      return;
    }

    toast.success(`Enquiry marked as ${nextStatus}.`);
    await onRefresh();
  };

  const handleDelete = async (id: string) => {
    const res = await deletePropertyEnquiry(id);
    if (!res.success) {
      toast.error(res.error || 'Unable to delete enquiry.');
      return;
    }
    toast.success('Enquiry deleted.');
    await onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E0D8] rounded p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
            Lead Management
          </p>
          <h1 className="text-2xl font-serif font-semibold text-[#141413]">
            Property Enquiries ({enquiries.length})
          </h1>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | EnquiryStatus)}
          className="h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <MessageSquare size={28} className="mx-auto text-[#8C4A27]" strokeWidth={1.5} />
            <p className="text-sm text-[#5C5A55]">
              {enquiries.length === 0
                ? 'No property enquiries submitted yet.'
                : 'No enquiries match the selected status filter.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E0D8]">
            {filtered.map((item) => (
              <div key={item.id} className="p-5 sm:p-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-base font-semibold text-[#141413]">
                      {item.full_name}
                    </div>
                    <div className="text-xs text-[#5C5A55] font-mono">
                      {item.email}
                      {item.phone ? ` · ${item.phone}` : ''}
                      {' · '}
                      {item.created_at.split('T')[0]}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      disabled={updatingId === item.id}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value as EnquiryStatus)
                      }
                      className="h-8 px-2.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-semibold capitalize"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                      <option value="archived">Archived</option>
                    </select>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-[#991B1B] hover:bg-[#FEF2F2] rounded cursor-pointer"
                        title="Delete enquiry"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {item.property && (
                  <div className="text-xs text-[#1E3A5F] font-semibold">
                    Property: {item.property.title} ({item.property.city}, {item.property.country} ·{' '}
                    {item.property.transaction_type.toUpperCase()})
                  </div>
                )}

                <p className="text-sm text-[#4A4843] leading-relaxed bg-[#FAF8F5] border border-[#E5E0D8] rounded p-3.5">
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

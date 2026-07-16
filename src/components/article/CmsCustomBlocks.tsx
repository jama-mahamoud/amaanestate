import { Node as TiptapNode } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useState, useEffect } from 'react';
import { 
  Check, X, Star, AlertCircle, Info, Flame, Lightbulb, 
  Plus, Trash2, ExternalLink, Shield, ArrowRight, Eye, Settings2, Play
} from 'lucide-react';

// --- Helper: Render Star Rating ---
function renderStarsHTML(rating: number) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  
  let html = '<div class="flex items-center gap-1 text-amber-400">';
  for (let i = 0; i < fullStars; i++) {
    html += '★';
  }
  if (halfStar) {
    html += '½';
  }
  for (let i = 0; i < emptyStars; i++) {
    html += '☆';
  }
  html += ` <span class="text-xs font-mono font-bold text-white/60 ml-1">(${rating}/5)</span></div>`;
  return html;
}

// ==========================================
// 1. AFFILIATE PRODUCT BOX
// ==========================================
export const ProductBoxNode = TiptapNode.create({
  name: 'productBox',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      name: { default: 'Product Name' },
      company: { default: 'Company Name' },
      imageUrl: { default: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=80' },
      affiliateUrl: { default: '#' },
      websiteUrl: { default: '#' },
      buttonText: { default: 'Get Started' },
      price: { default: '$19.99/mo' },
      oldPrice: { default: '$29.99/mo' },
      discountBadge: { default: 'Save 33%' },
      couponCode: { default: 'GOLD33' },
      rating: { default: '4.8' },
      description: { default: 'Enter a short, high-conversion description here to highlight your recommendation.' },
      pros: { default: 'Fast cloud deployments\nFully secure network protocols\n24/7 dedicated elite support' },
      cons: { default: 'Visual learning curve\nVPS server model focused' },
      features: { default: '1-Click Installer\nPremium Security Suite\nUnlimited Domain Bindings' },
      buttonColor: { default: '#C5A059' }, // Luxury gold
      bgStyle: { default: 'premium' }, // premium | glass | dark
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="product-box"]' }];
  },

  renderHTML({ node }) {
    const attrs = node.attrs;
    const prosList = attrs.pros.split('\n').filter(Boolean);
    const consList = attrs.cons.split('\n').filter(Boolean);
    const featuresList = attrs.features.split('\n').filter(Boolean);

    let bgClass = 'bg-[#0a0a0f] border-white/5';
    if (attrs.bgStyle === 'glass') bgClass = 'bg-white/[0.02] backdrop-blur-3xl border-white/10';
    else if (attrs.bgStyle === 'premium') bgClass = 'bg-black border-[#C5A059]/30 shadow-xl shadow-[#C5A059]/5';

    const starsHTML = renderStarsHTML(parseFloat(attrs.rating) || 5);

    // Build the output DOM string
    const htmlString = `
      <div class="not-prose ${bgClass} border rounded-3xl p-6 sm:p-8 my-10 text-white shadow-2xl relative overflow-hidden" style="border-radius: 24px;">
        ${attrs.discountBadge ? `<div class="absolute top-4 right-4 bg-[#C5A059] text-black text-[10px] font-mono font-extrabold uppercase px-3 py-1 rounded-full tracking-wider z-10 shadow-lg shadow-[#C5A059]/20">${attrs.discountBadge}</div>` : ''}
        
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div class="md:col-span-3 flex justify-center">
            <img src="${attrs.imageUrl}" alt="${attrs.name}" class="rounded-2xl max-h-[140px] w-auto object-contain border border-white/10 bg-[#050505] p-3 shadow-inner" style="border-radius: 16px;" />
          </div>
          
          <div class="md:col-span-6 space-y-3 text-left">
            <div>
              <span class="text-[9px] uppercase font-bold tracking-[0.25em] text-white/40 block mb-0.5">${attrs.company}</span>
              <h4 class="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">${attrs.name}</h4>
              <div class="mt-1">${starsHTML}</div>
            </div>
            
            <p class="text-xs text-white/75 leading-relaxed font-sans">${attrs.description}</p>
            
            ${featuresList.length > 0 ? `
              <div class="flex flex-wrap gap-2 pt-1">
                ${featuresList.map(f => `<span class="inline-flex items-center gap-1 text-[10px] bg-white/5 text-white/80 border border-white/5 rounded-lg px-2.5 py-1 font-medium font-sans">✦ ${f}</span>`).join('')}
              </div>
            ` : ''}
          </div>
          
          <div class="md:col-span-3 flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-6 space-y-4">
            <div class="text-center md:text-right">
              ${attrs.oldPrice ? `<span class="text-xs text-white/40 line-through block font-mono">${attrs.oldPrice}</span>` : ''}
              <span class="text-2.5xl font-black text-white font-mono leading-none block">${attrs.price}</span>
              ${attrs.couponCode ? `<span class="inline-block mt-2 text-[10px] font-mono border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-md tracking-wider">Coupon: <strong class="font-extrabold">${attrs.couponCode}</strong></span>` : ''}
            </div>
            
            <div class="w-full flex flex-col gap-2">
              <a href="${attrs.affiliateUrl}" target="_blank" rel="nofollow sponsored" class="w-full text-center text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 cursor-pointer" style="background-color: ${attrs.buttonColor || '#C5A059'}; color: ${attrs.buttonColor === '#FFFFFF' ? '#000000' : '#000000'}; font-weight: 900; border-radius: 12px;">
                ${attrs.buttonText} <span class="text-[10px]">↗</span>
              </a>
              ${attrs.websiteUrl && attrs.websiteUrl !== '#' ? `
                <a href="${attrs.websiteUrl}" target="_blank" rel="noopener noreferrer" class="w-full text-center text-[10px] font-bold uppercase tracking-wider py-2 rounded-xl text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300" style="border-radius: 12px;">
                  Official Website
                </a>
              ` : ''}
            </div>
          </div>
        </div>
        
        ${(prosList.length > 0 || consList.length > 0) ? `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5 text-left">
            ${prosList.length > 0 ? `
              <div class="space-y-1.5">
                <span class="text-[9px] uppercase font-extrabold tracking-wider text-emerald-400 block">✔ Pros</span>
                <ul class="space-y-1">
                  ${prosList.map(p => `<li class="text-[11px] text-white/80 flex items-start gap-1.5 font-sans">✔ ${p}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            ${consList.length > 0 ? `
              <div class="space-y-1.5">
                <span class="text-[9px] uppercase font-extrabold tracking-wider text-rose-400 block">✖ Cons</span>
                <ul class="space-y-1">
                  ${consList.map(c => `<li class="text-[11px] text-white/80 flex items-start gap-1.5 font-sans">✖ ${c}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;

    return ['div', { 
      'data-type': 'product-box',
      class: 'tiptap-custom-block',
      style: 'margin-top: 2rem; margin-bottom: 2rem;'
    }, ['div', { dangerouslySetInnerHTML: htmlString }]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ProductBoxEditorView);
  }
});

function ProductBoxEditorView({ node, updateAttributes }: any) {
  const attrs = node.attrs;
  const [showForm, setShowForm] = useState(false);

  const handleField = (key: string, val: string) => {
    updateAttributes({ [key]: val });
  };

  const prosList = attrs.pros.split('\n').filter(Boolean);
  const consList = attrs.cons.split('\n').filter(Boolean);
  const featuresList = attrs.features.split('\n').filter(Boolean);

  return (
    <NodeViewWrapper className="border border-dashed border-white/10 hover:border-[#C5A059]/40 p-4 rounded-3xl transition-colors bg-white/[0.01]">
      <div className="flex items-center justify-between mb-4 bg-white/5 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-[#C5A059]" />
          <span className="text-[10px] font-mono uppercase font-black tracking-widest text-[#C5A059]">Affiliate Product Box Block</span>
        </div>
        <button 
          type="button" 
          onClick={() => setShowForm(!showForm)} 
          className="bg-[#C5A059]/10 border border-[#C5A059]/30 hover:bg-[#C5A059]/20 text-[#C5A059] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
        >
          {showForm ? <Eye size={12} /> : <Settings2 size={12} />}
          {showForm ? 'View Preview' : 'Configure Block'}
        </button>
      </div>

      {showForm ? (
        <div className="bg-[#0c0c10] border border-white/5 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-sans text-xs text-white">
          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Product Name</label>
            <input type="text" value={attrs.name} onChange={(e) => handleField('name', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Company Brand</label>
            <input type="text" value={attrs.company} onChange={(e) => handleField('company', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Product Image URL</label>
            <input type="text" value={attrs.imageUrl} onChange={(e) => handleField('imageUrl', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Affiliate URL</label>
            <input type="text" value={attrs.affiliateUrl} onChange={(e) => handleField('affiliateUrl', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Official Website</label>
            <input type="text" value={attrs.websiteUrl} onChange={(e) => handleField('websiteUrl', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Price</label>
            <input type="text" value={attrs.price} onChange={(e) => handleField('price', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white font-mono" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Old Price (MSRP)</label>
            <input type="text" value={attrs.oldPrice} onChange={(e) => handleField('oldPrice', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white font-mono" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Badge Text</label>
            <input type="text" value={attrs.discountBadge} onChange={(e) => handleField('discountBadge', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Coupon Code</label>
            <input type="text" value={attrs.couponCode} onChange={(e) => handleField('couponCode', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white font-mono" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Button Text</label>
            <input type="text" value={attrs.buttonText} onChange={(e) => handleField('buttonText', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Rating (e.g. 4.9)</label>
            <input type="text" value={attrs.rating} onChange={(e) => handleField('rating', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white font-mono" />
          </div>
          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Short Description</label>
            <textarea value={attrs.description} onChange={(e) => handleField('description', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white h-20 resize-none" />
          </div>
          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Key Features (One per line)</label>
            <textarea value={attrs.features} onChange={(e) => handleField('features', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white h-20 resize-none font-mono" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Pros (One per line)</label>
            <textarea value={attrs.pros} onChange={(e) => handleField('pros', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white h-24 resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Cons (One per line)</label>
            <textarea value={attrs.cons} onChange={(e) => handleField('cons', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white h-24 resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Button Color (HEX)</label>
            <input type="color" value={attrs.buttonColor} onChange={(e) => handleField('buttonColor', e.target.value)} className="w-full bg-white/5 border border-white/10 h-10 p-1 rounded-lg text-white cursor-pointer" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Background Theme</label>
            <select value={attrs.bgStyle} onChange={(e) => handleField('bgStyle', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 h-10 rounded-lg text-white">
              <option value="premium">Golden Border Premium</option>
              <option value="glass">Translucent Glass</option>
              <option value="dark">Stealth Obsidian Dark</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="border border-white/5 rounded-2xl p-6 bg-black/60 relative overflow-hidden text-left text-white max-w-full">
          {attrs.discountBadge && (
            <span className="absolute top-4 right-4 bg-[#C5A059] text-black text-[9px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full z-10">{attrs.discountBadge}</span>
          )}
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <img src={attrs.imageUrl} alt={attrs.name} className="rounded-xl w-24 h-24 object-contain bg-white/5 p-2 shrink-0 border border-white/10" />
            <div className="space-y-1 flex-1">
              <span className="text-[10px] text-white/40 font-mono font-bold uppercase tracking-wider">{attrs.company}</span>
              <h4 className="text-lg font-black text-white">{attrs.name}</h4>
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: Math.floor(parseFloat(attrs.rating) || 5) }).map((_, i) => (
                  <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                ))}
                <span className="text-[10px] text-white/50 ml-1">({attrs.rating})</span>
              </div>
              <p className="text-xs text-white/70 line-clamp-2 mt-2">{attrs.description}</p>
            </div>
            <div className="shrink-0 text-center sm:text-right space-y-2">
              <div>
                {attrs.oldPrice && <span className="text-[10px] line-through text-white/40 block font-mono">{attrs.oldPrice}</span>}
                <span className="text-xl font-mono font-bold text-[#C5A059]">{attrs.price}</span>
              </div>
              <button type="button" className="bg-[#C5A059] text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-not-allowed">
                {attrs.buttonText} <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}

// ==========================================
// 2. PROS & CONS BLOCK
// ==========================================
export const ProsConsNode = TiptapNode.create({
  name: 'prosCons',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      pros: { default: 'High processing speed\nExceptional thermal system\nIntuitive control canvas' },
      cons: { default: 'Higher standard price\nNo secondary physical hub' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="pros-cons"]' }];
  },

  renderHTML({ node }) {
    const pros = node.attrs.pros.split('\n').filter(Boolean);
    const cons = node.attrs.cons.split('\n').filter(Boolean);

    const htmlString = `
      <div class="not-prose grid grid-cols-1 md:grid-cols-2 gap-6 my-10 text-white text-left font-sans">
        <div class="bg-gradient-to-br from-[#0b0b0b] to-[#141414] border border-[#D4AF37]/20 shadow-[0_8px_25px_rgba(0,0,0,0.8)] shadow-[#D4AF37]/5 p-6 rounded-2xl hover:translate-y-[-2px] hover:border-[#D4AF37]/45 transition-all duration-300" style="border-radius: 16px;">
          <h4 class="text-[#D4AF37] font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2" style="color: #D4AF37 !important; font-weight: bold;">
            <span class="inline-flex items-center justify-center w-5 h-5 bg-[#D4AF37]/10 border border-[#D4AF37]/25 rounded-full text-xs text-[#D4AF37]">✔</span>
            Pros / Advantages
          </h4>
          <ul class="space-y-2.5">
            ${pros.map(p => `
              <li class="text-xs text-slate-300 flex items-start gap-2" style="color: #cbd5e1 !important;">
                <span class="text-[#D4AF37] font-bold shrink-0 mt-0.5" style="color: #D4AF37 !important;">✔</span>
                <span>${p}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        
        <div class="bg-gradient-to-br from-[#0b0b0b] to-[#141414] border border-white/5 shadow-[0_8px_25px_rgba(0,0,0,0.8)] p-6 rounded-2xl hover:translate-y-[-2px] hover:border-white/10 transition-all duration-300" style="border-radius: 16px;">
          <h4 class="text-slate-400 font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2" style="color: #94a3b8 !important; font-weight: bold;">
            <span class="inline-flex items-center justify-center w-5 h-5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400">✖</span>
            Cons / Disadvantages
          </h4>
          <ul class="space-y-2.5">
            ${cons.map(c => `
              <li class="text-xs text-slate-400 flex items-start gap-2" style="color: #94a3b8 !important;">
                <span class="text-rose-500 shrink-0 mt-0.5">✖</span>
                <span>${c}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;

    return ['div', { 
      'data-type': 'pros-cons',
      class: 'tiptap-custom-block'
    }, ['div', { dangerouslySetInnerHTML: htmlString }]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ProsConsEditorView);
  }
});

function ProsConsEditorView({ node, updateAttributes }: any) {
  const [showForm, setShowForm] = useState(false);
  const handleField = (key: string, val: string) => updateAttributes({ [key]: val });

  return (
    <NodeViewWrapper className="border border-dashed border-white/10 hover:border-emerald-500/30 p-4 rounded-2xl transition-all bg-white/[0.01]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono uppercase font-black tracking-widest text-emerald-400 flex items-center gap-1.5">
          <Check size={12} /> Pro-Con Balancing Block
        </span>
        <button type="button" onClick={() => setShowForm(!showForm)} className="text-[10px] uppercase font-bold text-white/40 hover:text-white bg-white/5 px-2 py-1 rounded">
          {showForm ? 'Preview' : 'Edit Text'}
        </button>
      </div>

      {showForm ? (
        <div className="grid grid-cols-2 gap-4 text-left font-sans text-xs">
          <div>
            <label className="text-[9px] uppercase font-bold text-white/40 block mb-1">Pros (One per line)</label>
            <textarea value={node.attrs.pros} onChange={(e) => handleField('pros', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white h-24 resize-none" />
          </div>
          <div>
            <label className="text-[9px] uppercase font-bold text-white/40 block mb-1">Cons (One per line)</label>
            <textarea value={node.attrs.cons} onChange={(e) => handleField('cons', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white h-24 resize-none" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 text-left text-xs text-white/80">
          <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
            <h5 className="font-bold text-emerald-400 mb-2">✔ Pros</h5>
            <ul className="space-y-1">
              {node.attrs.pros.split('\n').filter(Boolean).map((p: string, i: number) => <li key={i}>✔ {p}</li>)}
            </ul>
          </div>
          <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10">
            <h5 className="font-bold text-rose-400 mb-2">✖ Cons</h5>
            <ul className="space-y-1">
              {node.attrs.cons.split('\n').filter(Boolean).map((c: string, i: number) => <li key={i}>✖ {c}</li>)}
            </ul>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}

// ==========================================
// 3. RATING BREAKDOWN BLOCK
// ==========================================
export const RatingBlockNode = TiptapNode.create({
  name: 'ratingBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      title: { default: 'Editorial Performance Rating' },
      overall: { default: '4.8' },
      criteria1Name: { default: 'Build Quality' },
      criteria1Value: { default: '4.7' },
      criteria2Name: { default: 'Performance' },
      criteria2Value: { default: '4.9' },
      criteria3Name: { default: 'Ease of Use' },
      criteria3Value: { default: '4.8' },
      criteria4Name: { default: 'Value' },
      criteria4Value: { default: '4.6' },
      criteria5Name: { default: 'Support' },
      criteria5Value: { default: '4.8' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="rating-block"]' }];
  },

  renderHTML({ node }) {
    const attrs = node.attrs;
    const items = [
      { name: attrs.criteria1Name, val: parseFloat(attrs.criteria1Value) || 4 },
      { name: attrs.criteria2Name, val: parseFloat(attrs.criteria2Value) || 4 },
      { name: attrs.criteria3Name, val: parseFloat(attrs.criteria3Value) || 4 },
      { name: attrs.criteria4Name, val: parseFloat(attrs.criteria4Value) || 4 },
      { name: attrs.criteria5Name, val: parseFloat(attrs.criteria5Value) || 4 },
    ].filter(i => i.name.trim().length > 0);

    const starsHTML = renderStarsHTML(parseFloat(attrs.overall) || 5);

    const htmlString = `
      <div class="not-prose bg-gradient-to-br from-[#0b0b0b] to-[#141414] border border-[#D4AF37]/25 rounded-3xl p-6 sm:p-8 my-10 text-white shadow-[0_12px_35px_rgba(0,0,0,0.9)] text-left hover:border-[#D4AF37]/45 transition-all duration-300" style="border-radius: 24px;">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5 mb-6">
          <div>
            <h4 class="text-lg font-black tracking-tight text-[#D4AF37] uppercase" style="color: #D4AF37 !important; font-weight: 900;">${attrs.title}</h4>
            <div class="mt-1">${starsHTML}</div>
          </div>
          <div class="flex items-center gap-3 bg-white/5 border border-[#D4AF37]/20 p-4 rounded-2xl shrink-0 shadow-lg" style="border-radius: 16px;">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none" style="color: #94a3b8 !important;">Overall Score</span>
            <span class="text-3xl font-mono font-black text-[#D4AF37] leading-none" style="color: #D4AF37 !important; font-weight: 950;">${attrs.overall}</span>
          </div>
        </div>
        
        <div class="space-y-4">
          ${items.map(item => {
            const pct = (item.val / 5) * 100;
            return `
              <div class="space-y-1.5">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-bold text-slate-300" style="color: #cbd5e1 !important;">${item.name}</span>
                  <span class="font-mono font-bold text-[#D4AF37]" style="color: #D4AF37 !important; font-weight: bold;">${item.val} / 5.0</span>
                </div>
                <div class="w-full bg-white/5 border border-white/5 h-2.5 rounded-full overflow-hidden">
                  <div class="bg-gradient-to-r from-[#D4AF37]/40 to-[#D4AF37] h-full rounded-full" style="width: ${pct}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    return ['div', { 
      'data-type': 'rating-block',
      class: 'tiptap-custom-block'
    }, ['div', { dangerouslySetInnerHTML: htmlString }]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(RatingBlockEditorView);
  }
});

function RatingBlockEditorView({ node, updateAttributes }: any) {
  const [showForm, setShowForm] = useState(false);
  const handleField = (key: string, val: string) => updateAttributes({ [key]: val });

  return (
    <NodeViewWrapper className="border border-dashed border-white/10 hover:border-amber-500/30 p-4 rounded-2xl transition-all bg-white/[0.01]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono uppercase font-black tracking-widest text-amber-400 flex items-center gap-1.5">
          <Star size={12} className="fill-amber-400" /> Multi-Criteria Rating breakdown
        </span>
        <button type="button" onClick={() => setShowForm(!showForm)} className="text-[10px] uppercase font-bold text-white/40 hover:text-white bg-white/5 px-2 py-1 rounded">
          {showForm ? 'Preview' : 'Edit Ratings'}
        </button>
      </div>

      {showForm ? (
        <div className="space-y-3 text-left font-sans text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Title</label>
              <input type="text" value={node.attrs.title} onChange={(e) => handleField('title', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Overall Score (e.g. 4.8)</label>
              <input type="text" value={node.attrs.overall} onChange={(e) => handleField('overall', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white font-mono" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Criteria 1</label>
              <input type="text" value={node.attrs.criteria1Name} onChange={(e) => handleField('criteria1Name', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Rating 1</label>
              <input type="text" value={node.attrs.criteria1Value} onChange={(e) => handleField('criteria1Value', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Criteria 2</label>
              <input type="text" value={node.attrs.criteria2Name} onChange={(e) => handleField('criteria2Name', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Rating 2</label>
              <input type="text" value={node.attrs.criteria2Value} onChange={(e) => handleField('criteria2Value', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Criteria 3</label>
              <input type="text" value={node.attrs.criteria3Name} onChange={(e) => handleField('criteria3Name', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Rating 3</label>
              <input type="text" value={node.attrs.criteria3Value} onChange={(e) => handleField('criteria3Value', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Criteria 4</label>
              <input type="text" value={node.attrs.criteria4Name} onChange={(e) => handleField('criteria4Name', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Rating 4</label>
              <input type="text" value={node.attrs.criteria4Value} onChange={(e) => handleField('criteria4Value', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Criteria 5</label>
              <input type="text" value={node.attrs.criteria5Name} onChange={(e) => handleField('criteria5Name', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Rating 5</label>
              <input type="text" value={node.attrs.criteria5Value} onChange={(e) => handleField('criteria5Value', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white font-mono" />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-left bg-black/60 p-4 rounded-xl border border-white/5">
          <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3">
            <h5 className="font-bold text-white text-sm">{node.attrs.title}</h5>
            <span className="text-[#C5A059] font-bold font-mono">Overall: {node.attrs.overall}</span>
          </div>
          <div className="space-y-1 text-[11px] text-white/70">
            {node.attrs.criteria1Name && <div className="flex justify-between"><span>{node.attrs.criteria1Name}</span><span>{node.attrs.criteria1Value}</span></div>}
            {node.attrs.criteria2Name && <div className="flex justify-between"><span>{node.attrs.criteria2Name}</span><span>{node.attrs.criteria2Value}</span></div>}
            {node.attrs.criteria3Name && <div className="flex justify-between"><span>{node.attrs.criteria3Name}</span><span>{node.attrs.criteria3Value}</span></div>}
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}

// ==========================================
// 4. COMPARISON TABLE
// ==========================================
export const ComparisonTableNode = TiptapNode.create({
  name: 'comparisonTable',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      headers: { default: 'Brand,Price,Security,Ease of Use' },
      rowsJson: { default: '[["SPanel","★★★★★","★★★★★","★★★★★"],["cPanel","★★★","★★★★","★★★★"],["Plesk","★★★★","★★★★","★★★★"]]' }
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="comparison-table"]' }];
  },

  renderHTML({ node }) {
    const headers = node.attrs.headers.split(',').filter(Boolean);
    let rows: string[][] = [];
    try {
      rows = JSON.parse(node.attrs.rowsJson);
    } catch (e) {
      rows = [];
    }

    const htmlString = `
      <div class="not-prose overflow-x-auto border border-white/10 rounded-2xl my-10 bg-black/80 shadow-2xl" style="border-radius: 16px;">
        <table class="w-full text-left border-collapse text-white text-xs font-sans">
          <thead>
            <tr class="bg-white/10 border-b border-white/10 font-bold uppercase tracking-wider text-[10px] text-[#C5A059]">
              ${headers.map(h => `<th class="p-4 border-r border-white/5 last:border-0">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, rIdx) => `
              <tr class="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors ${rIdx % 2 === 0 ? 'bg-white/[0.01]' : ''}">
                ${row.map(cell => `<td class="p-4 border-r border-white/5 last:border-0 font-medium text-white/85">${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    return ['div', { 
      'data-type': 'comparison-table',
      class: 'tiptap-custom-block'
    }, ['div', { dangerouslySetInnerHTML: htmlString }]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ComparisonTableEditorView);
  }
});

function ComparisonTableEditorView({ node, updateAttributes }: any) {
  const [showForm, setShowForm] = useState(false);
  const headers = node.attrs.headers.split(',');
  let rows: string[][] = [];
  try {
    rows = JSON.parse(node.attrs.rowsJson);
  } catch (e) {
    rows = [];
  }

  const handleHeadersChange = (val: string) => {
    updateAttributes({ headers: val });
  };

  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const newRows = [...rows];
    newRows[rIdx][cIdx] = val;
    updateAttributes({ rowsJson: JSON.stringify(newRows) });
  };

  const addRow = () => {
    const newRows = [...rows, Array(headers.length).fill('')];
    updateAttributes({ rowsJson: JSON.stringify(newRows) });
  };

  const deleteRow = (rIdx: number) => {
    const newRows = rows.filter((_, idx) => idx !== rIdx);
    updateAttributes({ rowsJson: JSON.stringify(newRows) });
  };

  return (
    <NodeViewWrapper className="border border-dashed border-white/10 hover:border-[#C5A059]/30 p-4 rounded-2xl transition-all bg-white/[0.01]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono uppercase font-black tracking-widest text-[#C5A059] flex items-center gap-1.5">
          ✦ Reusable Comparison Table
        </span>
        <button type="button" onClick={() => setShowForm(!showForm)} className="text-[10px] uppercase font-bold text-white/40 hover:text-white bg-white/5 px-2 py-1 rounded">
          {showForm ? 'Preview' : 'Edit Matrix'}
        </button>
      </div>

      {showForm ? (
        <div className="space-y-4 text-left font-sans text-xs text-white">
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-bold text-white/40 block">Table Headers (Comma-separated)</label>
            <input type="text" value={node.attrs.headers} onChange={(e) => handleHeadersChange(e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
          </div>
          
          <div className="space-y-2">
            <label className="text-[9px] uppercase font-bold text-white/40 block">Rows Data</label>
            <div className="space-y-2">
              {rows.map((row, rIdx) => (
                <div key={rIdx} className="flex gap-2 items-center bg-white/5 p-2 rounded-xl">
                  {row.map((cell, cIdx) => (
                    <input 
                      key={cIdx} 
                      type="text" 
                      value={cell} 
                      placeholder={headers[cIdx] || `Cell ${cIdx}`}
                      onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)} 
                      className="bg-black/40 border border-white/10 p-1 rounded text-white text-[11px] flex-1" 
                    />
                  ))}
                  <button type="button" onClick={() => deleteRow(rIdx)} className="text-rose-400 p-1 hover:bg-white/5 rounded">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addRow} className="bg-white/5 hover:bg-white/10 text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-1">
              <Plus size={11} /> Add Brand/Row
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-black/40 border border-white/5 rounded-xl">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-white/5 text-[#C5A059] uppercase tracking-wider font-bold">
                {headers.map((h, i) => <th key={i} className="p-2.5 border-r border-white/5 last:border-0">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-white/5 last:border-0">
                  {row.map((cell, cIdx) => <td key={cIdx} className="p-2.5 border-r border-white/5 last:border-0">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </NodeViewWrapper>
  );
}

// ==========================================
// 5. CALL TO ACTION (CTA) BLOCK
// ==========================================
export const CtaBlockNode = TiptapNode.create({
  name: 'callToAction',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      style: { default: 'banner' }, // banner | card | minimal | floating
      headline: { default: 'Deploy Your Strategic Network Hub Now' },
      description: { default: 'Leverage our cloud native infrastructure for unmatched speeds and low latencies.' },
      buttonText: { default: 'Activate Account' },
      affiliateLink: { default: '#' },
      bgStyle: { default: 'dark' }, // dark | gold | glass
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="cta-block"]' }];
  },

  renderHTML({ node }) {
    const attrs = node.attrs;
    let bgStyle = 'bg-black border-white/5';
    if (attrs.bgStyle === 'gold') bgStyle = 'bg-[#C5A059] text-black border-transparent';
    else if (attrs.bgStyle === 'glass') bgStyle = 'bg-white/[0.02] backdrop-blur-3xl border-white/10';

    const textHeadlineColor = attrs.bgStyle === 'gold' ? 'text-black' : 'text-white';
    const textDescColor = attrs.bgStyle === 'gold' ? 'text-black/80' : 'text-white/70';
    const btnBg = attrs.bgStyle === 'gold' ? 'bg-black text-white hover:bg-neutral-900' : 'bg-[#C5A059] text-black hover:bg-white';

    let htmlString = '';

    if (attrs.style === 'minimal') {
      htmlString = `
        <div class="not-prose ${bgStyle} border rounded-2xl p-4 sm:p-5 my-8 text-left flex flex-col sm:flex-row items-center justify-between gap-4" style="border-radius: 12px;">
          <div class="space-y-1">
            <h5 class="font-black text-sm ${textHeadlineColor}">${attrs.headline}</h5>
            <p class="text-xs ${textDescColor}">${attrs.description}</p>
          </div>
          <a href="${attrs.affiliateLink}" target="_blank" rel="nofollow sponsored" class="shrink-0 text-[10px] font-black uppercase tracking-widest ${btnBg} px-6 py-2.5 rounded-lg transition-all" style="border-radius: 8px;">
            ${attrs.buttonText} ↗
          </a>
        </div>
      `;
    } else {
      // Banner or Card
      htmlString = `
        <div class="not-prose ${bgStyle} border rounded-3xl p-8 my-10 text-center relative overflow-hidden" style="border-radius: 20px;">
          <div class="max-w-xl mx-auto space-y-4">
            <span class="text-[9px] uppercase font-black tracking-[0.3em] text-white/40 block">Limited Strategic Offer</span>
            <h4 class="text-xl sm:text-2xl font-black tracking-tight ${textHeadlineColor}">${attrs.headline}</h4>
            <p class="text-xs ${textDescColor} leading-relaxed">${attrs.description}</p>
            <div class="pt-2">
              <a href="${attrs.affiliateLink}" target="_blank" rel="nofollow sponsored" class="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${btnBg} px-8 py-3.5 rounded-xl transition-all shadow-lg" style="border-radius: 12px; font-weight: 900;">
                ${attrs.buttonText} <span class="text-[10px]">↗</span>
              </a>
            </div>
          </div>
        </div>
      `;
    }

    return ['div', { 
      'data-type': 'cta-block',
      class: 'tiptap-custom-block'
    }, ['div', { dangerouslySetInnerHTML: htmlString }]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CtaBlockEditorView);
  }
});

function CtaBlockEditorView({ node, updateAttributes }: any) {
  const [showForm, setShowForm] = useState(false);
  const handleField = (key: string, val: string) => updateAttributes({ [key]: val });

  return (
    <NodeViewWrapper className="border border-dashed border-white/10 hover:border-blue-500/30 p-4 rounded-2xl transition-all bg-white/[0.01]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono uppercase font-black tracking-widest text-[#C5A059] flex items-center gap-1.5">
          ✦ Premium Call To Action (CTA)
        </span>
        <button type="button" onClick={() => setShowForm(!showForm)} className="text-[10px] uppercase font-bold text-white/40 hover:text-white bg-white/5 px-2 py-1 rounded">
          {showForm ? 'Preview' : 'Configure CTA'}
        </button>
      </div>

      {showForm ? (
        <div className="space-y-3 text-left font-sans text-xs text-white">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <label className="text-[9px] uppercase font-bold text-white/40 block">CTA Headline</label>
              <input type="text" value={node.attrs.headline} onChange={(e) => handleField('headline', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Description Text</label>
              <textarea value={node.attrs.description} onChange={(e) => handleField('description', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white h-16 resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Button Label</label>
              <input type="text" value={node.attrs.buttonText} onChange={(e) => handleField('buttonText', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Affiliate URL</label>
              <input type="text" value={node.attrs.affiliateLink} onChange={(e) => handleField('affiliateLink', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Layout Style</label>
              <select value={node.attrs.style} onChange={(e) => handleField('style', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 h-9 rounded text-white">
                <option value="banner">Full Banner</option>
                <option value="minimal">Minimal Inline Row</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Color Theme</label>
              <select value={node.attrs.bgStyle} onChange={(e) => handleField('bgStyle', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 h-9 rounded text-white">
                <option value="dark">Stealth Obsidian</option>
                <option value="gold">Luxury Solid Gold</option>
                <option value="glass">Frosted Glass</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-black/60 p-4 rounded-xl border border-white/5 text-left text-xs">
          <h5 className="font-bold text-white text-sm">{node.attrs.headline}</h5>
          <p className="text-white/60 mt-1">{node.attrs.description}</p>
          <div className="mt-3 flex justify-end">
            <button type="button" className="bg-[#C5A059] text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg cursor-not-allowed">
              {node.attrs.buttonText}
            </button>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}

// ==========================================
// 6. REVIEW SUMMARY BOX
// ==========================================
export const ReviewSummaryNode = TiptapNode.create({
  name: 'reviewSummary',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      product: { default: 'Amaan Suite Core' },
      rating: { default: '4.9' },
      bestFor: { default: 'High-Volume Enterprise Developers' },
      summary: { default: 'A fully integrated, cloud native server framework that ensures absolute database alignment and maximum speed performance ratios.' },
      pros: { default: 'Ultimate speed benchmarking\nSeamless Firestore mapping\nExcellent developer guides' },
      cons: { default: 'Requires structural compliance' },
      websiteUrl: { default: '#' },
      affiliateUrl: { default: '#' }
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="review-summary"]' }];
  },

  renderHTML({ node }) {
    const attrs = node.attrs;
    const pros = attrs.pros.split('\n').filter(Boolean);
    const cons = attrs.cons.split('\n').filter(Boolean);
    const starsHTML = renderStarsHTML(parseFloat(attrs.rating) || 5);

    const htmlString = `
      <div class="not-prose bg-gradient-to-br from-neutral-900 to-black border border-[#C5A059]/30 rounded-3xl p-8 my-10 relative overflow-hidden text-white text-left" style="border-radius: 24px;">
        <div class="absolute top-0 right-0 w-[200px] h-[200px] bg-[#C5A059]/5 rounded-full filter blur-3xl"></div>
        
        <div class="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-white/5">
          <div class="space-y-1">
            <span class="text-[9px] uppercase font-black tracking-[0.25em] text-[#C5A059]">Verdict Summary Box</span>
            <h4 class="text-2xl font-black tracking-tight text-white">${attrs.product}</h4>
            <div class="mt-1">${starsHTML}</div>
          </div>
          
          <div class="bg-white/5 border border-white/5 p-3 px-4 rounded-xl text-center sm:text-right" style="border-radius: 12px;">
            <span class="text-[9px] uppercase font-bold tracking-widest text-white/40 block mb-0.5">VERDICT RATING</span>
            <span class="text-2xl font-mono font-black text-[#C5A059] block">${attrs.rating} / 5.0</span>
          </div>
        </div>
        
        <div class="py-6 space-y-4">
          <div class="space-y-1">
            <span class="text-[9px] uppercase font-extrabold text-[#C5A059] tracking-wider block">Best Suited For</span>
            <p class="text-sm font-bold text-white/90 font-sans">${attrs.bestFor}</p>
          </div>
          
          <div class="space-y-1">
            <span class="text-[9px] uppercase font-extrabold text-[#C5A059] tracking-wider block">Editorial Review</span>
            <p class="text-xs text-white/70 leading-relaxed font-sans">${attrs.summary}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/5 text-xs font-sans">
          <div class="space-y-1.5">
            <span class="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">✔ Key Advantages</span>
            <ul class="space-y-1">
              ${pros.map(p => `<li class="text-white/80 flex items-start gap-2">✔ ${p}</li>`).join('')}
            </ul>
          </div>
          <div class="space-y-1.5">
            <span class="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider block">✖ Cons & Limitations</span>
            <ul class="space-y-1">
              ${cons.map(c => `<li class="text-white/80 flex items-start gap-2">✖ ${c}</li>`).join('')}
            </ul>
          </div>
        </div>
        
        <div class="pt-6 flex flex-col sm:flex-row gap-3">
          <a href="${attrs.affiliateUrl}" target="_blank" rel="nofollow sponsored" class="flex-1 text-center text-xs font-black uppercase tracking-widest bg-[#C5A059] text-black py-3.5 rounded-xl transition-all font-sans" style="border-radius: 12px; font-weight: 900;">
            Get Started with ${attrs.product} ↗
          </a>
          ${attrs.websiteUrl && attrs.websiteUrl !== '#' ? `
            <a href="${attrs.websiteUrl}" target="_blank" rel="noopener noreferrer" class="sm:px-6 text-center text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/5 text-white/70 hover:text-white py-3.5 rounded-xl transition-all font-sans" style="border-radius: 12px;">
              Official Website
            </a>
          ` : ''}
        </div>
      </div>
    `;

    return ['div', { 
      'data-type': 'review-summary',
      class: 'tiptap-custom-block'
    }, ['div', { dangerouslySetInnerHTML: htmlString }]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ReviewSummaryEditorView);
  }
});

function ReviewSummaryEditorView({ node, updateAttributes }: any) {
  const [showForm, setShowForm] = useState(false);
  const handleField = (key: string, val: string) => updateAttributes({ [key]: val });

  return (
    <NodeViewWrapper className="border border-dashed border-white/10 hover:border-[#C5A059]/30 p-4 rounded-3xl transition-all bg-white/[0.01]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono uppercase font-black tracking-widest text-[#C5A059] flex items-center gap-1.5">
          ✦ Premium Review Summary Box
        </span>
        <button type="button" onClick={() => setShowForm(!showForm)} className="text-[10px] uppercase font-bold text-white/40 hover:text-white bg-white/5 px-2 py-1 rounded">
          {showForm ? 'Preview' : 'Edit Summary'}
        </button>
      </div>

      {showForm ? (
        <div className="space-y-3 text-left font-sans text-xs text-white">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Product Name</label>
              <input type="text" value={node.attrs.product} onChange={(e) => handleField('product', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Score (e.g. 4.9)</label>
              <input type="text" value={node.attrs.rating} onChange={(e) => handleField('rating', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Best Suited For</label>
              <input type="text" value={node.attrs.bestFor} onChange={(e) => handleField('bestFor', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Summary Verdict Paragraph</label>
              <textarea value={node.attrs.summary} onChange={(e) => handleField('summary', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white h-20 resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Key Pros (One per line)</label>
              <textarea value={node.attrs.pros} onChange={(e) => handleField('pros', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white h-20 resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Key Cons (One per line)</label>
              <textarea value={node.attrs.cons} onChange={(e) => handleField('cons', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white h-20 resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Affiliate link</label>
              <input type="text" value={node.attrs.affiliateUrl} onChange={(e) => handleField('affiliateUrl', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Website URL</label>
              <input type="text" value={node.attrs.websiteUrl} onChange={(e) => handleField('websiteUrl', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white font-mono" />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-left bg-black/60 p-4 rounded-xl border border-white/5 space-y-2 text-xs text-white">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h5 className="font-bold text-[#C5A059]">{node.attrs.product} Verdict</h5>
            <span className="font-mono font-bold">{node.attrs.rating} / 5.0</span>
          </div>
          <p className="text-white/60 text-[11px] leading-relaxed italic">{node.attrs.summary}</p>
        </div>
      )}
    </NodeViewWrapper>
  );
}

// ==========================================
// 7. FAQ ACCORDION BLOCK
// ==========================================
export const FaqBlockNode = TiptapNode.create({
  name: 'faqBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      faqsJson: { default: '[{"question":"Is this software completely free?","answer":"Yes, we provide a generous free-forever tier for small developer platforms."},{"question":"Is enterprise setup supported?","answer":"Absolutely. Our specialized tech agents facilitate immediate transition operations."}]' }
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="faq-block"]' }];
  },

  renderHTML({ node }) {
    let faqs: { question: string; answer: string }[] = [];
    try {
      faqs = JSON.parse(node.attrs.faqsJson);
    } catch (e) {
      faqs = [];
    }

    const htmlString = `
      <div class="not-prose space-y-3.5 my-10 text-white text-left font-sans">
        ${faqs.map((faq, idx) => `
          <details class="group bg-white/[0.02] border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-[#C5A059]/30 transition-all duration-300 select-none" style="border-radius: 16px;">
            <summary class="font-bold text-sm flex justify-between items-center outline-none list-none [&::-webkit-details-marker]:hidden">
              <span class="pr-4">${faq.question}</span>
              <span class="text-xs text-[#C5A059] transform group-open:rotate-180 transition-transform duration-300">▼</span>
            </summary>
            <div class="mt-3 pt-3 border-t border-white/5 text-xs text-white/70 leading-relaxed font-normal font-sans">
              ${faq.answer}
            </div>
          </details>
        `).join('')}
      </div>
    `;

    return ['div', { 
      'data-type': 'faq-block',
      class: 'tiptap-custom-block'
    }, ['div', { dangerouslySetInnerHTML: htmlString }]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FaqBlockEditorView);
  }
});

function FaqBlockEditorView({ node, updateAttributes }: any) {
  const [showForm, setShowForm] = useState(false);
  let faqs: { question: string; answer: string }[] = [];
  try {
    faqs = JSON.parse(node.attrs.faqsJson);
  } catch (e) {
    faqs = [];
  }

  const handleFaqChange = (idx: number, key: 'question' | 'answer', val: string) => {
    const newFaqs = [...faqs];
    newFaqs[idx] = { ...newFaqs[idx], [key]: val };
    updateAttributes({ faqsJson: JSON.stringify(newFaqs) });
  };

  const addFaq = () => {
    const newFaqs = [...faqs, { question: '', answer: '' }];
    updateAttributes({ faqsJson: JSON.stringify(newFaqs) });
  };

  const deleteFaq = (idx: number) => {
    const newFaqs = faqs.filter((_, i) => i !== idx);
    updateAttributes({ faqsJson: JSON.stringify(newFaqs) });
  };

  return (
    <NodeViewWrapper className="border border-dashed border-white/10 hover:border-blue-500/30 p-4 rounded-2xl transition-all bg-white/[0.01]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono uppercase font-black tracking-widest text-[#C5A059] flex items-center gap-1.5">
          ✦ Interactive FAQ Accordion Block
        </span>
        <button type="button" onClick={() => setShowForm(!showForm)} className="text-[10px] uppercase font-bold text-white/40 hover:text-white bg-white/5 px-2 py-1 rounded">
          {showForm ? 'Preview' : 'Edit FAQs'}
        </button>
      </div>

      {showForm ? (
        <div className="space-y-4 text-left font-sans text-xs text-white">
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-2 relative">
                <button type="button" onClick={() => deleteFaq(idx)} className="absolute top-2 right-2 text-rose-400 p-1 hover:bg-white/5 rounded">
                  <Trash2 size={13} />
                </button>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-white/40">Question #${idx + 1}</label>
                  <input type="text" value={faq.question} onChange={(e) => handleFaqChange(idx, 'question', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-white/40">Answer</label>
                  <textarea value={faq.answer} onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white text-xs h-16 resize-none" />
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addFaq} className="bg-white/5 hover:bg-white/10 text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-1">
            <Plus size={11} /> Add FAQ Question
          </button>
        </div>
      ) : (
        <div className="space-y-2 text-left text-xs">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/5">
              <strong className="text-white block">Q: {faq.question}</strong>
              <span className="text-white/60 block mt-1">A: {faq.answer}</span>
            </div>
          ))}
        </div>
      )}
    </NodeViewWrapper>
  );
}

// ==========================================
// 8. INFO BOX (Success, Info, Warning, Tip, Note)
// ==========================================
export const InfoBoxNode = TiptapNode.create({
  name: 'infoBox',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      type: { default: 'info' }, // success | info | warning | tip | note
      content: { default: 'A critical advisory parameter has been configured cloud-side.' }
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="info-box"]' }];
  },

  renderHTML({ node }) {
    const attrs = node.attrs;
    let border = 'border-l-blue-500 bg-blue-500/5 text-blue-200';
    let icon = 'ℹ';
    let label = 'INFORMATION';

    if (attrs.type === 'success') {
      border = 'border-l-emerald-500 bg-emerald-500/5 text-emerald-200';
      icon = '✔';
      label = 'SUCCESS INTELLIGENCE';
    } else if (attrs.type === 'warning') {
      border = 'border-l-amber-500 bg-amber-500/5 text-amber-200';
      icon = '⚠';
      label = 'CRITICAL ADVISORY';
    } else if (attrs.type === 'tip') {
      border = 'border-l-[#C5A059] bg-[#C5A059]/5 text-amber-100';
      icon = '✦';
      label = 'PRO-TIP BRIEFING';
    } else if (attrs.type === 'note') {
      border = 'border-l-neutral-500 bg-neutral-500/5 text-neutral-300';
      icon = '✏';
      label = 'EDITORIAL NOTE';
    }

    const htmlString = `
      <div class="not-prose border-l-4 p-5 rounded-r-2xl my-8 flex gap-4 ${border} text-left font-sans" style="border-top-right-radius: 12px; border-bottom-right-radius: 12px;">
        <span class="text-lg shrink-0 mt-0.5">${icon}</span>
        <div class="space-y-1">
          <span class="text-[9px] uppercase font-extrabold tracking-widest opacity-60 block">${label}</span>
          <p class="text-xs text-white/95 leading-relaxed font-sans">${attrs.content}</p>
        </div>
      </div>
    `;

    return ['div', { 
      'data-type': 'info-box',
      class: 'tiptap-custom-block'
    }, ['div', { dangerouslySetInnerHTML: htmlString }]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InfoBoxEditorView);
  }
});

function InfoBoxEditorView({ node, updateAttributes }: any) {
  const [showForm, setShowForm] = useState(false);
  const handleField = (key: string, val: string) => updateAttributes({ [key]: val });

  return (
    <NodeViewWrapper className="border border-dashed border-white/10 hover:border-blue-500/30 p-4 rounded-2xl transition-all bg-white/[0.01]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono uppercase font-black tracking-widest text-[#C5A059] flex items-center gap-1.5">
          <Info size={12} /> Adaptive Advisory Box
        </span>
        <button type="button" onClick={() => setShowForm(!showForm)} className="text-[10px] uppercase font-bold text-white/40 hover:text-white bg-white/5 px-2 py-1 rounded">
          {showForm ? 'Preview' : 'Edit content'}
        </button>
      </div>

      {showForm ? (
        <div className="space-y-3 text-left font-sans text-xs text-white">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Box style</label>
              <select value={node.attrs.type} onChange={(e) => handleField('type', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 h-9 rounded text-white">
                <option value="info">Information (Blue)</option>
                <option value="success">Success (Green)</option>
                <option value="warning">Warning (Yellow)</option>
                <option value="tip">Pro-Tip (Gold)</option>
                <option value="note">Note (Slate)</option>
              </select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-[9px] uppercase font-bold text-white/40 block">Advisory content</label>
              <textarea value={node.attrs.content} onChange={(e) => handleField('content', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white h-16 resize-none" />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-left text-xs text-white/80">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#C5A059]">{node.attrs.type} Box</span>
          <p className="mt-1">{node.attrs.content}</p>
        </div>
      )}
    </NodeViewWrapper>
  );
}

// ==========================================
// 9. PULL QUOTES BLOCK
// ==========================================
export const PullQuoteNode = TiptapNode.create({
  name: 'pullQuote',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      text: { default: 'Technology benchmarks are not designed to be comfortable. They represent precise factual coordinates of architectural engineering supremacy.' },
      author: { default: 'Amaan Real-Estate Compliance Team' }
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="pull-quote"]' }];
  },

  renderHTML({ node }) {
    const attrs = node.attrs;
    const htmlString = `
      <div class="not-prose relative p-8 my-10 border-l-4 border-[#C5A059] bg-white/[0.02] rounded-r-3xl text-left" style="border-top-right-radius: 16px; border-bottom-right-radius: 16px;">
        <span class="absolute top-4 right-6 text-7xl text-[#C5A059]/10 font-serif leading-none select-none pointer-events-none">“</span>
        <div class="space-y-3">
          <p class="text-lg font-serif italic text-white/95 leading-relaxed">"${attrs.text}"</p>
          ${attrs.author ? `<span class="text-[10px] uppercase font-mono tracking-widest text-[#C5A059] block">— ${attrs.author}</span>` : ''}
        </div>
      </div>
    `;

    return ['div', { 
      'data-type': 'pull-quote',
      class: 'tiptap-custom-block'
    }, ['div', { dangerouslySetInnerHTML: htmlString }]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PullQuoteEditorView);
  }
});

function PullQuoteEditorView({ node, updateAttributes }: any) {
  const [showForm, setShowForm] = useState(false);
  const handleField = (key: string, val: string) => updateAttributes({ [key]: val });

  return (
    <NodeViewWrapper className="border border-dashed border-white/10 hover:border-[#C5A059]/30 p-4 rounded-2xl transition-all bg-white/[0.01]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono uppercase font-black tracking-widest text-[#C5A059] flex items-center gap-1.5">
          ✦ Premium Pull Quote Box
        </span>
        <button type="button" onClick={() => setShowForm(!showForm)} className="text-[10px] uppercase font-bold text-white/40 hover:text-white bg-white/5 px-2 py-1 rounded">
          {showForm ? 'Preview' : 'Edit Quote'}
        </button>
      </div>

      {showForm ? (
        <div className="space-y-3 text-left font-sans text-xs text-white">
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-bold text-white/40 block">Quote Text</label>
            <textarea value={node.attrs.text} onChange={(e) => handleField('text', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white h-16 resize-none font-serif italic" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-bold text-white/40 block">Author / Source</label>
            <input type="text" value={node.attrs.author} onChange={(e) => handleField('author', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
          </div>
        </div>
      ) : (
        <div className="border-l-2 border-[#C5A059] pl-4 text-left italic text-white/90">
          <p className="font-serif">"{node.attrs.text}"</p>
          <span className="text-[10px] uppercase text-[#C5A059] block mt-1">— {node.attrs.author}</span>
        </div>
      )}
    </NodeViewWrapper>
  );
}

// ==========================================
// 10. IMAGE GALLERY
// ==========================================
export const ImageGalleryNode = TiptapNode.create({
  name: 'imageGallery',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      imagesCsv: { default: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80,https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80' },
      layout: { default: 'grid' } // grid | list
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-gallery"]' }];
  },

  renderHTML({ node }) {
    const images = node.attrs.imagesCsv.split(',').filter(Boolean);

    const htmlString = `
      <div class="not-prose my-10 text-white text-left font-sans">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${images.map((img, idx) => `
            <div class="rounded-2xl overflow-hidden border border-white/5 aspect-video bg-neutral-900 group relative cursor-zoom-in" style="border-radius: 16px;">
              <img src="${img}" alt="Gallery item ${idx + 1}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span class="text-xs font-mono border border-white/20 bg-black/80 px-3 py-1.5 rounded-full uppercase tracking-wider">Expand Exhibit 🔍</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    return ['div', { 
      'data-type': 'image-gallery',
      class: 'tiptap-custom-block'
    }, ['div', { dangerouslySetInnerHTML: htmlString }]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageGalleryEditorView);
  }
});

function ImageGalleryEditorView({ node, updateAttributes }: any) {
  const [showForm, setShowForm] = useState(false);
  const images = node.attrs.imagesCsv.split(',').filter(Boolean);

  const handleImagesChange = (val: string) => {
    updateAttributes({ imagesCsv: val });
  };

  return (
    <NodeViewWrapper className="border border-dashed border-white/10 hover:border-[#C5A059]/30 p-4 rounded-2xl transition-all bg-white/[0.01]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono uppercase font-black tracking-widest text-[#C5A059] flex items-center gap-1.5">
          ✦ Premium Multi-Image Gallery
        </span>
        <button type="button" onClick={() => setShowForm(!showForm)} className="text-[10px] uppercase font-bold text-white/40 hover:text-white bg-white/5 px-2 py-1 rounded">
          {showForm ? 'Preview' : 'Edit Gallery'}
        </button>
      </div>

      {showForm ? (
        <div className="space-y-3 text-left font-sans text-xs text-white">
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-bold text-white/40 block">Gallery Images (Comma-separated URLs)</label>
            <textarea value={node.attrs.imagesCsv} onChange={(e) => handleImagesChange(e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 rounded text-white h-20 resize-none font-mono text-[10px] leading-relaxed" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 text-left">
          {images.map((img: string, i: number) => (
            <img key={i} src={img} alt="" className="rounded-lg h-16 w-full object-cover bg-neutral-900 border border-white/5" />
          ))}
        </div>
      )}
    </NodeViewWrapper>
  );
}

// ==========================================
// 11. EMBEDDED VIDEOS (YouTube, Vimeo, MP4)
// ==========================================
export const EmbeddedVideoNode = TiptapNode.create({
  name: 'embeddedVideo',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      url: { default: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="embedded-video"]' }];
  },

  renderHTML({ node }) {
    const rawUrl = node.attrs.url;
    let embedUrl = rawUrl;
    let isDirectVideo = false;

    if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
      let videoId = '';
      if (rawUrl.includes('v=')) {
        videoId = rawUrl.split('v=')[1]?.split('&')[0];
      } else {
        videoId = rawUrl.split('/').pop() || '';
      }
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (rawUrl.includes('vimeo.com')) {
      const videoId = rawUrl.split('/').pop();
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    } else if (rawUrl.endsWith('.mp4') || rawUrl.endsWith('.webm') || rawUrl.includes('/api/')) {
      isDirectVideo = true;
    }

    const htmlString = `
      <div class="not-prose my-10 text-white rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-black relative" style="border-radius: 24px;">
        <div class="aspect-video w-full flex items-center justify-center">
          ${isDirectVideo ? `
            <video src="${rawUrl}" controls class="w-full h-full object-cover" style="border-radius: 24px;"></video>
          ` : `
            <iframe src="${embedUrl}" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 24px; width: 100%; height: 100%; aspect-ratio: 16/9;"></iframe>
          `}
        </div>
      </div>
    `;

    return ['div', { 
      'data-type': 'embedded-video',
      class: 'tiptap-custom-block'
    }, ['div', { dangerouslySetInnerHTML: htmlString }]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbeddedVideoEditorView);
  }
});

function EmbeddedVideoEditorView({ node, updateAttributes }: any) {
  const [showForm, setShowForm] = useState(false);
  const handleField = (key: string, val: string) => updateAttributes({ [key]: val });

  return (
    <NodeViewWrapper className="border border-dashed border-white/10 hover:border-[#C5A059]/30 p-4 rounded-2xl transition-all bg-white/[0.01]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono uppercase font-black tracking-widest text-[#C5A059] flex items-center gap-1.5">
          ✦ Premium Embedded Video Player
        </span>
        <button type="button" onClick={() => setShowForm(!showForm)} className="text-[10px] uppercase font-bold text-white/40 hover:text-white bg-white/5 px-2 py-1 rounded">
          {showForm ? 'Preview' : 'Edit Stream'}
        </button>
      </div>

      {showForm ? (
        <div className="space-y-3 text-left font-sans text-xs text-white">
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-bold text-white/40 block">Video Stream URL (YouTube, Vimeo, MP4 Direct Link)</label>
            <input type="text" value={node.attrs.url} onChange={(e) => handleField('url', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white font-mono text-[11px]" />
          </div>
        </div>
      ) : (
        <div className="aspect-video w-full max-w-sm mx-auto bg-black border border-white/10 rounded-xl flex flex-col items-center justify-center text-white/50 space-y-2">
          <Play size={32} className="text-[#C5A059]" />
          <span className="text-[10px] font-mono uppercase tracking-wider">Video Embedded: {node.attrs.url.substring(0, 30)}...</span>
        </div>
      )}
    </NodeViewWrapper>
  );
}

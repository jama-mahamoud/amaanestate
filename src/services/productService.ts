import { reviewService, EditorialReview } from './reviewService';
import { techGearService, TechGearProduct } from './techGearService';
import { softwareToolsService, SoftwareTool } from './softwareToolsService';
import { cacheStore } from './cacheStore';

export interface UnifiedProduct {
  id: string;
  sourceId: string;
  type: 'tech-gear' | 'software' | 'editorial-review';
  brandName: string;
  title: string;
  description: string;
  featuredImage: string;
  galleryImages: string[];
  price: string;
  originalPrice?: string;
  discountPrice?: string;
  discountPercent?: number;
  rating: number;
  category: string;
  specs: { name: string; value: string }[];
  keyFeatures: string[];
  pros: string[];
  cons: string[];
  affiliateUrl: string;
  slug?: string;
  faqs?: { question: string; answer: string }[];
  buyingAdvice?: string;
  editorialRecommendation?: string;
  compatibility?: string[];
  availability?: string;

  // Affiliate & CMS fields
  affiliateCommissionType?: string;
  affiliateNetwork?: string;
  commissionRate?: string;
  cookieDuration?: string;
  pricingTier?: string;
  freeTrialAvailable?: string;
  bestFor?: string;
  alternativeProducts?: string[];
  officialWebsite?: string;

  // New Upgraded Tech Gear Specific Fields
  productType?: string;
  subCategory?: string;
  releaseYear?: string | number;
  officialProductUrl?: string;
  reviewStatus?: string;
  editorRating?: number;
  reviewSummary?: string;
  fullReviewUrl?: string;
  featuredReview?: boolean;
  overallScore?: number;
  performanceScore?: number;
  designScore?: number;
  batteryScore?: number;
  cameraScore?: number;
  valueScore?: number;
  specDisplay?: string;
  specProcessor?: string;
  specRam?: string;
  specStorage?: string;
  specCamera?: string;
  specBattery?: string;
  specOs?: string;
  specConnectivity?: string;
  specAiFeatures?: string;
  specWeight?: string;
  specDimensions?: string;
  specWarranty?: string;
  retailOffers?: {
    retailerName: string;
    affiliateUrl: string;
    price: string;
    discount?: string;
    availability?: string;
    ctaText?: string;
  }[];
  compareWithIds?: string[];
  productImages?: string[];
  lifestyleImages?: string[];
  videoReviewUrl?: string;
  product360ViewUrl?: string;
  focusKeyword?: string;
  schemaType?: string;
}

// Helpers to format prices
function parsePrice(pStr: string | undefined): number {
  if (!pStr) return 0;
  const num = parseFloat(pStr.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

export const productService = {
  async getUnifiedProducts(force = false, limitCount?: number): Promise<UnifiedProduct[]> {
    if (!force && !limitCount) {
      const cached = cacheStore.get('unified_products', 30000);
      if (cached) return cached;
    }

    try {
      // 1. Fetch Editorial Reviews
      const reviews = await reviewService.getAllReviews(true, limitCount);
      
      // 2. Fetch Tech Gear Products
      let techGear: TechGearProduct[] = [];
      try {
        techGear = await techGearService.getAllProducts(true, limitCount);
      } catch (e) {
        console.error('Failed to load tech gear in product service:', e);
      }

      // 3. Fetch Software Tools
      let software: SoftwareTool[] = [];
      try {
        software = await softwareToolsService.getAllSoftware(true, limitCount);
      } catch (e) {
        console.error('Failed to load software in product service:', e);
      }

      const unified: UnifiedProduct[] = [];

      // Map reviews as high-premium catalog products
      reviews.forEach(r => {
        const hasDiscount = !!r.discountPrice;
        let priceVal = r.price || '';
        let discountVal = r.discountPrice || undefined;

        unified.push({
          id: `rev-${r.id}`,
          sourceId: r.id,
          type: 'editorial-review',
          brandName: r.brandName || 'Verified Brand',
          title: r.title,
          description: r.excerpt || r.introduction || '',
          featuredImage: r.featuredImage,
          galleryImages: r.gallery && r.gallery.length > 0
            ? [r.featuredImage, ...r.gallery.map(g => g.url || g.imageUrl || '').filter(Boolean)]
            : [r.featuredImage],
          price: discountVal || priceVal || 'Free / Demo',
          originalPrice: hasDiscount ? priceVal : undefined,
          discountPrice: discountVal,
          discountPercent: hasDiscount ? Math.round(((parsePrice(priceVal) - parsePrice(discountVal)) / (parsePrice(priceVal) || 1)) * 100) : undefined,
          rating: r.rating || 4.5,
          category: r.category || 'Platform',
          specs: r.comparisonTable?.rows?.map(row => ({ name: row.featureName, value: row.thisBrandValue })) || [
            { name: 'Model Type', value: 'Enterprise Platform' },
            { name: 'Deploy Time', value: 'Instant Cloud' },
            { name: 'Integration', value: 'REST API' }
          ],
          keyFeatures: r.keyFeatures || [],
          pros: r.pros || ['Highly verified security', 'Excellent custom options', 'Premium publisher interface'],
          cons: r.cons || ['Requires modern network setup', 'Premium pricing tiers'],
          affiliateUrl: r.affiliateUrl || '#',
          slug: r.slug,
          faqs: r.faqs?.map(f => ({ question: f.question, answer: f.answer })) || [],
          buyingAdvice: r.bestFor || 'Highly recommended for enterprise pipelines, tech-focused organizations, and professional teams looking for integrated utility.',
          editorialRecommendation: r.finalVerdict || 'A highly recommended solution showing absolute market leadership in technical audit metrics.',
          compatibility: ['Cloud Server Core', 'Web Browser Integration', 'Mobile Sync API'],
          availability: 'In Stock'
        });
      });

      // Map Tech Gear Products
      techGear.forEach(tg => {
        // Build specs list dynamically combining specific spec fields and custom spec list
        const specsList: { name: string; value: string }[] = [];
        if (tg.model) specsList.push({ name: 'Model', value: tg.model });
        if (tg.specDisplay) specsList.push({ name: 'Display', value: tg.specDisplay });
        if (tg.specProcessor) specsList.push({ name: 'Processor', value: tg.specProcessor });
        if (tg.specRam) specsList.push({ name: 'RAM', value: tg.specRam });
        if (tg.specStorage) specsList.push({ name: 'Storage', value: tg.specStorage });
        if (tg.specCamera) specsList.push({ name: 'Camera', value: tg.specCamera });
        if (tg.specBattery || tg.battery) specsList.push({ name: 'Battery', value: tg.specBattery || tg.battery || '' });
        if (tg.specOs) specsList.push({ name: 'Operating System', value: tg.specOs });
        if (tg.specConnectivity) specsList.push({ name: 'Connectivity', value: tg.specConnectivity });
        if (tg.specAiFeatures) specsList.push({ name: 'AI Features', value: tg.specAiFeatures });
        if (tg.specWeight || tg.weight) specsList.push({ name: 'Weight', value: tg.specWeight || tg.weight || '' });
        if (tg.specDimensions || tg.dimensions) specsList.push({ name: 'Dimensions', value: tg.specDimensions || tg.dimensions || '' });
        if (tg.specWarranty || tg.warranty) specsList.push({ name: 'Warranty', value: tg.specWarranty || tg.warranty || '' });

        if (tg.specs && tg.specs.length > 0) {
          tg.specs.forEach(s => {
            if (!specsList.some(item => item.name.toLowerCase() === s.name.toLowerCase())) {
              specsList.push(s);
            }
          });
        }

        if (specsList.length === 0) {
          specsList.push(
            { name: 'Model', value: tg.model || 'Standard' },
            { name: 'Warranty', value: tg.warranty || '1-Year Limited' },
            { name: 'Weight', value: tg.weight || 'N/A' }
          );
        }

        unified.push({
          id: `tg-${tg.id}`,
          sourceId: tg.id,
          type: 'tech-gear',
          brandName: tg.brandName || 'Hardware Manufacturer',
          title: tg.title,
          description: tg.description || '',
          featuredImage: tg.featuredImage,
          galleryImages: tg.galleryImages && tg.galleryImages.length > 0
            ? [tg.featuredImage, ...tg.galleryImages]
            : [tg.featuredImage],
          price: `$${tg.price}`,
          originalPrice: tg.price > 0 ? `$${Math.round(tg.price * 1.15)}` : undefined,
          discountPrice: `$${tg.price}`,
          discountPercent: 13,
          rating: tg.editorRating || 4.8,
          category: tg.category || 'Hardware',
          specs: specsList,
          keyFeatures: [
            'Premium tactile quality build',
            'Engineered for long-lasting heavy workloads',
            'Sleek modern minimalist aesthetics'
          ],
          pros: tg.pros && tg.pros.length > 0 ? tg.pros : ['Durable housing frame', 'High rating standards', 'Industry-proven design'],
          cons: tg.cons && tg.cons.length > 0 ? tg.cons : ['Premium price', 'Requires minor workspace adjustment'],
          affiliateUrl: tg.affiliateUrl || '#',
          slug: tg.slug || tg.id,
          faqs: [
            { question: 'Is this item compatible with standard workflows?', answer: 'Yes, it works out of the box with standard desktop and modern environments.' },
            { question: 'Does it come with a manufacture warranty?', answer: 'Yes, it includes a comprehensive 1-year parts and labor warranty.' }
          ],
          buyingAdvice: tg.reviewSummary || 'The build quality and ergonomics make this a prime addition for professional workflows. Highly recommended.',
          editorialRecommendation: tg.reviewSummary || 'A certified technical asset providing excellent daily ergonomics and long-term utility.',
          compatibility: ['Standard Desktop PCs', 'VESA Mounting Sockets', 'USB-C Interfaces'],
          availability: tg.status === 'approved' ? 'In Stock' : 'Testing Mode',
          bestFor: tg.bestFor || 'Creators & Professionals',

          // Upgraded mapping values
          productType: tg.productType,
          subCategory: tg.subCategory,
          releaseYear: tg.releaseYear,
          officialProductUrl: tg.officialProductUrl,
          reviewStatus: tg.reviewStatus,
          editorRating: tg.editorRating,
          reviewSummary: tg.reviewSummary,
          fullReviewUrl: tg.fullReviewUrl,
          featuredReview: tg.featuredReview,
          overallScore: tg.overallScore,
          performanceScore: tg.performanceScore,
          designScore: tg.designScore,
          batteryScore: tg.batteryScore,
          cameraScore: tg.cameraScore,
          valueScore: tg.valueScore,
          specDisplay: tg.specDisplay,
          specProcessor: tg.specProcessor,
          specRam: tg.specRam,
          specStorage: tg.specStorage,
          specCamera: tg.specCamera,
          specBattery: tg.specBattery,
          specOs: tg.specOs,
          specConnectivity: tg.specConnectivity,
          specAiFeatures: tg.specAiFeatures,
          specWeight: tg.specWeight,
          specDimensions: tg.specDimensions,
          specWarranty: tg.specWarranty,
          retailOffers: tg.retailOffers,
          compareWithIds: tg.compareWithIds,
          productImages: tg.productImages,
          lifestyleImages: tg.lifestyleImages,
          videoReviewUrl: tg.videoReviewUrl,
          product360ViewUrl: tg.product360ViewUrl,
          focusKeyword: tg.focusKeyword,
          schemaType: tg.schemaType,
        });
      });

      // Map Software Tools
      software.forEach(sw => {
        // Dynamic advice matching the category
        const displayCategory = sw.category ? sw.category.replace(/-/g, ' ') : 'software';
        const dynamicAdvice = `When selecting a tool in the ${displayCategory} category, consider integration with your existing pipeline, ease of onboarding, and pricing scalability. This platform represents a highly efficient choice for streamlining your digital workflows.`;
        const dynamicRecommendation = `Our editorial team evaluated this ${displayCategory} based on usability, performance, and long-term cost efficiency. It stands out as a leading solution for modern digital operations.`;

        unified.push({
          id: `sw-${sw.id}`,
          sourceId: sw.id,
          type: 'software',
          brandName: sw.developer || 'Software Developer',
          title: sw.name,
          description: sw.shortDescription || sw.fullDescription || '',
          featuredImage: sw.featuredImage || sw.logoUrl || '',
          galleryImages: sw.galleryImages && sw.galleryImages.length > 0
            ? [sw.featuredImage || sw.logoUrl, ...sw.galleryImages]
            : [sw.featuredImage || sw.logoUrl].filter(Boolean) as string[],
          price: sw.pricing || '$0 / Freemium',
          originalPrice: sw.pricing.includes('$') ? `$${Math.round(parsePrice(sw.pricing) * 1.25)}` : undefined,
          discountPrice: sw.pricing,
          discountPercent: sw.pricing.includes('$') ? 20 : undefined,
          rating: 4.6,
          category: sw.category || 'Software Utility',
          specs: [
            { name: 'Developer', value: sw.developer || 'Unknown' },
            { name: 'Platform Support', value: sw.platform || 'Cross-Platform Web' },
            { name: 'License Type', value: sw.pricing || 'Commercial' },
            ...(sw.pricingTier ? [{ name: 'Pricing Tier', value: sw.pricingTier }] : []),
            ...(sw.freeTrialAvailable ? [{ name: 'Free Trial', value: sw.freeTrialAvailable }] : []),
            ...(sw.affiliateNetwork ? [{ name: 'Affiliate Network', value: sw.affiliateNetwork }] : []),
            ...(sw.cookieDuration ? [{ name: 'Cookie Duration', value: sw.cookieDuration }] : [])
          ],
          keyFeatures: sw.features && sw.features.length > 0 ? sw.features : ['Intelligent cloud synchronization', 'Advanced data exports', 'Secure tokenized backend'],
          pros: sw.pros && sw.pros.length > 0 ? sw.pros : ['Easy onboarding', 'Comprehensive reporting suite', 'Low memory usage'],
          cons: sw.cons && sw.cons.length > 0 ? sw.cons : ['Advanced filters require subscription tier'],
          affiliateUrl: sw.affiliateUrl || '#',
          slug: sw.slug || (sw.name ? sw.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '') : undefined),
          faqs: [
            { question: `Is training required to use this ${displayCategory}?`, answer: `No, this ${displayCategory} features an intuitive visual wizard interface built for self-guided onboarding.` },
            { question: 'Are secure data backups supported?', answer: 'Yes, full compliance encryption and secure routine backups are managed cloud-side.' }
          ],
          buyingAdvice: dynamicAdvice,
          editorialRecommendation: dynamicRecommendation,
          compatibility: [sw.platform || 'Cross-Platform Web', 'Windows 11', 'macOS Sonoma', 'iOS & Android WebApp'],
          availability: sw.freeTrialAvailable && sw.freeTrialAvailable.toLowerCase() !== 'no' ? 'Free Trial Available' : 'Instant Access',

          // Affiliate & CMS fields
          affiliateCommissionType: sw.affiliateCommissionType,
          affiliateNetwork: sw.affiliateNetwork,
          commissionRate: sw.commissionRate,
          cookieDuration: sw.cookieDuration,
          pricingTier: sw.pricingTier,
          freeTrialAvailable: sw.freeTrialAvailable,
          bestFor: sw.bestFor,
          alternativeProducts: sw.alternativeProducts,
          officialWebsite: sw.officialWebsite
        });
      });

      if (!limitCount) {
        cacheStore.set('unified_products', unified);
      }
      return unified;
    } catch (e) {
      console.error('Error unifying products:', e);
      return [];
    }
  },

  async getUnifiedProductById(id: string): Promise<UnifiedProduct | null> {
    const all = await this.getUnifiedProducts();
    return all.find(p => p.id === id || p.slug === id) || null;
  }
};

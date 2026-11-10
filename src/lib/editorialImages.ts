import heroArchImg from '../assets/images/hero_editorial_architecture_1794324251737.jpg';
import investmentSkylineImg from '../assets/images/cat_investment_skyline_1794324251830.jpg';
import architecturePavilionImg from '../assets/images/cat_architecture_pavilion_1794324253046.jpg';
import constructionTimberImg from '../assets/images/cat_construction_timber_1794324253305.jpg';
import homeLivingImg from '../assets/images/cat_home_living_interior_1794324253628.jpg';
import globalNewsImg from '../assets/images/cat_global_urban_news_1794324254772.jpg';
import authorPortraitImg from '../assets/images/author_editorial_portrait_1794324253936.jpg';

export const EDITORIAL_IMAGE_MAP: Record<string, string> = {
  'hero-pavilion': heroArchImg,
  'investment-skyline': investmentSkylineImg,
  'architecture-pavilion': architecturePavilionImg,
  'construction-timber': constructionTimberImg,
  'home-living': homeLivingImg,
  'global-news': globalNewsImg,
  'author-portrait': authorPortraitImg,
};

export function resolveEditorialImage(src?: string | null, fallbackKey = 'hero-pavilion'): string {
  if (!src) {
    return EDITORIAL_IMAGE_MAP[fallbackKey] || heroArchImg;
  }
  if (EDITORIAL_IMAGE_MAP[src]) {
    return EDITORIAL_IMAGE_MAP[src];
  }
  return src;
}

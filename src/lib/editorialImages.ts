import heroArchImg from '../assets/images/hero_editorial_architecture_1794324251737.jpg';
import investmentSkylineImg from '../assets/images/cat_investment_skyline_1794324251830.jpg';
import architecturePavilionImg from '../assets/images/cat_architecture_pavilion_1794324253046.jpg';
import constructionTimberImg from '../assets/images/cat_construction_timber_1794324253305.jpg';
import homeLivingImg from '../assets/images/cat_home_living_interior_1794324253628.jpg';
import globalNewsImg from '../assets/images/cat_global_urban_news_1794324254772.jpg';
import authorPortraitImg from '../assets/images/author_editorial_portrait_1794324253936.jpg';

// 25 Unique 16:9 Editorial Article Cover Images
import invSovereignLogisticsImg from '../assets/images/inv_sovereign_logistics_hub_1794332853299.jpg';
import invFinancialReitsImg from '../assets/images/inv_financial_district_reits_1794332853386.jpg';
import invBuildToRentImg from '../assets/images/inv_build_to_rent_apartments_1794332854135.jpg';
import invDataCenterImg from '../assets/images/inv_data_center_campus_1794332853526.jpg';
import invMixedUseRetrofitImg from '../assets/images/inv_mixed_use_retrofit_1794332855018.jpg';

import archTravertinePavilionImg from '../assets/images/arch_travertine_civic_pavilion_1794332870130.jpg';
import archSiloReuseImg from '../assets/images/arch_silo_adaptive_reuse_1794332870190.jpg';
import archBiophilicTowerImg from '../assets/images/arch_biophilic_timber_tower_1794332870007.jpg';
import archRammedEarthImg from '../assets/images/arch_rammed_earth_desert_1794332870947.jpg';
import archCoastalSpongeImg from '../assets/images/arch_coastal_pedestrian_district_1794332872932.jpg';

import consMassTimberImg from '../assets/images/cons_hybrid_mass_timber_1794332873197.jpg';
import consLowCarbonConcreteImg from '../assets/images/cons_low_carbon_concrete_1794332872793.jpg';
import consModularPrefabImg from '../assets/images/cons_modular_prefab_factory_1794332873730.jpg';
import consFacadeOvercladImg from '../assets/images/cons_facade_overclad_retrofit_1794332874373.jpg';
import consDigitalTwinImg from '../assets/images/cons_digital_twin_robotics_1794332874014.jpg';

import homeCourtyardPlasterImg from '../assets/images/home_courtyard_lime_plaster_1794332889959.jpg';
import homeSolarBatteryImg from '../assets/images/home_solar_battery_heatpump_1794332890923.jpg';
import homeCompactJoineryImg from '../assets/images/home_compact_urban_joinery_1794332889980.jpg';
import homeCircadianLightingImg from '../assets/images/home_circadian_lighting_living_1794332890989.jpg';
import homeHeritageTownhouseImg from '../assets/images/home_heritage_townhouse_retrofit_1794332892104.jpg';

import newsEuEpbdImg from '../assets/images/news_eu_epbd_retrofit_1794332891920.jpg';
import newsUkPlanningImg from '../assets/images/news_uk_transit_housing_1794332892473.jpg';
import newsSingaporeUraImg from '../assets/images/news_singapore_urban_masterplan_1794332891919.jpg';
import newsDubaiStrategyImg from '../assets/images/news_dubai_urban_corridor_1794332893956.jpg';
import newsEuCprImg from '../assets/images/news_eu_materials_traceability_1794332894892.jpg';

export const EDITORIAL_IMAGE_MAP: Record<string, string> = {
  'hero-pavilion': heroArchImg,
  'investment-skyline': investmentSkylineImg,
  'architecture-pavilion': architecturePavilionImg,
  'construction-timber': constructionTimberImg,
  'home-living': homeLivingImg,
  'global-news': globalNewsImg,
  'author-portrait': authorPortraitImg,

  '/images/articles/sovereign-capital-logistics-corridors.jpg': invSovereignLogisticsImg,
  '/images/articles/reit-debt-maturities-balance-sheets.jpg': invFinancialReitsImg,
  '/images/articles/build-to-rent-multifamily-underwriting.jpg': invBuildToRentImg,
  '/images/articles/data-center-power-land-real-estate.jpg': invDataCenterImg,
  '/images/articles/brown-discount-commercial-retrofit-yields.jpg': invMixedUseRetrofitImg,

  '/images/articles/travertine-climate-responsive-pavilions.jpg': archTravertinePavilionImg,
  '/images/articles/adaptive-reuse-industrial-silos.jpg': archSiloReuseImg,
  '/images/articles/biophilic-high-rise-sky-gardens.jpg': archBiophilicTowerImg,
  '/images/articles/rammed-earth-arid-climate-architecture.jpg': archRammedEarthImg,
  '/images/articles/sponge-city-coastal-urban-design.jpg': archCoastalSpongeImg,

  '/images/articles/hybrid-mass-timber-seismic-engineering.jpg': consMassTimberImg,
  '/images/articles/geopolymer-low-carbon-concrete-trials.jpg': consLowCarbonConcreteImg,
  '/images/articles/volumetric-modular-prefabrication-economics.jpg': consModularPrefabImg,
  '/images/articles/prefabricated-facade-overcladding-retrofits.jpg': consFacadeOvercladImg,
  '/images/articles/digital-twin-lidar-construction-productivity.jpg': consDigitalTwinImg,

  '/images/articles/courtyard-residences-tactile-lime-plaster.jpg': homeCourtyardPlasterImg,
  '/images/articles/home-battery-microgrids-heat-pump-roi.jpg': homeSolarBatteryImg,
  '/images/articles/small-space-urban-apartment-joinery.jpg': homeCompactJoineryImg,
  '/images/articles/circadian-lighting-acoustic-home-design.jpg': homeCircadianLightingImg,
  '/images/articles/deep-energy-heritage-townhouse-retrofit.jpg': homeHeritageTownhouseImg,

  '/images/articles/eu-epbd-commercial-retrofit-mandate.jpg': newsEuEpbdImg,
  '/images/articles/uk-planning-infrastructure-act-housing-reform.jpg': newsUkPlanningImg,
  '/images/articles/singapore-ura-master-plan-housing-supply.jpg': newsSingaporeUraImg,
  '/images/articles/dubai-real-estate-strategy-2033-dld.jpg': newsDubaiStrategyImg,
  '/images/articles/eu-construction-products-regulation-dpp.jpg': newsEuCprImg,
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

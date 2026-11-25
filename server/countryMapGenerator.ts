import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import countries from "i18n-iso-countries";
import * as d3Geo from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon } from "geojson";

const MAP_WIDTH = 640;
const MAP_HEIGHT = 400;
const MAP_PAD_X = 76;
const MAP_PAD_Y = 44;

const MEMORY_SVG_CACHE = new Map<string, string>();
const DISK_CACHE_DIR = path.join(os.tmpdir(), "amaanestate-country-maps-v3");

let cachedHighResFeatures: Feature<Geometry>[] | null = null;
let cachedContextFeatures: Feature<Geometry>[] | null = null;

function resolveAtlasFile(filename: string): string | null {
  const cwdCandidate = path.join(process.cwd(), "node_modules", "world-atlas", filename);
  if (fs.existsSync(cwdCandidate)) {
    return cwdCandidate;
  }
  if (typeof require === "function") {
    try {
      return require.resolve(`world-atlas/${filename}`);
    } catch {
      return null;
    }
  }
  return null;
}

function loadTopologyFeatures(filename: string): Feature<Geometry>[] {
  const resolvedPath = resolveAtlasFile(filename);
  if (!resolvedPath) {
    throw new Error(`Natural Earth world-atlas file not found: ${filename}`);
  }
  const topology = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
  const collection = feature(
    topology,
    topology.objects.countries
  ) as unknown as FeatureCollection<Geometry>;
  return Array.isArray(collection?.features) ? collection.features : [];
}

function getHighResFeatures(): Feature<Geometry>[] {
  if (!cachedHighResFeatures) {
    cachedHighResFeatures = loadTopologyFeatures("countries-50m.json");
  }
  return cachedHighResFeatures;
}

function getContextFeatures(): Feature<Geometry>[] {
  if (!cachedContextFeatures) {
    try {
      cachedContextFeatures = loadTopologyFeatures("countries-110m.json");
    } catch {
      cachedContextFeatures = getHighResFeatures();
    }
  }
  return cachedContextFeatures;
}

function findCountryFeature(isoCode: string): Feature<Geometry> | null {
  const numericId = countries.alpha2ToNumeric(isoCode);
  if (!numericId) return null;

  const paddedTarget = String(numericId).padStart(3, "0");
  const allFeatures = getHighResFeatures();
  return (
    allFeatures.find((feat) => {
      if (feat.id === undefined || feat.id === null) return false;
      return String(feat.id).padStart(3, "0") === paddedTarget;
    }) || null
  );
}

/**
 * Keeps the primary contiguous landmass (and major nearby islands) when framing
 * countries with distant overseas territories (e.g., Metropolitan France vs. French Guiana)
 * so the main country silhouette fills the editorial 16:10 canvas clearly.
 */
function buildFramingGeometry(feat: Feature<Geometry>): Feature<Geometry> {
  const geom = feat.geometry;
  if (!geom || geom.type !== "MultiPolygon" || geom.coordinates.length <= 1) {
    return feat;
  }

  const polygons = geom.coordinates.map((coords) => {
    const polyFeat: Feature<Polygon> = {
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: coords },
    };
    return {
      coords,
      area: d3Geo.geoArea(polyFeat),
      centroid: d3Geo.geoCentroid(polyFeat),
    };
  });

  polygons.sort((a, b) => b.area - a.area);
  const largest = polygons[0];
  if (!largest || largest.area <= 0) {
    return feat;
  }

  const primaryCluster = polygons.filter((poly) => {
    const angularDist = d3Geo.geoDistance(poly.centroid, largest.centroid);
    return angularDist <= 0.85 || poly.area >= largest.area * 0.18;
  });

  if (primaryCluster.length === 0 || primaryCluster.length === polygons.length) {
    return feat;
  }

  const filteredGeom: MultiPolygon = {
    type: "MultiPolygon",
    coordinates: primaryCluster.map((p) => p.coords),
  };

  return {
    type: "Feature",
    properties: feat.properties || {},
    geometry: filteredGeom,
  };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderCountrySvg(isoCode: string): string | null {
  const targetFeature = findCountryFeature(isoCode);
  if (!targetFeature) return null;

  const framingFeature = buildFramingGeometry(targetFeature);
  const centroid = d3Geo.geoCentroid(framingFeature);
  const centerLon = Number.isFinite(centroid[0]) ? centroid[0] : 0;
  const centerLat = Number.isFinite(centroid[1]) ? centroid[1] : 0;

  // Use Natural Earth projection for very high-latitude or wide continental spans,
  // and Mercator centered on the country's longitude for crisp mid-latitude silhouettes.
  const [[west, _south], [east, north]] = d3Geo.geoBounds(framingFeature);
  const lonSpan = west <= east ? east - west : 360 - west + east;
  const useNaturalEarth = Math.abs(centerLat) > 58 || Math.abs(north) > 70 || lonSpan > 85;

  const projection = (
    useNaturalEarth ? d3Geo.geoNaturalEarth1() : d3Geo.geoMercator()
  )
    .rotate([-centerLon, 0])
    .fitExtent(
      [
        [MAP_PAD_X, MAP_PAD_Y],
        [MAP_WIDTH - MAP_PAD_X, MAP_HEIGHT - MAP_PAD_Y],
      ],
      framingFeature
    )
    .clipExtent([
      [-24, -24],
      [MAP_WIDTH + 24, MAP_HEIGHT + 24],
    ]);

  const pathGenerator = d3Geo.geoPath(projection).digits(1);
  const graticuleGenerator = d3Geo.geoGraticule().step([10, 10]);

  const graticulePath = pathGenerator(graticuleGenerator()) || "";
  const targetPath = pathGenerator(targetFeature) || "";
  if (!targetPath) return null;

  const contextFeatures = getContextFeatures();
  const targetNumericId =
    targetFeature.id !== undefined && targetFeature.id !== null
      ? String(targetFeature.id).padStart(3, "0")
      : "";

  const neighborPaths: string[] = [];
  for (const neighbor of contextFeatures) {
    const neighborId =
      neighbor.id !== undefined && neighbor.id !== null
        ? String(neighbor.id).padStart(3, "0")
        : "";
    if (targetNumericId && neighborId === targetNumericId) {
      continue;
    }
    const d = pathGenerator(neighbor);
    if (d) {
      neighborPaths.push(d);
    }
  }

  const projectedPoint = projection(centroid);
  const hasMarker =
    Array.isArray(projectedPoint) &&
    Number.isFinite(projectedPoint[0]) &&
    Number.isFinite(projectedPoint[1]) &&
    projectedPoint[0] > 16 &&
    projectedPoint[0] < MAP_WIDTH - 16 &&
    projectedPoint[1] > 16 &&
    projectedPoint[1] < MAP_HEIGHT - 16;

  const safeIso = escapeXml(isoCode);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" width="${MAP_WIDTH}" height="${MAP_HEIGHT}" role="img" aria-label="Geographic map of ${safeIso}">`,
    `<defs>`,
    `<linearGradient id="ae-map-bg-${safeIso}" x1="0%" y1="0%" x2="100%" y2="100%">`,
    `<stop offset="0%" stop-color="#142842"/>`,
    `<stop offset="50%" stop-color="#10243A"/>`,
    `<stop offset="100%" stop-color="#0A182B"/>`,
    `</linearGradient>`,
    `<linearGradient id="ae-map-country-${safeIso}" x1="0%" y1="0%" x2="100%" y2="100%">`,
    `<stop offset="0%" stop-color="#E2C17D"/>`,
    `<stop offset="100%" stop-color="#C9A45C"/>`,
    `</linearGradient>`,
    `<linearGradient id="ae-map-glow-${safeIso}" x1="0%" y1="0%" x2="0%" y2="100%">`,
    `<stop offset="0%" stop-color="#C9A45C" stop-opacity="0.35"/>`,
    `<stop offset="100%" stop-color="#C9A45C" stop-opacity="0"/>`,
    `</linearGradient>`,
    `<filter id="ae-map-shadow-${safeIso}" x="-12%" y="-12%" width="124%" height="124%">`,
    `<feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.45"/>`,
    `</filter>`,
    `<clipPath id="ae-map-clip-${safeIso}">`,
    `<rect x="0" y="0" width="${MAP_WIDTH}" height="${MAP_HEIGHT}"/>`,
    `</clipPath>`,
    `</defs>`,
    `<g clip-path="url(#ae-map-clip-${safeIso})">`,
    `<rect x="0" y="0" width="${MAP_WIDTH}" height="${MAP_HEIGHT}" fill="url(#ae-map-bg-${safeIso})"/>`,
    graticulePath
      ? `<path d="${graticulePath}" fill="none" stroke="#C9A45C" stroke-opacity="0.06" stroke-width="0.75"/>`
      : "",
    neighborPaths.length > 0
      ? `<g fill="#162D4A" stroke="#223E63" stroke-width="0.65" stroke-linejoin="round">${neighborPaths
          .map((d) => `<path d="${d}"/>`)
          .join("")}</g>`
      : "",
    `<path d="${targetPath}" fill="url(#ae-map-country-${safeIso})" stroke="#EADBBA" stroke-width="1.35" stroke-linejoin="round" stroke-linecap="round" filter="url(#ae-map-shadow-${safeIso})"/>`,
    hasMarker
      ? `<circle cx="${projectedPoint![0].toFixed(1)}" cy="${projectedPoint![1].toFixed(1)}" r="5.5" fill="#10243A" stroke="#C9A45C" stroke-width="1.75"/><circle cx="${projectedPoint![0].toFixed(1)}" cy="${projectedPoint![1].toFixed(1)}" r="2" fill="#E2C17D"/>`
      : "",
    `<rect x="0.5" y="0.5" width="${MAP_WIDTH - 1}" height="${MAP_HEIGHT - 1}" fill="none" stroke="#C9A45C" stroke-opacity="0.2"/>`,
    `</g>`,
    `</svg>`,
  ]
    .filter(Boolean)
    .join("");
}

function readDiskCachedSvg(isoCode: string): string | null {
  try {
    const filePath = path.join(DISK_CACHE_DIR, `${isoCode}.svg`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf8");
    }
  } catch {
    // Ignore disk cache read errors
  }
  return null;
}

function writeDiskCachedSvg(isoCode: string, svg: string): void {
  try {
    fs.mkdirSync(DISK_CACHE_DIR, { recursive: true });
    const filePath = path.join(DISK_CACHE_DIR, `${isoCode}.svg`);
    fs.writeFileSync(filePath, svg, "utf8");
  } catch {
    // Read-only serverless filesystems degrade gracefully to memory cache
  }
}

export function getCountryMapSvg(rawIsoCode?: string | null): string | null {
  const isoCode = (rawIsoCode || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(isoCode)) {
    return null;
  }

  const memHit = MEMORY_SVG_CACHE.get(isoCode);
  if (memHit) {
    return memHit;
  }

  const diskHit = readDiskCachedSvg(isoCode);
  if (diskHit) {
    MEMORY_SVG_CACHE.set(isoCode, diskHit);
    return diskHit;
  }

  const generated = renderCountrySvg(isoCode);
  if (!generated) {
    return null;
  }

  MEMORY_SVG_CACHE.set(isoCode, generated);
  writeDiskCachedSvg(isoCode, generated);
  return generated;
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";
import primitiveColorTokens from "@/design-system/tokens/primitives.color.json";
import primitiveMotionTokens from "@/design-system/tokens/primitives.motion.json";
import primitiveOpacityTokens from "@/design-system/tokens/primitives.opacity.json";
import primitiveRadiusTokens from "@/design-system/tokens/primitives.radius.json";
import primitiveShadowTokens from "@/design-system/tokens/primitives.shadow.json";
import primitiveSpacingTokens from "@/design-system/tokens/primitives.spacing.json";
import primitiveTypographyTokens from "@/design-system/tokens/primitives.typography.json";
import semanticColorTokensLight from "@/design-system/tokens/semantic.color.light.json";
import semanticColorTokensDark from "@/design-system/tokens/semantic.color.dark.json";
import semanticElevationTokens from "@/design-system/tokens/semantic.elevation.json";
import semanticSpacingTokens from "@/design-system/tokens/semantic.spacing.json";
import semanticTypographyTokensMobile from "@/design-system/tokens/semantic.typography.mobile.json";
import semanticTypographyTokensWeb from "@/design-system/tokens/semantic.typography.web.json";
import {
  WORKER_APP_CANVAS_NAME,
  WORKER_APP_BOITE_PAGE_NAME,
  WORKER_APP_GET_STARTED_PAGE_NAME,
  WORKER_APP_GET_STARTED_V2_PAGE_NAME,
  WORKER_APP_HOME_PAGE_NAME,
  WORKER_APP_POST_FIXE_PAGE_NAME,
  WORKER_APP_PROFILE_PAGE_NAME,
  WORKER_APP_SYNCHRONISATION_PAGE_NAME,
  WORKER_APP_TAB_NAME,
  WORKER_APP_TRAVAIL_PAGE_NAME,
} from "../worker-app/constants";
import { WorkerAppBoitePage } from "../worker-app/boite";
import { WorkerAppFullPrototypePage } from "../worker-app/full-prototype";
import { WorkerAppGetStartedPage } from "../worker-app/getstarted";
import { WorkerAppGetStartedV2Page } from "../worker-app/getstarted-v2";
import { WorkerAppHomePage } from "../worker-app/home";
import {
  PostFixePreviewState,
  SecteursFrameView,
  WorkerAppPostFixePage,
} from "../worker-app/post-fixe";
import { WorkerAppProfilePage } from "../worker-app/profile";
import { WorkerAppSynchronisationPage } from "../worker-app/synchronisation";
import { WorkerAppTravailPage } from "../worker-app/travail";

const posteFixeComponentStates = [
  {
    label: "Pas commencé · 0%",
    name: "Poste Fixe 1254",
    sector: "Secteur S1",
    startDate: "01 Mai",
    updatedDate: "21 Juil",
    completed: 0,
    total: 5,
    progress: 0,
  },
  {
    label: "En cours · 20%",
    name: "Poste Fixe 2381",
    sector: "Secteur S2",
    startDate: "05 Mai",
    updatedDate: "14 Juil",
    completed: 1,
    total: 5,
    progress: 20,
  },
  {
    label: "En cours · 40%",
    name: "Poste Fixe 7642",
    sector: "Secteur S3",
    startDate: "12 Mai",
    updatedDate: "08 Juil",
    completed: 2,
    total: 5,
    progress: 40,
  },
  {
    label: "En cours · 60%",
    name: "Poste Fixe 5097",
    sector: "Secteur S4",
    startDate: "20 Mai",
    updatedDate: "27 Juil",
    completed: 3,
    total: 5,
    progress: 60,
  },
  {
    label: "En cours · 80%",
    name: "Poste Fixe 3318",
    sector: "Secteur S5",
    startDate: "24 Mai",
    updatedDate: "02 Août",
    completed: 4,
    total: 5,
    progress: 80,
  },
  {
    label: "Terminé · 100%",
    name: "Poste Fixe 9026",
    sector: "Secteur S6",
    startDate: "28 Mai",
    updatedDate: "30 Juil",
    completed: 5,
    total: 5,
    progress: 100,
  },
] as const;

const posteFixeDetailObservationStates = [
  {
    title: "Fleuraison",
    subtitle: "Modifié le 15 Mai",
    icon: "local_florist",
    status: "Terminé",
    tone: "violet",
  },
  {
    title: "Nouaison",
    subtitle: "Modifié le 10 Juin",
    icon: "grain",
    status: "En cours",
    tone: "blue",
  },
  {
    title: "Chute physiologique",
    subtitle: "Modifié le 21 Juil",
    icon: "eco",
    status: "Pas commencé",
    tone: "orange",
  },
  {
    title: "Fertilisation",
    subtitle: "Modifié le 18 Juil",
    icon: "science",
    status: "En cours",
    tone: "teal",
  },
  {
    title: "Irrigation",
    subtitle: "Modifié le 20 Juil",
    icon: "water_drop",
    status: "Pas commencé",
    tone: "rose",
  },
] as const;

const posteFixeDetailIcons = [
  { icon: "arrow_back", name: "arrow_back", usage: "Header back" },
  { icon: "chevron_right", name: "chevron_right", usage: "Row navigation" },
  { icon: "event", name: "event", usage: "Campaign/date" },
  { icon: "local_florist", name: "local_florist", usage: "Fleuraison" },
  { icon: "grain", name: "grain", usage: "Nouaison" },
  { icon: "eco", name: "eco", usage: "Chute physiologique" },
  { icon: "science", name: "science", usage: "Fertilisation" },
  { icon: "water_drop", name: "water_drop", usage: "Irrigation" },
] as const;

const postFixeCoreFrames = [
  {
    id: "01",
    title: "Post Fixe List (Data)",
    note: "Main list with poste cards and progress.",
    frameView: "data" as SecteursFrameView,
    previewState: "list-data" as PostFixePreviewState,
  },
  {
    id: "02",
    title: "Poste Detail (Overview)",
    note: "Campaign summary with observations list.",
    frameView: "data" as SecteursFrameView,
    previewState: "detail-overview" as PostFixePreviewState,
  },
  {
    id: "03",
    title: "Observation Form (Fleuraison · Edit)",
    note: "Editable observation form for Fleuraison.",
    frameView: "data" as SecteursFrameView,
    previewState: "observation-edit-fleuraison" as PostFixePreviewState,
    previewObservationPhase: "Fleuraison" as const,
  },
  {
    id: "04",
    title: "Observation Form (Nouaison · Edit)",
    note: "Editable observation form for Nouaison.",
    frameView: "data" as SecteursFrameView,
    previewState: "observation-edit-nouaison" as PostFixePreviewState,
    previewObservationPhase: "Nouaison" as const,
  },
  {
    id: "05",
    title: "Observation Form (Chute physiologique · Edit)",
    note: "Editable observation form for Chute physiologique.",
    frameView: "data" as SecteursFrameView,
    previewState: "observation-edit-chute" as PostFixePreviewState,
    previewObservationPhase: "Chute physiologique" as const,
  },
  {
    id: "06",
    title: "Observation Example (Pas commencé)",
    note: "Example frame for status Pas commencé.",
    frameView: "data" as SecteursFrameView,
    previewState: "observation-status-not-started" as PostFixePreviewState,
  },
  {
    id: "07",
    title: "Observation Example (En cours)",
    note: "Example frame for status En cours.",
    frameView: "data" as SecteursFrameView,
    previewState: "observation-status-in-progress" as PostFixePreviewState,
  },
  {
    id: "08",
    title: "Observation Example (Terminé)",
    note: "Example frame for status Terminé.",
    frameView: "data" as SecteursFrameView,
    previewState: "observation-status-done" as PostFixePreviewState,
  },
  {
    id: "09",
    title: "Observation (Read-only / Modifier)",
    note: "Completed state where primary action is Modifier.",
    frameView: "data" as SecteursFrameView,
    previewState: "observation-readonly" as PostFixePreviewState,
  },
  {
    id: "10",
    title: "Observation Unsaved Modal",
    note: "Confirmation dialog when leaving with unsaved changes.",
    frameView: "data" as SecteursFrameView,
    previewState: "observation-unsaved-modal" as PostFixePreviewState,
  },
] as const;

const postFixeCoreFrameGroups = [
  {
    id: "journey",
    title: "Main Journey",
    note: "Primary navigation path from list to detail.",
    frameIds: ["01", "02"],
  },
  {
    id: "forms",
    title: "Observation Forms",
    note: "Editable forms for each observation phase.",
    frameIds: ["03", "04", "05"],
  },
  {
    id: "statusExamples",
    title: "Status Examples",
    note: "Reference states used for observation status rendering.",
    frameIds: ["06", "07", "08"],
  },
  {
    id: "actions",
    title: "Completion And Exit",
    note: "Locked final state and unsaved confirmation modal.",
    frameIds: ["09", "10"],
  },
] as const;

const postFixeSystemFrames = [
  {
    id: "S1",
    title: "Post Fixe List (Loading)",
    note: "Skeleton state for list loading.",
    frameView: "loading" as SecteursFrameView,
    previewState: "list-loading" as PostFixePreviewState,
  },
  {
    id: "S2",
    title: "Post Fixe List (Empty)",
    note: "No assigned postes fixes state.",
    frameView: "empty" as SecteursFrameView,
    previewState: "list-empty" as PostFixePreviewState,
  },
  {
    id: "S3",
    title: "Poste Detail (Loading Skeleton)",
    note: "Detail page loading state after selecting a poste.",
    frameView: "loading" as SecteursFrameView,
    previewState: "detail-loading" as PostFixePreviewState,
  },
] as const;

type DesignSystemColorRole = {
  name: string;
  token: string;
  hex: string;
  usage: string;
};

type DesignSystemColorScale = {
  name: string;
  hue: string;
  shades: { step: string; hex: string }[];
};
type DesignSystemSemanticMode = "light" | "dark";
type DesignSystemSemanticGroup = {
  key: string;
  label: string;
  description: string;
  items: DesignSystemColorRole[];
};
type DesignSystemTypographyTab = "primitive" | "semantic";
type DesignSystemTypographyMode = "mobile" | "web";
type DesignSystemTypographyTokenItem = {
  name: string;
  token: string;
  value: string;
  sourceValue?: string;
  usage: string;
};
type DesignSystemTypographyGroup = {
  key: string;
  label: string;
  description: string;
  items: DesignSystemTypographyTokenItem[];
};
type DesignSystemFoundationTab = "primitive" | "semantic";
type DesignSystemFoundationSet = {
  key: string;
  label: string;
  description: string;
  tree: Record<string, unknown>;
};
type DesignSystemIconItem = {
  name: string;
  size: string;
  library: string;
  usage: string;
  preview: { kind: "material"; glyph: string };
};
type DesignSystemIconGroup = {
  key: string;
  label: string;
  description: string;
  items: DesignSystemIconItem[];
};

type PrimitiveColorTokenTree = Record<string, Record<string, { $value: string }>>;
type SemanticColorTokenLeaf = { $value: string; $description?: string };
type TypographyTokenLeaf = { $value: string | number; $description?: string };
type GenericTokenLeaf = { $value: unknown; $description?: string };

const primitiveHueDescriptions: Record<string, string> = {
  neutral: "Gray foundations and text surfaces",
  green: "Brand and success",
  blue: "Info and in-progress",
  red: "Errors and destructive actions",
  amber: "Warning states",
  purple: "Accent and secondary visuals",
  teal: "Secondary positive accents",
  rose: "Alert accents and highlights",
  alpha: "Translucent overlays and tinted surfaces",
  white: "Pure white reference values",
  black: "Pure black reference values",
};

const primitiveColorTree = (primitiveColorTokens as { color: PrimitiveColorTokenTree }).color;
const primitiveTypographyTree = primitiveTypographyTokens as Record<string, unknown>;
const primitiveSpacingTree = primitiveSpacingTokens as Record<string, unknown>;
const primitiveRadiusTree = primitiveRadiusTokens as Record<string, unknown>;
const primitiveShadowTree = primitiveShadowTokens as Record<string, unknown>;
const primitiveMotionTree = primitiveMotionTokens as Record<string, unknown>;
const primitiveOpacityTree = primitiveOpacityTokens as Record<string, unknown>;
const semanticColorTreeByMode: Record<DesignSystemSemanticMode, Record<string, unknown>> = {
  light: (semanticColorTokensLight as { color: Record<string, unknown> }).color,
  dark: (semanticColorTokensDark as { color: Record<string, unknown> }).color,
};
const semanticTypographyTreeByMode: Record<DesignSystemTypographyMode, Record<string, unknown>> = {
  mobile: (semanticTypographyTokensMobile as { typography: Record<string, unknown> }).typography,
  web: (semanticTypographyTokensWeb as { typography: Record<string, unknown> }).typography,
};
const semanticSpacingTree = semanticSpacingTokens as Record<string, unknown>;
const semanticElevationTree = semanticElevationTokens as Record<string, unknown>;

const toTitle = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const formatColorValue = (value: string) => (value.startsWith("#") ? value.toUpperCase() : value);

const sortPrimitiveShadeSteps = (aStep: string, bStep: string) => {
  const aNumeric = Number(aStep);
  const bNumeric = Number(bStep);
  const aIsNumeric = Number.isFinite(aNumeric);
  const bIsNumeric = Number.isFinite(bNumeric);

  if (aIsNumeric && bIsNumeric) {
    return aNumeric - bNumeric;
  }

  if (aIsNumeric) {
    return -1;
  }

  if (bIsNumeric) {
    return 1;
  }

  const aSuffixMatch = aStep.match(/^(.*?)(\d+)$/);
  const bSuffixMatch = bStep.match(/^(.*?)(\d+)$/);

  if (aSuffixMatch && bSuffixMatch) {
    const [, aPrefix, aSuffix] = aSuffixMatch;
    const [, bPrefix, bSuffix] = bSuffixMatch;

    const prefixCompare = aPrefix.localeCompare(bPrefix);
    if (prefixCompare !== 0) {
      return prefixCompare;
    }

    return Number(aSuffix) - Number(bSuffix);
  }

  return aStep.localeCompare(bStep);
};

const isSemanticLeaf = (value: unknown): value is SemanticColorTokenLeaf =>
  Boolean(
    value &&
      typeof value === "object" &&
      "$value" in value &&
      typeof (value as { $value?: unknown }).$value === "string"
  );

const isTypographyLeaf = (value: unknown): value is TypographyTokenLeaf =>
  Boolean(
    value &&
      typeof value === "object" &&
      "$value" in value &&
      (typeof (value as { $value?: unknown }).$value === "string" ||
        typeof (value as { $value?: unknown }).$value === "number")
  );

const isGenericLeaf = (value: unknown): value is GenericTokenLeaf =>
  Boolean(value && typeof value === "object" && "$value" in value);

const isShadowValueObject = (
  value: unknown
): value is { offsetX: string; offsetY: string; blur: string; spread: string; color: string; inset?: boolean } =>
  Boolean(
    value &&
      typeof value === "object" &&
      "offsetX" in value &&
      "offsetY" in value &&
      "blur" in value &&
      "spread" in value &&
      "color" in value
  );

const shadowObjectToCss = (value: {
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
  color: string;
  inset?: boolean;
}) =>
  `${value.inset ? "inset " : ""}${value.offsetX} ${value.offsetY} ${value.blur} ${value.spread} ${value.color}`;

const serializeTokenValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.every((item) => isShadowValueObject(item))) {
      return value.map((item) => shadowObjectToCss(item)).join(", ");
    }
    return JSON.stringify(value);
  }

  if (isShadowValueObject(value)) {
    return shadowObjectToCss(value);
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const flattenSemanticColorTokens = (
  node: unknown,
  path: string[],
  out: Map<string, { value: string; description: string }>
) => {
  if (!node || typeof node !== "object") {
    return;
  }

  if (isSemanticLeaf(node)) {
    out.set(path.join("."), { value: node.$value, description: node.$description ?? "" });
    return;
  }

  for (const [key, child] of Object.entries(node as Record<string, unknown>)) {
    if (key.startsWith("$")) {
      continue;
    }
    flattenSemanticColorTokens(child, [...path, key], out);
  }
};

const flattenTypographyTokens = (
  node: unknown,
  path: string[],
  out: Map<string, { value: string; description: string }>
) => {
  if (!node || typeof node !== "object") {
    return;
  }

  if (isTypographyLeaf(node)) {
    out.set(path.join("."), { value: String(node.$value), description: node.$description ?? "" });
    return;
  }

  for (const [key, child] of Object.entries(node as Record<string, unknown>)) {
    if (key.startsWith("$")) {
      continue;
    }
    flattenTypographyTokens(child, [...path, key], out);
  }
};

const flattenGenericTokens = (
  node: unknown,
  path: string[],
  out: Map<string, { value: string; description: string }>
) => {
  if (!node || typeof node !== "object") {
    return;
  }

  if (isGenericLeaf(node)) {
    out.set(path.join("."), {
      value: serializeTokenValue(node.$value),
      description: node.$description ?? "",
    });
    return;
  }

  for (const [key, child] of Object.entries(node as Record<string, unknown>)) {
    if (key.startsWith("$")) {
      continue;
    }
    flattenGenericTokens(child, [...path, key], out);
  }
};

const primitiveColorTokenMap = new Map<string, string>();
for (const [hue, shades] of Object.entries(primitiveColorTree)) {
  for (const [step, token] of Object.entries(shades)) {
    primitiveColorTokenMap.set(`color.${hue}.${step}`, token.$value);
  }
}

const createSemanticColorTokenMap = (semanticColorTree: Record<string, unknown>) => {
  const semanticColorTokenMap = new Map<string, { value: string; description: string }>();
  flattenSemanticColorTokens(semanticColorTree, ["color"], semanticColorTokenMap);
  return semanticColorTokenMap;
};

const createTypographyTokenMap = (rootNode: Record<string, unknown>, rootPath: string[] = []) => {
  const tokenMap = new Map<string, { value: string; description: string }>();
  flattenTypographyTokens(rootNode, rootPath, tokenMap);
  return tokenMap;
};

const createGenericTokenMap = (rootNode: Record<string, unknown>, rootPath: string[] = []) => {
  const tokenMap = new Map<string, { value: string; description: string }>();
  flattenGenericTokens(rootNode, rootPath, tokenMap);
  return tokenMap;
};

const resolveColorTokenValue = (
  rawValue: string,
  semanticColorTokenMap: Map<string, { value: string; description: string }>,
  visited = new Set<string>()
): string => {
  if (!rawValue.startsWith("{") || !rawValue.endsWith("}")) {
    return rawValue;
  }

  const tokenPath = rawValue.slice(1, -1);
  if (visited.has(tokenPath)) {
    return rawValue;
  }

  visited.add(tokenPath);

  const semanticReference = semanticColorTokenMap.get(tokenPath);
  if (semanticReference) {
    return resolveColorTokenValue(semanticReference.value, semanticColorTokenMap, visited);
  }

  return primitiveColorTokenMap.get(tokenPath) ?? rawValue;
};

const primitiveTypographyTokenMap = createTypographyTokenMap(primitiveTypographyTree);

const resolveTypographyTokenValue = (
  rawValue: string,
  semanticTypographyTokenMap: Map<string, { value: string; description: string }>,
  visited = new Set<string>()
): string => {
  if (!rawValue.startsWith("{") || !rawValue.endsWith("}")) {
    return rawValue;
  }

  const tokenPath = rawValue.slice(1, -1);
  if (visited.has(tokenPath)) {
    return rawValue;
  }

  visited.add(tokenPath);

  const semanticReference = semanticTypographyTokenMap.get(tokenPath);
  if (semanticReference) {
    return resolveTypographyTokenValue(semanticReference.value, semanticTypographyTokenMap, visited);
  }

  return primitiveTypographyTokenMap.get(tokenPath)?.value ?? rawValue;
};

const resolveGenericTokenValue = (
  rawValue: string,
  semanticTokenMap: Map<string, { value: string; description: string }>,
  primitiveTokenMap: Map<string, { value: string; description: string }>,
  visited = new Set<string>()
): string => {
  if (!rawValue.startsWith("{") || !rawValue.endsWith("}")) {
    return rawValue;
  }

  const tokenPath = rawValue.slice(1, -1);
  if (visited.has(tokenPath)) {
    return rawValue;
  }

  visited.add(tokenPath);

  const semanticReference = semanticTokenMap.get(tokenPath);
  if (semanticReference) {
    return resolveGenericTokenValue(
      semanticReference.value,
      semanticTokenMap,
      primitiveTokenMap,
      visited
    );
  }

  return primitiveTokenMap.get(tokenPath)?.value ?? rawValue;
};

const designSystemColorScales: DesignSystemColorScale[] = Object.entries(primitiveColorTree).map(
  ([hue, shades]) => ({
    name: toTitle(hue),
    hue: primitiveHueDescriptions[hue] ?? "Color family",
    shades: Object.entries(shades)
      .map(([step, token]) => ({ step, hex: formatColorValue(token.$value) }))
      .sort((a, b) => sortPrimitiveShadeSteps(a.step, b.step)),
  })
);

const prettifyTokenName = (tokenPath: string) =>
  tokenPath
    .replace(/^color\./, "")
    .split(".")
    .map((segment) =>
      toTitle(segment.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/-/g, " ").trim())
    )
    .join(" / ");

const buildSemanticColorRoles = (semanticColorTree: Record<string, unknown>): DesignSystemColorRole[] => {
  const semanticColorTokenMap = createSemanticColorTokenMap(semanticColorTree);
  return Array.from(semanticColorTokenMap.entries())
    .map(([token, tokenMeta]) => ({
      name: prettifyTokenName(token),
      token,
      hex: formatColorValue(resolveColorTokenValue(tokenMeta.value, semanticColorTokenMap)),
      usage: tokenMeta.description || "Semantic color token",
    }))
    .sort((a, b) => a.token.localeCompare(b.token));
};

const semanticGroupOrder = [
  "brand",
  "text",
  "surface",
  "border",
  "status",
  "feedback",
  "tag",
  "data-viz",
];

const semanticGroupDescriptions: Record<string, string> = {
  brand: "Primary brand and interactive emphasis tokens.",
  text: "Typography and text contrast roles.",
  surface: "Background and container layers.",
  border: "Default, strong, and state borders.",
  status: "Observation-specific status colors.",
  feedback: "Success, error, warning, and info messaging.",
  tag: "Contextual chip and badge color sets.",
  "data-viz": "Chart and data series color mapping.",
};

const formatSemanticGroupLabel = (groupKey: string) =>
  groupKey === "data-viz" ? "Data Viz" : toTitle(groupKey.replace(/-/g, " "));

const buildSemanticGroups = (
  designSystemCoreColorRoles: DesignSystemColorRole[]
): DesignSystemSemanticGroup[] => {
  const grouped = new Map<string, DesignSystemColorRole[]>();

  for (const role of designSystemCoreColorRoles) {
    const groupKey = role.token.split(".")[1] ?? "other";
    const existing = grouped.get(groupKey) ?? [];
    existing.push(role);
    grouped.set(groupKey, existing);
  }

  const orderedGroupKeys = [
    ...semanticGroupOrder.filter((groupKey) => grouped.has(groupKey)),
    ...Array.from(grouped.keys())
      .filter((groupKey) => !semanticGroupOrder.includes(groupKey))
      .sort((a, b) => a.localeCompare(b)),
  ];

  return orderedGroupKeys.map((groupKey) => ({
    key: groupKey,
    label: formatSemanticGroupLabel(groupKey),
    description: semanticGroupDescriptions[groupKey] ?? "Semantic token group.",
    items: (grouped.get(groupKey) ?? []).sort((a, b) => a.token.localeCompare(b.token)),
  }));
};

const typographyGroupDescriptions: Record<string, string> = {
  "font-family": "Font stacks used across platforms.",
  "font-size": "Primitive type scale for sizes.",
  "font-weight": "Weight scale for emphasis and hierarchy.",
  "line-height": "Line-height ratios for readability.",
  "letter-spacing": "Tracking scale for text density and style.",
  display: "Display-level typography for hero and high-emphasis UI.",
  heading: "Heading hierarchy across sections and screens.",
  body: "Default reading and content text styles.",
  label: "Controls, labels, and compact emphasis text.",
  caption: "Secondary metadata and timestamps.",
  overline: "All-caps micro heading style.",
  mono: "Monospace styles for structured data values.",
};

const formatTypographyGroupLabel = (groupKey: string) =>
  groupKey
    .split("-")
    .map((segment) => toTitle(segment))
    .join(" ");

const prettifyTypographyTokenName = (tokenPath: string, removePrefix?: string) => {
  const trimmed = removePrefix && tokenPath.startsWith(removePrefix)
    ? tokenPath.slice(removePrefix.length)
    : tokenPath;

  return trimmed
    .split(".")
    .map((segment) =>
      toTitle(segment.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/-/g, " ").trim())
    )
    .join(" / ");
};

const buildPrimitiveTypographyGroups = (
  primitiveTree: Record<string, unknown>
): DesignSystemTypographyGroup[] =>
  Object.entries(primitiveTree)
    .map(([groupKey, groupNode]) => {
      const groupMap = new Map<string, { value: string; description: string }>();
      flattenTypographyTokens(groupNode, [groupKey], groupMap);
      const items = Array.from(groupMap.entries())
        .map(([token, meta]) => ({
          name: prettifyTypographyTokenName(token, `${groupKey}.`),
          token,
          value: meta.value,
          usage: meta.description || "Primitive typography token",
        }))
        .sort((a, b) => a.token.localeCompare(b.token));

      return {
        key: groupKey,
        label: formatTypographyGroupLabel(groupKey),
        description: typographyGroupDescriptions[groupKey] ?? "Typography primitive group.",
        items,
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key));

const buildSemanticTypographyGroups = (
  semanticTree: Record<string, unknown>
): DesignSystemTypographyGroup[] => {
  const semanticTokenMap = createTypographyTokenMap(semanticTree, ["typography"]);

  return Object.entries(semanticTree)
    .map(([groupKey, groupNode]) => {
      const groupMap = new Map<string, { value: string; description: string }>();
      flattenTypographyTokens(groupNode, ["typography", groupKey], groupMap);

      const items = Array.from(groupMap.entries())
        .map(([token, meta]) => {
          const resolvedValue = resolveTypographyTokenValue(meta.value, semanticTokenMap);
          const hasAlias = resolvedValue !== meta.value;
          return {
            name: prettifyTypographyTokenName(token, `typography.${groupKey}.`),
            token,
            value: resolvedValue,
            sourceValue: hasAlias ? meta.value : undefined,
            usage: meta.description || "Semantic typography token",
          };
        })
        .sort((a, b) => a.token.localeCompare(b.token));

      return {
        key: groupKey,
        label: formatTypographyGroupLabel(groupKey),
        description: typographyGroupDescriptions[groupKey] ?? "Typography semantic group.",
        items,
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key));
};

const primitiveFoundationSets: DesignSystemFoundationSet[] = [
  {
    key: "spacing",
    label: "Spacing",
    description: "Base spacing scale used across layout and components.",
    tree: primitiveSpacingTree,
  },
  {
    key: "radius",
    label: "Radius",
    description: "Corner radius scale for controls, cards, and surfaces.",
    tree: primitiveRadiusTree,
  },
  {
    key: "shadow",
    label: "Shadow",
    description: "Primitive shadow definitions and focus rings.",
    tree: primitiveShadowTree,
  },
  {
    key: "motion",
    label: "Motion",
    description: "Durations, easing curves, and delays for transitions.",
    tree: primitiveMotionTree,
  },
  {
    key: "opacity",
    label: "Opacity",
    description: "Opacity values for disabled, muted, and overlay states.",
    tree: primitiveOpacityTree,
  },
];

const semanticFoundationSets: DesignSystemFoundationSet[] = [
  {
    key: "spacing",
    label: "Spacing",
    description: "Intent-based spacing tokens mapped from primitive scale.",
    tree: semanticSpacingTree,
  },
  {
    key: "elevation",
    label: "Elevation",
    description: "Semantic elevation roles mapped from shadow primitives.",
    tree: semanticElevationTree,
  },
];

const primitiveFoundationTokenMap = (() => {
  const map = new Map<string, { value: string; description: string }>();
  const mergeIntoMap = (sourceMap: Map<string, { value: string; description: string }>) => {
    for (const [token, meta] of sourceMap.entries()) {
      map.set(token, meta);
    }
  };

  for (const set of primitiveFoundationSets) {
    mergeIntoMap(createGenericTokenMap(set.tree));
  }

  mergeIntoMap(createTypographyTokenMap(primitiveTypographyTree));

  return map;
})();

const foundationGroupDescriptions: Record<string, string> = {
  spacing: "Spacing scale and aliases.",
  radius: "Corner radius values.",
  shadow: "Primitive shadow recipes.",
  duration: "Animation duration tokens.",
  easing: "Cubic-bezier timing functions.",
  delay: "Animation delay tokens.",
  opacity: "Opacity levels for UI states.",
  component: "Component-level spacing conventions.",
  layout: "Layout and page spacing conventions.",
  section: "Section spacing conventions.",
  inset: "Inset/padding conventions.",
  flat: "No elevation role.",
  raised: "Card and panel elevations.",
  overlay: "Floating UI and modal elevations.",
  focus: "Focus ring elevations.",
};

const designSystemIconGroups: DesignSystemIconGroup[] = [
  {
    key: "post-fixe",
    label: "Post Fixe",
    description: "Icons used in Poste Fixe header, rows, forms, and observation states.",
    items: [
      {
        name: "arrow_back",
        size: "20px glyph / 34x34 container",
        library: "Material Symbols Outlined",
        usage: "Back action in detail and edit headers.",
        preview: { kind: "material", glyph: "arrow_back" },
      },
      {
        name: "chevron_right",
        size: "18px",
        library: "Material Symbols Outlined",
        usage: "Row navigation chevron on list/detail cards.",
        preview: { kind: "material", glyph: "chevron_right" },
      },
      {
        name: "event",
        size: "18px",
        library: "Material Symbols Outlined",
        usage: "Date input icon in observation forms.",
        preview: { kind: "material", glyph: "event" },
      },
      {
        name: "water_drop",
        size: "20px",
        library: "Material Symbols Outlined",
        usage: "Configuration section and irrigation observation icon.",
        preview: { kind: "material", glyph: "water_drop" },
      },
      {
        name: "local_florist",
        size: "20px",
        library: "Material Symbols Outlined",
        usage: "Fleuraison observation icon.",
        preview: { kind: "material", glyph: "local_florist" },
      },
      {
        name: "grain",
        size: "20px",
        library: "Material Symbols Outlined",
        usage: "Nouaison observation icon.",
        preview: { kind: "material", glyph: "grain" },
      },
      {
        name: "eco",
        size: "20px",
        library: "Material Symbols Outlined",
        usage: "Chute physiologique observation icon.",
        preview: { kind: "material", glyph: "eco" },
      },
      {
        name: "science",
        size: "20px",
        library: "Material Symbols Outlined",
        usage: "Fertilisation observation icon.",
        preview: { kind: "material", glyph: "science" },
      },
      {
        name: "add_a_photo",
        size: "24px",
        library: "Material Symbols Outlined",
        usage: "Add image placeholder in observation form.",
        preview: { kind: "material", glyph: "add_a_photo" },
      },
      {
        name: "close",
        size: "16px",
        library: "Material Symbols Outlined",
        usage: "Remove image action on thumbnails.",
        preview: { kind: "material", glyph: "close" },
      },
      {
        name: "cloud",
        size: "18px",
        library: "Material Symbols Outlined",
        usage: "Idle or syncing state in Poste Fixe header actions.",
        preview: { kind: "material", glyph: "cloud" },
      },
      {
        name: "cloud_done",
        size: "18px",
        library: "Material Symbols Outlined",
        usage: "Synced state in Poste Fixe header actions.",
        preview: { kind: "material", glyph: "cloud_done" },
      },
      {
        name: "cloud_alert",
        size: "18px",
        library: "Material Symbols Outlined",
        usage: "Sync error state in Poste Fixe header actions.",
        preview: { kind: "material", glyph: "cloud_alert" },
      },
    ],
  },
  {
    key: "bottom-nav",
    label: "Bottom Nav",
    description: "Navigation icons used in the fixed bottom app bar.",
    items: [
      {
        name: "home",
        size: "24px glyph / 24x24 frame",
        library: "Material Symbols Outlined",
        usage: "Accueil tab icon.",
        preview: { kind: "material", glyph: "home" },
      },
      {
        name: "assignment",
        size: "24px glyph / 24x24 frame",
        library: "Material Symbols Outlined",
        usage: "Travail tab icon.",
        preview: { kind: "material", glyph: "assignment" },
      },
      {
        name: "view_timeline",
        size: "24px glyph / 24x24 frame",
        library: "Material Symbols Outlined",
        usage: "Post Fixe tab icon.",
        preview: { kind: "material", glyph: "view_timeline" },
      },
      {
        name: "inbox",
        size: "24px glyph / 24x24 frame",
        library: "Material Symbols Outlined",
        usage: "Boite tab icon.",
        preview: { kind: "material", glyph: "inbox" },
      },
    ],
  },
];

const buildFoundationGroups = (
  set: DesignSystemFoundationSet,
  mode: DesignSystemFoundationTab
): DesignSystemTypographyGroup[] => {
  const rootEntries = Object.entries(set.tree);
  const normalizedRootEntries = (() => {
    if (rootEntries.length !== 1 || typeof rootEntries[0]?.[1] !== "object") {
      return rootEntries as [string, unknown][];
    }

    const [rootKey, rootValue] = rootEntries[0];
    const innerEntries = Object.entries(rootValue as Record<string, unknown>);
    const hasNestedGroups = innerEntries.some(([, childValue]) => !isGenericLeaf(childValue));

    if (hasNestedGroups) {
      return innerEntries as [string, unknown][];
    }

    return [[rootKey, rootValue]] as [string, unknown][];
  })();

  const semanticMap = mode === "semantic" ? createGenericTokenMap(set.tree) : null;

  return normalizedRootEntries
    .map(([groupKey, groupNode]) => {
      const groupMap = new Map<string, { value: string; description: string }>();
      flattenGenericTokens(groupNode, [groupKey], groupMap);

      const items = Array.from(groupMap.entries())
        .map(([token, meta]) => {
          const resolvedValue =
            mode === "semantic" && semanticMap
              ? resolveGenericTokenValue(meta.value, semanticMap, primitiveFoundationTokenMap)
              : meta.value;
          const hasAlias = resolvedValue !== meta.value;

          return {
            name: prettifyTypographyTokenName(token, `${groupKey}.`),
            token,
            value: resolvedValue,
            sourceValue: hasAlias ? meta.value : undefined,
            usage: meta.description || "Token",
          };
        })
        .sort((a, b) => a.token.localeCompare(b.token));

      return {
        key: groupKey,
        label: formatTypographyGroupLabel(groupKey),
        description: foundationGroupDescriptions[groupKey] ?? "Foundation token group.",
        items,
      };
    })
    .filter((group) => group.items.length > 0)
    .sort((a, b) => a.key.localeCompare(b.key));
};

type DesignSystemTab =
  | "colors"
  | "typography"
  | "icons"
  | "spacing"
  | "elevation"
  | "radius"
  | "shadow"
  | "motion"
  | "opacity";
type DesignSystemColorTab = "primitive" | "semantic";
type CanvasView = "design" | "frames" | "components" | "iconography" | "designSystem";

function resolveWorkerCanvasView(
  activeScreen:
    | "prototype"
    | "getStarted"
    | "getStartedV2"
    | "home"
    | "travail"
    | "postFixe"
    | "boite"
    | "profile"
    | "synchronisation",
  canvasView: CanvasView
): CanvasView {
  if (activeScreen === "postFixe") {
    return canvasView === "frames" ? "frames" : "design";
  }

  return "design";
}

type AnnotationLegendItem = {
  index: number;
  label: string;
};

type AnnotationSpecItem = {
  attribute: string;
  value: string;
};

type AnnotationColorItem = {
  name: string;
  hex: string;
};

type AnnotationBehaviorItem = {
  key: string;
  value: string;
};

type ComponentAnnotationPanelProps = {
  ariaLabel: string;
  legend: AnnotationLegendItem[];
  specs: AnnotationSpecItem[];
  colors: AnnotationColorItem[];
  behaviors: AnnotationBehaviorItem[];
};

function ComponentAnnotationPanel({
  ariaLabel,
  legend,
  specs,
  colors,
  behaviors,
}: ComponentAnnotationPanelProps) {
  return (
    <div className={styles.annotationNotes}>
      <p className={styles.annotationLegendTitle}>Dev UI annotations</p>
      <div className={styles.annotationNotesGrid}>
        <div className={styles.annotationNotesColumn}>
          <div className={styles.annotationLegendList}>
            {legend.map((item) => (
              <p key={`${ariaLabel}-legend-${item.index}`} className={styles.annotationLegendRow}>
                <span className={styles.annotationLegendIndex}>{item.index}</span>
                <span>{item.label}</span>
              </p>
            ))}
          </div>
          <p className={styles.annotationSubTitle}>Behavior + accessibility</p>
          <div className={styles.annotationBehaviorGrid}>
            {behaviors.map((behavior, index) => (
              <p key={`${ariaLabel}-behavior-${index}`} className={styles.annotationBehaviorRow}>
                <span className={styles.annotationBehaviorKey}>{behavior.key}</span>
                <span className={styles.annotationBehaviorValue}>{behavior.value}</span>
              </p>
            ))}
          </div>
        </div>

        <div className={styles.annotationNotesColumn}>
          <table className={styles.annotationTable} aria-label={ariaLabel}>
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {specs.map((spec, index) => (
                <tr key={`${ariaLabel}-spec-${index}`}>
                  <td>{spec.attribute}</td>
                  <td>{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.annotationSubTitle}>Color roles</p>
          <div className={styles.annotationTokenGrid}>
            {colors.map((colorRole) => (
              <p key={`${ariaLabel}-color-${colorRole.name}`} className={styles.annotationTokenRow}>
                <span className={styles.annotationTokenName}>{colorRole.name}</span>
                <span className={styles.annotationTokenValue}>
                  <span
                    className={styles.annotationColorSwatch}
                    style={{ backgroundColor: colorRole.hex }}
                    aria-hidden="true"
                  />
                  <span className={styles.annotationColorCode}>{colorRole.hex}</span>
                </span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<
    | "prototype"
    | "getStarted"
    | "getStartedV2"
    | "home"
    | "travail"
    | "postFixe"
    | "boite"
    | "profile"
    | "synchronisation"
    | "designSystem"
    | "testDs"
  >("postFixe");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showDeviceFrame, setShowDeviceFrame] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWorkerAppOpen, setIsWorkerAppOpen] = useState(true);
  const [postFixeFrameView, setPostFixeFrameView] = useState<SecteursFrameView>("data");
  const [canvasView, setCanvasView] = useState<CanvasView>("design");
  const [showDevAnnotations] = useState(false);
  const [designSystemTab, setDesignSystemTab] = useState<DesignSystemTab>("colors");
  const [designSystemColorTab, setDesignSystemColorTab] = useState<DesignSystemColorTab>("primitive");
  const [designSystemSemanticMode, setDesignSystemSemanticMode] =
    useState<DesignSystemSemanticMode>("light");
  const [designSystemTypographyTab, setDesignSystemTypographyTab] =
    useState<DesignSystemTypographyTab>("primitive");
  const [designSystemTypographyMode, setDesignSystemTypographyMode] =
    useState<DesignSystemTypographyMode>("mobile");

  const [designSystemSpacingTab, setDesignSystemSpacingTab] =
    useState<DesignSystemFoundationTab>("primitive");
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isSidebarResizing, setIsSidebarResizing] = useState(false);
  const sidebarResizeStartXRef = useRef(0);
  const sidebarResizeStartWidthRef = useRef(300);

  useEffect(() => {
    if (!isSidebarResizing) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const delta = event.clientX - sidebarResizeStartXRef.current;
      const nextWidth = sidebarResizeStartWidthRef.current + delta;
      const boundedWidth = Math.min(560, Math.max(240, nextWidth));
      setSidebarWidth(boundedWidth);
    };

    const stopResizing = () => {
      setIsSidebarResizing(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing);
    window.addEventListener("pointercancel", stopResizing);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
      window.removeEventListener("pointercancel", stopResizing);
    };
  }, [isSidebarResizing]);

  const resolvedActiveScreen =
    activeScreen === "designSystem" || activeScreen === "testDs" ? "postFixe" : activeScreen;
  const resolvedCanvasView = resolveWorkerCanvasView(resolvedActiveScreen, canvasView);
  const isWorkerAppScreen = [
    "prototype",
    "getStarted",
    "getStartedV2",
    "home",
    "travail",
    "postFixe",
    "boite",
    "profile",
    "synchronisation",
  ].includes(resolvedActiveScreen);

  const pageTitleByScreen: Record<
    | "prototype"
    | "getStarted"
    | "getStartedV2"
    | "home"
    | "travail"
    | "postFixe"
    | "boite"
    | "profile"
    | "synchronisation"
    | "designSystem"
    | "testDs",
    string
  > = {
    prototype: WORKER_APP_CANVAS_NAME,
    getStarted: WORKER_APP_GET_STARTED_PAGE_NAME,
    getStartedV2: WORKER_APP_GET_STARTED_V2_PAGE_NAME,
    home: WORKER_APP_HOME_PAGE_NAME,
    travail: WORKER_APP_TRAVAIL_PAGE_NAME,
    postFixe: WORKER_APP_POST_FIXE_PAGE_NAME,
    boite: WORKER_APP_BOITE_PAGE_NAME,
    profile: WORKER_APP_PROFILE_PAGE_NAME,
    synchronisation: WORKER_APP_SYNCHRONISATION_PAGE_NAME,
    designSystem: "Design system",
    testDs: "Test DS",
  };
  const activePageTitle = pageTitleByScreen[resolvedActiveScreen];
  const renderComponentMilestones = (completed: number) => (
    <div className={styles.componentsProgressTrack} aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={`${styles.componentsProgressSegment} ${
            index < completed ? styles.componentsProgressSegmentDone : ""
          }`}
        />
      ))}
    </div>
  );
  const designSystemCoreColorRoles = useMemo(
    () => buildSemanticColorRoles(semanticColorTreeByMode[designSystemSemanticMode]),
    [designSystemSemanticMode]
  );
  const designSystemSemanticGroups = useMemo(
    () => buildSemanticGroups(designSystemCoreColorRoles),
    [designSystemCoreColorRoles]
  );
  const designSystemPrimitiveTypographyGroups = useMemo(
    () => buildPrimitiveTypographyGroups(primitiveTypographyTree),
    []
  );
  const designSystemSemanticTypographyGroups = useMemo(
    () => buildSemanticTypographyGroups(semanticTypographyTreeByMode[designSystemTypographyMode]),
    [designSystemTypographyMode]
  );
  const primitiveSpacingGroups = useMemo(
    () => buildFoundationGroups(primitiveFoundationSets.find((set) => set.key === "spacing")!, "primitive"),
    []
  );
  const semanticSpacingGroups = useMemo(
    () => buildFoundationGroups(semanticFoundationSets.find((set) => set.key === "spacing")!, "semantic"),
    []
  );
  const semanticElevationGroups = useMemo(
    () => buildFoundationGroups(semanticFoundationSets.find((set) => set.key === "elevation")!, "semantic"),
    []
  );
  const primitiveRadiusGroups = useMemo(
    () => buildFoundationGroups(primitiveFoundationSets.find((set) => set.key === "radius")!, "primitive"),
    []
  );
  const primitiveShadowGroups = useMemo(
    () => buildFoundationGroups(primitiveFoundationSets.find((set) => set.key === "shadow")!, "primitive"),
    []
  );
  const primitiveMotionGroups = useMemo(
    () => buildFoundationGroups(primitiveFoundationSets.find((set) => set.key === "motion")!, "primitive"),
    []
  );
  const primitiveOpacityGroups = useMemo(
    () => buildFoundationGroups(primitiveFoundationSets.find((set) => set.key === "opacity")!, "primitive"),
    []
  );
  const semanticElevationTokenMap = useMemo(() => {
    const map = new Map<string, DesignSystemTypographyTokenItem>();
    for (const group of semanticElevationGroups) {
      for (const item of group.items) {
        map.set(item.token, item);
      }
    }
    return map;
  }, [semanticElevationGroups]);
  const elevationShowcaseCards = useMemo(() => {
    const entries = [
      { token: "flat", label: "Flat", usage: "No elevation for inline/static surfaces.", kind: "surface" as const },
      { token: "raised.xs", label: "Raised XS", usage: "Subtle hover and small controls.", kind: "surface" as const },
      { token: "raised.sm", label: "Raised SM", usage: "Default card elevation.", kind: "surface" as const },
      { token: "raised.md", label: "Raised MD", usage: "Active/hovered cards and panels.", kind: "surface" as const },
      { token: "overlay.sm", label: "Overlay SM", usage: "Popovers and dropdowns.", kind: "surface" as const },
      { token: "overlay.md", label: "Overlay MD", usage: "Dialogs and sheets.", kind: "surface" as const },
      { token: "overlay.lg", label: "Overlay LG", usage: "Highest overlay layers.", kind: "surface" as const },
      { token: "inset", label: "Inset", usage: "Pressed/sunken fields.", kind: "inset" as const },
      { token: "focus.default", label: "Focus Default", usage: "Keyboard focus ring.", kind: "focus" as const },
      { token: "focus.error", label: "Focus Error", usage: "Invalid input focus ring.", kind: "focus" as const },
    ];

    return entries.map((entry) => {
      const token = semanticElevationTokenMap.get(entry.token);
      return {
        ...entry,
        value: token?.value ?? "none",
        sourceValue: token?.sourceValue,
      };
    });
  }, [semanticElevationTokenMap]);
  const primitiveSpacingShowcaseRows = useMemo(
    () =>
      primitiveSpacingGroups
        .flatMap((group) => group.items)
        .map((item) => {
          const px = Number.parseFloat(item.value.replace("px", ""));
          if (!Number.isFinite(px)) {
            return null;
          }
          const remRaw = px / 16;
          const rem = Number.isInteger(remRaw) ? `${remRaw}` : remRaw.toFixed(3).replace(/0+$/, "");
          return {
            token: item.token,
            rem,
            px: Math.round(px),
            sizePx: Math.max(2, Math.min(Math.round(px), 96)),
          };
        })
        .filter((row): row is { token: string; rem: string; px: number; sizePx: number } => Boolean(row))
        .sort((a, b) => a.px - b.px),
    [primitiveSpacingGroups]
  );
  const renderFoundationGroups = (groups: DesignSystemTypographyGroup[], keyPrefix: string) => (
    <div className={styles.designSystemSemanticGroups}>
      {groups.map((group) => (
        <section key={`${keyPrefix}-${group.key}`} className={styles.designSystemSemanticGroup}>
          <div className={styles.designSystemSemanticGroupHeader}>
            <div className={styles.designSystemSemanticGroupTitleRow}>
              <h4>{group.label}</h4>
              <span className={styles.designSystemSemanticGroupCount}>{group.items.length}</span>
            </div>
            <p>{group.description}</p>
          </div>
          <div className={styles.designSystemSemanticList}>
            {group.items.map((item) => (
              <article key={`${keyPrefix}-${item.token}`} className={styles.designSystemSemanticRow}>
                <div className={styles.designSystemSemanticTokenBlock}>
                  <p className={styles.designSystemSemanticTokenName}>{item.name}</p>
                  <p className={styles.designSystemSemanticTokenCode}>{item.token}</p>
                  <p className={styles.designSystemSemanticUsage}>{item.usage}</p>
                </div>
                <div className={`${styles.designSystemSemanticValue} ${styles.designSystemTypographyValue}`}>
                  <span className={styles.designSystemTypographyValueMain}>{item.value}</span>
                  {item.sourceValue ? (
                    <span className={styles.designSystemTypographyValueSource}>{item.sourceValue}</span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
  const renderDesignSystemWorkspace = () => (
    <div className={styles.designSystemCanvas}>
      <div className={styles.designSystemTopTabs} role="tablist" aria-label="Design system sections">
        <button
          type="button"
          role="tab"
          aria-selected={designSystemTab === "colors"}
          className={`${styles.designSystemTopTab} ${
            designSystemTab === "colors" ? styles.designSystemTopTabActive : ""
          }`}
          onClick={() => setDesignSystemTab("colors")}
        >
          Colors
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={designSystemTab === "typography"}
          className={`${styles.designSystemTopTab} ${
            designSystemTab === "typography" ? styles.designSystemTopTabActive : ""
          }`}
          onClick={() => setDesignSystemTab("typography")}
        >
          Typography
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={designSystemTab === "icons"}
          className={`${styles.designSystemTopTab} ${
            designSystemTab === "icons" ? styles.designSystemTopTabActive : ""
          }`}
          onClick={() => setDesignSystemTab("icons")}
        >
          Icons
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={designSystemTab === "spacing"}
          className={`${styles.designSystemTopTab} ${
            designSystemTab === "spacing" ? styles.designSystemTopTabActive : ""
          }`}
          onClick={() => setDesignSystemTab("spacing")}
        >
          Spacing
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={designSystemTab === "elevation"}
          className={`${styles.designSystemTopTab} ${
            designSystemTab === "elevation" ? styles.designSystemTopTabActive : ""
          }`}
          onClick={() => setDesignSystemTab("elevation")}
        >
          Elevation
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={designSystemTab === "radius"}
          className={`${styles.designSystemTopTab} ${
            designSystemTab === "radius" ? styles.designSystemTopTabActive : ""
          }`}
          onClick={() => setDesignSystemTab("radius")}
        >
          Radius
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={designSystemTab === "shadow"}
          className={`${styles.designSystemTopTab} ${
            designSystemTab === "shadow" ? styles.designSystemTopTabActive : ""
          }`}
          onClick={() => setDesignSystemTab("shadow")}
        >
          Shadow
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={designSystemTab === "motion"}
          className={`${styles.designSystemTopTab} ${
            designSystemTab === "motion" ? styles.designSystemTopTabActive : ""
          }`}
          onClick={() => setDesignSystemTab("motion")}
        >
          Motion
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={designSystemTab === "opacity"}
          className={`${styles.designSystemTopTab} ${
            designSystemTab === "opacity" ? styles.designSystemTopTabActive : ""
          }`}
          onClick={() => setDesignSystemTab("opacity")}
        >
          Opacity
        </button>
      </div>

      {designSystemTab === "colors" ? (
        <>
          <div className={styles.designSystemSubTabs} role="tablist" aria-label="Color token layers">
            <button
              type="button"
              role="tab"
              aria-selected={designSystemColorTab === "primitive"}
              className={`${styles.designSystemSubTab} ${
                designSystemColorTab === "primitive" ? styles.designSystemSubTabActive : ""
              }`}
              onClick={() => setDesignSystemColorTab("primitive")}
            >
              Primitive
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={designSystemColorTab === "semantic"}
              className={`${styles.designSystemSubTab} ${
                designSystemColorTab === "semantic" ? styles.designSystemSubTabActive : ""
              }`}
              onClick={() => setDesignSystemColorTab("semantic")}
            >
              Semantic
            </button>
          </div>

          {designSystemColorTab === "primitive" ? (
            <section className={styles.designSystemPanel}>
              <div className={styles.componentsPanelHeader}>
                <h3>Primitive Color Scales</h3>
                <p>Raw hue scales used as the source layer for semantic tokens.</p>
              </div>
              <div className={styles.designSystemPaletteGrid}>
                {designSystemColorScales.map((ramp) => (
                  <article key={ramp.name} className={styles.designSystemPaletteCard}>
                    <div className={styles.designSystemPaletteHeader}>
                      <div>
                        <h4>{ramp.name}</h4>
                        <p>{ramp.hue}</p>
                      </div>
                      <span className={styles.designSystemPaletteCount}>{ramp.shades.length} shades</span>
                    </div>
                    <div className={styles.designSystemShadeScale}>
                      {ramp.shades.map((shade) => (
                        <div key={`${ramp.name}-${shade.step}`} className={styles.designSystemShadeScaleItem}>
                          <span
                            className={styles.designSystemShadeSwatch}
                            style={{ backgroundColor: shade.hex }}
                            aria-hidden="true"
                          />
                          <span className={styles.designSystemShadeScaleStep}>{shade.step}</span>
                          <span className={styles.designSystemShadeScaleHex}>{shade.hex}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className={styles.designSystemPanel}>
              <div className={styles.designSystemSemanticHeader}>
                <div className={styles.componentsPanelHeader}>
                  <h3>Semantic Colors</h3>
                  <p>Purpose-based tokens mapped to UI roles in the mobile product.</p>
                </div>
                <div className={styles.designSystemSemanticModeSwitch} role="tablist" aria-label="Semantic mode">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={designSystemSemanticMode === "light"}
                    className={`${styles.designSystemSemanticModeButton} ${
                      designSystemSemanticMode === "light" ? styles.designSystemSemanticModeButtonActive : ""
                    }`}
                    onClick={() => setDesignSystemSemanticMode("light")}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={designSystemSemanticMode === "dark"}
                    className={`${styles.designSystemSemanticModeButton} ${
                      designSystemSemanticMode === "dark" ? styles.designSystemSemanticModeButtonActive : ""
                    }`}
                    onClick={() => setDesignSystemSemanticMode("dark")}
                  >
                    Dark
                  </button>
                </div>
              </div>
              <div className={styles.designSystemSemanticGroups}>
                {designSystemSemanticGroups.map((group) => (
                  <section key={group.key} className={styles.designSystemSemanticGroup}>
                    <div className={styles.designSystemSemanticGroupHeader}>
                      <div className={styles.designSystemSemanticGroupTitleRow}>
                        <h4>{group.label}</h4>
                        <span className={styles.designSystemSemanticGroupCount}>
                          {group.items.length}
                        </span>
                      </div>
                      <p>{group.description}</p>
                    </div>
                    <div className={styles.designSystemSemanticList}>
                      {group.items.map((role) => (
                        <article key={role.token} className={styles.designSystemSemanticRow}>
                          <div className={styles.designSystemSemanticTokenBlock}>
                            <p className={styles.designSystemSemanticTokenName}>{role.name}</p>
                            <p className={styles.designSystemSemanticTokenCode}>{role.token}</p>
                            <p className={styles.designSystemSemanticUsage}>{role.usage}</p>
                          </div>
                          <div className={styles.designSystemSemanticValue}>
                            <span
                              className={styles.designSystemSemanticSwatch}
                              style={{ backgroundColor: role.hex }}
                              aria-hidden="true"
                            />
                            <span className={styles.designSystemSemanticHex}>{role.hex}</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </section>
          )}
        </>
      ) : designSystemTab === "typography" ? (
        <>
          <div className={styles.designSystemSubTabs} role="tablist" aria-label="Typography token layers">
            <button
              type="button"
              role="tab"
              aria-selected={designSystemTypographyTab === "primitive"}
              className={`${styles.designSystemSubTab} ${
                designSystemTypographyTab === "primitive" ? styles.designSystemSubTabActive : ""
              }`}
              onClick={() => setDesignSystemTypographyTab("primitive")}
            >
              Primitive
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={designSystemTypographyTab === "semantic"}
              className={`${styles.designSystemSubTab} ${
                designSystemTypographyTab === "semantic" ? styles.designSystemSubTabActive : ""
              }`}
              onClick={() => setDesignSystemTypographyTab("semantic")}
            >
              Semantic
            </button>
          </div>

          {designSystemTypographyTab === "primitive" ? (
            <section className={styles.designSystemPanel}>
              <div className={styles.componentsPanelHeader}>
                <h3>Primitive Typography Tokens</h3>
                <p>Raw typography foundations used by semantic mobile and web styles.</p>
              </div>
              <div className={styles.designSystemSemanticGroups}>
                {designSystemPrimitiveTypographyGroups.map((group) => (
                  <section key={group.key} className={styles.designSystemSemanticGroup}>
                    <div className={styles.designSystemSemanticGroupHeader}>
                      <div className={styles.designSystemSemanticGroupTitleRow}>
                        <h4>{group.label}</h4>
                        <span className={styles.designSystemSemanticGroupCount}>
                          {group.items.length}
                        </span>
                      </div>
                      <p>{group.description}</p>
                    </div>
                    <div className={styles.designSystemSemanticList}>
                      {group.items.map((item) => (
                        <article key={item.token} className={styles.designSystemSemanticRow}>
                          <div className={styles.designSystemSemanticTokenBlock}>
                            <p className={styles.designSystemSemanticTokenName}>{item.name}</p>
                            <p className={styles.designSystemSemanticTokenCode}>{item.token}</p>
                            <p className={styles.designSystemSemanticUsage}>{item.usage}</p>
                          </div>
                          <div
                            className={`${styles.designSystemSemanticValue} ${styles.designSystemTypographyValue}`}
                          >
                            <span className={styles.designSystemTypographyValueMain}>{item.value}</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </section>
          ) : (
            <section className={styles.designSystemPanel}>
              <div className={styles.designSystemSemanticHeader}>
                <div className={styles.componentsPanelHeader}>
                  <h3>Semantic Typography Tokens</h3>
                  <p>Role-based typography for product UI across mobile and web.</p>
                </div>
                <div
                  className={styles.designSystemSemanticModeSwitch}
                  role="tablist"
                  aria-label="Typography platform mode"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={designSystemTypographyMode === "mobile"}
                    className={`${styles.designSystemSemanticModeButton} ${
                      designSystemTypographyMode === "mobile"
                        ? styles.designSystemSemanticModeButtonActive
                        : ""
                    }`}
                    onClick={() => setDesignSystemTypographyMode("mobile")}
                  >
                    Mobile
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={designSystemTypographyMode === "web"}
                    className={`${styles.designSystemSemanticModeButton} ${
                      designSystemTypographyMode === "web" ? styles.designSystemSemanticModeButtonActive : ""
                    }`}
                    onClick={() => setDesignSystemTypographyMode("web")}
                  >
                    Web
                  </button>
                </div>
              </div>
              <div className={styles.designSystemSemanticGroups}>
                {designSystemSemanticTypographyGroups.map((group) => (
                  <section key={group.key} className={styles.designSystemSemanticGroup}>
                    <div className={styles.designSystemSemanticGroupHeader}>
                      <div className={styles.designSystemSemanticGroupTitleRow}>
                        <h4>{group.label}</h4>
                        <span className={styles.designSystemSemanticGroupCount}>
                          {group.items.length}
                        </span>
                      </div>
                      <p>{group.description}</p>
                    </div>
                    <div className={styles.designSystemSemanticList}>
                      {group.items.map((item) => (
                        <article key={item.token} className={styles.designSystemSemanticRow}>
                          <div className={styles.designSystemSemanticTokenBlock}>
                            <p className={styles.designSystemSemanticTokenName}>{item.name}</p>
                            <p className={styles.designSystemSemanticTokenCode}>{item.token}</p>
                            <p className={styles.designSystemSemanticUsage}>{item.usage}</p>
                          </div>
                          <div
                            className={`${styles.designSystemSemanticValue} ${styles.designSystemTypographyValue}`}
                          >
                            <span className={styles.designSystemTypographyValueMain}>{item.value}</span>
                            {item.sourceValue ? (
                              <span className={styles.designSystemTypographyValueSource}>
                                {item.sourceValue}
                              </span>
                            ) : null}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </section>
          )}
        </>
      ) : designSystemTab === "spacing" ? (
        <>
          <div className={styles.designSystemSubTabs} role="tablist" aria-label="Spacing token layers">
            <button
              type="button"
              role="tab"
              aria-selected={designSystemSpacingTab === "primitive"}
              className={`${styles.designSystemSubTab} ${
                designSystemSpacingTab === "primitive" ? styles.designSystemSubTabActive : ""
              }`}
              onClick={() => setDesignSystemSpacingTab("primitive")}
            >
              Primitive
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={designSystemSpacingTab === "semantic"}
              className={`${styles.designSystemSubTab} ${
                designSystemSpacingTab === "semantic" ? styles.designSystemSubTabActive : ""
              }`}
              onClick={() => setDesignSystemSpacingTab("semantic")}
            >
              Semantic
            </button>
          </div>
          <section className={styles.designSystemPanel}>
            <div className={styles.componentsPanelHeader}>
              <h3>{designSystemSpacingTab === "primitive" ? "Primitive Spacing Tokens" : "Semantic Spacing Tokens"}</h3>
              <p>
                {designSystemSpacingTab === "primitive"
                  ? "Base spacing scale values."
                  : "Intent-based spacing aliases for components and layouts."}
              </p>
            </div>
            {designSystemSpacingTab === "primitive" ? (
              <section className={styles.spacingShowcase}>
                <div className={styles.spacingShowcaseHeader}>
                  <h4>Spacing Scale</h4>
                  <p>Token documentation with rem, px, and a visual size sample.</p>
                </div>
                <div className={styles.spacingShowcaseTableWrap}>
                  <table className={styles.spacingShowcaseTable} aria-label="Spacing scale showcase">
                    <thead>
                      <tr>
                        <th>Token</th>
                        <th>rem</th>
                        <th>px</th>
                        <th>Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      {primitiveSpacingShowcaseRows.map((row) => (
                        <tr key={row.token}>
                          <td>{row.token}</td>
                          <td>{row.rem}</td>
                          <td>{row.px}</td>
                          <td>
                            <span
                              className={styles.spacingShowcaseSwatch}
                              style={{ width: `${row.sizePx}px`, height: `${row.sizePx}px` }}
                              aria-hidden="true"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : (
              renderFoundationGroups(semanticSpacingGroups, "spacing-semantic")
            )}
          </section>
        </>
      ) : designSystemTab === "icons" ? (
        <section className={styles.designSystemPanel}>
          <div className={styles.componentsPanelHeader}>
            <h3>Icon Inventory</h3>
            <p>Real icons used in Post Fixe and bottom navigation.</p>
            <p>Library: Material Symbols Outlined</p>
            <p>
              Source: <a href="https://fonts.google.com/icons" target="_blank" rel="noreferrer">https://fonts.google.com/icons</a>
            </p>
          </div>
          <div className={styles.iconInventoryGroups}>
            {designSystemIconGroups.map((group) => (
              <section key={group.key} className={styles.iconInventoryGroup}>
                <div className={styles.iconInventoryGroupHeader}>
                  <div className={styles.designSystemSemanticGroupTitleRow}>
                    <h4>{group.label}</h4>
                    <span className={styles.designSystemSemanticGroupCount}>{group.items.length}</span>
                  </div>
                  <p>{group.description}</p>
                </div>
                <div className={styles.iconInventoryGrid}>
                  {group.items.map((item) => (
                    <article key={`${group.key}-${item.name}`} className={styles.iconInventoryCard}>
                      <div className={styles.iconInventoryPreview}>
                        <span className={styles.iconInventoryGlyph} aria-hidden="true">
                          {item.preview.glyph}
                        </span>
                      </div>
                      <p className={styles.iconInventoryName}>{item.name}</p>
                      <p className={styles.iconInventoryMeta}>{item.size}</p>
                      <p className={styles.iconInventoryUsage}>{item.usage}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      ) : designSystemTab === "elevation" ? (
        <section className={styles.designSystemPanel}>
          <div className={styles.componentsPanelHeader}>
            <h3>Semantic Elevation Tokens</h3>
            <p>Elevation roles mapped from shadow primitives.</p>
          </div>
          <section className={styles.elevationShowcase}>
            <div className={styles.elevationShowcaseHeader}>
              <h4>Elevation Showcase</h4>
              <p>Live depth examples using resolved token values.</p>
            </div>
            <div className={styles.elevationShowcaseGrid}>
              {elevationShowcaseCards.map((card) => (
                <article key={card.token} className={styles.elevationShowcaseCard}>
                  <div className={styles.elevationShowcaseTop}>
                    <p className={styles.elevationShowcaseName}>{card.label}</p>
                    <p className={styles.elevationShowcaseToken}>{card.token}</p>
                  </div>
                  <div className={styles.elevationShowcasePreviewWrap}>
                    {card.kind === "focus" ? (
                      <button
                        type="button"
                        className={styles.elevationFocusPreview}
                        style={{ boxShadow: card.value }}
                      >
                        Focus
                      </button>
                    ) : (
                      <div
                        className={`${styles.elevationSampleSurface} ${
                          card.kind === "inset" ? styles.elevationSampleInset : ""
                        }`}
                        style={{ boxShadow: card.value }}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <p className={styles.elevationShowcaseUsage}>{card.usage}</p>
                  <p className={styles.elevationShowcaseValue}>{card.value}</p>
                  {card.sourceValue ? (
                    <p className={styles.elevationShowcaseSource}>{card.sourceValue}</p>
                  ) : null}
                </article>
              ))}
            </div>
            <div className={styles.elevationDepthDemo}>
              <p className={styles.elevationDepthTitle}>Depth Stack Example</p>
              <div className={styles.elevationDepthScene}>
                <div
                  className={styles.elevationDepthLayerBase}
                  style={{ boxShadow: semanticElevationTokenMap.get("flat")?.value ?? "none" }}
                >
                  Base Surface
                </div>
                <div
                  className={styles.elevationDepthLayerCard}
                  style={{ boxShadow: semanticElevationTokenMap.get("raised.sm")?.value ?? "none" }}
                >
                  Card
                </div>
                <div
                  className={styles.elevationDepthLayerPopover}
                  style={{ boxShadow: semanticElevationTokenMap.get("overlay.sm")?.value ?? "none" }}
                >
                  Popover
                </div>
                <div
                  className={styles.elevationDepthLayerModal}
                  style={{ boxShadow: semanticElevationTokenMap.get("overlay.md")?.value ?? "none" }}
                >
                  Modal
                </div>
              </div>
            </div>
          </section>
          {renderFoundationGroups(semanticElevationGroups, "elevation-semantic")}
        </section>
      ) : designSystemTab === "radius" ? (
        <section className={styles.designSystemPanel}>
          <div className={styles.componentsPanelHeader}>
            <h3>Primitive Radius Tokens</h3>
            <p>Corner radius values for components and surfaces.</p>
          </div>
          {renderFoundationGroups(primitiveRadiusGroups, "radius-primitive")}
        </section>
      ) : designSystemTab === "shadow" ? (
        <section className={styles.designSystemPanel}>
          <div className={styles.componentsPanelHeader}>
            <h3>Primitive Shadow Tokens</h3>
            <p>Shadow recipes and focus ring primitives.</p>
          </div>
          {renderFoundationGroups(primitiveShadowGroups, "shadow-primitive")}
        </section>
      ) : designSystemTab === "motion" ? (
        <section className={styles.designSystemPanel}>
          <div className={styles.componentsPanelHeader}>
            <h3>Primitive Motion Tokens</h3>
            <p>Duration, easing, and delay foundations.</p>
          </div>
          {renderFoundationGroups(primitiveMotionGroups, "motion-primitive")}
        </section>
      ) : designSystemTab === "opacity" ? (
        <section className={styles.designSystemPanel}>
          <div className={styles.componentsPanelHeader}>
            <h3>Primitive Opacity Tokens</h3>
            <p>Opacity levels for disabled, muted, and overlay states.</p>
          </div>
          {renderFoundationGroups(primitiveOpacityGroups, "opacity-primitive")}
        </section>
      ) : null}
    </div>
  );

  const canvasTheme: "light" | "dark" = "light";
  const canvasFrameTheme = theme;

  return (
    <div
      className={`${styles.page} ${isSidebarResizing ? styles.pageResizing : ""}`}
      data-theme={theme}
    >
      <aside className={styles.sidebar} style={{ width: `${sidebarWidth}px` }}>
        <div className={styles.sidebarTop}>
          <h1 className={styles.header}>Design Lab</h1>
          <div className={styles.settingsMenu}>
            <button
              className={styles.menuTrigger}
              type="button"
              aria-label="Open design lab menu"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <span className={styles.selectArrow} aria-hidden="true">
                keyboard_arrow_down
              </span>
            </button>
            {isMenuOpen ? (
              <div className={styles.menuDropdown}>
                <p className={styles.menuSectionTitle}>Theme</p>
                <button
                  className={`${styles.menuItem} ${theme === "dark" ? styles.menuItemActive : ""}`}
                  type="button"
                  onClick={() => {
                    setTheme("dark");
                    setIsMenuOpen(false);
                  }}
                >
                  Dark mode
                </button>
                <button
                  className={`${styles.menuItem} ${theme === "light" ? styles.menuItemActive : ""}`}
                  type="button"
                  onClick={() => {
                    setTheme("light");
                    setIsMenuOpen(false);
                  }}
                >
                  Light mode
                </button>
                <p className={styles.menuSectionTitle}>Device Frame</p>
                <button
                  className={`${styles.menuItem} ${showDeviceFrame ? styles.menuItemActive : ""}`}
                  type="button"
                  onClick={() => {
                    setShowDeviceFrame(true);
                    setIsMenuOpen(false);
                  }}
                >
                  On
                </button>
                <button
                  className={`${styles.menuItem} ${!showDeviceFrame ? styles.menuItemActive : ""}`}
                  type="button"
                  onClick={() => {
                    setShowDeviceFrame(false);
                    setIsMenuOpen(false);
                  }}
                >
                  Off
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className={styles.tabsPanel}>
          <div className={styles.canvasTabs}>
            <p className={styles.tabsLabel}>Final Design</p>
            <button
              className={`${styles.canvasTab} ${isWorkerAppScreen ? styles.activeTab : ""}`}
              type="button"
              aria-expanded={isWorkerAppOpen}
              onClick={() => setIsWorkerAppOpen((prev) => !prev)}
            >
              <span className={styles.parentTabRow}>
                <span>{WORKER_APP_TAB_NAME}</span>
                <span
                  className={`${styles.parentTabArrow} ${
                    isWorkerAppOpen ? styles.parentTabArrowExpanded : ""
                  }`}
                  aria-hidden="true"
                >
                  keyboard_arrow_down
                </span>
              </span>
            </button>
            {isWorkerAppOpen ? (
            <div className={styles.subTabs}>
              <button
                className={`${styles.subTab} ${activeScreen === "prototype" ? styles.activeSubTab : ""}`}
                type="button"
                onClick={() => {
                  setActiveScreen("prototype");
                  setIsWorkerAppOpen(true);
                }}
              >
                {WORKER_APP_CANVAS_NAME}
              </button>
              <div className={styles.subTabDivider} aria-hidden="true" />
              <button
                className={`${styles.subTab} ${activeScreen === "postFixe" ? styles.activeSubTab : ""}`}
                type="button"
                onClick={() => {
                  setActiveScreen("postFixe");
                  setPostFixeFrameView("data");
                  setIsWorkerAppOpen(true);
                }}
              >
                <span className={styles.subTabLabelRow}>
                  <span>{WORKER_APP_POST_FIXE_PAGE_NAME}</span>
                  <span className={styles.devReadyBadge}>
                    <span className={styles.devReadyDot} aria-hidden="true" />
                    Ready for dev
                  </span>
                </span>
              </button>
              <div className={styles.subTabDivider} aria-hidden="true" />
              <button
                className={`${styles.subTab} ${activeScreen === "getStarted" ? styles.activeSubTab : ""}`}
                type="button"
                onClick={() => {
                  setActiveScreen("getStarted");
                  setIsWorkerAppOpen(true);
                }}
              >
                {WORKER_APP_GET_STARTED_PAGE_NAME}
              </button>
              <button
                className={`${styles.subTab} ${activeScreen === "getStartedV2" ? styles.activeSubTab : ""}`}
                type="button"
                onClick={() => {
                  setActiveScreen("getStartedV2");
                  setIsWorkerAppOpen(true);
                }}
              >
                {WORKER_APP_GET_STARTED_V2_PAGE_NAME}
              </button>
              <button
                className={`${styles.subTab} ${activeScreen === "home" ? styles.activeSubTab : ""}`}
                type="button"
                onClick={() => {
                  setActiveScreen("home");
                  setIsWorkerAppOpen(true);
                }}
              >
                {WORKER_APP_HOME_PAGE_NAME}
              </button>
              <button
                className={`${styles.subTab} ${activeScreen === "travail" ? styles.activeSubTab : ""}`}
                type="button"
                onClick={() => {
                  setActiveScreen("travail");
                  setIsWorkerAppOpen(true);
                }}
              >
                {WORKER_APP_TRAVAIL_PAGE_NAME}
              </button>
              <button
                className={`${styles.subTab} ${activeScreen === "boite" ? styles.activeSubTab : ""}`}
                type="button"
                onClick={() => {
                  setActiveScreen("boite");
                  setIsWorkerAppOpen(true);
                }}
              >
                {WORKER_APP_BOITE_PAGE_NAME}
              </button>
              <button
                className={`${styles.subTab} ${activeScreen === "profile" ? styles.activeSubTab : ""}`}
                type="button"
                onClick={() => {
                  setActiveScreen("profile");
                  setIsWorkerAppOpen(true);
                }}
              >
                {WORKER_APP_PROFILE_PAGE_NAME}
              </button>
              <button
                className={`${styles.subTab} ${activeScreen === "synchronisation" ? styles.activeSubTab : ""}`}
                type="button"
                onClick={() => {
                  setActiveScreen("synchronisation");
                  setIsWorkerAppOpen(true);
                }}
              >
                {WORKER_APP_SYNCHRONISATION_PAGE_NAME}
              </button>
            </div>
            ) : null}
          </div>
        </div>
      </aside>
      <button
        type="button"
        className={`${styles.sidebarResizer} ${
          isSidebarResizing ? styles.sidebarResizerActive : ""
        }`}
        aria-label="Resize sidebar"
        onPointerDown={(event) => {
          event.preventDefault();
          sidebarResizeStartXRef.current = event.clientX;
          sidebarResizeStartWidthRef.current = sidebarWidth;
          setIsSidebarResizing(true);
        }}
      />

      <main className={styles.canvasArea} data-theme="light">
        <div
          className={`${styles.canvasPage} ${
            canvasView === "components" ? styles.canvasPageComponents : ""
          }`}
        >
          <div className={styles.canvasTopBar}>
            <div className={styles.canvasTopLeft}>
              <p className={styles.canvasPageTitle}>{activePageTitle}</p>
              {resolvedActiveScreen === "postFixe" ? (
                <div className={styles.canvasViewSwitch} role="tablist" aria-label="Canvas view">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={resolvedCanvasView === "design"}
                    className={`${styles.canvasViewTab} ${
                      resolvedCanvasView === "design" ? styles.canvasViewTabActive : ""
                    }`}
                    onClick={() => setCanvasView("design")}
                  >
                    Prototype
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={resolvedCanvasView === "frames"}
                    className={`${styles.canvasViewTab} ${
                      resolvedCanvasView === "frames" ? styles.canvasViewTabActive : ""
                    }`}
                    onClick={() => setCanvasView("frames")}
                  >
                    Frames
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          {resolvedActiveScreen === "postFixe" ? (
            <div className={styles.frameViewRail} role="tablist" aria-label="Post Fixe states">
              <button
                type="button"
                role="tab"
                aria-selected={postFixeFrameView === "data"}
                className={`${styles.frameViewRailTab} ${
                  postFixeFrameView === "data" ? styles.frameViewRailTabActive : ""
                }`}
                onClick={() => setPostFixeFrameView("data")}
              >
                Design
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={postFixeFrameView === "loading"}
                className={`${styles.frameViewRailTab} ${
                  postFixeFrameView === "loading" ? styles.frameViewRailTabActive : ""
                }`}
                onClick={() => setPostFixeFrameView("loading")}
              >
                Loading
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={postFixeFrameView === "empty"}
                className={`${styles.frameViewRailTab} ${
                  postFixeFrameView === "empty" ? styles.frameViewRailTabActive : ""
                }`}
                onClick={() => setPostFixeFrameView("empty")}
              >
                Empty
              </button>
            </div>
          ) : null}

          {resolvedCanvasView === "frames" ? (
            <div className={styles.componentsCanvas}>
              <section className={styles.componentsPanel}>
                <div className={styles.componentsPanelHeader}>
                  <h3>Core Flow</h3>
                  <p>Post Fixe frames in user journey order</p>
                </div>
                <div className={styles.framesGroups}>
                  {postFixeCoreFrameGroups.map((group) => (
                    <div key={group.id} className={styles.framesGroup}>
                      <div className={styles.framesGroupHeader}>
                        <h4>{group.title}</h4>
                        <p>{group.note}</p>
                      </div>
                      <div className={styles.componentsCardsGrid}>
                        {group.frameIds.map((frameId) => {
                          const frame = postFixeCoreFrames.find((item) => item.id === frameId);
                          if (!frame) {
                            return null;
                          }

                          return (
                            <article key={frame.id} className={styles.componentCardItem}>
                              <p className={styles.componentCardStateLabel}>{frame.id}</p>
                              <div className={styles.componentPosteCard}>
                                <h4>{frame.title}</h4>
                                <p className={styles.componentPosteCardMeta}>{frame.note}</p>
                              </div>
                              <div className={styles.detailPreviewWidth}>
                                <WorkerAppPostFixePage
                                  showDeviceFrame={showDeviceFrame}
                                  theme={canvasTheme}
                                  frameTheme={canvasFrameTheme}
                                  frameView={frame.frameView}
                                  previewState={frame.previewState}
                                  previewObservationPhase={
                                    "previewObservationPhase" in frame
                                      ? frame.previewObservationPhase
                                      : undefined
                                  }
                                  isInteractive={false}
                                />
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.componentsPanel}>
                <div className={styles.componentsPanelHeader}>
                  <h3>System States</h3>
                  <p>Supporting frames outside the main happy path</p>
                </div>
                <div className={styles.componentsCardsGrid}>
                  {postFixeSystemFrames.map((frame) => (
                    <article key={frame.id} className={styles.componentCardItem}>
                      <p className={styles.componentCardStateLabel}>{frame.id}</p>
                      <div className={styles.componentPosteCard}>
                        <h4>{frame.title}</h4>
                        <p className={styles.componentPosteCardMeta}>{frame.note}</p>
                      </div>
                      <div className={styles.detailPreviewWidth}>
                        <WorkerAppPostFixePage
                          showDeviceFrame={showDeviceFrame}
                          theme={canvasTheme}
                          frameTheme={canvasFrameTheme}
                          frameView={frame.frameView}
                          previewState={frame.previewState}
                          isInteractive={false}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          ) : canvasView === "components" ? (
            <div className={styles.componentsCanvas}>
              <section className={styles.componentsPanel}>
                <div className={styles.componentsPanelHeader}>
                  <h3>App Shell</h3>
                  <p>Core shell components used across the mobile worker experience.</p>
                </div>
                <div className={styles.componentShellGrid}>
                  <article className={styles.componentShellCard}>
                    <p className={styles.componentCardStateLabel}>Bottom Navigation</p>
                    <div className={styles.componentBottomNavPreview}>
                      <div className={styles.componentBottomNavItem}>
                        <span className={styles.componentBottomNavIconContainer}>
                          <span className={styles.componentBottomNavIcon}>home</span>
                        </span>
                        <span>Accueil</span>
                      </div>
                      <div className={styles.componentBottomNavItem}>
                        <span className={styles.componentBottomNavIconContainer}>
                          <span className={styles.componentBottomNavIcon}>assignment</span>
                        </span>
                        <span>Travail</span>
                      </div>
                      <div className={`${styles.componentBottomNavItem} ${styles.componentBottomNavItemActive}`}>
                        <span className={styles.componentBottomNavIconContainer}>
                          <span className={styles.componentBottomNavIcon}>view_timeline</span>
                        </span>
                        <span>Post Fixe</span>
                      </div>
                      <div className={styles.componentBottomNavItem}>
                        <span className={styles.componentBottomNavIconContainer}>
                          <span className={styles.componentBottomNavIcon}>inbox</span>
                        </span>
                        <span>Boîte</span>
                      </div>
                    </div>
                  </article>
                </div>
                <div className={styles.detailPreviewWidth}>
                  <div className={styles.componentListHeaderSurface}>
                    <article className={styles.componentListHeaderPreview}>
                      <div className={styles.componentListHeaderTitleBlock}>
                        <h4 className={styles.componentListHeaderTitle}>Post Fixe</h4>
                        <p className={styles.componentListHeaderSubtitle}>Campagne 2025-2026</p>
                      </div>
                      <div className={styles.componentListHeaderActions}>
                        <span className={styles.componentSyncBadgePreview} aria-hidden="true">
                          <span className={styles.componentSymbol}>cloud</span>
                        </span>
                        <span className={styles.componentAvatarPreview}>OE</span>
                      </div>
                    </article>
                  </div>
                </div>
                {showDevAnnotations ? (
                  <ComponentAnnotationPanel
                    ariaLabel="Poste Fixe list header specs"
                    legend={[
                      { index: 1, label: "Title block (Post Fixe + campaign subtitle)" },
                      { index: 2, label: "Sync badge (state icon, 40px wrap)" },
                      { index: 3, label: "Avatar badge (40px wrap)" },
                    ]}
                    specs={[
                      { attribute: "Header content height", value: "48px" },
                      { attribute: "Title size / weight", value: "20px / 600" },
                      { attribute: "Subtitle size / weight", value: "12px / 400" },
                      { attribute: "Right action gap", value: "8px" },
                    ]}
                    colors={[
                      { name: "Header surface", hex: "#F3F5F7" },
                      { name: "Primary text", hex: "#1A2623" },
                      { name: "Subtitle text", hex: "#616161" },
                      { name: "Avatar background", hex: "#E6F7F1" },
                      { name: "Avatar text", hex: "#01A362" },
                      { name: "Sync icon", hex: "#9E9E9E" },
                    ]}
                    behaviors={[
                      { key: "Sticky behavior", value: "Stays fixed at top of mobile list flow" },
                      {
                        key: "Hierarchy",
                        value: "Title remains dominant over subtitle and right actions.",
                      },
                      { key: "Touch target", value: "Sync + avatar are 40px targets." },
                    ]}
                  />
                ) : null}
              </section>

              <section className={styles.componentsPanel}>
                <div className={styles.componentsPanelHeader}>
                  <h3>Poste Fixe Cards</h3>
                  <p>Design and state variants</p>
                </div>
                <div className={styles.componentsMetaRow}>
                  <span className={styles.componentsMetaChip}>Radius 14px</span>
                  <span className={styles.componentsMetaChip}>Padding 14px</span>
                  <span className={styles.componentsMetaChip}>Progress 6px</span>
                  <span className={styles.componentsMetaChip}>Chevron 18px</span>
                </div>
                <div className={styles.componentsCardsGrid}>
                  {posteFixeComponentStates.map((state) => (
                    <article key={state.label} className={styles.componentCardItem}>
                      <p className={styles.componentCardStateLabel}>{state.label}</p>
                      <div className={styles.componentPosteCard}>
                        <div className={styles.componentPosteCardHeader}>
                          <h4>{state.name}</h4>
                          <span className={styles.componentChevron} aria-hidden="true">
                            chevron_right
                          </span>
                        </div>
                        <p className={styles.componentPosteCardSector}>{state.sector}</p>
                        <p className={styles.componentPosteCardMeta}>
                          Début : {state.startDate} · Modifié le {state.updatedDate}
                        </p>
                        <p className={styles.componentPosteCardProgressText}>
                          {state.completed} / {state.total} observations complétées · {state.progress}%
                        </p>
                        {renderComponentMilestones(state.completed)}
                      </div>
                    </article>
                  ))}

                  <article className={styles.componentCardItem}>
                    <p className={styles.componentCardStateLabel}>Loading</p>
                    <div className={`${styles.componentPosteCard} ${styles.componentPosteCardLoading}`}>
                      <span className={styles.componentSkeletonTitle} aria-hidden="true" />
                      <span className={styles.componentSkeletonSub} aria-hidden="true" />
                      <span className={styles.componentSkeletonMeta} aria-hidden="true" />
                      <span className={styles.componentSkeletonMetaWide} aria-hidden="true" />
                      <div className={styles.componentsProgressTrack} aria-hidden="true">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span key={index} className={styles.componentSkeletonSegment} />
                        ))}
                      </div>
                    </div>
                  </article>
                </div>

                {showDevAnnotations ? (
                  <ComponentAnnotationPanel
                  ariaLabel="Poste Fixe card specs"
                  legend={[
                    { index: 1, label: "Card container (tap target)" },
                    { index: 2, label: "Title + chevron header row" },
                    { index: 3, label: "Secteur + dates text block" },
                    { index: 4, label: "Progress summary text" },
                    { index: 5, label: "5-step milestone bar" },
                  ]}
                  specs={[
                    { attribute: "Container radius", value: "14px" },
                    { attribute: "Container padding", value: "14px" },
                    { attribute: "Row spacing", value: "Title->sector 4px, sector->dates 4px, dates->progress 8px, progress->bar 8px" },
                    { attribute: "Title size / weight", value: "15px / 600 (single-line, ellipsis)" },
                    { attribute: "Sector size / weight", value: "14px / 400 (single-line, ellipsis)" },
                    { attribute: "Dates size / weight", value: "12px / 400 (single-line, ellipsis)" },
                    { attribute: "Progress text size / weight", value: "12px / 500 (single-line, ellipsis)" },
                    { attribute: "Progress segment height", value: "6px" },
                    { attribute: "Segment gap", value: "4px" },
                    { attribute: "Card min tap target", value: ">= 44px height (full card tappable)" },
                    { attribute: "Date format", value: "Début : DD MMM · Modifié le DD MMM (fr-FR)" },
                  ]}
                  colors={[
                    { name: "Card background", hex: "#FFFFFF" },
                    { name: "Primary text", hex: "#1A2623" },
                    { name: "Secondary text", hex: "#667774" },
                    { name: "Meta text", hex: "#808A90" },
                    { name: "Progress active", hex: "#01A362" },
                    { name: "Progress inactive", hex: "#E2E8E6" },
                  ]}
                  behaviors={[
                    {
                      key: "Source of truth",
                      value: "completed/total drives both percentage label and filled milestones; do not derive from card title label.",
                    },
                    {
                      key: "Overflow contract",
                      value: "All text rows are single-line with ellipsis; no wrapping in card list.",
                    },
                    {
                      key: "Interaction",
                      value: "Entire card is one button; chevron is affordance only (not separate action).",
                    },
                    {
                      key: "Accessibility",
                      value: "Button label: \"{Poste} {Secteur}, {completed} sur {total} observations, {progress}%\"; visible focus ring required.",
                    },
                    {
                      key: "Loading contract",
                      value: "Skeleton variant mirrors final layout; show until data resolves and keep visible minimum 300ms to avoid flicker.",
                    },
                  ]}
                  />
                ) : null}
              </section>

              <section className={styles.componentsPanel}>
                <div className={styles.componentsPanelHeader}>
                  <h3>Main Page Empty State</h3>
                  <p>Shown when there are no assigned postes fixes</p>
                </div>
                <div className={styles.detailPreviewWidth}>
                  <div className={styles.componentEmptyStatePreview}>
                    <span className={styles.componentEmptyStateIconWrap} aria-hidden="true">
                      <span className={styles.componentSymbol}>folder_open</span>
                    </span>
                    <p className={styles.componentEmptyStateTitle}>Aucun poste fixe</p>
                    <p className={styles.componentEmptyStateText}>
                      Vos postes fixes apparaîtront ici une fois assignés
                    </p>
                  </div>
                </div>
                {showDevAnnotations ? (
                  <ComponentAnnotationPanel
                  ariaLabel="Poste Fixe empty state specs"
                  legend={[
                    { index: 1, label: "Empty icon container" },
                    { index: 2, label: "Title message" },
                    { index: 3, label: "Supporting message" },
                  ]}
                  specs={[
                    { attribute: "Card radius", value: "18px" },
                    { attribute: "Card padding", value: "24px 18px" },
                    { attribute: "Icon wrap", value: "56px" },
                    { attribute: "Title size / weight", value: "16px / 500" },
                    { attribute: "Subtitle size / weight", value: "13px / 400" },
                  ]}
                  colors={[
                    { name: "Surface", hex: "#FFFFFF" },
                    { name: "Icon wrap", hex: "#EEF2F4" },
                    { name: "Icon", hex: "#9AA6B2" },
                    { name: "Title", hex: "#3D4C5C" },
                    { name: "Subtitle", hex: "#7B8899" },
                  ]}
                  behaviors={[
                    {
                      key: "Rendering rule",
                      value: "Only shown when data source returns no postes fixes.",
                    },
                    {
                      key: "Layout",
                      value: "Centered content for calm and fast comprehension.",
                    },
                    {
                      key: "No false CTA",
                      value: "No add action because postes are assigned externally.",
                    },
                  ]}
                  />
                ) : null}
              </section>

              <section className={styles.componentsPanel}>
                <div className={styles.componentsPanelHeader}>
                  <h3>Poste Fixe Details</h3>
                  <p>Detail header and campaign summary blocks</p>
                </div>
                <div className={styles.componentsMetaRow}>
                  <span className={styles.componentsMetaChip}>Header row 48px</span>
                  <span className={styles.componentsMetaChip}>Back icon 24px</span>
                  <span className={styles.componentsMetaChip}>Title 20 / 600</span>
                  <span className={styles.componentsMetaChip}>Subtitle 11 / 400</span>
                  <span className={styles.componentsMetaChip}>Campaign progress 6px</span>
                </div>

                <div className={styles.detailComponentRows}>
                  <article className={styles.detailComponentRow}>
                    <p className={styles.componentCardStateLabel}>Header</p>
                    <div className={styles.detailPreviewWidth}>
                      <div className={styles.detailHeaderPreview}>
                        <span className={styles.detailBackButton} aria-hidden="true">
                          arrow_back
                        </span>
                        <div className={styles.detailHeaderText}>
                          <p className={styles.detailHeaderTitle}>Poste Fixe 5097</p>
                          <p className={styles.detailHeaderSubtitle}>Secteur S4</p>
                        </div>
                      </div>
                    </div>
                  </article>

                  <article className={styles.detailComponentRow}>
                    <p className={styles.componentCardStateLabel}>Campagne</p>
                    <div className={styles.detailPreviewWidth}>
                      <div className={styles.componentPosteCard}>
                        <h4 className={styles.detailCampaignTitle}>Campagne 2025-2026</h4>
                        <p className={styles.detailCampaignMeta}>
                          Début : 20 Mai · Modifié le 27 Juil
                        </p>
                        <p className={styles.componentPosteCardProgressText}>
                          3 / 5 observations complétées · 60%
                        </p>
                        {renderComponentMilestones(3)}
                      </div>
                    </div>
                  </article>

                  <article className={styles.detailComponentRow}>
                    <p className={styles.componentCardStateLabel}>Configuration</p>
                    <div className={styles.detailPreviewWidth}>
                      <div className={styles.componentConfigCard}>
                        <div className={styles.componentConfigRows}>
                          <p className={styles.componentConfigLine}>
                            <span className={styles.componentConfigIcon}>water_drop</span>
                            Goutte-à-goutte en surface
                          </p>
                          <p className={styles.componentConfigLine}>
                            <span className={styles.componentConfigIcon}>water</span>
                            Forage
                          </p>
                          <p className={styles.componentConfigLine}>
                            <span className={styles.componentConfigIcon}>star</span>
                            Qualité : Bonne
                          </p>
                        </div>
                        <div className={styles.componentConfigFooter}>
                          <span>MAJ : 28 Avr</span>
                          <button type="button" className={styles.componentConfigActionButton}>
                            Modifier
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
                {showDevAnnotations ? (
                  <ComponentAnnotationPanel
                  ariaLabel="Poste Fixe details header and campaign specs"
                  legend={[
                    { index: 1, label: "Back button + title block" },
                    { index: 2, label: "Campaign title and date row" },
                    { index: 3, label: "Progress row + milestones" },
                  ]}
                  specs={[
                    { attribute: "Header row height", value: "48px" },
                    { attribute: "Header gap", value: "8px" },
                    { attribute: "Campaign card radius", value: "14px" },
                    { attribute: "Campaign card padding", value: "12px" },
                    { attribute: "Campaign title", value: "16px / 500" },
                    { attribute: "Progress line", value: "6px segments" },
                  ]}
                  colors={[
                    { name: "Header title", hex: "#1A2623" },
                    { name: "Header subtitle", hex: "#7B8899" },
                    { name: "Campaign surface", hex: "#FFFFFF" },
                    { name: "Campaign meta", hex: "#808A90" },
                    { name: "Progress active", hex: "#01A362" },
                    { name: "Progress inactive", hex: "#E2E8E6" },
                  ]}
                  behaviors={[
                    {
                      key: "Back navigation",
                      value: "Always returns to Poste Fixe list without changing list header state.",
                    },
                    {
                      key: "Campaign summary",
                      value: "Uses same progress semantics as Poste Fixe cards for consistency.",
                    },
                    {
                      key: "Density",
                      value: "Compact block to preserve space for observations below.",
                    },
                  ]}
                  />
                ) : null}

                <div className={styles.detailObservationsSection}>
                  <p className={styles.componentCardStateLabel}>Observations</p>
                  <div className={styles.detailPreviewWidth}>
                    <div className={styles.detailObservationsList}>
                      {posteFixeDetailObservationStates.map((state) => (
                        <article key={`real-${state.title}`} className={styles.detailObservationItem}>
                          <span
                            className={`${styles.detailObservationIconWrap} ${
                              state.tone === "violet"
                                ? styles.detailObservationToneViolet
                                : state.tone === "blue"
                                  ? styles.detailObservationToneBlue
                                  : state.tone === "orange"
                                    ? styles.detailObservationToneOrange
                                    : state.tone === "teal"
                                      ? styles.detailObservationToneTeal
                                      : styles.detailObservationToneRose
                            }`}
                            aria-hidden="true"
                          >
                            <span className={styles.detailObservationIcon}>{state.icon}</span>
                          </span>
                          <div className={styles.detailObservationText}>
                            <p className={styles.detailObservationTitle}>{state.title}</p>
                            <p className={styles.detailObservationSubtitle}>{state.subtitle}</p>
                          </div>
                          <span
                            className={`${styles.detailObservationStatus} ${
                              state.status === "En cours"
                                ? styles.detailObservationStatusInProgress
                                : state.status === "Terminé"
                                  ? styles.detailObservationStatusDone
                                  : styles.detailObservationStatusNotStarted
                            }`}
                          >
                            {state.status}
                          </span>
                          <span className={styles.componentChevron} aria-hidden="true">
                            chevron_right
                          </span>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
                {showDevAnnotations ? (
                  <ComponentAnnotationPanel
                  ariaLabel="Observation rows specs"
                  legend={[
                    { index: 1, label: "Icon wrap + icon (phase marker)" },
                    { index: 2, label: "Observation title + last update line" },
                    { index: 3, label: "Status chip (Pas commencé / En cours / Terminé)" },
                    { index: 4, label: "Row navigation chevron" },
                  ]}
                  specs={[
                    { attribute: "Row height", value: "64px (content dependent)" },
                    { attribute: "Row horizontal padding", value: "14px" },
                    { attribute: "Icon wrap", value: "40px / radius 10px" },
                    { attribute: "Title size / weight", value: "14px / 500" },
                    { attribute: "Subtitle size / weight", value: "11px / 400" },
                    { attribute: "Status chip", value: "22px height" },
                  ]}
                  colors={[
                    { name: "Row surface", hex: "#FFFFFF" },
                    { name: "Title", hex: "#4A5A53" },
                    { name: "Subtitle", hex: "#7F8996" },
                    { name: "Status done", hex: "#E6F7F1" },
                    { name: "Status in progress", hex: "#DBEAFE" },
                    { name: "Status not started", hex: "#F3F4F6" },
                  ]}
                  behaviors={[
                    {
                      key: "Variant A",
                      value: "Wireframe style with placeholders to explain structure only.",
                    },
                    {
                      key: "Variant B",
                      value: "Mirrors current app data with all five observations.",
                    },
                    {
                      key: "Interaction",
                      value: "Row click navigates to form screen for selected phase.",
                    },
                  ]}
                  />
                ) : null}
              </section>

              <section className={styles.componentsPanel}>
                <div className={styles.componentsPanelHeader}>
                  <h3>Observation Form Components</h3>
                  <p>Inputs, chips, date fields, media area, notes and save/edit actions</p>
                </div>
                <div className={styles.componentsMetaRow}>
                  <span className={styles.componentsMetaChip}>Field labels 12px</span>
                  <span className={styles.componentsMetaChip}>Choice chips 32px</span>
                  <span className={styles.componentsMetaChip}>Input fields 52px</span>
                  <span className={styles.componentsMetaChip}>Primary button 40px</span>
                </div>
                <div className={styles.detailPreviewWidth}>
                  <div className={styles.componentObservationFormPreview}>
                    <div className={styles.componentFormHeader}>
                      <h3 className={styles.componentFormHeaderTitle}>Observation status</h3>
                      <span className={`${styles.detailObservationStatus} ${styles.detailObservationStatusInProgress}`}>
                        En cours
                      </span>
                    </div>

                    <div className={styles.componentFormCard}>
                      <div className={styles.componentFormField}>
                        <p className={styles.componentFormLabel}>Densité florale</p>
                        <div className={styles.componentChipsRow}>
                          <span className={`${styles.componentChoiceChip} ${styles.componentChoiceChipActive}`}>
                            <span className={styles.componentChoiceChipCheck} aria-hidden="true">
                              check
                            </span>
                            Très forte
                          </span>
                          <span className={styles.componentChoiceChip}>Forte</span>
                          <span className={styles.componentChoiceChip}>Moyenne</span>
                          <span className={styles.componentChoiceChip}>Faible</span>
                        </div>
                      </div>

                      <div className={styles.componentDateGrid}>
                        <div className={styles.componentFormField}>
                          <p className={styles.componentFormLabel}>Date début</p>
                          <div className={styles.componentInputMock}>
                            <span>13/03/2026</span>
                            <span className={styles.componentSymbol}>event</span>
                          </div>
                        </div>
                        <div className={styles.componentFormField}>
                          <p className={styles.componentFormLabel}>Date fin</p>
                          <div className={styles.componentInputMock}>
                            <span>Non définie</span>
                            <span className={styles.componentSymbol}>event</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.componentFormField}>
                        <p className={styles.componentFormLabel}>Nombre de vagues (input mode)</p>
                        <div className={styles.componentInputMock}>0</div>
                      </div>

                      <div className={styles.componentFormField}>
                        <p className={styles.componentFormLabel}>Homogénéité (chips mode)</p>
                        <div className={styles.componentChipsRow}>
                          <span className={styles.componentChoiceChip}>90%</span>
                          <span className={styles.componentChoiceChip}>75%</span>
                          <span className={`${styles.componentChoiceChip} ${styles.componentChoiceChipActive}`}>
                            <span className={styles.componentChoiceChipCheck} aria-hidden="true">
                              check
                            </span>
                            50%
                          </span>
                          <span className={styles.componentChoiceChip}>25%</span>
                        </div>
                      </div>

                      <div className={styles.componentFormField}>
                        <p className={styles.componentFormLabel}>Images témoins (optionnel)</p>
                        <div className={styles.componentImagesGrid}>
                          <span className={styles.componentImageThumb} aria-hidden="true">
                            image
                          </span>
                          <span className={styles.componentImageThumb} aria-hidden="true">
                            image
                          </span>
                          <span className={styles.componentImagePlaceholder} aria-hidden="true">
                            add_a_photo
                          </span>
                        </div>
                      </div>

                      <div className={styles.componentFormField}>
                        <p className={styles.componentFormLabel}>Notes (optionnel)</p>
                        <div className={styles.componentTextAreaMock}>Ajouter une note...</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.componentFormActionsRow}>
                    <button type="button" className={styles.componentPrimaryButton}>
                      Enregistrer
                    </button>
                    <button type="button" className={styles.componentGhostButton}>
                      Modifier
                    </button>
                  </div>
                </div>
                {showDevAnnotations ? (
                  <ComponentAnnotationPanel
                  ariaLabel="Observation form component specs"
                  legend={[
                    { index: 1, label: "Section header + status chip" },
                    { index: 2, label: "Density chips (single selection)" },
                    { index: 3, label: "Date start/end fields" },
                    { index: 4, label: "Secondary input/chips mode" },
                    { index: 5, label: "Images + notes areas" },
                    { index: 6, label: "Save / edit action buttons" },
                  ]}
                  specs={[
                    { attribute: "Field label size / weight", value: "12px / 500" },
                    { attribute: "Chip height", value: "32px" },
                    { attribute: "Date/input height", value: "52px" },
                    { attribute: "Image thumb size", value: "64px" },
                    { attribute: "Textarea height", value: "92px" },
                    { attribute: "Primary action height", value: "40px" },
                  ]}
                  colors={[
                    { name: "Form surface", hex: "#FFFFFF" },
                    { name: "Input background", hex: "#EEF2F6" },
                    { name: "Chip selected", hex: "#01A362" },
                    { name: "Chip unselected", hex: "#FFFFFF" },
                    { name: "Chip border", hex: "#C8D2DD" },
                    { name: "Placeholder text", hex: "#96A3AF" },
                  ]}
                  behaviors={[
                    {
                      key: "Single selection",
                      value: "Chips allow only one selected value per field set.",
                    },
                    {
                      key: "Date logic",
                      value: "Start date required; end date optional until phase completes.",
                    },
                    {
                      key: "Read-only mode",
                      value: "When status is Terminé, form is locked and shows Modifier action.",
                    },
                  ]}
                  />
                ) : null}
              </section>

              <section className={styles.componentsPanel}>
                <div className={styles.componentsPanelHeader}>
                  <h3>Observation Unsaved Modal</h3>
                  <p>Confirmation dialog before leaving with unsaved form changes</p>
                </div>
                <div className={styles.detailPreviewWidth}>
                  <div className={styles.componentModalPreview}>
                    <div className={styles.componentModalCard}>
                      <p className={styles.componentModalTitle}>Enregistrer les modifications ?</p>
                      <p className={styles.componentModalText}>
                        Vos changements seront perdus si vous quittez sans enregistrer.
                      </p>
                      <div className={styles.componentModalActions}>
                        <button type="button" className={styles.componentSecondaryButton}>
                          Quitter
                        </button>
                        <button type="button" className={styles.componentPrimaryButton}>
                          Enregistrer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {showDevAnnotations ? (
                  <ComponentAnnotationPanel
                  ariaLabel="Observation unsaved modal specs"
                  legend={[
                    { index: 1, label: "Dialog title" },
                    { index: 2, label: "Support message" },
                    { index: 3, label: "Secondary action" },
                    { index: 4, label: "Primary action" },
                  ]}
                  specs={[
                    { attribute: "Dialog width", value: "min(100%, 360px)" },
                    { attribute: "Dialog radius", value: "14px" },
                    { attribute: "Dialog padding", value: "16px" },
                    { attribute: "Button height", value: "40px" },
                    { attribute: "Button radius", value: "999px" },
                  ]}
                  colors={[
                    { name: "Overlay tint", hex: "#10182799" },
                    { name: "Dialog surface", hex: "#FFFFFF" },
                    { name: "Primary action", hex: "#01A362" },
                    { name: "Primary text", hex: "#FFFFFF" },
                    { name: "Secondary action", hex: "#EEF2F6" },
                    { name: "Secondary text", hex: "#3D4C5C" },
                  ]}
                  behaviors={[
                    {
                      key: "Trigger",
                      value: "Displayed only when user has unsaved changes and attempts to leave.",
                    },
                    {
                      key: "Actions",
                      value: "Quit discards draft; Enregistrer persists and closes modal.",
                    },
                    {
                      key: "Focus",
                      value: "Dialog traps interaction until one action is selected.",
                    },
                  ]}
                  />
                ) : null}
              </section>
            </div>
          ) : canvasView === "iconography" ? (
            <div className={styles.componentsCanvas}>
              <section className={styles.componentsPanel}>
                <div className={styles.componentsPanelHeader}>
                  <h3>Iconography</h3>
                  <p>Icons used in the current worker app UI</p>
                </div>
                <div className={styles.componentsMetaRow}>
                  <span className={styles.componentsMetaChip}>
                    Library: Material Symbols Outlined
                  </span>
                  <span className={styles.componentsMetaChip}>Icon size 20px</span>
                  <span className={styles.componentsMetaChip}>Wrap 34px / 40px</span>
                </div>
                <div className={styles.detailIconsSection}>
                  <div className={styles.detailIconsGrid}>
                    {posteFixeDetailIcons.map((iconItem) => (
                      <article key={iconItem.name} className={styles.detailIconItem}>
                        <span className={styles.detailIconGlyph} aria-hidden="true">
                          {iconItem.icon}
                        </span>
                        <div className={styles.detailIconMeta}>
                          <p className={styles.detailIconName}>{iconItem.name}</p>
                          <p className={styles.detailIconUsage}>{iconItem.usage}</p>
                          <p className={styles.detailIconLibraryName}>
                            Material Symbols Outlined
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          ) : resolvedCanvasView === "designSystem" ? (
            renderDesignSystemWorkspace()
          ) : resolvedActiveScreen === "prototype" ? (
            <WorkerAppFullPrototypePage
              showDeviceFrame={showDeviceFrame}
              theme={canvasTheme}
              frameTheme={canvasFrameTheme}
            />
          ) : resolvedActiveScreen === "home" ? (
            <WorkerAppHomePage
              showDeviceFrame={showDeviceFrame}
              theme={canvasTheme}
              frameTheme={canvasFrameTheme}
            />
          ) : resolvedActiveScreen === "getStartedV2" ? (
            <WorkerAppGetStartedV2Page
              showDeviceFrame={showDeviceFrame}
              theme={canvasTheme}
              frameTheme={canvasFrameTheme}
            />
          ) : resolvedActiveScreen === "travail" ? (
            <WorkerAppTravailPage
              showDeviceFrame={showDeviceFrame}
              theme={canvasTheme}
              frameTheme={canvasFrameTheme}
            />
          ) : resolvedActiveScreen === "postFixe" ? (
            <WorkerAppPostFixePage
              showDeviceFrame={showDeviceFrame}
              theme={canvasTheme}
              frameTheme={canvasFrameTheme}
              frameView={postFixeFrameView}
            />
          ) : resolvedActiveScreen === "boite" ? (
            <WorkerAppBoitePage
              showDeviceFrame={showDeviceFrame}
              theme={canvasTheme}
              frameTheme={canvasFrameTheme}
            />
          ) : resolvedActiveScreen === "profile" ? (
            <WorkerAppProfilePage
              showDeviceFrame={showDeviceFrame}
              theme={canvasTheme}
              frameTheme={canvasFrameTheme}
            />
          ) : resolvedActiveScreen === "synchronisation" ? (
            <WorkerAppSynchronisationPage
              showDeviceFrame={showDeviceFrame}
              theme={canvasTheme}
              frameTheme={canvasFrameTheme}
            />
          ) : (
            <WorkerAppGetStartedPage
              showDeviceFrame={showDeviceFrame}
              theme={canvasTheme}
              frameTheme={canvasFrameTheme}
            />
          )}
        </div>
      </main>
    </div>
  );
}

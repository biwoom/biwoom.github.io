export const storyTagFields = /** @type {const} */ ({
  person: "personTags",
  place: "placeTags",
  topic: "topicTags",
});

/** @typedef {keyof typeof storyTagFields} StoryTagType */
/** @typedef {{type: StoryTagType, label: string, aliases: string[]}} StoryTag */

export const storyTagTypes = /** @type {StoryTagType[]} */ (Object.keys(storyTagFields));
export const storyTagInputFields = [...Object.values(storyTagFields), "aliasTags"];
export const storyTagsPath = "/story/tags/";
export const storyTagInitials = [..."가나다라마바사아자차카타파하"];

// Fold the five doubled initials into the corresponding basic group.
const initialGroups = "가가나다다라마바바사사아자자차카타파하";

/** @param {string} label */
export function storyTagInitial(label) {
  const first = label.trim().normalize("NFKC").charCodeAt(0);
  if (first >= 0xac00 && first <= 0xd7a3) return initialGroups[Math.floor((first - 0xac00) / 588)];
  if (first >= 0x1100 && first <= 0x1112) return initialGroups[first - 0x1100];
  return "other";
}

/** @param {string} text */
export function storyTagSearchKey(text) {
  return text.trim().normalize("NFC").toLowerCase();
}

/** @param {Pick<StoryTag, "type" | "label">} tag */
export function storyTagPath({ type, label }) {
  const segment = encodeURIComponent(label).replace(/[.!'()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
  return `${storyTagsPath}${type}/${segment}/`;
}

function readMap(value, field) {
  if (value === undefined) return {};
  if (value === null || Object.getPrototypeOf(value) !== Object.prototype)
    throw new Error(`${field} must be a mapping`);
  return value;
}

function name(value, field) {
  if (typeof value !== "string" || !value.trim() || /[\/\\%?#\p{Cc}]/u.test(value) || /^\.{1,2}$/.test(value.trim()))
    throw new Error(`${field} must contain plain tag names`);
  return value.trim().normalize("NFC");
}

function names(value, field) {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array of tag names`);
  return [...new Set(value.map(item => name(item, field)))];
}

/** @param {Record<string, unknown>} data @returns {StoryTag[]} */
export function readStoryTags(data) {
  const aliasGroups = readMap(data.aliasTags, "aliasTags");
  for (const type of Object.keys(aliasGroups)) {
    if (!Object.hasOwn(storyTagFields, type)) throw new Error(`Unknown aliasTags type: ${type}`);
  }
  return storyTagTypes.flatMap(type => {
    const field = storyTagFields[type];
    const labels = Object.hasOwn(data, field) ? names(data[field], field) : [];
    const aliasesByLabel = new Map();
    for (const [rawLabel, values] of Object.entries(readMap(aliasGroups[type], `aliasTags.${type}`))) {
      const label = name(rawLabel, `aliasTags.${type}`);
      if (!labels.includes(label)) throw new Error(`aliasTags.${type}: ${label} must also appear in ${field}`);
      if (aliasesByLabel.has(label)) throw new Error(`aliasTags.${type}: duplicate canonical name ${label}`);
      aliasesByLabel.set(label, names(values, `aliasTags.${type}.${label}`));
    }
    return labels.map(label => ({ type, label, aliases: aliasesByLabel.get(label) ?? [] }));
  });
}

/** @template {{source: string, storyTags?: StoryTag[]}} T @param {T[]} documents */
export function indexStoryTags(documents) {
  /** @type {Map<string, StoryTag & {documents: T[]}>} */
  const catalog = new Map();
  const owners = new Map();
  for (const doc of documents) {
    for (const tag of doc.storyTags ?? []) {
      const route = storyTagPath(tag);
      for (const label of [tag.label, ...tag.aliases]) {
        const key = `${tag.type}/${storyTagSearchKey(label)}`;
        const owner = owners.get(key);
        if (owner && owner.route !== route)
          throw new Error(`Story tag ${tag.type}/${label} matches both ${owner.label} (${owner.source}) and ${tag.label} (${doc.source})`);
        if (!owner) owners.set(key, { route, label: tag.label, source: doc.source });
      }
      let item = catalog.get(route);
      if (!item) {
        item = { type: tag.type, label: tag.label, aliases: [], documents: [] };
        catalog.set(route, item);
      }
      item.aliases = [...new Set([...item.aliases, ...tag.aliases])]
        .filter(alias => storyTagSearchKey(alias) !== storyTagSearchKey(tag.label));
      item.documents.push(doc);
    }
  }
  return [...catalog.values()].sort((a, b) => a.label.localeCompare(b.label, "ko"));
}

import { readFile, writeFile } from "node:fs/promises";

const inputPath = "public/data/profile-avatars.csv";
const outputPath = "public/data/profile-avatars.js";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (!quoted && char === ",") {
      row.push(value);
      value = "";
      continue;
    }

    if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function titleFromUrl(url) {
  const match = url.match(/\/([^/?#]+)\.png/i);
  return match?.[1]?.replace(/[-_]+/g, " ") || "Avatar";
}

const csv = await readFile(inputPath, "utf8");
const [headers, ...rows] = parseCsv(csv);
const columns = headers.map((header) => header.trim().toUpperCase());
const groups = new Map();
const seenUrls = new Set();
let currentGroup = "Avatares";

function sectionNameFromEntry(entry) {
  if (/^https?:\/\//i.test(entry.URL)) {
    return "";
  }

  const candidates = [entry.SHOW, entry.ICON, entry.TITLE, entry.ID]
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => !/^(complete|not complete)$/i.test(value))
    .filter((value) => !/^season\b/i.test(value));

  return candidates[0] || "";
}

for (const row of rows) {
  const entry = Object.fromEntries(columns.map((column, index) => [column, row[index]?.trim() || ""]));
  const title = entry.TITLE || entry.ICON || titleFromUrl(entry.URL);
  const url = entry.URL;
  const sectionName = sectionNameFromEntry(entry);

  if (sectionName) {
    currentGroup = sectionName;
  }

  if (!/^https?:\/\//i.test(url) || seenUrls.has(url)) {
    continue;
  }

  seenUrls.add(url);
  const groupName = currentGroup || "Avatares";
  if (!groups.has(groupName)) {
    groups.set(groupName, []);
  }

  const avatars = groups.get(groupName);
  const baseId = slugify(`${groupName}-${title || entry.ID || avatars.length + 1}`) || `avatar-${seenUrls.size}`;
  const duplicateCount = avatars.filter((avatar) => avatar.id === baseId || avatar.id.startsWith(`${baseId}-`)).length;

  avatars.push({
    id: duplicateCount ? `${baseId}-${duplicateCount + 1}` : baseId,
    title,
    image: url,
  });
}

const profileAvatarGroups = [...groups]
  .map(([title, avatars]) => ({ title, avatars }))
  .filter((group) => group.avatars.length > 0);

const output = `export const profileAvatarGroups = ${JSON.stringify(profileAvatarGroups, null, 2)};\n`;
await writeFile(outputPath, output, "utf8");

console.log(`Generated ${profileAvatarGroups.reduce((total, group) => total + group.avatars.length, 0)} avatars in ${profileAvatarGroups.length} groups.`);

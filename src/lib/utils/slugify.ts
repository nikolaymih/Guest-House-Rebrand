// Transliteration map for Cyrillic → Latin
const CYRILLIC: Record<string, string> = {
  а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ж:"zh",з:"z",
  и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",
  р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"ts",ч:"ch",
  ш:"sh",щ:"sht",ъ:"a",ь:"",ю:"yu",я:"ya",
  ё:"yo",э:"e",
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((ch) => CYRILLIC[ch] ?? ch)
    .join("")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

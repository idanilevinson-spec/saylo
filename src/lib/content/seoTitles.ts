// Search results cut a page title at about 60 characters, so a title that
// runs past it loses its end, often the words people searched for. Each
// page offers its titles from fullest to shortest and takes the first that
// fits with the site name after it.

export const TITLE_SUFFIX = " | Saylo";
export const MAX_TITLE = 65;

export function fittingTitle(candidates: string[]): string {
  return candidates.find((t) => (t + TITLE_SUFFIX).length <= MAX_TITLE) ?? candidates[candidates.length - 1];
}

const hasHebrew = (s: string) => /[֐-׿]/.test(s);

export function grammarTopicTitle(nameEn: string, nameHe: string): string {
  return fittingTitle([
    ...(hasHebrew(nameHe) ? [`${nameEn} באנגלית: ${nameHe}, הסבר בעברית ודוגמאות`, `${nameEn} באנגלית: ${nameHe}, הסבר ודוגמאות`] : []),
    `${nameEn} באנגלית: הסבר בעברית ודוגמאות`,
    `${nameEn} באנגלית: הסבר ודוגמאות`,
    `${nameEn}: הסבר בעברית`,
    nameEn,
  ]);
}

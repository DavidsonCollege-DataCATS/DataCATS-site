export function majorMinorLabel(data: {
  majors: string[];
  intendedMajors: string[];
  minor?: string;
}): string {
  const declared = data.majors.length > 0;
  const majors = declared ? data.majors : data.intendedMajors;
  const majorLabel = majors.join(' & ') + (majors.length > 1 ? ' (double major)' : '');
  const prefix = declared ? '' : 'Intended: ';
  const minorLabel = data.minor ? `, ${data.minor} minor` : '';
  return `${prefix}${majorLabel}${minorLabel}`;
}

export function allMajors(data: { majors: string[]; intendedMajors: string[] }): string[] {
  return data.majors.length > 0 ? data.majors : data.intendedMajors;
}

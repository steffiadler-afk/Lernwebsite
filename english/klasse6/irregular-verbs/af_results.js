export const UNITS = ['A', 'B', 'C', 'D', 'E', 'F'];
export const TOTAL = 12;
export const CLASS_NAME = '6g';
export const TOPIC = 'irregular-verbs-af';

export function practiceGrade(score) {
  return score >= 11 ? 1 : score >= 9 ? 2 : score >= 7 ? 3 : score >= 5 ? 4 : score >= 3 ? 5 : 6;
}

export function studentCode(value) {
  return typeof value === 'string' ? value.normalize('NFC').trim().replace(/\s+/g, '').replace(/\.$/, '') : '';
}

export function validStudentCode(value) {
  return value.length >= 3 && value.length <= 50 && /^\p{L}[\p{L}\p{M}'’\-]*\p{L}$/u.test(value);
}

export function isAfResult(record) {
  return record?.type === 'exercise' && record.className === CLASS_NAME && record.topic === TOPIC &&
    UNITS.includes(record.unit) && record.total === TOTAL && Number.isInteger(record.score) &&
    record.score >= 0 && record.score <= TOTAL && validStudentCode(studentCode(record.name));
}

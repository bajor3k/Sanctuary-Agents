import { indexMergedRows } from './kb';
import { askMaven } from './ask';
import { loadKB, clearKB } from './storage';

const SAMPLE_ROWS = [
  { IP: 'IP-001', 'Account Number': 'A1001', Value: '150,000', 'Advisory Fees': '1,200', Cash: '2,500', Status: 'OK' },
  { IP: 'IP-002', 'Account Number': 'A1002', Value: '85,000',  'Advisory Fees': '900',  Cash: '500',   Status: 'Watch' },
  { IP: 'IP-003', 'Account Number': 'A1003', Value: '220,500', 'Advisory Fees': '1,800', Cash: '6,200', Status: 'OK' },
  { IP: 'IP-004', 'Account Number': 'A1004', Value: '60,000',  'Advisory Fees': '1,100', Cash: '400',   Status: 'Short' },
];

async function loadSampleKB() {
  try { await clearKB(); } catch {}
  return indexMergedRows(SAMPLE_ROWS);
}

function hasKB() {
  return loadKB().then(kb => Boolean(kb && kb.rows?.length));
}

if (typeof window !== 'undefined') {
    // @ts-ignore
    (window.AskMavenDev = { loadSampleKB, askMaven, hasKB, clearKB });
}

export {};

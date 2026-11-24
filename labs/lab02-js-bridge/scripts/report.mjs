// แสดงผลตรวจ  —  นิสิตไม่ต้องแก้ไฟล์นี้
//
// หน้าต่าง Command Prompt แบบเก่าของ Windows ไม่มีฟอนต์ไทย ตัวอักษรไทยจะกลายเป็นกล่อง
// chcp 65001 แก้ได้แค่การเข้ารหัส แก้ฟอนต์ไม่ได้
// Windows Terminal และเทอร์มินัลใน VS Code แสดงภาษาไทยได้ปกติ
//
// ถ้ารันในหน้าต่างแบบเก่า: บนจอแสดงสรุปเป็นภาษาอังกฤษ
// แล้วเขียนผลเต็มภาษาไทยลงไฟล์ check-result.txt และเปิดด้วย Notepad ให้อัตโนมัติ
// บังคับโหมดได้ด้วยตัวแปร CHECK_THAI=1 (ไทยเสมอ) หรือ CHECK_THAI=0 (อังกฤษ + ไฟล์)
import { writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

export const thaiOK = (() => {
  const f = process.env.CHECK_THAI;
  if (f === '1') return true;
  if (f === '0') return false;
  if (process.platform !== 'win32') return true;
  return !!(process.env.WT_SESSION || process.env.TERM_PROGRAM === 'vscode');
})();

// rows: [{ ok, name, hint, en, info }]
//   name/hint  ภาษาไทย ใช้ทั้งบนจอและในไฟล์
//   en         ป้ายสั้นภาษาอังกฤษ ใช้บนจอเมื่อแสดงไทยไม่ได้
//   info       true = แสดงเป็นข้อมูล ไม่นับผ่านหรือไม่ผ่าน
export function report({ title, titleEn, rows, footer = [], footerEn = [] }) {
  const th = [];
  th.push('', `  ${title}`, '');
  for (const r of rows) {
    const mark = r.info ? '·' : (r.ok ? '✓' : '✗');
    th.push(`  ${mark} ${r.name}`);
    if (!r.ok && !r.info && r.hint) {
      const [first, ...rest] = String(r.hint).split('\n');
      th.push(`      ทางแก้: ${first}`);
      for (const line of rest) th.push(`              ${line}`);
    }
  }
  th.push('', ...footer.map(l => `  ${l}`), '');

  if (thaiOK) {
    console.log(th.join('\n'));
    return;
  }

  // ---- หน้าต่างแบบเก่า ----
  const en = [];
  en.push('', `  ${titleEn}`, '');
  rows.forEach((r, i) => {
    const mark = r.info ? '[INFO]' : (r.ok ? '[ OK ]' : '[FAIL]');
    en.push(`  ${mark} ${r.en || 'item ' + (i + 1)}`);
  });
  en.push('', ...footerEn.map(l => `  ${l}`));

  const file = resolve(process.cwd(), 'check-result.txt');
  try {
    // ใส่ BOM และขึ้นบรรทัดแบบ Windows ให้ Notepad ทุกรุ่นเปิดภาษาไทยได้ถูก
    writeFileSync(file, '\uFEFF' + th.join('\r\n'), 'utf8');
    en.push('',
      '  This window cannot display Thai.',
      '  The full report in Thai has been opened in Notepad:',
      `  ${file}`, '');
    if (process.platform === 'win32') {
      // ถ้าเปิด Notepad ไม่ได้ก็ไม่เป็นไร ผลอยู่ในไฟล์แล้ว อย่าให้โปรแกรมพังหลังแสดงผล
      const child = spawn('notepad.exe', [file], { detached: true, stdio: 'ignore' });
      child.on('error', () => {});
      child.unref();
    }
  } catch {
    en.push('', '  (Could not write check-result.txt. Run this check inside VS Code instead.)', '');
  }
  console.log(en.join('\n'));
}

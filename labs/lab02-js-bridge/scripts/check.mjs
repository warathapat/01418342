// ตัวตรวจงานของปฏิบัติการที่ 2  —  นิสิตไม่ต้องแก้ไฟล์นี้
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { report } from './report.mjs';

const SRC = resolve(process.cwd(), 'src/bridge.js');
let M;
try {
  M = await import(pathToFileURL(SRC).href);
} catch (e) {
  const msg = String(e.message).split('\n')[0];
  report({
    title: 'ปฏิบัติการที่ 2  —  เปิดไฟล์ src/bridge.js ไม่ได้',
    titleEn: 'Lab 2 - cannot load src/bridge.js',
    rows: [{ ok: false, name: 'ไฟล์ src/bridge.js ผิดไวยากรณ์ ยังไม่มีเทสต์ข้อไหนได้รัน',
             en: 'syntax error in src/bridge.js: ' + msg,
             hint: 'อ่านข้อความด้านล่างแล้วไปแก้บรรทัดที่มันชี้\n' + msg }],
  });
  process.exit(1);
}

const near = (a, b) => typeof a === 'number' && Math.abs(a - b) < 1e-9;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// แต่ละข้อ: [ชื่อข้อ, ฟังก์ชันที่คืน true เมื่อผ่าน]
const CASES = [
  ['toCelsius แปลงอุณหภูมิได้ถูกต้องทั้งค่าบวกและค่าลบ',
    () => near(M.toCelsius(212), 100) && near(M.toCelsius(32), 0) && near(M.toCelsius(-40), -40)],

  ['addItem ต้องไม่แก้อาร์เรย์เดิม แต่คืนอาร์เรย์ใหม่',
    () => { const a = [1, 2, 3]; const r = M.addItem(a, 4);
            return same(r, [1, 2, 3, 4]) && same(a, [1, 2, 3]) && r !== a; }],

  ['countWords นับคำได้ถูกเมื่อมีช่องว่างซ้อนกันหลายช่อง',
    () => M.countWords('  กิน   ข้าว  ยัง ') === 3 && M.countWords('a  b') === 2],

  ['countWords คืน 0 เมื่อสตริงว่างหรือมีแต่ช่องว่าง',
    () => M.countWords('') === 0 && M.countWords('    ') === 0],

  ['sumEven รวมเฉพาะเลขคู่ และคืน 0 เมื่ออาร์เรย์ว่าง',
    () => M.sumEven([1, 2, 3, 4, 5, 6]) === 12 && M.sumEven([]) === 0],

  ['sumEven นับเลขคู่ที่ติดลบด้วย',
    () => M.sumEven([-4, -3, 2]) === -2],

  ['maxOf คืนค่าสูงสุด และคืน 0 เมื่ออาร์เรย์ว่าง',
    () => M.maxOf([3, 9, 2]) === 9 && M.maxOf([]) === 0],

  ['maxOf ทำงานถูกเมื่อทุกค่าติดลบ',
    () => M.maxOf([-5, -2, -9]) === -2],

  ['reverseWords กลับลำดับคำ และผลลัพธ์คั่นด้วยช่องว่างหนึ่งตัว',
    () => M.reverseWords('  one   two three ') === 'three two one'],

  ['samePoint เทียบพิกัดจากค่าข้างใน ไม่ใช่จากตัวออบเจกต์',
    () => M.samePoint({ x: 1, y: 2 }, { x: 1, y: 2 }) === true
       && M.samePoint({ x: 1, y: 2 }, { x: 1, y: 3 }) === false],

  ['samePoint ไม่ถือว่าเลข 5 เท่ากับสตริง "5"',
    () => M.samePoint({ x: 5, y: 0 }, { x: '5', y: 0 }) === false],

  ['renameKey ต้องไม่แก้ออบเจกต์เดิม แต่คืนออบเจกต์ใหม่',
    () => { const o = { name: 'ก', qty: 2 }; const r = M.renameKey(o, 'qty', 'total');
            return same(r, { name: 'ก', total: 2 }) && same(o, { name: 'ก', qty: 2 }) && r !== o; }],
];

let pass = 0;
const rows = [];
CASES.forEach(([name, run], i) => {
  let ok = false, note = '';
  try { ok = run() === true; }
  catch (e) { note = '  (' + String(e.message).split('\n')[0].slice(0, 60) + ')'; }
  if (ok) pass++;
  // ป้ายอังกฤษใช้ชื่อฟังก์ชันที่อยู่ต้นชื่อเทสต์ เผื่อหน้าต่างแสดงไทยไม่ได้
  rows.push({ ok, name: name + (ok ? '' : note), en: `test ${i + 1}: ${name.split(' ')[0]}${ok ? '' : note}` });
});

const score = (pass / CASES.length) * 2.0;
report({
  title: 'ปฏิบัติการที่ 2  —  JavaScript สำหรับผู้ที่มาจาก C และ Java',
  titleEn: 'Lab 2 - JavaScript for C and Java programmers',
  rows,
  footer: [`ผ่าน ${pass} จาก ${CASES.length} ข้อ   คะแนนส่วนนี้ ${score.toFixed(2)} จาก 2.00`],
  footerEn: [`Passed ${pass} of ${CASES.length}   score ${score.toFixed(2)} / 2.00`],
});
process.exit(pass === CASES.length ? 0 : 1);

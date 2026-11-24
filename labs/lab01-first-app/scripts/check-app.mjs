// ตรวจงานปฏิบัติการที่ 1  —  นิสิตไม่ต้องแก้ไฟล์นี้
// วิธีใช้:  npm run check -- <พาธโปรเจกต์>   หรือวางโฟลเดอร์นี้ไว้ข้าง ๆ โปรเจกต์แล้วรันเปล่า ๆ
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { report } from './report.mjs';

const SID = /\b6\d{9}\b/;
const ENTRIES = ['App.js','App.jsx','App.tsx','app/index.tsx','app/index.js',
                 'app/(tabs)/index.tsx','app/(tabs)/index.js','index.js'];
const SAMPLE = [
  'Open up App.js to start working on your app',
  'Edit app/index.tsx to edit this screen',
  'Welcome to Expo',
];

const broken = [];   // โฟลเดอร์ที่มี package.json แต่อ่านไม่ออก
const isExpoProject = (dir) => {
  const pkg = join(dir, 'package.json');
  if (!existsSync(pkg)) return false;
  let j;
  try { j = JSON.parse(readFileSync(pkg, 'utf8')); }
  catch { broken.push(dir); return false; }
  return !!((j.dependencies && j.dependencies.expo) || (j.devDependencies && j.devDependencies.expo));
};

// หาโปรเจกต์: จากอาร์กิวเมนต์ ถ้าไม่มีก็มองหาในโฟลเดอร์แม่
function findProject() {
  const arg = process.argv[2];
  if (arg) {
    const d = resolve(arg);
    return isExpoProject(d) ? d : null;
  }
  const parent = resolve(process.cwd(), '..');
  let dirs = [];
  try { dirs = readdirSync(parent); } catch { return null; }
  for (const name of dirs) {
    const d = join(parent, name);
    try { if (statSync(d).isDirectory() && isExpoProject(d)) return d; } catch {}
  }
  return null;
}

const project = findProject();
const out = [];
const add = (ok, name, hint, en) => out.push({ ok, name, hint, en });

if (!project) {
  const row = broken.length
    ? { ok: false, name: `ไฟล์ package.json ของ ${basename(broken[0])} อ่านไม่ออก`,
        en: `package.json of ${basename(broken[0])} is not valid JSON`,
        hint: 'ไฟล์นี้ต้องเป็น JSON ที่ถูกต้อง ลองเปิดดูว่ามีวงเล็บหรือคอมมาเกินหรือขาด\n' +
              'วิธีที่ง่ายที่สุดคือลบโฟลเดอร์นี้แล้วสร้างโปรเจกต์ใหม่' }
    : { ok: false, name: 'หาโปรเจกต์ Expo ไม่เจอ', en: 'Expo project not found',
        hint: 'วางโฟลเดอร์ lab01-first-app ไว้ข้าง ๆ โปรเจกต์ของคุณ\n' +
              'หรือรัน  npm run check -- D:\\mobile\\my-first-app' };
  report({ title: 'ปฏิบัติการที่ 1  —  ตรวจงาน', titleEn: 'Lab 1 - work check', rows: [row],
           footerEn: ['See check-result.txt for how to fix.'] });
  process.exit(1);
}

add(true, `พบโปรเจกต์ Expo ชื่อ ${basename(project)}`, '', `Expo project: ${basename(project)}`);

// ติดตั้ง dependencies แล้วหรือยัง
const hasModules = existsSync(join(project, 'node_modules', 'expo'));
add(hasModules, 'ติดตั้ง dependencies แล้ว',
  'เข้าไปในโฟลเดอร์โปรเจกต์แล้วพิมพ์  npm install', hasModules ? 'dependencies installed' : 'dependencies not installed');

// หาไฟล์หน้าจอแรก
let entry = null, src = '';
for (const e of ENTRIES) {
  const p = join(project, e);
  if (existsSync(p)) { entry = e; src = readFileSync(p, 'utf8'); break; }
}
add(!!entry, entry ? `พบไฟล์หน้าจอแรก ${entry}` : 'หาไฟล์หน้าจอแรกไม่เจอ',
  'โปรเจกต์ควรมี App.js หรือ app/index.tsx อย่างใดอย่างหนึ่ง', entry ? `first screen: ${entry}` : 'first screen file not found');

// รหัสนิสิตอยู่ในหน้าจอแรก
const m = src.match(SID);
add(!!m, m ? `หน้าจอแรกแสดงรหัสนิสิต ${m[0]}` : 'ยังไม่พบรหัสนิสิต 10 หลักในหน้าจอแรก',
  'แก้ข้อความในหน้าจอแรกให้มีรหัสนิสิตของตัวเอง', m ? `student ID on screen: ${m[0]}` : 'student ID not on first screen');

// ลบข้อความตัวอย่างของ Expo ออกแล้ว
const left = SAMPLE.find(s => src.includes(s));
add(!left, left ? `ยังมีข้อความตัวอย่างเดิมค้างอยู่: "${left}"` : 'ลบข้อความตัวอย่างเดิมออกแล้ว',
  'ลบประโยคตัวอย่างที่ Expo ใส่มาให้ออก แล้วเขียนข้อความของตัวเองแทน', left ? 'Expo sample text still there' : 'sample text removed');

// มีภาพหน้าจอ
const shot = ['screenshot.png','screenshot.jpg','screenshot.jpeg']
  .map(f => join(project, f)).find(existsSync);
add(!!shot, shot ? `พบภาพหน้าจอ ${basename(shot)}` : 'ยังไม่มีไฟล์ screenshot.png ในโฟลเดอร์โปรเจกต์',
  'จับภาพหน้าจอตอนแอปรันอยู่ แล้วบันทึกชื่อ screenshot.png ไว้ในโฟลเดอร์โปรเจกต์', shot ? 'screenshot found' : 'screenshot.png missing');

const pass = out.filter(r => r.ok).length;
const score = (pass / out.length) * 2.3;
report({
  title: 'ปฏิบัติการที่ 1  —  ตรวจงาน',
  titleEn: 'Lab 1 - work check',
  rows: out,
  footer: [`ผ่าน ${pass} จาก ${out.length} ข้อ   คะแนน ${score.toFixed(2)} จาก 2.30`],
  footerEn: [`Passed ${pass} of ${out.length}   score ${score.toFixed(2)} / 2.30`],
});
process.exit(pass === out.length ? 0 : 1);

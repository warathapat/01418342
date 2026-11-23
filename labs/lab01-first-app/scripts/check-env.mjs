// ตรวจว่าเครื่องพร้อมสร้างโปรเจกต์หรือยัง  —  นิสิตไม่ต้องแก้ไฟล์นี้
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const out = [];
const add = (ok, name, hint) => out.push({ ok, name, hint });

const run = (cmd) => {
  try { return execSync(cmd, { stdio:['ignore','pipe','ignore'] }).toString().trim(); }
  catch { return null; }
};

// 1. Node
const major = Number(process.versions.node.split('.')[0]);
add(major >= 20, `Node.js เวอร์ชัน ${process.versions.node}`,
  'ต้องเป็น 20 ขึ้นไป ให้ติดตั้งใหม่จาก nodejs.org แล้วเปิด Command Prompt ใหม่');

// 2. npm  (บน Windows ถ้า PowerShell ปิดสคริปต์ไว้ npm จะเรียกไม่ได้)
const npmv = run('npm --version');
add(!!npmv, npmv ? `npm เวอร์ชัน ${npmv}` : 'เรียก npm ไม่ได้',
  'ถ้าใช้ PowerShell อยู่ ให้เปลี่ยนไปใช้ Command Prompt แทน');

// 3. Java  (Android Studio ต้องใช้)
const javav = run('java -version 2>&1') || run('java --version');
add(!!javav, javav ? 'พบ Java' : 'ไม่พบ Java',
  'เปิด Android Studio หนึ่งครั้งเพื่อให้มันตั้งค่า JDK ให้');

// 4. Android SDK
const home = process.env.USERPROFILE || process.env.HOME || '';
const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT ||
            join(home, 'AppData', 'Local', 'Android', 'Sdk');
add(existsSync(sdk), existsSync(sdk) ? `พบ Android SDK ที่ ${sdk}` : 'ไม่พบ Android SDK',
  'เปิด Android Studio แล้วไปที่ SDK Manager ติดตั้ง Android SDK');

// 5. adb
const adb = run('adb version');
add(!!adb, adb ? 'เรียก adb ได้' : 'เรียก adb ไม่ได้',
  'เพิ่มโฟลเดอร์ platform-tools ของ Android SDK เข้าใน PATH');

// 6. มี AVD อย่างน้อยหนึ่งตัว
const emuBin = join(sdk, 'emulator', process.platform === 'win32' ? 'emulator.exe' : 'emulator');
let avds = null;
if (existsSync(emuBin)) avds = run(`"${emuBin}" -list-avds`);
const hasAvd = !!(avds && avds.length > 0);
add(hasAvd, hasAvd ? `พบ AVD: ${avds.split('\n').join(', ')}` : 'ยังไม่มี AVD',
  'เปิด Android Studio ไปที่ Device Manager แล้วสร้างอุปกรณ์จำลองเป็นมือถือ เช่น Pixel 7');

console.log('\n  ปฏิบัติการที่ 1  —  ตรวจความพร้อมของเครื่อง\n');
for (const r of out) {
  console.log(`  ${r.ok ? '✓' : '✗'} ${r.name}`);
  if (!r.ok) console.log(`      ทางแก้: ${r.hint}`);
}
const pass = out.filter(r => r.ok).length;
console.log(`\n  ผ่าน ${pass} จาก ${out.length} ข้อ`);
console.log(pass === out.length
  ? '  เครื่องพร้อมแล้ว ไปขั้นต่อไปในใบแล็บได้เลย\n'
  : '  แก้ข้อที่ยังไม่ผ่านก่อน ถ้าติดให้ถามในช่องความคิดเห็นของงานนี้ใน Classroom\n');

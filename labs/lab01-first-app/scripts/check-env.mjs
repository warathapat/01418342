// ตรวจว่าเครื่องพร้อมสร้างโปรเจกต์และรันบนอุปกรณ์จำลองหรือยัง  —  นิสิตไม่ต้องแก้ไฟล์นี้
//
// สัปดาห์ที่ 1 รันแอปผ่าน Expo Go บนอุปกรณ์จำลอง จึงต้องการแค่ Node, npm และ Android SDK
// ที่มี platform-tools (adb), emulator และ AVD อย่างน้อยหนึ่งตัว  ไม่ต้องใช้ Java
// Expo หา adb จากในโฟลเดอร์ SDK เองได้ ไม่จำเป็นต้องอยู่ใน PATH
import { execSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { report } from './report.mjs';

const isWin = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const exe = isWin ? '.exe' : '';
const env = process.env;
const home = env.USERPROFILE || env.HOME || '';
const local = env.LOCALAPPDATA || join(home, 'AppData', 'Local');
const pf = env.ProgramFiles || 'C:\\Program Files';
const pf86 = env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';

const run = (cmd) => {
  try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'], timeout: 20000 }).toString().trim(); }
  catch { return null; }
};

// ---------- หา Android Studio ----------
const studioPaths = isWin ? [
  join(pf, 'Android', 'Android Studio', 'bin', 'studio64.exe'),
  join(local, 'Programs', 'Android Studio', 'bin', 'studio64.exe'),
  join(pf86, 'Android', 'Android Studio', 'bin', 'studio64.exe'),
] : isMac ? ['/Applications/Android Studio.app'] : [];
const studio = studioPaths.find(existsSync) || null;

// ---------- หา Android SDK ----------
// ตัวแปรสภาพแวดล้อมก่อน แล้วค่อยตำแหน่งที่พบบ่อย ทั้งแบบรายบัญชีและแบบติดตั้งไว้ร่วมกัน
const sdkPaths = [
  env.ANDROID_HOME, env.ANDROID_SDK_ROOT,
  isWin ? join(local, 'Android', 'Sdk') : null,
  isWin ? 'C:\\Android\\Sdk' : null,
  isWin ? 'C:\\Android\\android-sdk' : null,
  isWin ? join(pf86, 'Android', 'android-sdk') : null,
  isMac ? join(home, 'Library', 'Android', 'sdk') : null,
  !isWin && !isMac ? join(home, 'Android', 'Sdk') : null,
].filter(Boolean);
const looksLikeSdk = (d) => existsSync(join(d, 'platform-tools')) || existsSync(join(d, 'emulator'));
const sdk = sdkPaths.find(d => existsSync(d) && looksLikeSdk(d))
         || sdkPaths.find(d => existsSync(d)) || null;
const sdkFromEnv = !!sdk && (sdk === env.ANDROID_HOME || sdk === env.ANDROID_SDK_ROOT);

const rows = [];

// 1. Node
const major = Number(process.versions.node.split('.')[0]);
rows.push({
  ok: major >= 20,
  name: `Node.js เวอร์ชัน ${process.versions.node}`,
  en: `Node.js ${process.versions.node}`,
  hint: 'ต้องเป็นเวอร์ชัน 20 ขึ้นไป ติดตั้งใหม่จาก nodejs.org แล้วเปิดหน้าต่างคำสั่งใหม่',
});

// 2. npm
const npmv = run('npm --version');
rows.push({
  ok: !!npmv,
  name: npmv ? `npm เวอร์ชัน ${npmv}` : 'เรียก npm ไม่ได้',
  en: npmv ? `npm ${npmv}` : 'npm not callable',
  hint: 'ถ้าใช้ PowerShell อยู่ ให้เปลี่ยนไปใช้ Command Prompt แทน',
});

// 3. Android SDK  ข้อนี้คือต้นเหตุของข้ออื่น จึงบอกให้ชัดว่าเป็นกรณีไหน
let sdkHint;
if (studio) {
  sdkHint = 'เครื่องนี้ติดตั้ง Android Studio แล้ว แต่บัญชีผู้ใช้นี้ยังไม่มี Android SDK\n' +
            'เปิด Android Studio หนึ่งครั้ง แล้วทำหน้าตั้งค่าครั้งแรก (Setup Wizard) จนจบ\n' +
            'ตัวช่วยจะดาวน์โหลด SDK มาไว้ในบัญชีนี้ให้เอง';
} else {
  sdkHint = 'เครื่องนี้ยังไม่ได้ติดตั้ง Android Studio\n' +
            'ถ้าเป็นเครื่องในห้องปฏิบัติการ ให้แจ้งผู้สอน ไม่ต้องติดตั้งเอง\n' +
            'ถ้าเป็นเครื่องของตัวเอง ดาวน์โหลดได้จาก developer.android.com/studio';
}
rows.push({
  ok: !!sdk,
  name: sdk ? `พบ Android SDK ที่ ${sdk}` : 'ไม่พบ Android SDK',
  en: sdk ? `Android SDK found: ${sdk}` : (studio ? 'Android SDK missing (Android Studio is installed)'
                                                   : 'Android SDK missing (Android Studio not installed)'),
  hint: sdkHint,
});

// 4. adb  หาในโฟลเดอร์ SDK ก่อน แล้วค่อยดู PATH
const adbInSdk = sdk ? join(sdk, 'platform-tools', 'adb' + exe) : null;
const adbOk = (adbInSdk && existsSync(adbInSdk)) || !!run('adb version');
rows.push({
  ok: !!adbOk,
  name: adbOk ? 'พบ adb' : (sdk ? 'ไม่พบ adb ใน Android SDK' : 'ยังตรวจ adb ไม่ได้'),
  en: adbOk ? 'adb found' : (sdk ? 'adb missing from SDK' : 'adb: waiting for Android SDK'),
  hint: sdk
    ? 'เปิด Android Studio ไปที่ SDK Manager แท็บ SDK Tools\nติ๊ก Android SDK Platform-Tools แล้วกด Apply'
    : 'ข้อนี้จะผ่านเองเมื่อแก้ข้อ Android SDK ด้านบนแล้ว',
});

// 5. emulator และ AVD
const emuBin = sdk ? join(sdk, 'emulator', 'emulator' + exe) : null;
const hasEmu = !!(emuBin && existsSync(emuBin));
let avds = [];
if (hasEmu) {
  const listed = run(`"${emuBin}" -list-avds`);
  if (listed) avds = listed.split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('INFO'));
}
// เผื่อ emulator เรียกไม่ขึ้นแต่มีไฟล์ AVD อยู่แล้ว
if (!avds.length) {
  const avdDir = env.ANDROID_AVD_HOME || join(home, '.android', 'avd');
  try { avds = readdirSync(avdDir).filter(f => f.endsWith('.ini')).map(f => f.slice(0, -4)); } catch {}
}
let avdHint, avdName, avdEn;
if (!sdk) {
  avdName = 'ยังตรวจอุปกรณ์จำลองไม่ได้'; avdEn = 'AVD: waiting for Android SDK';
  avdHint = 'ข้อนี้จะตรวจได้เมื่อแก้ข้อ Android SDK ด้านบนแล้ว';
} else if (!hasEmu) {
  avdName = 'ไม่พบโปรแกรม Android Emulator ใน SDK'; avdEn = 'Android Emulator missing from SDK';
  avdHint = 'เปิด Android Studio ไปที่ SDK Manager แท็บ SDK Tools\nติ๊ก Android Emulator แล้วกด Apply';
} else if (!avds.length) {
  avdName = 'ยังไม่มีอุปกรณ์จำลอง (AVD)'; avdEn = 'No AVD yet';
  avdHint = 'เปิด Android Studio ไปที่ Device Manager\nสร้างอุปกรณ์จำลองแบบมือถือ เช่น Pixel 7';
} else {
  avdName = `พบอุปกรณ์จำลอง ${avds.join(', ')}`; avdEn = `AVD found: ${avds.join(', ')}`;
}
rows.push({ ok: hasEmu && avds.length > 0, name: avdName, en: avdEn, hint: avdHint });

// ข้อมูลประกอบ ไม่นับคะแนน
if (sdk && !sdkFromEnv) {
  rows.push({
    info: true,
    name: 'ไม่ได้ตั้ง ANDROID_HOME ไว้ ไม่เป็นไร Expo หา SDK ตำแหน่งนี้เจอเอง',
    en: 'ANDROID_HOME not set (fine: Expo finds this location)',
  });
}

const counted = rows.filter(r => !r.info);
const pass = counted.filter(r => r.ok).length;
const all = pass === counted.length;

report({
  title: 'ปฏิบัติการที่ 1  —  ตรวจความพร้อมของเครื่อง',
  titleEn: 'Lab 1 - PC readiness check',
  rows,
  footer: [
    `ผ่าน ${pass} จาก ${counted.length} ข้อ`,
    all ? 'เครื่องพร้อมแล้ว ไปขั้นต่อไปในใบแล็บได้เลย'
        : 'แก้ข้อที่ยังไม่ผ่านจากบนลงล่าง ถ้าติดให้ถามในช่องความคิดเห็นของงานนี้ใน Classroom',
  ],
  footerEn: [`Passed ${pass} of ${counted.length}`, all ? 'Ready.' : 'Fix the failed items from top to bottom.'],
});
process.exitCode = all ? 0 : 1;

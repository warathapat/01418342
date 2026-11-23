/* 01418342 ปฏิบัติการที่ 2
 * โปรแกรมต้นฉบับภาษา C  ให้แปลทุกฟังก์ชันไปเป็น JavaScript ใน src/bridge.js
 * ผลลัพธ์ของแต่ละฟังก์ชันต้องออกมาเท่าเดิมทุกกรณี
 */
#include <stdio.h>
#include <string.h>

/* 1. แปลงฟาเรนไฮต์เป็นเซลเซียส */
double toCelsius(double f) {
    return (f - 32.0) * 5.0 / 9.0;
}

/* 2. เพิ่มสมาชิกเข้าท้ายอาร์เรย์ โดยเขียนลง dst ไม่แตะ src
 *    คืนจำนวนสมาชิกของ dst */
int addItem(const int *src, int n, int item, int *dst) {
    for (int i = 0; i < n; i++) dst[i] = src[i];
    dst[n] = item;
    return n + 1;
}

/* 3. นับจำนวนคำ โดยถือว่าช่องว่างกี่ตัวติดกันก็เป็นตัวคั่นเดียว */
int countWords(const char *s) {
    int count = 0, inWord = 0;
    for (int i = 0; s[i] != '\0'; i++) {
        if (s[i] == ' ' || s[i] == '\t' || s[i] == '\n') inWord = 0;
        else if (!inWord) { inWord = 1; count++; }
    }
    return count;
}

/* 4. รวมเฉพาะเลขคู่ */
int sumEven(const int *a, int n) {
    int sum = 0;
    for (int i = 0; i < n; i++) if (a[i] % 2 == 0) sum += a[i];
    return sum;
}

/* 5. หาค่าสูงสุด  อาร์เรย์ว่างคืน 0 */
int maxOf(const int *a, int n) {
    if (n == 0) return 0;
    int m = a[0];
    for (int i = 1; i < n; i++) if (a[i] > m) m = a[i];
    return m;
}

/* 6. กลับลำดับคำในประโยค  คำคั่นด้วยช่องว่างหนึ่งตัวในผลลัพธ์ */
void reverseWords(const char *s, char *out) { /* ... */ }

/* 7. เปรียบเทียบจุดสองจุดว่าพิกัดเท่ากันหรือไม่ */
int samePoint(int x1, int y1, int x2, int y2) {
    return x1 == x2 && y1 == y2;
}

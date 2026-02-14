const fs = require('fs');

// 読解アノテーションの修正
const readingPath = 'app/data/reading/chigo-no-sorane.json';
let raw = fs.readFileSync(readingPath, 'utf-8');

// s1〜s11 の参照を第○文に置き換え（テキスト内のみ、IDは維持）
const kanji = ['一','二','三','四','五','六','七','八','九','十','十一'];
for (let i = 1; i <= 11; i++) {
  // s5の → 第五文の のようなパターンを置換（文脈内テキストのみ）
  // sentenceId フィールドの値は変えない
  const re = new RegExp('(?<!"sentenceId": ")s' + i + '(?=の|で|を|は|が|と|から|まで|へ|に|「)', 'g');
  raw = raw.replace(re, '第' + kanji[i-1] + '文');
}

fs.writeFileSync(readingPath, raw, 'utf-8');
console.log('Fixed sentence references in reading annotations.');

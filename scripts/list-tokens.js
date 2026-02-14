const fs = require('fs');
const d = JSON.parse(fs.readFileSync('app/data/texts/chigo-no-sorane.json', 'utf-8'));
d.sentences.forEach(s => {
  s.tokens.forEach(t => {
    if (t.layer >= 1 && t.grammarTag.pos !== '名詞' && t.grammarTag.pos !== '記号') {
      console.log(
        t.id + '\t' + t.text + '\t[' + t.grammarTag.pos + '] ' +
        (t.grammarTag.conjugationType || '') + '\t' +
        (t.grammarTag.baseForm || '') + '\tlayer=' + t.layer +
        '\tref=' + (t.grammarRefId || '')
      );
    }
  });
});

const AnZip = require('../dist/anzip.umd.js');
const fs = require('fs').promises;
const test = require('./test.js');

(async () => {
  const azip = test(AnZip);
  await fs.writeFile("./tmp/file_node.zip", azip.zip());
  console.log('done');

  azip.clear();
  azip.add('hoge.txt', 'hogetext');
  await fs.writeFile(__dirname + "/../tmp/file_node2.zip", azip.zip());
  console.log('done2');
})();

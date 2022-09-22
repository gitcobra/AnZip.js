function test(AnZip) {
  var azip = new AnZip;
  
  var dat1 = [0, 1, 127, 128, 254, 255];
  var dat2 = 'it is text data ☺♥\ud83d\udca9';
  azip.add('dir1/dir1_2/binary.bin', dat1);
  azip.add('dir2/text☺\ud83d\udca9.txt', dat2);
  azip.add("nest/zipfile.zip", azip.zip());
  return azip;
}

if( typeof module === 'object' ) {
  module.exports = test;
}

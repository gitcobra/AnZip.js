var AnZip = // change the name if you need
(function () {
  // *for Node.js
  if (typeof exports === 'object') module.exports = AnZip;
  // use TypedArray or Array?
  var UseTA = typeof Uint8Array !== 'undefined';
  var A8 = UseTA ? Uint8Array : Array, A32 = UseTA ? Uint32Array : Array;
  // CRC32 table
  var CRC32Table = new A32(256);
  for (var i = 0; i < 256; i++) {
    var val = i;
    for (var j = 0; j < 8; j++) {
      val = (val & 1) ? (0xEDB88320 ^ (val >>> 1)) : (val >>> 1);
    }
    CRC32Table[i] = val;
  }
  function getCRC32(dat) {
    var crc = 0xFFFFFFFF;
    for (var i = 0, len = dat.length; i < len; i++) {
      crc = CRC32Table[(crc ^ dat[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  // encode to UTF-8
  function strToUTF8(str) {
    var a = [];
    encodeURI(str).replace(/%(..)|(.)/g, function (m, $1, $2) {
      a.push($1 ? parseInt($1, 16) : $2.charCodeAt(0));
    });
    return UseTA ? new A8(a) : a;
  }
  // get number as little endian
  function getLE32(num) {
    return [num & 0xFF, num >> 8 & 0xFF, num >> 16 & 0xFF, num >> 24 & 0xFF];
  }
  // AnZip constructor
  function AnZip() {
    this._d = {}; // directory record
    this._lfh = []; // local file headers
    this._curLFHind = 0; // current lfh offset
    this._cdh = []; // central directory headers
    this._cdhLen = 0; // whole central directory header size
    this._c = 0; // file count
  };
  AnZip.prototype = {
    add: function (path, dat) {
      // check path
      if (!path) throw new Error('path is empty');
      path = String(path).replace(/\\/g, '/'); // replace backslashes with forward slashes
      if (/\\|^\/|^[a-z]:/i.test(path)) throw new Error('the path must not contain a drive letter, a leading slash: "' + path + '"');
      if (/\/{2,}/.test(path)) throw new Error('empty directory name: "' + path + '"');
      // check file
      var size = 0, crc = 0;
      if (dat) {
        if (!/[^/]+$/.test(path)) throw new Error('needs a file name: "' + path + '"');
        if (typeof dat === 'string') dat = strToUTF8(dat);
        if (!(dat instanceof A8)) try {
          if (dat.buffer || dat instanceof Array || dat instanceof ArrayBuffer || dat instanceof Buffer)
            dat = UseTA ? new Uint8Array(dat.buffer || dat) : dat;
          else
            throw new Error('data type error');
        } catch (e) {
          throw new Error('data must be one of type Array, TypedArray, ArrayBuffer, Buffer, or string.');
        }
        if (this.has(path)) throw new Error('the file already exists: ' + path);
        size = dat.length;
        crc = getCRC32(dat);
      }
      // generate time stamp
      var date, d = new Date(); date = getLE32((d.getFullYear() - 1980) << 25 | (d.getMonth() + 1) << 21 | d.getDate() << 16 | d.getHours() << 11 | d.getMinutes() << 5 | d.getSeconds() / 2);
      // construct directories
      var dirs = path.replace(/\/+$/, '').split("/");
      var pathstack = '';
      while (dirs.length) {
        pathstack += dirs.shift();
        var isFile = dat && (dirs.length === 0);
        pathstack += (isFile ? '' : '/');
        if (this.has(pathstack)) continue;
        this._d[pathstack] = true;
        this._c++;

        var pathbin = strToUTF8(pathstack);
        var pathLen = pathbin.length;

        var dsize = isFile ? size : 0;
        var dsizeLE = getLE32(dsize);

        // local file header // signature(4)
        this._lfh.push([0x50, 0x4B, 0x03, 0x04]);
        // *same part as cdh* // version(2) flag(2) comp_method(2) time(4) CRC(4) size(4) size(4) pathLength(2) extraLength(2)
        var dup = [0x0A, 0x00, 0x00, 0x08, 0x00, 0x00].concat(date, getLE32(isFile ? crc : 0), dsizeLE, dsizeLE, [pathLen & 0xFF, pathLen >> 8 & 0xFF, 0x00, 0x00]);
        this._lfh.push(dup, pathbin); // file name(*)...

        // central directory header // signature(4) app version(2) dup(*) comment length(2)  disk(2)  in-attr(2) ex-attr(4)  offset(4)  filename(*) ...
        this._cdh.push([0x50, 0x4B, 0x01, 0x02, 0x0A, 0x00].concat(dup, [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, isFile ? 0x00 : 0x10, 0x00, 0x00, 0x00], getLE32(this._curLFHind)), pathbin);
        this._cdhLen += 46 + pathLen;

        this._curLFHind += 30 + pathLen + dsize;
      }
      // add file
      if (dat)
        this._lfh.push(dat);
    },
    has: function (path) {
      return !!this._d[path.replace(/\/+$/, '')];
    },
    // output as new Uint8Array (or Array)
    zip: function () {
      // End of central directory record // signature(4)  // disk  // file count // file count    // size of central directory  // offset of start of central directory   // comment length
      var ecd = [0x50, 0x4B, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00, this._c & 0xFF, this._c >> 8, this._c & 0xFF, this._c >> 8].concat(getLE32(this._cdhLen), getLE32(this._curLFHind), [0x00, 0x00]);

      // join all binary data
      var output = new A8(this._curLFHind + this._cdhLen + ecd.length);
      var conc = this._lfh.concat(this._cdh, [ecd]);
      if (output instanceof Array)
        output = [].concat.apply([], conc);
      else {
        var offset = 0;
        for (var i = 0; i < conc.length; i++) {
          var n = conc[i];
          output.set(n, offset);
          offset += n.length;
        }
      }
      return output;
    },
    valueOf: function () { return this.zip() }
  };
  return AnZip;
})();

export default AnZip;

/**
 * AnZip constructor
 * @class
 */
function AnZip() {
  this.clear();
}
/**
 * initialize data
 * @return {void}
 */
AnZip.prototype.clear = function() {
  /**
   * directory record
   * @private { [string]: boolean }
   */
  this._d = {};
  /**
   * local file headers
   * @private {number[]}
   */
  this._lfh = [];
  /**
   * current lfh offset
   * @private {number}
   */
  this._curLFHind = 0;
  /**
   * central directory headers 
   * @private {number[]}
   */
  this._cdh = [];
  /**
   * whole central directory header size
   * @private {number}
   */
  this._cdhLen = 0;
  /**
   * file count
   * @private {number}
   */
  this._c = 0;
};

/**
 * add path and data
 * @param {string} path
 * @param {Uint8Array | number[] | ArrayBuffer | Buffer | string} [dat]
 */
AnZip.prototype.add = function (path, dat) {
  // check path
  if (!path)
    throw new Error('path is empty');
  // replace backslash with forward slash
  path = String(path).replace(/\\/g, '/');
  // check characters
  if (/\/{2,}|\\|^\/|^[a-z]+:/i.test(path))
    throw new Error('invalid path. containing a drive letter, a leading slash, or empty directory name: "' + path + '"');

  // check file
  var size = 0, crc = 0;
  if (typeof dat !== 'undefined') {
    // file name has to be specified
    if (!/[^/]+$/.test(path))
      throw new Error('needs a file name: "' + path + '"');
    
    // convert string to utf-8 binary
    if (typeof dat === 'string')
      dat = strToUTF8Array(dat);
    
    // check for type other than TypedArray
    if ( !(dat instanceof A8) ) try {
      if (dat.buffer || dat instanceof Array || dat instanceof ArrayBuffer || dat instanceof Buffer)
        dat = new Uint8Array(dat.buffer || dat);
      else
        throw new Error;
    } catch (e) {
      throw new Error('data must be one of the following types Array, TypedArray, ArrayBuffer, Buffer, or string.');
    }
    
    // check for duplication
    if (this.has(path))
      throw new Error('the path already exists: ' + path);
    
    size = dat.length;
    crc = getCRC32(dat);
  }

  // generate time stamp
  var d = new Date();
  var date = getLE32((d.getFullYear() - 1980) << 25 | (d.getMonth() + 1) << 21 | d.getDate() << 16 | d.getHours() << 11 | d.getMinutes() << 5 | d.getSeconds() / 2);

  // construct directories
  var dirs = path.replace(/\/+$/, '').split("/");
  var pathstack = '';
  while (dirs.length) {
    // check whether the path already exists
    pathstack += dirs.shift();

    var isFile = dat && (dirs.length === 0);
    pathstack += (isFile ? '' : '/');
    if (this._d[pathstack])
      continue;

    // it's a new path
    this._d[pathstack] = true;
    this._c++;

    var pathbin = strToUTF8Array(pathstack);
    var pathLen = pathbin.length;
    var dsize = isFile ? size : 0;
    var dsizeLE = getLE32(dsize);

    // local file header
    // signature(4)
    this._lfh.push([0x50, 0x4B, 0x03, 0x04]);
    // *same part as cdh*
    // version(2) flag(2) comp_method(2) time(4) CRC(4) size(4) size(4) pathLength(2) extraLength(2)
    var dup = [0x0A, 0x00, 0x00, 0x08, 0x00, 0x00].concat(date, getLE32(isFile ? crc : 0), dsizeLE, dsizeLE, [pathLen & 0xFF, pathLen >> 8 & 0xFF, 0x00, 0x00]);
    this._lfh.push(dup, pathbin); // file name(*)...

    // central directory header
    // signature(4) app version(2) dup(*) comment length(2)  disk(2)  in-attr(2) ex-attr(4)  offset(4)  filename(*) ...
    this._cdh.push([0x50, 0x4B, 0x01, 0x02, 0x0A, 0x00].concat(dup, [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, isFile ? 0x00 : 0x10, 0x00, 0x00, 0x00], getLE32(this._curLFHind)), pathbin);
    this._cdhLen += 46 + pathLen;

    this._curLFHind += 30 + pathLen + dsize;
  }
  
  // add file data
  if (dat)
    this._lfh.push(dat);
};

/**
 * return whether the path already exists
 * @param {string} path
 * @return {boolean} 
 */
AnZip.prototype.has = function (path) {
  return !!this._d[path.replace(/\/+$/, '')];
};

/**
 * output as new Uint8Array (or Array)
 * @return {Uint8Array} 
 */
AnZip.prototype.zip = function () {
  // End of central directory record
  // signature(4)
  // number of this disk(2), file count on disk(2), file count(2), size(4), offset(4), comment length(2)
  var ecd = [0x50, 0x4B, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00, this._c & 0xFF, this._c >> 8, this._c & 0xFF, this._c >> 8]
    .concat(getLE32(this._cdhLen), getLE32(this._curLFHind), [0x00, 0x00]);

  // join all binary data
  var output;
  var arrayChain = this._lfh.concat(this._cdh, [ecd]);
  // Array
  if ( A8 === Array ) {
    output = Array.prototype.concat.apply([], arrayChain);
  }
  // Uint8Array
  else {
    var offset = 0;
    output = new A8(this._curLFHind + this._cdhLen + ecd.length);
    for (var i = 0; i < arrayChain.length; i++) {
      var n = arrayChain[i];
      output.set(n, offset);
      offset += n.length;
    }
  }

  return output;
};
/**
 * @return {ArrayBuffer | Buffer}
 */
AnZip.prototype.buffer = function() {
  return UseTA ? this.zip().buffer : null;
};
/**
 * @return {Blob} 
 */
AnZip.prototype.blob = function() {
  if( typeof Blob !== 'function')
    return null;
  return new Blob([this.zip()], {type: 'application/zip'});
};
/**
 * output as dataURL
 * @return {string} 
 */
AnZip.prototype.url = function() {
  var blob = this.blob();
  if( !blob || typeof URL !== 'function' || typeof URL.createObjectURL !== 'function' )
    return '';
  var src = URL.createObjectURL(this.blob());
  return src;
};





// use TypedArray or Array?
var UseTA = typeof Uint8Array !== 'undefined';
var A8 = UseTA ? Uint8Array : Array, A32 = UseTA ? Uint32Array : Array;

// create CRC32 table
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
function strToUTF8Array(str) {
  var a;
  // for modern browsers
  if( typeof TextEncoder === 'function' ) {
    a = new TextEncoder('utf-8').encode(str);
  }
  // for the old environments
  else {
    a = [];
    encodeURI(str).replace(/%(..)|(.)/g, function (m, $hex, $chr) {
      a.push($hex ? parseInt($hex, 16) : $chr.charCodeAt(0));
    });
  }
  return a;
}

// 32bit number to little-endian byte array
function getLE32(num) {
  return [num & 0xFF, num >> 8 & 0xFF, num >> 16 & 0xFF, num >> 24 & 0xFF];
}

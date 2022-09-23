# AnZip
Create an **uncompressed** zip file.

- extremely easy to use
- all methods are synchronous
- ES3 compatible

This code contains **no** compression processes, so it is simple and **fast**.

## Purpose
When your JavaScript code produces large amounts of files and wants to let users save them, AnZip provides easy way to combine the files into **a zip file** so that they need only a single download dialog or confirmation or something.

## Installation

```
npm install @gitcobra/anzip
```

### ESM:
```
import AnZip from '@gitcobra/anzip'
```
### Node:
```
const AnZip = require('@gitcobra/anzip');
```
### UMD:
```
<script src="https://cdn.jsdelivr.net/npm/@gitcobra/anzip/dist/anzip.umd.min.js"></script>
```

### WSH (Windows Scripting Host):
https://cdn.jsdelivr.net/npm/@gitcobra/anzip/dist/anzip.iife.js
```
Download or copy and paste the code.
See the test folder on GitHub for details.
```


## Usage
```
// sample data
var bin = new Uint8Array([0, 1, 2, 3, 127, 255]);
var txt = 'text data';

// 1: create new AnZip object
var azip = new AnZip;

// 2: add the data to an arbitrary path
azip.add('dir1/dir1_1/file1.bin', bin);
azip.add('dir2/text.txt', txt);

// 3: output a zip as Uint8Array
var array = azip.zip();
```


## Methods

### add(`path` [, `data`])
- `path`: `string`
  - path to directory or file in the zip
- `data` (optional): `TypedArray` | `Array` | `string` | `ArrayBuffer` | `Buffer`
  - data you want to store
- Return Value: `void`

- Construct directories in the zip then add data if specified. Throw an Error when you try to add any data to path already exists.

### has(`path`)
- `path`: `string`
- Return Value: `boolean`

- Check whether the `path` already exists.

### zip()
- Return Value: `Uint8Array`
  - *may be Array in the old environments such as WSH
- Output the zip binary as an Uint8Array.

### clear()
- Return Value: `void`

- Clear all data.



## Extra methods

These are for modern JavaScript engines.
Always return null or empty string in old environments.

### buffer()
- Return Value: `ArrayBuffer` | `Buffer`

- Output the zip as an `ArrayBuffer` or a `Buffer`.

### blob()
- Return Value: `Blob`

- Output a `Blob`.

### url()
- Return Value: `string`

- Output an object url.

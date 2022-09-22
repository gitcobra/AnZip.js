# AnZip
Creates an **uncompressed** zip file.

It contains **no** compression processes, so the code is simple and fast.


## Purpose
When your website with JavaScript produces many binary files and wants to let users save them all, AnZip provides ***easy way*** to combine the files into **a zip file** so that their browsers need only a single download dialog.


## Installation

```sh
npm install @gitcobra/anzip
```

## Usage
### ES Module:
```
import AnZip from '@gitcobra/anzip'
```
### Node:
```
const AnZip = require('@gitcobra/anzip');
```
### CDN:
```
<script src="https://cdn.jsdelivr.net/npm/@gitcobra/anzip/dist/anzip.umd.min.js"></script>
```

### Windows Scripting Host (WSH):
https://cdn.jsdelivr.net/npm/@gitcobra/anzip/dist/anzip.iife.js

Download and load it.
See a test folder on github for details.


## Sample Code
```
// sample data
var bin = new Uint8Array([0, 1, 2, 3, 127, 255]);
var txt = 'text data';

// 1: create new AnZip object
var azip = new AnZip;

// 2: add the data
azip.add('dir1/dir1_1/file1.bin', bin);
azip.add('dir2/text.txt', txt);

// 3: output a zip as Uint8Array
var array = azip.zip();
```

## API methods

### add(`path` [, `data`])
- `path`: string
- `data`: TypedArray, ArrayBuffer, Array, string, Buffer(node.js)

- Constructs directories and add data to the zip. Throw an Error when you add any `data` to `path` already exists.

### has(`path`)
- `path`: string
- Return Value: boolean

- Check whether the `path` already exists.

### zip()
- Return Value: Uint8Array (may be Array in old environment)

- Output the data as an Uint8Array.

### url()
- Return Value: string
- Output an object url.

### blob()
- Return Value: Blob
- Output a blob.

### clear()
- Clear all data

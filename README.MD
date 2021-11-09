# AnZip.js
Creates an **uncompressed** zip file.

It contains **no** compression processes, so the code is simple and **fast**.
## Purpose
When your website with JavaScript produces many binary files and wants to let users save them all, needs to make their browsers start download processes again and again.

AnZip.js provides an ***easy way*** to combine the files into **a zip file** so that the their browsers need only a single download dialog.

## Installation
Just copy and paste the content of `anzip.min.js` (or `anzip.js`) into your code, or load it from a script tag.


```
<script src="anzip.min.js"></script>
```
CDN:
```
<script src="https://cdn.jsdelivr.net/gh/gitcobra/anzip.js/anzip.min.js"></script>
```
#AnZip.js pollutes variable name "AnZip" in the scope where you pasted.

## Usage
3 simple steps

1. `new AnZip` :The constructor needs no parameter.

1. `.add(path, data)` :To add directories and data.

1. `.zip()` :Outputs the zip as Uint8Array.

#### Sample Code:
```
// sample data
var dat = new Uint8Array([0,1,2,3,4]);
var dat2 = new Uint8Array([255,254,253,252,251]);
var dat3 = 'text data';

// 1: create new AnZip object
var azip = new AnZip;

// 2: add the data
azip.add('dir1/dir2/file1.bin', dat);
azip.add('dir1/dir2/file2.bin', dat2);
azip.add('dir3/file3.txt', dat3);

// 3: output the zip as an Uint8Array
var zip = azip.zip();

// convert to Blob URL
var blob = new Blob([zip], {type: 'application/zip'});
var src = window.URL.createObjectURL(blob);
```

## Methods
### add(`path` [, `data`])
- `path`: string
- `data`: TypedArray, ArrayBuffer, Array, string, Buffer(node.js)

Constructs directories and adds data to the zip. Throws an Error when you add any `data` to `path` already exists.
### has(`path`)
- `path`: string
- Return Value: boolean

Checks whether the `path` already exists.

### zip()
- Return Value: Uint8Array (may be Array in old environment)

Outputs the zip binary as an Uint8Array.

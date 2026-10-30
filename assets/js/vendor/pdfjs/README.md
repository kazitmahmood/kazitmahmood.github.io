PDF.js 6.4.299, from the official `pdfjs-dist` npm package:
https://www.npmjs.com/package/pdfjs-dist/v/6.4.299

The two minified modules are the unmodified `legacy/build` renderer and worker.
They are loaded locally on demand by `assets/js/cv-preview.js`. Keep both modules
on the same version when updating. The CV embeds its fonts, so no external font
assets are needed. PDF.js is distributed under the included Apache 2.0 license.

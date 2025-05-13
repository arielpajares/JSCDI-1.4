# JSCDI-1.4
JSCDI (JavaScriptCanvasDesignImporter) it's the name of my personal web graphics project using Rust as backend. I started it back in January of 2024 as a small project for personal use and entertainment. But as it is now, it's an ambitious project with the main purpose of being an easy implementation of web graphics in JavaScript. It will be very useful for game development at first, but I plan that it could also be adapted for other kinds of web applications.
# JSCGL-1.0
JSCGL (JavaScriptCanvasGraphicsLibrary) is an implementation of WebGL in JavaScript that I started when learning WebGL in the course of April 2025.
# JSCGL-2.0 (Coming Soon)
This is an updated version of JSCGL that implements the successor of WebGL, WebGPU. This version of JSCGL is available just now inside the JSCGL directory as JSCGL-2.0-WebGPU / JSCGL.js.
For this initial version of JSCGL-2.0, I implemented all the previous functions of the last version, but now it works on WebGPU. This advancement will really expand the possibilities
compared to the previous version, and there is still a lot of work to do, but we will get there eventually. The webGpuTest.html will be available soon as well, with some changes
in the lighting shader after that.

WARNING: JSCGL-2.0 uses WebGPU, which is a native browser API that not many browsers have. Also, the Rust server doesn't support HTTPS protocol yet, which will cause WebGPU not to work because it requires running on a secure context (localhost or HTTPS), so if you are having problems using it with this repository web server, just open the connection using
127.0.0.1 (localhost).

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // set an initial value for this matrix to identify
  var idendityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, idendityM.elements);
}

let Animation = true;
let g_rotationOrigin = [0,0];
let g_globalAngles = [0,0]
let g_lowerArmAngle = 0;
let g_upperArmAngle = 0;
let g_speed = 1;

function addHtmlUiActions(){
  document.getElementById('toggle').onclick = function() {if(Animation){Animation=false;} else {Animation=true}; renderAllShapes();};
  document.getElementById('speedSlide').addEventListener('mousemove', function() {g_speed = this.value; renderAllShapes();});
  document.getElementById('lowerArmSlide').addEventListener('mousemove', function() {g_lowerArmAngle = this.value; renderAllShapes();});
  document.getElementById('upperArmSlide').addEventListener('mousemove', function() {g_upperArmAngle = this.value; renderAllShapes();});
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addHtmlUiActions();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev) {
    if (ev.shiftKey) {
      poke();
    }
  };
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) }};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //enable blending for transparency
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  
  //renderAllShapes();
  requestAnimationFrame(tick);
}

var legAngle1 = 0;
var legAngle2 = 0;
var legAngle3 = 0;
let pokeAngle = 0;
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now()/1000.0 - g_startTime;

  updateAnimationAngles();
  
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles(){
  if(Animation){
      legAngle1 = -15*Math.sin(g_speed*2*g_seconds+Math.PI/2)-15;
      legAngle2 = -10*Math.sin(g_speed*2*g_seconds+2*Math.PI/2)-15;
      legAngle3 = -15*Math.sin(g_speed*2*g_seconds+3*Math.PI/2)-15;
    }
}

function poke() {
  if(pokeAngle == 0) {
    pokeAngle = 75;
    legAngle1 = 0;
    legAngle2 = -10;
    legAngle3 = 0;
    console.log(pokeAngle);
    Animation=false;
    requestAnimationFrame(tick);
  } else{
    pokeAngle = 0;
    Animation=true;
    console.log(pokeAngle);
  }
}

function click(ev) {
  [x,y] = handleClickCoordinates(ev);

  g_globalAngles = [(g_rotationOrigin[1] - y)*100, -(g_rotationOrigin[0] - x)*100]

  renderAllShapes();
}

function handleClickCoordinates(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return ([x,y]);
}

let eyeColor = [0, 0.15, 0, 1];
let bodyColor = [140/255, 100/255, 80/255, 1];
let legColor = [100/255, 60/255, 10/255,1];

function renderAllShapes() {
  var startTime = performance.now();
  
  var globalRotMat = new Matrix4()
  globalRotMat.rotate(g_globalAngles[0], 1, 0, 0);
  globalRotMat.rotate(g_globalAngles[1], 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  var head = new Cube();
  head.color = bodyColor;
  head.matrix.translate(0,-0.3,-0.35);
  head.matrix.scale(0.35,0.3,0.4);
  head.render();

  var rEye1 = new Sphere();
  rEye1.color = eyeColor
  rEye1.matrix.translate(-0.052,-0.23,-0.55);
  rEye1.matrix.scale(0.1,0.1,0.1);
  rEye1.render();
  
  var lEye1 = new Sphere();
  lEye1.color = eyeColor
  lEye1.matrix.translate(0.052,-0.23,-0.55);
  lEye1.matrix.scale(0.1,0.1,0.1);
  lEye1.render();

  var rEye2 = new Sphere();
  rEye2.color = eyeColor
  rEye2.matrix.translate(-0.14,-0.2,-0.55);
  rEye2.matrix.scale(0.06,0.06,0.06);
  rEye2.render();

  var lEye2 = new Sphere();
  lEye2.color = eyeColor
  lEye2.matrix.translate(0.14,-0.2,-0.55);
  lEye2.matrix.scale(0.06,0.06,0.06);
  lEye2.render();

  var rEye3 = new Sphere();
  rEye3.color = eyeColor
  rEye3.matrix.translate(-0.175,-0.18,-0.48);
  rEye3.matrix.scale(0.03,0.03,0.03);
  rEye3.render();

  var lEye3 = new Sphere();
  lEye3.color = eyeColor
  lEye3.matrix.translate(0.175,-0.18,-0.48);
  lEye3.matrix.scale(0.03,0.03,0.03);
  lEye3.render();

  var rEye4 = new Sphere();
  rEye4.color = eyeColor
  rEye4.matrix.translate(-0.175,-0.19,-0.4);
  rEye4.matrix.scale(0.05,0.05,0.05);
  rEye4.render();

  var lEye4 = new Sphere();
  lEye4.color = eyeColor
  lEye4.matrix.translate(0.175,-0.19,-0.4);
  lEye4.matrix.scale(0.05,0.05,0.05);
  lEye4.render();

  var rMouth = new Cube();
  rMouth.color = legColor;
  rMouth.matrix.translate(-0.04,-0.41,-0.57);
  rMouth.matrix.scale(0.07,0.12,0.05);
  rMouth.render();

  var lMouth = new Cube();
  lMouth.color = legColor;
  lMouth.matrix.translate(0.04,-0.41,-0.57);
  lMouth.matrix.scale(0.07,0.12,0.05);
  lMouth.render();

  var body = new Cube();
  body.color = bodyColor;
  body.matrix.translate(0,-0.35,0.1);
  body.matrix.rotate(8,1,0,0);
  body.matrix.scale(0.32,0.25,0.5);
  body.render();

  var rpalp1 = new Cube();
  rpalp1.color = [130/255, 90/255, 40/255,1];
  rpalp1.rotateAroundPoint(-g_upperArmAngle, 0, 0, 1, -0.16, -0.44, -0.66)
  var rpalp1CoorMat = new Matrix4(rpalp1.matrix);
  rpalp1.matrix.translate(-0.19,-0.35,-0.57);
  rpalp1.matrix.rotate(-40,1,0,0);
  rpalp1.matrix.rotate(25,0,0,1);
  rpalp1.matrix.scale(0.07,0.2,0.07);
  rpalp1.render();

  var rpalp2 = new Cube();
  rpalp2.color = [120/255, 80/255, 30/255,1];
  rpalp2.matrix = rpalp1CoorMat;
  rpalp2.rotateAroundPoint(g_lowerArmAngle, 0, 0, 1, -0.22, -0.29, -0.66)
  rpalp2.matrix.translate(-0.18,-0.32,-0.66);
  rpalp2.matrix.rotate(15,0,1,0);
  rpalp2.matrix.rotate(50,0,0,1);
  rpalp2.matrix.scale(0.08,0.15,0.08);
  rpalp2.render();

  var lpalp1 = new Cube();
  lpalp1.color = [130/255, 90/255, 40/255,1];
  lpalp1.matrix.translate(0.19,-0.35,-0.57);
  lpalp1.matrix.rotate(-40,1,0,0);
  lpalp1.matrix.rotate(-25,0,0,1);
  lpalp1.matrix.scale(0.07,0.2,0.07);
  lpalp1.render();

  var lpalp2 = new Cube();
  lpalp2.color = [120/255, 80/255, 30/255,1];
  lpalp2.matrix.translate(0.18,-0.32,-0.66);
  lpalp2.matrix.rotate(-15,0,1,0);
  lpalp2.matrix.rotate(-50,0,0,1);
  lpalp2.matrix.scale(0.08,0.15,0.08);
  lpalp2.render();



  
  var left1Joint1 = new Cube();
  left1Joint1.color = legColor;
  left1Joint1.rotateAroundPoint(15+legAngle2,0,1,0,0.15,0,-0.41);
  left1Joint1.rotateAroundPoint((-legAngle1+pokeAngle)/2,1,0,1,0.15,-0.4,-0.41);
  var left1Joint1CoorMat = new Matrix4(left1Joint1.matrix);
  left1Joint1.matrix.translate(0.2,-0.41,-0.43);
  left1Joint1.matrix.rotate(90,0,1,0);
  left1Joint1.matrix.rotate(90,1,0,0);
  left1Joint1.matrix.scale(0.06,0.12,0.06);
  left1Joint1.render();

  var left1Joint2 = new Cube();
  left1Joint2.color = legColor;
  left1Joint2.matrix = left1Joint1CoorMat;
  var left1Joint2CoorMat = new Matrix4(left1Joint2.matrix);
  left1Joint2.matrix.translate(0.3,-0.33,-0.50);
  left1Joint2.matrix.rotate(55,0,0,1);
  left1Joint2.matrix.rotate(-55,0,1,0);
  left1Joint2.matrix.rotate(90,1,0,0);
  left1Joint2.matrix.scale(0.06,0.25,0.06);
  left1Joint2.render();

  var left1Joint3 = new Cube();
  left1Joint3.color = legColor;
  left1Joint3.matrix = left1Joint2CoorMat;
  left1Joint3.rotateAroundPoint(pokeAngle/1.5,1,0,1,0.4,-0.25,-0.55)
  left1Joint3.matrix.translate(0.33,-0.37,-0.71);
  left1Joint3.matrix.rotate(-15,0,0,1);
  left1Joint3.matrix.rotate(45,1,0,0);
  left1Joint3.matrix.scale(0.06,0.4,0.06);
  left1Joint3.render();

  var right1Joint1 = new Cube();
  right1Joint1.color = legColor;
  right1Joint1.rotateAroundPoint(20+legAngle2,0,1,0,-0.15,0,-0.41);
  right1Joint1.rotateAroundPoint(-legAngle3/2,1,0,0,-0.15,-0.4,-0.41);
  right1Joint1.rotateAroundPoint(legAngle3/2,0,0,1,-0.15,-0.4,-0.41);
  var right1Joint1CoorMat = new Matrix4(right1Joint1.matrix);
  right1Joint1.matrix.translate(-0.2,-0.41,-0.43);
  right1Joint1.matrix.rotate(90,0,1,0);
  right1Joint1.matrix.rotate(90,1,0,0);
  right1Joint1.matrix.scale(0.06,0.12,0.06);
  right1Joint1.render();

  var right1Joint2 = new Cube();
  right1Joint2.color = legColor;
  right1Joint2.matrix = right1Joint1CoorMat;
  var right1Joint2CoorMat = new Matrix4(right1Joint2.matrix);
  right1Joint2.matrix.translate(-0.3,-0.33,-0.5);
  right1Joint2.matrix.rotate(-55,0,0,1);
  right1Joint2.matrix.rotate(55,0,1,0);
  right1Joint2.matrix.rotate(90,1,0,0);
  right1Joint2.matrix.scale(0.06,0.25,0.06);
  right1Joint2.render();

  var right1Joint3 = new Cube();
  right1Joint3.color = legColor;
  right1Joint3.matrix = right1Joint2CoorMat;
  right1Joint3.matrix.translate(-0.33,-0.37,-0.71);
  right1Joint3.matrix.rotate(15,0,0,1);
  right1Joint3.matrix.rotate(45,1,0,0);
  right1Joint3.matrix.scale(0.06,0.4,0.06);
  right1Joint3.render();



  var left2Joint1 = new Cube();
  left2Joint1.color = legColor;
  left2Joint1.rotateAroundPoint(-15-legAngle2,0,1,0,0.15,0,-0.33);
  left2Joint1.rotateAroundPoint(-legAngle3/2,0,0,1,0.15,-0.4,-0.33);
  var left2Joint1CoorMat = new Matrix4(left2Joint1.matrix);
  left2Joint1.matrix.translate(0.2,-0.41,-0.35);
  left2Joint1.matrix.rotate(90,0,1,0);
  left2Joint1.matrix.rotate(90,1,0,0);
  left2Joint1.matrix.scale(0.06,0.12,0.06);
  left2Joint1.render();

  var left2Joint2 = new Cube();
  left2Joint2.color = legColor;
  left2Joint2.matrix = left2Joint1CoorMat;
  left2Joint2.rotateAroundPoint(-20,0,1,0,0.17,0,-0.3);
  var left2Joint2CoorMat = new Matrix4(left2Joint2.matrix);
  left2Joint2.matrix.translate(0.3,-0.33,-0.44);
  left2Joint2.matrix.rotate(55,0,0,1);
  left2Joint2.matrix.rotate(-55,0,1,0);
  left2Joint2.matrix.rotate(90,1,0,0);
  left2Joint2.matrix.scale(0.06,0.25,0.06);
  left2Joint2.render();

  var left2Joint3 = new Cube();
  left2Joint3.color = legColor;
  left2Joint3.matrix = left2Joint2CoorMat;
  left2Joint3.rotateAroundPoint(-55,0,1,0,0.37,0,-0.52);
  left2Joint3.matrix.translate(0.33,-0.37,-0.65);
  left2Joint3.matrix.rotate(-15,0,0,1);
  left2Joint3.matrix.rotate(45,1,0,0);
  left2Joint3.matrix.scale(0.06,0.4,0.06);
  left2Joint3.render();

  var right2Joint1 = new Cube();
  right2Joint1.color = legColor;
  right2Joint1.rotateAroundPoint(-10-legAngle2,0,1,0,-0.15,0,-0.33);
  right2Joint1.rotateAroundPoint(legAngle1/2,0,0,1,-0.15,-0.4,-0.33);
  var right2Joint1CoorMat = new Matrix4(right2Joint1.matrix);
  right2Joint1.matrix.translate(-0.2,-0.41,-0.35);
  right2Joint1.matrix.rotate(90,0,1,0);
  right2Joint1.matrix.rotate(90,1,0,0);
  right2Joint1.matrix.scale(0.06,0.12,0.06);
  right2Joint1.render();

  var right2Joint2 = new Cube();
  right2Joint2.color = legColor;
  right2Joint2.matrix = right2Joint1CoorMat;
  right2Joint2.rotateAroundPoint(20,0,1,0,-0.17,0,-0.3);
  var right2Joint2CoorMat = new Matrix4(right2Joint2.matrix);
  right2Joint2.matrix.translate(-0.3,-0.33,-0.44);
  right2Joint2.matrix.rotate(-55,0,0,1);
  right2Joint2.matrix.rotate(55,0,1,0);
  right2Joint2.matrix.rotate(90,1,0,0);
  right2Joint2.matrix.scale(0.06,0.25,0.06);
  right2Joint2.render();

  var right2Joint3 = new Cube();
  right2Joint3.color = legColor;
  right2Joint3.matrix = right2Joint2CoorMat;
  right2Joint3.rotateAroundPoint(55,0,1,0,-0.37,0,-0.52);
  right2Joint3.matrix.translate(-0.33,-0.37,-0.65);
  right2Joint3.matrix.rotate(15,0,0,1);
  right2Joint3.matrix.rotate(45,1,0,0);
  right2Joint3.matrix.scale(0.06,0.4,0.06);
  right2Joint3.render();



  var left3Joint1 = new Cube();
  left3Joint1.color = legColor;
  left3Joint1.rotateAroundPoint(10+legAngle2,0,1,0,0.15,0,-0.25);
  left3Joint1.rotateAroundPoint(-legAngle1/2,0,0,1,0.15,-0.4,-0.25);
  var left3Joint1CoorMat = new Matrix4(left3Joint1.matrix);
  left3Joint1.matrix.translate(0.2,-0.41,-0.27);
  left3Joint1.matrix.rotate(90,0,1,0);
  left3Joint1.matrix.rotate(90,1,0,0);
  left3Joint1.matrix.scale(0.06,0.12,0.06);
  left3Joint1.render();

  var left3Joint2 = new Cube();
  left3Joint2.color = legColor;
  left3Joint2.matrix = left3Joint1CoorMat;
  left3Joint2.rotateAroundPoint(-55,0,1,0,0.24,0,-0.25);
  var left3Joint2CoorMat = new Matrix4(left3Joint2.matrix);
  left3Joint2.matrix.translate(0.3,-0.33,-0.34);
  left3Joint2.matrix.rotate(55,0,0,1);
  left3Joint2.matrix.rotate(-55,0,1,0);
  left3Joint2.matrix.rotate(90,1,0,0);
  left3Joint2.matrix.scale(0.06,0.25,0.06);
  left3Joint2.render();

  var left3Joint3 = new Cube();
  left3Joint3.color = legColor;
  left3Joint3.matrix = left3Joint2CoorMat;
  left3Joint3.rotateAroundPoint(-30,0,1,0,0.36,0,-0.41);
  left3Joint3.matrix.translate(0.33,-0.37,-0.55);
  left3Joint3.matrix.rotate(-15,0,0,1);
  left3Joint3.matrix.rotate(45,1,0,0);
  left3Joint3.matrix.scale(0.06,0.4,0.06);
  left3Joint3.render();

  var right3Joint1 = new Cube();
  right3Joint1.color = legColor;
  right3Joint1.rotateAroundPoint(25+legAngle2,0,1,0,-0.15,0,-0.25);
  right3Joint1.rotateAroundPoint(legAngle3/2,0,0,1,-0.15,-0.4,-0.25);
  var right3Joint1CoorMat = new Matrix4(right3Joint1.matrix);
  right3Joint1.matrix.translate(-0.2,-0.41,-0.27);
  right3Joint1.matrix.rotate(90,0,1,0);
  right3Joint1.matrix.rotate(90,1,0,0);
  right3Joint1.matrix.scale(0.06,0.12,0.06);
  right3Joint1.render();

  var right3Joint2 = new Cube();
  right3Joint2.color = legColor;
  right3Joint2.matrix = right3Joint1CoorMat;
  right3Joint2.rotateAroundPoint(55,0,1,0,-0.24,0,-0.25);
  var right3Joint2CoorMat = new Matrix4(right3Joint2.matrix);
  right3Joint2.matrix.translate(-0.3,-0.33,-0.34);
  right3Joint2.matrix.rotate(-55,0,0,1);
  right3Joint2.matrix.rotate(55,0,1,0);
  right3Joint2.matrix.rotate(90,1,0,0);
  right3Joint2.matrix.scale(0.06,0.25,0.06);
  right3Joint2.render();

  var right3Joint3 = new Cube();
  right3Joint3.color = legColor;
  right3Joint3.matrix = right3Joint2CoorMat;
  right3Joint3.rotateAroundPoint(30,0,1,0,-0.36,0,-0.41);
  right3Joint3.matrix.translate(-0.33,-0.37,-0.55);
  right3Joint3.matrix.rotate(15,0,0,1);
  right3Joint3.matrix.rotate(45,1,0,0);
  right3Joint3.matrix.scale(0.06,0.4,0.06);
  right3Joint3.render();



  var left4Joint1 = new Cube();
  left4Joint1.color = legColor;
  left4Joint1.rotateAroundPoint(-35-legAngle2,0,1,0,0.15,0,-0.17);
  left4Joint1.rotateAroundPoint(-legAngle3/2,0,0,1,0.15,-0.4,-0.17);
  var left4Joint1CoorMat = new Matrix4(left4Joint1.matrix);
  left4Joint1.matrix.translate(0.2,-0.41,-0.19);
  left4Joint1.matrix.rotate(90,0,1,0);
  left4Joint1.matrix.rotate(90,1,0,0);
  left4Joint1.matrix.scale(0.06,0.12,0.06);
  left4Joint1.render();

  var left4Joint2 = new Cube();
  left4Joint2.color = legColor;
  left4Joint2.matrix = left4Joint1CoorMat;
  left4Joint2.rotateAroundPoint(-75,0,1,0,0.23,0,-0.19);
  var left4Joint2CoorMat = new Matrix4(left4Joint2.matrix);
  left4Joint2.matrix.translate(0.3,-0.33,-0.28);
  left4Joint2.matrix.rotate(55,0,0,1);
  left4Joint2.matrix.rotate(-55,0,1,0);
  left4Joint2.matrix.rotate(90,1,0,0);
  left4Joint2.matrix.scale(0.06,0.25,0.06);
  left4Joint2.render();

  var left4Joint3 = new Cube();
  left4Joint3.color = legColor;
  left4Joint3.matrix = left4Joint2CoorMat;
  left4Joint3.rotateAroundPoint(-55,0,1,0,0.37,0,-0.36);
  left4Joint3.matrix.translate(0.33,-0.37,-0.49);
  left4Joint3.matrix.rotate(-15,0,0,1);
  left4Joint3.matrix.rotate(45,1,0,0);
  left4Joint3.matrix.scale(0.06,0.4,0.06);
  left4Joint3.render();

  var right4Joint1 = new Cube();
  right4Joint1.color = legColor;
  right4Joint1.rotateAroundPoint(10-legAngle2,0,1,0,-0.15,0,-0.17);
  right4Joint1.rotateAroundPoint(legAngle1/2,0,0,1,-0.15,-0.4,-0.17);
  var right4Joint1CoorMat = new Matrix4(right4Joint1.matrix);
  right4Joint1.matrix.translate(-0.2,-0.41,-0.19);
  right4Joint1.matrix.rotate(90,0,1,0);
  right4Joint1.matrix.rotate(90,1,0,0);
  right4Joint1.matrix.scale(0.06,0.12,0.06);
  right4Joint1.render();

  var right4Joint2 = new Cube();
  right4Joint2.color = legColor;
  right4Joint2.matrix = right4Joint1CoorMat;
  right4Joint2.rotateAroundPoint(75,0,1,0,-0.23,0,-0.19);
  var right4Joint2CoorMat = new Matrix4(right4Joint2.matrix);
  right4Joint2.matrix.translate(-0.3,-0.33,-0.28);
  right4Joint2.matrix.rotate(-55,0,0,1);
  right4Joint2.matrix.rotate(55,0,1,0);
  right4Joint2.matrix.rotate(90,1,0,0);
  right4Joint2.matrix.scale(0.06,0.25,0.06);
  right4Joint2.render();

  var right4Joint3 = new Cube();
  right4Joint3.color = legColor;
  right4Joint3.matrix = right4Joint2CoorMat;
  right4Joint3.rotateAroundPoint(55,0,1,0,-0.37,0,-0.36);
  right4Joint3.matrix.translate(-0.33,-0.37,-0.49);
  right4Joint3.matrix.rotate(15,0,0,1);
  right4Joint3.matrix.rotate(45,1,0,0);
  right4Joint3.matrix.scale(0.06,0.4,0.06);
  right4Joint3.render();
  
  

  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
}

function sendTextToHTML(text, htmlID) { 
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm) {
        console.log("Failed to get" + htmlID + "from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}
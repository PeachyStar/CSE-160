// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_NormalMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0.0)));
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform bool u_specularOn;
  uniform bool u_lightOn;
  uniform bool u_normalOn;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform vec3 u_lightColor;
  uniform vec3 u_spotlightDir;
  uniform float u_spotlightCutoff; 
  void main() {
    if(u_normalOn){
      gl_FragColor = vec4((v_Normal+1.0)/2.0,1.0);
    }else if(u_whichTexture == -2){
      gl_FragColor = u_FragColor; //solid color

    } else if(u_whichTexture == -1){
      gl_FragColor = vec4(v_UV,1,1);

    } else if(u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV);

    } else if(u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV);

    } else {
      gl_FragColor = vec4(1,0.2,0.2,1); //error color
    }

    if(u_lightOn){
      vec3 lightVector = u_lightPos-vec3(v_VertPos);
      float r = length(lightVector);

      vec3 L = normalize(lightVector);

      vec3 lightDir = normalize(u_lightPos - vec3(v_VertPos));
      vec3 spotDir = normalize(-u_spotlightDir); // pointing direction

      float theta = dot(lightDir, spotDir); // cosine of angle between them

      // Spotlight intensity: hard cutoff
      float intensity = step(u_spotlightCutoff, theta); // 1.0 if inside cone, 0.0 if outside

      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(N, lightDir), 0.0);

      // Apply spotlight intensity
      vec3 diffuse = vec3(gl_FragColor) * u_lightColor * nDotL * 0.7 * intensity;
      vec3 ambient = vec3(gl_FragColor) * u_lightColor * 0.3;

      vec3 R = reflect(-L,N);
      vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

      float specular = u_specularOn ? pow(max(dot(E, R), 0.0), 50.0) : 0.0;
      gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
    }
  }`

let canvas;
let camera;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let u_lightPos;
let u_cameraPos;
let u_specularOn;
let u_lightOn;
let u_normalOn;
let u_NormalMatrix;
let u_lightColor;
let u_spotlightDir;
let u_spotlightCutoff;
let isMouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

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

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return false;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return false;
  }

  u_specularOn = gl.getUniformLocation(gl.program, 'u_specularOn');
  if (!u_specularOn) {
    console.log('Failed to get the storage location of u_specularOn');
    return false;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return false;
  }

  u_normalOn = gl.getUniformLocation(gl.program, 'u_normalOn');
  if (!u_normalOn) {
    console.log('Failed to get the storage location of u_normalOn');
    return false;
  }

  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return false;
  }

  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  u_spotlightDir = gl.getUniformLocation(gl.program, 'u_spotlightDir');
  u_spotlightCutoff = gl.getUniformLocation(gl.program, 'u_spotlightCutoff');

  // set an initial value for this matrix to identify
  var idendityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, idendityM.elements);
}

let g_normalOn = false;
let g_lightON = true;
let g_lightPos = [0,-0.2,-0.6];
let g_lightAngle = [0,0,1];
let g_lightColor = [1.0,1.0,1.0];
let g_lightSize = 0.4;
let g_globalAngles = [0,0];
let isPointerLocked = false;

function addHtmlUiActions(){
  document.getElementById('toggle').onclick = function() {if(Animation){Animation=false;} else {Animation=true}; renderAllShapes();};
  document.getElementById('toggleNormal').onclick = function() {if(g_normalOn){g_normalOn=false;} else {g_normalOn=true}; renderAllShapes();};
  document.getElementById('toggleLight').onclick = function() {if(g_lightON){g_lightON=false;} else {g_lightON=true}; renderAllShapes();};
  document.getElementById('LightXSlide').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[0] = this.value/100; renderAllShapes();}});
  document.getElementById('LightYSlide').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[1] = this.value/100; renderAllShapes();}});
  document.getElementById('LightZSlide').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[2] = this.value/100; renderAllShapes();}});
  document.getElementById('LightRSlide').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightColor[0] = this.value/255; renderAllShapes();}});
  document.getElementById('LightGSlide').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightColor[1] = this.value/255; renderAllShapes();}});
  document.getElementById('LightBSlide').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightColor[2] = this.value/255; renderAllShapes();}});
  document.getElementById('LightAngleSlide').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightSize = this.value/100; renderAllShapes();}});
  }

function initTextures() {
  const image0 = new Image();
  const image1 = new Image();
  let loaded = 0;

  image0.onload = () => {
    loadTexture(image0, 0);  // Texture unit 0
    loaded++;
    if (loaded === 2) renderAllShapes();
  };
  image0.src = './resources/leaf.jpg';

  image1.onload = () => {
    loadTexture(image1, 1);  // Texture unit 1
    loaded++;
    if (loaded === 2) renderAllShapes();
  };
  image1.src = './resources/grass.jpg';

  return true;
}

function loadTexture(image, texUnit) {
  const texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0 + texUnit);  // activate tex unit
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  if (texUnit === 0) gl.uniform1i(u_Sampler0, 0);
  else if (texUnit === 1) gl.uniform1i(u_Sampler1, 1);
}

function keydown(ev) {
  switch (ev.key) {
    case 'w':
    case 'W':
      camera.moveForward();
      break;
    case 's':
    case 'S':
      camera.moveBackwards();
      break;
    case 'a':
    case 'A':
      camera.moveLeft();
      break;
    case 'd':
    case 'D':
      camera.moveRight();
      break;
    case ' ':
      camera.moveUp();
      break;
    case 'Shift':
      camera.moveDown();
      break;
    case 'q':
    case 'Q':
      camera.panLeft();
      break;
    case 'e':
    case 'E':
      camera.panRight();
      break;
  }
  renderAllShapes();  // re-render scene after movement
}

function onMouseMove(event) {
  if (!isPointerLocked) return;    // only rotate while locked

  const dx = event.movementX;
  const dy = event.movementY;
  const sensitivity = 0.25;

  camera.panRight(dx * sensitivity);
  camera.panUp   (dy * sensitivity);
  renderAllShapes();
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addHtmlUiActions();
  initTextures();

  camera = new Camera();  // instantiate camera
  document.onkeydown = keydown;

  canvas.onclick = () => {
    canvas.requestPointerLock();
  };

  document.addEventListener('pointerlockchange', () => {
    isPointerLocked = (document.pointerLockElement === canvas);
  });

  document.addEventListener('mousemove', onMouseMove);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //enable blending for transparency
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  
  requestAnimationFrame(tick);
}

var legAngle1 = 0;
var legAngle2 = 0;
var legAngle3 = 0;
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
      legAngle1 = -15*Math.sin(2*g_seconds+Math.PI/2)-15;
      legAngle2 = -10*Math.sin(2*g_seconds+2*Math.PI/2)-15;
      legAngle3 = -15*Math.sin(2*g_seconds+3*Math.PI/2)-15;
      g_lightPos[0] = Math.cos(g_seconds);
    }
}

function handleClickCoordinates(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return ([x,y]);
}

function renderAllShapes() {
  var startTime = performance.now();
  
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

  // GLOBAL ROTATE matrix
  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngles[0], 1, 0, 0);
  globalRotMat.rotate(g_globalAngles[1], 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
  gl.uniform1i(u_lightOn, g_lightON);
  gl.uniform1i(u_normalOn, g_normalOn);
  gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
  gl.uniform1f(u_spotlightCutoff, Math.cos(g_lightSize)); 

  const len = Math.sqrt(g_lightAngle[0]*g_lightAngle[0] + g_lightAngle[1]*g_lightAngle[1] + g_lightAngle[2]*g_lightAngle[2]);
  const normDir = len === 0 ? [0, -1, 0] : [g_lightAngle[0]/len, g_lightAngle[1]/len, g_lightAngle[2]/len];

  gl.uniform3f(u_spotlightDir, normDir[0], normDir[1], normDir[2]);

  var light = new Cube();
  light.textureNum = -2;
  light.color = [1,1,0.5,1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2])
  light.matrix.scale(-0.1,-0.1,-0.1);
  light.render();

  var sky = new Cube();
  sky.textureNum = -2;
  sky.reflectiveTF = false;
  sky.color = [115/255, 219/255, 245/255, 1];
  sky.matrix.scale(-10,-10,-10);
  sky.render();

  var ground = new Cube();
  ground.textureNum = -2;
  ground.reflectiveTF = false;
  ground.color = [115/255, 219/255, 100/255, 1];
  ground.matrix.translate(0, -0.46, 0); 
  ground.matrix.scale(20, 0.01, 20);  
  ground.render();

  var block = new Cube();
  block.textureNum = 0;
  block.color = [215/255, 100/255, 100/255, 1];
  block.matrix.translate(-0.3,0.2,0);
  block.matrix.scale(0.4,0.4,0.4);
  block.render();
  
  var ball = new Sphere();
  ball.textureNum = 1;
  ball.color = [215/255, 100/255, 100/255, 1];
  ball.matrix.translate(0.3,0.15,0);
  ball.matrix.scale(0.45,0.45,0.45);
  ball.render();

  let eyeColor = [0, 0.15, 0, 1];
  let bodyColor = [140/255, 100/255, 50/255, 1];
  let legColor = [100/255, 60/255, 10/255,1];

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
  var rpalp1CoorMat = new Matrix4(rpalp1.matrix);
  rpalp1.matrix.translate(-0.19,-0.35,-0.57);
  rpalp1.matrix.rotate(-40,1,0,0);
  rpalp1.matrix.rotate(25,0,0,1);
  rpalp1.matrix.scale(0.07,0.2,0.07);
  rpalp1.render();

  var rpalp2 = new Cube();
  rpalp2.color = [120/255, 80/255, 30/255,1];
  rpalp2.matrix = rpalp1CoorMat;
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
  left1Joint1.rotateAroundPoint((-legAngle1)/2,1,0,1,0.15,-0.4,-0.41);
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
  left1Joint3.rotateAroundPoint(0,1,0,1,0.4,-0.25,-0.55)
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
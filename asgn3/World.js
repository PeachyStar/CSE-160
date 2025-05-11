// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
    if(u_whichTexture == -2){
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
  }`

let canvas;
let camera;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
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

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
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

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  // set an initial value for this matrix to identify
  var idendityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, idendityM.elements);
}

let Animation = true;
let g_rotationOrigin = [0,0];
let g_globalAngles = [0,0]
let isPointerLocked = false;

function addHtmlUiActions(){

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

var g_map=[
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0],
  [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,0],
  [1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0],
  [1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,0,1,0,1,0],
  [1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,1,0],
  [1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,1,0,1,0],
  [1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1,0,1,0],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0],
  [1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0],
  [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0],
  [1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0],
  [1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,0,1,0,1,0],
  [1,0,1,0,1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,0],
  [1,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0,1,0],
  [1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,0],
  [1,0,1,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,1,0,1,0],
  [1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,0,1,0],
  [1,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0],
  [1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1,0],
  [1,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0,1,0,1,0,0,0,0,0,1,0],
  [1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,0],
  [1,0,0,0,1,0,0,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0],
  [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0],
  [1,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0],
  [1,1,1,0,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,0],
  [1,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0],
  [1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const WORLD_X = 32;
const WORLD_Y = 32;
const WORLD_Z = 32;

let g_world = [];
for (let x = 0; x < WORLD_X; x++) {
  g_world[x] = [];
  for (let y = 0; y < WORLD_Y; y++) {
    g_world[x][y] = [];
    for (let z = 0; z < WORLD_Z; z++) {
      if (y === 0 || y === 1 || y === 2) {
        g_world[x][y][z] = g_map[z][x];  // fill maze layers
      } else {
        g_world[x][y][z] = 0;  // air above
      }
    }
  }
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
  
  //renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now()/1000.0 - g_startTime;
  
  renderAllShapes();
  requestAnimationFrame(tick);
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

  for (let x = 0; x < WORLD_X; x++) {
    for (let y = 0; y < WORLD_Y; y++) {
      for (let z = 0; z < WORLD_Z; z++) {
        if (g_world[x][y][z] === 1) {
          const cube = new Cube();
          cube.matrix.translate(0, -0.2, 0);
          cube.matrix.scale(0.5, 0.5, 0.5);
          cube.matrix.translate(x- 29, y+0.04, z- 34);
          cube.render();
        }
      }
    }
  }
  
  var sky = new Cube();
  sky.textureNum = -2;
  sky.color = [115/255, 219/255, 245/255, 1];
  sky.matrix.scale(100,100,100);
  sky.render();

  let ground = new Cube();
  ground.textureNum = 1;
  ground.matrix.translate(-7.7, -0.46, -9.7); 
  ground.matrix.scale(20, 0.01, 20);  
  ground.render();

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
// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
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
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
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

  // // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor=[1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10;
let g_selectedType = POINT;
let g_selectedSegments = 10;
let g_prevDragPos = null;

function addHtmlUiActions(){
  document.getElementById('clearButton').onclick = function() {g_shapesList=[]; renderAllShapes();};
  document.getElementById('butterflyButton').onclick = function() {drawButterfly();};

  document.getElementById('pointButton').onclick = function() {g_selectedType = POINT;};
  document.getElementById('triangleButton').onclick = function() {g_selectedType = TRIANGLE;};
  document.getElementById('circleButton').onclick = function() {g_selectedType = CIRCLE;};
  
  document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100;});
  document.getElementById('greenSlide').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100;});
  document.getElementById('blueSlide').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100;});
  document.getElementById('alphaSlide').addEventListener('mouseup', function() {g_selectedColor[3] = this.value/100;});
  document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_selectedSize = this.value;});
  document.getElementById('circleSlide').addEventListener('mouseup', function() {g_selectedSegments = this.value;});
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addHtmlUiActions();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {
    if (ev.buttons == 1) {
      const [x, y] = handleClickCoordinates(ev);
  
      if (g_prevDragPos) {
        drawLineBetween(g_prevDragPos, [x, y]);
      }
      g_prevDragPos = [x, y];
    }
  };

  canvas.onmouseup = function() {
    g_prevDragPos = null;
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //enable blending for transparency
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

var g_shapesList = [];

function click(ev) {
  [x,y] = handleClickCoordinates(ev);

  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  renderAllShapes();
}

function drawLineBetween(p1, p2) {
  const steps = 10; // how many points to draw between
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) * p1[0] + t * p2[0];
    const y = (1 - t) * p1[1] + t * p2[1];

    let point = new Point();
    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_shapesList.push(point);
  }
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
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}

function drawButterfly() {
  const butterflyTriangles = [
    {
      vertices: [1/12,0, 7/12,-2/12, 4/12,-6/12],
      color: [0.14, 0.16, 0.61, 1.0] // blue
    },
    {
      vertices: [-1/12,0, -7/12,-2/12, -4/12,-6/12],
      color: [0.14, 0.16, 0.61, 1.0] // blue
    },
    {
      vertices: [6/12,-6/12, 7/12,-2/12, 4/12,-6/12],
      color: [0.14, 0.16, 0.61, 1.0] // blue
    },
    {
      vertices: [-6/12,-6/12, -7/12,-2/12, -4/12,-6/12],
      color: [0.14, 0.16, 0.61, 1.0] // blue
    },
    {
      vertices: [6/12,-6/12, 7/12,-2/12, 8/12,-5/12],
      color: [0.14, 0.16, 0.61, 1.0] // blue
    },
    {
      vertices: [-6/12,-6/12, -7/12,-2/12, -8/12,-5/12],
      color: [0.14, 0.16, 0.61, 1.0] // blue
    },
    {
      vertices: [7/12,-1/12, 1/12,0, 5/12,9/12],
      color: [0.14, 0.16, 0.61, 1.0] // blue
    },
    {
      vertices: [-7/12,-1/12, -1/12,0, -5/12,9/12 ],
      color: [0.14, 0.16, 0.61, 1.0] // blue
    },
    {
      vertices: [7/12,-1/12, 5/12,9/12, 9/12,9/12],
      color: [0.14, 0.16, 0.61, 1.0] // blue
    },
    {
      vertices: [-7/12,-1/12, -5/12,9/12, -9/12,9/12],
      color: [0.14, 0.16, 0.61, 1.0] // blue
    },
    {
      vertices: [7/12,-1/12, 9/12,9/12, 11/12,5/12],
      color: [0.14, 0.16, 0.61, 1.0] // blue
    },
    {
      vertices: [-7/12,-1/12, -9/12,9/12, -11/12,5/12],
      color: [0.14, 0.16, 0.61, 1.0] // blue
    },
    {
      vertices: [7/12,-1/12, 11/12,5/12, 11/12,1/12],
      color: [0.14, 0.16, 0.61, 1.0] // blue
    },
    {
      vertices: [-7/12,-1/12, -11/12,5/12, -11/12,1/12],
      color: [0.14, 0.16, 0.61, 1.0] // blue
    },
    {
      vertices: [-1/12,-4/12, -1/12,3/12, 1/12,3/12],
      color: [0.16, 0.11, 0.0, 1.0] // brown
    },
    {
      vertices: [-1/12,-4/12, 1/12,-4/12, 1/12,3/12],
      color: [0.16, 0.11, 0.0, 1.0] // brown
    },
    {
      vertices: [-1/12,3/12, 1/12,3/12, 0,4/12],
      color: [0.16, 0.11, 0.0, 1.0] // brown
    },
    {
      vertices: [-1/12,-4/12, 1/12,-4/12, 0,-6/12],
      color: [0.16, 0.11, 0.0, 1.0] // brown
    },
    {
      vertices: [-1/12,3/12, -2/12,5/12, -2/12,6/12],
      color: [0.16, 0.11, 0.0, 1.0] // brown
    },
    {
      vertices: [1/12,3/12, 2/12,5/12, 2/12,6/12],
      color: [0.16, 0.11, 0.0, 1.0] // brown
    },
  ];

  for (let tri of butterflyTriangles) {
    gl.uniform4f(u_FragColor, tri.color[0], tri.color[1], tri.color[2], tri.color[3]);
    drawTriangle(tri.vertices);
  }
}
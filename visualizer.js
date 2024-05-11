//import { THREE } from 'three.min.js';
var scene = new THREE.Scene();
var side1 = new THREE.Object3D();
var side2 = new THREE.Object3D();
var centralMass = new THREE.Object3D();
var camera = new THREE.PerspectiveCamera(50, $(window).width() / $(window).height(), 1, 1000);
var renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});
var blendingModes = new Array(THREE.NoBlending, THREE.NormalBlending, THREE.AdditiveBlending, THREE.SubtractiveBlending, THREE.MultiplyBlending);
var sphereField = new THREE.Group();
var knotField = new THREE.Group();
var particleLight;
var particlemat;
var particles;
var spheres = new Array();
var controls;
var tornado = false;
var rotate = false;
var rotateOR = false;
var rotationSpeed = 4.0;
var scale;
var fScale;
var COLORS = {
  ALL: 0,
  RED: 1,
  GREEN: 2,
  BLUE: 3,
  ORANGE: 4,
  PINK: 5,
  WHITE: 6,
  BLACK: 7,
  GRAY: 8,
  DUAL: {
    PINK_BLUE: 9,
    RED_BLUE: 10,
    GREEN_ORANGE: 11,
    ORANGE_BLUE: 12,
    BLACK_WHITE: 13,
    BLUE_GREEN: 14,
  },
  TRI: {
    RED_WHITE_BLUE: 15
  }
};
var palette = COLORS.RED;
var d = 0;
var kS = 0;
var cmS = 0;
var dB = 1.0;
var dR = 1.0;
var dual = 0;
var tri = 0;
var tkm = 8.0;
var radius = 13 * tkm;
var tube = 1.7 * tkm;
var radialSegments = 156 * (tkm * 1.25);
var tubularSegments = 12 * (tkm * 1.25);
var p = 3;
var q = 11;
var heightScale = 0.0001;
var knot;
var knot2;
var tkgeom;
var clock = new THREE.Clock();
var particleCount = 500;
var radiusP = 25;
var particleState = false;
var knotState = false;

var gridsize = 32;
var stepsize = 2;
var interval;
//var fScale, scale, rotationSpeed;

function init() {

  //side1 = new THREE.Object3D();

  //explodeGrid();
  document.body.appendChild(renderer.domElement);

  camera.position.z = 350;

  generateSpheres();
  //generatePoolBalls();
  if (knotState)
    generateTorusKnots();
  setupOrbitControls();
  setupLights();
  if (particleState)
    setupParticles();
}

function generateTorusKnots() {
  tkgeom = new THREE.TorusKnotGeometry(radius, tube, Math.round(radialSegments), Math.round(tubularSegments), Math.round(p), Math.round(q));

  knot = createParticleSystem(tkgeom, COLORS.BLUE);
  knot.scale.set(heightScale, heightScale, heightScale);

  side2.add(knot);

  /*
      knot2 = createParticleSystem(tkgeom, COLORS.RED);
      knot2.scale.set(heightScale, heightScale, heightScale);
      knot2.rotation.set(1.6,1.6,2.0);

      side2.add( knot2 );
  */

  scene.add(knotField);
  knotField.add(side2);

}

function setupLights() {
  particleLight = new THREE.PointLight(0xffffff, 5.0, 300, 2.0);
  //particleLight.add(new THREE.Mesh(
  //    new THREE.SphereBufferGeometry(4, 8, 8),
  //    new THREE.MeshBasicMaterial({ color: 0xffffff})));
  //scene.add(particleLight);

  var light = new THREE.AmbientLight(0x808080);
  scene.add(light);

  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(0, 100, 100);
  scene.add(directionalLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(200, 100, 0);
  scene.add(directionalLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(0, -100, -100);
  scene.add(directionalLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(-200, -100, 0);
  scene.add(directionalLight);
}

function setupOrbitControls() {
  controls = new THREE.OrbitControls(camera);
  controls.autoRotate = false;
  controls.autoRotateAxis = controls.AXES.Y_AXIS;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI;
  controls.autoRotateSpeed = 4.0;
  controls.enableDamping = false;
  controls.dampingFactor = 0.5;
  //controls.addEventListener('change', render);

  /*
  for(var i = 0; i < 7; i++) {
      controls.pan(new THREE.Vector3( 1, 0, 0 ));
      controls.pan(new THREE.Vector3( 0, 1, 0 ));
  }
  */
}

function generateSprite(spriteColor) {

  var canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;

  var context = canvas.getContext('2d');
  var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, 8);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  if (spriteColor === COLORS.BLUE) {
    gradient.addColorStop(0.2, 'rgba(0,0,255,1)');
    gradient.addColorStop(0.4, 'rgba(0,0,128,1)');
  } else if (spriteColor === COLORS.RED) {
    gradient.addColorStop(0.2, 'rgba(255,0,0,0.8)');
    gradient.addColorStop(0.4, 'rgba(128,0,0,0.6)');
  }
  //gradient.addColorStop(0.6, 'rgba(0,0,128,1)');
  //gradient.addColorStop(0.8, 'rgba(0,0,64,1)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  context.arc(8, 8, 16, 0, Math.PI * 2, false);
  context.fillStyle = gradient;
  context.fill();
  //context.fillRect(0, 0, canvas.width, canvas.height);

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;

}

function createParticleSystem(geom, spriteColor) {
  var material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 3,
    opacity: 0.5,
    transparent: true,
    blending: THREE.AdditiveBlending,
    map: generateSprite(spriteColor)
  });

  var system = new THREE.Points(geom, material);
  system.sortParticles = true;
  return system;
}

function setupParticles() {
  var loader = new THREE.TextureLoader()
  var sprite = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/circle.png', render);

  // material

  particlemat = new THREE.ShaderMaterial({
    uniforms: {
      map: {
        value: sprite
      },
      globalTime: {
        value: 0
      },
      baseColor: {
        value: new THREE.Color(0xffffff)
      }
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: THREE.VertexColors
  });

  // geometry
  ////
  var geometry = new THREE.BufferGeometry();
  var vertices = [];
  var colors = [];
  var times = [];

  var point = new THREE.Vector3();
  var color = new THREE.Color();

  for (var i = 0; i < particleCount; i++) {

    getRandomPointOnSphere(radiusP, point);

    color.setHSL(i / particleCount, 0.7, 0.7);

    vertices.push(point.x, point.y, point.z);
    colors.push(color.r, 0, 0);
    times.push(i / particleCount);

  }

  geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.addAttribute('time', new THREE.Float32BufferAttribute(times, 1));

  // particles

  particles = new THREE.Points(geometry, particlemat);
  scene.add(centralMass);
  centralMass.add(particles);
  centralMass.scale.set(0.13315813741118349, 0.13315813741118349, 0.13315813741118349);
  hideObject(centralMass);

}

function generateSpheres() {
  var i = 0;
  for (var x = 0; x < gridsize; x += stepsize) {
    var j = 0;
    spheres[i] = new Array();
    for (var y = 0; y < gridsize; y += stepsize) {
      var geometry = new THREE.SphereGeometry(0.66, 16, 16);

      var material = new THREE.MeshPhongMaterial({
        color: getColors(),
        specular: 0x111111,
        shininess: 30,
        reflectivity: 0.75,
        /*
                roughness: 0.5,
                metalness: 0,
                clearCoat: 1.0,
                clearCoatRoughness: 0,
                reflectivity: 1.0,
                */
        opacity: 0.75,
        blending: blendingModes[1],
        transparent: true
      });

      spheres[i][j] = new THREE.Mesh(geometry, material);
      //var glowMesh = THREEx.GeometricGlowMesh(spheres[i][j]);
      //spheres[i][j].add(glowMesh.object3d);
      spheres[i][j].position.set(0, 0, 0);
      spheres[i][j].velocity = new THREE.Vector3(
        randNum(5000, 10000) / 20000,
        randNum(100, 5000) / 20000,
        randNum(1000, 10000) / 20000
      );
      spheres[i][j].time = randNum(0, 10);
      spheres[i][j].origin = {
        x: 0,
        y: 0,
        z: 0
      };
      side1.add(spheres[i][j]);
      j++;
    }
    i++;
  }
  scene.add(sphereField);
  sphereField.add(side1);
  interval = (gridsize / stepsize) - 1;
}

function generatePoolBalls() {
  var i = 0;
  for (var x = 0; x < gridsize; x += stepsize) {
    var j = 0;
    spheres[i] = new Array();
    for (var y = 0; y < gridsize; y += stepsize) {
      /*
      var geometry = new THREE.SphereGeometry(0.66, 16, 16);

      var material = new THREE.MeshPhysicalMaterial({
          color: getColors(),
          /
          specular: 0xffffff,
          shininess: 20,
          reflectivity: 5.5,
          /
          roughness: 0.5,
          metalness: 0.5,
          clearCoat: 0.5,
          clearCoatRoughness: 0.5,
          opacity: 0.75,
          blending: 2,
          transparent: true
      });

      spheres[i][j] = new THREE.Mesh(geometry, material);
      */
      var n = Math.floor(Math.random() * (15 - 1 + 1)) + 1;
      spheres[i][j] = new THREEx.createPoolBall({
        ballDesc: n + '',
        striped: n > 8 ? true : false,
        textureW: 64,
        sphereR: 0.66
      });
      //var glowMesh = THREEx.GeometricGlowMesh(spheres[i][j]);
      //spheres[i][j].add(glowMesh.object3d);
      spheres[i][j].position.set(0, 0, 0);
      spheres[i][j].velocity = new THREE.Vector3(
        randNum(5000, 10000) / 20000,
        randNum(100, 5000) / 20000,
        randNum(1000, 10000) / 20000
      );
      spheres[i][j].time = randNum(0, 10);
      spheres[i][j].origin = {
        x: 0,
        y: 0,
        z: 0
      };
      side1.add(spheres[i][j]);
      j++;
    }
    i++;
  }
  scene.add(sphereField);
  sphereField.add(side1);
  interval = (gridsize / stepsize) - 1;
}

function expandCM() {
  //  return new Promise(function(resolve, reject) {
  if (cmS >= 5) {
    cmS = 5;
    centralMass.scale.set(0.75, 0.75, 0.75);
    return;
  }
  var scale = centralMass.scale.x;
  scale = Math.pow(scale, (1 / Math.pow(2, (0.0525 * cmS))));
  centralMass.scale.set(scale, scale, scale);
  cmS += 0.25;
  requestAnimationFrame(expandCM);
  //});
}

function expandCMWrapper() {
  return new Promise(function (resolve, reject) {
    expandCM();
    setTimeout(function () {
      resolve();
    }, 1000);
  });
}

function hideObject(o) {
  if (!o.visible)
    return;
  o.visible = false;
}

function showObject(o) {
  if (o.visible)
    return;
  o.visible = true;
}

/*
function knotGrow() {
    if (kS >= 5) { kS = 5; knot.scale.set(1,1,1); //console.log(knot.scale);
                  return; }
    var scale = knot.scale.x;
  scale = Math.pow(scale,(1/Math.pow(2,(0.25*kS))));
  knot.scale.set(scale,scale,scale);
  //console.log(scale, kS);
  kS += 0.25;
  requestAnimationFrame(knotGrow);
}
*/

function knotGrow() {
  //  return new Promise(function(resolve, reject) {
  if (kS >= 5) {
    kS = 5;
    knot.scale.set(1, 1, 1);
    return;
  }
  var scale = knot.scale.x;
  scale = Math.pow(scale, (1 / Math.pow(2, (0.25 * kS))));
  knot.scale.set(scale, scale, scale);
  kS += 0.25;
  requestAnimationFrame(knotGrow);
  //});
}

function knotGrowWrapper() {
  return new Promise(function (resolve, reject) {
    knotGrow();
    setTimeout(function () {
      resolve();
    }, 1000);
  });
}

/*
function knotShrink() {
    if (kS <= 0) { kS = 0; knot.scale.set(0.0001,0.0001,0.0001); //console.log(knot.scale);
                  return; }
  var scale = knot.scale.x;
  scale = scale*(1/Math.pow(2,(0.475*kS)));
  knot.scale.set(scale,scale,scale);
  //console.log(scale, kS);
  kS -= 0.25;
  requestAnimationFrame(knotShrink);
}
*/

function contractCM() {
  //return new Promise(function(resolve, reject) {
  if (cmS <= 0) {
    cmS = 0;
    centralMass.scale.set(0.13315813741118349, 0.13315813741118349, 0.13315813741118349);
    return;
  }
  var scale = centralMass.scale.x;
  scale = scale * (1 / Math.pow(2, (0.0475 * cmS)));
  centralMass.scale.set(scale, scale, scale);
  cmS -= 0.25;
  requestAnimationFrame(contractCM);
  //});
}

function contractCMWrapper() {
  return new Promise(function (resolve, reject) {
    contractCM();
    setTimeout(function () {
      resolve();
    }, 1000);
  });
}

function knotShrink() {
  //return new Promise(function(resolve, reject) {
  if (kS <= 0) {
    kS = 0;
    knot.scale.set(0.0001, 0.0001, 0.0001);
    return;
  }
  var scale = knot.scale.x;
  scale = scale * (1 / Math.pow(2, (0.475 * kS)));
  knot.scale.set(scale, scale, scale);
  kS -= 0.25;
  requestAnimationFrame(knotShrink);
  //});
}

function knotShrinkWrapper() {
  return new Promise(function (resolve, reject) {
    knotShrink();
    setTimeout(function () {
      resolve();
    }, 1000);
  });
}

/*
function explodeGrid() {
    //for(var d = 0; d < 6; d += 1) {
    //d = 5;
    //while (d < 5) {
    if (d > 5) {
        d = 5;
        return;
    }
    var i = 0;
    for (var x = 0; x < 64; x += 2) {
        var j = 0;
        for (var y = 0; y < 64; y += 2) {
            var max = 155;
            var min = -max;
            if (d === 0) {
                var z = Math.floor(Math.random() * (max - min + 1)) + min;
                spheres[i][j].position.set((x * d) - (31 * d), (y * d) - (31 * d), z);
            } else {
                spheres[i][j].position.set((x * d) - (31 * d), (y * d) - (31 * d), spheres[i][j].position.z);
            }
            j++;
        }
        i++;
    }
    d += 0.25;
    requestAnimationFrame(explodeGrid);
    //}
    //d = 5;
    //callback.play();
    //return;
    //controls.update();
    //renderer.render(scene, camera);
    //pauseit(500);
    //}
}
*/

function explodeGrid() {
  //return new Promise(function(resolve, reject) {
  if (d === 5) {
    //d = 5;
    return;
  }
  var i = 0;
  for (var x = 0; x < gridsize; x += stepsize) {
    var j = 0;
    for (var y = 0; y < gridsize; y += stepsize) {
      var max = interval * 5;
      var min = -max;
      if (d === 0) {
        if (spheres[i][j].origin.z === 0) {
          var z = Math.floor(Math.random() * (max - min + 1)) + min;
          spheres[i][j].origin.z = z;
        }
        spheres[i][j].position.set((x * d) - (interval * d), (y * d) - (interval * d), spheres[i][j].origin.z);
      } else {
        spheres[i][j].position.set((x * d) - (interval * d), (y * d) - (interval * d), spheres[i][j].origin.z);
        spheres[i][j].origin.x = spheres[i][j].position.x;
        spheres[i][j].origin.y = spheres[i][j].position.y;
      }
      j++;
    }
    i++;
  }
  d += 0.5;
  requestAnimationFrame(explodeGrid);
  //});
}

function explodeGridWrapper() {
  return new Promise(function (resolve, reject) {
    explodeGrid();
    setTimeout(function () {
      resolve();
    }, 1000);
  });
}

/*
function collapseGrid() {
    //for(var d = 0; d < 6; d += 1) {
    //d = 6;
    if (d < 0) {
        d = 0;
        return;
    }
    var i = 0;
    for (var x = 0; x < 64; x += 2) {
        var j = 0;
        for (var y = 0; y < 64; y += 2) {
            //var max = 64;
            //var min = max*-1;
            if (d === 0) {
                //var z = Math.floor(Math.random() * (max - min + 1)) + min;
                spheres[i][j].position.set(0, 0, 0);
            } else {
                var z = 0; //spheres[i][j].position.z - (spheres[i][j].position.z < 0 ? -0.1 : 0.1);
                spheres[i][j].position.set((x * d) - (31 * d), (y * d) - (31 * d), z);
            }
            j++;
        }
        i++;
    }
    d -= 0.5;
    requestAnimationFrame(collapseGrid);
    //controls.update();
    //renderer.render(scene, camera);
    //pauseit(500);
    //}
}
*/

function collapseGrid() {
  //return new Promise(function(resolve, reject) {
  if (d === 0) {
    //d = 0;
    return;
  }
  var i = 0;
  for (var x = 0; x < gridsize; x += stepsize) {
    var j = 0;
    for (var y = 0; y < gridsize; y += stepsize) {
      if (d === 0.5) {
        spheres[i][j].position.set(0, 0, 0);
      } else {
        var z = 0;
        spheres[i][j].position.set((x * d) - (interval * d), (y * d) - (interval * d), z);
      }
      j++;
    }
    i++;
  }
  d -= 0.5;
  requestAnimationFrame(collapseGrid);
  //});
}

function collapseGridWrapper() {
  return new Promise(function (resolve, reject) {
    collapseGrid();
    setTimeout(function () {
      resolve();
    }, 1000);
  });
}

function destroySpheres() {
  for (var i = 0; i < spheres.length; i++) {
    for (var j = 0; j < spheres[i].length; j++) {
      side1.remove(spheres[i][j]);
      spheres[i][j].geometry.dispose();
      spheres[i][j].material.dispose();
    }
  }
}

function bigBang() {
  return new Promise(async function (resolve, reject) {
    if (particleState)
      await expandCMWrapper();
    await explodeGridWrapper();
    if (knotState)
      await knotGrowWrapper();
    resolve();
  });
}

function bigCrunch() {
  return new Promise(async function (resolve, reject) {
    if (particleState)
      await contractCMWrapper();
    await collapseGridWrapper();
    if (knotState)
      await knotShrinkWrapper();
    resolve();
  });
}

function render() {

  if (typeof array === 'object' && array.length > 0) {
    var k = 0;
    for (var i = 0; i < spheres.length; i++) {
      for (var j = 0; j < spheres[i].length; j++) {
        //boost *= dB;
        //console.log(boost);
        scale = (array[k] + boost) / 32.0;
        //console.log(scale);
        //scale = scale * (dB); //*2.0);
        //console.log(scale);
        //if (scale > )
        //fScale = (scale > 6 ? 4 : scale); 
        fScale = (scale < 1 ? 1 : scale); //(scale > 6 ? 6 : scale));
        //console.log(fScale);
        spheres[i][j].scale.set(fScale, fScale, fScale);
        rotationSpeed = fScale * 2.0;
        //console.log(rotationSpeed);
        rotationSpeed = rotationSpeed * dR;
        //console.log(rotationSpeed);
        //rotationSpeed = fScale/10.0;
        //if(fScale != 1) {
        //console.log(fScale);
        //}
        k += (k < array.length ? 1 : 0);
      }
    }

  }

  var delta = clock.getDelta();
  //console.log(delta, delta*0.1);

  var t0 = clock.getElapsedTime();
  var t = t0 * 0.5;
  var timer = Date.now() * 0.00025;
  //console.log(delta, delta *0.1, t0, t);
  //if(typeof sphereField.rotation === 'object' && typeof sphereField.rotation.y === 'number') {
  //rotate = false;
  if (rotate && !rotateOR) {
    //sphereField.rotation.x += 2 * Math.PI / 60 / 60 * rotationSpeed;
    //sphereField.rotation.y += 4 * Math.PI / 60 / 60 * rotationSpeed; //0.02;
    //sphereField.rotation.z += 4 * Math.PI / 60 / 60 * rotationSpeed;
    //var rX = Math.sin(2 * Math.PI / 60 / 60 * rotationSpeed) * (5.0+Math.cos(t * rotationSpeed)) * Math.cos(Math.sin(t * rotationSpeed)); //2 * Math.PI / 60 / 60 * rotationSpeed;
    //var rY = Math.sin(4 * Math.PI / 60 / 60 * rotationSpeed) * (5.0+Math.cos(t * rotationSpeed)) * Math.cos(Math.cos(t * rotationSpeed)); //4 * Math.PI / 60 / 60 * rotationSpeed;
    //0.02;
    //var rX = 2 * Math.PI / 60 / 60 * rotationSpeed;
    //var rY = 4 * Math.PI / 60 / 60 * rotationSpeed; //0.02;
    //var rZ = 3 * Math.PI / 60 / 60 * rotationSpeed;
    //rX += delta;
    //rY += delta;
    //rZ += delta;
    //sphereField.rotation.z += 4 * Math.PI / 60 / 60 * rotationSpeed;
    //sphereField.rotation.x += rX;
    //sphereField.rotation.y += rY;
    //sphereField.rotation.z += rZ;
    //var rX = ((2.0 * Math.PI / 3600) * (rotationSpeed)) * 2.0;
    var rX = Math.cos(t) / 180 * rotationSpeed;
    //var rY = ((3.0 * Math.sqrt(Math.PI) / 3600) * (rotationSpeed)) * 2.5;
    var rY = Math.sin(t) / 180 * rotationSpeed;
    var rZ = ((4.0 * Math.PI / 60 / 60) * (rotationSpeed)) * 3.0;
    //sphereField.rotation.x += Math.sin((delta * Math.PI) * (rotationSpeed / 12)); //rX;
    //sphereField.rotation.y += Math.cos((delta * Math.PI) * (rotationSpeed / 6));
    //sphereField.rotation.z -= Math.sin(delta * (rotationSpeed / 11));
    sphereField.rotation.x += rX;
    sphereField.rotation.y += rY; //rY;
    //sphereField.rotation.z += rZ;
    //sphereField.rotation.x += Math.sin((2.0*Math.PI/60/60)*rotationSpeed);
    //sphereField.rotation.y += Math.sin((2.0*Math.PI/60/60)*1.5*rotationSpeed);
    //sphereField.rotation.z += Math.sin((2.0*Math.PI/60/60)*rotationSpeed*0.7);
    if (knotState) {
      knotField.rotation.x -= rX;
      //knotField.rotation.y -= rY;
      knotField.rotation.z -= rY;
    }
    /*
    knot2.rotation.x += rX;
    knot2.rotation.y += rY;
    knot2.rotation.z += rZ;
    */

    //knot.rotation.z += (rX + rY)/2.0;
    //sphereField.rotation.z += 4 * Math.PI / 60 / 60 * rotationSpeed;
    /*
    for (var i = 0; i < spheres.length; i++) {
        for (var j = 0; j < spheres[i].length; j++) {
            spheres[i][j].rotation.set
        }
    }
    */

  } else if (rotateOR) {
    sphereField.rotation.set(0, 0, 0);
    if (knotState)
      knotField.rotation.set(0, 0, 0);
  }

  if (tornado) {
    for (var ii = 0; ii < spheres.length; ii++) {
      for (var jj = 0; jj < spheres[ii].length; jj++) {
        var sphere = spheres[ii][jj];
        sphere.time += delta;
        var speedX = Math.cos(sphere.time * sphere.velocity.x * 5); //(rotationSpeed/2));
        var speedY = Math.cos(sphere.time * sphere.velocity.y * 5); //(rotationSpeed/2));
        var speedZ = Math.sin(sphere.time * sphere.velocity.z * 5); //(rotationSpeed/2));
        sphere.position.x = -(speedX * sphere.origin.x);
        sphere.position.y = (speedY * sphere.origin.y);
        sphere.position.z = speedZ * sphere.origin.x;
      }
    }
  }

  if (particleState) {
    particlemat.uniforms.globalTime.value += delta * 0.1;
    //particles.rotation.z += 0.015;
    centralMass.rotation.x += delta;
    centralMass.rotation.y -= delta;
    //centralMass.rotation.z += delta*delta;
  }
  /*
  particleLight.position.x = Math.sin( timer * 7 ) * 160;
  particleLight.position.y = Math.cos( timer * 5 ) * 260;
  particleLight.position.z = Math.cos( timer * 3 ) * 160;
  */

  requestAnimationFrame(render);
  controls.update();
  renderer.render(scene, camera);
}

function randomRedColor() {
  var min = 7;
  var max = 254;
  var r = (Math.floor(Math.random() * (max - min + 1)) + min) * 65536;
  //var g = (Math.floor(Math.random() * (max - min + 1)) + min) * 256;
  //var b = (Math.floor(Math.random() * (max - min + 1)) + min);
  return r;
}

function randomGreenColor() {
  var min = 7;
  var max = 254;
  //var r = (Math.floor(Math.random() * (max - min + 1)) + min) * 65536;
  var g = (Math.floor(Math.random() * (max - min + 1)) + min) * 256;
  //var b = (Math.floor(Math.random() * (max - min + 1)) + min);
  return g;
}

function randomBlueColor() {
  var min = 7;
  var max = 254;
  //var r = (Math.floor(Math.random() * (max - min + 1)) + min) * 65536;
  //var g = (Math.floor(Math.random() * (max - min + 1)) + min) * 256;
  var b = (Math.floor(Math.random() * (max - min + 1)) + min);
  return b;
}

function randomOrangeColor() {
  var min = 63;
  var max = 190;
  var r = 255 * 65536; //(Math.floor(Math.random() * (max - min + 1)) + min) * 65536;
  var g = (Math.floor(Math.random() * (max - min + 1)) + min) * 256;
  //var b = (Math.floor(Math.random() * (max - min + 1)) + min);
  return r + g;
}

function randomPinkColor() {
  var min = 63;
  var max = 190;
  var r = 255 * 65536; //(Math.floor(Math.random() * (max - min + 1)) + min) * 65536;
  //var g = (Math.floor(Math.random() * (max - min + 1)) + min) * 256;
  var b = (Math.floor(Math.random() * (max - min + 1)) + min);
  return r + b;
}

function randomColor() {
  var min = 7;
  var max = 254;
  var r = (Math.floor(Math.random() * (max - min + 1)) + min) * 65536;
  var g = (Math.floor(Math.random() * (max - min + 1)) + min) * 256;
  var b = (Math.floor(Math.random() * (max - min + 1)) + min);
  return r + g + b;
}

function randomDualColor(aColor, bColor) {
  if (dual === 0) {
    dual++;
    return aColor();
  } else if (dual === 1) {
    dual = 0;
    return bColor();
  }
}

function randomTriColor(aColor, bColor, cColor) {
  if (tri === 0) {
    tri++;
    return aColor();
  } else if (tri === 1) {
    tri++;
    return bColor();
  } else if (tri === 2) {
    tri = 0;
    return cColor();
  }
}

function getColors() {
  if (palette === COLORS.ALL) {
    return randomColor();
  } else if (palette === COLORS.RED) {
    return randomRedColor();
  } else if (palette === COLORS.GREEN) {
    return randomGreenColor();
  } else if (palette === COLORS.BLUE) {
    return randomBlueColor();
  } else if (palette === COLORS.ORANGE) {
    return randomOrangeColor();
  } else if (palette === COLORS.PINK) {
    return randomPinkColor();
  } else if (palette === COLORS.DUAL.PINK_BLUE) {
    return randomDualColor(randomPinkColor, randomBlueColor);
  } else if (palette === COLORS.DUAL.RED_BLUE) {
    return randomDualColor(randomRedColor, randomBlueColor);
  } else if (palette === COLORS.DUAL.GREEN_ORANGE) {
    return randomDualColor(randomGreenColor, randomOrangeColor);
  } else if (palette === COLORS.DUAL.ORANGE_BLUE) {
    return randomDualColor(randomOrangeColor, randomBlueColor);
  } else if (palette === COLORS.DUAL.BLUE_GREEN) {
    return randomDualColor(randomBlueColor, randomGreenColor);
  }
}


function rebuildGrid() {
  destroySpheres();
  generateSpheres();
}


function recolor(pal) {
  palette = pal;
  dual = 0;
  tri = 0;
  //$('#colorlist').fadeOut();
  //rebuildGrid();
  for (var i = 0; i < spheres.length; i += 1) {
    for (var j = 0; j < spheres[i].length; j += 1) {
      spheres[i][j].material.color.set(getColors());
    }
  }
}


function getRandomPointOnSphere(r, v) {

  var angle = Math.random() * Math.PI * 2;
  var u = Math.random() * 2 - 1;

  v.x = Math.cos(angle) * Math.sqrt(1 - Math.pow(u, 2)) * r;
  v.y = Math.sin(angle) * Math.sqrt(1 - Math.pow(u, 2)) * r;
  v.z = u * r;

}

function randNum(min, max) {
  return Math.random() * (max - min) + min;
}

init();
render();
renderer.setSize($(window).width(), $(window).height());

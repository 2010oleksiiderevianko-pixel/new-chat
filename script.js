const canvas = document.getElementById("museum");
const gl = canvas.getContext("webgl", {
  antialias: true,
  alpha: false,
  depth: true,
});

const roomName = document.getElementById("roomName");
const visitorCount = document.getElementById("visitorCount");
const nearbyName = document.getElementById("nearbyName");
const artifactMark = document.getElementById("artifactMark");
const artifactType = document.getElementById("artifactType");
const artifactTitle = document.getElementById("artifactTitle");
const artifactText = document.getElementById("artifactText");
const autoTourButton = document.getElementById("autoTour");
const lightsButton = document.getElementById("lights");

if (!gl) {
  document.body.innerHTML = "<p style='padding:24px;color:white'>WebGL не запустився в цьому браузері.</p>";
  throw new Error("WebGL is not available");
}

const world = {
  width: 46,
  height: 34,
  walls: [
    rect(0, 0, 46, 1),
    rect(0, 33, 46, 1),
    rect(0, 0, 1, 34),
    rect(45, 0, 1, 34),
    rect(1, 11, 13, 1),
    rect(19, 11, 8, 1),
    rect(32, 11, 13, 1),
    rect(1, 22, 10, 1),
    rect(16, 22, 12, 1),
    rect(33, 22, 12, 1),
    rect(14, 1, 1, 7),
    rect(27, 1, 1, 7),
    rect(10, 22, 1, 7),
    rect(33, 22, 1, 7),
  ],
  rooms: [
    { name: "Лоджія Атріуму", x1: 14, z1: 8, x2: 32, z2: 22 },
    { name: "Зала Травертину", x1: 1, z1: 1, x2: 14, z2: 11 },
    { name: "Галерея Аркад", x1: 28, z1: 1, x2: 45, z2: 11 },
    { name: "Кортиле Снів", x1: 1, z1: 23, x2: 10, z2: 33 },
    { name: "Салон Фресок", x1: 34, z1: 23, x2: 45, z2: 33 },
  ],
};

const exhibits = [
  {
    x: 7,
    z: 5.8,
    hue: "#7ee7ff",
    color: [0.49, 0.91, 1],
    title: "Дощ, що пам'ятає відвідувачів",
    type: "Кінетична інсталяція",
    text: "Краплі повторюють маршрут останньої людини, яка стояла поруч. Якщо затриматись, вони почнуть ходити за тобою.",
  },
  {
    x: 38.2,
    z: 5.4,
    hue: "#ffbd66",
    color: [1, 0.74, 0.4],
    title: "Механізм запізнілого ранку",
    type: "Машинний експонат",
    text: "Колеса обертають не час, а відчуття часу. NPC іноді зупиняються біля нього, ніби чують звук, якого немає.",
  },
  {
    x: 22.9,
    z: 16.4,
    hue: "#66e0c2",
    color: [0.4, 0.88, 0.76],
    title: "Скляне серце музею",
    type: "Центральний артефакт",
    text: "Воно пульсує швидше, коли в атріумі більше руху. Музей ніби дихає через цей прозорий об'єкт.",
  },
  {
    x: 5.8,
    z: 28.3,
    hue: "#d8a2ff",
    color: [0.85, 0.64, 1],
    title: "Сон без власника",
    type: "Аудіовізуальна капсула",
    text: "Усередині немає зображення, але стіни реагують на наближення так, ніби ти щойно щось згадав.",
  },
  {
    x: 39.5,
    z: 28.5,
    hue: "#f26d7d",
    color: [0.95, 0.43, 0.49],
    title: "Картина, яка ще не погодилась існувати",
    type: "Живописна аномалія",
    text: "Полотно змінює рамку раніше, ніж з'являється малюнок. Воно вперто лишає центр порожнім.",
  },
];

const npcs = [
  npc("Куратор Марта", [[29, 18], [37, 7], [30, 10], [22, 18], [29, 18]], {
    skin: [0.78, 0.58, 0.45],
    hair: [0.12, 0.08, 0.055],
    shirt: [0.78, 0.72, 0.62],
    pants: [0.12, 0.13, 0.14],
    height: 1.03,
    build: 0.94,
    hairStyle: "bob",
  }),
  npc("Студент Лев", [[7, 8], [7, 4], [15, 10], [22, 16], [7, 8]], {
    skin: [0.88, 0.69, 0.55],
    hair: [0.06, 0.045, 0.035],
    shirt: [0.22, 0.48, 0.78],
    pants: [0.05, 0.07, 0.1],
    height: 1.08,
    build: 0.9,
    hairStyle: "short",
  }),
  npc("Охоронець Іван", [[18, 20], [8, 27], [4, 30], [15, 21], [18, 20]], {
    skin: [0.66, 0.45, 0.32],
    hair: [0.025, 0.025, 0.025],
    shirt: [0.08, 0.1, 0.12],
    pants: [0.03, 0.035, 0.04],
    height: 1.12,
    build: 1.12,
    hairStyle: "crop",
  }),
  npc("Невідома гостя", [[35, 29], [41, 29], [39, 24], [30, 20], [35, 29]], {
    skin: [0.58, 0.36, 0.25],
    hair: [0.02, 0.018, 0.015],
    shirt: [0.55, 0.28, 0.68],
    pants: [0.13, 0.11, 0.16],
    height: 0.99,
    build: 0.88,
    hairStyle: "long",
  }),
  npc("Туристка Аміна", [[18, 14], [12, 9], [6, 5], [18, 14]], {
    skin: [0.5, 0.32, 0.2],
    hair: [0.015, 0.012, 0.01],
    shirt: [0.84, 0.36, 0.25],
    pants: [0.11, 0.15, 0.2],
    height: 0.96,
    build: 0.92,
    hairStyle: "long",
  }),
  npc("Фотограф Ной", [[31, 15], [39, 8], [42, 6], [35, 13], [31, 15]], {
    skin: [0.9, 0.75, 0.62],
    hair: [0.55, 0.38, 0.18],
    shirt: [0.18, 0.42, 0.36],
    pants: [0.08, 0.08, 0.085],
    height: 1.05,
    build: 0.98,
    hairStyle: "short",
  }),
  npc("Пані Софія", [[7, 26], [5, 30], [12, 29], [16, 22], [7, 26]], {
    skin: [0.82, 0.62, 0.5],
    hair: [0.62, 0.58, 0.48],
    shirt: [0.26, 0.24, 0.22],
    pants: [0.5, 0.18, 0.16],
    height: 0.93,
    build: 1.02,
    hairStyle: "bob",
  }),
  npc("Мандрівник Такеші", [[36, 27], [41, 30], [39, 24], [29, 20], [36, 27]], {
    skin: [0.74, 0.55, 0.42],
    hair: [0.025, 0.022, 0.02],
    shirt: [0.76, 0.68, 0.42],
    pants: [0.09, 0.1, 0.12],
    height: 1.0,
    build: 0.96,
    hairStyle: "crop",
  }),
];

const player = {
  x: 22.8,
  y: 1.72,
  z: 20,
  yaw: -Math.PI / 2,
  pitch: 0,
};

const keys = new Set();
const pointer = { active: false, x: 0, y: 0 };
const touchMove = { active: false, id: null, dx: 0, dy: 0 };
let w = 1;
let h = 1;
let dpr = 1;
let last = performance.now();
let autoTour = false;
let night = false;
let pulse = 0;

const program = createProgram(vertexSource(), fragmentSource());
const locations = {
  aPosition: gl.getAttribLocation(program, "aPosition"),
  aNormal: gl.getAttribLocation(program, "aNormal"),
  uModel: gl.getUniformLocation(program, "uModel"),
  uViewProj: gl.getUniformLocation(program, "uViewProj"),
  uNormal: gl.getUniformLocation(program, "uNormal"),
  uColor: gl.getUniformLocation(program, "uColor"),
  uAlpha: gl.getUniformLocation(program, "uAlpha"),
  uEmissive: gl.getUniformLocation(program, "uEmissive"),
  uCamera: gl.getUniformLocation(program, "uCamera"),
  uNight: gl.getUniformLocation(program, "uNight"),
  uLightPos: gl.getUniformLocation(program, "uLightPos"),
  uLightColor: gl.getUniformLocation(program, "uLightColor"),
};

const meshes = {
  cube: makeMesh(cubeGeometry()),
  cylinder: makeMesh(cylinderGeometry(40)),
  sphere: makeMesh(sphereGeometry(28, 18)),
  arch: makeMesh(archGeometry(36)),
};

const staticDraws = buildStaticScene();
const viewProj = mat4();
const view = mat4();
const proj = mat4();

gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);
gl.clearColor(0.015, 0.017, 0.018, 1);

function rect(x, z, width, depth) {
  return { x, z, width, depth };
}

function npc(name, path, profile) {
  return {
    name,
    ...profile,
    path,
    leg: 0,
    x: path[0][0],
    z: path[0][1],
    yaw: 0,
    step: Math.random() * 10,
  };
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = Math.floor(window.innerWidth);
  h = Math.floor(window.innerHeight);
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  gl.viewport(0, 0, canvas.width, canvas.height);
}

function collide(x, z, radius = 0.28) {
  if (x < 1 + radius || z < 1 + radius || x > world.width - 1 - radius || z > world.height - 1 - radius) {
    return true;
  }
  return world.walls.some((wall) => (
    x + radius > wall.x &&
    x - radius < wall.x + wall.width &&
    z + radius > wall.z &&
    z - radius < wall.z + wall.depth
  ));
}

function moveEntity(entity, dx, dz, radius) {
  if (!collide(entity.x + dx, entity.z, radius)) entity.x += dx;
  if (!collide(entity.x, entity.z + dz, radius)) entity.z += dz;
}

function update(dt) {
  pulse += dt;
  const forward = Number(keys.has("w") || keys.has("arrowup")) - Number(keys.has("s") || keys.has("arrowdown"));
  const side = Number(keys.has("d") || keys.has("arrowright")) - Number(keys.has("a") || keys.has("arrowleft"));
  const touchForward = -touchMove.dy / 46;
  const touchSide = touchMove.dx / 46;

  let f = clamp(forward + touchForward, -1, 1);
  let s = clamp(side + touchSide, -1, 1);

  if (autoTour) {
    const target = exhibits[Math.floor((pulse / 8) % exhibits.length)];
    const desired = Math.atan2(target.z - player.z, target.x - player.x);
    player.yaw = turnToward(player.yaw, desired, dt * 0.78);
    player.pitch = turnToward(player.pitch, 0, dt * 0.5);
    f = distance(player, target) > 2.7 ? 0.72 : 0.16;
  }

  const walk = 4.25 * dt;
  const cos = Math.cos(player.yaw);
  const sin = Math.sin(player.yaw);
  moveEntity(player, (cos * f - sin * s) * walk, (sin * f + cos * s) * walk, 0.3);
  player.y = 1.68 + Math.sin(pulse * 8) * Math.min(0.018, Math.abs(f) * 0.018 + Math.abs(s) * 0.014);

  for (const person of npcs) {
    const next = person.path[(person.leg + 1) % person.path.length];
    const dx = next[0] - person.x;
    const dz = next[1] - person.z;
    const len = Math.hypot(dx, dz) || 1;
    person.step += dt * 7;
    if (len < 0.25) {
      person.leg = (person.leg + 1) % person.path.length;
    } else {
      person.yaw = turnToward(person.yaw, Math.atan2(dz, dx), dt * 5);
      moveEntity(person, (dx / len) * dt * 1.35, (dz / len) * dt * 1.35, 0.25);
    }
  }

  updateUi();
}

function updateUi() {
  const room = world.rooms.find((item) => (
    player.x >= item.x1 && player.x <= item.x2 && player.z >= item.z1 && player.z <= item.z2
  ));
  roomName.textContent = room ? room.name : "Перехід між залами";
  visitorCount.textContent = `${npcs.length} гостей у палаццо`;

  const nearestArtifact = exhibits
    .map((item) => ({ ...item, dist: distance(player, item) }))
    .sort((a, b) => a.dist - b.dist)[0];
  const nearestNpc = npcs
    .map((item) => ({ ...item, dist: distance(player, item) }))
    .sort((a, b) => a.dist - b.dist)[0];

  if (nearestNpc.dist < 2.4) nearbyName.textContent = `${nearestNpc.name} поруч`;
  else if (nearestArtifact.dist < 3.6) nearbyName.textContent = "Експонат реагує";
  else nearbyName.textContent = "Італійська галерея";

  if (nearestArtifact.dist < 4.2) {
    artifactMark.style.background = nearestArtifact.hue;
    artifactMark.style.boxShadow = `0 0 24px ${nearestArtifact.hue}`;
    artifactType.textContent = nearestArtifact.type;
    artifactTitle.textContent = nearestArtifact.title;
    artifactText.textContent = nearestArtifact.text;
  } else {
    artifactMark.style.background = "#66e0c2";
    artifactMark.style.boxShadow = "0 0 24px #66e0c2";
    artifactType.textContent = "Палаццо-галерея";
    artifactTitle.textContent = "Італійський музейний зал";
    artifactText.textContent = "Травертин, арки, мармурова підлога, фрескові панелі й тепле світло створюють настрій старого музею у Флоренції або Римі.";
  }
}

function render() {
  const aspect = canvas.width / canvas.height;
  perspective(proj, Math.PI / 3, aspect, 0.06, 90);

  const look = [
    player.x + Math.cos(player.yaw) * Math.cos(player.pitch),
    player.y + Math.sin(player.pitch),
    player.z + Math.sin(player.yaw) * Math.cos(player.pitch),
  ];
  lookAt(view, [player.x, player.y, player.z], look, [0, 1, 0]);
  multiply(viewProj, proj, view);

  gl.clearColor(night ? 0.018 : 0.075, night ? 0.014 : 0.052, night ? 0.012 : 0.036, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  gl.uniformMatrix4fv(locations.uViewProj, false, viewProj);
  gl.uniform3fv(locations.uCamera, [player.x, player.y, player.z]);
  gl.uniform1f(locations.uNight, night ? 1 : 0);
  setLightUniforms();

  gl.disable(gl.BLEND);
  gl.depthMask(true);
  for (const item of staticDraws) drawMesh(item.mesh, item.model, item.color, item.emissive || 0, 1);
  for (const exhibit of exhibits) drawExhibit(exhibit);
  for (const person of npcs) drawNpc(person);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  for (const exhibit of exhibits) drawGlass(exhibit);
  gl.disable(gl.BLEND);
}

function setLightUniforms() {
  const lightPositions = [];
  const lightColors = [];
  for (const item of exhibits) {
    lightPositions.push(item.x, 2.4, item.z);
    const power = night ? 1.25 : 0.92;
    lightColors.push(item.color[0] * power, item.color[1] * power, item.color[2] * power);
  }
  gl.uniform3fv(locations.uLightPos, lightPositions);
  gl.uniform3fv(locations.uLightColor, lightColors);
}

function buildStaticScene() {
  const draws = [];
  draws.push(meshDraw(meshes.cube, transform([23, -0.04, 17], [46, 0.08, 34]), [0.58, 0.52, 0.42], 0.015));
  draws.push(meshDraw(meshes.cube, transform([23, 4.72, 17], [46, 0.16, 34]), [0.42, 0.21, 0.12], 0.02));

  for (let x = 2.5; x < world.width; x += 3.5) {
    draws.push(meshDraw(meshes.cube, transform([x, 0.012, 17], [0.024, 0.012, 34]), [0.9, 0.82, 0.66], 0.018));
  }
  for (let z = 2.5; z < world.height; z += 3.5) {
    draws.push(meshDraw(meshes.cube, transform([23, 0.014, z], [46, 0.012, 0.024]), [0.9, 0.82, 0.66], 0.018));
  }
  for (const z of [11.02, 22.02]) {
    draws.push(meshDraw(meshes.cube, transform([23, 0.026, z], [44, 0.016, 0.055]), [0.63, 0.44, 0.16], 0.07));
  }
  for (const x of [14.02, 27.02, 33.02]) {
    draws.push(meshDraw(meshes.cube, transform([x, 0.026, 17], [0.055, 0.016, 31]), [0.63, 0.44, 0.16], 0.07));
  }

  for (const wall of world.walls) {
    draws.push(meshDraw(
      meshes.cube,
      transform([wall.x + wall.width / 2, 2.1, wall.z + wall.depth / 2], [wall.width, 4.2, wall.depth]),
      [0.71, 0.62, 0.48],
    ));
    addWallTrim(draws, wall);
  }

  for (const point of [[14, 11], [27, 11], [10, 22], [33, 22], [14, 22], [32, 11], [1.2, 11], [44.8, 22]]) {
    addColumn(draws, point[0], point[1]);
  }

  for (let x = 4; x < world.width; x += 6) {
    for (const z of [5.3, 16.7, 28.4]) {
      addCeilingLight(draws, x, z);
    }
  }
  addFrescoCeiling(draws);
  addPalazzoArcades(draws);

  for (const exhibit of exhibits) {
    addExhibitZone(draws, exhibit);
  }
  addBust(draws, 16.6, 9.6, 0);
  addBust(draws, 29.4, 9.6, 0);
  addBust(draws, 3.6, 24.8, Math.PI / 2);
  addBust(draws, 42.3, 24.8, -Math.PI / 2);
  addBench(draws, 18, 18.7, 0);
  addBench(draws, 28, 18.7, 0);
  addBench(draws, 7.2, 14.4, Math.PI / 2);
  addBench(draws, 38.5, 14.4, Math.PI / 2);
  addBench(draws, 6.8, 31, 0);
  addBench(draws, 39, 31, 0);
  return draws;
}

function addWallTrim(draws, wall) {
  const cx = wall.x + wall.width / 2;
  const cz = wall.z + wall.depth / 2;
  const brass = [0.66, 0.45, 0.17];
  const dark = [0.28, 0.13, 0.07];
  if (wall.width >= wall.depth) {
    for (const side of [-1, 1]) {
      const z = cz + side * (wall.depth / 2 + 0.018);
      draws.push(meshDraw(meshes.cube, transform([cx, 0.52, z], [wall.width, 0.12, 0.036]), dark, 0.01));
      draws.push(meshDraw(meshes.cube, transform([cx, 3.68, z], [wall.width, 0.045, 0.035]), brass, 0.03));
      draws.push(meshDraw(meshes.cube, transform([cx, 2.34, z], [wall.width, 0.025, 0.028]), [0.86, 0.73, 0.53], 0.018));
    }
  } else {
    for (const side of [-1, 1]) {
      const x = cx + side * (wall.width / 2 + 0.018);
      draws.push(meshDraw(meshes.cube, transform([x, 0.52, cz], [0.036, 0.12, wall.depth]), dark, 0.01));
      draws.push(meshDraw(meshes.cube, transform([x, 3.68, cz], [0.035, 0.045, wall.depth]), brass, 0.03));
      draws.push(meshDraw(meshes.cube, transform([x, 2.34, cz], [0.028, 0.025, wall.depth]), [0.86, 0.73, 0.53], 0.018));
    }
  }
}

function addColumn(draws, x, z) {
  draws.push(meshDraw(meshes.cylinder, transform([x, 2.08, z], [0.31, 4.15, 0.31]), [0.86, 0.78, 0.62], 0.01));
  draws.push(meshDraw(meshes.cylinder, transform([x, 0.16, z], [0.5, 0.22, 0.5]), [0.62, 0.43, 0.17], 0.035));
  draws.push(meshDraw(meshes.cylinder, transform([x, 4.1, z], [0.49, 0.22, 0.49]), [0.62, 0.43, 0.17], 0.035));
}

function addCeilingLight(draws, x, z) {
  draws.push(meshDraw(meshes.cube, transform([x, 4.55, z], [1.35, 0.08, 0.18]), [0.2, 0.11, 0.06], 0.08));
  draws.push(meshDraw(meshes.cube, transform([x, 4.47, z], [1.05, 0.035, 0.12]), [1.0, 0.78, 0.42], 0.82));
}

function addFrescoCeiling(draws) {
  const panels = [
    [9, 7, 5.2, 3.2, [0.36, 0.56, 0.66]],
    [23, 7, 7.5, 3.2, [0.54, 0.28, 0.18]],
    [37, 7, 5.2, 3.2, [0.36, 0.56, 0.66]],
    [10, 27.5, 5.5, 3.0, [0.49, 0.32, 0.52]],
    [36.5, 27.5, 5.5, 3.0, [0.42, 0.5, 0.34]],
    [23, 17, 8.2, 4.4, [0.24, 0.48, 0.42]],
  ];
  for (const [x, z, sx, sz, color] of panels) {
    draws.push(meshDraw(meshes.cube, transform([x, 4.61, z], [sx, 0.035, sz]), color, 0.08));
    draws.push(meshDraw(meshes.cube, transform([x, 4.585, z], [sx + 0.34, 0.03, 0.075]), [0.72, 0.49, 0.17], 0.06));
    draws.push(meshDraw(meshes.cube, transform([x, 4.585, z], [0.075, 0.03, sz + 0.34]), [0.72, 0.49, 0.17], 0.06));
  }
}

function addPalazzoArcades(draws) {
  for (const item of [
    [8.1, 10.42, 0],
    [22.9, 10.42, 0],
    [37.8, 10.42, 0],
    [8.1, 22.58, Math.PI],
    [22.9, 22.58, Math.PI],
    [37.8, 22.58, Math.PI],
    [14.58, 6.3, Math.PI / 2],
    [27.42, 6.3, -Math.PI / 2],
    [10.58, 27.5, Math.PI / 2],
    [33.42, 27.5, -Math.PI / 2],
  ]) {
    addPalazzoArch(draws, item[0], item[1], item[2], 1.0);
  }
}

function addPalazzoArch(draws, x, z, rotationY, size = 1) {
  const travertine = [0.84, 0.76, 0.61];
  const gold = [0.64, 0.44, 0.16];
  const shadow = [0.25, 0.13, 0.08];
  for (const side of [-1, 1]) {
    draws.push(meshDraw(meshes.cylinder, orientedTransform(x, z, rotationY, side * 1.02 * size, 1.45, 0, [0.16 * size, 2.25, 0.16 * size]), travertine, 0.012));
    draws.push(meshDraw(meshes.cylinder, orientedTransform(x, z, rotationY, side * 1.02 * size, 0.22, 0, [0.28 * size, 0.23, 0.28 * size]), gold, 0.035));
    draws.push(meshDraw(meshes.cylinder, orientedTransform(x, z, rotationY, side * 1.02 * size, 2.64, 0, [0.28 * size, 0.2, 0.28 * size]), gold, 0.035));
  }
  draws.push(meshDraw(meshes.arch, orientedTransform(x, z, rotationY, 0, 2.62, 0, [2.35 * size, 1.42 * size, 0.18]), travertine, 0.018));
  draws.push(meshDraw(meshes.arch, orientedTransform(x, z, rotationY, 0, 2.6, -0.025, [2.58 * size, 1.6 * size, 0.06]), gold, 0.05));
  draws.push(meshDraw(meshes.cube, orientedTransform(x, z, rotationY, 0, 1.05, -0.045, [1.45 * size, 1.2, 0.06]), shadow, 0.015));
}

function orientedTransform(x, z, rotationY, localX, y, localZ, scale) {
  const worldX = x + Math.cos(rotationY) * localX - Math.sin(rotationY) * localZ;
  const worldZ = z + Math.sin(rotationY) * localX + Math.cos(rotationY) * localZ;
  return transform([worldX, y, worldZ], scale, rotationY);
}

function addExhibitZone(draws, exhibit) {
  const glassTint = exhibit.color.map((v) => Math.max(0.05, v * 0.28));
  draws.push(meshDraw(meshes.cylinder, transform([exhibit.x, 0.018, exhibit.z], [1.78, 0.035, 1.78]), glassTint, 0.08));
  draws.push(meshDraw(meshes.cube, transform([exhibit.x, 0.44, exhibit.z], [1.22, 0.88, 1.22]), [0.42, 0.24, 0.14], 0.02));
  draws.push(meshDraw(meshes.cube, transform([exhibit.x, 1.0, exhibit.z], [1.42, 0.15, 1.42]), [0.86, 0.78, 0.62], 0.04));
  draws.push(meshDraw(meshes.cube, transform([exhibit.x, 0.89, exhibit.z + 0.62], [1.12, 0.06, 0.045]), [0.65, 0.45, 0.17], 0.05));

  const z = exhibit.z - 1.08;
  addPalazzoArch(draws, exhibit.x, z, 0, 0.82);
  draws.push(meshDraw(meshes.cube, transform([exhibit.x, 2.08, z - 0.06], [1.5, 0.92, 0.055]), [0.18, 0.31, 0.28], 0.045));
  draws.push(meshDraw(meshes.cube, transform([exhibit.x, 1.28, z - 0.085], [0.74, 0.08, 0.055]), [0.88, 0.8, 0.64], 0.025));
}

function addBust(draws, x, z, rotationY) {
  const marble = [0.86, 0.82, 0.73];
  const base = [0.38, 0.23, 0.13];
  draws.push(meshDraw(meshes.cube, transform([x, 0.34, z], [0.72, 0.68, 0.72], rotationY), base, 0.015));
  draws.push(meshDraw(meshes.cube, transform([x, 0.78, z], [0.86, 0.12, 0.86], rotationY), [0.78, 0.7, 0.55], 0.03));
  draws.push(meshDraw(meshes.cylinder, transform([x, 1.06, z], [0.18, 0.36, 0.18], rotationY), marble, 0.02));
  draws.push(meshDraw(meshes.sphere, transform([x, 1.36, z], [0.28, 0.34, 0.25], rotationY), marble, 0.025));
  draws.push(meshDraw(meshes.sphere, transform([x, 1.13, z - 0.03], [0.42, 0.2, 0.24], rotationY), marble, 0.018));
}

function addBench(draws, x, z, rotationY) {
  const wood = [0.38, 0.22, 0.13];
  const brass = [0.5, 0.36, 0.15];
  draws.push(meshDraw(meshes.cube, transform([x, 0.52, z], [2.2, 0.16, 0.55], rotationY), wood));
  draws.push(meshDraw(meshes.cube, transform([x, 0.78, z - 0.22], [2.2, 0.42, 0.12], rotationY), wood));
  for (const sx of [-0.82, 0.82]) {
    for (const sz of [-0.18, 0.18]) {
      draws.push(meshDraw(meshes.cylinder, transformBenchLeg(x, z, rotationY, sx, sz), brass, 0.02));
    }
  }
}

function transformBenchLeg(x, z, rotationY, sx, sz) {
  const rx = Math.cos(rotationY) * sx - Math.sin(rotationY) * sz;
  const rz = Math.sin(rotationY) * sx + Math.cos(rotationY) * sz;
  return transform([x + rx, 0.28, z + rz], [0.08, 0.55, 0.08]);
}

function drawExhibit(exhibit) {
  const bob = Math.sin(pulse * 2.2 + exhibit.x) * 0.035;
  drawMesh(
    meshes.cylinder,
    transform([exhibit.x, 1.72 + bob, exhibit.z], [0.42, 1.18, 0.42], pulse * 0.18),
    exhibit.color,
    night ? 1.15 : 0.78,
    1,
  );
  drawMesh(
    meshes.sphere,
    transform([exhibit.x, 2.46 + bob, exhibit.z], [0.42, 0.42, 0.42]),
    exhibit.color.map((v) => Math.min(1, v + 0.12)),
    night ? 1.4 : 0.92,
    1,
  );
}

function drawGlass(exhibit) {
  gl.depthMask(false);
  drawMesh(
    meshes.cube,
    transform([exhibit.x, 1.92, exhibit.z], [1.02, 1.74, 1.02], pulse * 0.08),
    exhibit.color.map((v) => Math.min(1, v + 0.18)),
    0.55,
    0.32,
  );
  gl.depthMask(true);
}

function drawNpc(person) {
  const sway = Math.sin(person.step) * 0.06;
  const stride = Math.sin(person.step) * 0.12;
  const armSwing = Math.sin(person.step + Math.PI) * 0.13;
  const height = person.height;
  const build = person.build;
  const base = modelBase(person.x, 0, person.z, person.yaw);
  const shoe = [0.025, 0.023, 0.022];
  const hand = person.skin.map((v) => Math.min(1, v * 1.04));

  drawMesh(meshes.cylinder, compose(base, [0, 0.025, 0], [0.55 * build, 0.05, 0.34 * build]), [0.01, 0.012, 0.013], 0, 1);

  drawCapsule(base, [-0.14 * build, 0.46 * height, stride], [0.09 * build, 0.76 * height, 0.09 * build], person.pants, 0.01, 0, stride * 0.35);
  drawCapsule(base, [0.14 * build, 0.46 * height, -stride], [0.09 * build, 0.76 * height, 0.09 * build], person.pants, 0.01, 0, -stride * 0.35);
  drawMesh(meshes.sphere, composeFull(base, [-0.14 * build, 0.065, stride + 0.1], [0.17 * build, 0.07, 0.28 * build]), shoe, 0, 1);
  drawMesh(meshes.sphere, composeFull(base, [0.14 * build, 0.065, -stride + 0.1], [0.17 * build, 0.07, 0.28 * build]), shoe, 0, 1);

  drawMesh(meshes.sphere, composeFull(base, [0, 0.83 * height, sway * 0.15], [0.42 * build, 0.22 * height, 0.26 * build]), person.pants, 0.01, 1);
  drawCapsule(base, [0, 1.08 * height, sway * 0.18], [0.37 * build, 0.72 * height, 0.24 * build], person.shirt, 0.025, 0, 0);
  drawMesh(meshes.sphere, composeFull(base, [-0.32 * build, 1.31 * height, 0], [0.11 * build, 0.12 * height, 0.11 * build]), person.shirt, 0.02, 1);
  drawMesh(meshes.sphere, composeFull(base, [0.32 * build, 1.31 * height, 0], [0.11 * build, 0.12 * height, 0.11 * build]), person.shirt, 0.02, 1);
  drawCapsule(base, [0, 1.43 * height, 0], [0.13 * build, 0.19 * height, 0.12 * build], person.skin, 0.02, 0, 0);

  drawCapsule(base, [-0.43 * build, 1.02 * height, armSwing], [0.07 * build, 0.56 * height, 0.07 * build], person.shirt, 0.01, armSwing * 0.35, -0.16);
  drawCapsule(base, [0.43 * build, 1.02 * height, -armSwing], [0.07 * build, 0.56 * height, 0.07 * build], person.shirt, 0.01, -armSwing * 0.35, 0.16);
  drawMesh(meshes.sphere, composeFull(base, [-0.46 * build, 0.7 * height, armSwing + 0.02], [0.075 * build, 0.075 * build, 0.075 * build]), hand, 0.02, 1);
  drawMesh(meshes.sphere, composeFull(base, [0.46 * build, 0.7 * height, -armSwing + 0.02], [0.075 * build, 0.075 * build, 0.075 * build]), hand, 0.02, 1);

  drawMesh(meshes.sphere, composeFull(base, [0, 1.69 * height, 0.015], [0.23 * build, 0.28 * height, 0.21 * build]), person.skin, 0.03, 1);
  drawHair(person, base, height, build);
  drawMesh(meshes.sphere, composeFull(base, [-0.07 * build, 1.69 * height, 0.19 * build], [0.026 * build, 0.017 * height, 0.012]), [0.025, 0.02, 0.018], 0.02, 1);
  drawMesh(meshes.sphere, composeFull(base, [0.07 * build, 1.69 * height, 0.19 * build], [0.026 * build, 0.017 * height, 0.012]), [0.025, 0.02, 0.018], 0.02, 1);
  drawMesh(meshes.sphere, composeFull(base, [0, 1.6 * height, 0.2 * build], [0.075 * build, 0.018 * height, 0.012]), [0.42, 0.15, 0.13], 0.02, 1);
}

function drawHair(person, base, height, build) {
  drawMesh(meshes.sphere, composeFull(base, [0, 1.82 * height, -0.02], [0.25 * build, 0.13 * height, 0.22 * build]), person.hair, 0.01, 1);
  if (person.hairStyle === "long") {
    drawMesh(meshes.sphere, composeFull(base, [0, 1.58 * height, -0.16 * build], [0.31 * build, 0.42 * height, 0.13 * build]), person.hair, 0.01, 1);
    drawMesh(meshes.sphere, composeFull(base, [-0.17 * build, 1.55 * height, -0.06 * build], [0.12 * build, 0.32 * height, 0.08 * build]), person.hair, 0.01, 1);
    drawMesh(meshes.sphere, composeFull(base, [0.17 * build, 1.55 * height, -0.06 * build], [0.12 * build, 0.32 * height, 0.08 * build]), person.hair, 0.01, 1);
  }
  if (person.hairStyle === "bob") {
    drawMesh(meshes.sphere, composeFull(base, [0, 1.64 * height, -0.08 * build], [0.29 * build, 0.25 * height, 0.16 * build]), person.hair, 0.01, 1);
    drawMesh(meshes.sphere, composeFull(base, [-0.19 * build, 1.62 * height, 0.03 * build], [0.09 * build, 0.22 * height, 0.08 * build]), person.hair, 0.01, 1);
    drawMesh(meshes.sphere, composeFull(base, [0.19 * build, 1.62 * height, 0.03 * build], [0.09 * build, 0.22 * height, 0.08 * build]), person.hair, 0.01, 1);
  }
  if (person.hairStyle === "crop") {
    drawMesh(meshes.sphere, composeFull(base, [0, 1.86 * height, 0], [0.22 * build, 0.08 * height, 0.2 * build]), person.hair, 0.01, 1);
  }
}

function drawCapsule(base, position, scale, color, emissive = 0, rotationX = 0, rotationZ = 0) {
  drawMesh(meshes.cylinder, composeFull(base, position, scale, 0, rotationX, rotationZ), color, emissive, 1);
  drawMesh(meshes.sphere, composeFull(base, [position[0], position[1] + scale[1] * 0.5, position[2]], [scale[0], scale[0], scale[2]], 0, rotationX, rotationZ), color, emissive, 1);
  drawMesh(meshes.sphere, composeFull(base, [position[0], position[1] - scale[1] * 0.5, position[2]], [scale[0], scale[0], scale[2]], 0, rotationX, rotationZ), color, emissive, 1);
}

function meshDraw(mesh, model, color, emissive = 0) {
  return { mesh, model, color, emissive };
}

function drawMesh(mesh, model, color, emissive = 0, alpha = 1) {
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.position);
  gl.enableVertexAttribArray(locations.aPosition);
  gl.vertexAttribPointer(locations.aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normal);
  gl.enableVertexAttribArray(locations.aNormal);
  gl.vertexAttribPointer(locations.aNormal, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.index);

  gl.uniformMatrix4fv(locations.uModel, false, model);
  gl.uniformMatrix4fv(locations.uNormal, false, normalMatrix(model));
  gl.uniform3fv(locations.uColor, color);
  gl.uniform1f(locations.uEmissive, emissive);
  gl.uniform1f(locations.uAlpha, alpha);
  gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
}

function makeMesh(geometry) {
  const position = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, position);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions), gl.STATIC_DRAW);

  const normal = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normal);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.normals), gl.STATIC_DRAW);

  const index = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);
  return { position, normal, index, count: geometry.indices.length };
}

function cubeGeometry() {
  const positions = [];
  const normals = [];
  const indices = [];
  const faces = [
    [[1, 0, 0], [[0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [0.5, -0.5, 0.5]]],
    [[-1, 0, 0], [[-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [-0.5, -0.5, -0.5]]],
    [[0, 1, 0], [[-0.5, 0.5, -0.5], [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5]]],
    [[0, -1, 0], [[-0.5, -0.5, 0.5], [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5]]],
    [[0, 0, 1], [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]]],
    [[0, 0, -1], [[0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5]]],
  ];
  for (const [normal, verts] of faces) {
    const start = positions.length / 3;
    for (const vert of verts) {
      positions.push(...vert);
      normals.push(...normal);
    }
    indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
  }
  return { positions, normals, indices };
}

function cylinderGeometry(segments) {
  const positions = [];
  const normals = [];
  const indices = [];
  for (let i = 0; i <= segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const x = Math.cos(a) * 0.5;
    const z = Math.sin(a) * 0.5;
    positions.push(x, -0.5, z, x, 0.5, z);
    normals.push(x * 2, 0, z * 2, x * 2, 0, z * 2);
  }
  for (let i = 0; i < segments; i += 1) {
    const p = i * 2;
    indices.push(p, p + 1, p + 3, p, p + 3, p + 2);
  }
  const topCenter = positions.length / 3;
  positions.push(0, 0.5, 0);
  normals.push(0, 1, 0);
  const bottomCenter = positions.length / 3;
  positions.push(0, -0.5, 0);
  normals.push(0, -1, 0);
  for (let i = 0; i < segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const b = ((i + 1) / segments) * Math.PI * 2;
    const topA = positions.length / 3;
    positions.push(Math.cos(a) * 0.5, 0.5, Math.sin(a) * 0.5, Math.cos(b) * 0.5, 0.5, Math.sin(b) * 0.5);
    normals.push(0, 1, 0, 0, 1, 0);
    indices.push(topCenter, topA, topA + 1);
    const bottomA = positions.length / 3;
    positions.push(Math.cos(b) * 0.5, -0.5, Math.sin(b) * 0.5, Math.cos(a) * 0.5, -0.5, Math.sin(a) * 0.5);
    normals.push(0, -1, 0, 0, -1, 0);
    indices.push(bottomCenter, bottomA, bottomA + 1);
  }
  return { positions, normals, indices };
}

function sphereGeometry(cols, rows) {
  const positions = [];
  const normals = [];
  const indices = [];
  for (let y = 0; y <= rows; y += 1) {
    const v = y / rows;
    const theta = v * Math.PI;
    for (let x = 0; x <= cols; x += 1) {
      const u = x / cols;
      const phi = u * Math.PI * 2;
      const nx = Math.cos(phi) * Math.sin(theta);
      const ny = Math.cos(theta);
      const nz = Math.sin(phi) * Math.sin(theta);
      positions.push(nx * 0.5, ny * 0.5, nz * 0.5);
      normals.push(nx, ny, nz);
    }
  }
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const a = y * (cols + 1) + x;
      const b = a + cols + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return { positions, normals, indices };
}

function archGeometry(segments) {
  const positions = [];
  const normals = [];
  const indices = [];
  const outer = 0.5;
  const inner = 0.34;
  const front = 0.5;
  const back = -0.5;

  function pushVertex(x, y, z, nx, ny, nz) {
    positions.push(x, y, z);
    normals.push(nx, ny, nz);
    return positions.length / 3 - 1;
  }

  function quad(a, b, c, d) {
    indices.push(a, b, c, a, c, d);
  }

  for (let i = 0; i < segments; i += 1) {
    const a0 = (i / segments) * Math.PI;
    const a1 = ((i + 1) / segments) * Math.PI;
    const co0 = Math.cos(a0);
    const si0 = Math.sin(a0);
    const co1 = Math.cos(a1);
    const si1 = Math.sin(a1);

    const of0 = pushVertex(co0 * outer, si0 * outer, front, 0, 0, 1);
    const of1 = pushVertex(co1 * outer, si1 * outer, front, 0, 0, 1);
    const if1 = pushVertex(co1 * inner, si1 * inner, front, 0, 0, 1);
    const if0 = pushVertex(co0 * inner, si0 * inner, front, 0, 0, 1);
    quad(of0, of1, if1, if0);

    const ob0 = pushVertex(co0 * outer, si0 * outer, back, 0, 0, -1);
    const ib0 = pushVertex(co0 * inner, si0 * inner, back, 0, 0, -1);
    const ib1 = pushVertex(co1 * inner, si1 * inner, back, 0, 0, -1);
    const ob1 = pushVertex(co1 * outer, si1 * outer, back, 0, 0, -1);
    quad(ob0, ib0, ib1, ob1);

    const oo0 = pushVertex(co0 * outer, si0 * outer, front, co0, si0, 0);
    const oo1 = pushVertex(co1 * outer, si1 * outer, front, co1, si1, 0);
    const oo2 = pushVertex(co1 * outer, si1 * outer, back, co1, si1, 0);
    const oo3 = pushVertex(co0 * outer, si0 * outer, back, co0, si0, 0);
    quad(oo0, oo1, oo2, oo3);

    const ii0 = pushVertex(co0 * inner, si0 * inner, front, -co0, -si0, 0);
    const ii1 = pushVertex(co0 * inner, si0 * inner, back, -co0, -si0, 0);
    const ii2 = pushVertex(co1 * inner, si1 * inner, back, -co1, -si1, 0);
    const ii3 = pushVertex(co1 * inner, si1 * inner, front, -co1, -si1, 0);
    quad(ii0, ii1, ii2, ii3);
  }

  for (const angle of [0, Math.PI]) {
    const co = Math.cos(angle);
    const si = Math.sin(angle);
    const normalX = angle === 0 ? 1 : -1;
    const a = pushVertex(co * outer, si * outer, front, normalX, 0, 0);
    const b = pushVertex(co * outer, si * outer, back, normalX, 0, 0);
    const c = pushVertex(co * inner, si * inner, back, normalX, 0, 0);
    const d = pushVertex(co * inner, si * inner, front, normalX, 0, 0);
    quad(a, b, c, d);
  }
  return { positions, normals, indices };
}

function vertexSource() {
  return `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    uniform mat4 uModel;
    uniform mat4 uViewProj;
    uniform mat4 uNormal;
    varying vec3 vWorld;
    varying vec3 vNormal;
    void main() {
      vec4 world = uModel * vec4(aPosition, 1.0);
      vWorld = world.xyz;
      vNormal = normalize((uNormal * vec4(aNormal, 0.0)).xyz);
      gl_Position = uViewProj * world;
    }
  `;
}

function fragmentSource() {
  return `
    precision mediump float;
    uniform vec3 uColor;
    uniform float uAlpha;
    uniform float uEmissive;
    uniform float uNight;
    uniform vec3 uCamera;
    uniform vec3 uLightPos[5];
    uniform vec3 uLightColor[5];
    varying vec3 vWorld;
    varying vec3 vNormal;
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(uCamera - vWorld);
      vec3 base = uColor;
      vec3 light = vec3(0.12, 0.105, 0.085) + vec3(0.28, 0.19, 0.11) * (1.0 - uNight);
      vec3 sun = normalize(vec3(-0.42, 0.82, 0.22));
      light += vec3(0.42, 0.31, 0.18) * max(dot(normal, sun), 0.0) * (1.0 - uNight * 0.55);
      for (int i = 0; i < 5; i++) {
        vec3 toLight = uLightPos[i] - vWorld;
        float dist = length(toLight);
        vec3 dir = normalize(toLight);
        float diffuse = max(dot(normal, dir), 0.0);
        float spec = pow(max(dot(reflect(-dir, normal), viewDir), 0.0), 24.0);
        float atten = 1.0 / (1.0 + dist * dist * 0.18);
        light += uLightColor[i] * atten * (diffuse * 1.25 + spec * 0.55);
      }
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.0);
      float grain = sin(vWorld.x * 9.7 + vWorld.y * 4.1) * sin(vWorld.z * 11.3) * 0.018;
      vec3 color = base * light + base * uEmissive;
      color += vec3(grain) + fresnel * vec3(0.06, 0.045, 0.028);
      float fog = clamp(length(uCamera - vWorld) / 34.0, 0.0, 1.0);
      vec3 fogColor = mix(vec3(0.16, 0.105, 0.064), vec3(0.025, 0.017, 0.014), uNight);
      color = mix(color, fogColor, fog * fog * 0.66);
      gl_FragColor = vec4(color, uAlpha);
    }
  `;
}

function createProgram(vsSource, fsSource) {
  const vs = compileShader(gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vs);
  gl.attachShader(shaderProgram, fs);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(shaderProgram));
  }
  return shaderProgram;
}

function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function transform(position, scale, rotationY = 0) {
  const out = mat4();
  identity(out);
  translate(out, out, position);
  rotateY(out, out, rotationY);
  scaleMat(out, out, scale);
  return out;
}

function modelBase(x, y, z, yaw) {
  const out = mat4();
  identity(out);
  translate(out, out, [x, y, z]);
  rotateY(out, out, -yaw + Math.PI / 2);
  return out;
}

function compose(base, position, scale, rotationY = 0) {
  const out = mat4();
  copy(out, base);
  translate(out, out, position);
  rotateY(out, out, rotationY);
  scaleMat(out, out, scale);
  return out;
}

function composeFull(base, position, scale, rotationY = 0, rotationX = 0, rotationZ = 0) {
  const out = mat4();
  copy(out, base);
  translate(out, out, position);
  if (rotationY) rotateY(out, out, rotationY);
  if (rotationX) rotateX(out, out, rotationX);
  if (rotationZ) rotateZ(out, out, rotationZ);
  scaleMat(out, out, scale);
  return out;
}

function mat4() {
  return new Float32Array(16);
}

function identity(out) {
  out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0;
  out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0;
  out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0;
  out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
  return out;
}

function copy(out, a) {
  out.set(a);
  return out;
}

function multiply(out, a, b) {
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}

function translate(out, a, v) {
  const x = v[0], y = v[1], z = v[2];
  if (a !== out) copy(out, a);
  out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
  out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
  out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
  out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  return out;
}

function rotateY(out, a, rad) {
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  if (a !== out) {
    out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7];
    out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
  }
  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}

function rotateX(out, a, rad) {
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  if (a !== out) {
    out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3];
    out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
  }
  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}

function rotateZ(out, a, rad) {
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  if (a !== out) {
    out[8] = a[8]; out[9] = a[9]; out[10] = a[10]; out[11] = a[11];
    out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
  }
  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}

function scaleMat(out, a, v) {
  const x = v[0], y = v[1], z = v[2];
  out[0] = a[0] * x; out[1] = a[1] * x; out[2] = a[2] * x; out[3] = a[3] * x;
  out[4] = a[4] * y; out[5] = a[5] * y; out[6] = a[6] * y; out[7] = a[7] * y;
  out[8] = a[8] * z; out[9] = a[9] * z; out[10] = a[10] * z; out[11] = a[11] * z;
  out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
  return out;
}

function perspective(out, fovy, aspect, near, far) {
  const f = 1.0 / Math.tan(fovy / 2);
  out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
  out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
  out[8] = 0; out[9] = 0; out[11] = -1;
  out[12] = 0; out[13] = 0; out[15] = 0;
  out[10] = (far + near) / (near - far);
  out[14] = (2 * far * near) / (near - far);
  return out;
}

function lookAt(out, eye, center, up) {
  let x0, x1, x2, y0, y1, y2, z0, z1, z2;
  z0 = eye[0] - center[0];
  z1 = eye[1] - center[1];
  z2 = eye[2] - center[2];
  let len = 1 / Math.hypot(z0, z1, z2);
  z0 *= len; z1 *= len; z2 *= len;
  x0 = up[1] * z2 - up[2] * z1;
  x1 = up[2] * z0 - up[0] * z2;
  x2 = up[0] * z1 - up[1] * z0;
  len = Math.hypot(x0, x1, x2);
  if (!len) x0 = x1 = x2 = 0;
  else {
    len = 1 / len;
    x0 *= len; x1 *= len; x2 *= len;
  }
  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0;
  out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0;
  out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0;
  out[12] = -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]);
  out[13] = -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]);
  out[14] = -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]);
  out[15] = 1;
  return out;
}

function normalMatrix(model) {
  const out = mat4();
  copy(out, model);
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  return out;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function turnToward(current, target, amount) {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + clamp(delta, -amount, amount);
}

function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", (event) => keys.add(event.key.toLowerCase()));
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId);
  pointer.active = true;
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});

canvas.addEventListener("pointermove", (event) => {
  if (!pointer.active) return;
  const dx = event.clientX - pointer.x;
  const dy = event.clientY - pointer.y;
  player.yaw += dx * 0.004;
  player.pitch = clamp(player.pitch - dy * 0.0032, -0.58, 0.48);
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});

canvas.addEventListener("pointerup", () => {
  pointer.active = false;
});

canvas.addEventListener("touchstart", (event) => {
  const touch = [...event.changedTouches].find((item) => item.clientX < window.innerWidth * 0.5);
  if (!touch || touchMove.active) return;
  touchMove.active = true;
  touchMove.id = touch.identifier;
  touchMove.originX = touch.clientX;
  touchMove.originY = touch.clientY;
}, { passive: true });

canvas.addEventListener("touchmove", (event) => {
  const touch = [...event.changedTouches].find((item) => item.identifier === touchMove.id);
  if (!touch) return;
  touchMove.dx = clamp(touch.clientX - touchMove.originX, -46, 46);
  touchMove.dy = clamp(touch.clientY - touchMove.originY, -46, 46);
}, { passive: true });

canvas.addEventListener("touchend", (event) => {
  const touch = [...event.changedTouches].find((item) => item.identifier === touchMove.id);
  if (!touch) return;
  touchMove.active = false;
  touchMove.id = null;
  touchMove.dx = 0;
  touchMove.dy = 0;
}, { passive: true });

autoTourButton.addEventListener("click", () => {
  autoTour = !autoTour;
  autoTourButton.classList.toggle("active", autoTour);
});

lightsButton.addEventListener("click", () => {
  night = !night;
  lightsButton.classList.toggle("active", night);
});

resize();
requestAnimationFrame(loop);

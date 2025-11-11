// ===== EXABYTE SPATIAL AI - GALAXY HERO ANIMATION =====
// Spiral galaxy with scroll-based zoom interaction and drag-to-rotate

(function() {
  // Check if THREE.js is loaded
  if (typeof THREE === 'undefined') {
    console.error('THREE.js is required for galaxy hero');
    return;
  }

  const canvas = document.querySelector('.hero-canvas');
  if (!canvas) {
    console.error('Canvas element with class "hero-canvas" not found');
    return;
  }

  // ===== SIMPLE ORBIT CONTROLS (for drag rotation) =====
  function SimpleOrbitControls(camera, dom, opts) {
    opts = opts || {};
    this.camera = camera;
    this.dom = dom;
    this.target = (opts.target || new THREE.Vector3()).clone();
    this.enableDamping = opts.enableDamping !== false;
    this.dampingFactor = opts.dampingFactor || 0.08;

    const off = new THREE.Vector3().subVectors(camera.position, this.target);
    this._spherical = new THREE.Spherical().setFromVector3(off);
    this._sphericalDelta = new THREE.Spherical(0, 0, 0);
    this._scale = 1.0;
    this._panOffset = new THREE.Vector3();
    this._isPanning = false;
    this._isRotating = false;

    this.rotateSpeed = 0.008;
    this.zoomSpeed = 1.0;
    this.panSpeed = 1.0;
    this.minDistance = 0.1;
    this.maxDistance = 1e6;
    this.minPolarAngle = 0.01;
    this.maxPolarAngle = Math.PI - 0.01;

    this._v2a = new THREE.Vector2();
    this._v2b = new THREE.Vector2();

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    dom.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('pointermove', this._onPointerMove);
  }

  SimpleOrbitControls.prototype.dispose = function() {
    this.dom.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('pointermove', this._onPointerMove);
  };

  SimpleOrbitControls.prototype._onPointerDown = function(e) {
    this.dom.setPointerCapture && this.dom.setPointerCapture(e.pointerId);
    this._v2a.set(e.clientX, e.clientY);
    const isLeft = e.button === 0;
    const isRight = e.button === 2;
    const isPanCombo = isLeft && (e.ctrlKey || e.metaKey || e.shiftKey);
    this._isRotating = isLeft && !isPanCombo;
    this._isPanning = isRight || isPanCombo;
  };

  SimpleOrbitControls.prototype._onPointerMove = function(e) {
    if (!this._isRotating && !this._isPanning) return;
    this._v2b.set(e.clientX, e.clientY);
    const dx = this._v2b.x - this._v2a.x;
    const dy = this._v2b.y - this._v2a.y;
    this._v2a.copy(this._v2b);
    if (this._isRotating) {
      this._sphericalDelta.theta -= dx * this.rotateSpeed;
      this._sphericalDelta.phi -= dy * this.rotateSpeed;
    } else if (this._isPanning) {
      this._pan(dx, dy);
    }
  };

  SimpleOrbitControls.prototype._onPointerUp = function() {
    this._isRotating = false;
    this._isPanning = false;
  };

  SimpleOrbitControls.prototype._pan = function(deltaX, deltaY) {
    const element = this.dom;
    const camera = this.camera;
    const offset = new THREE.Vector3().subVectors(camera.position, this.target);
    const targetDistance = offset.length() * Math.tan((camera.fov * Math.PI / 180) / 2);
    const panX = (2 * deltaX * targetDistance / element.clientHeight) * this.panSpeed;
    const panY = (2 * deltaY * targetDistance / element.clientHeight) * this.panSpeed;
    const x = new THREE.Vector3();
    const y = new THREE.Vector3();
    x.setFromMatrixColumn(camera.matrix, 0).multiplyScalar(-panX);
    y.setFromMatrixColumn(camera.matrix, 1).multiplyScalar(panY);
    this._panOffset.add(x).add(y);
  };

  SimpleOrbitControls.prototype.update = function() {
    this._spherical.theta += this.enableDamping ? this._sphericalDelta.theta * this.dampingFactor : this._sphericalDelta.theta;
    this._spherical.phi += this.enableDamping ? this._sphericalDelta.phi * this.dampingFactor : this._sphericalDelta.phi;
    this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi));
    this._spherical.makeSafe();
    this._spherical.radius *= this._scale;
    this._spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this._spherical.radius));
    if (this.enableDamping) {
      this.target.addScaledVector(this._panOffset, this.dampingFactor);
      this._panOffset.multiplyScalar(1 - this.dampingFactor);
      this._sphericalDelta.theta *= 1 - this.dampingFactor;
      this._sphericalDelta.phi *= 1 - this.dampingFactor;
    } else {
      this.target.add(this._panOffset);
      this._panOffset.set(0, 0, 0);
      this._sphericalDelta.set(0, 0, 0);
    }
    this._scale = 1.0;
    const pos = new THREE.Vector3().setFromSpherical(this._spherical).add(this.target);
    this.camera.position.copy(pos);
    this.camera.lookAt(this.target);
  };

  SimpleOrbitControls.prototype.setCameraDistance = function(distance) {
    this._spherical.radius = distance;
  };

  // ===== CONFIGURATION =====
  const params = {
    count: 1000000,
    size: 0.005,
    radius: 10,
    branches: 2,
    spin: 2.0,
    randomness: 1.5,
    randomnessPower: 4.0,
    insideColor: '#FFB300',  // Gold
    outsideColor: '#4D0099',  // Purple
  };

  // Zoom configuration
  const minZoom = 0.7;   // Fully zoomed out (far away) - Increased for larger startup size
  const maxZoom = 3.0;   // Fully zoomed in (close up)
  let zoom = 0.7;        // Start zoomed out

  const scrollZoomRange = 1000; // Wheel delta needed for full zoom range
  let scrollProgress = 0; // 0 = min zoom (far), 1 = max zoom (close)
  let accumulatedScroll = 0; // Signed accumulated scroll

  // ===== SETUP RENDERER =====
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
  scene.add(camera);

  // Initialize orbit controls for drag rotation
  const controls = new SimpleOrbitControls(camera, canvas, {
    enableDamping: true,
    dampingFactor: 0.08
  });
  controls.target.set(0, 0, 0);

  let geometry, material, points;

  // ===== GENERATE GALAXY =====
  function generateGalaxy() {
    if (points) {
      geometry.dispose();
      material.dispose();
      scene.remove(points);
    }

    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(params.count * 3);
    const colors = new Float32Array(params.count * 3);
    const colorInside = new THREE.Color(params.insideColor);
    const colorOutside = new THREE.Color(params.outsideColor);

    for (let i = 0; i < params.count; i++) {
      const i3 = i * 3;
      const r = Math.random() * params.radius;
      const spinAngle = r * params.spin;
      const branchAngle = (i % params.branches) / params.branches * Math.PI * 2;

      const rand = () => Math.pow(Math.random(), params.randomnessPower) *
                         (Math.random() < 0.5 ? 1 : -1) * params.randomness;
      const rx = rand(), ry = rand(), rz = rand();

      positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * r + rx;
      positions[i3 + 1] = ry;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + rz;

      const mixed = colorInside.clone().lerp(colorOutside, r / params.radius);
      colors[i3 + 0] = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    material = new THREE.PointsMaterial({
      size: params.size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    points = new THREE.Points(geometry, material);
    points.rotation.x = 0.0; // Keep horizontal
    scene.add(points);
  }

  generateGalaxy();

  // ===== CAMERA SETUP =====
  function updateCameraPosition() {
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const aspect = window.innerWidth / window.innerHeight;
    const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * aspect);

    const halfWidth = params.radius + params.randomness * 1.5;
    const margin = 1.0;

    // Base distance for fully zoomed out view
    const baseDistance = (halfWidth / Math.tan(hFOV / 2)) / margin;

    // Adjust distance based on zoom (zoom in = closer, zoom out = farther)
    const distance = baseDistance / zoom;

    // Update the controls' camera distance
    controls.setCameraDistance(distance);

    // Set min/max distance for controls
    controls.minDistance = distance * 0.5;
    controls.maxDistance = distance * 2.0;

    // Equatorial view, 90 degrees rotated around Y (initial position)
    const theta = THREE.MathUtils.degToRad(90);
    const phi = Math.PI / 2;

    // Update controls' spherical coordinates
    if (controls._spherical) {
      controls._spherical.radius = distance;
      // Only set theta/phi on first call to maintain rotation state
      if (!controls._initialized) {
        controls._spherical.theta = theta;
        controls._spherical.phi = phi;
        controls._initialized = true;
      }
      controls._sphericalDelta.set(0, 0, 0);
      controls._scale = 1.0;
    }

    const spherical = new THREE.Spherical(distance,
      controls._spherical ? controls._spherical.phi : phi,
      controls._spherical ? controls._spherical.theta : theta
    );
    const pos = new THREE.Vector3().setFromSpherical(spherical);

    camera.position.copy(pos);
    camera.lookAt(0, 0, 0);
  }

  updateCameraPosition();

  // ===== SCROLL-BASED ZOOM =====
  function onWheel(e) {
    // If page is scrolled down (not at top), allow normal page scroll behavior
    // Galaxy zoom is ONLY controlled when page is at the very top
    if (window.scrollY > 0) {
      // Don't prevent default, don't modify galaxy zoom
      // This allows normal page scroll up/down when viewing content below galaxy
      return;
    }

    // Page is at top (scrollY = 0), control galaxy zoom
    const delta = e.deltaY;
    const isScrollingDown = delta > 0;
    const isScrollingUp = delta < 0;

    // Accumulate scroll with sign (positive = down/zoom in, negative = up/zoom out)
    accumulatedScroll += delta;

    // Clamp accumulated scroll to valid range [0, scrollZoomRange]
    // 0 = min zoom (far away, zoomed out)
    // scrollZoomRange = max zoom (close up, zoomed in)
    accumulatedScroll = Math.max(0, Math.min(scrollZoomRange, accumulatedScroll));

    // Calculate scroll progress (0 to 1)
    scrollProgress = accumulatedScroll / scrollZoomRange;

    // Map to zoom (minZoom when progress=0, maxZoom when progress=1)
    zoom = minZoom + (maxZoom - minZoom) * scrollProgress;

    // Determine if we should prevent default scroll
    let shouldPreventScroll = false;

    if (isScrollingDown) {
      // Scrolling down: prevent default if we haven't reached max zoom yet
      if (scrollProgress < 0.99) {
        shouldPreventScroll = true;
      }
      // Once at max zoom (progress >= 0.99), allow page to scroll down to show content
    } else if (isScrollingUp) {
      // Scrolling up: prevent default if we haven't reached min zoom yet
      if (scrollProgress > 0.01) {
        shouldPreventScroll = true;
      }
      // Once at min zoom (progress <= 0.01), allow default (no effect since at top)
    }

    if (shouldPreventScroll) {
      e.preventDefault();
    }

    // Update camera position based on new zoom
    updateCameraPosition();
  }

  window.addEventListener('wheel', onWheel, { passive: false });

  // ===== WINDOW RESIZE =====
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);

    updateCameraPosition();
  });

  // ===== ANIMATION LOOP =====
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Slow galaxy rotation
    if (points) {
      points.rotation.y = elapsedTime * 0.05;
    }

    // Update controls for drag rotation
    controls.update();

    renderer.render(scene, camera);
  }

  animate();

  // ===== DOUBLE CLICK RESET =====
  window.addEventListener('dblclick', () => {
    // Reset zoom to initial state
    scrollProgress = 0;
    accumulatedScroll = 0;
    zoom = minZoom;

    // Reset rotation to equatorial view
    controls._initialized = false;

    updateCameraPosition();
    window.scrollTo(0, 0);
  });

  // Expose for debugging
  window.galaxyHero = {
    scene,
    camera,
    renderer,
    points,
    params,
    controls,
    zoom: () => zoom,
    regenerate: () => {
      generateGalaxy();
      updateCameraPosition();
    }
  };
})();

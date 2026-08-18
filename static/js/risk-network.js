/** AEGISHEALTH AI — 3D Conceptual Risk Network */

class RiskNetwork {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container || typeof THREE === 'undefined') return;

    this.regions = [];
    this.onRegionSelect = null;
    this.hoveredNode = null;

    this._init();
    this._animate();
    this._bindEvents();
  }

  _init() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.camera.position.set(0, 0, 6);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.nodes = [];
    this.nodeMeshes = [];

    // Particle field
    const particleCount = 120;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 8;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.03,
      transparent: true,
      opacity: 0.4,
    });
    this.particles = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.particles);

    // Globe wireframe
    const globeGeo = new THREE.IcosahedronGeometry(1.8, 2);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    this.globe = new THREE.Mesh(globeGeo, globeMat);
    this.scene.add(this.globe);
  }

  updateRegions(regionData) {
    if (!this.scene) return;
    this.regions = regionData || [];
    this.nodeMeshes.forEach(m => this.scene.remove(m));
    this.nodeMeshes = [];
    this.nodes = [];

    const positions = {
      North: { x: 0, y: 1.2, z: 0.5 },
      Central: { x: -1.0, y: -0.3, z: 0.8 },
      South: { x: 1.0, y: -0.8, z: 0.3 },
    };

    const colors = {
      LOW: 0x22c55e,
      MODERATE: 0xeab308,
      HIGH: 0xf97316,
      CRITICAL: 0xef4444,
    };

    this.regions.forEach((r, i) => {
      const pos = positions[r.region] || {
        x: Math.cos(i * 2.1) * 1.5,
        y: Math.sin(i * 1.7) * 1.2,
        z: Math.sin(i * 2.3) * 0.8,
      };

      const color = colors[r.risk_level] || 0x00d4ff;
      const size = 0.12 + (r.risk_score / 100) * 0.08;

      const geo = new THREE.SphereGeometry(size, 16, 16);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(pos.x, pos.y, pos.z);
      mesh.userData = r;
      this.scene.add(mesh);
      this.nodeMeshes.push(mesh);
      this.nodes.push({ mesh, data: r, baseScale: size });

      // Glow
      const glowGeo = new THREE.SphereGeometry(size * 1.8, 12, 12);
      const glowMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.15,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.copy(mesh.position);
      this.scene.add(glow);
      this.nodeMeshes.push(glow);
    });

    // Connect lines
    if (this.regions.length >= 2) {
      const linePoints = this.regions.map(r => {
        const pos = positions[r.region] || { x: 0, y: 0, z: 0 };
        return new THREE.Vector3(pos.x, pos.y, pos.z);
      });
      for (let i = 0; i < linePoints.length; i++) {
        for (let j = i + 1; j < linePoints.length; j++) {
          const geo = new THREE.BufferGeometry().setFromPoints([linePoints[i], linePoints[j]]);
          const mat = new THREE.LineBasicMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.2,
          });
          const line = new THREE.Line(geo, mat);
          this.scene.add(line);
          this.nodeMeshes.push(line);
        }
      }
    }
  }

  _bindEvents() {
    const canvas = this.renderer?.domElement;
    if (!canvas) return;

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this._checkHover(e.clientX, e.clientY);
    });

    canvas.addEventListener('click', () => {
      if (this.hoveredNode && this.onRegionSelect) {
        this.onRegionSelect(this.hoveredNode.data.region);
      }
    });

    window.addEventListener('resize', () => this._onResize());
  }

  _checkHover(clientX, clientY) {
    if (!this.raycaster || !this.camera) return;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = this.nodes.map(n => n.mesh);
    const hits = this.raycaster.intersectObjects(meshes);
    const tooltip = document.getElementById('node-tooltip');

    if (hits.length > 0) {
      const data = hits[0].object.userData;
      this.hoveredNode = this.nodes.find(n => n.mesh === hits[0].object);
      this.container.style.cursor = 'pointer';

      if (tooltip && data) {
        tooltip.classList.remove('hidden');
        tooltip.style.left = `${clientX + 16}px`;
        tooltip.style.top = `${clientY + 16}px`;
        tooltip.innerHTML = `
          <div class="title">${data.region}</div>
          <div><span>Cases</span><span>${data.latest_cases ?? '—'}</span></div>
          <div><span>Forecast</span><span>${data.forecast_mean ?? '—'}</span></div>
          <div><span>Risk</span><span class="risk-${data.risk_level}">${data.risk_score} (${data.risk_level})</span></div>
        `;
      }
    } else {
      this.hoveredNode = null;
      this.container.style.cursor = 'default';
      tooltip?.classList.add('hidden');
    }
  }

  _onResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  _animate() {
    if (!this.renderer) return;
    requestAnimationFrame(() => this._animate());

    const t = Date.now() * 0.001;
    if (this.globe) {
      this.globe.rotation.y = t * 0.15;
      this.globe.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
    if (this.particles) {
      this.particles.rotation.y = t * 0.05;
    }

    this.nodes.forEach(n => {
      const pulse = 1 + Math.sin(t * 2 + n.data.risk_score * 0.05) * 0.08;
      n.mesh.scale.setScalar(pulse);
      if (n.data.risk_level === 'HIGH' || n.data.risk_level === 'CRITICAL') {
        n.mesh.material.opacity = 0.7 + Math.sin(t * 3) * 0.2;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }
}

window.RiskNetwork = RiskNetwork;

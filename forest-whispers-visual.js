// Forest Whispers Visualization
class ForestVisual {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.leaves = [];
        this.trees = [];
        this.lights = {};
        this.timeOfDay = 0; // 0-1 representing day/night cycle
        this.isAnimating = false;
    }

    initialize() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.createEnvironment();
        this.createParticles();
        this.handleResize();

        // Add resize listener
        window.addEventListener('resize', () => this.handleResize());
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x1a2f1a, 0.05);
    }

    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);
    }

    setupLights() {
        // Ambient light
        this.lights.ambient = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(this.lights.ambient);

        // Directional light (sun/moon)
        this.lights.directional = new THREE.DirectionalLight(0xffffff, 0.8);
        this.lights.directional.position.set(1, 1, 1);
        this.lights.directional.castShadow = true;
        this.scene.add(this.lights.directional);

        // Point lights for atmosphere
        this.lights.point1 = new THREE.PointLight(0x8bc34a, 0.5, 10);
        this.lights.point1.position.set(-5, 2, -5);
        this.scene.add(this.lights.point1);

        this.lights.point2 = new THREE.PointLight(0x4caf50, 0.5, 10);
        this.lights.point2.position.set(5, 2, -5);
        this.scene.add(this.lights.point2);
    }

    createEnvironment() {
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5a2d,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Create trees
        this.createTrees(30);
    }

    createTrees(count) {
        const treeGeometry = new THREE.CylinderGeometry(0, 1.5, 4, 6);
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 6);
        const treeMaterial = new THREE.MeshPhongMaterial({ color: 0x2d5a2d });
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x4d2b1a });

        for (let i = 0; i < count; i++) {
            const tree = new THREE.Group();

            // Create trunk
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.castShadow = true;
            trunk.position.y = 1;
            tree.add(trunk);

            // Create foliage
            const foliage = new THREE.Mesh(treeGeometry, treeMaterial);
            foliage.position.y = 3;
            foliage.castShadow = true;
            tree.add(foliage);

            // Position tree
            const angle = (i / count) * Math.PI * 2;
            const radius = 5 + Math.random() * 15;
            tree.position.x = Math.cos(angle) * radius;
            tree.position.z = Math.sin(angle) * radius;
            tree.rotation.y = Math.random() * Math.PI;
            tree.scale.set(
                0.5 + Math.random() * 0.5,
                0.8 + Math.random() * 0.4,
                0.5 + Math.random() * 0.5
            );

            this.scene.add(tree);
            this.trees.push(tree);
        }
    }

    createParticles() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            // Position
            positions[i3] = (Math.random() - 0.5) * 30;
            positions[i3 + 1] = Math.random() * 15;
            positions[i3 + 2] = (Math.random() - 0.5) * 30;
            // Color
            colors[i3] = 0.5 + Math.random() * 0.5; // R
            colors[i3 + 1] = 0.8 + Math.random() * 0.2; // G
            colors[i3 + 2] = 0.3 + Math.random() * 0.3; // B
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    updateDayNightCycle(time) {
        this.timeOfDay = time;
        
        // Update directional light
        const intensity = Math.sin(time * Math.PI);
        this.lights.directional.intensity = 0.2 + intensity * 0.8;
        
        // Update ambient light
        this.lights.ambient.intensity = 0.2 + intensity * 0.3;
        
        // Update fog color
        const fogColor = new THREE.Color(0x1a2f1a);
        fogColor.lerp(new THREE.Color(0x2d5a2d), intensity);
        this.scene.fog.color = fogColor;
        
        // Update point lights
        const pointIntensity = 0.2 + (1 - intensity) * 0.8;
        this.lights.point1.intensity = pointIntensity;
        this.lights.point2.intensity = pointIntensity;
    }

    animate() {
        if (!this.isAnimating) return;

        requestAnimationFrame(() => this.animate());

        // Animate trees (gentle swaying)
        this.trees.forEach((tree, i) => {
            const offset = i * 0.1;
            tree.rotation.z = Math.sin(Date.now() * 0.001 + offset) * 0.02;
        });

        // Animate particles
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] -= 0.02; // Fall down
                if (positions[i + 1] < 0) {
                    positions[i + 1] = 15; // Reset to top
                    positions[i] = (Math.random() - 0.5) * 30; // Random X
                    positions[i + 2] = (Math.random() - 0.5) * 30; // Random Z
                }
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }

        this.renderer.render(this.scene, this.camera);
    }

    start() {
        this.isAnimating = true;
        this.animate();
    }

    stop() {
        this.isAnimating = false;
    }

    handleResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}

export const createForestVisual = (container) => new ForestVisual(container);

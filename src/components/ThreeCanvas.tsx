import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  FloorId,
  ElevatorCabinState,
  InteractableItem,
  Position3D,
  CollapsePhase,
} from '../types/game';
import { sounds } from '../audio/soundEngine';

interface ThreeCanvasProps {
  currentFloorId: FloorId;
  collapsePhase: CollapsePhase;
  collapseTimer: number;
  elevatorState: ElevatorCabinState;
  joystickVector: { x: number; y: number };
  isDodging: boolean;
  onPlayerPositionChange: (pos: Position3D) => void;
  onNearInteractable: (item: InteractableItem | null) => void;
  onPlayerDeath: (cause: string) => void;
  onEscapeElevator: () => void;
  cameraShake: number;
}

interface BotInstance {
  group: THREE.Group;
  bodyMesh: THREE.Mesh;
  headMesh: THREE.Mesh;
  state: 'dancing' | 'mingling' | 'panicking' | 'falling';
  homeX: number;
  homeZ: number;
  currentX: number;
  currentZ: number;
  currentY: number;
  fallSpeed: number;
  danceFreq: number;
  danceOffset: number;
  panicSpeed: number;
  panicDirX: number;
  panicDirZ: number;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  currentFloorId,
  collapsePhase,
  collapseTimer,
  elevatorState,
  joystickVector,
  isDodging,
  onPlayerPositionChange,
  onNearInteractable,
  onPlayerDeath,
  onEscapeElevator,
  cameraShake,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const propsRef = useRef({
    currentFloorId,
    collapsePhase,
    collapseTimer,
    elevatorState,
    joystickVector,
    isDodging,
    onPlayerPositionChange,
    onNearInteractable,
    onPlayerDeath,
    onEscapeElevator,
    cameraShake,
  });

  useEffect(() => {
    propsRef.current = {
      currentFloorId,
      collapsePhase,
      collapseTimer,
      elevatorState,
      joystickVector,
      isDodging,
      onPlayerPositionChange,
      onNearInteractable,
      onPlayerDeath,
      onEscapeElevator,
      cameraShake,
    };
  }, [
    currentFloorId,
    collapsePhase,
    collapseTimer,
    elevatorState,
    joystickVector,
    isDodging,
    onPlayerPositionChange,
    onNearInteractable,
    onPlayerDeath,
    onEscapeElevator,
    cameraShake,
  ]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a101d);
    scene.fog = new THREE.FogExp2(0x0a101d, 0.010);

    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 600);
    camera.position.set(0, 75, 85);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // --- LIGHTS ---
    const partyAmbientLight = new THREE.AmbientLight(0xffeedd, 1.2);
    scene.add(partyAmbientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    mainKeyLight.position.set(20, 100, 40);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    scene.add(mainKeyLight);

    // Disco spotlights on Rooftop
    const discoLight1 = new THREE.SpotLight(0x06b6d4, 4, 45, Math.PI / 4, 0.5);
    discoLight1.position.set(-8, 76, 0);
    discoLight1.target.position.set(0, 60, 0);
    scene.add(discoLight1);
    scene.add(discoLight1.target);

    const discoLight2 = new THREE.SpotLight(0xec4899, 4, 45, Math.PI / 4, 0.5);
    discoLight2.position.set(8, 76, 0);
    discoLight2.target.position.set(0, 60, 0);
    scene.add(discoLight2);
    scene.add(discoLight2.target);

    // Emergency red strobe
    const emergencyStrobe = new THREE.PointLight(0xff0000, 0, 60);
    emergencyStrobe.position.set(0, 70, 0);
    scene.add(emergencyStrobe);

    // Street ambulance blue/red lights on Floor 1
    const streetLightRed = new THREE.PointLight(0xef4444, 2, 25);
    streetLightRed.position.set(-6, 2, 20);
    scene.add(streetLightRed);
    const streetLightBlue = new THREE.PointLight(0x3b82f6, 2, 25);
    streetLightBlue.position.set(6, 2, 20);
    scene.add(streetLightBlue);

    // --- DISTANT CITY & TOWER 2 ---
    const cityGroup = new THREE.Group();
    cityGroup.position.set(0, -50, 0);
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const bldMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });
    const winMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    for (let i = 0; i < 90; i++) {
      const bx = (Math.random() - 0.5) * 450;
      const bz = (Math.random() - 0.5) * 450;
      if (Math.hypot(bx, bz) < 35) continue;
      const bh = 30 + Math.random() * 85;
      const bw = 10 + Math.random() * 16;
      const bld = new THREE.Mesh(boxGeo, bldMat);
      bld.scale.set(bw, bh, bw);
      bld.position.set(bx, bh / 2, bz);
      cityGroup.add(bld);

      if (Math.random() > 0.4) {
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.7, 6, 6), winMat);
        beacon.position.set(bx, bh + 0.8, bz);
        cityGroup.add(beacon);
      }
    }
    scene.add(cityGroup);

    // TOWER 2 (Twin skyscraper connected via Floor 2 Skybridge)
    const tower2Group = new THREE.Group();
    tower2Group.position.set(0, 30, 48); // 48 units in front of Tower 1
    const tower2Body = new THREE.Mesh(
      new THREE.BoxGeometry(24, 110, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 })
    );
    tower2Group.add(tower2Body);

    // Glowing windows on Tower 2
    for (let wy = -40; wy <= 40; wy += 15) {
      const winBand = new THREE.Mesh(
        new THREE.BoxGeometry(24.2, 2.5, 24.2),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      winBand.position.set(0, wy, 0);
      tower2Group.add(winBand);
    }
    scene.add(tower2Group);

    // --- SHARED MATERIALS ---
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
    });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const marbleDarkMat = new THREE.MeshStandardMaterial({ color: 0x1e2230, roughness: 0.2, metalness: 0.4 });
    const kitchenTileMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.5 });
    const lobbyGraniteMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15, metalness: 0.6 });

    // --- TOWER CORE STRUCTURE ---
    const towerCorePillar = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 12, 120, 16),
      steelMat
    );
    towerCorePillar.position.set(0, 30, -10);
    scene.add(towerCorePillar);

    // ==========================================
    // FLOOR 4: ROOFTOP & DANCE LOUNGE (Y = 60)
    // ==========================================
    const floor4Pivot = new THREE.Group();
    floor4Pivot.position.set(0, 60, 0);
    scene.add(floor4Pivot);

    const f4Floor = new THREE.Mesh(new THREE.BoxGeometry(36, 1.4, 36), marbleDarkMat);
    f4Floor.position.set(0, -0.7, 0);
    f4Floor.receiveShadow = true;
    floor4Pivot.add(f4Floor);

    // Railings on Floor 4
    const railF4Front = new THREE.Mesh(new THREE.BoxGeometry(36, 2, 0.3), glassMat);
    railF4Front.position.set(0, 1, 18);
    floor4Pivot.add(railF4Front);
    const railF4Back = new THREE.Mesh(new THREE.BoxGeometry(36, 2, 0.3), glassMat);
    railF4Back.position.set(0, 1, -18);
    floor4Pivot.add(railF4Back);
    const railF4Left = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2, 36), glassMat);
    railF4Left.position.set(-18, 1, 0);
    floor4Pivot.add(railF4Left);
    const railF4Right = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2, 36), glassMat);
    railF4Right.position.set(18, 1, 0);
    floor4Pivot.add(railF4Right);

    // Central Glass Dance Floor on Floor 4
    const danceFloorGroup = new THREE.Group();
    danceFloorGroup.position.set(0, 0.05, 0);
    const danceFloorTileGeo = new THREE.BoxGeometry(2.8, 0.15, 2.8);
    const danceFloorTiles: THREE.Mesh[] = [];
    const tileColors = [0x06b6d4, 0xec4899, 0xa855f7, 0xf59e0b, 0x10b981];

    for (let tx = -2; tx <= 2; tx++) {
      for (let tz = -2; tz <= 2; tz++) {
        const mat = new THREE.MeshStandardMaterial({
          color: tileColors[Math.abs(tx + tz) % tileColors.length],
          emissive: tileColors[Math.abs(tx + tz) % tileColors.length],
          emissiveIntensity: 0.6,
          roughness: 0.2,
          metalness: 0.5,
        });
        const tile = new THREE.Mesh(danceFloorTileGeo, mat);
        tile.position.set(tx * 3.0, 0, tz * 3.0);
        danceFloorGroup.add(tile);
        danceFloorTiles.push(tile);
      }
    }
    floor4Pivot.add(danceFloorGroup);

    // DJ Booth on Floor 4
    const djBooth = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.8, 1.4), steelMat);
    djBooth.position.set(0, 0.9, -9.5);
    floor4Pivot.add(djBooth);

    // Rooftop Dome & Antenna Spire (Floor 4)
    const rooftopGroup = new THREE.Group();
    rooftopGroup.position.set(0, 14, 0);
    const skylightDome = new THREE.Mesh(new THREE.CylinderGeometry(15, 17, 2, 16, 2, true), glassMat);
    rooftopGroup.add(skylightDome);

    const chandelier = new THREE.Mesh(
      new THREE.OctahedronGeometry(2.4, 2),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfef08a,
        emissiveIntensity: 0.8,
        wireframe: true,
      })
    );
    chandelier.position.set(0, -2, 0);
    rooftopGroup.add(chandelier);

    const antennaSpire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 1.2, 32, 12),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 })
    );
    antennaSpire.position.set(0, 16, 0);
    rooftopGroup.add(antennaSpire);
    floor4Pivot.add(rooftopGroup);

    // 100 BOT GUESTS ON FLOOR 4
    const bots: BotInstance[] = [];
    const botGroup = new THREE.Group();
    floor4Pivot.add(botGroup);

    const bodyGeo = new THREE.CapsuleGeometry(0.32, 0.7, 6, 8);
    const headGeo = new THREE.SphereGeometry(0.28, 10, 10);
    const partySuitColors = [
      0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899,
      0x06b6d4, 0xf97316, 0xe2e8f0, 0x22c55e, 0xa855f7, 0xf43f5e,
    ];

    for (let i = 0; i < 100; i++) {
      const bGroup = new THREE.Group();
      const color = partySuitColors[i % partySuitColors.length];
      const suitMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.2 });
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.6 });

      const body = new THREE.Mesh(bodyGeo, suitMat);
      body.position.set(0, 0.7, 0);
      bGroup.add(body);

      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.set(0, 1.35, 0);
      bGroup.add(head);

      let hx = 0;
      let hz = 0;
      let initialMode: 'dancing' | 'mingling' = 'dancing';

      if (i < 45) {
        hx = (Math.random() - 0.5) * 13;
        hz = (Math.random() - 0.5) * 13;
        initialMode = 'dancing';
      } else {
        const angle = Math.random() * Math.PI * 2;
        const rad = 10 + Math.random() * 6.5;
        hx = Math.cos(angle) * rad;
        hz = Math.sin(angle) * rad;
        initialMode = 'mingling';
      }

      bGroup.position.set(hx, 0, hz);
      botGroup.add(bGroup);

      bots.push({
        group: bGroup,
        bodyMesh: body,
        headMesh: head,
        state: initialMode,
        homeX: hx,
        homeZ: hz,
        currentX: hx,
        currentZ: hz,
        currentY: 0,
        fallSpeed: 0,
        danceFreq: 6 + Math.random() * 4,
        danceOffset: Math.random() * Math.PI * 2,
        panicSpeed: 4 + Math.random() * 3,
        panicDirX: (Math.random() - 0.5) * 2,
        panicDirZ: (Math.random() - 0.5) * 2,
      });
    }

    // ==========================================
    // FLOOR 3: KITCHEN FLOOR (Y = 40)
    // ==========================================
    const floor3Group = new THREE.Group();
    floor3Group.position.set(0, 40, 0);
    scene.add(floor3Group);

    const f3Floor = new THREE.Mesh(new THREE.BoxGeometry(32, 1.4, 32), kitchenTileMat);
    f3Floor.position.set(0, -0.7, 0);
    floor3Group.add(f3Floor);

    // Kitchen Walls & Perimeter
    const kitchenWallMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 });
    const f3BackWall = new THREE.Mesh(new THREE.BoxGeometry(32, 4, 0.4), kitchenWallMat);
    f3BackWall.position.set(0, 2, -16);
    floor3Group.add(f3BackWall);

    // Stainless Steel Prep Tables
    const stainlessTableMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.15 });
    for (let tx of [-8, 0, 8]) {
      const prepTable = new THREE.Mesh(new THREE.BoxGeometry(6, 1.3, 2.5), stainlessTableMat);
      prepTable.position.set(tx, 0.65, 0);
      floor3Group.add(prepTable);
    }

    // Commercial Stoves & Cooking Ranges with fire glow
    for (let sx of [-6, 6]) {
      const stove = new THREE.Mesh(new THREE.BoxGeometry(3, 1.4, 3), steelMat);
      stove.position.set(sx, 0.7, -10);
      floor3Group.add(stove);

      const burnerFlame = new THREE.Mesh(
        new THREE.RingGeometry(0.3, 0.6, 12),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
      );
      burnerFlame.rotation.x = -Math.PI / 2;
      burnerFlame.position.set(sx, 1.42, -10);
      floor3Group.add(burnerFlame);
    }

    // Industrial Fridges
    for (let fx of [-12, 12]) {
      const fridge = new THREE.Mesh(new THREE.BoxGeometry(3.5, 4.5, 2.8), stainlessTableMat);
      fridge.position.set(fx, 2.25, -12);
      floor3Group.add(fridge);
    }

    // Chef bots (white uniforms)
    for (let c = 0; c < 4; c++) {
      const chefGroup = new THREE.Group();
      const chefBody = new THREE.Mesh(
        bodyGeo,
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
      );
      chefBody.position.set(0, 0.7, 0);
      chefGroup.add(chefBody);

      const chefHead = new THREE.Mesh(
        headGeo,
        new THREE.MeshStandardMaterial({ color: 0xfde047 })
      );
      chefHead.position.set(0, 1.35, 0);
      chefGroup.add(chefHead);

      // Chef hat
      const chefHat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.25, 0.5, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      chefHat.position.set(0, 1.7, 0);
      chefGroup.add(chefHat);

      chefGroup.position.set((c - 1.5) * 6, 0, -4);
      floor3Group.add(chefGroup);
    }

    // --- KITCHEN EXPLOSION FIREBALL MESH & BLAST LIGHT ---
    const kitchenFireballGeo = new THREE.DodecahedronGeometry(1.5, 2);
    const kitchenFireballMat = new THREE.MeshBasicMaterial({
      color: 0xff4500,
      transparent: true,
      opacity: 0,
      wireframe: false,
    });
    const kitchenFireballMesh = new THREE.Mesh(kitchenFireballGeo, kitchenFireballMat);
    kitchenFireballMesh.position.set(0, 2.5, -4);
    floor3Group.add(kitchenFireballMesh);

    const kitchenExplosionLight = new THREE.PointLight(0xff3300, 0, 45);
    kitchenExplosionLight.position.set(0, 3.5, -4);
    floor3Group.add(kitchenExplosionLight);

    // Falling burning embers particle system (visible raining from Floor 3 down past Floor 2 and 1)
    const emberCount = 120;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount * 3; i += 3) {
      emberPositions[i] = (Math.random() - 0.5) * 32;
      emberPositions[i + 1] = Math.random() * 65;
      emberPositions[i + 2] = (Math.random() - 0.5) * 32;
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
    const emberMat = new THREE.PointsMaterial({
      color: 0xf97316,
      size: 0.35,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const emberPoints = new THREE.Points(emberGeo, emberMat);
    scene.add(emberPoints);

    // ==========================================
    // FLOOR 2: PATHWAY TO TOWER 2 (Y = 20)
    // ==========================================
    const floor2Group = new THREE.Group();
    floor2Group.position.set(0, 20, 0);
    scene.add(floor2Group);

    // Floor 2 Interior Platform
    const f2Platform = new THREE.Mesh(new THREE.BoxGeometry(28, 1.4, 20), steelMat);
    f2Platform.position.set(0, -0.7, -4);
    floor2Group.add(f2Platform);

    // The Suspended Glass Skybridge Pathway reaching to Tower 2!
    // Length: 36 units stretching from z = 6 to z = 42
    const bridgePathway = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.8, 36),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
    );
    bridgePathway.position.set(0, -0.4, 24);
    floor2Group.add(bridgePathway);

    // Glass Walkway Center Floor on Skybridge
    const bridgeGlassWalkway = new THREE.Mesh(
      new THREE.BoxGeometry(6, 0.2, 34),
      glassMat
    );
    bridgeGlassWalkway.position.set(0, 0.05, 24);
    floor2Group.add(bridgeGlassWalkway);

    // Glass Walls on the Skybridge
    const bridgeWallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 36), glassMat);
    bridgeWallLeft.position.set(-4, 1.5, 24);
    floor2Group.add(bridgeWallLeft);
    const bridgeWallRight = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 36), glassMat);
    bridgeWallRight.position.set(4, 1.5, 24);
    floor2Group.add(bridgeWallRight);

    // Skybridge Ceiling
    const bridgeRoof = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.4, 36), steelMat);
    bridgeRoof.position.set(0, 3.2, 24);
    floor2Group.add(bridgeRoof);

    // Tower 2 Air-Lock Entry Gate at end of Skybridge (z = 40)
    const tower2Gate = new THREE.Mesh(
      new THREE.BoxGeometry(6, 3, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.5 })
    );
    tower2Gate.position.set(0, 1.5, 41);
    floor2Group.add(tower2Gate);

    // Skybridge Escape Marker Beacon
    const bridgeBeacon = new THREE.Mesh(
      new THREE.RingGeometry(1.4, 1.8, 24),
      new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide })
    );
    bridgeBeacon.rotation.x = -Math.PI / 2;
    bridgeBeacon.position.set(0, 0.1, 38);
    floor2Group.add(bridgeBeacon);

    // ==========================================
    // FLOOR 1: THE EXIT (GROUND PLAZA LOBBY, Y = 0)
    // ==========================================
    const floor1Group = new THREE.Group();
    floor1Group.position.set(0, 0, 0);
    scene.add(floor1Group);

    const f1LobbyFloor = new THREE.Mesh(new THREE.BoxGeometry(36, 1.4, 36), lobbyGraniteMat);
    f1LobbyFloor.position.set(0, -0.7, 0);
    f1LobbyFloor.receiveShadow = true;
    floor1Group.add(f1LobbyFloor);

    // Lobby Curved Concierge Desk
    const receptionDesk = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4, 1.3, 16, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 })
    );
    receptionDesk.position.set(0, 0.65, 0);
    receptionDesk.rotation.y = Math.PI;
    floor1Group.add(receptionDesk);

    // Indoor Potted Plants
    for (let px of [-12, 12]) {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.6, 1.2, 12), steelMat);
      pot.position.set(px, 0.6, 8);
      floor1Group.add(pot);

      const plant = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })
      );
      plant.position.set(px, 2.0, 8);
      floor1Group.add(plant);
    }

    // Street Revolving Exit Glass Doors at z = 16
    const exitDoorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(10, 4, 0.5),
      steelMat
    );
    exitDoorFrame.position.set(0, 2, 17);
    floor1Group.add(exitDoorFrame);

    // Glowing Green "EXIT" Sign
    const exitSign = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.8, 0.2),
      new THREE.MeshBasicMaterial({ color: 0x22c55e })
    );
    exitSign.position.set(0, 3.8, 16.8);
    floor1Group.add(exitSign);

    // Street Exit Ground Marker
    const exitGroundRing = new THREE.Mesh(
      new THREE.RingGeometry(2, 2.5, 32),
      new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide })
    );
    exitGroundRing.rotation.x = -Math.PI / 2;
    exitGroundRing.position.set(0, 0.05, 14.5);
    floor1Group.add(exitGroundRing);

    // ==========================================
    // 3D EXPRESS ELEVATOR SHAFT & CABIN
    // ==========================================
    const elevatorShaftGroup = new THREE.Group();
    elevatorShaftGroup.position.set(0, 0, -14.5);

    // Continuous vertical glass shaft tower from Y = 0 to Y = 70
    const shaftTower = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 75, 5),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, wireframe: true })
    );
    shaftTower.position.set(0, 35, 0);
    elevatorShaftGroup.add(shaftTower);

    // Elevator Cabin container
    const cabinGroup = new THREE.Group();
    cabinGroup.position.set(0, 60, 0); // Start at Floor 4

    const cabinBase = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.4, 4.4),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
    );
    cabinBase.position.set(0, -0.2, 0);
    cabinGroup.add(cabinBase);

    const cabinRoof = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.4, 4.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
    );
    cabinRoof.position.set(0, 4.0, 0);
    cabinGroup.add(cabinRoof);

    // Glass walls
    const cWallBack = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.8, 0.2), glassMat);
    cWallBack.position.set(0, 1.9, -2.1);
    cabinGroup.add(cWallBack);

    const cWallL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.8, 4.2), glassMat);
    cWallL.position.set(-2.5, 1.9, 0);
    cabinGroup.add(cWallL);
    const cWallR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.8, 4.2), glassMat);
    cWallR.position.set(2.5, 1.9, 0);
    cabinGroup.add(cWallR);

    // Sliding Double Doors (Front: z = +2.1)
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.2,
    });
    const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.8, 0.15), doorMat);
    leftDoor.position.set(-1.25, 1.9, 2.1);
    cabinGroup.add(leftDoor);

    const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.8, 0.15), doorMat);
    rightDoor.position.set(1.25, 1.9, 2.1);
    cabinGroup.add(rightDoor);

    // Cabin interior light
    const cabinLight = new THREE.PointLight(0xffedd5, 1.8, 10);
    cabinLight.position.set(0, 3.6, 0);
    cabinGroup.add(cabinLight);

    elevatorShaftGroup.add(cabinGroup);
    scene.add(elevatorShaftGroup);

    // ==========================================
    // 3D PLAYER MODEL
    // ==========================================
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 60, 10); // Start on Floor 4

    const playerTorso = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.1, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.5 })
    );
    playerTorso.position.set(0, 1.45, 0);
    playerTorso.castShadow = true;
    playerGroup.add(playerTorso);

    const playerHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.6 })
    );
    playerHead.position.set(0, 2.3, 0);
    playerHead.castShadow = true;
    playerGroup.add(playerHead);

    const playerLegGeo = new THREE.BoxGeometry(0.32, 0.9, 0.35);
    const playerLegMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const pLegL = new THREE.Mesh(playerLegGeo, playerLegMat);
    pLegL.position.set(-0.25, 0.45, 0);
    playerGroup.add(pLegL);
    const pLegR = new THREE.Mesh(playerLegGeo, playerLegMat);
    pLegR.position.set(0.25, 0.45, 0);
    playerGroup.add(pLegR);

    // Flashlight
    const flashlight = new THREE.SpotLight(0xffffff, 4, 30, Math.PI / 4.5, 0.3, 1.2);
    flashlight.position.set(0, 1.6, 0.2);
    flashlight.target.position.set(0, 1.4, 6);
    playerGroup.add(flashlight);
    playerGroup.add(flashlight.target);

    scene.add(playerGroup);

    // Interactive Highlight Ring on floor
    const interactRing = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 1.9, 32),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide })
    );
    interactRing.rotation.x = -Math.PI / 2;
    interactRing.position.set(0, 60.05, -12.5);
    scene.add(interactRing);

    // ==========================================
    // CONTROLS & CAMERA
    // ==========================================
    let cameraAngle = 0;
    let cameraPitch = 0.40;
    let cameraDist = 18;

    let isPointerDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.clientY < window.innerHeight * 0.72) {
        isPointerDragging = true;
        prevPointerX = e.clientX;
        prevPointerY = e.clientY;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDragging) return;
      const dx = e.clientX - prevPointerX;
      const dy = e.clientY - prevPointerY;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;

      cameraAngle -= dx * 0.0055;
      cameraPitch = Math.max(0.12, Math.min(1.15, cameraPitch + dy * 0.0045));
    };

    const onPointerUp = () => {
      isPointerDragging = false;
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      if (!mountRef.current) return;
      width = mountRef.current.clientWidth || window.innerWidth;
      height = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // Sound effect timers
    let partyBeatTicker = 0;
    let alarmSirenTicker = 0;

    // ==========================================
    // ANIMATION LOOP
    // ==========================================
    let animFrameId: number;
    const clock = new THREE.Clock();
    let playerRot = 0;
    let walkCycle = 0;
    let roofCrashProgress = 0;
    let danceFloorFallProgress = 0;
    let towerTiltAmount = 0;
    let playerSlideY = 0;

    const getFloorHeight = (fId: FloorId): number => {
      switch (fId) {
        case 4: return 60;
        case 3: return 40;
        case 2: return 20;
        case 1: return 0;
        default: return 60;
      }
    };

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      const {
        currentFloorId: fId,
        collapsePhase: phase,
        collapseTimer: timer,
        elevatorState: elState,
        joystickVector: jVec,
        isDodging: dodging,
        onPlayerPositionChange: sendPos,
        onNearInteractable: sendNear,
        onPlayerDeath: sendDeath,
        onEscapeElevator: sendEscape,
        cameraShake: shake,
      } = propsRef.current;

      const currentBaseY = getFloorHeight(fId);

      // 1. LIGHTING & AUDIO PER COLLAPSE PHASE
      if (phase === 'party') {
        partyAmbientLight.intensity = THREE.MathUtils.lerp(partyAmbientLight.intensity, 1.4, delta * 3);
        discoLight1.intensity = 3.5;
        discoLight2.intensity = 3.5;
        emergencyStrobe.intensity = 0;

        discoLight1.position.x = Math.sin(time * 2) * 12;
        discoLight1.position.z = Math.cos(time * 2) * 12;
        discoLight2.position.x = Math.sin(time * 2 + Math.PI) * 12;
        discoLight2.position.z = Math.cos(time * 2 + Math.PI) * 12;

        partyBeatTicker += delta;
        if (partyBeatTicker >= 0.5) {
          sounds.playPartyBeat();
          partyBeatTicker = 0;
        }

        danceFloorTiles.forEach((tile, idx) => {
          const mat = tile.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 0.4 + Math.sin(time * 6 + idx * 0.4) * 0.5;
        });
      } else {
        partyAmbientLight.intensity = THREE.MathUtils.lerp(partyAmbientLight.intensity, 0.25, delta * 4);
        discoLight1.intensity = 0.5;
        discoLight2.intensity = 0.5;
        emergencyStrobe.intensity = Math.sin(time * 12) > 0 ? 3.0 : 0.4;

        alarmSirenTicker += delta;
        if (alarmSirenTicker >= 1.6) {
          sounds.playAlarmSiren();
          alarmSirenTicker = 0;
        }
      }

      // 2. DISASTER STAGES AFFECTING ALL FLOORS
      // Stage 1: Rooftop Collapse (T >= 30s)
      if (timer >= 30 && roofCrashProgress < 1) {
        roofCrashProgress = Math.min(1, roofCrashProgress + delta * 0.8);
        rooftopGroup.position.y = 14 - roofCrashProgress * 12;
        rooftopGroup.rotation.z = Math.sin(roofCrashProgress * Math.PI) * 0.25;

        if (fId === 4 && roofCrashProgress > 0.8 && Math.hypot(playerGroup.position.x, playerGroup.position.z) < 3.2) {
          sendDeath('Crushed by the falling antenna spire as the roof caved in!');
        }
      }

      // Stage 2: Dance Floor Collapse (T >= 40s)
      if (timer >= 40 && danceFloorFallProgress < 1) {
        danceFloorFallProgress = Math.min(1, danceFloorFallProgress + delta * 0.6);
        danceFloorGroup.position.y = 0.05 - danceFloorFallProgress * 80;
      }

      if (fId === 4 && timer >= 40 && Math.hypot(playerGroup.position.x, playerGroup.position.z) < 6.8 && !dodging) {
        playerSlideY -= delta * 30;
        playerGroup.position.y = currentBaseY + playerSlideY;
        if (playerSlideY < -15) {
          sendDeath('Plunged through the collapsed dance floor into the 1,300ft void!');
        }
      }

      // Stage 3: Tower Tilting ON ALL FLOORS (T >= 50s)
      if (timer >= 50) {
        towerTiltAmount = Math.min(0.38, towerTiltAmount + delta * 0.04);
        const swayZ = Math.sin(time * 0.5) * 0.04 + towerTiltAmount;
        const swayX = Math.cos(time * 0.4) * 0.03 + towerTiltAmount * 0.35;

        floor4Pivot.rotation.z = swayZ;
        floor4Pivot.rotation.x = swayX;
        floor3Group.rotation.z = swayZ * 0.85;
        floor3Group.rotation.x = swayX * 0.85;
        floor2Group.rotation.z = swayZ * 0.7;
        floor2Group.rotation.x = swayX * 0.7;
        floor1Group.rotation.z = swayZ * 0.4;
        floor1Group.rotation.x = swayX * 0.4;

        // Gravity slide pull on ALL FLOORS
        if (!dodging) {
          const slideForce = towerTiltAmount * 11 * delta;
          playerGroup.position.x += slideForce;
          playerGroup.position.z += slideForce * 0.5;
        }

        // Edge slide fall check per floor
        let hasFallenOffEdge = false;
        if (fId === 4 && (Math.abs(playerGroup.position.x) > 17.5 || Math.abs(playerGroup.position.z) > 17.5)) {
          hasFallenOffEdge = true;
        } else if (fId === 3 && (Math.abs(playerGroup.position.x) > 15.5 || Math.abs(playerGroup.position.z) > 15.5)) {
          hasFallenOffEdge = true;
        } else if (fId === 2 && (Math.abs(playerGroup.position.x) > 4.2 && playerGroup.position.z > 6)) {
          hasFallenOffEdge = true;
        }

        if (hasFallenOffEdge) {
          playerSlideY -= delta * 25;
          playerGroup.position.y = currentBaseY + playerSlideY;
          if (playerSlideY < -10) {
            sendDeath('Slid off into the abyss as the 100-story tower tilted 20 degrees!');
          }
        }
      }

      // Stage 5: KITCHEN FLOOR MASSIVE GAS EXPLOSION (T >= 65s)
      if (timer >= 65) {
        const blastTime = timer - 65;
        const blastScale = Math.min(10, 1 + blastTime * 6.5);
        kitchenFireballMesh.scale.set(blastScale, blastScale * 0.8, blastScale);
        kitchenFireballMesh.rotation.y += delta * 6;
        kitchenFireballMesh.rotation.x += delta * 4;
        kitchenFireballMat.opacity = Math.max(0, 1 - (blastTime % 4) * 0.25);
        kitchenFireballMat.color.setHex((Math.sin(time * 15) > 0) ? 0xff4500 : 0xffa500);
        kitchenExplosionLight.intensity = Math.max(0.5, 5.0 - (blastTime % 3) * 1.5);

        // Falling burning embers from Kitchen down past Floor 2 and 1
        const posAttr = emberGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < emberCount; i++) {
          let ey = posAttr.getY(i) - delta * 25;
          if (ey < 0) ey = 65;
          posAttr.setY(i, ey);
        }
        posAttr.needsUpdate = true;

        // Lethal explosion blast check on Floor 3!
        if (fId === 3 && !dodging) {
          const distToBlastCenter = Math.hypot(playerGroup.position.x - 0, playerGroup.position.z - (-4));
          if (distToBlastCenter < 11.5) {
            sendDeath('Incinerated in the Stage 5 massive gas explosion on the Kitchen Floor!');
          }
        }
      }

      // 3. 100 BOT ANIMATION ON FLOOR 4
      const isCollapsing = timer >= 30;
      bots.forEach((bot) => {
        if (isCollapsing) {
          bot.state = 'panicking';
          if (timer >= 40 && Math.hypot(bot.currentX, bot.currentZ) < 6.8) {
            bot.fallSpeed += delta * 40;
            bot.currentY -= bot.fallSpeed * delta;
          } else {
            bot.currentX += bot.panicDirX * bot.panicSpeed * delta;
            bot.currentZ += bot.panicDirZ * bot.panicSpeed * delta;
            if (timer >= 50) bot.currentX += towerTiltAmount * 8 * delta;
            if (Math.abs(bot.currentX) > 18 || Math.abs(bot.currentZ) > 18) {
              bot.fallSpeed += delta * 30;
              bot.currentY -= bot.fallSpeed * delta;
            }
          }
        } else {
          if (bot.state === 'dancing') {
            const danceBob = Math.sin(time * bot.danceFreq + bot.danceOffset) * 0.18;
            bot.bodyMesh.position.y = 0.7 + Math.abs(danceBob);
          }
        }
        bot.group.position.set(bot.currentX, bot.currentY, bot.currentZ);
      });

      // 4. ELEVATOR POSITION & DOORS
      const targetElevatorY = getFloorHeight(elState.targetFloor as FloorId);
      cabinGroup.position.y = THREE.MathUtils.lerp(cabinGroup.position.y, targetElevatorY, delta * 4);

      const doorOffset = elState.doorProgress * 1.8;
      leftDoor.position.x = -1.25 - doorOffset;
      rightDoor.position.x = 1.25 + doorOffset;

      // 5. PLAYER JOYSTICK MOVEMENT
      const moveSpeed = dodging ? 14 : 7.5;
      if (Math.hypot(jVec.x, jVec.y) > 0.08) {
        const forward = new THREE.Vector3(-Math.sin(cameraAngle), 0, -Math.cos(cameraAngle));
        const right = new THREE.Vector3(Math.cos(cameraAngle), 0, -Math.sin(cameraAngle));

        const moveDir = new THREE.Vector3()
          .addScaledVector(right, jVec.x)
          .addScaledVector(forward, -jVec.y)
          .normalize();

        playerGroup.position.x += moveDir.x * moveSpeed * delta;
        playerGroup.position.z += moveDir.z * moveSpeed * delta;

        const targetRot = Math.atan2(moveDir.x, moveDir.z);
        playerRot = THREE.MathUtils.lerp(playerRot, targetRot, delta * 12);
        playerGroup.rotation.y = playerRot;

        walkCycle += delta * (dodging ? 20 : 11);
        pLegL.rotation.x = Math.sin(walkCycle) * 0.7;
        pLegR.rotation.x = -Math.sin(walkCycle) * 0.7;
        playerTorso.position.y = 1.45 + Math.abs(Math.sin(walkCycle * 2)) * 0.08;
      } else {
        pLegL.rotation.x = THREE.MathUtils.lerp(pLegL.rotation.x, 0, delta * 8);
        pLegR.rotation.x = THREE.MathUtils.lerp(pLegR.rotation.x, 0, delta * 8);
        playerTorso.position.y = 1.45;
      }

      // Smooth player Y to current floor
      if (playerSlideY === 0) {
        playerGroup.position.y = THREE.MathUtils.lerp(playerGroup.position.y, currentBaseY, delta * 8);
      }

      // Floor boundary clamping
      if (fId === 2) {
        // Floor 2 has skybridge stretching to z = 40!
        playerGroup.position.x = Math.max(-13, Math.min(13, playerGroup.position.x));
        playerGroup.position.z = Math.max(-14, Math.min(41, playerGroup.position.z));
      } else {
        playerGroup.position.x = Math.max(-17, Math.min(17, playerGroup.position.x));
        playerGroup.position.z = Math.max(-15, Math.min(17, playerGroup.position.z));
      }

      sendPos({
        x: playerGroup.position.x,
        y: playerGroup.position.y,
        z: playerGroup.position.z,
      });

      // 6. INTERACTION PROXIMITY DETECTION
      const distToElevatorCall = Math.hypot(
        playerGroup.position.x - 0,
        playerGroup.position.z - (-12.5)
      );

      const distInsideCabin = Math.hypot(
        playerGroup.position.x - 0,
        playerGroup.position.z - (-14.5)
      );

      let nearItem: InteractableItem | null = null;

      // Inside cabin: Operate panel
      if (distInsideCabin < 2.5 && elState.doorState === 'open') {
        nearItem = {
          id: 'elevator_panel',
          name: 'Elevator Control Console',
          type: 'elevator_interior_panel',
          floorId: fId,
          position: { x: 0, y: currentBaseY, z: -14.5 },
          radius: 3.5,
          promptLabel: 'CHOOSE DESTINATION FLOOR',
        };
      } else if (distToElevatorCall < 3.8) {
        nearItem = {
          id: 'elevator_call_station',
          name: 'Elevator Call Station',
          type: 'elevator_call',
          floorId: fId,
          position: { x: 0, y: currentBaseY, z: -12.5 },
          radius: 3.8,
          promptLabel: elState.doorState === 'open' ? 'ENTER ELEVATOR' : 'CALL ELEVATOR',
        };
      } else if (fId === 2 && playerGroup.position.z > 33) {
        // On Floor 2 Skybridge near Tower 2 gate!
        nearItem = {
          id: 'tower2_gate_escape',
          name: 'Tower 2 Skybridge Air-Lock Gate',
          type: 'evac_hatch',
          floorId: 2,
          position: { x: 0, y: 20, z: 38 },
          radius: 4.5,
          promptLabel: 'ESCAPE ACROSS PATHWAY TO TOWER 2',
        };
      } else if (fId === 1 && playerGroup.position.z > 12) {
        // On Floor 1 near lobby exit doors!
        nearItem = {
          id: 'lobby_exit_escape',
          name: 'Grand Lobby Plaza Street Exit',
          type: 'evac_hatch',
          floorId: 1,
          position: { x: 0, y: 0, z: 14.5 },
          radius: 4.5,
          promptLabel: 'ESCAPE THROUGH LOBBY EXIT DOORS',
        };
      } else if (fId === 3 && Math.hypot(playerGroup.position.x - 6, playerGroup.position.z - (-10)) < 3.0) {
        // On Kitchen Floor near gas valve!
        nearItem = {
          id: 'kitchen_gas_valve',
          name: 'Kitchen Gas Shutoff Valve',
          type: 'steam_valve',
          floorId: 3,
          position: { x: 6, y: 40, z: -10 },
          radius: 3.0,
          promptLabel: 'SHUT OFF LEAKING GAS VALVE',
        };
      }

      sendNear(nearItem);

      // Highlight ring placement
      interactRing.position.set(0, currentBaseY + 0.05, -12.5);

      // 7. CAMERA TRACKING
      const camTargetX = playerGroup.position.x;
      const camTargetY = playerGroup.position.y + 1.8;
      const camTargetZ = playerGroup.position.z;

      const camX = camTargetX + Math.sin(cameraAngle) * Math.cos(cameraPitch) * cameraDist;
      const camY = camTargetY + Math.sin(cameraPitch) * cameraDist;
      const camZ = camTargetZ + Math.cos(cameraAngle) * Math.cos(cameraPitch) * cameraDist;

      const shakeOffset = (Math.random() - 0.5) * shake * 0.45;

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, camX + shakeOffset, delta * 6);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, camY + shakeOffset, delta * 6);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, camZ + shakeOffset, delta * 6);
      camera.lookAt(camTargetX, camTargetY, camTargetZ);

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing touch-none select-none overflow-hidden"
    />
  );
};

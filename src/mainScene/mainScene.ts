///<reference path="backgroundField.ts"/>
///<reference path="track.ts"/>
///<reference path="spaceShip.ts"/>
///<reference path="bulletTrigger.ts"/>
///<reference path="meteoriteGenerator.ts"/>
///<reference path="rockGenerator.ts"/>

module Core.MainScene {
  export class Scene {
    private light: BABYLON.SpotLight;

    public scene: BABYLON.Scene;
    public assetsManager: BABYLON.AssetsManager;
    public shadowGenerator: BABYLON.ShadowGenerator;
    public camera: BABYLON.FollowCamera;
    public backgroundField: Core.MainScene.BackgroundField;

    public spaceShip: Core.MainScene.SpaceShip;
    public track: Core.MainScene.Track;
    public spaceShipCurrentTrackLane: number;
    public spaceShipTransitionTrackLane: number; // when moving from one track to another
    public meteoriteGenerator: Core.MainScene.MeteoriteGenerator;
    public rockGenerator: Core.MainScene.RockGenerator;
    public runRenderLoop: () => void;

    constructor() {
      var self = this;
      initScene();
      addObjectsToScene();

      // used by the game engine to pause and continue
      this.runRenderLoop = () => {
        if (!Core.Game.hasStarted) { Core.Game.hasStarted = true; }
        if (Core.Game.isPaused) { Core.Game.isPaused = false; }
        Game.engine.runRenderLoop(() => {
          this.spaceShip.spaceShipMesh.position.z += this.spaceShip.speed;
          this.light.position.x = this.spaceShip.spaceShipMesh.position.x;
          this.light.position.y = this.spaceShip.spaceShipMesh.position.y + 190;
          this.light.position.z = this.spaceShip.spaceShipMesh.position.z - 140;
          if (this.camera.position.z > this.track.roadBlocks.blocks[0].position.z + Track.trackBlockZDimention) {
            this.track.repositionFirstLineOfBlocks();
          }
          Core.Utilities.updateStats();
          this.scene.render();
        });
      };

      this.assetsManager.onFinish = () => {
        this.runRenderLoop();
        this.meteoriteGenerator.recursiveMeteoritesCreation(this.spaceShip.spaceShipMesh);
        this.rockGenerator.recursiveRocksCreation(this.spaceShip.spaceShipMesh);
        addEventListeners();
      };

      this.assetsManager.load();

      function initScene() {
        self.scene = new BABYLON.Scene(Game.engine);
        self.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        self.scene.fogDensity = 0.00199;
        self.scene.fogColor = new BABYLON.Color3(0, 0, 0);
        // this.scene.workerCollisions = true;
        self.scene.clearColor = new BABYLON.Color3(0.5, 1, 0.5);
        self.scene.ambientColor = new BABYLON.Color3(1, 0.3, 0.3);
        self.assetsManager = new BABYLON.AssetsManager(self.scene);
        var bgLoaderTask = self.assetsManager.addImageTask("bgLoader", "/assets/earthbg.png");
        bgLoaderTask.onSuccess = () => {
          self.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0.0000000000000001);
          Game.canvas.style.backgroundColor = "#000000"
          //Game.canvas.style.backgroundImage = "url(/assets/earthbg.png)";
          //Game.canvas.style.backgroundSize = "100% 100%";
          //Game.canvas.style.backgroundRepeat = "no-repeat";
        };
        addLightAndShadows();
        self.scene.onDispose = () => { removeEventListeners(); };
      }

      function addLightAndShadows(): void {
        self.light = new BABYLON.SpotLight(
          "RocksSpotLight", new BABYLON.Vector3(0, 100, -50), new BABYLON.Vector3(0, -1, 1), 2, 1, self.scene);
        self.light.intensity = 0.9;
        self.shadowGenerator = new BABYLON.ShadowGenerator(1024, <any>self.light);
        // self.shadowGenerator.bias = 0.000005;
        self.shadowGenerator.usePoissonSampling = true;
        self.shadowGenerator.useVarianceShadowMap = false;
        self.shadowGenerator.useBlurVarianceShadowMap = false;
        self.shadowGenerator.setTransparencyShadow(true);
      }

      function addObjectsToScene(): void {
        self.backgroundField = new BackgroundField(self);
        self.track = new Track(self);
        self.spaceShipCurrentTrackLane = Math.round((self.track.roadBlocks.lanesPositionX.length - 1) / 2);
        // Need the spaceship to generate rocks and meteorites
        self.spaceShip = new SpaceShip(self,
          () => {
            self.spaceShip.spaceShipMesh.position = new BABYLON.Vector3(
              self.track.roadBlocks.lanesPositionX[self.spaceShipCurrentTrackLane], 3, 0);
            crateFollowCam(self.spaceShip.spaceShipMesh);
          });
          self.meteoriteGenerator = new MeteoriteGenerator(self);
          self.rockGenerator = new RockGenerator(self);
      }

      function crateFollowCam(target: BABYLON.Mesh): void {
        self.camera = new BABYLON.FollowCamera("FollowCam", BABYLON.Vector3.Zero(), self.scene);
        self.camera.radius = 80;
        self.camera.heightOffset = 25;
        self.camera.rotationOffset = 0;
        self.camera.cameraAcceleration = 0.09;
        self.camera.maxCameraSpeed = 20;
        self.camera.inertia = 0.5;
        self.camera.target = target;
      }

      function removeEventListeners(): void {
        window.removeEventListener("keydown", onKeyDownHandler, false);
      }

      function addEventListeners() {
        window.addEventListener("keydown", onKeyDownHandler, true);
        window.addEventListener("keyup", onKeyUpHandler, false);
      }

      function onKeyDownHandler(event: KeyboardEvent): void {
        var newLane: number;
        var keyEventMappings: any = {
          37: () => {
            newLane = self.spaceShipCurrentTrackLane - 1;
            if (!self.spaceShip.isXMoving && newLane !== -1) {
              self.spaceShipTransitionTrackLane = self.spaceShipCurrentTrackLane;
              self.spaceShipCurrentTrackLane--;
              self.spaceShip.moveShipMeshToLane(newLane, () => { self.spaceShipTransitionTrackLane = undefined; });
            }
          },
          38: () => { self.spaceShip.moveUp(); },
          39: () => {
            newLane = self.spaceShipCurrentTrackLane + 1;
            if (!self.spaceShip.isXMoving && newLane < self.track.roadBlocks.lanesPositionX.length) {
              self.spaceShipTransitionTrackLane = self.spaceShipCurrentTrackLane;
              self.spaceShipCurrentTrackLane++;
              self.spaceShip.moveShipMeshToLane(newLane, () => { self.spaceShipTransitionTrackLane = undefined; });
            }
          },
          40: () => { self.spaceShip.moveDown(); }
        };
        if (keyEventMappings[event.keyCode]) { keyEventMappings[event.keyCode](); }
      }

      function onKeyUpHandler(event: KeyboardEvent): void {
        if (event.keyCode === 32) { self.spaceShip.triggerShot(); }
      }

    }
  }
}

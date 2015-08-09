module Core.MainScene {

  export interface IRock {
    id: string;
    mesh: BABYLON.Mesh;
    sunosoidalFrecuency: number;
    rotation: BABYLON.Vector3;
    isTransparent: boolean;
    laneIndex: number;
  }

  export interface INextRockPosition {
    laneIndex: number;
    z: number;
  }

  export class RockGenerator {
    private scene: Core.MainScene.Scene;
    private originalRock: BABYLON.Mesh;
    private originalRockHeight: number;
    private originalExplosion: BABYLON.ParticleSystem;

    public numberOfRocks: number = 30; // should go from 30 to 60
    public rocksSpeed: number = -0.5; // should go from -1 to -3
    public rocksDistanceFromShip: number = 900;

    private minRocksSeparation: number = 14;
    private lastRocksAtLanesLog: number[] = [];
    private currentRocks: IRock[] = [];

    public explodeRock: (rock: IRock, sound?: string) => void;
    public recursiveRocksCreation: (rockTarget: BABYLON.Mesh) => void;
    public getRocksAtLanes: (lanes: number[]) => IRock[];

    constructor(scene: Scene) {
      var self = this;
      this.scene = scene;
      preloadAssets();
      createOriginalExplosion();
      registerRenderer();

      this.getRocksAtLanes = (lanes: number[]): IRock[] => {
        return this.currentRocks.filter((rock: IRock) => {
          return lanes.indexOf(rock.laneIndex) !== -1;
        });
      };

      this.explodeRock = (rock: IRock, sound?: string): void => {
        rock.mesh.isVisible = false;
        sound = sound || "explosion";
        rock.mesh.isVisible = false;
        Core.Audio.playSoundFromAudioLib(sound);
        var newExplosionSystem = this.originalExplosion.clone("nExplosion" + rock.id, rock.mesh);
        newExplosionSystem.start();
        newExplosionSystem.onDispose = () => {
          removeRock(rock);
        };
      };

      this.recursiveRocksCreation = (rockTarget: BABYLON.Mesh) => {
        if (!Core.Game.isPaused && this.currentRocks.length < this.numberOfRocks) {
          addRock(rockTarget);
        }
        setTimeout(() => { this.recursiveRocksCreation(rockTarget); },
        (12 / this.numberOfRocks) * (1 / (this.scene.spaceShip.speed - this.rocksSpeed)) * 2000);
      };

      function registerRenderer(): void {
        self.scene.scene.registerBeforeRender(() => {
          self.currentRocks.forEach((aRock: IRock) => {
            if (self.scene.camera.position.z > aRock.mesh.position.z) {
              removeRock(aRock);
            }
          });
        });
      }

      function preloadAssets(): void {
        self.scene.assetsManager.addTextureTask("rockBTxt", "/assets/meshes/rock/rockBump.png");
        self.scene.assetsManager.addTextureTask("flare", "/assets/flare.png");
        self.scene.assetsManager.addMeshTask("RockMeshTask", "", "/assets/meshes/rock/", "rock.babylon")
        .onSuccess = (task: BABYLON.MeshAssetTask) => { createOriginalRock(<BABYLON.Mesh>task.loadedMeshes[0]); };
      }

      function createOriginalRock(rockMesh: BABYLON.Mesh): void {
        var rockMaterial = new BABYLON.StandardMaterial("rockTexture", self.scene.scene);
        rockMaterial.bumpTexture = new BABYLON.Texture("/assets/meshes/rock/rockBump.png", self.scene.scene);
        rockMaterial.backFaceCulling = true;
        self.originalRock = rockMesh;
        self.originalRock.isVisible = false;
        self.originalRock.material = rockMaterial;
        self.originalRock.receiveShadows = true;
        var vectorsWorld = self.originalRock.getBoundingInfo().boundingBox.vectorsWorld; // summits of the bounding box
        self.originalRockHeight = vectorsWorld[1].subtract(vectorsWorld[0]).length();
      }

      function createOriginalExplosion(): void {
        var explosionSystem = new BABYLON.ParticleSystem("rockExplosion", 800, self.scene.scene);
        explosionSystem.renderingGroupId = 2;
        explosionSystem.particleTexture = new BABYLON.Texture("/assets/flare.png", self.scene.scene);
        explosionSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0);
        explosionSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
        explosionSystem.color1 = new BABYLON.Color4(0.8, 0.5, 0, 1);
        explosionSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1);
        explosionSystem.colorDead = new BABYLON.Color4(1, 0, 0, 0);
        explosionSystem.minSize = 16;
        explosionSystem.maxSize = 18;
        explosionSystem.minLifeTime = 0.15;
        explosionSystem.maxLifeTime = 0.35;
        explosionSystem.emitRate = 800;
        explosionSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        explosionSystem.gravity = new BABYLON.Vector3(0, 0, 0);
        explosionSystem.direction1 = new BABYLON.Vector3(-5, -1, -5);
        explosionSystem.direction2 = new BABYLON.Vector3(5, 5, 5);
        explosionSystem.minAngularSpeed = 0;
        explosionSystem.maxAngularSpeed = Math.PI;
        explosionSystem.minEmitPower = 1;
        explosionSystem.maxEmitPower = 50;
        explosionSystem.updateSpeed = 0.005;
        explosionSystem.targetStopDuration = 0.05;
        explosionSystem.disposeOnStop = true;
        self.originalExplosion = explosionSystem;
      }

      function addRock(rockTarget: BABYLON.Mesh): void {
        var rockPosition = getNextRockPosition();
        var id = "rockMesh:" + self.currentRocks.length;
        var relativeSpeed = self.rocksSpeed - self.scene.spaceShip.speed;
        // formula for the frecuency multiplicator we want based on the rock speed (direction that goes from positive to negative with difficulty)
        var sunosoidalFrecuencyMultiplicator = ((1 / Math.abs(relativeSpeed) + 1) + 1);
        var newRock: IRock = <IRock>{
          id: id,
          mesh: self.originalRock.clone(id),
          // sinusoidal offset
          sunosoidalFrecuency: Core.Utilities.getRandomInRange(8 * sunosoidalFrecuencyMultiplicator, 16 * sunosoidalFrecuencyMultiplicator),
          rotation: new BABYLON.Vector3(
            Core.Utilities.getRandomInRange(-1, 1) * 0.015,
            Core.Utilities.getRandomInRange(-1, 1) * 0.015,
            Core.Utilities.getRandomInRange(-1, 1) * 0.015
            ),
          isTransparent: false,
          laneIndex: rockPosition.laneIndex
        };
        self.scene.shadowGenerator.getShadowMap().renderList.push(newRock.mesh);
        self.currentRocks.push(newRock);
        newRock.mesh.position = new BABYLON.Vector3(
          self.scene.track.roadBlocks.lanesPositionX[rockPosition.laneIndex],
          (self.originalRockHeight / 2),
          rockPosition.z);
        newRock.mesh.renderingGroupId = 2;
        newRock.mesh.isVisible = true;

        newRock.mesh.registerBeforeRender((newR: BABYLON.Mesh) => {
          newR.rotation.y += newRock.rotation.y;
          newR.rotation.x += newRock.rotation.x;
          newR.rotation.z += newRock.rotation.z;
          newR.position.z += self.rocksSpeed;
          /* Formula to generate the sinusoidal movement in a frecuency determined by the current speed.
           * starts at 25 height (the rocks mesh height is 33~) and moves 10 up and down
           */
          newR.position.y = (25) + (10 * Math.sin(newR.position.z / newRock.sunosoidalFrecuency));
          if (self.scene.spaceShipCurrentTrackLane === newRock.laneIndex ||
            self.scene.spaceShipTransitionTrackLane === newRock.laneIndex) {
            if (newR.intersectsMesh(rockTarget, false)) {
              self.explodeRock(newRock, "collision");
              self.scene.spaceShip.explode();
            } else if (self.scene.spaceShip.spaceShipMesh.position.z > newR.position.z - 10) {
              newRock.isTransparent = newRock.isTransparent || true;
              newR.visibility -= 0.03;
            }
          }
        });
      }

      function removeRock(rock: IRock): void {
        self.scene.shadowGenerator.getShadowMap().renderList.some(
          (mesh: BABYLON.Mesh, shadowIndex: number, list: BABYLON.AbstractMesh[]) => {
            if (mesh.name === rock.id) {
              list.splice(shadowIndex, 1);
              return true;
            }
          });
        self.scene.scene._toBeDisposed.push(rock.mesh);
        self.currentRocks.some(
          (currentRock: IRock, rockIndex: number, list: IRock[]) => {
            if (currentRock.id === rock.id) {
              list.splice(rockIndex, 1);
              return true;
            }
          });
      };

      function getNextRockPosition(): INextRockPosition {
        var ret: INextRockPosition = {
          laneIndex: Core.Utilities.getRandomInRange(0, self.scene.track.roadBlocks.lanesPositionX.length - 1),
          z: self.scene.spaceShip.spaceShipMesh.position.z + self.rocksDistanceFromShip
        };
        // first test with a random lane
        if (self.lastRocksAtLanesLog[ret.laneIndex] !== undefined
          && self.lastRocksAtLanesLog[ret.laneIndex] + self.minRocksSeparation > ret.z) {
          ret.z += self.minRocksSeparation;
        }
        // update the lanes rocks log
        self.lastRocksAtLanesLog[ret.laneIndex] = ret.z;
        return ret;
      }

    }
  }
}

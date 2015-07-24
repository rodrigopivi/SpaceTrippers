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
    private targetObject: BABYLON.Mesh;
    private originalRock: BABYLON.Mesh;
    private numberOfRocks: number = 40;
    private rocksSpeed: number = -3; // should go from 1 to -3
    private rocksDistanceFromShip: number = 900;
    private minRocksSeparation: number = 11;
    private lastRocksAtLanesLog: number[] = [];
    private getNextRockPosition: () => INextRockPosition;
    public currentRocks: IRock[] = [];
    public rockIndexById: (meteorIndex: string) => number;
    public explodeRock: (rock: IRock, sound?: string) => void;
    public removeRock: (rock: IRock) => void;

    public recursiveRocksCreation: () => void;
    public addRock: () => void;
    public getRocksAtLanes: (lanes: number[]) => IRock[];

    constructor(scene: Scene, targetObject: BABYLON.Mesh) {
      this.scene = scene;
      this.targetObject = targetObject;

      var rockMaterial = new BABYLON.StandardMaterial("rockTexture", this.scene.scene);
      // rockMaterial.diffuseTexture = new BABYLON.Texture("/assets/meshes/rock/txt.jpg", this.scene.scene);
      // rockMaterial.diffuseTexture = new BABYLON.Texture("/assets/meshes/rock/rockTexture.jpg", this.scene.scene);
      rockMaterial.bumpTexture = new BABYLON.Texture("/assets/meshes/rock/rockBump.png", this.scene.scene);
      rockMaterial.backFaceCulling = false;
      BABYLON.SceneLoader.ImportMesh("", "/assets/meshes/rock/", "rock.babylon", this.scene.scene, (newMeshes: BABYLON.Mesh[]) => {
        this.originalRock = <BABYLON.Mesh>newMeshes[0];
        this.originalRock.isVisible = false;
        this.originalRock.material = rockMaterial;
        this.originalRock.receiveShadows = true;
      });

      var explosionSystem = new BABYLON.ParticleSystem("rockExplosion", 900, this.scene.scene);
      explosionSystem.renderingGroupId = 2;
      explosionSystem.particleTexture = new BABYLON.Texture("/assets/flare.png", this.scene.scene);
      explosionSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0);
      explosionSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
      explosionSystem.color1 = new BABYLON.Color4(0.8, 0.5, 0, 1);
      explosionSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1);
      explosionSystem.colorDead = new BABYLON.Color4(1, 0, 0, 0);
      explosionSystem.minSize = 15;
      explosionSystem.maxSize = 17;
      explosionSystem.minLifeTime = 0.15;
      explosionSystem.maxLifeTime = 0.35;
      explosionSystem.emitRate = 1000;
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


      this.rockIndexById = (meteorIndex: string): number => {
        var mIndex = -1;
        this.currentRocks.some((meteor: any, index: number) => {
          var found = false;
          if (meteor.id === meteorIndex) {
            mIndex = index;
            found = true;
          }
          return found;
        });
        return mIndex;
      };

      this.getRocksAtLanes = (lanes: number[]): IRock[] => {
        return this.currentRocks.filter((rock: IRock) => {
          return rock.mesh.isVisible && lanes.indexOf(rock.laneIndex) !== -1;
        });
      };

      this.getNextRockPosition = (): INextRockPosition => {
        var ret: INextRockPosition = {
          laneIndex: Core.Utilities.getRandomInRange(0, this.scene.track.rows.lanesPositionX.length - 1),
          z: this.scene.spaceShip.spaceShipMesh.position.z + this.rocksDistanceFromShip
        };
        // first test with a random lane
        if (this.lastRocksAtLanesLog[ret.laneIndex] !== undefined
          && this.lastRocksAtLanesLog[ret.laneIndex] + this.minRocksSeparation > ret.z) {
          ret.z  += this.minRocksSeparation;
        }
        // update the lanes rocks log
        this.lastRocksAtLanesLog[ret.laneIndex] = ret.z;
        return ret;
      };

      this.explodeRock = (rock: IRock, sound?: string): void => {
        sound = sound || "explosion";
        rock.mesh.isVisible = false;
        Core.Audio.playSoundFromAudioLib(sound);
        var newExplosionSystem = explosionSystem.clone("nExplosion" + rock.id, rock.mesh);
        newExplosionSystem.start();
        newExplosionSystem.onDispose = () => {
          this.scene.scene._toBeDisposed.push(rock.mesh);
          this.removeRock(rock);
        };
      };

      this.removeRock = (rock: IRock): void => {
        var shadowRenderListIndex: number = -1;
        this.scene.sharedShadowGenerator.getShadowMap().renderList.some(
          (mesh: BABYLON.Mesh, shadowIndex: number) => {
            var ret: boolean = false;
            if (mesh.name === rock.id) {
              shadowRenderListIndex = shadowIndex;
              ret = true;
            }
            return ret;
          });
        if (shadowRenderListIndex !== -1) {
          this.scene.sharedShadowGenerator.getShadowMap().renderList.splice(shadowRenderListIndex, 1);
        }
        this.scene.scene._toBeDisposed.push(rock.mesh);
        var rockIndex = this.rockIndexById(rock.id);
        if (rockIndex !== -1) {
          this.currentRocks.splice(rockIndex, 1);
        }
        // this.recursiveRocksCreation();
      };

      this.recursiveRocksCreation = () => {
        if (Core.Game.isEngineLoopRunning && this.currentRocks.length < this.numberOfRocks) {
          this.addRock();
        }
        setTimeout(() => { this.recursiveRocksCreation(); }, Core.Utilities.getRandomInRange(100, 400));
      };

      this.addRock = (): void => {
        var rockPosition = this.getNextRockPosition();
        if (this.originalRock) {
          var id = "rockMesh:" + this.currentRocks.length;
          var relativeSpeed = this.rocksSpeed - this.scene.spaceShip.speed;
          // formula for the frecuency multiplicator we want based on the rock speed (direction that goes from positive to negative with difficulty)
          var sunosoidalFrecuencyMultiplicator = relativeSpeed >= 0 ? (1 + relativeSpeed) : ((1 / Math.abs(relativeSpeed) + 1) + 1);
          var newRock: IRock = <IRock>{
            id: id,
            mesh: this.originalRock.clone(id),
            // sinusoidal offset
            sunosoidalFrecuency: Core.Utilities.getRandomInRange(20 * sunosoidalFrecuencyMultiplicator, 25 * sunosoidalFrecuencyMultiplicator),
            rotation: new BABYLON.Vector3(
              Core.Utilities.getRandomInRange(-1, 1) * 0.015,
              Core.Utilities.getRandomInRange(-1, 1) * 0.015,
              Core.Utilities.getRandomInRange(-1, 1) * 0.015
              ),
            isTransparent: false,
            laneIndex: rockPosition.laneIndex
          };
          this.scene.sharedShadowGenerator.getShadowMap().renderList.push(newRock.mesh);
          this.currentRocks.push(newRock);

          var vectorsWorld = newRock.mesh.getBoundingInfo().boundingBox.vectorsWorld; // summits of the bounding box
          var newRockHeight = vectorsWorld[1].subtract(vectorsWorld[0]).length();
          newRock.mesh.position = new BABYLON.Vector3(
            this.scene.track.rows.lanesPositionX[rockPosition.laneIndex],
            1 + (newRockHeight / 2),
            rockPosition.z);
          newRock.mesh.renderingGroupId = 2;
          newRock.mesh.isVisible = true;

          newRock.mesh.registerBeforeRender((newR: BABYLON.Mesh) => {
            newR.rotation.y += newRock.rotation.y;
            newR.rotation.x += newRock.rotation.x;
            newR.rotation.z += newRock.rotation.z;
            newR.position.z += this.rocksSpeed;
            /* Formula to generate the sinusoidal movement in a frecuency determined by the current speed.
             * starts at 25 height (the rocks mesh height is 33~) and moves 10 up and down
             */
            var sinusoidalYPosition = (25) + (10 * Math.sin(newR.position.z / newRock.sunosoidalFrecuency));
            newR.position.y = sinusoidalYPosition;
            // if (sinusoidalYPosition - newRockHeight / 2 > 0) { newR.position.y = sinusoidalYPosition; }
            if (!newRock.isTransparent &&
              this.scene.spaceShip.spaceShipMesh.position.z - 25 > newR.position.z &&
              this.scene.spaceShipCurrentTrackLane === newRock.laneIndex) {
              newRock.isTransparent = true;
              newR.visibility -= 0.03;
            } else if (newRock.isTransparent && newR.visibility > 0.4) {
              newR.visibility -= 0.03;
            }

            if ((this.scene.spaceShipCurrentTrackLane === newRock.laneIndex ||
              this.scene.spaceShipTransitionTrackLane === newRock.laneIndex) &&
              newR.intersectsMesh(this.targetObject, false)) {
              this.explodeRock(newRock, "collision");
              this.scene.spaceShip.explode();
            }
          });
        }
      };

      // Add a rocks destroyer at our render loop
      this.scene.scene.registerBeforeRender(() => {
        this.currentRocks.forEach((aRock: IRock) => {
          if (this.scene.camera.position.z > aRock.mesh.position.z) {
            this.removeRock(aRock);
            this.addRock();
          }
        });
      });

    }
  }
}

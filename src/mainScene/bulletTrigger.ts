module Core.MainScene {

  export interface IBullet {
    mesh: BABYLON.Mesh;
    particles: BABYLON.ParticleSystem;
    collidableLanes: number[];
  }

  export class BulletTrigger {
    private scene: Core.MainScene.Scene;
    private bulletsOrigin: BABYLON.Mesh;
    private originalShotMesh: BABYLON.Mesh;
    private originalBulletTail: BABYLON.ParticleSystem;
    private currentBullets: IBullet[] = [];
    private bulletsCount: number = 0;

    public triggerShot: () => void;

    constructor(scene: Core.MainScene.Scene, bulletsOrigin: BABYLON.Mesh) {
      var self = this;
      this.scene = scene;
      this.bulletsOrigin = bulletsOrigin;
      preloadAssets();
      createOriginalShot();
      createBulletTail();
      registerRenderer();

      this.triggerShot = () => {
        var bulletMesh = this.originalShotMesh.clone("shot" + this.bulletsCount++),
            newB: IBullet = {
              mesh: bulletMesh,
              particles: this.originalBulletTail.clone("bulletTail" + this.bulletsCount, bulletMesh),
              collidableLanes: [this.scene.spaceShipCurrentTrackLane]
            };
        newB.mesh.position = new BABYLON.Vector3(
          this.bulletsOrigin.position.x, this.bulletsOrigin.position.y + 4, this.bulletsOrigin.position.z + 10);
        newB.particles.start();
        if (this.scene.spaceShipTransitionTrackLane !== undefined) {
          newB.collidableLanes.push(this.scene.spaceShipTransitionTrackLane);
        }
        this.currentBullets.push(newB);
      };

      function preloadAssets(): void {
        self.scene.assetsManager.addTextureTask("flare", "/assets/flare.png");
      }

      function registerRenderer(): void {
        self.scene.scene.registerBeforeRender((): void => {
          var bulletsSpeed = self.scene.spaceShip.speed * 2;
          self.currentBullets.forEach((bullet: IBullet) => {
            if (bullet.mesh.position.z - self.bulletsOrigin.position.z > 700) {
              removeBullet(bullet);
            } else {
              var collidableRocks = self.scene.rockGenerator.getRocksAtLanes(bullet.collidableLanes);
              collidableRocks.some((rock: Core.MainScene.IRock) => {
                if (rock.mesh.isVisible && bullet.mesh.intersectsMesh(rock.mesh, false)) {
                  self.scene.rockGenerator.explodeRock(rock);
                  removeBullet(bullet);
                  return true;
                }
              });
            }
            bullet.mesh.position.z += bulletsSpeed;
          });
        });
      }

      function createOriginalShot(): void {
        self.originalShotMesh = BABYLON.Mesh.CreateSphere("originalShot", 1, 9, self.scene.scene, true);
        self.originalShotMesh.renderingGroupId = 2;
        self.originalShotMesh.isVisible = false;
      }

      function createBulletTail(): void {
        self.originalBulletTail = new BABYLON.ParticleSystem("originalBulletTail", 500, self.scene.scene);
        self.originalBulletTail.renderingGroupId = 2;
        self.originalBulletTail.particleTexture = new BABYLON.Texture("/assets/flare.png", self.scene.scene);
        self.originalBulletTail.minEmitBox = new BABYLON.Vector3(0, 0, 0);
        self.originalBulletTail.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
        self.originalBulletTail.direction1 = new BABYLON.Vector3(0, 0, 0);
        self.originalBulletTail.direction2 = new BABYLON.Vector3(0, 0, 0);
        self.originalBulletTail.gravity = new BABYLON.Vector3(0, 0, 0);
        self.originalBulletTail.color1 = new BABYLON.Color4(0.8, 0.5, 0, 1.0);
        self.originalBulletTail.color2 = new BABYLON.Color4(1, 0.5, 0, 1.0);
        self.originalBulletTail.colorDead = new BABYLON.Color4(1, 0, 0, 0.0);
        self.originalBulletTail.minSize = 2;
        self.originalBulletTail.maxSize = 6;
        self.originalBulletTail.minLifeTime = 0.04;
        self.originalBulletTail.maxLifeTime = 0.1;
        self.originalBulletTail.emitRate = 500;
        self.originalBulletTail.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        self.originalBulletTail.minAngularSpeed = 0;
        self.originalBulletTail.maxAngularSpeed = Math.PI;
        self.originalBulletTail.minEmitPower = 0.1;
        self.originalBulletTail.maxEmitPower = 1;
        self.originalBulletTail.updateSpeed = 0.006;
        self.originalBulletTail.disposeOnStop = true;
      }

      function removeBullet(bullet: IBullet): void {
        bullet.particles.stop();
        var bulletIndex = self.currentBullets.indexOf(bullet);
        if (bulletIndex !== -1) {
          self.currentBullets.splice(bulletIndex, 1);
        }
        self.scene.scene._toBeDisposed.push(bullet.mesh);
      }

    }
  }
}

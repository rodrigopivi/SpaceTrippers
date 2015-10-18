module Core.MainScene {

  export interface IMeteorite {
    id: string;
    mesh: BABYLON.Mesh;
    smokeTail: BABYLON.ParticleSystem;
    fireTail: BABYLON.ParticleSystem;
    direction: BABYLON.Vector3;
  }

  export class MeteoriteGenerator {
    private scene: Core.MainScene.Scene;

    private originalMeteorite: BABYLON.Mesh;
    private meteoriteMaterial: BABYLON.StandardMaterial;
    private originalSmokeTail: BABYLON.ParticleSystem;
    private originalFireTail: BABYLON.ParticleSystem;
    private currentMeteorites: IMeteorite[] = [];
    private meteoritesCount: number = 0;

    public recursiveMeteoritesCreation: (meteoriteTarget: BABYLON.Mesh) => void;

    constructor(scene: Core.MainScene.Scene) {
      var self = this;
      this.scene = scene;
      preloadAssets();
      createMeteoriteMaterial();
      createOriginalMeteorite();
      createOriginalSmokeTail();
      createOriginalFireTail();
      registerRenderer();

      this.recursiveMeteoritesCreation = (meteoriteTarget: BABYLON.Mesh) => {
        if (Core.Game.hasStarted && !Core.Game.isPaused && this.currentMeteorites.length < 10) {
          addMeteorite(meteoriteTarget);
        }
        setTimeout(() => { this.recursiveMeteoritesCreation(meteoriteTarget); }, Core.Utilities.getRandomInRange(500, 2000));
      };

      function preloadAssets(): void {
        self.scene.assetsManager.addTextureTask("meteoriteDTxt", "/assets/meteoriteDiffuseTexture.jpg");
        self.scene.assetsManager.addTextureTask("meteoriteBTxt", "/assets/meteoriteBumpTexture.png");
        self.scene.assetsManager.addTextureTask("flare", "/assets/flare.png");
      }

      function registerRenderer(): void {
        self.scene.scene.registerBeforeRender((): void => {
          self.currentMeteorites.forEach((meteor: IMeteorite, index: number) => {
            meteor.mesh.position.addInPlace(
              new BABYLON.Vector3(meteor.direction.x * -0.009, meteor.direction.y * -0.009, meteor.direction.z * -0.009));
            if (self.scene.camera.position.z > meteor.mesh.position.z) {
              self.scene.scene._toBeDisposed.push(meteor.mesh);
              self.currentMeteorites.splice(index, 1);
            }
          });
        });
      }

      function createMeteoriteMaterial(): void {
        self.meteoriteMaterial = new BABYLON.StandardMaterial("meteoriteTexture", self.scene.scene);
        self.meteoriteMaterial.diffuseTexture = new BABYLON.Texture("/assets/meteoriteDiffuseTexture.jpg", self.scene.scene);
        self.meteoriteMaterial.backFaceCulling = true;
        self.meteoriteMaterial.bumpTexture = new BABYLON.Texture("/assets/meteoriteBumpTexture.png", self.scene.scene);
      }

      function createOriginalMeteorite(): void {
        self.originalMeteorite = BABYLON.Mesh.CreateSphere("originalMeteorite", 1, 6, self.scene.scene);
        self.originalMeteorite.material = self.meteoriteMaterial;
        self.originalMeteorite.renderingGroupId = 2;
        self.originalMeteorite.isVisible = false;
      }

      function meteoriteIndexById(meteorId: string): number {
        var mIndex = -1;
        self.currentMeteorites.some((meteor: any, index: number) => {
          if (meteor.id === meteorId) {
            mIndex = index;
            return true;
          }
        });
        return mIndex;
      }

      function createOriginalSmokeTail(): void {
        var meteorSmokeTail = new BABYLON.ParticleSystem("smokeTail", 300, self.scene.scene);
        meteorSmokeTail.renderingGroupId = 2;
        meteorSmokeTail.particleTexture = new BABYLON.Texture("/assets/flare.png", self.scene.scene);
        meteorSmokeTail.minEmitBox = new BABYLON.Vector3(0, 0, 1);
        meteorSmokeTail.maxEmitBox = new BABYLON.Vector3(0, 0, 1);
        meteorSmokeTail.gravity = new BABYLON.Vector3(0, 0, 0);
        meteorSmokeTail.color1 = new BABYLON.Color4(0.1, 0.1, 0.1, 1.0);
        meteorSmokeTail.color2 = new BABYLON.Color4(0.1, 0.1, 0.1, 1.0);
        meteorSmokeTail.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
        meteorSmokeTail.minSize = 7;
        meteorSmokeTail.maxSize = 7;
        meteorSmokeTail.minLifeTime = 0.06;
        meteorSmokeTail.maxLifeTime = 0.3;
        meteorSmokeTail.emitRate = 400;
        meteorSmokeTail.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        meteorSmokeTail.minAngularSpeed = 0;
        meteorSmokeTail.maxAngularSpeed = Math.PI;
        meteorSmokeTail.minEmitPower = 0.1;
        meteorSmokeTail.maxEmitPower = 1;
        meteorSmokeTail.updateSpeed = 0.006;
        meteorSmokeTail.disposeOnStop = false;
        self.originalSmokeTail = meteorSmokeTail;
      }

      function createOriginalFireTail(): void {
        var meteorFireTail = new BABYLON.ParticleSystem("fireTail", 300, self.scene.scene);
        meteorFireTail.renderingGroupId = 2;
        meteorFireTail.particleTexture = new BABYLON.Texture("/assets/flare.png", self.scene.scene);
        meteorFireTail.minEmitBox = new BABYLON.Vector3(0, 0, 1);
        meteorFireTail.maxEmitBox = new BABYLON.Vector3(0, 0, 1);
        meteorFireTail.gravity = new BABYLON.Vector3(0, 0, 0);
        meteorFireTail.color1 = new BABYLON.Color4(0.8, 0.5, 1, 1.0);
        meteorFireTail.color2 = new BABYLON.Color4(1, 0, 0, 1.0);
        meteorFireTail.colorDead = new BABYLON.Color4(1, 0, 0, 0.0);
        meteorFireTail.minSize = 7;
        meteorFireTail.maxSize = 7;
        meteorFireTail.minLifeTime = 0.04;
        meteorFireTail.maxLifeTime = 0.08;
        meteorFireTail.emitRate = 400;
        meteorFireTail.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        meteorFireTail.minAngularSpeed = 0;
        meteorFireTail.maxAngularSpeed = Math.PI;
        meteorFireTail.minEmitPower = 0.1;
        meteorFireTail.maxEmitPower = 1;
        meteorFireTail.updateSpeed = 0.006;
        meteorFireTail.disposeOnStop = false;
        self.originalFireTail = meteorFireTail;
      }

      function addMeteorite(meteoriteTarget: BABYLON.Mesh): void {
        var meteorId = "meteor-" + self.meteoritesCount++;
        var targetPosition = meteoriteTarget.position.clone();
        targetPosition.z += Core.Utilities.getRandomInRange(105, 135) * self.scene.spaceShip.speed;
        var meteor = self.originalMeteorite.clone(meteorId);
        meteor.isVisible = true;
        meteor.renderingGroupId = 2;
        if (Core.Utilities.getRandomInRange(1, 2) === 1) {
          meteor.position.x = Core.Utilities.getRandomInRange(
            self.scene.track.roadBlocks.lanesPositionX[0] - 500,
            self.scene.track.roadBlocks.lanesPositionX[0] - 100);
        } else {
          meteor.position.x = Core.Utilities.getRandomInRange(
            self.scene.track.roadBlocks.lanesPositionX[self.scene.track.roadBlocks.lanesPositionX.length - 1] + 100,
            self.scene.track.roadBlocks.lanesPositionX[self.scene.track.roadBlocks.lanesPositionX.length - 1] + 500);
        }
        meteor.position.y = targetPosition.y + Core.Utilities.getRandomInRange(10, 60);
        meteor.position.z = targetPosition.z + 1000;
        var direction = meteor.position.subtract(targetPosition);
        var newMeteorSmokeTail = self.originalSmokeTail.clone("smoke-" + meteorId, meteor);
        newMeteorSmokeTail.direction1 = direction;
        newMeteorSmokeTail.direction2 = direction;
        newMeteorSmokeTail.disposeOnStop = true;
        newMeteorSmokeTail.start();
        var newMeteorFireTail = self.originalFireTail.clone("fire-" + meteorId, meteor);
        newMeteorFireTail.direction1 = direction;
        newMeteorFireTail.direction2 = direction;
        newMeteorFireTail.disposeOnStop = true;
        newMeteorFireTail.start();
        var meteoriteObj = <IMeteorite>{
          id: meteorId,
          mesh: meteor,
          smokeTail: self.originalSmokeTail,
          fireTail: self.originalFireTail,
          targetPosition: targetPosition,
          direction: direction
        };
        self.currentMeteorites.push(meteoriteObj);
        // Important: this is more performant here than at registerRenderer()
        meteoriteObj.mesh.registerBeforeRender(() => {
          if (meteoriteObj.mesh.intersectsMesh(meteoriteTarget, false)) {
            meteoriteObj.mesh.isVisible = false;
            meteoriteObj.fireTail.stop();
            meteoriteObj.smokeTail.stop();
            self.scene.spaceShip.explode(undefined, undefined, 30);
            self.scene.scene._toBeDisposed.push(meteoriteObj.mesh);
            self.currentMeteorites.splice(meteoriteIndexById(meteoriteObj.id), 1);
          }
        });
      }

    }
  }
}

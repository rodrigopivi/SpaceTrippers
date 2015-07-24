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
    private targetObject: BABYLON.Mesh;
    private originalMeteorite: BABYLON.Mesh;
    private currentMeteorites: IMeteorite[] = [];
    private meteoriteIndexById: (meteorIndex: string) => number;

    private meteoriteMaterial: BABYLON.StandardMaterial;

    public addMeteorite: () => void;
    public recursiveMeteoritesCreation: () => void;

    constructor(scene: Core.MainScene.Scene, targetObject: BABYLON.Mesh) {
      this.scene = scene;
      this.targetObject = targetObject;

      this.meteoriteMaterial = new BABYLON.StandardMaterial("meteoriteTexture", this.scene.scene);
      this.meteoriteMaterial.diffuseTexture = new BABYLON.Texture("/assets/meteoriteDiffuseTexture.jpg", this.scene.scene);
      this.meteoriteMaterial.backFaceCulling = false;
      this.meteoriteMaterial.bumpTexture = new BABYLON.Texture("/assets/meteoriteBumpTexture.png", this.scene.scene);

      this.originalMeteorite = BABYLON.Mesh.CreateSphere("originalMeteorite", 1, 6, this.scene.scene);
      this.originalMeteorite.material = this.meteoriteMaterial;
      this.originalMeteorite.renderingGroupId = 2;
      this.originalMeteorite.isVisible = false;

      this.meteoriteIndexById = (meteorIndex: string): number => {
        var mIndex = -1;
        this.currentMeteorites.some((meteor: any, index: number) => {
          var found = false;
          if (meteor.id === meteorIndex) {
            mIndex = index;
            found = true;
          }
          return found;
        });
        return mIndex;
      };

      var meteorSmokeTail = new BABYLON.ParticleSystem("smokeTail", 300, this.scene.scene);
      meteorSmokeTail.renderingGroupId = 2;
      meteorSmokeTail.particleTexture = new BABYLON.Texture("/assets/flare.png", this.scene.scene);
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

      var meteorFireTail = new BABYLON.ParticleSystem("fireTail", 300, this.scene.scene);
      meteorFireTail.renderingGroupId = 2;
      meteorFireTail.particleTexture = new BABYLON.Texture("/assets/flare.png", this.scene.scene);
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

      this.addMeteorite = () => {
        var meteorId = "meteor-" + Math.random().toString(36).substring(7);
        var targetPosition = this.targetObject.position.clone();
        targetPosition.z += Core.Utilities.getRandomInRange(105, 135) * this.scene.spaceShip.speed;

        var meteor = this.originalMeteorite.clone(meteorId);
        meteor.isVisible = true;
        meteor.renderingGroupId = 2;
        meteor.position.x = Core.Utilities.getRandomInRange(1, 2) === 1
          ? Core.Utilities.getRandomInRange(this.scene.track.rows.lanesPositionX[0] - 500, this.scene.track.rows.lanesPositionX[0] - 100)
          : Core.Utilities.getRandomInRange(this.scene.track.rows.lanesPositionX[this.scene.track.rows.lanesPositionX.length - 1] + 100, this.scene.track.rows.lanesPositionX[this.scene.track.rows.lanesPositionX.length - 1] + 500);
        meteor.position.y = this.targetObject.position.y + Core.Utilities.getRandomInRange(20, 50);
        meteor.position.z = this.targetObject.position.z + 1000;
        var direction = meteor.position.subtract(targetPosition);

        var newMeteorSmokeTail = meteorSmokeTail.clone("smoke-" + meteorId, meteor);
        newMeteorSmokeTail.direction1 = direction;
        newMeteorSmokeTail.direction2 = direction;
        newMeteorSmokeTail.disposeOnStop = true;
        newMeteorSmokeTail.start();

        var newMeteorFireTail = meteorFireTail.clone("fire-" + meteorId, meteor);
        newMeteorFireTail.direction1 = direction;
        newMeteorFireTail.direction2 = direction;
        newMeteorFireTail.disposeOnStop = true;
        newMeteorFireTail.start();

        var meteoriteObj = <IMeteorite>{
          id: meteorId,
          mesh: meteor,
          smokeTail: meteorSmokeTail,
          fireTail: meteorFireTail,
          targetPosition: targetPosition,
          direction: direction
        };
        this.currentMeteorites.push(meteoriteObj);

        meteoriteObj.mesh.registerBeforeRender(() => {
          if (meteoriteObj.mesh.intersectsMesh(this.targetObject, false)) {
            meteoriteObj.mesh.isVisible = false;
            meteoriteObj.fireTail.stop();
            meteoriteObj.smokeTail.stop();

            this.scene.spaceShip.explode();
            this.scene.scene._toBeDisposed.push(meteoriteObj.mesh);
            this.currentMeteorites.splice(this.meteoriteIndexById(meteoriteObj.id), 1);
          }
        });
      };

      this.recursiveMeteoritesCreation = () => {
        if (Core.Game.isEngineLoopRunning && this.currentMeteorites.length < 10) {
          this.addMeteorite();
        }
        setTimeout(() => { this.recursiveMeteoritesCreation(); }, Core.Utilities.getRandomInRange(500, 2000));
      };

      this.scene.scene.registerBeforeRender((): void => {
        if (this.currentMeteorites.length) {
          this.currentMeteorites.forEach((meteor: IMeteorite, index: number) => {
            if (meteor.mesh && meteor.mesh.position.z < this.targetObject.position.z - 90) {
              this.scene.scene._toBeDisposed.push(meteor.mesh);
              this.currentMeteorites.splice(index, 1);
            } else {
              var newPosition = new BABYLON.Vector3(
                meteor.direction.x * -0.009,
                meteor.direction.y * -0.009,
                meteor.direction.z * -0.009
                );
              meteor.mesh.position.addInPlace(newPosition);
            }
          });
        }
      });
    }
  }
}

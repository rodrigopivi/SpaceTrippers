module Core.MainScene {

  export class SpaceShip {
    private assetsManager: BABYLON.AssetsManager;

    private scene: Core.MainScene.Scene;

    private createPropulsionAnimation: () => void;
    private moveUpAnimation: BABYLON.Animation;
    private moveDownAnimation: BABYLON.Animation;
    private moveXAnimation: BABYLON.Animation;

    private bulletTrigger: Core.MainScene.BulletTrigger;
    private jumpCount: number = 0;

    public speed: number = 5;
    public isXMoving: boolean = false;
    public triggerShot: () => void;
    public moveUp: (animationEndCallback?: () => void) => void;
    public moveDown: (animationEndCallback?: () => void) => void;
    public spaceShipMesh: BABYLON.Mesh;
    public moveShipMeshToLane: (newLane: number, animationEndCallback: () => void) => void;
    public explode: (afterDispose?: () => void) => void;

    constructor(scene: Scene, assetsManager: BABYLON.AssetsManager, afterLoadedCallback: (spaceShipMesh: BABYLON.AbstractMesh) => void) {
      this.scene = scene;
      this.assetsManager = assetsManager;
      var spaceShipMeskLoaderTask = assetsManager.addMeshTask("SpaceShip", "", "/assets/meshes/spaceShip/", "spaceShip.babylon");

      this.moveUp = (animationEndCallback?: () => void): void => {
        if (!this.moveDownAnimation && !this.moveUpAnimation && this.jumpCount < 1) {
          this.jumpCount++;
          var easingFunction = new BABYLON.QuadraticEase;
          this.moveUpAnimation = new BABYLON.Animation("jumpSpaceshipAnimation", "position.y", 160, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
          this.moveUpAnimation.setKeys([
            { frame: 0, value: this.spaceShipMesh.position.y },
            { frame: 40, value: this.spaceShipMesh.position.y + 40 }
          ]);
          easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
          this.moveUpAnimation.setEasingFunction(easingFunction);
          Core.Audio.playSoundFromAudioLib("move");
          this.scene.scene.beginDirectAnimation(this.spaceShipMesh, [this.moveUpAnimation], 0, 160, false, 1, (): void => {
            this.moveUpAnimation = undefined;
            if (animationEndCallback) { animationEndCallback(); }
          });
        }
      };

      this.moveDown = (animationEndCallback?: () => void): void => {
        if (!this.moveUpAnimation && !this.moveDownAnimation && this.jumpCount > 0) {
          this.jumpCount--;
          var easingFunction = new BABYLON.QuadraticEase;
          this.moveDownAnimation = new BABYLON.Animation("jumpSpaceshipAnimation", "position.y", 160, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
          this.moveDownAnimation.setKeys([
            { frame: 0, value: this.spaceShipMesh.position.y },
            { frame: 40, value: this.spaceShipMesh.position.y - 40 }
          ]);
          easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
          this.moveDownAnimation.setEasingFunction(easingFunction);
          Core.Audio.playSoundFromAudioLib("move");
          this.scene.scene.beginDirectAnimation(this.spaceShipMesh, [this.moveDownAnimation], 0, 160, false, 1, (): void => {
            this.moveDownAnimation = undefined;
            if (animationEndCallback) { animationEndCallback(); };
          });
        }
      };

      this.moveShipMeshToLane = (newLane: number, animationEndCallback: () => void) => {
        if (!this.isXMoving) {
          this.isXMoving = true;
          var easingFunction = new BABYLON.PowerEase();
          this.moveXAnimation = new BABYLON.Animation("moveSpaceshipAnimation", "position.x", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
          this.moveXAnimation.setKeys([
            { frame: 0, value: this.spaceShipMesh.position.x },
            { frame: 15, value: this.scene.track.rows.lanesPositionX[newLane] }
          ]);
          easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
          this.moveXAnimation.setEasingFunction(easingFunction);
          Core.Audio.playSoundFromAudioLib("move");
          this.scene.scene.beginDirectAnimation(this.spaceShipMesh, [this.moveXAnimation], 0, 15, false, 1, (): void => {
            this.isXMoving = false;
            this.moveXAnimation = undefined;
            if (animationEndCallback) { animationEndCallback(); }
          });
        }
      };

      this.createPropulsionAnimation = (): void => {
        var particles = new BABYLON.ParticleSystem("shipPropulsion", 400, this.scene.scene);
        particles.renderingGroupId = 2;
        particles.particleTexture = new BABYLON.Texture("/assets/star.png", this.scene.scene);
        particles.emitter = this.spaceShipMesh;
        particles.minEmitBox = new BABYLON.Vector3(0, -15, 3);
        particles.maxEmitBox = new BABYLON.Vector3(0, -15, 3);
        particles.direction1 = new BABYLON.Vector3(-.3, -1, -1);
        particles.direction2 = new BABYLON.Vector3(-.3, -1, -1);
        particles.gravity = new BABYLON.Vector3(0, -.05, 0);
        particles.color1 = new BABYLON.Color4(1, 0.5, 0.8, 1);
        particles.color2 = new BABYLON.Color4(1, 0.5, 1, 1);
        particles.colorDead = new BABYLON.Color4(1, 0, 1, 0);
        particles.minSize = 3;
        particles.maxSize = 4;
        particles.minLifeTime = 0.01;
        particles.maxLifeTime = 0.04;
        particles.emitRate = 400;
        particles.minEmitPower = 2;
        particles.maxEmitPower = 2;
        particles.start();
      };

      this.triggerShot = (): void => {
        if (this.bulletTrigger) {
          this.bulletTrigger.triggerShot();
          Core.Audio.playSoundFromAudioLib("shoot");
        }
      };

      var texture = new BABYLON.Texture("/assets/flare.png", this.scene.scene);
      var hitExplosion = new BABYLON.ParticleSystem("hitExplosion", 900, this.scene.scene);
      hitExplosion.renderingGroupId = 2;
      hitExplosion.particleTexture = texture;
      hitExplosion.emitter = this.spaceShipMesh;
      hitExplosion.minEmitBox = new BABYLON.Vector3(0, 0, 0);
      hitExplosion.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
      hitExplosion.color1 = new BABYLON.Color4(0.5, 0.3, 0.1, 1);
      hitExplosion.color2 = new BABYLON.Color4(0.8, 0.1, 0.1, 1);
      hitExplosion.colorDead = new BABYLON.Color4(1, 0, 0, 0);
      hitExplosion.minSize = 10;
      hitExplosion.maxSize = 13;
      hitExplosion.minLifeTime = 1;
      hitExplosion.maxLifeTime = 1;
      hitExplosion.emitRate = 900;
      hitExplosion.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
      hitExplosion.gravity = new BABYLON.Vector3(0, 0, 0);
      hitExplosion.direction1 = new BABYLON.Vector3(-30, 0, -30);
      hitExplosion.direction2 = new BABYLON.Vector3(30, 30, 30);
      hitExplosion.minAngularSpeed = 0;
      hitExplosion.maxAngularSpeed = Math.PI;
      hitExplosion.minEmitPower = 1;
      hitExplosion.maxEmitPower = 10;
      hitExplosion.updateSpeed = 0.005;
      hitExplosion.targetStopDuration = 0.05;
      hitExplosion.disposeOnStop = true;
      this.explode = (afterDispose?: () => void): void => {
        var newExplosion = hitExplosion.clone("hitExplosionX", this.spaceShipMesh);
        Core.Audio.playSoundFromAudioLib("hit");
        newExplosion.start();
        if (afterDispose) {
          newExplosion.onDispose = () => { afterDispose(); };
        }
      };

      /* ============== Event listeners ============== */
      spaceShipMeskLoaderTask.onSuccess = (task: BABYLON.MeshAssetTask) => {
        this.spaceShipMesh = <BABYLON.Mesh>task.loadedMeshes[0];
        // this.spaceShipMesh.rotate(BABYLON.Axis.X, Math.PI, BABYLON.Space.LOCAL);
        // this.spaceShipMesh.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);
        // this.spaceShipMesh.rotate(BABYLON.Axis.Z, Math.PI, BABYLON.Space.LOCAL);

        this.createPropulsionAnimation();
        this.bulletTrigger = new BulletTrigger(this.scene, this.spaceShipMesh);

        afterLoadedCallback(this.spaceShipMesh);
      };
    }
  }
}

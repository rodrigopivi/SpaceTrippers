module Core.MainScene {

    export interface IBullet {
        mesh: BABYLON.Mesh;
        particles: BABYLON.ParticleSystem;
        collidableLanes: number[];
    }

    export class BulletTrigger {
        private scene: Core.MainScene.Scene;
        private bulletsOrigin: BABYLON.Mesh;
        private currentBullets: IBullet[] = [];
        private bulletsCount: number = 0;

        private removeBullet: (bullet: IBullet) => void;

        public triggerShot: () => void;

        constructor(scene: Core.MainScene.Scene, bulletsOrigin: BABYLON.Mesh) {
            this.scene = scene;
            this.bulletsOrigin = bulletsOrigin;
            var originalShotMesh = BABYLON.Mesh.CreateSphere("originalShot", 5, 11, this.scene.scene, true);
            originalShotMesh.renderingGroupId = 2;
            originalShotMesh.isVisible = false;
            var originalBulletTail = new BABYLON.ParticleSystem("originalBulletTail", 500, this.scene.scene);
            originalBulletTail.renderingGroupId = 2;
            originalBulletTail.particleTexture = new BABYLON.Texture("/assets/flare.png", this.scene.scene);
            originalBulletTail.minEmitBox = new BABYLON.Vector3(0, 0, 0);
            originalBulletTail.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
            originalBulletTail.direction1 = new BABYLON.Vector3(0, 0, 0);
            originalBulletTail.direction2 = new BABYLON.Vector3(0, 0, 0);
            originalBulletTail.gravity = new BABYLON.Vector3(0, 0, 0);
            originalBulletTail.color1 = new BABYLON.Color4(0.8, 0.5, 0, 1.0);
            originalBulletTail.color2 = new BABYLON.Color4(1, 0.5, 0, 1.0);
            originalBulletTail.colorDead = new BABYLON.Color4(1, 0, 0, 0.0);
            originalBulletTail.minSize = 2;
            originalBulletTail.maxSize = 6;
            originalBulletTail.minLifeTime = 0.04;
            originalBulletTail.maxLifeTime = 0.1;
            originalBulletTail.emitRate = 500;
            originalBulletTail.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
            originalBulletTail.minAngularSpeed = 0;
            originalBulletTail.maxAngularSpeed = Math.PI;
            originalBulletTail.minEmitPower = 0.1;
            originalBulletTail.maxEmitPower = 1;
            originalBulletTail.updateSpeed = 0.006;
            originalBulletTail.disposeOnStop = true;

            this.triggerShot = () => {
                this.bulletsCount++;
                var shot = originalShotMesh.clone("shot" + this.bulletsCount);
                shot.position = new BABYLON.Vector3(
                    this.bulletsOrigin.position.x,
                    this.bulletsOrigin.position.y + 4,
                    this.bulletsOrigin.position.z + 10);
                shot.isVisible = false;

                var bulletTail = originalBulletTail.clone("bulletTail" + this.bulletsCount, shot);
                bulletTail.start();

                var collidableLanes = [this.scene.spaceShipCurrentTrackLane];
                if (this.scene.spaceShipTransitionTrackLane !== undefined) {
                    collidableLanes.push(this.scene.spaceShipTransitionTrackLane);
                }

                var newBullet = <IBullet>{
                    mesh: shot,
                    particles: bulletTail,
                    collidableLanes: collidableLanes
                };

                this.currentBullets.push(newBullet);
            };

            this.removeBullet = (bullet: IBullet) => {
                bullet.particles.stop();
                var bulletIndex = this.currentBullets.indexOf(bullet);
                if (bulletIndex !== -1) {
                    this.currentBullets.splice(bulletIndex, 1);
                }
                this.scene.scene._toBeDisposed.push(bullet.mesh);
            };

            this.scene.scene.registerBeforeRender((): void => {
                if (this.currentBullets.length) {
                    this.currentBullets.forEach((bullet: IBullet) => {
                        if (bullet.mesh.position.z - this.bulletsOrigin.position.z > 700) {
                            this.removeBullet(bullet);
                        } else {
                            bullet.mesh.position.z += 5;
                        }

                        var collidableRocks = this.scene.rockGenerator.getRocksAtLanes(bullet.collidableLanes);
                        collidableRocks.some((rock: Core.MainScene.IRock) => {
                            var ret = false;
                            if (bullet.mesh.intersectsMesh(rock.mesh, false)) {
                                this.removeBullet(bullet);
                                this.scene.rockGenerator.explodeRock(rock);
                                ret = true;
                            }
                            return ret;
                        });

                    });
                }
            });

        }
    }
}

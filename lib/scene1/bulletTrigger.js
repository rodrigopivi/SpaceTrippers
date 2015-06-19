var Core;
(function (Core) {
    var Scene1;
    (function (Scene1) {
        var BulletTrigger = (function () {
            function BulletTrigger(scene, bulletsOrigin) {
                var _this = this;
                this.currentBullets = [];
                this.bulletsCount = 0;
                this.scene = scene;
                this.bulletsOrigin = bulletsOrigin;
                var originalShotMesh = BABYLON.Mesh.CreateSphere("originalShot", 5, 11, this.scene.scene, true);
                originalShotMesh.renderingGroupId = 2;
                //originalShotMesh.scaling = new BABYLON.Vector3(2, 2, 2);
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
                this.triggerShot = function () {
                    _this.bulletsCount++;
                    var shot = originalShotMesh.clone("shot" + _this.bulletsCount);
                    shot.position = new BABYLON.Vector3(_this.bulletsOrigin.position.x, _this.bulletsOrigin.position.y + 4, _this.bulletsOrigin.position.z + 10);
                    shot.isVisible = false;
                    var bulletTail = originalBulletTail.clone("bulletTail" + _this.bulletsCount, shot);
                    bulletTail.start();
                    var collidableLanes = [_this.scene.spaceShipCurrentTrackLane];
                    if (_this.scene.spaceShipTransitionTrackLane !== undefined) {
                        collidableLanes.push(_this.scene.spaceShipTransitionTrackLane);
                    }
                    var newBullet = {
                        mesh: shot,
                        particles: bulletTail,
                        collidableLanes: collidableLanes
                    };
                    _this.currentBullets.push(newBullet);
                };
                this.removeBullet = function (bullet) {
                    bullet.particles.stop();
                    var bulletIndex = _this.currentBullets.indexOf(bullet);
                    if (bulletIndex !== -1) {
                        _this.currentBullets.splice(bulletIndex, 1);
                    }
                    _this.scene.scene._toBeDisposed.push(bullet.mesh);
                };
                this.scene.scene.registerBeforeRender(function () {
                    if (_this.currentBullets.length) {
                        _this.currentBullets.forEach(function (bullet) {
                            if (bullet.mesh.position.z - _this.bulletsOrigin.position.z > 700) {
                                _this.removeBullet(bullet);
                            }
                            else {
                                bullet.mesh.position.z += 5;
                            }
                            var collidableRocks = _this.scene.rockGenerator.getRocksAtLanes(bullet.collidableLanes);
                            collidableRocks.some(function (rock) {
                                var ret = false;
                                if (bullet.mesh.intersectsMesh(rock.mesh, false)) {
                                    _this.removeBullet(bullet);
                                    _this.scene.rockGenerator.explodeRock(rock);
                                    ret = true;
                                }
                                return ret;
                            });
                        });
                    }
                });
            }
            return BulletTrigger;
        })();
        Scene1.BulletTrigger = BulletTrigger;
    })(Scene1 = Core.Scene1 || (Core.Scene1 = {}));
})(Core || (Core = {}));
//# sourceMappingURL=bulletTrigger.js.map
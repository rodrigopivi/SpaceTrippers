var Core;
(function (Core) {
    var Scene1;
    (function (Scene1) {
        var SpaceShip = (function () {
            function SpaceShip(scene, assetsManager, afterLoadedCallback) {
                var _this = this;
                this.jumpCount = 0;
                this.isXMoving = false;
                this.scene = scene;
                this.assetsManager = assetsManager;
                var spaceShipMeskLoaderTask = assetsManager.addMeshTask("SpaceShip", "", "/assets/", "navecita.babylon");
                this.moveUp = function (animationEndCallback) {
                    if (!_this.moveDownAnimation && !_this.moveUpAnimation && _this.jumpCount < 1) {
                        _this.jumpCount++;
                        var easingFunction = new BABYLON.QuadraticEase;
                        _this.moveUpAnimation = new BABYLON.Animation("jumpSpaceshipAnimation", "position.y", 160, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        _this.moveUpAnimation.setKeys([
                            { frame: 0, value: _this.spaceShipMesh.position.y },
                            { frame: 40, value: _this.spaceShipMesh.position.y + 40 }
                        ]);
                        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
                        _this.moveUpAnimation.setEasingFunction(easingFunction);
                        Core.playSoundFromAudioLib("move");
                        _this.scene.scene.beginDirectAnimation(_this.spaceShipMesh, [_this.moveUpAnimation], 0, 160, false, 1, function () {
                            _this.moveUpAnimation = undefined;
                            animationEndCallback && animationEndCallback();
                        });
                    }
                };
                this.moveDown = function (animationEndCallback) {
                    if (!_this.moveUpAnimation && !_this.moveDownAnimation && _this.jumpCount > 0) {
                        _this.jumpCount--;
                        var easingFunction = new BABYLON.QuadraticEase;
                        _this.moveDownAnimation = new BABYLON.Animation("jumpSpaceshipAnimation", "position.y", 160, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        _this.moveDownAnimation.setKeys([
                            { frame: 0, value: _this.spaceShipMesh.position.y },
                            { frame: 40, value: _this.spaceShipMesh.position.y - 40 }
                        ]);
                        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
                        _this.moveDownAnimation.setEasingFunction(easingFunction);
                        Core.playSoundFromAudioLib("move");
                        _this.scene.scene.beginDirectAnimation(_this.spaceShipMesh, [_this.moveDownAnimation], 0, 160, false, 1, function () {
                            _this.moveDownAnimation = undefined;
                            animationEndCallback && animationEndCallback();
                        });
                    }
                };
                this.moveShipMeshToLane = function (newLane, animationEndCallback) {
                    if (!_this.isXMoving) {
                        _this.isXMoving = true;
                        var easingFunction = new BABYLON.PowerEase();
                        _this.moveXAnimation = new BABYLON.Animation("moveSpaceshipAnimation", "position.x", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        _this.moveXAnimation.setKeys([
                            { frame: 0, value: _this.spaceShipMesh.position.x },
                            { frame: 15, value: _this.scene.track.rows.lanesPositionX[newLane] }
                        ]);
                        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
                        _this.moveXAnimation.setEasingFunction(easingFunction);
                        Core.playSoundFromAudioLib("move");
                        _this.scene.scene.beginDirectAnimation(_this.spaceShipMesh, [_this.moveXAnimation], 0, 15, false, 1, function () {
                            _this.isXMoving = false;
                            _this.moveXAnimation = undefined;
                            animationEndCallback && animationEndCallback();
                        });
                    }
                };
                this.createPropulsionAnimation = function () {
                    var particles = new BABYLON.ParticleSystem("shipPropulsion", 400, _this.scene.scene);
                    particles.renderingGroupId = 2;
                    particles.particleTexture = new BABYLON.Texture("/assets/star.png", _this.scene.scene);
                    particles.emitter = _this.spaceShipMesh;
                    particles.minEmitBox = new BABYLON.Vector3(0, -270, 50);
                    particles.maxEmitBox = new BABYLON.Vector3(0, -270, 50);
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
                this.triggerShot = function () {
                    if (_this.bulletTrigger) {
                        _this.bulletTrigger.triggerShot();
                        Core.playSoundFromAudioLib("shoot");
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
                hitExplosion.direction1 = new BABYLON.Vector3(-50, 0, -50);
                hitExplosion.direction2 = new BABYLON.Vector3(50, 50, 50);
                hitExplosion.minAngularSpeed = 0;
                hitExplosion.maxAngularSpeed = Math.PI;
                hitExplosion.minEmitPower = 1;
                hitExplosion.maxEmitPower = 100;
                hitExplosion.updateSpeed = 0.005;
                hitExplosion.targetStopDuration = 0.05;
                hitExplosion.disposeOnStop = true;
                //hitExplosion.start();
                this.explode = function (afterDispose) {
                    var newExplosion = hitExplosion.clone("hitExplosionX", _this.spaceShipMesh);
                    Core.playSoundFromAudioLib("hit");
                    newExplosion.start();
                    if (afterDispose) {
                        newExplosion.onDispose = function () {
                            afterDispose();
                        };
                    }
                };
                /* ============== Event listeners ============== */
                spaceShipMeskLoaderTask.onSuccess = function (task) {
                    _this.spaceShipMesh = task.loadedMeshes[0];
                    _this.spaceShipMesh.rotate(BABYLON.Axis.Z, Math.PI, BABYLON.Space.LOCAL);
                    _this.createPropulsionAnimation();
                    _this.bulletTrigger = new Scene1.BulletTrigger(_this.scene, _this.spaceShipMesh);
                    afterLoadedCallback(_this.spaceShipMesh);
                };
            }
            return SpaceShip;
        })();
        Scene1.SpaceShip = SpaceShip;
    })(Scene1 = Core.Scene1 || (Core.Scene1 = {}));
})(Core || (Core = {}));
//# sourceMappingURL=spaceShip.js.map
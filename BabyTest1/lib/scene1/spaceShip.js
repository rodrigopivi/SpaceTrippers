var Core;
(function (Core) {
    (function (Scene1) {
        var SpaceShip = (function () {
            function SpaceShip(scene, assetsManager, afterLoadedCallback) {
                var _this = this;
                this.name = "SpaceShip";
                this.filePath = "/assets/";
                this.fileName = "navecita.babylon";
                this.scene = scene;
                this.assetsManager = assetsManager;

                var spaceShipMeskLoaderTask = assetsManager.addMeshTask(this.name, "", this.filePath, this.fileName);

                // when loaded the space ship model
                spaceShipMeskLoaderTask.onSuccess = function (task) {
                    _this.spaceShipMesh = task.loadedMeshes[0];
                    _this.spaceShipMesh.rotate(BABYLON.Axis.Z, Math.PI, BABYLON.Space.LOCAL);
                    afterLoadedCallback(_this.spaceShipMesh);
                };

                this.moveShipMeshToPositionX = function (positionX, animationEndCallback) {
                    if (!_this.spaceShipMesh.animations.length) {
                        var animationIndex, easingFunction = new BABYLON.PowerEase(), moveSpaceshipAnimation = new BABYLON.Animation("moveSpaceshipAnimation", "position.x", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

                        moveSpaceshipAnimation.setKeys([
                            { frame: 0, value: _this.spaceShipMesh.position.x },
                            { frame: 25, value: positionX }
                        ]);
                        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
                        moveSpaceshipAnimation.setEasingFunction(easingFunction);
                        animationIndex = _this.spaceShipMesh.animations.push(moveSpaceshipAnimation) - 1;
                        _this.scene.beginAnimation(_this.spaceShipMesh, 0, 25, false, 1, function () {
                            _this.spaceShipMesh.animations.splice(animationIndex, 1);
                            if (animationEndCallback) {
                                animationEndCallback();
                            }
                        });
                    }
                };
            }
            return SpaceShip;
        })();
        Scene1.SpaceShip = SpaceShip;
    })(Core.Scene1 || (Core.Scene1 = {}));
    var Scene1 = Core.Scene1;
})(Core || (Core = {}));
//# sourceMappingURL=spaceShip.js.map

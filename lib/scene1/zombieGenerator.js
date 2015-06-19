var Core;
(function (Core) {
    var Scene1;
    (function (Scene1) {
        var RockGenerator = (function () {
            function RockGenerator(scene) {
                var _this = this;
                this.currentRocks = [];
                this.scene = scene;
                var getRandomInRange = function (min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                };
                var rockMaterial = new BABYLON.StandardMaterial("rockTexture", this.scene);
                //zombieMaterial.diffuseTexture = new BABYLON.Texture("/assets/vj2c.jpg", this.scene);
                rockMaterial.backFaceCulling = false; //Show all the faces of the element
                //zombieMaterial.bumpTexture = new BABYLON.Texture("/assets/sunTexture.png", this.scene);
                var rotateAnimation = new BABYLON.Animation("rockRotate", "rotation", 420, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                rotateAnimation.setKeys([
                    { frame: 0, value: new BABYLON.Vector3(0, 0, 0) },
                    { frame: 420, value: new BABYLON.Vector3(30, 0, 30) }
                ]);
                BABYLON.SceneLoader.ImportMesh("", "/assets/", "rockcandy.babylon", this.scene, function (newMeshes, particleSystems, skeletons) {
                    console.log(particleSystems, skeletons, newMeshes);
                    _this.originalRock = newMeshes[0];
                    //this.originalZombie.rotatePOV(40,10,30);
                    _this.originalRock.isVisible = false;
                    _this.originalRock.material = rockMaterial;
                });
                this.addRock = function (position) {
                    //var zombie: BABYLON.Mesh;
                    /* ============== Event listeners ============== */
                    //var newZombie = this.zombieMesh.clone("zombie:" + this.currentZombies.length);
                    if (_this.originalRock) {
                        var newRock = _this.originalRock.clone("zombieMesh:" + _this.currentRocks.length);
                        //newZombie.parent = this.originalZombie.parent;
                        _this.currentRocks.push(newRock);
                        newRock.scaling = new BABYLON.Vector3(newRock.scaling.x * 3.8, newRock.scaling.y * 3.8, newRock.scaling.z * 3.8);
                        newRock.position = position;
                        newRock.position.x -= 250;
                        newRock.renderingGroupId = 2;
                        newRock.isVisible = true;
                        newRock.registerBeforeRender(function (newR) {
                            newR.rotation.y += 0.02;
                            newR.rotation.x += 0.08;
                            newR.rotation.z += 0.01;
                            newR.position.x += 1;
                            newR.position.z -= 0.5;
                        });
                    }
                };
                this.disposeRocksBeforeZLimit = function (minimunZ) {
                    _this.currentRocks.forEach(function (zombie, index) {
                        if (minimunZ > zombie.position.z) {
                            _this.scene._toBeDisposed.push(zombie);
                            _this.currentRocks.splice(index, 1);
                        }
                        ;
                    });
                };
            }
            return RockGenerator;
        })();
        Scene1.RockGenerator = RockGenerator;
    })(Scene1 = Core.Scene1 || (Core.Scene1 = {}));
})(Core || (Core = {}));
//# sourceMappingURL=zombieGenerator.js.map
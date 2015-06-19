var Core;
(function (Core) {
    var Scene1;
    (function (Scene1) {
        var RockGenerator = (function () {
            function RockGenerator(scene, targetObject) {
                var _this = this;
                this.numberOfRocks = 21;
                this.currentRocks = [];
                this.scene = scene;
                this.targetObject = targetObject;
                this.rockIndexById = function (meteorIndex) {
                    var mIndex = -1;
                    _this.currentRocks.some(function (meteor, index) {
                        var found = false;
                        if (meteor.id === meteorIndex) {
                            mIndex = index;
                            found = true;
                        }
                        return found;
                    });
                    return mIndex;
                };
                this.getRocksAtLanes = function (lanes) {
                    return _this.currentRocks.filter(function (rock) {
                        return rock.mesh.isVisible && lanes.indexOf(rock.laneIndex) !== -1;
                    });
                };
                var rockMaterial = new BABYLON.StandardMaterial("rockTexture", this.scene.scene);
                rockMaterial.diffuseTexture = new BABYLON.Texture("/assets/rocktexture.jpg", this.scene.scene);
                rockMaterial.backFaceCulling = false;
                BABYLON.SceneLoader.ImportMesh("", "/assets/", "rockcandy.babylon", this.scene.scene, function (newMeshes) {
                    _this.originalRock = newMeshes[0];
                    _this.originalRock.isVisible = false;
                    _this.originalRock.material = rockMaterial;
                    _this.originalRock.receiveShadows = true;
                });
                var explosionSystem = new BABYLON.ParticleSystem("rockExplosion", 1000, this.scene.scene);
                explosionSystem.renderingGroupId = 2;
                explosionSystem.particleTexture = new BABYLON.Texture("/assets/flare.png", this.scene.scene);
                //explosionSystem.emitter = this.targetObject;
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
                explosionSystem.maxEmitPower = 100;
                explosionSystem.updateSpeed = 0.005;
                explosionSystem.targetStopDuration = 0.05;
                explosionSystem.disposeOnStop = true;
                this.explodeRock = function (rock) {
                    rock.mesh.isVisible = false;
                    Core.playSoundFromAudioLib("explosion");
                    var newExplosionSystem = explosionSystem.clone("nExplosion" + rock.id, rock.mesh);
                    newExplosionSystem.start();
                    newExplosionSystem.onDispose = function () {
                        _this.scene.scene._toBeDisposed.push(rock.mesh);
                        _this.removeRock(rock);
                    };
                };
                this.removeRock = function (rock) {
                    var shadowRenderListIndex = -1;
                    _this.scene.sharedShadowGenerator.getShadowMap().renderList.some(function (mesh, shadowIndex) {
                        var ret = false;
                        if (mesh.name === rock.id) {
                            shadowRenderListIndex = shadowIndex;
                            ret = true;
                        }
                        return ret;
                    });
                    if (shadowRenderListIndex !== -1) {
                        _this.scene.sharedShadowGenerator.getShadowMap().renderList.splice(shadowRenderListIndex, 1);
                    }
                    _this.scene.scene._toBeDisposed.push(rock.mesh);
                    _this.currentRocks.splice(_this.rockIndexById(rock.id), 1);
                    _this.recursiveRocksCreation();
                };
                this.recursiveRocksCreation = function () {
                    if (_this.currentRocks.length < _this.numberOfRocks) {
                        setTimeout(function () {
                            _this.addRock();
                            _this.recursiveRocksCreation();
                        }, Core.getRandomInRange(2000, 4000));
                    }
                };
                this.addRock = function () {
                    if (_this.originalRock) {
                        var id = "rockMesh:" + _this.currentRocks.length;
                        var laneIndex = Core.getRandomInRange(0, _this.scene.track.rows.lanesPositionX.length - 1);
                        var newRock = {
                            id: id,
                            mesh: _this.originalRock.clone(id),
                            scale: Core.getRandomInRange(3, 4),
                            speed: Core.getRandomInRange(2, 4) * 0.1 + 1,
                            rotation: new BABYLON.Vector3(Core.getRandomInRange(-1, 1) * 0.01, Core.getRandomInRange(-1, 1) * 0.01, Core.getRandomInRange(-1, 1) * 0.01),
                            isTransparent: false,
                            laneIndex: laneIndex
                        };
                        _this.scene.sharedShadowGenerator.getShadowMap().renderList.push(newRock.mesh);
                        _this.currentRocks.push(newRock);
                        newRock.mesh.scaling = new BABYLON.Vector3(newRock.mesh.scaling.x * newRock.scale, newRock.mesh.scaling.y * newRock.scale, newRock.mesh.scaling.z * newRock.scale);
                        var vectorsWorld = newRock.mesh.getBoundingInfo().boundingBox.vectorsWorld; // summits of the bounding box
                        var newRockHeight = vectorsWorld[1].subtract(vectorsWorld[0]).length();
                        newRock.mesh.position = new BABYLON.Vector3(_this.scene.track.rows.lanesPositionX[laneIndex], 3 + newRockHeight, _this.scene.track.rows.nextBlockPositionZ);
                        newRock.mesh.renderingGroupId = 2;
                        newRock.mesh.isVisible = true;
                        // this render loop runs only when the rock is viewable
                        newRock.mesh.registerBeforeRender(function (newR) {
                            newR.rotation.y += newRock.rotation.y;
                            newR.rotation.x += newRock.rotation.x;
                            newR.rotation.z += newRock.rotation.z;
                            newR.position.z += newRock.speed;
                            var sinusoidalYPosition = 24 + (7 + newRock.scale) * Math.sin(newR.position.z / (55 + newRock.speed));
                            if (sinusoidalYPosition - newRockHeight / 2 > 3) {
                                newR.position.y = sinusoidalYPosition;
                            }
                            if (!newRock.isTransparent && _this.scene.spaceShip.spaceShipMesh.position.z - 25 > newR.position.z && _this.scene.spaceShipCurrentTrackLane === newRock.laneIndex) {
                                newRock.isTransparent = true;
                                newR.visibility -= 0.03;
                            }
                            else if (newRock.isTransparent && newR.visibility > 0.4) {
                                newR.visibility -= 0.03;
                            }
                            if ((_this.scene.spaceShipCurrentTrackLane === newRock.laneIndex || _this.scene.spaceShipTransitionTrackLane === newRock.laneIndex) && newR.intersectsMesh(_this.targetObject, false)) {
                                _this.explodeRock(newRock);
                                _this.scene.spaceShip.explode();
                            }
                        });
                    }
                };
                // rocks destroyer
                this.scene.scene.registerBeforeRender(function () {
                    _this.currentRocks.forEach(function (aRock) {
                        if (_this.scene.camera.position.z > aRock.mesh.position.z) {
                            _this.removeRock(aRock);
                        }
                    });
                });
            }
            return RockGenerator;
        })();
        Scene1.RockGenerator = RockGenerator;
    })(Scene1 = Core.Scene1 || (Core.Scene1 = {}));
})(Core || (Core = {}));
//# sourceMappingURL=rockGenerator.js.map
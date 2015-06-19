///<reference path="spaceShip.ts"/>
///<reference path="track.ts"/>
///<reference path="bulletTrigger.ts"/>
///<reference path="meteoriteGenerator.ts"/>
///<reference path="rockGenerator.ts"/>
var Core;
(function (Core) {
    var Scene1;
    (function (Scene1) {
        var Scene = (function () {
            function Scene(canvas, engine) {
                var _this = this;
                this.canvas = canvas;
                this.engine = engine;
                var onKeyDownHandler, onKeyUpHandler;
                this.scene = new BABYLON.Scene(engine);
                this.assetsManager = new BABYLON.AssetsManager(this.scene);
                this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
                this.scene.fogDensity = 0.0019;
                this.scene.fogColor = new BABYLON.Color3(0, 0, 0);
                this.scene.clearColor = new BABYLON.Color3(0.5, 1, 0.5);
                this.scene.ambientColor = new BABYLON.Color3(1, 0.3, 0.3);
                /*
                this.sharedLight = new BABYLON.DirectionalLight("SharedLight", new BABYLON.Vector3(0, -1, 1), this.scene);
                this.sharedLight.position = new BABYLON.Vector3(0, 80, -20);
                this.sharedShadowGenerator = new BABYLON.ShadowGenerator(1024, <any>this.sharedLight);
                this.sharedShadowGenerator.usePoissonSampling = true;
                */
                this.light = new BABYLON.SpotLight("RocksSpotLight", new BABYLON.Vector3(0, 190, -140), new BABYLON.Vector3(0, -1, 1), 2, 1, this.scene);
                this.light.intensity = 1.3;
                this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.light);
                this.shadowGenerator.usePoissonSampling = true;
                //this.light = this.sharedLight;
                //this.shadowGenerator = this.sharedShadowGenerator;
                this.sharedLight = this.light;
                this.sharedShadowGenerator = this.shadowGenerator;
                this.crateFollowCam = function () {
                    _this.camera = new BABYLON.FollowCamera("FollowCam", BABYLON.Vector3.Zero(), _this.scene);
                    _this.camera.radius = 80;
                    _this.camera.heightOffset = 25;
                    _this.camera.rotationOffset = 0;
                    _this.camera.cameraAcceleration = 0.05;
                    _this.camera.maxCameraSpeed = 20;
                    _this.camera.inertia = 0.5;
                    _this.camera.target = _this.spaceShip.spaceShipMesh;
                };
                var backgroundImageTask = this.assetsManager.addImageTask("bgLoader", "/assets/earthbg.jpg");
                //var backgroundImageTask = this.assetsManager.addImageTask("bgLoader", "/assets/planetbg1.jpg");
                /* =============== Add Objects to Scene =============== */
                this.track = new Scene1.Track(this.scene);
                this.spaceShipCurrentTrackLane = Math.round((this.track.rows.lanesPositionX.length - 1) / 2);
                this.spaceShip = new Scene1.SpaceShip(this, this.assetsManager, function (spaceShipMesh) {
                    spaceShipMesh.position = new BABYLON.Vector3(_this.track.rows.lanesPositionX[_this.spaceShipCurrentTrackLane], 1, 0);
                    spaceShipMesh.receiveShadows = true;
                    spaceShipMesh.renderingGroupId = 2;
                    _this.shadowGenerator.getShadowMap().renderList.push(spaceShipMesh);
                    //this.track.addCollisionDetector(this.spaceShip.spaceShipMesh);
                    _this.crateFollowCam();
                    _this.meteoriteGenerator = new Scene1.MeteoriteGenerator(_this, _this.spaceShip.spaceShipMesh);
                    _this.rockGenerator = new Scene1.RockGenerator(_this, _this.spaceShip.spaceShipMesh);
                });
                /* =============== Event Listeners =============== */
                this.addEventListeners = function () {
                    onKeyDownHandler = function (event) {
                        var newLane;
                        switch (event.keyCode) {
                            case 37:
                                newLane = _this.spaceShipCurrentTrackLane - 1;
                                if (!_this.spaceShip.isXMoving && newLane !== -1) {
                                    _this.spaceShipTransitionTrackLane = _this.spaceShipCurrentTrackLane;
                                    _this.spaceShipCurrentTrackLane--;
                                    _this.spaceShip.moveShipMeshToLane(newLane, function () {
                                        _this.spaceShipTransitionTrackLane = undefined;
                                    });
                                }
                                break;
                            case 38:
                                _this.spaceShip.moveUp();
                                break;
                            case 39:
                                newLane = _this.spaceShipCurrentTrackLane + 1;
                                if (!_this.spaceShip.isXMoving && newLane < _this.track.rows.lanesPositionX.length) {
                                    _this.spaceShipTransitionTrackLane = _this.spaceShipCurrentTrackLane;
                                    _this.spaceShipCurrentTrackLane++;
                                    _this.spaceShip.moveShipMeshToLane(newLane, function () {
                                        _this.spaceShipTransitionTrackLane = undefined;
                                    });
                                }
                                break;
                            case 40:
                                _this.spaceShip.moveDown();
                                break;
                        }
                    };
                    onKeyUpHandler = function (event) {
                        switch (event.keyCode) {
                            case 32:
                                _this.spaceShip.triggerShot();
                                break;
                        }
                    };
                    window.addEventListener("keydown", onKeyDownHandler, true);
                    window.addEventListener("keyup", onKeyUpHandler, false);
                };
                this.removeEventListeners = function () {
                    if (onKeyDownHandler !== undefined) {
                        window.removeEventListener("keydown", onKeyDownHandler, false);
                        onKeyDownHandler = undefined;
                    }
                };
                this.assetsManager.onTaskError = function (task) {
                    console.log("error while loading " + task.name);
                };
                // Create the render loop once all the assets are loaded
                this.assetsManager.onFinish = function () {
                    _this.addEventListeners();
                    //this.canvas.style.background = "url(/assets/earthbg.jpg)";
                    _this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0.0000000000000001);
                    _this.canvas.style.background = "url(" + backgroundImageTask['image']['src'] + ")";
                    _this.canvas.style.backgroundPositionY = "-300px";
                    _this.canvas.style.backgroundPositionX = "-1235px";
                    _this.rockGenerator.recursiveRocksCreation();
                    engine.runRenderLoop(function () {
                        _this.spaceShip.spaceShipMesh.position.z += 3;
                        _this.light.position.x = _this.spaceShip.spaceShipMesh.position.x;
                        _this.light.position.y = _this.spaceShip.spaceShipMesh.position.y + 190;
                        _this.light.position.z = _this.spaceShip.spaceShipMesh.position.z - 140;
                        if (_this.camera.position.z > _this.track.rows.blocks[0].position.z + _this.track.rows.blocks[0].scaling.z / 2) {
                            _this.track.repositionFirstLineOfBlocks();
                        }
                        Core.updateStats();
                        _this.scene.render();
                    });
                };
                engine.loadingUIBackgroundColor = "Black";
                this.assetsManager.load();
            }
            return Scene;
        })();
        Scene1.Scene = Scene;
    })(Scene1 = Core.Scene1 || (Core.Scene1 = {}));
})(Core || (Core = {}));
//# sourceMappingURL=scene1.js.map
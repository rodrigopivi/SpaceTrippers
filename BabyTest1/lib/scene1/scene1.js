var Core;
(function (Core) {
    ///<reference path="spaceShip.ts"/>
    ///<reference path="track.ts"/>
    (function (Scene1) {
        var Scene = (function () {
            function Scene(canvas, engine) {
                var _this = this;
                this.spaceShipCurrentTrackLane = 0;
                this.canvas = canvas;
                this.engine = engine;

                var skyboxMaterial, onKeyDownHandler;

                this.scene = new BABYLON.Scene(engine);
                this.assetsManager = new BABYLON.AssetsManager(this.scene);

                this.light = new BABYLON.DirectionalLight("MainLight", new BABYLON.Vector3(0, -3, -1), this.scene);
                this.light.position = new BABYLON.Vector3(0, 80, 20);
                this.shadowGenerator = new BABYLON.ShadowGenerator(2048, this.light);
                this.shadowGenerator.usePoissonSampling = true;

                this.camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 15, -45), this.scene);
                this.camera.radius = 40; // how far from the object to follow
                this.camera.heightOffset = 16; // how high above the object to place the camera
                this.camera.rotationOffset = 180; // the viewing angle
                this.camera.cameraAcceleration = 0.2; // how fast to move
                this.camera.maxCameraSpeed = 20; // speed limit

                //this.scene.enablePhysics(null, new BABYLON.OimoJSPlugin());
                // Skybox creation
                this.skyBox = BABYLON.Mesh.CreateBox("skyBox", 1000, this.scene);
                skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
                skyboxMaterial.backFaceCulling = false;
                skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
                skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
                skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("/assets/spacebox/spacebox", this.scene);
                skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
                this.skyBox.material = skyboxMaterial;

                /* =============== Add Objects to Scene =============== */
                this.track = new Scene1.Track(this.scene);
                this.spaceShipCurrentTrackLane = Math.round((this.track.lanes.length - 1) / 2);
                this.spaceShip = new Scene1.SpaceShip(this.scene, this.assetsManager, function (spaceShipMesh) {
                    spaceShipMesh.position = new BABYLON.Vector3(0, 1, 0);
                    spaceShipMesh.position.x = _this.track.lanes[_this.spaceShipCurrentTrackLane].positionX;
                    spaceShipMesh.receiveShadows = true;
                    _this.shadowGenerator.getShadowMap().renderList.push(spaceShipMesh);

                    // the camera will follow the space ship
                    _this.camera.target = spaceShipMesh;
                });

                /* =============== Event Listeners =============== */
                this.addEventListeners = function () {
                    onKeyDownHandler = function (event) {
                        var newLaneIndex;
                        switch (event.keyCode) {
                            case 37:
                                newLaneIndex = _this.spaceShipCurrentTrackLane - 1;
                                if (newLaneIndex !== -1) {
                                    _this.spaceShip.moveShipMeshToPositionX(_this.track.lanes[newLaneIndex].positionX, function () {
                                        _this.spaceShipCurrentTrackLane--;
                                    });
                                }
                                break;
                            case 39:
                                newLaneIndex = _this.spaceShipCurrentTrackLane + 1;
                                if (newLaneIndex < _this.track.lanes.length) {
                                    _this.spaceShip.moveShipMeshToPositionX(_this.track.lanes[newLaneIndex].positionX, function () {
                                        _this.spaceShipCurrentTrackLane++;
                                    });
                                }
                                break;
                        }
                    };
                    window.addEventListener("keydown", onKeyDownHandler, false);
                };

                this.removeEventListeners = function () {
                    if (onKeyDownHandler !== undefined) {
                        window.removeEventListener("keydown", onKeyDownHandler, false);
                        onKeyDownHandler = undefined;
                    }
                };

                // Listen for assets that can't load
                this.assetsManager.onTaskError = function (task) {
                    console.log("error while loading " + task.name);
                };

                // Create the render loop once all the assets are loaded
                this.assetsManager.onFinish = function (tasks) {
                    console.log(tasks);
                    _this.addEventListeners();
                    engine.runRenderLoop(function () {
                        _this.light.position.z += 1;
                        _this.spaceShip.spaceShipMesh.position.z += 1;
                        _this.skyBox.position.z += 1;
                        if (_this.camera.position.z > _this.track.lanes[0].blocks[0].position.z + 40) {
                            _this.track.repositionFirstLineOfBlocks();
                        }
                        Core.updateStats();
                        _this.scene.render();
                    });
                };

                // Can now change loading background color:
                engine.loadingUIBackgroundColor = "Purple";

                // Just call load to initiate the loading sequence
                this.assetsManager.load();
            }
            return Scene;
        })();
        Scene1.Scene = Scene;
    })(Core.Scene1 || (Core.Scene1 = {}));
    var Scene1 = Core.Scene1;
})(Core || (Core = {}));
//# sourceMappingURL=scene1.js.map

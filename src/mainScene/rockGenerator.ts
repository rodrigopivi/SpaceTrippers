module Core.MainScene {

    export interface IRock {
        id: string;
        mesh: BABYLON.Mesh;
        scale: number;
        speed: number;
        rotation: BABYLON.Vector3;
        isTransparent: boolean;
        laneIndex: number;
    }

    export class RockGenerator {
        private scene: Core.MainScene.Scene;
        private targetObject: BABYLON.Mesh;
        private originalRock: BABYLON.Mesh;
        private numberOfRocks: number = 21;

        public currentRocks: IRock[] = [];
        public rockIndexById: (meteorIndex: string) => number;
        public explodeRock: (rock: IRock) => void;
        public removeRock: (rock: IRock) => void;

        public recursiveRocksCreation: () => void;
        public addRock: () => void;
        public getRocksAtLanes: (lanes: number[]) => IRock[];

        constructor(scene: Scene, targetObject: BABYLON.Mesh) {
            this.scene = scene;
            this.targetObject = targetObject;
            this.rockIndexById = (meteorIndex: string): number => {
                var mIndex = -1;
                this.currentRocks.some((meteor: any, index: number) => {
                    var found = false;
                    if (meteor.id === meteorIndex) {
                        mIndex = index;
                        found = true;
                    }
                    return found;
                });
                return mIndex;
            };

            this.getRocksAtLanes = (lanes: number[]): IRock[]=> {
                return this.currentRocks.filter((rock) => {
                    return rock.mesh.isVisible && lanes.indexOf(rock.laneIndex) !== -1;
                });
            };

            var rockMaterial = new BABYLON.StandardMaterial("rockTexture", this.scene.scene);
            rockMaterial.diffuseTexture = new BABYLON.Texture("/assets/rockTexture.jpg", this.scene.scene);
            rockMaterial.backFaceCulling = false;
            BABYLON.SceneLoader.ImportMesh("", "/assets/", "rock.babylon", this.scene.scene,(newMeshes) => {
                this.originalRock = <BABYLON.Mesh>newMeshes[0];
                this.originalRock.isVisible = false;
                this.originalRock.material = rockMaterial;
                this.originalRock.receiveShadows = true;
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

            this.explodeRock = (rock: IRock): void => {
                rock.mesh.isVisible = false;
                Core.Audio.playSoundFromAudioLib("explosion");
                var newExplosionSystem = explosionSystem.clone("nExplosion" + rock.id, rock.mesh);
                newExplosionSystem.start();
                newExplosionSystem.onDispose = () => {
                    this.scene.scene._toBeDisposed.push(rock.mesh);
                    this.removeRock(rock);
                };
            };

            this.removeRock = (rock: IRock): void => {
                var shadowRenderListIndex: number = -1;
                this.scene.sharedShadowGenerator.getShadowMap().renderList.some(
                    (mesh, shadowIndex) => {
                        var ret: boolean = false;
                        if (mesh.name === rock.id) {
                            shadowRenderListIndex = shadowIndex;
                            ret = true;
                        }
                        return ret;
                    });
                if (shadowRenderListIndex !== -1) {
                    this.scene.sharedShadowGenerator.getShadowMap().renderList.splice(shadowRenderListIndex, 1);
                }
                this.scene.scene._toBeDisposed.push(rock.mesh);
                this.currentRocks.splice(this.rockIndexById(rock.id), 1);
                this.recursiveRocksCreation();
            };

            this.recursiveRocksCreation = () => {
                if (this.currentRocks.length < this.numberOfRocks) {
                    setTimeout(() => { this.addRock(); this.recursiveRocksCreation(); }, Core.Utilities.getRandomInRange(2000, 4000));
                }
            };

            this.addRock = (): void => {
                if (this.originalRock) {
                    var id = "rockMesh:" + this.currentRocks.length;
                    var laneIndex = Core.Utilities.getRandomInRange(0, this.scene.track.rows.lanesPositionX.length - 1);
                    var newRock: IRock = <IRock>{
                        id: id,
                        mesh: this.originalRock.clone(id),
                        scale: Core.Utilities.getRandomInRange(3, 4),
                        speed: Core.Utilities.getRandomInRange(2, 4) * 0.1 + 1,
                        rotation: new BABYLON.Vector3(
                            Core.Utilities.getRandomInRange(-1, 1) * 0.01,
                            Core.Utilities.getRandomInRange(-1, 1) * 0.01,
                            Core.Utilities.getRandomInRange(-1, 1) * 0.01
                            ),
                        isTransparent: false,
                        laneIndex: laneIndex
                    };
                    this.scene.sharedShadowGenerator.getShadowMap().renderList.push(newRock.mesh);
                    this.currentRocks.push(newRock);
                    newRock.mesh.scaling = new BABYLON.Vector3(
                        newRock.mesh.scaling.x * newRock.scale,
                        newRock.mesh.scaling.y * newRock.scale,
                        newRock.mesh.scaling.z * newRock.scale);

                    var vectorsWorld = newRock.mesh.getBoundingInfo().boundingBox.vectorsWorld; // summits of the bounding box
                    var newRockHeight = vectorsWorld[1].subtract(vectorsWorld[0]).length();
                    newRock.mesh.position = new BABYLON.Vector3(
                        this.scene.track.rows.lanesPositionX[laneIndex],
                        3 + newRockHeight,
                        this.scene.track.rows.nextBlockPositionZ);
                    newRock.mesh.renderingGroupId = 2;
                    newRock.mesh.isVisible = true;

                    // this render loop runs only when the rock is viewable
                    newRock.mesh.registerBeforeRender((newR) => {
                        newR.rotation.y += newRock.rotation.y;
                        newR.rotation.x += newRock.rotation.x;
                        newR.rotation.z += newRock.rotation.z;
                        newR.position.z += newRock.speed;

                        var sinusoidalYPosition = 24 + (7 + newRock.scale) * Math.sin(newR.position.z / (55 + newRock.speed));
                        if (sinusoidalYPosition - newRockHeight / 2 > 3) { newR.position.y = sinusoidalYPosition; }
                        if (!newRock.isTransparent &&
                            this.scene.spaceShip.spaceShipMesh.position.z - 25 > newR.position.z &&
                            this.scene.spaceShipCurrentTrackLane === newRock.laneIndex) {
                            newRock.isTransparent = true;
                            newR.visibility -= 0.03;
                        } else if (newRock.isTransparent && newR.visibility > 0.4) {
                            newR.visibility -= 0.03;
                        }

                        if ((this.scene.spaceShipCurrentTrackLane === newRock.laneIndex ||
                            this.scene.spaceShipTransitionTrackLane === newRock.laneIndex) &&
                            newR.intersectsMesh(this.targetObject, false)) {
                            this.explodeRock(newRock);
                            this.scene.spaceShip.explode();
                        }
                    });
                }
            };
            // rocks destroyer
            this.scene.scene.registerBeforeRender(() => {
                this.currentRocks.forEach((aRock) => {
                    if (this.scene.camera.position.z > aRock.mesh.position.z) {
                        this.removeRock(aRock);
                    }
                });
            });
        }
    }
} 
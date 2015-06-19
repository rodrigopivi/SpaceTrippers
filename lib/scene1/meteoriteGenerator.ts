module Core.Scene1 {

    export interface IMeteorite {
        id: string;
        mesh: BABYLON.Mesh;
        smokeTail: BABYLON.ParticleSystem;
        fireTail: BABYLON.ParticleSystem;
        direction: BABYLON.Vector3;
        targetPosition: BABYLON.Vector3;
    }

    export class MeteoriteGenerator {
        private scene: Scene;
        private targetObject: BABYLON.Mesh;
        private originalMeteorite: BABYLON.Mesh;
        private currentMeteorites: IMeteorite[] = [];
        private meteoriteIndexById: (meteorIndex: string) => number;

        private meteoriteMaterial: BABYLON.StandardMaterial;

        public addMeteorite: () => void;

        constructor(scene: Scene, targetObject: BABYLON.Mesh) {
            this.scene = scene;
            this.targetObject = targetObject;

            this.meteoriteMaterial = new BABYLON.StandardMaterial("meteoriteTexture", this.scene.scene);
            this.meteoriteMaterial.diffuseTexture = new BABYLON.Texture("/assets/vj2c.jpg", this.scene.scene);
            this.meteoriteMaterial.backFaceCulling = false;//Show all the faces of the element
            this.meteoriteMaterial.bumpTexture = new BABYLON.Texture("/assets/sunTexture.png", this.scene.scene);

            this.originalMeteorite = BABYLON.Mesh.CreateSphere("originalMeteorite", 1, 6, this.scene.scene);
            this.originalMeteorite.material = this.meteoriteMaterial;
            this.originalMeteorite.renderingGroupId = 2;
            this.originalMeteorite.isVisible = false;

            this.meteoriteIndexById = (meteorIndex: string): number => {
                var mIndex = -1;
                this.currentMeteorites.some((meteor: any, index: number) => {
                    var found = false;
                    if (meteor.id === meteorIndex) {
                        mIndex = index;
                        found = true;
                    }
                    return found;
                });
                return mIndex;
            };

            var meteorSmokeTail = new BABYLON.ParticleSystem("smokeTail", 400, this.scene.scene);
            meteorSmokeTail.renderingGroupId = 2;
            meteorSmokeTail.particleTexture = new BABYLON.Texture("/assets/flare.png", this.scene.scene);
            meteorSmokeTail.minEmitBox = new BABYLON.Vector3(0, 0, 1);
            meteorSmokeTail.maxEmitBox = new BABYLON.Vector3(0, 0, 1);
            meteorSmokeTail.gravity = new BABYLON.Vector3(0, 0, 0);
            meteorSmokeTail.color1 = new BABYLON.Color4(0.1, 0.1, 0.1, 1.0);
            meteorSmokeTail.color2 = new BABYLON.Color4(0.1, 0.1, 0.1, 1.0);
            meteorSmokeTail.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
            meteorSmokeTail.minSize = 7;
            meteorSmokeTail.maxSize = 7;
            meteorSmokeTail.minLifeTime = 0.06;
            meteorSmokeTail.maxLifeTime = 0.3;
            meteorSmokeTail.emitRate = 400;
            meteorSmokeTail.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
            meteorSmokeTail.minAngularSpeed = 0;
            meteorSmokeTail.maxAngularSpeed = Math.PI;
            meteorSmokeTail.minEmitPower = 0.1;
            meteorSmokeTail.maxEmitPower = 1;
            meteorSmokeTail.updateSpeed = 0.006;
            meteorSmokeTail.disposeOnStop = false;

            var meteorFireTail = new BABYLON.ParticleSystem("fireTail", 400, this.scene.scene);
            meteorFireTail.renderingGroupId = 2;
            meteorFireTail.particleTexture = new BABYLON.Texture("/assets/flare.png", this.scene.scene);
            meteorFireTail.minEmitBox = new BABYLON.Vector3(0, 0, 1);
            meteorFireTail.maxEmitBox = new BABYLON.Vector3(0, 0, 1);
            meteorFireTail.gravity = new BABYLON.Vector3(0, 0, 0);
            meteorFireTail.color1 = new BABYLON.Color4(0.8, 0.5, 1, 1.0);
            meteorFireTail.color2 = new BABYLON.Color4(1, 0, 0, 1.0);
            meteorFireTail.colorDead = new BABYLON.Color4(1, 0, 0, 0.0);
            meteorFireTail.minSize = 7;
            meteorFireTail.maxSize = 7;
            meteorFireTail.minLifeTime = 0.04;
            meteorFireTail.maxLifeTime = 0.08;
            meteorFireTail.emitRate = 400;
            meteorFireTail.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
            meteorFireTail.minAngularSpeed = 0;
            meteorFireTail.maxAngularSpeed = Math.PI;
            meteorFireTail.minEmitPower = 0.1;
            meteorFireTail.maxEmitPower = 1;
            meteorFireTail.updateSpeed = 0.006;
            meteorFireTail.disposeOnStop = false;

            this.addMeteorite = () => {
                var meteorId = "meteor-" + Math.random().toString(36).substring(7);
                var targetPosition = this.targetObject.position.clone();
                targetPosition.z += 150;
                targetPosition.y = this.targetObject.position.y;

                var meteor = this.originalMeteorite.clone(meteorId);
                meteor.isVisible = true;
                meteor.renderingGroupId = 2;
                meteor.position.x = Core.getRandomInRange(1, 2) === 1
                    ? Core.getRandomInRange(this.scene.track.rows.lanesPositionX[0] - 500, this.scene.track.rows.lanesPositionX[0] - 100)
                    : Core.getRandomInRange(this.scene.track.rows.lanesPositionX[this.scene.track.rows.lanesPositionX.length - 1] + 100, this.scene.track.rows.lanesPositionX[this.scene.track.rows.lanesPositionX.length - 1] + 500);
                //meteor.position.x = Core.getRandomInRange(-600, 600);
                meteor.position.y = this.targetObject.position.y + Core.getRandomInRange(20, 50);
                meteor.position.z = this.targetObject.position.z + 1000;
                var direction = meteor.position.subtract(targetPosition);

                var newMeteorSmokeTail = meteorSmokeTail.clone("smoke-" + meteorId, meteor);
                newMeteorSmokeTail.direction1 = direction;
                newMeteorSmokeTail.direction2 = direction;
                newMeteorSmokeTail.disposeOnStop = true;
                newMeteorSmokeTail.start();

                var newMeteorFireTail = meteorFireTail.clone("fire-" + meteorId, meteor);
                newMeteorFireTail.direction1 = direction;
                newMeteorFireTail.direction2 = direction;
                newMeteorFireTail.disposeOnStop = true;
                newMeteorFireTail.start();

                var meteoriteObj = <IMeteorite>{
                    id: meteorId,
                    mesh: meteor,
                    smokeTail: meteorSmokeTail,
                    fireTail: meteorFireTail,
                    targetPosition: targetPosition,
                    direction: direction
                };
                this.currentMeteorites.push(meteoriteObj);

                meteoriteObj.mesh.registerBeforeRender(() => {
                    if (meteoriteObj.mesh.intersectsMesh(this.targetObject, false)) {
                        meteoriteObj.mesh.isVisible = false;
                        meteoriteObj.fireTail.stop();
                        meteoriteObj.smokeTail.stop();

                        this.scene.spaceShip.explode();
                        this.scene.scene._toBeDisposed.push(meteoriteObj.mesh);
                        this.currentMeteorites.splice(this.meteoriteIndexById(meteoriteObj.id), 1);
                    }
                });
            };

            var recursiveMeteoritesCreation = (): void => {
                setTimeout(() => {
                    if (this.currentMeteorites.length < 10) {
                        this.addMeteorite();
                    }
                    recursiveMeteoritesCreation();
                }, Core.getRandomInRange(300, 2000));
            };
            recursiveMeteoritesCreation();
            //recursiveMeteoritesCreation();

            this.scene.scene.registerBeforeRender((): void => {
                if (this.currentMeteorites.length) {
                    this.currentMeteorites.forEach((meteor, index) => {
                        if (meteor.mesh && meteor.mesh.position.z < this.targetObject.position.z - 100) {
                            this.scene.scene._toBeDisposed.push(meteor.mesh);
                            this.currentMeteorites.splice(index, 1);
                        } else {
                            var direction = meteor.targetPosition.subtract(meteor.mesh.position);
                            var newPosition = new BABYLON.Vector3(
                                direction.x * 0.05,
                                direction.y * 0.05,
                                direction.z * 0.05
                                );
                            meteor.mesh.position.addInPlace(newPosition);
                        }
                    });
                }
            });
        }
    }
} 
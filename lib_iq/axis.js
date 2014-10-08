//Axis�N���X
//���W�n�������r���[�𐶐�


var AXIS_LENGTH = 100;
var LABEL_COLOR = "red";
var LABEL_FONT = "25px bold sans";
var DE_PROCESS = true;

var Axis = enchant.Class.create({

    initialize: function(scene){
        //�N���X�̐���

        //���W���N���X
        var AxisBase = enchant.Class.create(enchant.gl.primitive.Cylinder,{
            initialize: function(phi,theta,color){
                enchant.gl.primitive.Cylinder.call(this,0.5,AXIS_LENGTH,20);
                this.x = 0;
                this.y = 0;
                this.z = 0;
                //���W���p�ȊO�p���Ȃ��̂ő����ϊ��͑z�肵�Ȃ�
                this.rotationApply(new Quat(0, 0, 1, Math.PI/180 *phi));
                this.rotationApply(new Quat(1, 0, 0, Math.PI/180 *theta));
                this.mesh.setBaseColor(color);
                scene.addChild(this);
            }
        });

        //���W�������������W���N���X
        var AxisArrow = enchant.Class.create(enchant.gl.primitive.Sphere, {
            initialize: function(phi, theta, r){
                enchant.gl.primitive.Sphere.call(this, 4);
                this.x = r * Math.sin(Math.PI/180 * theta) * Math.cos(Math.PI/180 * phi);
                this.y = r * Math.sin(Math.PI/180 * theta) * Math.sin(Math.PI/180 * phi);
                this.z = r * Math.cos(Math.PI/180 * theta);
                scene.addChild(this);
            }
        });

        //�����\���p���x��
        var AxisLabel = enchant.Class.create(enchant.Label, {
            initialize: function(text, arrow){
                enchant.Label.call(this, text);

                this.myArrow = arrow;
                this.myCam = {};
                this.myCam.x = 0;// enchant.Core.instance.currentScene3D.getCamera().x;
                this.myCam.y = 0;// enchant.Core.instance.currentScene3D.getCamera().y;
                this.myCam.z = 0;// enchant.Core.instance.currentScene3D.getCamera().z;

                this.x = worldToScreen(arrow.x, arrow.y, arrow.z).x - 10;
                this.y = worldToScreen(arrow.x, arrow.y, arrow.z).y - 10;
                this.color = LABEL_COLOR;
                this.font = LABEL_FONT;
                enchant.Core.instance.rootScene.addChild(this);

                //�Î~���͌v�Z�ʂ����炷
                this.addEventListener('enterframe', function(){
                    if(DE_PROCESS == true){
                        cam = enchant.Core.instance.currentScene3D.getCamera();

                        if( this.myArrow.x == this.myArrow.dx && 
                            this.myArrow.y == this.myArrow.dy && 
                            this.myArrow.z == this.myArrow.dz &&
                            this.myCam.x == cam.x &&
                            this.myCam.y == cam.y &&
                            this.myCam.z == cam.z){
                                //�ω��Ȃ�
                            }else{
                                //�ω�����
                                this.myArrow.dx = this.myArrow.x;
                                this.myArrow.dy = this.myArrow.y;
                                this.myArrow.dz = this.myArrow.z;
                                this.myCam.x = cam.x;
                                this.myCam.y = cam.y;
                                this.myCam.z = cam.z;

                                this.x = worldToScreen(this.myArrow.x,this.myArrow.y, this.myArrow.z).x-10;
                                this.y = worldToScreen(this.myArrow.x,this.myArrow.y, this.myArrow.z).y-10;
                            };
                    }else{
                        //�ȗ̓t���O�Ȃ�
                        this.x = worldToScreen(this.myArrow.x,this.myArrow.y, this.myArrow.z).x-10;
                        this.y = worldToScreen(this.myArrow.x,this.myArrow.y, this.myArrow.z).y-10;
                    };
                });
            }
        });

        //�I�u�W�F�N�g�̐���

        //���̕`��
        var axisX = new AxisBase(-90, 0, '#ff3333');//red
        var axisY = new AxisBase(0, 0,   '#33ffff');//blue
        var axisZ = new AxisBase(0, -90, '#00cc33');//green

        //�W���̕`��
        var arrowX = new AxisArrow(0,90,100);
        var arrowY = new AxisArrow(90, 90, 100);
        var arrowZ = new AxisArrow(-90,0, 100);

        //�W���Ƀ��x����p��
        var labelX = new AxisLabel("x", arrowX);
        var labelY = new AxisLabel("y", arrowY);
        var labelZ = new AxisLabel("z", arrowZ);

    }
});

//----------3D -> 2D
var worldToScreen  = function worldToScreen(x, y, z) {
    function mul(m1, m2) {
        return mat4.multiply(m1, m2, mat4.create());
    }

    var core = enchant.Core.instance;
    var camera = core.currentScene3D.getCamera();

    // �v���W�F�N�V�����s��
    var pm = mat4.perspective(20, core.width / core.height, 1.0, 1000.0);

    // �r���[�s��
    var vm = mat4.lookAt([ camera._x, camera._y, camera._z ], [
            camera._centerX, camera._centerY, camera._centerZ ], [
            camera._upVectorX, camera._upVectorY, camera._upVectorZ ]);

    var v = [ x, y, z, 1 ];
    var sc = mat4.multiplyVec4(mul(pm, vm), [ x, y, z, 1 ]);

    var scX = (1 - (-sc[0] / sc[3])) * (core.width / 2);
    var scY = (1 - (sc[1] / sc[3])) * (core.height / 2);

    return {x:scX, y:scY};
};

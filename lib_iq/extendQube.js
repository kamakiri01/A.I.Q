//Qubeを拡張した、
//ノーマルキューブ、アドバンテージキューブ、フォービドゥンキューブクラス

//ノーマルキューブクラス
var NormalQube = enchant.Class.create(Qube,{
    initialize: function(){
        Qube.call(this, 1);
        this.type = 0;

        var texture = new Texture();
        texture.src = stoneImage;
        texture.ambient=[0.8, 0.8, 0.8,0.8];
        texture.shiness=0.5;
        this.mesh.texture = texture;
    },

    //マーカー解除によって消されたときの処理
    deleteByMark: function(){
        console.log("DELETE Normal");
        this.removeEventListener('enterframe', arguments.callee);
        this.rollingOnce = function(){};

        this.addEventListener('enterframe', function(){
            this.y -= 0.3;
            if(this.y < -2.1 || this.y > 99){
                this.removeEventListener('enterframe', arguments.callee);
                this.y = 100;
                this.x = 100;
                this.z = 100;
            }
        });
    }
})

//アドバンテージキューブクラス
var AdvantageQube = enchant.Class.create(Qube,{
    initialize: function(){
        Qube.call(this, 1);
        this.type = 1;
        //テクスチャ
        var texture = new Texture();
        texture.src = greenStoneImage;
        texture.ambient=[1,1,1,1.0];
        texture.shiness=1;
        this.mesh.texture = texture;
    },

    //マーカー解除によって消されたときの処理
    deleteByMark: function(){
        console.log("DELETE Adv");
        this.removeEventListener('enterframe', arguments.callee);
        this.rollingOnce = function(){};

        this.addEventListener('enterframe', function(){
            this.y -= 0.3;
            if(this.y < -2.1 || this.y > 99){
                this.removeEventListener('enterframe', arguments.callee);
                this.y = 100;
                this.x = 100;
                this.z = 100;
            }
        });
    }
})

//フォービドゥンキューブクラス
var ForbiddenQube = enchant.Class.create(Qube,{
    initialize: function(){
        Qube.call(this, 1);
        this.type = 2;
        //テクスチャ
        var texture = new Texture();
        texture.src = blackStoneImage;
        texture.ambient=[0.8,0.8,0.8,0.8];
        texture.specular = [ 1.0, 1.0, 1.0, 1.0 ];
        texture.shiness=1;
        this.mesh.texture = texture;

    },

    //マーカー解除によって消されたときの処理
    deleteByMark: function(){
        console.log("DELETE Fbd");
        this.removeEventListener('enterframe', arguments.callee);
        this.rollingOnce = function(){};

        this.addEventListener('enterframe', function(){
            this.y -= 0.3;
            if(this.y < -2.1 || this.y > 99){
                this.removeEventListener('enterframe', arguments.callee);
                this.y = 100;
                this.x = 100;
                this.z = 100;
            }
        });
    }

})

//床面キューブクラス
var FloorQube = enchant.Class.create(Qube,{
    initialize: function(array){
        Qube.call(this, 1);

        this.parentArray = array;
        this.arrayNumX;
        this.arrayNumY;
        this.scene;//シーンを持たせる
        
        var texture = new Texture();
        texture.src = stoneImage;
        texture.ambient=[0.8, 0.8, 0.8,0.8];
        texture.shiness=0.5;
        this.mesh.texture = texture;
    },

    //破壊処理
    breakFloorCube: function(i){
        console.log("breakFloorCube :"+i);
        //落下処理
//        this.tl.delay((this.parentArray[0].length - this.arrayNumX))
        this.tl.delay(i * 2)
            .then(function(){
                this.addEventListener('enterframe', function(){
                    this.rotationApply(new Quat(i%3,i%3,i%3,Math.PI/45));
                })
            })
            .moveBy(0,-10,0, 20, enchant.Easing.QUAD_EASEOUT)
            .then(function(){
                //床キューブ配列から自身を削除
                this.y = -100;
                this.parentArray[i].pop();
            })
            .then(function(){
                this.scene.removeChild(this);
            });

    }
}
)


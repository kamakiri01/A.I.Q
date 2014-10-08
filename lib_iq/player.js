//Playerクラス
//no using class
//var GlGroup = enchant.Class.mixClasses( Group, enchant.gl.Sprite3D, true);
var turn;
var Player = enchant.Class.create(enchant.gl.Sprite3D, {
    initialize: function(){
        enchant.gl.Sprite3D.call(this);
        this.preX = this.x;

        this.stayFloor = null;//今いる床面
        this.aButtonStack = 0;//一度の押下で一度だけ有効な押下を取る
        this.bButtonStack = 0;
        this.markedFloor = null;//マーカーをセットしている床面を保持
        this.isStamped = false;//ゲームオーバー処理フラグ（ジャンプ中操作を止める）

        //当たり判定が出た場合に、入力移動を差し戻すバッファ
        //入力前の座標を保存する
        this.bx = 0;
        this.bz = 0;

        //本体を生成        
        var body = new Billboard(2);
        body.scaleX = 0.3;
        body.scaleY = 0.3;
        body.y -= 1.3;

        body.parent = this;

        var texture = new Texture();
        texture.src = bearImage; 
        texture.ambient=[0.8,0.8,0.8,1.0];
        texture.shiness=1;
        body.mesh.texture = texture;
        body.mesh.texCoords = [
            0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
            0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
            0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
            0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
            0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
            0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
        ];
        this.addChild(body);
        this.body = body;

        //足元の影を生成
        var shadow = new PlaneXZ(1);
        shadow.y -= 2;
        shadow.scaleX = 0.5;
        shadow.scaleZ = 0.5;

        shadow.parent  =this;

        var texture2 = new Texture();
        texture2.src = shadowImage;
        shadow.mesh.texture = texture2;
        this.addChild(shadow);
        this.shadow = shadow;

        shadow.addEventListener('enterframe', function(){
            this.rotationApply(new Quat(0,1,0,Math.PI/180));
        })

        //進路にあわせて画像反転
         turn = function(){
            if(this.x - this.preX > 0){
                body.mesh.texCoords = [
                    0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
                    0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
                    0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
                    0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
                    0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
                    0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
                ];
                shadow.x = body.x -0.1;
            }else if(this.x - this.preX < 0){
                body.mesh.texCoords = [
                    0,0.99,  0.2,0.99,  0.2,0.66,  0,0.66,
                    0,0.99,  0.2,0.99,  0.2,0.66,  0,0.66,
                    0,0.99,  0.2,0.99,  0.2,0.66,  0,0.66,
                    0,0.99,  0.2,0.99,  0.2,0.66,  0,0.66,
                    0,0.99,  0.2,0.99,  0.2,0.66,  0,0.66,
                    0,0.99,  0.2,0.99,  0.2,0.66,  0,0.66,
                ];
                shadow.x = body.x +0.1;
            }else{
            shadow.x = body.x;
            }
            this.preX = this.x;
        };
        this.addEventListener('enterframe', turn);

    },
        
    //イベントハンドラから床面配列を付与して呼び出す
    getStayFloor: function(floors){
        for(var i=0;i<floors.length;i++){
            for(var j=0;j<floors[i].length;j++){
                //矩形当たり判定を取る
                if( (floors[i][j].x - floors[i][j].scale <= this.x) && 
                    (floors[i][j].x + floors[i][j].scale > this.x) && 
                    (floors[i][j].z - floors[i][j].scale + 0.7 <= this.z) && 
                    (floors[i][j].z + floors[i][j].scale + 0.7 > this.z) ){
                    //新しい床面に移動した場合は更新作業をする
                    if(this.stayFloor != floors[i][j]){
                        //古い床面の状態を戻す
                        if(typeof this.stayFloor == Floor){
                            this.stayFloor.isPlayer = false;
                            this.stayFloor.player = null;
                        }
                        //新しい床面の状態を書き換える
                        floors[i][j].isPlayer = true;
//                        console.log("p: "+i+", "+ j);

                        //プレイヤーの状態を更新する
                        this.stayFloor = floors[i][j];
                        this.stayFloor.player = this;
                    }
                }
            }
        }
    },

    stamped: function(){
        this.isStamped = true;
        this.removeEventListener('enterframe', turn);
        this.body.mesh.texCoords = [
            0.8,0.99,  0.6,0.99,  0.6,0.66,  0.8,0.66,
            0.8,0.99,  0.6,0.99,  0.6,0.66,  0.8,0.66,
            0.8,0.99,  0.6,0.99,  0.6,0.66,  0.8,0.66,
            0.8,0.99,  0.6,0.99,  0.6,0.66,  0.8,0.66,
            0.8,0.99,  0.6,0.99,  0.6,0.66,  0.8,0.66,
            0.8,0.99,  0.6,0.99,  0.6,0.66,  0.8,0.66,
        ];
        //端から落としていく
        this.body.tl.moveBy(0,10,0, 20, enchant.Easing.QUART_EASEOUT)
            .moveBy(0,-15,0,20, enchant.Easing.CUBIC_EASEIN)
            .then(function(){
                this.parent.shadow.y = -100;
                this.parent.body.y = -100;
            })
            .then(function(){
                this.removeChild(this.parent.shadow);
                this.removeChild(this.parent.body)
            });

    }

})


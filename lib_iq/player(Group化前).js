//Playerクラス

//var player = enchant.Class.create(enchant.gl.primitive.Cylinder, {
var Player = enchant.Class.create(enchant.gl.primitive.Billboard, {
    initialize: function(){
//        enchant.gl.primitive.Cylinder.call(this, 0.2,2,10);
        enchant.gl.primitive.Billboard.call(this, 1);

        //テクスチャ
        var texture = new Texture();
        texture.src = bearImage; //通常の床面
        texture.ambient=[0.8,0.8,0.8,1.0];
        texture.shiness=1;
        this.mesh.texture = texture;
        this.mesh.texCoords = [
            
0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
0.2,0.99,  0,0.99,  0,0.66,  0.2,0.66,
        ];

        this.stayFloor = null;//今いる床面
        this.aButtonStack = 0;//一度の押下で一度だけ有効な押下を取る
        this.bButtonStack = 0;
        this.markedFloor = null;//マーカーをセットしている床面を保持


    },

    //イベントハンドラから床面配列を付与して呼び出す
    getStayFloor: function(floors){
        for(var i=0;i<floors.length;i++){
            for(var j=0;j<floors[i].length;j++){
                //矩形当たり判定を取る
                if( (floors[i][j].x - floors[i][j].scale < this.x) && 
                    (floors[i][j].x + floors[i][j].scale > this.x) && 
                    (floors[i][j].z - floors[i][j].scale + 0.7 < this.z) && 
                    (floors[i][j].z + floors[i][j].scale + 0.7 > this.z) ){
                    //新しい床面に移動した場合は更新作業をする
                    if(this.stayFloor != floors[i][j]){
                        //古い床面の状態を戻す
                        if(typeof this.stayFloor == Floor){
                            this.stayFloor.isPlayer = false;
                        }
                        //新しい床面の状態を書き換える
                        floors[i][j].isPlayer = true;
//                        console.log("p: "+i+", "+ j);

                        //プレイヤーの状態を更新する
                        this.stayFloor = floors[i][j];
                    }
                }
            }
        }
    }
})


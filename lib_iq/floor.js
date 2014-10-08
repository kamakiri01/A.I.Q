//Floorクラス
//積載キューブ判定を持ったPlaneXZ

var Floor = enchant.Class.create(enchant.gl.primitive.PlaneXZ,{

    initialize: function(scale){
        enchant.gl.primitive.PlaneXZ.call(this, scale);

        this.parentArray;//親配列
        this.arrayNumX;
        this.arrayNumY; 
        
        //テクスチャ
        var texture = new Texture();
        texture.src = stoneImage; //通常の床面
        texture.ambient=[0.8,0.8,0.8,1.0];
        texture.shiness=1;
        this.mesh.texture = texture;

        var texture2 = new Texture();
        texture2.src = blueStoneImage; //マーカーが貼られた状態
        texture2.ambient=[1,1,1,1.0];
        texture2.shiness=1;

        var texture3 = new Texture();
        texture3.src = greenStoneImage; //ADV起爆が貼られた状態
        texture3.ambient=[1,1,1,1.0];
        texture3.shiness=1;

        var texture4 = new Texture();
        texture4.src = redStoneImage; //ADV起爆が貼られた状態
        texture4.ambient=[1,1,1,1.0];
        texture4.shiness=1;
            
        var texture5 = new Texture();
        texture5.src = blueGreenStoneImage; //ADV起爆の上にマーカーを貼った状態
        texture5.ambient=[1,1,1,1.0];
        texture5.shiness=1;
        
        this.scale = scale;
//プロパティ
        
        //マーカーが貼られているか
        this.isMarker = false;
        //プレイヤーが載っているか
        this.isPlayer = false;
        //キューブの積載
        this.targetCube = null;
        //起爆マークがついているか
        this.isAdvMarked = false;
        //起爆エリアテクスチャになっているか
        this.isAdvCounted = false;
        //回転中に起爆待機状態になっているか
        this.isReadySolved = false;
        //フォービドゥンキューブによる破壊処理が走っているか
        this.isBroken = false;
        //プレイヤーオブジェクト
        this.player = null;
        //Fbd削除履歴
        this.isBreakFbd = false;

        
        //マーカーの種類と有無でテクスチャを変更
        this.addEventListener('enterframe', function(){
            if(this.isReadySolved){
                this.mesh.texture = texture4;
            }else if(this.isMarker && this.isAdvMarked){
                this.mesh.texture = texture5;
            }else if(this.isAdvCounted){
                this.mesh.texture = texture4;
            }else if(this.isAdvMarked){
                this.mesh.texture = texture3;
            }else if(this.isMarker){
                this.mesh.texture = texture2;
            }else{
                this.mesh.texture = texture;
            }
        })
    },

    //配列を受け取って積載しているキューブを判定する
    //積載キューブによって返り値を変える
    checkOn: function(cubes){
        for(var i=0;i<cubes.length;i++){
            if( Math.round(cubes[i].x *2) == Math.round(this.x *2) &&
                Math.round(cubes[i].z *2) == Math.round(this.z *2) ){
                this.targetCube = cubes[i];
//                console.log("finds");
                return cubes[i].type;
            }else{
                this.targetCube = null;
            }
        }
        return 10;//キューブは載っていない
    },

    //FBD削除履歴があれば消費して返す
    checkBreakStack: function(){
        if(this.isBreakFbd == true){
            this.isBreakFbd = false;
            return true;
        }else{
            return false;
        }
    },

    //積載キューブがあるときにマーカー解除されたらキューブ捕獲
    solveMarker: function(){
       //キューブが載っていれば消す処理を送る
       if(this.targetCube != null){
            if(!this.targetCube.hasDeleteStackAlready){//多重処理防止フラグ
               this.targetCube.hasDeleteStackAlready = true;
               this.targetCube.deleteByMark();//積載キューブの消去処理を呼び出す

               if(this.targetCube.type == 1){ //もしADVキューブを消す場合
                    this.isAdvMarked = true;
                }else if(this.targetCube.type == 2){//FBDキューブを消す場合
                    this.isBreakFbd = true;
                }
            }
        } 
    },

    //フォービドゥンキューブ捕獲による床破壊の処理
    //FBDキューブの削除処理から呼ばれる
    breakFloor: function(i){
        this.isBroken = true;//破壊状態にする
        console.log("lg"+i+","+this.parentArray[i].length);
         //落下処理
        //床配列から自身を削除
        this.parentArray[i].pop();
        console.log("floor delete, lest:"+this.parentArray[i].length);

        if(this.player != null){
            if(this.player.stayFloor == this){
                this.player.stamped();
                game.removeEventListener('enterframe', arguments.callee);
            }
        }
    }


})

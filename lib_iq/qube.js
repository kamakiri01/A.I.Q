//Qubeクラス
    
//-----Qubeクラス
        var Qube = enchant.Class.create(enchant.gl.primitive.Cube,{
            initialize: function(scale){
                enchant.gl.primitive.Cube.call(this, scale);
                
                //回転開始時に移動開始座標を保持するメンバ
                this.preX = this.x;
                this.preY = this.y;
                this.preZ = this.z;
                
                //移動方向ベクトル
                this.accX = 0;
                this.accY = 0;
                this.accZ = 0;

                //移動の径。立方体なら一辺の半手。
                this.sides = scale / 2 ;

                //残り回転量を保持
                this.restRotation =0;

                //初期角度
                this.rad = Math.PI * 1/4;

                //adjust用の予想移動先計算用変数
                this.receiveDegree = 0;
                this.reveiVeTime = 0;

                //親配列を保持
                this.parentArray;

                //起爆で消される際に、既に削除スタックが積まれているか
                this.hasDeleteStackAlready = false;
                
            },
            
            //一度だけrollの引数角度・フレーム数で回転させる
            rollingOnce:  function(){
                //回転
                this.rotationApply(new Quat(1,0,0, Math.PI/180 * this.perRotate));
                //残り角、移動方向角を更新
                this.restRotation -= this.perRotate;
                //perRotate(180分率)で毎フレーム分だけまわす
                this.rad += this.perRotate / 180 * Math.PI;

                //移動(z方向への移動としておく)
                //1フレームあたりに必要な移動量を求めてaccに代入
                this.accZ = Math.sin(this.rad) * this.sides * this.perRotate * this.sides * 0.1;
                this.accY = Math.cos(this.rad) * this.sides * this.perRotate * this.sides * 0.1;

                //移動量の適用
                this.x += this.accX;
                this.y += this.accY;
                this.z += this.accZ;

                //回転量を満たしたらイベントを削除する
                if(this.restRotation <= 0){
                    this.removeEventListener('enterframe', arguments.callee);
                    this.setAdjust();
                    this.initParams();

                    //テスト用、無限に回転を繰り返すための処理
                    this.rad -=  1/2* Math.PI;
                }
            },

            //設置面に追従した回転を行う
            //90の倍率以外は受け付けない、90度、フレームは30以上の前提で組む
            roll: function(degree, time){
                //移動開始時の座標を保持
                this.preX = this.x;
                this.preY = this.y;
                this.preZ = this.z;
                //移動先計算用に引数を保持
                this.receiveDegree = degree;
                this.receiveTime = time;

                //残り回転量を計算
                this.restRotation = degree;
                this.perRotate = degree/time;

                //回転と移動の処理
                this.addEventListener('enterframe', this.rollingOnce);
			},
            
            //元の位置と回転量から座標を補正する
            setAdjust: function(){
                this.z = this.preZ +2;
                this.y = this.preY;
            },

            //各種初期化（角度など）
            initParams: function(){
                this.preX = this.x;
                this.preY = this.y;
                this.preZ = this.z;
                this.restRotation = 0;
//                this.rad =  -Math.PI * 1/4;
                this.receiveDegree = 0;
                this.receiveTime = 0;
            }
		});				

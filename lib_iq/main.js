//like I.Q game

var DEBUG_MODE = true;
var DEBUG_LABEL_H = 50;

var bearImage    = './images/chara1.png';
var bgImage      = './images/enchant_frame.png';
var stoneImage   = './images/stone.png';
var blueStoneImage = './images/blueStone.png';
var greenStoneImage = './images/greenStone.png';
var blackStoneImage = './images/blackStone.png';
var redStoneImage = './images/redStone.png';
var blueGreenStoneImage = './images/blueGreenStone.png';
var gameClearImage = './images/clear.png';
var gameOverImage = './images/end.png';
var highLightImage = './images/highLight.png';
var shadowImage = "./images/shadow.png";

enchant();
window.onload = function(){
    game = new Core(512, 512);
    game.fps = 30;
    game.preload(gameClearImage, gameOverImage, bearImage, highLightImage);
    game.onload = function () {

//******************************
    //  グローバルな状態変数
//******************************
        var gameLevel = 0;//初期難易度
        var gameCoLevel = 0;//各難易度内の問題順
        var isRandomGame = false;//ランダム生成モードか
        var isDoubleSpeed = false;//倍速モードか
   
        var scene;//scene3D
        var cubes = [];//キューブ配列
        var floors = [];//床面2次元配列
        var floorsCube = [];
        var player;//プレイヤーモデル

        //ゲーム内に残っているキューブの数
        var lestNormalCube = 0;
        var lestAdvantageCube = 0;
        var lestForbiddenCube = 0;

        //ゲームスピード
        //rollFrame *n = rollCycleにしておかないと残キューブ数の取得で0を出す
        var rollFrame = 15;//90度回転にかかるフレーム数
        var rollCycle = 30;//回転から次の回転までの周期
        
        //ボタン押下多重判定防止
        upButtonStack = 0;
        downButtonStack = 0;
        rightButtonStack = 0;
        leftButtonStack = 0;
        aButtonStack = 0;
        bButtonStack = 0;

        var isGameMode = false; //カメラの動き追従用フラグ(ステージ開始時の動き)
        var duringWipeFbd = false;//Fbdキューブ押し流し用状態変数（RefleshGameで初期化）
        var isHandlerSet = false;//ハンドラのイベントリスナ多重付与防止

        var floorLength = 20;//床の最初の長さ

        var initCubeArray;//ステージ追加ごとに代入されるキューブ生成用配列

        //ユーザースコア
        var ternCount = 0;//マーカー設置以降の経過ターン数

        //演出のためtimeとlestTimeCounterを止める場合
        nothingEffectsQue = true;

//******************************
    //  キーバインドの設定
//******************************
 //-----キーイベントの生成
        var initUI = function(){
            game.keybind(90, 'a');// zキー  
		    game.keybind(88, 'b');// xキー  
		    game.keybind(67, 'c');// cキー  

            //プレイヤー操作時に、一度のボタン押下で一度だけ行う処理のためのフラグを生成するイベント
//カーソルキースタック
            game.addEventListener('upbuttonup', function(){
                upButtonStack = 0;
            });
            game.addEventListener('downbuttonup', function(){
                downButtonStack = 0;
            });
            game.addEventListener('rightbuttonup', function(){
                rightButtonStack = 0;
            });
            game.addEventListener('leftbuttonup', function(){
                leftButtonStack = 0;
            });
//ボタンスタック
            game.addEventListener('abuttondown', function(){
                console.log("abuttondown");
            })
            game.addEventListener('abuttonup', function(){
                aButtonStack = 0;//初期化
                console.log("abuttonup");
            })
            game.addEventListener('bbuttondown', function(){
                console.log("bbuttondown");
            })
            game.addEventListener('bbuttonup', function(){
                bButtonStack = 0;
                console.log("bbuttonup");
            })
        }

//-----ゲーム開始画面で使うオブジェクト

//******************************
    //  スタート画面
//******************************
//-----ゲーム開始メニューとコンフィグの生成
        var initStartMenu = function(){
            //メニューラベルのクラス定義
            var Menu = enchant.Class.create(enchant.Label,{
                initialize: function(scene, y, text){
                    enchant.Label.call(this);
                    this.x = 256;
                    this.y = y;
                    this.font = "30px bold sans";
                    this.color = "red";
                    this.text = text;
                    scene.addChild(this);
                    this.x -= this._boundWidth/2;//中央揃え(addchildより先だと_boundWidhtはdef:1なので機能しない)
                }
            });
            
            var labelOpacity = 1;
//-----ユーティリティ
            var moveToGame = function(){
                 game.popScene();//シーンを戻してからゲーム画面に遷移
                initializeGame();           
            }
            var moveToConfig = function(){
                focusStartMenu = 1;
                focusConfigMenu = 0;
                startScene.tl.moveBy(-512, 0, 15, enchant.Easing.QUAD_EASEINOUT).then(function(){
                    game.transitionPush(configScene);
                });
            }
//-----スタートメニュー画面
            var startScene = new Scene(512, 512);
            startScene.backgroundColor = "black";

            //難易度変数に応じたゲームを開始する
            var startButton = new Menu(startScene, 200, "START");
            startButton.addEventListener('touchstart', function(){
                moveToGame();
            })

            //設定画面へ遷移
            var configButton = new Menu(startScene, 400, "CONFIG");
            configButton.addEventListener('touchstart', moveToConfig);

            game.pushScene(startScene);

//-----スタート画面でのキーイベント実装
            var focusStartMenu = 0;//メニューでキー操作するためのフォーカス情報
            startScene.addEventListener('enterframe', function(){
//カーソルキーの動作
                if(game.input.up && (upButtonStack == 0)){
                    focusStartMenu--;
                    upButtonStack = 1;
                }else if(game.input.down && (downButtonStack == 0)){
                    focusStartMenu++;
                    downButtonStack = 1;
                }
//決定ボタンの動作
                if(game.input.a && (aButtonStack == 0)){
                    if(focusStartMenu % 2 == 0){
                        moveToGame();
                    }else if(focusStartMenu % 2 == 1){
                        moveToConfig();
                    }
                    aButtonStack = 1;
                }
            })
//-----スタート画面でのフォーカス表示スプライト
            var fSMS = new Sprite(32,32);
            fSMS.x = 150;
            fSMS.y = 200;
            fSMS.image = game.assets[bearImage];
            startScene.addChild(fSMS);
            fSMS.addEventListener('enterframe', function(){
                if(focusStartMenu % 2 == 0){
                    this.y = 200;
                }else if(focusStartMenu % 2 == 1){
                    this.y = 400;
                }
            })

//******************************
    //  コンフィグ画面
//******************************
//-----設定メニュー画面
            //座標テーブル
            var m02 =  50;
            var m11 = 100;
            var m12 = 150;
            var m21 = 200;
            var m22 = 250;
            var m31 = 300;
            var m32 = 350;
            var m41 = 400;

            var configScene = new Scene(512, 512);
            configScene.backgroundColor = "black";

            var focusRim = new Sprite()
            
            //モード表示ラベル
            var gameMode = new Menu(configScene, m02, "GAMEMODE");
            gameMode.addEventListener('touchstart', function(){
                focusConfigMenu = 0;
            })

            //モードハイライトのスプライト
            var modeH = new Sprite(32,32);
            modeH.x = 145;
            modeH.y = m11;
            modeH.scaleX = 6;
            modeH.image = game.assets[highLightImage];
            modeH.opacity = 0.5;
            configScene.addChild(modeH);

            //選択モード（ノーマル）のラベル
            var normalMode = new Menu(configScene, 100, "NORMAL");
            var normalModeTouchEvent = function(){
                focusConfigMenu = 0;
                isRandomGame = false;
                modeH.tl.tween({
                   x: 145,
                   y: m11,
                   scaleX: 6,
                   scaleY: 1,
                   time: 10,
                   easing: enchant.Easing.QUART_EASEOUT
               });
                console.log("normalMode");
            };
            normalMode.x = m11;
            normalMode.addEventListener('touchstart', normalModeTouchEvent);


            //選択モード（ランダム）のラベル
            var randomMode = new Menu(configScene, m11, "RANDOM");
            var randomModeTouchEvent = function(){
                focusConfigMenu = 0;
                isRandomGame = true;
                modeH.tl.tween({
                    x: 345,
                    y: m11,
                    scaleX: 6,
                    scaleY: 1,
                    time: 10,
                    easing: enchant.Easing.QUART_EASEOUT
                });
                console.log("randomMode");
            };
            randomMode.x = 300;
            randomMode.addEventListener('touchstart', randomModeTouchEvent);


            //難易度表示ラベル
            var difficulty = new Menu(configScene, m12, "DIFFICULTY");
            difficulty.addEventListener('touchstart', function(){
                focusConfigMenu = 1;
            })

            //難易度ハイライトのスプライト
            var levelH = new Sprite(32,32);
            levelH.x = 256 - 16 + (gameLevel - 2) * 40;
            levelH.y = m21;
            levelH.image = game.assets[highLightImage];
            levelH.opacity = 0.5;
            configScene.addChild(levelH);

            //難易度を5段階で表示
            for(var i=0;i<5;i++){
                var level = new Menu(configScene, m21, ""+(i));
                level.x += (i-2) * 40;
                level.diffNum = i;
                level.addEventListener('touchstart', function(){
                    focusConfigMenu = 1;
                    gameLevel = this.diffNum;
                    levelH.tl.moveTo(256 - 16 + (gameLevel - 2) * 40, m21, 5, enchant.Easing.QUAD_EASEOUT);
                console.log("gameL: "+ gameLevel);
                })
            }
            //引数で難易度を変更する処理
            var levelTouchEvent = function(num){
                if(num <  0){num = 0};
                if(num >= 5){num = 4};
                focusConfigMenu = 1;//一応入れておく
//                if(num < 0){num += 5};
                gameLevel = num;
                levelH.tl.moveTo(256 - 16 + (gameLevel - 2) * 40, m21, 5, enchant.Easing.QUAD_EASEOUT);
                console.log("gameL: "+ gameLevel);
            }
            
            //ゲームスピード表示ラベル
            var difficulty = new Menu(configScene, m22, "SPEED");
            difficulty.addEventListener('touchstart', function(){
                focusConfigMenu = 2;
            })
        
             //スピードハイライトのスプライト
            var speedH = new Sprite(32,32);
            speedH.x = 145;
            speedH.y = m31;
            speedH.scaleX = 6;
            speedH.image = game.assets[highLightImage];
            speedH.opacity = 0.5;
            configScene.addChild(speedH);  

             //スピード等倍のラベル
            var normalSpeedMode = new Menu(configScene, m31, "NORMAL");
            var normalSpeedModeTouchEvent = function(){
                focusConfigMenu = 2;
                isDoubleSpeed = false;
                //状態変数変更
                rollFrame = 15;
                rollCycle = 30;
                
                speedH.tl.tween({
                   x: 145,
                   y: m31,
                   scaleX: 6,
                   scaleY: 1,
                   time: 10,
                   easing: enchant.Easing.QUART_EASEOUT
               });
                console.log("normalSpeed");
            };
            normalSpeedMode.x = 100;
            normalSpeedMode.addEventListener('touchstart', normalSpeedModeTouchEvent);           

             //スピード2倍のラベル
            var doubleSpeedMode = new Menu(configScene, m31, "DOUBLE");
            var doubleSpeedModeTouchEvent = function(){
                focusConfigMenu = 2;
                isDoubleSpeed = true;
                //状態変数変更
                rollFrame = 8;
                rollCycle = 16;
                
                speedH.tl.tween({
                   x: 345,
                   y: m31,
                   scaleX: 6,
                   scaleY: 1,
                   time: 10,
                   easing: enchant.Easing.QUART_EASEOUT
               });
                console.log("doubleSpeed");
            };
            doubleSpeedMode.x = 300;
            doubleSpeedMode.addEventListener('touchstart', doubleSpeedModeTouchEvent);   


            //戻るラベル
            var back = new Menu(configScene, m41, "BACK");
            var backTouchEvent = function(){
                focusConfigMenu = 3;
                configScene.tl.moveBy(512,0, 15, enchant.Easing.QUAD_EASEINOUT).then(function(){
                    game.popScene();
                    startScene.x=0;
                    startScene.x = -512;
                    startScene.tl.delay(1).then(function(){
                        startScene.tl.moveTo(0,0,15, enchant.Easing.QUAD_EASEINOUT);

                        configScene.x=0;//init Fix position
                    })
                })
                console.log("back to Start");
            };
            back.addEventListener('touchstart', backTouchEvent);

//-----設定画面でのフォーカス表示スプライト(くま)
            var fCMS = new Sprite(32,32);
            fCMS.x = 120;
            fCMS.y = m21;
            fCMS.image = game.assets[bearImage];
            configScene.addChild(fCMS);

            fCMS.addEventListener('enterframe', function(){
                frag = focusConfigMenu % 4;
                if(frag == 0){
                    this.x = 120;
                    this.y = m02;
                }else if(frag == 1  || frag == (-3)){
                    this.x  =120;
                    this.y = m12;
                }else if(frag == 2 || frag == (-2)){
                    this.x = 160;
                    this.y = m22;
                }else if(frag == 3 || frag == (-1)){
                    this.x = 160;
                    this.y = m41;
                }
            })

//-----設定画面でのキーイベント実装
            var focusConfigMenu = 0;//メニューでキー操作するためのフォーカス情報

            var keyEventState = [];
            //フラグ0
            keyEventState[0] = {
                inputUp: function(){
//                    focusConfigMenu--;
                    upButtonStack = 1;    
                },
                inputDown: function(){
                    focusConfigMenu++;
                    downButtonStack = 1;
                },
                inputLeft: function(){
                     if(isRandomGame == true){
                        normalModeTouchEvent();
                    }else if(isRandomGame == false){
                        randomModeTouchEvent();
                    }                   
                    leftButtonStack = 1;
                },
                inputRight: function(){
                     if(isRandomGame == true){
                        normalModeTouchEvent();
                    }else if(isRandomGame == false){
                        randomModeTouchEvent();
                    }                   
                    rightButtonStack = 1;
                },
                inputA: function(){
                    if(isRandomGame == true){
                        normalModeTouchEvent();
                    }else if(isRandomGame == false){
                        randomModeTouchEvent();
                    }                    
                    aButtonStack = 1;    
                },
                inputB: function(){
                    backTouchEvent();
                    bButtonStack = 1;
                }
            };

            //フラグ1
            keyEventState[1] = {
                inputUp: function(){
                    focusConfigMenu--;
                    upButtonStack = 1;    
                },
                inputDown: function(){
                    focusConfigMenu++;
                    downButtonStack = 1;
                },
                inputLeft: function(){
                    levelTouchEvent( (gameLevel) % 5 - 1 );
                    leftButtonStack = 1;
                },
                inputRight: function(){
                    levelTouchEvent( (gameLevel) % 5 + 1 );
                    rightButtonStack = 1;
                },
                inputA: function(){
                    aButtonStack = 1;    
                },
                inputB: function(){
                    backTouchEvent();
                    bButtonStack = 1;
                }
            };

            //フラグ2
            keyEventState[2] = {
                inputUp: function(){
                    focusConfigMenu--;
                    upButtonStack = 1;    
                },
                inputDown: function(){
                    focusConfigMenu++;
                    downButtonStack = 1;
                },
                inputLeft: function(){
                     if(isDoubleSpeed == true){
                        normalSpeedModeTouchEvent();
                    }else if(isDoubleSpeed == false){
                        doubleSpeedModeTouchEvent();
                    }                   
                    leftButtonStack = 1;
                },
                inputRight: function(){
                     if(isDoubleSpeed == true){
                        normalSpeedModeTouchEvent();
                    }else if(isDoubleSpeed == false){
                        doubleSpeedModeTouchEvent();
                    }                   
                    rightButtonStack = 1;
                },
                inputA: function(){
                    aButtonStack = 1;    
                },
                inputB: function(){
                    backTouchEvent();
                    bButtonStack = 1;
                }
            };
            //フラグ3
            keyEventState[3] = {
                inputUp: function(){
                    focusConfigMenu--;
                    upButtonStack = 1;    
                },
                inputDown: function(){
                    focusConfigMenu++;
                    downButtonStack = 1;
                },
                inputLeft: function(){
                    leftButtonStack = 1;
                },
                inputRight: function(){
                    rightButtonStack = 1;
                },
                inputA: function(){
                    backTouchEvent();
                    aButtonStack = 1;    
                },
                inputB: function(){
                    backTouchEvent();
                    bButtonStack = 1;
                }
            };

            configScene.addEventListener('enterframe', function(){
            frag = focusConfigMenu % 4;
//-----カーソルキーの動作
                if(game.input.up&& (upButtonStack == 0)){
                    keyEventState[frag].inputUp();
                }else if(game.input.down && (downButtonStack == 0)){
                    keyEventState[frag].inputDown();
                }else if(game.input.left && (leftButtonStack == 0)){
                    keyEventState[frag].inputLeft();
                }else if(game.input.right && (rightButtonStack == 0)){
                    keyEventState[frag].inputRight();
                }
//-----ボタンの動作
                if(game.input.a && (aButtonStack == 0)){
                    keyEventState[frag].inputA();
                }else if(game.input.b && (bButtonStack == 0)){
                    keyEventState[frag].inputB();
                }
            })
        }


//******************************
        //  ゲーム本体の3D用部品
//******************************
//-----ゲーム本体で使うオブジェクト

//-----GUI部品生成クラス


//******************************
        //シーンとカメラの設定
//******************************
        var createScene3d = function (){
             //シーン空間生成
            scene = Scene3D();
            scene.backgroundColor = [0.1, 0.2, 0.25, 1];
            //カメラ初期位置の設定
            var camera = scene.getCamera();
            camera.x = 0;//0.5 - initCubeArray.length/2 -1;
            camera.y = 30 + (initCubeArray.length-4)*6;
            camera.z = 55 + (initCubeArray.length-4)*10;

            //カメラの挙動(initCameraと一致させること)
            game.addEventListener('enterframe',function(){
                if(isGameMode){
                    camera.x += (player.x * 4 - camera.x) / 5;//プレイヤーの動きに合わせてカメラを動かす
                    /*
                    camera.y = 30 + (initCubeArray.length-4)*6;
                    camera.z = 55 + (player.z)/1 -7 + (initCubeArray.length-4)*5;
                    */
                    camera.y += (30 + (initCubeArray.length-4)*6 - camera.y) / 5;
                    camera.z += (55 + (player.z)/1 -7 + (initCubeArray.length-4)*5 - camera.z) / 5;
                    
                    camera.centerZ = -10 + (player.z)/1 -14  + (initCubeArray.length-4)*5;
                    if(initCubeArray.length <= 3){
                        camera.centerY = -10;
                    }else{
                        camera.centerY = -5;
                    };
                };
            });

            var light = new DirectionalLight(); // 平行光源生成
            light.directionZ = 1;               // 向き
            light.directionY = 1;
            light.color = [0.3, 0.3, 0.3];      // 色
            scene.setDirectionalLight(light);   // scene にセット

        };

//******************************
        //2DスプライトのUI部品を生成
//******************************
        var createScene2d = function(){
                //フレームレートを表示
                var lastDate = new Date;
                var param = new Label("");
                param.x = 15;
                param.y = 5;
                param.font = "20px bold sans";
                param.text = "0 fps";
                param.color = "black";
                game.rootScene.addChild(param);
                param.onenterframe = function(){
                    var thisDate = new Date;
                    framedata = Math.round(1000 / (thisDate - lastDate));
                    lastDate = thisDate;
                    param.text = framedata+"/"+game.fps+ " fps";
                };
                //現在のレベルとステージを表示
                var levelSprite = new Label();
                levelSprite.x = 250;
                levelSprite.y = 5;
                levelSprite.font = "25px bold sans";
                levelSprite.text = "loading";
                levelSprite.color = "red";
                game.rootScene.addChild(levelSprite);
                levelSprite.onenterframe = function(){
                    this.text = "Lv."+gameLevel+", Stage."+(gameCoLevel-1)+" / "+(problems[gameLevel].length);
                };

                //ステージの目標ターン数を表示
                var aimL = new Label();
                aimL.x = 250;
                aimL.y = 25;
                aimL.font = "25px bold sans";
                aimL.text = "";
                aimL.color = "red";
                game.rootScene.addChild(aimL);
                aimL.onenterframe = function(){
                    this.text = "aim: " + initCubeArray.aim;
                };
            //デバッグ用パラメータを表示する
            if(DEBUG_MODE == true){
                var nCubeL = new Label();
                nCubeL.x = 5;
                nCubeL.y = DEBUG_LABEL_H;
                nCubeL.text = "";
                nCubeL.color = "red";
                nCubeL.font = "25px bold sans";
                enchant.Core.instance.rootScene.addChild(nCubeL);
                nCubeL.onenterframe = function(){
                    this.text = "NCube: " + lestNormalCube;
                };
                var aCubeL = new Label();
                aCubeL.x = 5;
                aCubeL.y = DEBUG_LABEL_H + 20;
                aCubeL.text = "";
                aCubeL.color = "red";
                aCubeL.font = "25px bold sans";
                enchant.Core.instance.rootScene.addChild(aCubeL);
                aCubeL.onenterframe = function(){
                    this.text = "ACube: " + lestAdvantageCube;
                };
                var fCubeL = new Label();
                fCubeL.x = 5;
                fCubeL.y = DEBUG_LABEL_H + 40;
                fCubeL.text = "";
                fCubeL.color = "red";
                fCubeL.font = "25px bold sans";
                enchant.Core.instance.rootScene.addChild(fCubeL);
                fCubeL.onenterframe = function(){
                    this.text = "FCube: " + lestForbiddenCube;
                };
                var floorL = new Label();
                floorL.x = 5;
                floorL.y = DEBUG_LABEL_H + 60;
                floorL.text = "";
                floorL.color = "red";
                floorL.font = "25px bold sans";
                enchant.Core.instance.rootScene.addChild(floorL);
                floorL.onenterframe = function(){
                    this.text = "Floor: " + floors[0].length;
                };
            };
        };

//******************************
        //ゲーム導入時にキューブが隆起するエフェクトを発生させる処理
//******************************
        var createStageIntroduction = function(array, createFunc){
            //隆起する秒数はキューブ配列長による
            var counter = array.length *15 + 30;
            var hoge = new Sprite(1,1);//適当なイベントリスナ
            game.rootScene.addChild(hoge);//nodeに加える
            //カウンタ数だけゲーム開始を遅らせる
            hoge.addEventListener('enterframe', function(){
                counter--;//カウンタ減算
//                console.log(counter);
                if(counter < 0){
                    //-----カウンタが終了したらゲーム開始処理を呼ぶ
                    //ゲーム用キューブ、イベントハンドラーを生成
                    createFunc(array);
                    initGameHandler();
                    //カメラをゲームモードにする
                    isGameMode = true;
                    //Fbdキューブを流すフラグを初期化
                    duringWipeFbd = false;
                    //隆起用キューブは捨てる
                    for(var i=0,max=introCubes.length;i<max;i++){
                        scene.removeChild(introCubes[i]);
                        introCubes[i].removeEventListener('enterframe', arguments.callee);
                        delete introCubes[i];
                    }
                    introCubes = [];//キューブ配列を初期化
                    hoge.removeEventListener('enterframe', arguments.callee);//リスナーを初期化
                    hoge=null;
                };
            });
            
            var introCubes = [];
            //隆起するキューブを生成
            var margin = 2;
            for(var i=0,max=array.length;i<max;i++){
                for(var j=0,maxJ=array[i].length;j<maxJ;j++){
                    var cube = new NormalQube();
                    cube.x = (j - array[0].length/2) *margin + 1;
                    cube.y = -3 - i;
                    cube.z = i *margin;
                    scene.addChild(cube);
                    introCubes.push(cube);
                    cube.addEventListener('enterframe', function(){
                       this.y += 0.1;
                       if(this.y >= 0){
                            this.removeEventListener('enterframe', arguments.callee);
                        };
                    });
                }
            }
            //導入中のカメラの挙動制御(cameraと一致させること)
            var introCamera = scene.getCamera();
            introCamera.x = 10;
            introCamera.y = 1;
            introCamera.z = 0;
            introCamera.centerZ = 0;
            hoge.addEventListener('enterframe', function(){
                if(!isGameMode){
                    introCamera.x += (0 - introCamera.x) /20;
                    introCamera.y += (30 + (array.length-4)*6 - introCamera.y)/20;
                    introCamera.z += ( (55 + (player.z)/1 -7 + (array.length-4)*5 ) - introCamera.z)/20;

                    introCamera.centerZ += (-10 + (player.z)/1 -14  + (array.length-4)*5  - introCamera.centerZ)/20;
                    if(initCubeArray.length <= 3){
                        introCamera.centerY = -10;
                    }else{
                        introCamera.centerY = -5;
                    };
                }
            });
        }

//******************************
        //キューブ配列を生成
//******************************
        var createCubeArray = function(){
            if(isRandomGame){
                initCubeArray = randomCubeArray(gameLevel+2,gameLevel+3);
            }else if(!isRandomGame){
//                console.log("generating initCube. Lv."+gameLevel + " coLv."+gameCoLevel);
//                if(gameLevel != 0 && gameCoLevel != 0){
//                    if(problems[gameLevel][gameCoLevel] == undefined){
//                        gameLevel++;
//                        gameCoLevel = 0;
//                    }
//                    if(problems[gameLevel] == undefined){
//                        console.log("last problem");
//                    }
//                }
                if(gameCoLevel >= problems[gameLevel].length ){
                    gameCoLevel = 0;
                    gameLevel++;
                    console.log("switch to new Lv."+gameLevel);
                }
                if(gameLevel >= problems.length){
                    console.log("game clear");
                }

                initCubeArray = problems[gameLevel][gameCoLevel];//ここにprogramからリストを拾ってきて問題を生成する
                gameCoLevel++;
            }
        }


//******************************
        //座標軸を生成
//******************************
        var createAxis = function(){
//           var axis = new Axis(scene);
        }

//******************************
        //床面を生成
//******************************
        var createFloor = function(array){
            var scale = 1;
            var margin = 2;
            var texture = new Texture();

            for(var i=0,max=array[0].length;i<max;i++){
                floors[i] = [];
                floorsCube[i] = [];
                for(var j=0;j<floorLength;j++){ //array[i].lengthではフィールドにならない
                    var plane = new Floor(scale);
                    plane.x =  (i - array[0].length/2) * scale * margin + 1; 
                    plane.y = -1;
                    plane.z =  j * scale * margin;
                    plane.arrayNumX = i;//配列上の位置を持たせる（popでは変化しない）
                    plane.arrayNumY = j;
                    plane.parentArray = floors;//親配列を持たせる
                    scene.addChild(plane);
                    floors[i].push(plane);

                    //足場の石柱を作る
                    //外周だけ
                    for(var k=0;k<1;k++){//三段
//                        if( ((i==0) || (i==array[0].length-1)) || ((j==0) || (j==floorLength-1)) ){
                        if(true){
                            var footCube = new FloorQube(floorsCube);
                            footCube.x =  (i - array[0].length/2) * scale * margin + 1;
                            footCube.y = -2 * (k+1) -0.05;//床より若干下げる
                            footCube.z = j * margin;

                            footCube.arrayNumX = i;//配列上の位置を持たせる（popでは変化しない）
                            footCube.arrayNumY = j;

                            footCube.scene = scene;//シーンを持たせる

                            scene.addChild(footCube);
                            floorsCube[i].push(footCube);
                        }
                    }

                }
            }
        }


//******************************
        //キューブ群を生成
//******************************
        var createCubes = function (array){

            var margin = 2;
            for(var i=0,max=array.length;i<max;i++){
                for(var j=0,maxJ=array[i].length;j<maxJ;j++){
                    if(array[i][j] == 2){
                        var cube = new ForbiddenQube();
                        cube.parentFloor = floors;
                        cube.parentFloorCube = floorsCube;//FBDの場合は配列を追加で持たせる
                        cube.parentScene = scene;
                        lestForbiddenCube++;
                    }else if(array[i][j] == 1){
                        var cube = new AdvantageQube();
                        lestAdvantageCube++;
                    }else{
                        var cube = new NormalQube();
                        lestNormalCube++;
                    }
                    cube.x = (j - array[0].length/2) *margin + 1;
                    cube.y = 0;
                    cube.z = i *margin;
                    scene.addChild(cube);
                    cubes.push(cube);//配列に組み込む
                    cubes.parentArray = cubes;//子から親が読めるようにしておく
                }
            }
        };

//******************************
        //プレイヤーモデルを生成
//******************************
        var createPlayer = function(){
            player = new Player();
            //playerクラスの矩形当たり判定の取り方と一歩の間隔で
            //床面の境目に入り込むと判定に齟齬があるため、小数点座標に配置する
            player.x = 0.1 ;
            player.y = 1.1;
            player.z = 14 + initCubeArray.length;
            scene.addChild(player);
        }

        //ゲームクリアスプライトを表示
        var createGameSprite = function(message){

        }


//-----init UI
//******************************
        //画面表示部品の生成関数をまとめる
//******************************
        var init3dGUI = function(){
            createCubeArray();
            createScene3d();
            createScene2d();
            createAxis();
            createFloor(initCubeArray);
            createPlayer();
            createStageIntroduction(initCubeArray, createCubes);//コールバックでキューブ生成処理を渡す
//            createCubes(cubeArray);
        };


//-----イベントコントロールハンドラ
//******************************
        //動作タイミングの管理、キーイベント、フラグなどの管理イベントの生成
//******************************
        var initGameHandler = function(){

            var time = 0; //キューブの回転タイミングを管理
            var enableDeleteCube = false; //[フラグ]回転停止時ごとに1度だけマーカー解除からキューブを削除できる(回転動作中に削除させない)
            var lestTimeCounter = 0;//何らかの演出などを処理している間は、新しい回転動作を行わない。
            var breakStack = 0;//FBDキューブ消去によって破壊される床の残破壊数
            var breakStackCounter = 0;//床削除のスタック処理重複を避ける

//-----キーバインドの追記
//            game.addEventListener('abuttonup', function(){
//                player.aButtonStack = 0;//初期化
//            })
//            game.addEventListener('bbuttonup', function(){
//                player.bButtonStack = 0;
//            }) 


//-----毎フレームの基本ロジック処理
            var setFrameEvent = function(){
                //プレイヤーの載っている床面を更新
//                player.getStayFloor(floors);
//
//                //崩れた床に乗っていればゲームオーバー判定
                    if(time > rollCycle){
                        if(player.stayFloor.isBroken == true){
                            console.log("stamped!!");
                            player.stamped();
                            this.removeEventListener('enterframe', arguments.callee);
                        }
                    }
                //半ターンに1度床面とキューブの走査を行う(密に行うほど精緻な判定になるが処理に影響する)(回転が停止し、enableが有効になるタイミング、回転開始にタイミング)
                if(time % rollFrame == 0){
                    refleshFloorsRelation();//状態の更新

                    //回転が止まったタイミング
                    if(time % rollCycle != 0){
//                        console.log("enable: "+enableDeleteCube +", change to true." + "time: "+time +", ");
                        //回転が止まったタイミングでキューブを消せる状態変数に置き換える
                        enableDeleteCube = true;

                        //プレイヤーとキューブが同じ床面にいれば押しつぶし判定してゲーム終了
                        if(player.stayFloor.targetCube != null){
                            console.log("stamped!!");
                            player.stamped();
                            this.removeEventListener('enterframe', arguments.callee);
                        }
                    }

                }
                //30フレームに1度回転処理を呼び出す
                if(time % rollCycle == 0 ){
                    //回転中はマーカー解除してもキューブを捕獲できない
                    enableDeleteCube = false;
                    //15フレームで90度回転させる指示を与える
                    for(var i=0,max=cubes.length;i<max;i++){
                        cubes[i].roll(90,rollFrame);
                    }

                }
                //1フレーム早く状態を変更する（回転開始と削除のバッティング防止）
                if(time % rollCycle <= 1){
                    enableeleteCube = false;
                }

//-----lestTimeで管理するイベント

                //削除演出中で無ければカウンタを回す
                if(lestTimeCounter <= 0){
                    time++;
                }else{
                    if(nothingEffectsQue = true){
                        lestTimeCounter -= 1;
                        if( !(lestNormalCube == 0 && lestAdvantageCube == 0 && lestForbiddenCube > 0) ){//
                            refleshFloorsRelation();//状態の更新
                        }
                    };
                }

                //FBDキューブ消去のスタックがある場合、床を1列壊す(スタックカウンターが0の場合)
                if(breakStack > 0 && breakStackCounter <= 0){
                    breakEdgeFloor();
                    breakStackCounter = 20 + initCubeArray.length *2;
                    breakStack -= 1;
                    console.log("breakStack: "+ breakStack);
                }else if(breakStack > 0){
                    breakStackCounter -= 1;;
                }

//-----それ以外の条件で管理されるイベント
                //現在のステージクリア条件を満たした場合(かつ、ステージ隆起演出中でない場合)
                if(lestNormalCube + lestAdvantageCube + lestForbiddenCube == 0 && isGameMode == true){
                    console.log("stageClear");
                    console.log("N: "+ lestNormalCube + ", A :"+ lestAdvantageCube + ", F: " + lestForbiddenCube  + "|| time: " + time + "|| lest: " +lestTimeCounter );
                    lestTimeCounter = 10;
                    refleshGame();
                };

                //FBD以外削除されている場合
                if(lestNormalCube == 0 && lestAdvantageCube == 0 && duringWipeFbd == false ){
                    console.log("else FBD deleted");
                    console.log("N: "+ lestNormalCube + ", A :"+ lestAdvantageCube + ", F: " + lestForbiddenCube  + "|| time: " + time + "|| lest: " +lestTimeCounter );
                    //早送り
                    for(var i=0,max=cubes.length;i<max;i++){
                        cubes[i].roll(90,Math.round(rollFrame/4));
                        cubes[i].addEventListener('enterframe', function(){
                            if(this.receiveTime == 0){
                                this.roll(90, Math.round(rollFrame/4));
                            }
                        })
                        lestTimeCounter = rollFrame * 4;
                    }
                    duringWipeFbd = true;

                }

//                //キューブ削除された場合に、キューブが沈んだタイミングで床面との関係を更新する（playerを歩かせる為）
//                if(lestTimeCounter == rollFrame *2 - 8){
//                    refleshFloorsRelation();
//                    console.log("lestTime: "+lestTimeCounter);
//                }
//                  上記でリフレッシュを呼んでいるので無効にした

            };
            if(isHandlerSet == false){
                game.addEventListener('enterframe', setFrameEvent);
            }

//******************************
//-----カーソルキー入力へのアクション
//******************************

//-----プレイヤーのアクション
            //一度の押下で何度も行う処理
            var setPlayerEvent = function(){
                //移動前の座標を保存
                this.bx = this.x;
                this.bz = this.z;
                this.bStayFloor = this.stayFloor;

                if(this.isStamped == false){
                    
                    if (game.input.left){
                        this.x -= 1.5/5;
                    };
                    if (game.input.right){
                        this.x += 1.5/5;
                    };  
                    if (game.input.up){
                        this.z -= 1.5/5;
                    };  
                    if (game.input.down){
                       this.z += 1.5/5;
                    };
                };
                 //移動結果に基づいて床面との関係を更新
                 this.getStayFloor(floors);
                //もし前のフレームと違う床面に載っていた場合、かつ、回転中でない場合
                 if(this.bStayFloor != this.stayFloor && (time % rollCycle > rollFrame) ){
                    //新しいフレームにキューブが載っていたら
                    if(this.stayFloor.targetCube != null 
                        || this.stayFloor.isBroken){
                        //動作を差し戻す
                        this.x = this.bx;
                        this.z = this.bz;

                        //座標を戻して積載関係を更新する
                        this.getStayFloor(floors);
                    }
                }
                //ステージ外に出ていた場合
                if( (floors[0][0].x -1 > player.x ) 
                    || (floors[floors.length-1][floors[0].length-1].x +1 < player.x ) ) {
                    console.log("out!");
                    this.x = this.bx;
                }
                if((floors[0][0].z -1 > player.z )
                    || (floors[floors.length-1][floors[0].length-1].z +1 < player.z ) ){
                    //差し戻し

                    console.log("out!");
                    this.z = this.bz;
                }

//******************************
//-----ボタン入力へのアクション
//******************************
                 //z
                 //一度の押下で一度だけ行う処理
                 if(game.input.a && (aButtonStack == 0) ){

                     if(time % rollCycle > rollFrame){//キューブが静止している状態のとき
                     refleshFloorsRelation();//床面の参照状態を更新する
                     }

                    //マーカーをセットする
                     if(this.markedFloor == null){
                         //マーカーを貼った床面を保持する
                         this.markedFloor = this.stayFloor;
                         //床面にマーカーをセットする
                         this.stayFloor.isMarker = !this.stayFloor.isMarker;

                    //マーカーを解除する
                     }else{
                        this.markedFloor.isMarker = !this.markedFloor.isMarker;//マークした床面をノーマークに戻す
                        //まだキューブを消していない、かつ、回転中でない
                        if(enableDeleteCube){
//                            console.log("solve Marker");
                            this.markedFloor.solveMarker(); //マーカー解除処理を呼ぶ

                            //マーカー解除した床面にキューブが載っていれば、処理を呼ぶ
                            if(this.markedFloor.targetCube != null){
                                lestTimeCounter =  rollFrame *2;//キューブを削除したら30フレーム待機してから次の回転を始める
                                //キューブが消えたらフラグを戻すイベントリスナを生成
                                this.markedFloor.targetCube.addEventListener('enterframe', function(){
                                   if(this.y  > 90){
                                        this.removeEventListener('enterframe', arguments.callee);
                                    }
                                })
                            }
                            enableDeleteCube = false;//一度の回転停止時のタイミングで、マーカー解除では複数回消せないようにしておく

                        //回転中にマーカー解除した場合、解除フラグを床に設置する
                        }else if( (time % rollCycle < rollFrame) && (time % rollFrame != 0) && !enableDeleteCube){//回転中で、停止中でない
//                            console.log("回転中マーカー解除");
                            this.markedFloor.isReadySolved = true;
                        }
                        this.markedFloor = null;//保持していた床面を破棄
                    }
                     aButtonStack = 1;//フラグを進める
                 }

                 //ｘ
                 //一度の押下で一度だけ行う処理
                 if(game.input.b && (bButtonStack == 0)&& ( time % rollCycle > rollFrame) ){ //ボタン押下時で、一押下で一回起動するもので、回転まで時間がある
                    //起爆マークがあるときにxボタンを押したとき
                    //すべて床を走査して起爆マークのある床面を探す
                    refleshFloorsRelation();//床面の参照状態を更新する
                    
                    var markedFloors = []; //起爆する床面全て
                    var baseMarkedFloors = []; //基点の床面
                    
                    for(var i=0,max=floors.length;i<max;i++){
                        for(var j=0,maxJ=floors[i].length;j<maxJ;j++){
                            //床面にマークがあった場合
                            if(floors[i][j].isAdvMarked){

                                lestTimeCounter =  rollFrame *2;//rollFrame + rollCycle;//キューブを削除したら45フレーム待機してから次の回転を始める、起爆エリア表示にカウンタを利用する場合は30以上
                                console.log("AdvMark bomb");
                                baseMarkedFloors.push(floors[i][j]); //基点のフラグを解除するためにスタックに保存する
                                //周辺3x3に対してsolveMarkerを呼び出す
                                for(var k=0;k<3;k++){
                                    if( (i+k-1)>-1  && (i+k-1)< floors.length){ //負のインデックスは呼ばない
                                        for(var l=0;l<3;l++){
                                            if( (i+k-1)>-1 && (j+l-1)>-1 ){ //負のインデックスは呼ばない
                                                if(floors[i+k-1][j+l-1] != undefined){ //床面が存在しなければ呼ばない
                                                    //キューブ保護テクニック用ロジック
                                                    if(!floors[i+k-1][j+l-1].isMarker){ //マーカー保護された床面は起爆しない
                                                        markedFloors.push( floors[i+k-1][j+l-1] ); //起爆すべき床面の配列に格納する
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    //格納された起爆する予定の床面にsolveMarkerを呼び出す
                    for(var i=0,max=markedFloors.length;i<max;i++){

//                    markedFloors[i].solveMarker();//即座に起爆する場合
                        //起爆エリア表示後に、一拍待ってから起爆処理を行う
                        markedFloors[i].advTimer = 10; //エリア表示する時間量のカウンタを起動
                        markedFloors[i].isAdvCounted = true;
                        //カウンタを減算し0になったらテクスチャを戻してsolveを行う
                        markedFloors[i].addEventListener('enterframe', function(){
                            this.advTimer -= 1;
                            if(this.advTimer < 0){
                                this.removeEventListener('enterframe', arguments.callee);
                                this.advTimer = null;
                                this.isAdvCounted = false;
                                this.solveMarker();
                                lestTimeCounter = rollFrame *2;
                            }
                        })
                    }

                    markedFloors = null;//配列を捨てる

                    //起爆の基点になった床面のAdvフラグを解除する
                    for(var i=0,max=baseMarkedFloors.length;i<max;i++){
                        baseMarkedFloors[i].isAdvMarked = false;
                    }
                    baseMarkedFloors = null;//配列を捨てる

                    bButtonStack = 1; //フラグを進める
                 }
            };
            if(isHandlerSet == false){
                player.addEventListener('enterframe', setPlayerEvent);
            }

//-----ユーティリティ
//******************************
        //床面とキューブの参照関係を更新する
//******************************
            var refleshFloorsRelation = function(){
                lestForbiddenCube=0;
                lestAdvantageCube=0;
                lestNormalCube=0;

//            var readySolvedFloors = []; //回転終了のタイミングで、マーク解除待機のフラグがある床面にsolveMarkerを送るための床面リスト
                for(var i=0, max=floors.length;i<max;i++){
                    for(var j=0, maxJ=floors[i].length;j<maxJ;j++){
                        var isCarry = floors[i][j].checkOn(cubes);//積載しているキューブのtypeが返る、床とキューブの参照状態の更新が行われる
                        
                        if(isCarry == 0){//ノーマルキューブが載っている
                            lestNormalCube++;
                        }else if(isCarry == 1){
                            lestAdvantageCube++;
                        }else if(isCarry == 2){
                            lestForbiddenCube++;
                        }else if(isCarry == 10){
                            //何も載っていない
                        }else{
                            //想定外の返り値
                        }

                        //回転終了のタイミングで、解除待機の床面があれば解除してsolveを送る
                        //n個消しを実現するための処理
                        //本当はreslTimeの付与などが必要
                        if(floors[i][j].isReadySolved == true){
                            if(floors[i][j].targetCube != null){
                                floors[i][j].solveMarker();
                                lestTimeCounter = rollFrame *2;
                            }
                            //回転が止まったタイミングでlestTimeを付与すると、enable=true条件に合致してしまうため
                            //キューブの内側に入ればマーク&解除が繰り返せる。これを防ぐためtimeを繰り上げて条件を回避する。
                            time++;
                        }
                        floors[i][j].isReadySolved = false;//フラグ解除

                        //FBDキューブを削除した場合、床にフラグが残っているので回収する
                        if(floors[i][j].checkBreakStack() == true){
                            breakStack++;
                            floors[i][j].isBreakFbd = false;
                        }
                    }
                }
//            console.log("N: "+ lestNormalCube + ", A :"+ lestAdvantageCube + ", F: " + lestForbiddenCube + " || enable: " + enableDeleteCube + "|| time: " + time + "|| lest: " +lestTimeCounter );
            };


//******************************
//FBDキューブによる床破壊イベントが発生した場合、スタック数だけ床を破壊する(スタック管理は処理内には置かない)
//******************************
            var breakEdgeFloor = function(){
                //一列の床を削除
                for(var i=0,max=floors.length;i<max;i++){
                    scene.removeChild(floors[i][floors[i].length-1]);
                    floors[i][floors[i].length-1].breakFloor(i);
                }
                //一列の床キューブを削除
                for(var i=0,max=floorsCube.length;i<max;i++){
                    floorsCube[i][floorsCube[i].length-1].breakFloorCube(i);
                    //scene.removeChild(floorsCube[i][floorsCube[i].length-1]);//moveByにremovEChildを先行させない
                }
                console.log("delete floor");

            }
        
            //ハンドラ実行の最後にフラグを立てる
            isHandlerSet = true;//ハンドラが実行されたというログ（リフレッシュでイベントリスナを多重に付与させないため）
        }

//-----reflesh
//******************************
        //次のステージのためにゲームを終了させる初期化処理(床は残る)
//******************************
        //主にinitGameHandlerの外側にある環境変数・参照の解除、initGameHandlerの破棄、状態の初期化
        var refleshGame = function(){
            console.log("refleshGame load.");
            duringWipeFbd = false;//FBDキューブ押し流しの状態変数を初期化
            //キューブと床面の配列を初期化
            for(var i=0,max=cubes.length;i<max;i++){
                scene.removeChild(cubes[i]);
                cubes[i].removeEventListener('enterframe', arguments.callee);
                delete cubes[i];
            };
            cubes = [];

            //init3dGUIの真似
            if( gameCoLevel >= problems[gameLevel].length){//ステージがない場合
                console.log("gameCoLevel >= p[Lv].length");

                //レベル変更時は幅が変わるので床を削除する
                for(var i=0,max=floors.length;i<max;i++){
                    for(var j=0,maxJ=floors[i].length;j<maxJ;j++){
                        scene.removeChild(floors[i][j]);
                        floors[i][j].removeEventListener('enterframe', arguments.callee);
                        delete floors[i][j];

                        scene.removeChild(floorsCube[i][j]);
                        floorsCube[i][j].removeEventListener('enterframe', arguments.callee);
                        delete floorsCube[i][j];
                    }
                }
                floors = []
                floorsCube = [];

                isGameMode = false;

                createCubeArray();
                createFloor(initCubeArray);
                createStageIntroduction(initCubeArray, createCubes);

            }else{//次のステージがある場合
                createCubeArray();
                createCubes(initCubeArray);
            }
        }

//-----initializeGame
//******************************
        //ゲーム本体の初期化処理をまとめて記述
//******************************
        var initializeGame = function (){

            init3dGUI();//画面部品を生成
//            init3dGUI(randomCubeArray(gameLevel+2,gameLevel+3) );//画面部品を生成
        };

//******************************
//ゲーム開始
//******************************
        initUI();//入力系の実装
        initStartMenu();//スタートメニュー生成
    }
    game.start();
}


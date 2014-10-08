//キューブ配列を生成するクラス

var initCubeArray = [
    [ [0], [1], [0] ],
    [ [2], [0], [1] ],
    [ [0], [0], [0] ],
    [ [0], [1], [0] ]
];

var initCubeArray2 = [
    [(0|Math.random()*2),(Math.round(Math.random()*2)),(Math.floor(Math.random()*2))],
    [(Math.floor(Math.random()*2)),(Math.round(Math.random()*2)),(Math.floor(Math.random()*2))],
    [(Math.floor(Math.random()*2)),(Math.round(Math.random()*2)),(Math.floor(Math.random()*2))],
    [(Math.floor(Math.random()*2)),(Math.round(Math.random()*2)),(Math.floor(Math.random()*2))]
];


//******************************
//問題配列
//******************************
var problems = new Array();

//レベル0(1st Stage)
problems[0] = new Array();
problems[0][0] = [
    [0,0,2,2],
    [1,0,0,0]
];
problems[0][1] = [
    [0,1,1,0],
    [0,1,1,0]
]


//レベル1
problems[1] = new Array();
problems[1][0] = [
    [0,2,0,0],
    [0,0,0,0],
    [1,0,2,1],
    [0,0,2,0],
    [0,0,0,0]
];
problems[1][1] = [
    [0,0,0,0],
    [0,0,0,0],
    [1,0,0,1],
    [2,2,1,2],
    [0,0,0,0]
]

//レベル2
problems[2] = new Array();
problems[2][0] = [
    [2,2,0,1,0],
    [0,0,2,0,0],
    [1,0,0,2,1],
    [0,0,2,0,0]
];
problems[2][1] = [
    [0,0,0,2,2],
    [0,0,2,0,0],
    [1,0,0,0,0],
    [2,2,2,0,1]
];

//reate nX x nY random array
//[nX][nY]
var randomCubeArray = function(nX, nY){
    var result = new Array();
    for(var i=0;i<nX;i++){
        result[i] = new Array();
        for(var j=0;j<nY;j++){
            result[i][j] = Math.round(0|Math.random()*2.2);
        }
    }
    return result;
}

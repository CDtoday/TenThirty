$(document).ready(function(){
  //宣告所有的牌
  var cards = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "C11", "C12", "C13", "H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "H11", "H12", "H13", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13"];

  //產生隨機排列
  var cardSort = cards.sort(function (a, b){return Math.random() - 0.5;});

  //重洗牌機制
  function resortCheck() {
    if (cc > 51) {
      cardSort = cards.sort(function (a, b){return Math.random() - 0.5;});
      cc = 0;
    }
  }

  //記點機制
  function totalPoint(who) {
    var plus = 0;
    var point = 0;
    for(var i = 0; i < who.card.length; i ++){
      if (who.card[i].slice(1) <= 10) {
        plus = parseInt(who.card[i].slice(1));
      } else {
        plus = 0.5;
      }
      point += plus;
    }
    return point;
  }

  //只算牌面點數
  function totalFacePoint(who) {
    var plus = 0;
    var point = 0;
    for(var i = 1; i < who.card.length; i ++){
      if (who.card[i].slice(1) <= 10) {
        plus = parseInt(who.card[i].slice(1));
      } else {
        plus = 0.5;
      }
      point += plus;
    }
    return point;
  }

  //發牌機制
  function deal(who) {
    resortCheck();
    who.card[who.card.length] = cardSort[cc];

    //莊家第一張底牌不顯示
    if (who === banker && banker.card.length === 1) {
      $("#" + who.id + "Card" + who.card.length).addClass("blank");
    } else {
      $("#" + who.id + "Card" + who.card.length).addClass(cardSort[cc]);
    }
    cc ++;

    //直接落敗條件(爆點計算)
    if (totalPoint(who) > 10.5) {
      $("#" + who.id + "State").append("爆了！");
      if (who === player) {
        tokenTransfer(-1);
      } else {
        tokenTransfer(1);
      }
      lockAdd();
    }

    //直接獲勝條件
    if (who.card.length === 5 && totalPoint(who) === 10.5) {
      $("#" + who.id + "State").append("十點半 + 過五關！");
      if (who === player) {
        tokenTransfer(5);
      } else {
        tokenTransfer(-1);
      }
      lockAdd();
    } else if (who.card.length === 5 && totalPoint(who) < 10.5) {
      $("#" + who.id + "State").append("過五關！");
      if (who === player) {
        tokenTransfer(3);
      } else {
        tokenTransfer(-1);
      }
      lockAdd();
    } else if (who.card.length !== 5 && totalPoint(who) === 10.5) {
      $("#" + who.id + "State").append("十點半！");
      if (who === player) {
        tokenTransfer(2);
      } else {
        tokenTransfer(-1);
      }
      lockAdd();
    }
    //未贏未輸則最後攤牌對決，此部份寫入bankerAI
  }

  function restart() {
    //把目前手牌重新設定，不更動籌碼和牌堆
    $(".empty").removeClass();
    $(".body div").addClass("empty");
    banker.card = [];
    player.card = [];
    //清除狀態
    $("#bankerState").empty();
    $("#playerState").empty();
    //玩家發牌
    deal(player);
    //莊家發牌
    deal(banker);
    //玩家決定是否加牌
    $("#moreCardsButton").removeClass("disabled");
    $("#noMoreCardsButton").removeClass("disabled");
  }

  
  /*
  { //定義按鈕功能開始
    */
    $("#moreCardsButton").click(function() { //加牌
      resortCheck();
      deal(player);
    });
          
    $("#noMoreCardsButton").click(function() { //不再加牌
      lockAdd();
      $("#bankerCard1").removeClass("blank");
      $("#bankerCard1").addClass(banker.card[0]);
      bankerAI();
    });

    $("#playAgainButton").click(function() { //再開一局
        restart();
        $("#playAgainButton").prop("disabled", true);
      });

    $("#resetButton").click(function() { //遊戲初始化(除了名字之外都Reset，即重開一局、重新洗牌且籌碼重算)
      currentToken = 0;
      tokenTransfer(0);
      restart();
      cc = 52;
    });
    /*
  } //定義按鈕功能結束
  */

  //禁止再加牌
  function lockAdd() {
    $("#moreCardsButton").addClass("disabled");
    $("#noMoreCardsButton").addClass("disabled");
  }

  //莊家AI
  function bankerAI() { 
    //先加到至少基本6點
    while (totalPoint(banker) < 6) {
      deal(banker);
    }

    //當玩家牌面大於等於自己的手牌時加牌
    while (totalPoint(banker) <= totalFacePoint(player)) {
      deal(banker);
    }

    //比大小
    if (totalPoint(banker) >= totalPoint(player) && totalPoint(banker) < 10.5 && banker.card.length !== 5) {
      $("#bankerState").append("贏了！");
      $("#playerState").append("輸了！");
      tokenTransfer(-1);
    } else if (totalPoint(banker) < totalPoint(player)) {
      $("#bankerState").append("輸了！");
      $("#playerState").append("贏了！");
      tokenTransfer(1);
    }
  }

  //籌碼轉移
  function tokenTransfer(number) {
    currentToken += number;
    $("#playerToken").empty();
    $("#playerToken").append(currentToken);
    $("#bankerToken").empty();
    $("#bankerToken").append(0-currentToken);
    $("#playAgainButton").prop("disabled", false);
  }

  //定義按鍵功能
  $(document).keypress(function(key) {
    switch(key.which) {
      // "R" key pressed，對應再來一局
      case 114: 
        $("#playAgainButton").click();
        break;
      // "P" key Pressed，對應RESET
      case 112:
        $("#resetButton").click();
        break;
      // "Z" key Pressed，對應加牌
      case 122:
        $("#moreCardsButton").click();
        break;
      // "X" key Pressed，對應不加牌
      case 120:
        $("#noMoreCardsButton").click();
        break;
    }
  });

  //初始化
  var gameInitial = false;
  var banker = {
    id: "banker",
    name: "電腦",
    token: 100,
    card: []
  };
  var player = {
    id: "player",
    name: "",
    token: 100,
    card: []
  };
  var cc = 0; //As currentCard
  var currentToken = 0;

  //遊戲開始
  player.name = prompt("十點半遊戲已準備完成，請輸入名字。\n如未輸入，將以無名氏進行遊戲；如欲離開，請按「取消」。");
  
  if(player.name === "") {
    player.name = "無名氏";
  }

  if (player.name !== null) {
    $(".playerName").append(player.name);
    gameInitial = true;
  } else {
    window.close();
  }
  $("#playerToken").append(currentToken);
  $("#bankerToken").append(0-currentToken);
  restart();
});


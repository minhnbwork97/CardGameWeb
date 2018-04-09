var dt = new Date();
var logInHour = dt.getHours();
var logInMinute = dt.getMinutes();

window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("bet-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
  if (event.target.src != "http://127.0.0.1:3000/img/rank_icon.png"&&$("#moneyRank").is(":visible")) {
    $(".gameButton").show(200);
    $("#moneyRank").hide(200);
  }
};

function leave(x) {
  if (x == 1) {
    $.get("/logout");
    window.location.reload();
  }
  if (x == 2) {
    $(".gameButton").show(500);
    $("#listRoomBJ").hide(500);
    $("#leaveBtn").attr("onclick", "leave(1)");
  }
  if (x == 3) {
    $(".gameButton").hide();
    $("#listRoomBJ").hide();
    $("#game").hide(500);
    $("#gift").show();
    socket.emit("leaveRoom");
    $("#xi_dach").click();
  }
}

var socket = io("http://localhost:3000");
var name, money, room, index, num;

$.get("/game/getInf", function(data) {
  data = JSON.parse(data);
  name = data.name;
  money = data.money;
  $("#money").text(money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  $("#username").text(name);
  socket.emit("username", name);
});

function getRankList() {
  $("#moneyRank").show(200);
  $(".gameButton").hide(200);
  socket.emit("getMoneyRank");
}

socket.on("rankList",function(data){
  for(var i=0;i<11;i++){
    $("#moneyRank a")[i].text = data[i].Username;
    $("#moneyRank p")[i].innerHTML = data[i].Money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  $("#moneyRank span")[0].innerHTML = data[11]+1;
});

function gift() {
  var dt2 = new Date();
  var giftHour = dt2.getHours();
  var giftMinute = dt2.getMinutes();
  var newMoney = money + 500;
  if (giftHour == logInHour) {
    if (giftMinute - logInMinute >= 15) {
      socket.emit("gift", newMoney);
      $('#gift').remove();
    }
  } else if (giftHour > logInHour) {
    if (60 - logInMinute + giftMinute >= 15) {
      socket.emit("gift", newMoney);
      $('#gift').remove();
    }
  }
}

function gameNotAvaivable() {
  alert("Trò chơi đang được bảo trì. Mời bạn qua lại sau!");
}

function joinRoom(x) {
  $("#gift").hide();
  socket.emit("joinRoom", x);
}

socket.on("room-info", function(data) {
  data = JSON.parse(data);
  for (var i = 0; i < data.room.length; i++) {
    var numPlayer = data.room[i];
    $("#listRoomBJ img")[i].src = "/img/ban_" + numPlayer + "_nguoi.png";
    if (numPlayer > 0) {
      $("#listRoomBJ p")[i].innerHTML = data.bet[i].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
      $("#listRoomBJ p")[i].innerHTML = "";
    }
  }
});

socket.on("enterRoom", function(data) {
  $(".readyBtn").show();
  $("#game").show(500);
  $("#listRoomBJ").hide(500);
  $("#gameButton").hide();
  $("#leaveBtn").attr("onclick", "leave(3)");
  data = JSON.parse(data);
  num = data.pos + 1;
  index = data.pos;
  for (var i = 0; i < 4; i++) {
    if (i + index >= 4) {
      $("#User" + i).attr("class", "user" + (i + index - 4));
    } else {
      $("#User" + i).attr("class", "user" + (i + index));
    }
  }
  if (index == 0) {
    $(".dropbtn").prop('disabled', false);
    $(".readyBtn .centered")[0].innerHTML = "Bắt Đầu";
  } else {
    $(".readyBtn .centered")[0].innerHTML = "Sẵn Sàng";
    $(".dropbtn").prop('disabled', true);
  }
  for (var i = 0; i < data.nameList.length; i++) {
    $(".user" + i + ' .name').text(data.nameList[i]);
    $(".user" + i + " img")[0].src = data.plavatar[i];
    $(".user" + i + " img")[0].style.visibility = 'visible';
    $(".user" + i + " span")[0].innerHTML = data.plmoney[i];
  }
  $(".dropbtn span")[0].innerHTML = data.bet.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});

socket.on("newPlayerJoinRoom", function(data) {
  data = JSON.parse(data);
  num = data.pos + 1;
  $(".user" + data.pos + ' .name').text(data.name);
  $(".user" + data.pos + " img")[0].src = data.plavatar;
  $(".user" + data.pos + " img")[0].style.visibility = 'visible';
  $(".user" + data.pos + " span")[0].innerHTML = data.plmoney;
});

socket.on("notEnoughForBet", function(data) {
  alert("Bạn cần ít nhất " + data + "$ để vào bàn");
});

socket.on("roomFilled", function() {
  alert("Bàn đã đầy, vui lòng chọn phòng khác");
});

socket.on("roomOnGame", function() {
  alert("Bàn đang chơi, vui lòng chọn bàn khác");
});

socket.on("cantChangeBet", function(data) {
  data = JSON.parse(data);
  alert("Người chơi " + data.plErr.toString() + " không đủ tiền. Mức cược tối đa: " + data.maxBet);
  $(".dropbtn span")[0].innerHTML = data.bet.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});

socket.on("updateBet", function(data) {
  $(".dropbtn span")[0].innerHTML = data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});

socket.on("playerNotReady", function() {
  alert("Có người chơi chưa sẵn sàng");
});

socket.on("gameStart", function(data) {
  $(".dropbtn").prop('disabled', true);
  $(".readyBtn").hide();
  data = JSON.parse(data);
  for (var i = 0; i < data.cards.length; i++) {
    $(".user" + index + " img")[i + 1].src = "/img/blackjack/" + data.cards[i].name + data.cards[i].suit + ".jpg";
    for (var j = 1; j < num; j++) {
      var pos = index + j;
      if (pos >= num) {
        pos -= num;
      }
      $(".user" + pos + " img")[i + 1].src = "/img/blackjack/Card_down.jpg";
    }
  }
  $("#message").text(data.message);
  if (index == data.turn) {
    $("#btnStand")[0].style.visibility = "visible";
    $("#btnHit")[0].style.visibility = "visible";
    $("#RoomMessage").text("Lượt của bạn");
  } else {
    $("#btnStand")[0].style.visibility = "hidden";
    $("#btnHit")[0].style.visibility = "hidden";
    $("#RoomMessage").text("Lượt của " + $(".user" + data.turn + " .name")[0].innerHTML);
  }
});

socket.on("updateMoney", function(data) {
  money = data;
  $("#money").text(money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  $("#User0 span")[0].innerHTML = money;
});

socket.on("updateGiftedMoney", function(data) {
  money = data;
  $("#money").text(money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  $("#User0 span")[0].innerHTML = money;
});

socket.on("updatePlayerMoney", function(data) {
  data = JSON.parse(data);
  $(".user" + data.pos + " span")[0].innerHTML = data.money;
});

socket.on("allStand", function() {
  $("#btnStand").click();
});

socket.on("resHit", function(data) {
  data = JSON.parse(data);
  var pos = data.pos;
  $("#User0 img")[pos].src = "/img/blackjack/" + data.card[pos - 1].name + data.card[pos - 1].suit + ".jpg";
  $("#message").text(data.message);
});

socket.on("playerHit", function(data) {
  data = JSON.parse(data);
  $(".user" + data.player + " img")[data.position].src = "/img/blackjack/Card_down.jpg";
});

socket.on("nextTurn", function(data) {
  if (index == data) {
    $("#btnStand")[0].style.visibility = "visible";
    $("#btnHit")[0].style.visibility = "visible";
    $("#RoomMessage").text("Lượt của bạn");
  } else {
    $("#btnStand")[0].style.visibility = "hidden";
    $("#btnHit")[0].style.visibility = "hidden";
    $("#RoomMessage").text("Lượt của " + $(".user" + data + " .name")[0].innerHTML);
  }
});

socket.on("endGame", function(data) {
  data = JSON.parse(data);
  for (var i = 0; i < data.cards.length; i++) {
    for (var j = 0; j < data.cards[i].length; j++) {
      $(".user" + i + " img")[j + 1].src = "/img/blackjack/" + data.cards[i][j].name + data.cards[i][j].suit + ".jpg";
    }
    if (data.win.indexOf(i) != -1) {
      $(".user" + i + " img")[6].src = "/img/avatar/win_avatar.png";
      $(".user" + i + " img")[6].style.visibility = "visible";
    } else {
      $(".user" + i + " img")[6].src = "/img/avatar/lose_avatar.png";
      $(".user" + i + " img")[6].style.visibility = "visible";
    }
  }
  if (index == 0) {
    $(".dropbtn").prop('disabled', false);
  }
  $("#RoomMessage").text("");
  $("#btnStand")[0].style.visibility = "hidden";
  $("#btnHit")[0].style.visibility = "hidden";
  setTimeout(function() {
    $(".readyBtn").show();
  }, 1000);
});

function kick(x) {
  if (index == 0) {
    socket.emit("kickPlayer", $("#User" + x + " .name").text());
  }
}

socket.on("kickByRoomMaster", function() {
  $("#leaveBtn").click();
  alert("Bạn đã bị chủ phòng đuổi");
});

socket.on("playerLeaveRoom", function(data) {
  data = JSON.parse(data);
  if (index > data.pos) {
    for (var i = data.pos; i >= 0; i--) {
      $(".user" + i + " .name").text($(".user" + (i - 1) + " .name").text());
      $(".user" + i + " span")[0].innerHTML = $(".user" + (i - 1) + " span").text();
      for (var j = 0; j < 7; j++) {
        if (i == 0) {
          continue;
        }
        $(".user" + i + " img")[j].src = ($(".user" + (i - 1) + " img")[j].src);
      }
    }
    for (var i = 0; i < 7; i++) {
      $(".user0 img")[i].src = "";
    }
    $(".user0 img")[0].style.visibility = "hidden";
    $(".user0 img")[6].style.visibility = "hidden";
  } else {
    for (var i = data.pos; i < num; i++) {
      $(".user" + i + " .name").text($(".user" + (i + 1) + " .name").text());
      $(".user" + i + " span")[0].innerHTML = $(".user" + (i + 1) + " span").text();
      for (var j = 0; j < 7; j++) {
        $(".user" + i + " img")[j].src = ($(".user" + (i + 1) + " img")[j].src);
      }
    }
    for (var i = 0; i < 7; i++) {
      $(".user" + (num - 1) + " img")[i].src = "";
    }
    $(".user" + (num - 1) + " img")[0].style.visibility = "hidden";
    $(".user" + (num - 1) + " img")[6].style.visibility = "hidden";
  }
  num = data.players.length;
  index = data.players.indexOf(name);
  for (var i = 0; i < 4; i++) {
    if (i + index >= 4) {
      $("#User" + i).attr("class", "user" + (i + index - 4));
    } else {
      $("#User" + i).attr("class", "user" + (i + index));
    }
  }
  if (index == 0) {
    $(".dropbtn").prop('disabled', false);
    $(".readyBtn .centered")[0].innerHTML = "Bắt Đầu";
  } else {
    $(".readyBtn .centered")[0].innerHTML = "Sẵn Sàng";
    $(".dropbtn").prop('disabled', true);
  }
});

var count = 1;
socket.on("server-chat", function(data) {
  var filterWords = ["fool", "dumb", "shit", "ass", "fuck", "địt", "mẹ", "cặc", "buồi", "lồn"];
  var rgx = new RegExp(filterWords.join("|"), "gi");
  data = data.replace(rgx, "**");
  $("#chatbox").append("<div>" + "<b style = 'color:red'>" + name + "</b>: " + data + "</div>");
  $('#chatField').val('');
  if (count == 1) {
    $('#chatbox').scrollTop(17);
    count = 0;
  } else
    $('#chatbox').scrollTop(150);
});
$(document).ready(function() {
  $("#moneyRank").hide();
  $(".stripe-button-el span").text("Nạp");
  $("#chatButton").click(function() {
    socket.emit("user-chat", $("#chatField").val());
  });
  $("#chatField").keyup(function(event) {
    if (event.keyCode == 13)
      socket.emit("user-chat", $("#chatField").val());
  });
  $("#listRoomBJ").hide();
  $("#game").hide();
  $(".gameButton").show();

  $("#leaveBtn").click(function() {
    $("#chatbox").empty();
    $.get("/logout");
  });
  $("#xi_dach").click(function() {
    $("#listRoomBJ").show(500);
    $(".gameButton").hide(500);
    $("#leaveBtn").attr("onclick", "leave(2)");
    socket.emit("req-game-blackjack");
  });

  $(".dropbtn").click(function() {
    document.getElementById("betValue").classList.toggle("show");
  });
  $("#betValue a").click(function() {
    $(this).addClass("betActivate");
    $(this).siblings("a").removeClass("betActivate");
    $(".dropbtn span")[0].innerHTML = $(".betActivate")[0].innerHTML;
    socket.emit("changeBet", Number($(".dropbtn span")[0].innerHTML.replace(",", "")));
  });
  $(".readyBtn").click(function() {
    for (var i = 0; i < 4; i++) {
      $(".user" + i + " img")[6].style.visibility = "hidden";
      for (var j = 1; j < 6; j++) {
        $(".user" + i + " img")[j].src = "";
      }
    }
    $("#message").text("");
    if (index != 0) {
      $(".readyBtn").hide();
      socket.emit("playerReady", index);
    } else {
      socket.emit("reqGameStart");
    }
  });
  $("#btnHit").click(function() {
    socket.emit("reqHit");
  });
  $("#btnStand").click(function() {
    socket.emit("reqStand");
  });

});

window.onscroll = function() {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    document.getElementById("scrollBtn").style.display = "block";
  } else {
    document.getElementById("scrollBtn").style.display = "none";
  }
}

function gameNotAvaivable() {
  alert("Trò chơi đang được bảo trì. Mời bạn qua lại sau!");
}

$(document).ready(function() {
  var loginModal = document.getElementById("login");
  var signupModal = document.getElementById("signup");
  var contractModal = document.getElementById("contract_form");
  window.onclick = function(event) {
    if (event.target == loginModal) {
      $(".loginButton").show();
      $(".signupButton").show();
      loginModal.style.display = "none";
    }
    if (event.target == signupModal) {
      $(".loginButton").show();
      $(".signupButton").show();
      signupModal.style.display = "none";
    }
    if (event.target == contractModal) {
      contractModal.style.display = "none";
    }
  };
  $(".loginButton").click(function() {
    $(".loginButton").hide();
    $(".signupButton").hide();
  });
  $(".signupButton").click(function() {
    $(".loginButton").hide();
    $(".signupButton").hide();
  });

  $("#signup .submitBtn").click(function(e) {
    e.preventDefault();
    var usr = $('#signup').find('input[name="username"]').val();
    var psw = $('#signup').find('input[name="password"]').val();
    var psw_re = $('#signup').find('input[name="password-repeat"]').val();
    if (psw != psw_re) {
      alert("Nhập lại mật khẩu không trùng khớp");
    } else {
      $.post("/signup", {
        username: usr,
        password: psw
      }, function(data, status) {
        data = JSON.parse(data);
        alert(data.message);
      });
    }
  });

  $("#scrollBtn").click(function() {
    $("html, body").animate({
      scrollTop: 0
    }, 1000);
  });

  $("#xi_dach").click(function() {
    $(".loginButton").click();
  });
  $(".game-img").hide();
  $(".guide li").click(function() {
    var index = $(this).index();
    $(".game-img").show();
    var srcImg, gameName;
    switch (index) {
      case 0:
        srcImg = "/img/TLMN.png"
        gameName = "Game đánh bài tiến lên miền Nam"
        break;
      case 1:
        srcImg = "/img/TLMN_dem_la.png"
        gameName = "Game đánh bài tiến lên miền Nam đếm lá"
        break;
      case 2:
        srcImg = "/img/phom.png"
        gameName = "Game đánh bài Phỏm"
        break;
      case 3:
        srcImg = "/img/mau_binh.png"
        gameName = "Game đánh bài Mậu Binh"
        break;
      case 4:
        srcImg = "/img/lieng.png"
        gameName = "Game đánh bài Liêng"
        break;
      case 5:
        srcImg = "/img/poker.png"
        gameName = "Game đánh bài Poker Texas"
        break;
      case 6:
        srcImg = "/img/sam.png"
        gameName = "Game đánh bài Sâm Lốc"
        break;
      case 7:
        srcImg = "/img/ba_cay.png"
        gameName = "Game đánh bài Ba Cây"
        break;
      case 8:
        srcImg = "/img/xi_to.png"
        gameName = "Game đánh bài Xì Tố"
        break;
      case 9:
        srcImg = "/img/xi_dach.png"
        gameName = "Game đánh bài Xì Dách"
        break;
    }
    $(".game-img img")[0].src = srcImg;
    $(".game-img h1")[0].innerHTML = gameName;
    $.get("/guide/" +index, function(data) {
      document.getElementById("text").innerHTML = data;
    });
  });
});

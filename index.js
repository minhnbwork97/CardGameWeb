var express = require("express");
var bodyParser = require("body-parser");
var passport = require("passport");
var localStrategy = require("passport-local").Strategy;
var session = require("express-session");
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var io = require("socket.io")(server);
var app = express();
var mysql = require("mysql");
var stripe = require("stripe")(
  "sk_test_hFGb4w8EjTZRKG3Z02ECzBml"
);
var fs = require("fs");
var gifted;
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: "secret",
  cookie: {
    maxAge: 1000 * 60 * 30
  },
  rolling: true,
  resave: true,
  saveUninitialized: true
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.set("view engine", "ejs");
app.set("views", "./views");
var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(process.env.PORT || 3000);
var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456789",
  database: "da2_user"
});

app.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/game');
  } else {
    res.render('home.ejs', {
      authenMessage: req.flash('authenMsg')
    });
  }
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get("/guide/:index",function(req,res){
  var i=req.params.index;
  var file = __dirname + "/guide/"+i+".html";
  fs.readFile(file,function(err,data){
    res.send(data);
  });
});

app.get("/game", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("game.ejs");
  } else {
    res.redirect("/");
  }
});

app.get("/game/getInf", function(req, res) {
  if (req.isAuthenticated()) {
    db.connect(function() {
      var sql = "SELECT Money,Gifted FROM user WHERE Username = ?";
      db.query(sql, [req.user.Username], function(err, result) {
        if (err) {
          return;
        }
        gifted = result[0].Gifted;
        res.send(JSON.stringify({
          name: req.user.Username,
          money: result[0].Money

        }));
      });
    });
  } else {
    res.redirect("/");
  }
});

app.post("/signup", function(req, res) {
  var user = req.body.username;
  var psw = req.body.password;
  db.connect(function() {
    var sql = "SELECT * FROM user WHERE BINARY Username = ?";
    var account = [
      [user, psw]
    ];
    db.query(sql, [user], function(err, result) {
      if (err) throw err;
      if (result.length == 0) {
        var sql = "INSERT INTO user (Username, Password) VALUES ?";
        db.query(sql, [account], function(err, result) {
          res.send(JSON.stringify({
            message: "Đăng kí thành công!",
            code: 1
          }));
        });
      } else {
        res.send(JSON.stringify({
          message: "Tài khoản đã tồn tại!",
          code: 0
        }));
      }
    });
  });
});

app.post("/login", passport.authenticate('local', {
  failureRedirect: "/",
  successRedirect: "/game",
  failureFlash: true
}));

passport.use(new localStrategy({
    passReqToCallback: true
  },
  function(req, username, password, done) {
    db.connect(function() {
      var sql = "SELECT * FROM user WHERE BINARY Username = '" + username + "'";
      db.query(sql, function(err, result) {
        if (err) {
          return done(err);
        }
        if (result.length == 1 && result[0].Password == password) {
          return done(null, result[0]);
        } else {
          return done(null, false, req.flash('authenMsg', 'Sai tên đăng nhập hoặc mật khẩu'));
        }
      });
    });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.Username);
});

passport.deserializeUser(function(name, done) {
  db.connect(function() {
    var sql = "SELECT * FROM user WHERE BINARY Username = '" + name + "'";
    db.query(sql, function(err, result) {
      if (result.length == 1) {
        return done(null, result[0]);
      } else {
        return done(null, false);
      }
    });
  });
});

app.post('/charge', function(req, res) {
  var token = req.body.stripeToken;
  var chargeAmount = req.body.chargeAmount;
  var charge = stripe.charges.create({
    amount: chargeAmount,
    currency: "usd",
    source: token
  }, function(err, charge) {
    if (err && err.type === "StripeCardError") {
      res.redirect("/game");
    } else {
      db.connect(function() {
        var sql = "SELECT * FROM user WHERE BINARY Username = ?";
        db.query(sql, [req.user.Username], function(err, result) {
          var money = result[0].Money + 200000;
          var sql1 = "UPDATE user SET Money = '" + money + "' WHERE Username = ?";
          db.query(sql1, [req.user.Username], function(err, result) {});
        });
      });
      res.redirect("/game");
    }
  });
});

function userDeck() {
  this.total = 0;
  this.stand = 0;
  this.message = "";
  this.win = 0;
  this.cards = new Array();
}

function user(name) {
  this.userName = name;
  this.ready = 0;
  this.deck = new userDeck();
}

function Room() {
  this.users = new Array();
  this.deck = Deck;
  this.bet = 200;
  this.totalBet = 400;
  this.gameStart = 0;
  this.count = 416;
  this.turn = 0;
  this.endGame = 0;
  this.socketId = new Array();
  this.socket = new Array();
  this.ids = new Array();
  this.response = {};
  this.addPlayer = function(user) {
    return this.users.push(user);
  };

  this.removePlayer = function(id) {
    this.users.splice(this.socketId.indexOf(id), 1);
    this.ids.splice(this.socketId.indexOf(id), 1);
    this.socket.splice(this.socketId.indexOf(id), 1);
    this.socketId.splice(this.socketId.indexOf(id), 1);
    if (this.ids.length == 0) {
      this.bet = 200;
    }
  };

  this.newGame = function() {
    this.deck = Deck;
    for (var i = 0; i < 8; i++) {
      this.deck = this.deck.concat(Deck);
    }
    this.gameStart = 1;
    this.count = 416;
    this.turn = 0;
    this.endGame = 0;
    this.response = {};
    this.response.user = [];
    this.response.message = [];
    shuffle(this.deck);
    for (var i = 0; i < this.users.length; i++) {
      this.users[i].deck = new userDeck();
      this.users[i].ready = 0;
    }
    for (var i = 0; i < this.ids.length; i++) {
      this.users[i].deck.cards.push(this.deck[--this.count], this.deck[--this.count]);
      this.users[i].deck.total = getTotal(this.users[i].deck.cards);
    }

    for (var i = 0; i < this.ids.length; i++) {
      if (this.users[i].deck.total == 21) {
        this.users[i].deck.stand = 1;
      }
      this.users[i].deck.message = this.users[i].deck.total + "/21";
      this.response.user.push(this.users[i].deck.cards);
      this.response.message.push(this.users[i].deck.message);
    }
  };

  this.Hit = function() {
    this.response = {};
    this.users[this.turn].deck.cards.push(this.deck[--this.count]);
    this.users[this.turn].deck.total = getTotal(this.users[this.turn].deck.cards);
    this.users[this.turn].deck.message = this.users[this.turn].deck.total + "/21";
    var pos = this.users[this.turn].deck.cards.length;
    this.response.card = this.users[this.turn].deck.cards;
    this.response.message = this.users[this.turn].deck.message;
    this.response.userHit = this.turn;
    this.response.pos = pos;
    if (this.users[this.turn].deck.cards.length == 5 || this.users[this.turn].deck.total >= 21) {
      this.users[this.turn].deck.stand = 1;
    }
  };

  this.Stand = function() {
    this.users[this.turn].deck.stand = 1;
    this.IsEndGame();
    if (this.endGame == 1) {
      this.EndGame();
    } else {
      this.turn += 1;
    }
  };

  this.IsEndGame = function() {
    var checkStand = 0;
    for (var i = 0; i < this.ids.length; i++) {
      if (this.users[i].deck.stand == 1) {
        checkStand += 1;
      }
    }
    if (checkStand == this.ids.length) this.endGame = 1;
  };

  this.EndGame = function() {
    this.gameStart = 0;
    this.response = {};
    this.response.cards = new Array();
    this.response.win = new Array();
    var max = 0,
      numWin = 0;
    for (var i = 0; i < this.ids.length; i++) {
      if (this.users[i].deck.total > 21) {
        this.users[i].deck.total = 0;
      }
      if (this.users[i].deck.total != 0 && this.users[i].deck.cards.length == 5) {
        this.users[i].deck.total = 21;
      }
      if (this.users[i].deck.total >= max) {
        max = this.users[i].deck.total;
      }
    }
    for (var i = 0; i < this.ids.length; i++) {
      if (this.users[i].deck.total == max) {
        this.users[i].deck.win = 1;
        this.response.win.push(i);
        numWin += 1;
      }
    }
    if (numWin != this.ids.length) {
      var winMoney = Math.floor(this.totalBet / numWin);
      for (var i = 0; i < this.ids.length; i++) {
        if (this.users[i].deck.win == 1) {
          if (i == 0) {
            this.socket[i].money += winMoney;
          } else {
            this.socket[i].money += Math.floor(winMoney * 90 / 100);
          }
        }
      }
    }
    for (var i = 0; i < this.ids.length; i++) {
      this.response.cards.push(this.users[i].deck.cards);
    }
  };
}
var room = new Array(),
  roomBet = new Array(),
  R = new Array();
for (var i = 1; i < 21; i++) {
  room[i - 1] = 0;
  R[i] = new Room();
  roomBet[i - 1] = R[i].bet;
}
io.on("connection", function(socket) {

  socket.on("req-game-blackjack", function() {
    socket.emit("room-info", JSON.stringify({
      room: room,
      bet: roomBet
    }));
  });

  socket.on("username", function(data) {
    socket.Username = data;
    db.connect(function() {
      var sql = "SELECT Money FROM user WHERE BINARY Username = ?";
      db.query(sql, [socket.Username], function(err, result) {
        if (err) {
          return;
        }
        socket.money = result[0].Money;
      });
    });
  });

  socket.on("joinRoom", function(data) {
    if (room[data - 1] < 4 && R[data].gameStart == 0) {
      if (socket.money < R[data].bet) {
        socket.emit("notEnoughForBet", R[data].bet);
      } else {
        socket.join("Phong" + data);
        socket.Phong = "Phong" + data;
        R[data].socketId.push(socket.id);
        R[data].socket.push(socket);
        room[data - 1]++;
        io.sockets.emit("room-info", JSON.stringify({
          room: room,
          bet: roomBet
        }));

        var player = new user(socket.Username);
        R[data].addPlayer(player);
        R[data].ids.push(socket.Username);
        var money = new Array();
        var avatar = new Array();
        db.connect(function() {
          for (var i = 0; i < R[data].ids.length; i++) {
            var sql = "SELECT * FROM user WHERE BINARY Username = ?";
            db.query(sql, [R[data].ids[i]], function(err, result) {
              if (err) {
                return;
              }
              money.push(result[0].Money);
              avatar.push(result[0].Avatar);
              if (i == R[data].ids.length) {
                var position = R[data].socketId.indexOf(socket.id);
                socket.emit("enterRoom", JSON.stringify({
                  nameList: R[data].ids,
                  plmoney: money,
                  plavatar: avatar,
                  pos: position,
                  bet: R[data].bet
                }));
                socket.broadcast.to(socket.Phong).emit("newPlayerJoinRoom", JSON.stringify({
                  name: socket.Username,
                  plmoney: money[position],
                  plavatar: avatar[position],
                  pos: position
                }));
              }
            });
          }
        });
      }
    } else {
      if (R[data].gameStart == 1) {
        socket.emit("roomOnGame");
      } else {
        socket.emit("roomFilled");
      }
    }
  });

  socket.on("user-chat", function(data) {
    io.sockets.in(socket.Phong).emit("server-chat", data);
  });

  socket.on("changeBet", function(data) {
    var j = 1;
    for (j = 1; j < R.length; j++) {
      if (R[j].socketId.indexOf(socket.id) == 0) {
        break;
      }
    }
    if (j == R.length) {
      return;
    }
    var plErr = new Array();
    var min = 200;
    for (var i = 0; i < R[j].ids.length; i++) {
      if (R[j].socket[i].money < data) {
        plErr.push(R[j].ids[i]);
        if (R[j].socket[i].money > min) {
          min = R[j].socket[i].money;
        }
      }
    }
    if (plErr.length > 0) {
      socket.emit("cantChangeBet", JSON.stringify({
        plErr: plErr,
        maxBet: min,
        bet: R[j].bet
      }));
    } else {
      R[j].bet = data;
      roomBet[j - 1] = data;
      io.sockets.in(socket.Phong).emit("updateBet", data);
      socket.emit("room-info", JSON.stringify({
        room: room,
        bet: roomBet
      }));
    }
  });

  socket.on("playerReady", function() {
    var j = 1;
    for (j = 1; j < R.length; j++) {
      if (R[j].socketId.indexOf(socket.id) != -1) {
        break;
      }
    }
    if (j != R.length) {
      for (var i = 0; i < R[j].users.length; i++) {
        if (R[j].users[i].userName == socket.Username) {
          R[j].users[i].ready = 1;
          break;
        }
      }
    }
  });

  socket.on("reqGameStart", function() {
    var j = 1;
    for (j = 1; j < R.length; j++) {
      if (R[j].socketId.indexOf(socket.id) == 0) {
        break;
      }
    }
    if (j != R.length && R[j].ids.length > 1) {
      for (var i = 1; i < R[j].ids.length; i++) {
        if (R[j].users[i].ready == 0) {
          socket.emit("playerNotReady");
          return;
        }
      }
      R[j].totalBet = R[j].bet * R[j].ids.length;
      R[j].newGame();
      var i = 0;
      for (i = 0; i < R[j].ids.length; i++) {
        if (R[j].users[i].deck.stand == 0) {
          R[j].turn = i;
          break;
        }
      }
      if (i == R[j].ids.length) {
        io.sockets.in(socket.Phong).emit("allStand");
      }
      for (var i = 0; i < R[j].ids.length; i++) {
        io.to(R[j].socketId[i]).emit("gameStart", JSON.stringify({
          cards: R[j].response.user[i],
          message: R[j].response.message[i],
          turn: R[j].turn
        }));
      }
      db.connect(function() {
        for (var i = 0; i < R[j].ids.length; i++) {
          R[j].socket[i].money -= R[j].bet;
          var sql = "UPDATE user SET Money = " + R[j].socket[i].money + " WHERE BINARY Username = '" + R[j].socket[i].Username + "'";
          db.query(sql, function(err, result) {
            if (err) {
              return;
            }
          });
        }
      });

    }
  });

  socket.on("gift", function(data) {

    if (gifted == 0) {
      socket.emit("updateGiftedMoney", data);
      var sql = "UPDATE user SET Money = " + data + ", Gifted = 1 WHERE BINARY Username = '" + socket.Username + "'";
      db.query(sql, function(err, result) {
        if (err) {
          return;
        }
      });
    }
  });

  socket.on("reqHit", function(data) {
    var j = 1;
    for (j = 1; j < R.length; j++) {
      if (R[j].socketId.indexOf(socket.id) == R[j].turn) {
        break;
      }
    }
    if (j != R.length) {
      var turn = R[j].turn;
      R[j].Hit();
      var i = 0;
      for (i = 0; i < R[j].ids.length; i++) {
        if (R[j].users[i].deck.stand == 0) {
          R[j].turn = i;
          break;
        }
      }
      socket.broadcast.to(socket.Phong).emit("playerHit", JSON.stringify({
        player: turn,
        position: R[j].response.pos
      }));
      socket.emit("resHit", JSON.stringify(R[j].response));
      io.sockets.in(socket.Phong).emit("nextTurn", R[j].turn);
      if (i == R[j].ids.length) {
        io.sockets.in(socket.Phong).emit("allStand");
      }
    }
  });

  socket.on("reqStand", function(data) {
    var j = 1;
    for (j = 1; j < R.length; j++) {
      if (R[j].socketId.indexOf(socket.id) == R[j].turn) {
        break;
      }
    }
    if (j != R.length) {
      R[j].Stand();
      if (R[j].endGame == 1) {
        io.sockets.in(socket.Phong).emit("endGame", JSON.stringify(R[j].response));
        db.connect(function() {
          for (var i = 0; i < R[j].ids.length; i++) {
            io.to(R[j].socketId[i]).emit("updateMoney", R[j].socket[i].money);
            io.sockets.in(socket.Phong).emit("updatePlayerMoney", JSON.stringify({
              pos: i,
              money: R[j].socket[i].money
            }));
            var sql = "UPDATE user SET Money = " + R[j].socket[i].money + " WHERE BINARY Username = '" + R[j].socket[i].Username + "'";
            db.query(sql, function(err, result) {
              if (err) {
                return;
              }
            });
          }
        });
      } else {
        io.sockets.in(socket.Phong).emit("nextTurn", R[j].turn);
      }
    }
  });

  socket.on("kickPlayer", function(data) {
    var j = 1;
    for (j = 1; j < R.length; j++) {
      if (R[j].socketId.indexOf(socket.id) != -1) {
        break;
      }
    }
    if (j != R.length) {
      if (R[j].socketId.indexOf(socket.id) == 0 && R[j].gameStart == 0) {
        var pos = R[j].ids.indexOf(data);
        socket.broadcast.to(R[j].socketId[pos]).emit("kickByRoomMaster");
      }
    }
  });

  socket.on("leaveRoom", function(data) {
    var j = 1;
    for (j = 1; j < R.length; j++) {
      if (R[j].socketId.indexOf(socket.id) != -1) {
        break;
      }
    }
    if (j != R.length) {
      room[j - 1]--;
      var pos = R[j].socketId.indexOf(socket.id);
      R[j].removePlayer(socket.id);
      socket.broadcast.to(socket.Phong).emit("playerLeaveRoom", JSON.stringify({
        pos: pos,
        players: R[j].ids
      }));
      socket.leave(socket.Phong);
      io.sockets.emit("room-info", JSON.stringify({
        room: room,
        bet: roomBet
      }));
    }
  });

  socket.on("getMoneyRank", function() {
    var rankList = [];
    db.connect(function() {
      db.query("SELECT Username, Money FROM user ORDER BY Money DESC", function(err, result) {
        if (err) return;
        else {
          for (var i = 0; i < 10; i++) {
            rankList.push(result[i]);
          }
          for (i = 0; i < result.length; i++) {
            if (result[i].Username === socket.Username) {
              rankList.push(result[i]);
              rankList.push(i);
            }
          }
          socket.emit("rankList", rankList);
        }
      });
    });
  });

  socket.on("disconnect", function() {
    var j = 1;
    for (j = 1; j < R.length; j++) {
      if (R[j].socketId.indexOf(socket.id) != -1) {
        break;
      }
    }
    if (j != R.length) {
      room[j - 1]--;
      var pos = R[j].socketId.indexOf(socket.id);
      R[j].removePlayer(socket.id);
      socket.broadcast.to(socket.Phong).emit("playerLeaveRoom", JSON.stringify({
        pos: pos,
        players: R[j].ids
      }));
      socket.leave(socket.Phong);
      io.sockets.emit("room-info", JSON.stringify({
        room: room,
        bet: roomBet
      }));
    }
  });

});

function card(name, suit, value) {
  this.name = name;
  this.suit = suit;
  this.value = value;
}
var Deck = new Array();
Deck = [
  new card('Ace', 'Hearts', 11),
  new card('Two', 'Hearts', 2),
  new card('Three', 'Hearts', 3),
  new card('Four', 'Hearts', 4),
  new card('Five', 'Hearts', 5),
  new card('Six', 'Hearts', 6),
  new card('Seven', 'Hearts', 7),
  new card('Eight', 'Hearts', 8),
  new card('Nine', 'Hearts', 9),
  new card('Ten', 'Hearts', 10),
  new card('Jack', 'Hearts', 10),
  new card('Queen', 'Hearts', 10),
  new card('King', 'Hearts', 10),
  new card('Ace', 'Diamonds', 11),
  new card('Two', 'Diamonds', 2),
  new card('Three', 'Diamonds', 3),
  new card('Four', 'Diamonds', 4),
  new card('Five', 'Diamonds', 5),
  new card('Six', 'Diamonds', 6),
  new card('Seven', 'Diamonds', 7),
  new card('Eight', 'Diamonds', 8),
  new card('Nine', 'Diamonds', 9),
  new card('Ten', 'Diamonds', 10),
  new card('Jack', 'Diamonds', 10),
  new card('Queen', 'Diamonds', 10),
  new card('King', 'Diamonds', 10),
  new card('Ace', 'Clubs', 11),
  new card('Two', 'Clubs', 2),
  new card('Three', 'Clubs', 3),
  new card('Four', 'Clubs', 4),
  new card('Five', 'Clubs', 5),
  new card('Six', 'Clubs', 6),
  new card('Seven', 'Clubs', 7),
  new card('Eight', 'Clubs', 8),
  new card('Nine', 'Clubs', 9),
  new card('Ten', 'Clubs', 10),
  new card('Jack', 'Clubs', 10),
  new card('Queen', 'Clubs', 10),
  new card('King', 'Clubs', 10),
  new card('Ace', 'Spades', 11),
  new card('Two', 'Spades', 2),
  new card('Three', 'Spades', 3),
  new card('Four', 'Spades', 4),
  new card('Five', 'Spades', 5),
  new card('Six', 'Spades', 6),
  new card('Seven', 'Spades', 7),
  new card('Eight', 'Spades', 8),
  new card('Nine', 'Spades', 9),
  new card('Ten', 'Spades', 10),
  new card('Jack', 'Spades', 10),
  new card('Queen', 'Spades', 10),
  new card('King', 'Spades', 10)
];

function shuffle(deck) {
  for (var i = 415; i > 0; i--) {
    var r = Math.floor((i + 1) * Math.random());
    var temp = deck[r];
    deck[r] = deck[i];
    deck[i] = temp;
  }
}

function getTotal(hand) {
  var total = 0;
  var ace = false;
  for (var i = 0; i < hand.length; i++) {
    total += hand[i].value;
    if (hand[i].value == 11) ace = true;
  }
  if (total > 21 && ace) {
    total -= 10;
  }
  return total;
}

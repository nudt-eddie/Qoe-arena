var express = require("express");
var app = express();
var mysql = require("mysql");
var execSync = require('child_process').execSync;
var moment = require('moment');
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "user",
  port: "3306",
});
var formidable = require('formidable');
var querystring =require('querystring');
var fs = require('fs');
connection.connect();
console.log("success");

var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
  extended: false
})
app.use(session({
  secret: '123456',
  store: new FileStore(),
  cookie: {
    path: '/',
    httpOnly: true,
    secure: false,
    maxAge: 60000
  },
  resave: true,
  saveUninitialized: true,
}));
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/" + "index.html");
});
//实现登录验证功能
app.get("/login", function (req, res) {
  var name = req.query.name;
  console.log(name);
  var pwd = req.query.pwd;
  console.log("pwd", pwd);
  var selectSQL =
    "select * from student where userName = '" +
    name +
    "' and password = '" +
    pwd +
    "'";
  console.log(selectSQL);
  connection.query(selectSQL, function (err, rs) {
    if (err) {
      console.log("[login ERROR] - ", err.message);
      return;
    }
    if (name == ''){
      console.log("帐号不能为空");
      res.end(name+" "+"login fail");
      return;
    }
    if (name =="admin" && rs != ''){
      console.log("你是管理员！");
      var sess = req.session;
      var Dt = Date.now();
      var time = moment(Dt).format();
      sess.lasttime = time;
      sess.user = name;
      if (sess.views) {
        sess.views++;
    
      } else {
        sess.views = 1
      }
      
      var sql = "SELECT * FROM results"; 
      var str = " ";
      connection.query(sql, function(err, result) {undefined
      if (err) {undefined
      console.log("[SELECT ERROR]:", err.message);
      }
      str = JSON.stringify(result);
      //数据库查询的数据保存在result中，但浏览器并不能直接读取result中的结果，因此需要用JSON进行解析
      //console.log(result); //数据库查询结果返回到result中
      console.log(str);
      });
      //res.send(str); //服务器响应请求 将数据渲染在页面注：只有运行时是 node app,js运行这个入口文件才能展示数据
      res.sendFile(path.join(__dirname,'public/admin.html'));
      return;
    }
    if (rs == "") {
      console.log("帐号密码错误");
      res.end(name+" "+"login fail");
    } else {
      console.log(name+"已登录");
      //app.use(express.static(path.join(__dirname, 'public')));
      var sess = req.session;
      var Dt = Date.now();
      var time = moment(Dt).format();
      sess.lasttime = time;
      sess.user = name;
      req.session.user = name;
      if (sess.views) {
        sess.views++;
    
      } else {
        sess.views = 1
      }
      res.sendFile(path.join(__dirname, 'public/OK.html'));
      return;
    }
  });
});

app.get("/runok.html", function (req, res) {
  res.sendFile(__dirname + "/" + "runok.html");
});


app.get("/OK.html", function (req, res) {
  res.sendFile(__dirname + "/" + "OK.html");
});


app.get("/Register.html", function (req, res) {
  res.sendFile(__dirname + "/" + "Register.html");
});
//实现注册功能
app.get("/register", function (req, res) {
  var name = req.query.name;
  var selectSQL =
  "select * from student where userName = '" +
  name +
  "'"
  var pwd = req.query.pwd;
  var user = { userName: name, password: pwd };
  var _res = res;

  console.log(selectSQL);
  connection.query(selectSQL, function (err, rs) {
    if(err){
      _res.send(err.message);
      return;
    }else{
      var ta = true;
     /* rs.forEach(item => {
        if(rs != '' || name == "admin"){
            _res.end('您的账号已被注册，请重新注册！');
            ta = false;
            return;
        }
    });*/
    if(rs != '' || name == "admin"){
      _res.end('Register fail because it had the same account!');
      ta = false;
      return;
  }
    if (name == "") {
      console.log("无输入");
      res.end(name+" "+"Register fail because no input!");
      return;
    }
    if (rs == ""){
      connection.query("insert into student set ?", user, function (err, rs) {
        if (err) throw err;
        console.log("ok");
        res.sendFile(__dirname + "/public/Reg_ok.html");
      });
    } 
    else {
      res.end(name+" "+"Register fail because it had the same account!");
      console.log("[register ERROR] - ", err.message);
      return;
    }
  };

});
});

var server = app.listen(5050, function () {
  console.log("start");
});

const multer  = require('multer');
const { resourceLimits } = require("worker_threads");
// No views, just staic files

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/Test/orgin') // The upload dir destination
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // The final name of file
  }
});

var multerOpts = { 
    storage: storage, // Storage options
    // Control which files are accepted
    fileFilter: function(req, file, cb){ 
        cb(null, true); // Allow all files
    },	
    // Limits of the uploaded data. Can help protect your site against denial of service (DoS) attacks.
    limits: {
        fieldNameSize: 100,	    // Max field name size	100 bytes
        fieldSize: 1000,	        // Max field value size	1MB
        fields:	Infinity,       // Max number of non-file fields	
        fileSize: Infinity,     // For multipart forms, the max file size (in bytes)	
        files: Infinity,        // For multipart forms, the max number of file fields	
        parts: Infinity,        // For multipart forms, the max number of parts (fields + files)	
        headerPairs: 2000,	    // For multipart forms, the max number of header key=>value pairs to parse	
    }, 
};
var upload1 = multer(multerOpts).array('photos');
app.post('/upload1', function(req, res){
  
  upload1(req, res, function (err) {
    if (err) {
      // An error occurred when uploading
      console.log(err);
      return res.status(300).send('error');
    }

    // Everything went fine
    console.log(req.files);
    res.send('success');
    //res.send('upload ready success');
  })
  
})

function executecmd(cmd){
  execSync(cmd,{cwd:'C:\\Users\\Lenovo\\Desktop\\first_version\\public\\Test'},function(error, stdout, stderr){
    if (error){
      console.error(error);
    }
    else{
      console.log("executing success!")
    }
  })
  }

app.post('/runcmd',function(req, res){
  executecmd('cmd.exe /k cd C:/Users/Lenovo/Desktop/first_version/public/Test && python3 ./manager.py --client_ip 10.129.84.223 --client_password nudtnudt --client_username nudt --server_ip 10.129.84.222 --server_password nudtnudt --server_username nudt');
  //page = '<h2>  <script src="js/bar.js"></script></h2>' + 
  // '<form action="/OK.html" enctype="multipart/form-data" method="get">' +'<button style="font-family: fantasy;">OK</button>'+ '</form> '
  //res.send(page);
  res.sendFile(__dirname + "/" + "public/runok.html");
})

app.post('/uploadresults',function(req,res){
  var name = req.session.user;
  var Dt = Date.now();
  var time = moment(Dt).format();
  var result;
  var trans = require("iconv-lite");
  fs.readFile(__dirname + "/public/Test/" + "result.txt", "binary", (err, data) =>
  {
   if (err) console.log(err);
   else{
   result = trans.decode(data, "GBK");
   result = "测试成功， 输出结果如下：\n" + result;

   fs.readFile(__dirname + "/public/" + "result.html", "binary", (err, data_html) =>
   {
    if (err) console.log(err);
    else{
    result_html = trans.decode(data_html, "GBK");

  fs.appendFile(__dirname + "/public/" + "admin.html","用户名："+name+"    执行时间："+time+data_html , (error)  => {
      if (error) return console.log("追加文件失败" + error.message);
      console.log("追加成功");
  });



  var selectSQL =
  "select * from student where userName = '" +
  name +
  "'"
  var user = { idname: name, loadtime: time, result_txt : result ,result_html : result_html};
  var _res = res;

  console.log(selectSQL);
  connection.query(selectSQL, function (err, rs) {
    if(err){
      _res.send(err.message);
      return;
    }else{
      console.log(name,time)
      connection.query("insert into results set ?", user, function (err, rs) {
        if (err) throw err;
        console.log("ok");
        res.sendFile(__dirname + "/" + "public/success.html");
      });
      return;
  };
  });
  }});
}})
})

 
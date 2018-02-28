/**
 * Created by saber on 2017/12/27.
 */
//      启动文件
//      加载express框架
var express = require("express");
//      地址栏路径
var path = require("path");
//      错误处理日志
var morgan = require("morgan");
//      处理cookie
var cookieParser = require("cookie-parser");
//      cookie 的一个模块
var flash = require("connect-flash");
//      session处理
var session = require("express-session");
//      处理post  请求
var bodyParser = require("body-parser");
var app = express();
var index = require("./routes/index.js")
var handler = require("./routes/db.js")
app.use(session({
    secret:"qq",
    name:"qq",
    resave:false,//是指每次请求都重新设置session cookie，假设你的cookie是10分钟过期，每次请求都会再设置10分钟
    saveUninitialized: true//初始化模块   是指无论有没有session cookie，每次请求都设置个session cookie ，
}))
app.use(morgan("dev"))
app.use(cookieParser())
// 处理post请求
//处理json
app.use(bodyParser.json())
//      处理静态资源
app.use(express.static(path.join(__dirname,"static")))
//处理字符串
//// 创建 application/x-www-form-urlencoded 编码解析
app.use(bodyParser.urlencoded({extended:true}))
app.use("/Handler",index)
//      解决跨域处理
app.all('*', function(req, res, next) {
    var oriRefer;
    if(req.headers.referer){
        oriRefer= req.headers.referer.substring(0,req.headers.referer.indexOf("/",10));
    }
    var MIME_TYPE = {
        "css": "text/css",
        "gif": "image/gif",
        "html": "text/html",
        "ico": "image/x-icon",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "js": "text/javascript",
        "json": "application/json",
        "pdf": "application/pdf",
        "png": "image/png",
        "svg": "image/svg+xml",
        "swf": "application/x-shockwave-flash",
        "tiff": "image/tiff",
        "txt": "text/plain",
        "wav": "audio/x-wav",
        "wma": "audio/x-ms-wma",
        "wmv": "video/x-ms-wmv",
        "xml": "text/xml"
    };
    var filePath;
    if(req.url==="/"){
        filePath =  "index.html";
    } else if(req.url==="/www/"){
        filePath =  "index.html";
    }else{
        filePath = "./" + url.parse(req.url).pathname;
    }
    var ext = path.extname(filePath);
    ext = ext?ext.slice(1) : 'unknown';
    var contentType = MIME_TYPE[ext] || "text/plain";
    res.header("Access-Control-Allow-Origin", oriRefer?oriRefer:"*");//针对哪个域名可以访问，*表示所有
    res.header('Access-Control-Allow-Credentials', true);//是否可以携带cookie
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", contentType+";charset=utf-8");
    next();
});

module.exports = app;

/**
 * Created by saber on 2017/12/27.
 */
//      配置细节接口文件
var express = require("express");
var router = express.Router();
var handler = require("./db.js");
var url=require("url");
var formidable=require("formidable");/*需要下载*/
var fs = require("fs");
var session=require('express-session');
var crypto=require("crypto");

var ObjectID =require("mongodb").ObjectID;
//http://127.0.0.1:3000/Handler/AdminLoginHandler?action=returninfo
//var db=require("./db.js");
function User(user){
    this.id=user.id;
    this.name=user.name;
    this.veri=user.veri;//验证码
    this.password=user.password;
}
/*------------------------------------------------列表查询---------------------------------------------------*/
router.get("/todos",function(req,res){
    /**/
    var action=req.query.action;
    switch (action){
        case "show":                  
                handler.find("todos",{},function(err,result){
                    if (result.length==0){
                        res.send("系统错误")
                    }else{
                        var data={
                            "success":"获取成功",
                             data:{
                                list:result,
                                count:result.length
                            }
                        }                       
                        // res.send("cb("+JSON.stringify(data)+")");  jsonp方式
                        res.send(data)
                    }
                })
            
            break;
        //增加
        case "add":
                handler.find("todos",{},function(err,arr){
                    var newtodos={
                        tokenId:arr.length,
                        title:req.query.title,
                        completed:req.query.completed
                    }
                    handler.add("todos",newtodos,function(err,data){
                        if(err){
                            return
                        }
                        res.send("用户成功插入")
                    }) 
                })
                break;
         //删除
         case "remove":
         console.log({"tokenId":req.query.tokenId});
         handler.del("todos",{"tokenId":parseInt(req.query.tokenId)},function(err,data){
             if(err){
                 return
             }
             handler.find("col",{"tokenId":{$gt:parseInt(req.query.tokenId)}},function(err,docs){
                 if (docs.length==0){
                     res.send("最后一条不需要更新")
                 }else{
                     for (var i in  docs){
                         handler.update("todos",{"tokenId":docs[i].tokenId},{$set:{"tokenId":docs[i].tokenId-1}},function(err,data){
                             if (err) {
                                 return
                             }
                         })
                     }
                     res.send("数据删除更新成功")
                 }
             })
         })
         break;
        //修改
        case "updata":
        handler.update("todos",{"tokenId":parseInt(req.query.tokenId)},{$set:{title:req.query.title}},function(err,docs){
            if (err){
                return
            }
            res.send("修改成功")
        })
        break;
        //修改 completed
        case "change":
        handler.update("todos",{"tokenId":parseInt(req.query.tokenId)},{$set:{completed:req.query.completed}},function(err,docs){
            if (err){
                return
            }
            res.send("修改成功")
        })
        break;
                   
                
    }
})
/*---------------------------------------------teacher--注册登录---------------------------------------------------------------------*/
router.post("/AdminRegHandler",function(req,res){
    var address = req.query.address;
    var reg=/^1[34578][0-9]{9}$/;
    //var info={
    //    tokenId:"",
    //    name:req.body.name,
    //    trueName:req.body.truename,
    //    phone:req.body.phone,
    //    password:req.body.password,
    //    createAt:new  Date(),
    //    updataAt:new  Date(),
    //    isDelete:/^fcgl/.test(req.body.truename)?false:true,
    //    power:req.body.powerCode=="1"?"系统管理员":"课程管理员",
    //    powerCode:req.body.powerCode
    //}
    switch (address){
       case "add":
           var md5 = crypto.createHash('md5');
           handler.find("col",{name:req.body.name},function(err,docs){
               console.log(docs);
               if (docs.length != 0){
                   res.send("已经存在")
               }else{
                   handler.find("col",{},function(err,arr){
                       //console.log(arr[arr.length-1].tokenId);
                       var info={
                           tokenId:arr.length+1,
                           name:req.body.name,
                           trueName:req.body.truename,
                           phone:(/^1[34578][0-9]{9}$/).test(req.body.phone)?req.body.phone:false,
                           password:md5.update(req.body.password).digest("base64"),
                               //req.body.password,
                           createAt:new  Date(),
                           updataAt:new  Date(),
                           isDelete:/^fcgl/.test(req.body.truename)?false:true,
                           power:req.body.powerCode=="1"?"系统管理员":"课程管理员",
                           powerCode:req.body.powerCode,
                       }
                       if (info.phone==false){
                           res.send("手机号不对,返回请重新插")
                       }else{
                           handler.add("col",info,function(err,data){
                               if(err){
                                   return
                               }
                               res.send("用户成功插入")
                           })
                       }
                   })
               }
           })
            break;
        case "login":
        // console.log("啦啦啦啦啦阿里")
        // console.log(req.body.data);
        // console.log(typeof (req.body.data))
        // console.log(JSON.parse(req.body.data).user);
        
            var md5 = crypto.createHash('md5');
            var info1={
                // name:req.body.newname,
                // password:md5.update(req.body.newpassword).digest("base64")
                name:JSON.parse(req.body.data).user,
                //password:JSON.parse(req.body.data).password
                password:""+md5.update(JSON.parse(req.body.data).password).digest("base64")
                //password:req.body.newpassword
            }
            console.log(info1)
            handler.find("col",info1,function(err,docs){           
              console.log(docs)
                if (docs.length != 0){
                    //req.session.loginsta="true";
                    req.session.sessionID=docs[0]._id;
                    req.session.user={
                        sessionID:docs[0]._id,
                        username:docs[0].name,
                        password:docs[0].password
                    }
                    res.send("登录成功")
                }else{
                    res.send("用户名错误")
                }
            })
            break;
        /*-------------------------------------------修改密码----------------------------------------------------*/
        case "update":
            var md5 = crypto.createHash('md5');
            // var infoOld={
            //     name:req.body.name,
            //     password:md5.update(req.body.oldpassword).digest("base64")
            // }
            var md5new = crypto.createHash('md5');
            // var  infoNew={
            //     name:req.body.name,
            //     password:md5new.update(req.body.newpassword).digest("base64")
            // }
            /*-----------第一种----------*/
            /*登录以后  根据用户名和密码  匹配到数据   修改*/
            //handler.find("col",infoOld,function(err,docs){
            //    if (docs.length != 0){
            //       handler.update("col",infoOld,{$set:infoNew},function(err,docs){
            //           res.send("修改成功修改后密码为"+req.body.newpassword)
            //       })
            //    }else{
            //        res.send("用户名错误")
            //    }
            //})
            /*-----------第二种(推荐)----------*/
/*登录以后  根据登陆后存储的id匹配到数据   修改*/
            var  sessionId=new  ObjectID(req.session.user.sessionID);
            console.log(typeof(req.body.data));
            console.log("修改后的密码为"+req.body.data)
            var xin=req.body.data;
            handler.update("col",{_id:sessionId},{$set:{password:md5new.update(xin).digest("base64")}},function(err,docs){
                if (err){
                    return
                }
                res.send("修改成功修改后密码为"+xin)
            })
            break;
    }
})
/***------------------------------------编辑用户手机号-------------------------*/
router.post("/AdminHandler",function(req,res){
        var action = req.query.action;
        switch (action) {
            case "update":
                var info = {
                    phone: req.body.phone
                }
                var userinfo = {name: req.body.user}
                handler.update("col", userinfo, {$set: info}, function (err, data) {
                    if (err) {
                        return
                    }
                    res.send("修改成功" + req.body.phone)
                })
                break;
        }
})
router.get("/AdminDelHandler",function(req,res){
    var action = req.query.action;
    switch (action){
        case "remove":
            console.log({"tokenId":req.query.id});
            handler.del("col",{"tokenId":parseInt(req.query.id)},function(err,data){
                if(err){
                    return
                }
                handler.find("col",{"tokenId":{$gt:parseInt(req.query.id)}},function(err,docs){
                    if (docs.length==0){
                        res.send("最后一条不需要更新")
                    }else{
                        for (var i in  docs){
                            handler.update("col",{"tokenId":docs[i].tokenId},{$set:{"tokenId":docs[i].tokenId-1}},function(err,data){
                                if (err) {
                                    return
                                }
                            })
                        }
                        res.send("数据删除更新成功")
                    }
                })
            })
            break;
    }
})
module.exports = router;
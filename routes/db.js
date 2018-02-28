/**
 * Created by Administrator on 2017/12/25.
 */
var mongoClient=require("mongodb").MongoClient;
var settings=require("./settings.js");

//      根函数
function ConnectDB(callback){
    var url=settings.dburl;
    mongoClient.connect(url,function(err,db){
        if(err){
            callback(err,null);
             return;
        }
        callback(err,db)
    })
}
//      增
exports.add = function(collectionName,json,callback){
    ConnectDB(function(err,db){
        db.collection(collectionName).insertOne(json,function(err,data){
            callback(err,data);
            db.close()
        })
    })
};
//      删
exports.del = function(collectionName,json,callback){
    ConnectDB(function(err,db){
        db.collection(collectionName).remove(json,function(err,data){
            callback(err,data);
            db.close()
        })
    })
};
//      改
exports.update = function(collectionName,json1,json2,callback){
    ConnectDB(function(err,db){
        db.collection(collectionName).updateMany(json1,json2,function(err,data){
            callback(err,data)
            db.close();
        })
    })
}
//      查
exports.find = function(collectionName,json,callback){
    ConnectDB(function(err,db){
        var data = db.collection(collectionName).find(json).toArray(function(err,data){
            if(err){
                return;
            }
            callback(err,data)
            db.close();  //关闭数据库
        });


    })
}
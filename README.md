#ImChat
Express 4.X + Mongodb 的IM聊天程序，
需要在根目录创建一个setting.js配置数据库的连接信息(host, port, dbname);

#Usage:
1.创建配置文件`setting.js`，只用来配置连接数据库的host，port和dbname。
```
touch setting.js
vi setting.js
```
Like this:
```
module.exports = {
  host: 'localhost',
  port: 27017,
  db: 'graPro'
}

```

2.确定gulp，gulp-cli版本>= 3.9.0

3.`gulp`。


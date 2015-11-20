Ancient Class 互动课堂
======================

（本指导均以 Windows 为例，其他平台用户，作为 power user 你一定能自己处理好的！嗯！【划掉】）
 

安装方法
--------

### 服务器端安装


1.  下载 Nw.js 二进制编译包，复制到 ```PresitationView\\bin```

2.  安装 MongoDB，Node.js

3.  运行 Node.js command prompt 进入 server 目录，执行 ```node install```

### 教师密钥配置

1.  遵照【运行方法】启动 Ancient Classroom 的所有组件

2.  打开另一cmd，进入mongoDB安装目录

3.  执行```Server\3.0\bin\mongo.exe```

4.  执行```use ancient```

5.  执行```db.teacher.insert({token:"【你的密码】"})```

6.  教师控制设备进入 ```http://[Server IP]/#/teacher```

7.  导入密钥

### 路由器端配置

建议为服务器所在设备设置固定IP，学生或教师只需要使用浏览器访问服务器所在IP即可。


运行方法
--------

####服务器端启动

1.  打开cmd，进入mongoDB安装目录

2.  执行 ```Server\3.0\bin\mongod.exe --dbpath [Ancient Classroom Dir]\Server\data

3.  打开另一cmd，进入 Ancient Class 所在目录

4.  执行 node server.js

#### 教师管理

教师控制设备进入 ```http://[Server IP]/#/teacher```


版权声明
--------

### 素材来源

Ancient Classroom 程序部分遵循 GPL-2.0 协议开源，课件内素材来源如下：

*随本教案一同打包的视频由以下资源剪辑而成：*

* Google Chromecast Official Video （Google 公司，来源：YouTube）https://www.youtube.com/watch?v=5qZG3sJpHIo

* Microsoft Devices Do Great Things（微软公司，来源：YouTube）https://www.youtube.com/watch?v=4ZawV1mXlS8

* Microsoft Band Live Healthier（微软公司，来源：YouTube）https://www.youtube.com/watch?v=DBmKfkReBC4

* デジモンアドベンチャー tri. シリーズティザー　デジモンアドベンチャー 15th Anniversary Project （東映アニメーション公式YouTubeチャンネル，来源：YouTube）https://www.youtube.com/watch?v=MKWC2HjeAfU

视频均来自互联网，仅作教学用途，任何人不得以任何形式进行二次利用或商用，否则引起的一切我们概不负责。

课件与授课站点使用了这些人绘制的图片素材：

* Travel, Wine, Fish, Camera, Compass, Pants, Swimming, （Ema Dimitrova，来源：the Noun Project）

* Hotdog （Joe Pemberton，来源：the Noun Project）

* Volleyball （Sussex Designer，来源：the Noun Project）

* Dumbbell （ILKEBRS，来源：the Noun Project）

* Flower （gayatri，来源：the Noun Project）

* Glass （Jason Grube，来源：the Noun Project）

* Knitting （Sitara Shah，来源：the Noun Project）

* Smoking （Creative Stall，来源：the Noun Project）

* Baseball, Basketball, Soccer, Tennis （Ezgi Nazlı，来源：the Noun Project）

* Tea（WARSLAB，来源：the Noun Project）

* Dance（Matt Brooks，来源：the Noun Project）

* Pencil（icon 54，来源：the Noun Project）

* Game（Richard Schumann，来源：the Noun Project）

* Poker（misirlou，来源：the Noun Project）

* Book（Antonis Makriyannis，来源：the Noun Project）

* TV（Mehmet Gozetlik，来源：the Noun Project）

* Internet, Shopping（Creative Stall，来源：the Noun Project）

* Coding（useiconic.com，来源：the Noun Project）

* Chat, Heart, Newspaper, beaker（Designmodo for Smashing Magazine，来源：the Noun Project）

* Node（Sherrinford，来源：the Noun Project）

* Cat（Vlad Likh）

* Scissors（Sergey Demushkin）

* Science（Erin Agnoli）

* Newspaper（Jonathan 'Jonnie' Butcher）

* Heart（Egidio Filippetti）

* The photo of a classroom（How to Efficiently Pack Up Your Classroom，teacherpop.org）

*课堂其余使用素材出处如下：*

* 2014 秩父夜祭 日本芸術花火大会 （ultravox-uvx-01，来源：Youtube，有删减）https://www.youtube.com/watch?v=C_pLY6CNLPk

### Ancient Classroom 使用了如下开源工具


* AngularJS v1.4.6 (c) 2010-2015 Google, Inc. http://angularjs.org License: MIT

* jQuery v1.11.3 (c) 2005, 2015 jQuery Foundation, Inc. jquery.org/license

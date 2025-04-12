const express = require('express')
const cors = require('cors');
const { db } = require('./db/db');
const {readdirSync} = require('fs')
const app = express()

require('dotenv').config()

const PORT = process.env.PORT

//middlewares
app.use(express.json())

//app.use(cors())
app.use(cors({
    origin: "*", // 仅作为调试。部署生产环境建议限制为你的前端地址
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
  


//routes
// readdirSync('./routes').map((route) => app.use('/api/v1', require('./routes/' + route)))
const path = require('path');

readdirSync('./routes')
  .filter(file => file.endsWith('.js')) // ✅ 忽略非 .js 文件
  .forEach(file => {
    const route = require(path.join(__dirname, 'routes', file));

    if (typeof route !== 'function') {
      console.error(`❌ 路由 ${file} 没有导出中间件函数`);
      return;
    }

    app.use('/api/v1', route);
    console.log(`✅ 路由挂载成功：/api/v1/${file}`);
  });


const server = () => {
    db()
    app.listen(PORT, () => {
        console.log('listening to port:', PORT)
    })
}

server()
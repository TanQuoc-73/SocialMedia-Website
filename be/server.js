const express = require('express')

const app = require('./src/app')

const http = require('http')
const socketIO = require('socket.io')

const server = http.createServer(app)
const io = socketIO(server,{
    cors:
    {
        origin:"http://127.0.0.1:5500/testfe/index.html",
        methods:["GET","POST"]
    }
})

require('./src/socket/socketHandler')(io)

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
    console.log(`Server is running on port: http://localhost:${PORT}`)
})
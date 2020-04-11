let express = require("express")
let app = express()
let serv = require("http").createServer(app)
port = 3000


app.get("/", function(req, res){
    res.sendFile(__dirname + "/client/index.html")
})
app.use("/client", express.static(__dirname + "/client"))

serv.listen(port, () => console.log("connection"))

let socketList = []

let io = require("socket.io")(serv,{})
io.sockets.on("connection", function(socket){
    console.log("socket connection: ")
    socket.ID = Math.random()
    socket.x = 0
    socket.y = 0
    socket.num = Math.floor(Math.random() * 10)
    socketList[socket.ID] = socket

    socket.on("disconnect", () => {
        delete socketList[socket.ID]
    })
})

setInterval(function(){
    let pack = []
    for(let i in socketList){
        let socket = socketList[i]
        socket.x++
        socket.y++
        pack.push({
            x: socket.x,
            y: socket.y,
            num: socket.num
        })
    }
    for(let i in socketList){
        let socket = socketList[i]
        socket.emit("newPositions", pack)
    }
}, 1000/30)

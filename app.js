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
    let socketID = Math.random()
    socket.x = 0
    socket.y = 0
    socketList[socketID] = socket
})

setInterval(function(){
    for(let i in socketList){
        let socket = socketList[i]
        socket.x++
        socket.y++
        socket.emit("newPosition", {
            x: socket.x,
            y: socket.y
        })
    }
}, 1000/30)

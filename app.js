let express = require("express")
let app = express()
let serv = require("http").createServer(app)
port = process.env.PORT || 3000


/*
    Client priority multiplayer gaming experience
    Everyone else is laggy, you'r not
    This is in contrast to everyone lags due to server connection, the load is now only on others positions
*/


app.get("/", function(req, res){
    res.sendFile(__dirname + "/client/index.html")
})
app.use("/client", express.static(__dirname + "/client"))

serv.listen(port, () => console.log("connection"))

let socketList = []
let playerList = []


let io = require("socket.io")(serv,{})
io.sockets.on("connection", function(socket){
    console.log("socket connection: ")
    socket.ID = Math.random()
    socketList[socket.ID] = socket

    socket.on("disconnect", () => {
        delete socketList[socket.ID]
        delete playerList[socket.ID]
        for(let i in socketList){
            let so = socketList[i]
            so.emit("playerDisconnect",{
                id: socket.ID
            })
        }
    })

    socket.emit("playerInitializationID", {
        id: socket.ID
    })

    socket.on("playerInitialization", (data)=>{
        playerList[socket.ID] = data.player
        playerList[socket.ID].id = socket.ID
    })

    socket.on("myPosition", (data) => {
        if(playerList[data.id]){
            playerList[data.id].x = data.x
            playerList[data.id].y = data.y
        }
    })

})

setInterval(function(){
    let pack = []
    for(let i in playerList){
        let player = playerList[i]
        pack.push(player)
    }
    for(let i in socketList){
        let socket = socketList[i]
        socket.emit("allPlayerPos", pack)
    }
}, 1000/60)

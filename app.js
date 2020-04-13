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
let playerList = []

class Player{
    constructor(id){
        this.x = 250
        this.y = 250
        this.id = id
        this.num = Math.floor(Math.random() * 10)
        this.pressingRight = false
        this.pressingLeft = false
        this.pressingDown = false
        this.pressingUp = false
        this.maxspeed = 10
    }

    updatePosition(){
        if(this.pressingRight){
            this.x += this.maxspeed
        }
        if(this.pressingLeft){
            this.x -= this.maxspeed
        }
        if(this.pressingUp){
            this.y += this.maxspeed
        }
        if(this.pressingDown){
            this.y -= this.maxspeed
        }
    }
}

let io = require("socket.io")(serv,{})
io.sockets.on("connection", function(socket){
    console.log("socket connection: ")
    socket.ID = Math.random()
    socket.x = 0
    socket.y = 0
    socket.num = Math.floor(Math.random() * 10)

    socketList[socket.ID] = socket
    let player = new Player(socket.ID)
    playerList[socket.ID] = player

    socket.on("disconnect", () => {
        delete socketList[socket.ID]
        delete playerList[socket.ID]
    })

    socket.on("keypress", (data) => {
        if(data.inputID == "left"){
            player.pressingLeft = data.state
        }else if(data.inputID == "right"){
            player.pressingRighy = data.state
        }else if(data.inputID == "up"){
            player.pressingUp = data.state
        }else if(data.inputID == "down"){
            player.pressingDown = data.state
        }
    })
})

setInterval(function(){
    let pack = []
    for(let i in playerList){
        let player = playerList[i]
        player.updatePosition()
        pack.push({
            x: player.x,
            y: player.y,
            num: player.num
        })
    }
    for(let i in socketList){
        let socket = socketList[i]
        socket.emit("newPositions", pack)
    }
}, 1000/30)

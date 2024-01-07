const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const userRoutes = require("./routes/userRoutes")
const messageRoutes = require("./routes/messagesRoutes")
const socket = require("socket.io")

const app = express()
require("dotenv").config()

app.use(cors())
app.use(express.json())

app.use("/api/auth", userRoutes)
app.use("/api/messages", messageRoutes)

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("DB Connection Successful")
    })
    .catch((err) => {
        console.log(err.message)
    })

const server = app.listen(process.env.PORT, () => {
    console.log(`Server has started on port ${process.env.PORT}`)
})

const io = socket(server, {
    cors: {
        origin: "https://venomsnappy.netlify.app/",
        credentials: true,
    },
})

global.onlineUsers = new Map()

io.on("connection", (socket) => {
    global.chatSocket = socket
    socket.on("add-user", (userID) => {
        onlineUsers.set(userID, socket.id)
    })

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to)
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.message)
        }
    })
})

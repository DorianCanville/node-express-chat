require('dotenv').config();
const express = require('express');
const sUser = require("./models/user");
const sMessage = require("./models/message");

// export one function that gets called once as the server is being initialized
module.exports = function (app, server) {

    let member = [];
    let messages = [];
    let messageGroupby = [];
    const mongoose = require('mongoose');
    mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).then(() => { //c'est pas opti du tout mais j'avais un problème quand je refresh ça enlève tout les derniers messages et si je me reco je recupère tout du serveur donc tout les messages (bref problème d'affichage) 
         sMessage.find().exec((err,result) => {
            messages = result;
         });
         const aggregatorOpts = [
            {
                $group: {
                    _id: "$UserName",
                    count: { $sum: 1 }
                }
            }
        ]
    
        sMessage.aggregate(aggregatorOpts).exec((err,result) => {
            messageGroupby = result;
            console.log(result);
            io.emit("updateMessage", messageGroupby);
        })
    })

    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', '*');
        next();
    });

    app.use(express.json());

    const io = require('socket.io')(server, {
        cors: {
            origin: "http://127.0.0.1:5500",
            methods: ["GET", "POST"]
        }
    })

    io.on('connection', (socket) => {
        console.log(`Connecté au client ${socket.id}`)
        io.emit('notification', { type: 'new_user', data: socket.id });
        
        socket.emit('messages', messages);

        // Listener sur la déconnexion
        socket.on('disconnect', () => {
        let position = -1;
          for (let index = 0; index < member.length; index++) {
              if(member[index].id == socket.id){
                  position = index;
              }
          }
          member.splice(position,position);

          console.log(`user ${socket.id} disconnected`);
          io.emit('notification', { type: 'removed_user', data: socket.id });
        });

        socket.on("newMember", (data) => {
            member.push({pseudo : data, id : socket.id, countmessage : 0});
            member.map(e => {
                messageGroupby.map(f => {
                    if(f._id == e.pseudo){
                        e.countmessage = f.count;
                    }
                })
            })
            console.log(member);           
            io.emit("newMemberList", member);
        })
        
        socket.on("NewMessage",(messageObject) => {
            console.log(messageObject);
            let smessage = new sMessage( {
                    uuid : messageObject.Uuid_User,
                    UserName : messageObject.UserName,
                    message : messageObject.message
                })
            smessage.save().then((err,result) => {
                console.log(result);
            })
        
        
        socket.on("Login", (userObject) => {
            console.log("hey login")
            let suser = new sUser({
                uuid : userObject.uuid,
                login : userObject.login,
                mdp : userObject.mdp
            })
            let resultquey = sUser.findOne({mdp : suser.mdp, login : suser.login}).exec((err, result) => {
                console.log(result);
                if(err == null && (result.uuid != "" || result.uuid != null)){
                    console.log("login ok")
                    socket.emit("connection_ok");
                }
            });
            console.log(resultquey);
        })

        socket.on("Register", (userObject) => {

            let suser = new sUser({
                uuid : userObject.uuid,
                login : userObject.login,
                mdp : userObject.mdp
            });

            let result;
            suser.save((err, reslt) => {
                reslt = result;
                console.log(reslt);
                if(err == null){
                    socket.emit("connection_ok");
                }
            });
            
        })

      })


    app.use(function (req, res, next) { req.io = io; next(); });

    app.get('/test', (req, res, next) => {
        res.status(200).json({ hello: 'world' })
    })


    })
}
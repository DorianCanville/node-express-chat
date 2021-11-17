(
    function () {

        console.log("mains.js ok")
        var uuid_User = "";
        var userName = localStorage.getItem("userName");

        var localStorageUuid = localStorage.getItem("Uuid");
    
        if(localStorageUuid != "" && localStorageUuid != null){
            uuid_User = localStorageUuid
            // faire une requete pour connecter la bonne personne directement
        }else{
            Uuid_User = creatUuid();
            document.location.href="./login.html"; 
            localStorage.setItem("Uuid", Uuid_User);
        }
        console.log("uuid = " + uuid_User);


        if(document.location.href.includes("login.html") || document.location.href.includes("Login.html")){ //des fois j'ai une majuscule des fois non
            console.log("login page");
            var loginButton = document.getElementById("loginButton");
            loginButton.addEventListener("click", LoginUser);

            var registerButton = document.getElementById("registerButton");
            registerButton.addEventListener("click", registerUser);

        }

        if(document.location.href.includes("index.html")){
            var nbMessage = 0;
            var textBarInput = document.getElementById("textBarInput");
            var submitButton = document.getElementById("submitButton");
            var memberList = document.getElementById("member-list");
            document.getElementById("myname").textContent = userName;
    
            var conversationDiv = document.getElementsByClassName("conversationDiv");
            console.log(document.location.href);
            var chatArea = document.getElementsByClassName("chat-list");
    
            console.log(chatArea);
            console.log(chatArea[0].children[0]);
    
            submitButton.addEventListener("click", newMessage);
            // conversationDiv.map(e => e.addEventListener("click", openConv));
    
        }


//#region Socketio
        ////////////////////////////////////
        //Socket io start// Fonction qui utilise du Socket io
        ///////////////////////////////////


    const server = 'http://127.0.0.1:3000'
    const socket = io(server);

    socket.on('notification', (data) => {
        console.log('Message depuis le seveur:', data);
    })

    socket.emit('newMember', userName)

    socket.on('newMemberList', (data) => {
        try {
            memberList.innerHTML = "";
        } catch (error) {
            
        }
        
        data.map(e => {
            addMember(e.pseudo,e.count);
        })
    })

    fetch(`${server}/test`).then((res) => {
        return res.json()
    }).then((data) => {
        console.log(data);
    })

    function newMessage(){

        let messageObject = {
                Uuid_User : uuid_User,
                UserName : userName,
                message : textBarInput.value
            };
        console.log("message");
        console.log(messageObject);
        if(messageObject.message != ''){
            socket.emit("NewMessage", messageObject);
        }
    }

    socket.on("NewMessage", (messageObject) => {
        
        addMessage(messageObject);
    })

    socket.on("messages", (messages) => {
        messages.map(e => {
            addMessage(e);
        });
    })

    socket.on("connection_ok", () => {
        localStorage.setItem("userName", userName);
        document.location.href="./index.html";
    })

    function LoginUser(){
        console.log("login");
        let login = document.getElementById("login").value;
        userName = login;
        let mdp = SHA1(document.getElementById("password").value);
        let userObject = {
            login : login,
            mdp : mdp,
            uuid : uuid_User
        };
        console.log(userObject);
        socket.emit("Login", userObject);
    }

    function registerUser(){
        console.log("register");
        let login = document.getElementById("login").value;
        userName = login;
        let mdp = SHA1(document.getElementById("password").value);
        let userObject = {
            login : login,
            mdp : mdp,
            uuid : uuid_User
        };
        console.log(userObject);
        socket.emit("Register", userObject)
    }
        
    

        ////////////////////////////////////
        //Socket io end//
        ///////////////////////////////////
//#endregion Socketio

//#region Fonction utile
        ////////////////////////////////////
        //Fonction utile start // Fonction utile
        ///////////////////////////////////

        function creatUuid(){
            let uuid =([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
            console.log(uuid);
            return uuid;
        }

        function addMessage(messageObject){
            nbMessage++;
            try {
                document.getElementById("nbTotalMessage").textContent = "Nombre total de messages : " + nbMessage;

            } catch (error) {
                
            }
            console.log(messageObject);

            let li = document.createElement("li");
            li.classList.add(messageObject.UserName);
            let div = document.createElement("div");
            div.classList.add("name");
            let text = document.createElement("span");
            text.textContent = messageObject.UserName; //messageObject.userName;
            
            div.appendChild(text)
            li.appendChild(div);

            let div2 = document.createElement("div");
            div2.classList.add("message");
            let text2 = document.createElement("p");
            text2.textContent = messageObject.message;

            div2.appendChild(text2)
            li.appendChild(div2);
            try {
                textBarInput.value = "";
            } catch (error) {
                
            }
            try {
                chatArea[0].children[0].appendChild(li);
            } catch (error) {
                
            }
        }

        function addMember(member, count){
            console.log(member)
            if(member != undefined){
                console.log(member);
                let li = document.createElement("li");
                let text = document.createElement("span");
                //let counttext = count.toString(10);
                text.textContent = member + "  ";
                li.appendChild(text);
                try {
                    memberList.appendChild(li);
                } catch (error) {
                    
                }
                
            }

        }



        //#region Sha1
        /**
* Secure Hash Algorithm (SHA1)
* http://www.webtoolkit.info/
**/
function SHA1(msg) {
    function rotate_left(n,s) {
    var t4 = ( n<<s ) | (n>>>(32-s));
    return t4;
    };
    function lsb_hex(val) {
    var str='';
    var i;
    var vh;
    var vl;
    for( i=0; i<=6; i+=2 ) {
    vh = (val>>>(i*4+4))&0x0f;
    vl = (val>>>(i*4))&0x0f;
    str += vh.toString(16) + vl.toString(16);
    }
    return str;
    };
    function cvt_hex(val) {
    var str='';
    var i;
    var v;
    for( i=7; i>=0; i-- ) {
    v = (val>>>(i*4))&0x0f;
    str += v.toString(16);
    }
    return str;
    };
    function Utf8Encode(string) {
    string = string.replace(/\r\n/g,'\n');
    var utftext = '';
    for (var n = 0; n < string.length; n++) {
    var c = string.charCodeAt(n);
    if (c < 128) {
    utftext += String.fromCharCode(c);
    }
    else if((c > 127) && (c < 2048)) {
    utftext += String.fromCharCode((c >> 6) | 192);
    utftext += String.fromCharCode((c & 63) | 128);
    }
    else {
    utftext += String.fromCharCode((c >> 12) | 224);
    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
    utftext += String.fromCharCode((c & 63) | 128);
    }
    }
    return utftext;
    };
    var blockstart;
    var i, j;
    var W = new Array(80);
    var H0 = 0x67452301;
    var H1 = 0xEFCDAB89;
    var H2 = 0x98BADCFE;
    var H3 = 0x10325476;
    var H4 = 0xC3D2E1F0;
    var A, B, C, D, E;
    var temp;
    msg = Utf8Encode(msg);
    var msg_len = msg.length;
    var word_array = new Array();
    for( i=0; i<msg_len-3; i+=4 ) {
    j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
    msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
    word_array.push( j );
    }
    switch( msg_len % 4 ) {
    case 0:
    i = 0x080000000;
    break;
    case 1:
    i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;
    break;
    case 2:
    i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16 | 0x08000;
    break;
    case 3:
    i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16 | msg.charCodeAt(msg_len-1)<<8 | 0x80;
    break;
    }
    word_array.push( i );
    while( (word_array.length % 16) != 14 ) word_array.push( 0 );
    word_array.push( msg_len>>>29 );
    word_array.push( (msg_len<<3)&0x0ffffffff );
    for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {
    for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
    for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);
    A = H0;
    B = H1;
    C = H2;
    D = H3;
    E = H4;
    for( i= 0; i<=19; i++ ) {
    temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
    E = D;
    D = C;
    C = rotate_left(B,30);
    B = A;
    A = temp;
    }
    for( i=20; i<=39; i++ ) {
    temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
    E = D;
    D = C;
    C = rotate_left(B,30);
    B = A;
    A = temp;
    }
    for( i=40; i<=59; i++ ) {
    temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
    E = D;
    D = C;
    C = rotate_left(B,30);
    B = A;
    A = temp;
    }
    for( i=60; i<=79; i++ ) {
    temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
    E = D;
    D = C;
    C = rotate_left(B,30);
    B = A;
    A = temp;
    }
    H0 = (H0 + A) & 0x0ffffffff;
    H1 = (H1 + B) & 0x0ffffffff;
    H2 = (H2 + C) & 0x0ffffffff;
    H3 = (H3 + D) & 0x0ffffffff;
    H4 = (H4 + E) & 0x0ffffffff;
    }
    var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
   
    return temp.toLowerCase();
   }
        //#endregion Sha1

        ////////////////////////////////////
        //Fonction utile end//
        ///////////////////////////////////

//#endregion
})()
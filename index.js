const discord = require("discord.js");
const botConfig = require("./botconfig.json");
const levelFile = require("./data/levels.json");
const superAgent = require("superagent");


const fs = require("fs");         
const bot = new discord.Client();

const active = new Map();

bot.commands = new discord.Collection(); 

fs.readdir("./commands/" , (err, files) => { 

    if(err) console.log(err);  

    var jsFiles = files.filter(f => f.split(".").pop() === "js"); 

    if(jsFiles.length <=0) {
        console.log("Could not find any files"); 
        return;
    }

    jsFiles.forEach((f, i) => {   

        var fileGet = require(`./commands/${f}`);  
        console.log(`The file ${f} is loaded`); 

        bot.commands.set(fileGet.help.name, fileGet);
    })

});

bot.on("ready", async () => {

    console.log(`${bot.user.username} is online!`)
    // bot.user.setActivity("?help", { type: "PLAYING" });

    let statuses = [
        ">help",
        ` ${bot.users.size} users`,
        ">invite",
        "The Jay Squad Group",
        "For any suggestions/bugs DM \n CatInYellow#1705"
        
]

    setInterval(function() {
       let status = statuses[Math.floor(Math.random() * statuses.length)];
        bot.user.setActivity(status, {type: "WATCHING"});

    }, 3000) 

    

});

// bot.on("guildMemberAdd", member => {

//     var role = member.guild.roles.find("name", "Non-Member");

//     if(!role) return;

//     member.addRole(role);

//     const channel = member.guild.channels.find("name", "new-people");

//     if (!channel) return;

//     channel.send(`Welcome in the server ${member}`);
// });

bot.on("guildMemberAdd", member => {

    const channel = member.guild.channels.find("name", "new-people");
    if (!channel) console.log("Can't find channel");

    var joinMessage = new discord.RichEmbed()
    .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL)
    .setDescription(`Hi ${member.user.username}, **welcome!**`)
    .setColor("#00FF00")
    .setTimestamp()
    .setFooter("User joined");

    channel.send(joinMessage);

});

bot.on("guildMemberRemove", member => {

    const channel = member.guild.channels.find("name", "new-people");
    if (!channel) console.log("Can't find channel");

    var joinMessage = new discord.RichEmbed()
    .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL)
    .setColor("#FF0000")
    .setTimestamp()
    .setFooter("User left");

    channel.send(joinMessage);

});


// var swearWords = ["cancer", "fuck", "shit", "fucking", "bitch", "noob", "nub", "dumb", "stupid", "asshole", "asslicker", "assfucker", "assnigger", "nigger"];

bot.on("message", async message => {

    //Als bot bericht stuurt stuur dan return
    if (message.author.bot) return;

    if (message.channel.type === "dm") return;

    var prefixes = JSON.parse(fs.readFileSync("./prefixes.json"));

    if(!prefixes[message.guild.id]){
       prefixes[message.guild.id] = {
       prefixes: botConfig.prefix
    };
    }

    var prefix = prefixes[message.guild.id].prefixes;


    // var prefix = botConfig.prefix;

    var messageArray = message.content.split(" ");

    var command = messageArray[0];

    var arguments = messageArray.slice(1);


    var commands = bot.commands.get(command.slice(prefix.length));


    var options = {

        active: active

    }


    if (commands) commands.run(bot, message, arguments, options);


    var randomXp = Math.floor(Math.random(1) * 15) + 1;

    var idUser = message.author.id;

    if (!levelFile[idUser]) {

        levelFile[idUser] = {

            xp: 0,
            level: 0

        }

    }

    levelFile[idUser].xp += randomXp;

    var levelUser = levelFile[idUser].level;
    var xpUser = levelFile[idUser].xp;
    var nextLevelXp = levelUser * 300;

    if (nextLevelXp === 0) nextLevelXp = 100;

    if (xpUser >= nextLevelXp) {

        levelFile[idUser].level += 1;

        fs.writeFile("./data/levels.json", JSON.stringify(levelFile), err => {

            if (err) console.log(err);

        });

        var embedLevel = new discord.RichEmbed()
            .setDescription("***Level up!***")
            .setColor("#42f5e0")
            .addField("New level:", levelFile[idUser].level);

            message.channel.send(embedLevel);


    }


    // var msg = message.content.toLowerCase();

    // for (var i = 0; i < swearWords.length; i++){

    //     if (msg.includes(swearWords[i])){

    //         message.delete();

    //         return message.channel.send("Don't swear or face a conversation with the Vice President+!").then(msg => delete(3000));
            
    //     }

    // }

    // var swearWords = JSON.parse(fs.readFileSync("./data/swearWords.json"));

    // var msg = message.content.toLowerCase();

    // for (var i = 0; i < swearWords["swearWords"].length; i++){

    //     if (msg.includes(swearWords["swearWords"][i])){

    //         message.delete();

    //         return message.channel.send("Don't swear or face a mute!").then(msg => msg.delete(3000));
            
    //     }

    // }


    if(!commands) {

        var swearWords = JSON.parse(fs.readFileSync("./data/swearWords.json"));

        var sentenceUser = "";

        var amountSwearWords = 0;

        for(var y = 0; y < messageArray.length; y++) {

            var changeWord = "";

            for(var i = 0; i < swearWords["swearWords"].length; i++) {

                var word = messageArray[y].toLowerCase();

                if(word == swearWords["swearWords"][i]) {

                    changeWord = word.replace(swearWords["swearWords"][i], "****");

                    sentenceUser = sentenceUser + " " + changeWord;

                    amountSwearWords++;

                }

            }

            if(!changeWord){

                sentenceUser = sentenceUser + " " + messageArray[y];              


            }

        }

        if(amountSwearWords != 0){

            message.delete();
            message.channel.send(sentenceUser);
            message.channel.send(message.author + " Don't swear! It may lead to an mute! Thank you!");

        }

    }



      if (command === `${prefix}Hi`) {


      //  return message.channel.send("Hi! Glad you called me! ;)")

      }

     if (command === `${prefix}info`) {

                var botIcon = bot.user.displayAvatarURL;

                var botEmbed = new discord.RichEmbed()
                .setDescription("Disord bot info")
               .setColor("#31d11f")
                .setThumbnail(botIcon)
              .addField("Bot name", bot.user.username)
                .addField("Made on", bot.user.createdAt);

           // return message.channel.send(botEmbed);

           }

    if (command === `${prefix}serverinfo`) {

        var icon = message.guild.iconURL;

        var serverEmbed = new discord.RichEmbed()
            .setDescription("Server info")
            .setColor("#31d11f")
            .setThumbnail(icon)
            .addField("Bot name", bot.user.username)
            .addField("You joined the server at", message.member.joinedAt)
            .addField("Total Members:", message.guild.memberCount);

        return message.channel.send(serverEmbed);

    }

    if (command === `${prefix}kick`) {

        // ?kick @maragerritsen22 Redenen hier.

        var kickUser = message.guild.member(message.mentions.users.first() || message.guild.members(arguments[0]));

        if (!kickUser) return message.channel.send("User not found");

        var reason = arguments.join(" ").slice(22);

        if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You don't have the permissions to do this");

        if (kickUser.hasPermission("MANAGE_MESSAGES")) return message.channel.send("This user is a moderator. I can't kick a moderator.");

        var kick = new discord.RichEmbed()
            .setDescription("Kick")
            .setColor("#b81b16")
            .addField("Kicked user", kickUser)
            .addField("Kicked by", message.author)
            .addField("Reason", reason);

        var kickChannel = message.guild.channels.find(`name`, "logs");
        if (!kickChannel) return message.guild.send("Can not find channel");

        message.guild.member(kickUser).kick(reason);

        kickChannel.send(kick);


        return;

    }

    if (command === `${prefix}ban`) {

        var banUser = message.guild.member(message.mentions.users.first() || message.guild.members(arguments[0]));

        if (!banUser) return message.channel.send("User not found");

        var reason = arguments.join(" ").slice(22);

        if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You don't have the permissions to do this");

        if (banUser.hasPermission("MANAGE_MESSAGES")) return message.channel.send("This user is a moderator. I can't ban a moderator.");

        var ban = new discord.RichEmbed()
            .setDescription("Ban")
            .setColor("#b81b16")
            .addField("Banned user", banUser)
            .addField("Banned by", message.author)
            .addField("Reason", reason);

        var banChannel = message.guild.channels.find(`name`, "logs");
        if (!banChannel) return message.guild.send("Can not find channel");

        message.guild.member(banUser).ban(reason);

        banChannel.send(ban);

        return;

       


    }
   
bot.afk = new Map();



    if (message.content.includes(message.mentions.users.first)) {
      bot.afk.forEach(key => {
        message.guild.fetchMember(key.id).then(member => {
            let user_tag = member.user.tag;
            return message.channel.send(`**${user_tag}** is currently AFK. Reason: ${key.reason}`);
        });
      }); 
    }

   bot.afk.forEach(key => {
    if (message.author.id == key.id) {
      bot.afk.delete(message.author.id);  
    }
   });





});


bot.login(process.env.token);
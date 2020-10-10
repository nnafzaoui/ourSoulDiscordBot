require('dotenv').config();

const { Client } = require('discord.js');
const Discord = require('discord.js');

const client = new Client();
const PREFIX = ".";
const ytdl = require('ytdl-core');
const {
	prefix,
	token,
} = require('../config.json');
const mongoose = require('mongoose');
let Music = require('../models/playlist');
let All = require('../models/allsongs');
const queue = new Map();


const queueEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Lista')
	.setAuthor('ourSoul', 'https://imgur.com/5usGw15.png')
	.setDescription('Currently in queue')
	
    .addField(queue, 'Some value here', true)
    
	.setTimestamp()
	


const uri = process.env.MONGODB;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
);

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
})

client.on('ready', () => {
    console.log(`${client.user.tag} has logged in`)
});


client.on('message', (message) => {
    
    

    if (message.author.bot) return;
    if (message.content.startsWith(PREFIX)) {
        const [CMD, ...args] = message.content
        .trim().substring(PREFIX.length)
        .split(/\s+/);
        // if (CMD === 'all'){
        //     if (message.content.substr(".all".length).length > 10){
        //         const songs = message.content.substr(".all".length);
        //         const newSong = new All ({
        //             songs
        //         })
        //         newSong.save().then(()=> console.log('new song for us'))
        //     }
        // };
        if (CMD === 'zid') {
            if (message.content.substr(".zid".length).length > 10) {
                const owner = message.author.tag;
                const song = message.content.substr(".zid".length);
                const newMusic = new Music ({
                    owner,
                    song,
                })
                newMusic.save()
                    .then(()=> console.log('New song added'))
                    .catch(err => console.log('Error: ' +err));
            }
        };
        if(CMD === 'tla9'){
           
            // Music.findOne({ owner : message.author.tag}, 'song' ).then(music => message.reply(music))
            Music.findOne({ 'owner': 'Noureddine Nafzaoui#4379' }, 'song', function (err, music) {
                if (err) return handleError(err);
                // Prints "Space Ghost is a talk show host".
                
                            
               message.channel.send("-p " + music.song)
                
              });
        }

    }
});

client.on('message', async message => {

    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    
    const serverQueue = queue.get(message.guild.id);

        if (message.content.startsWith(`${prefix}play`)) {
            execute(message, serverQueue);
            return;
        } else if (message.content.startsWith(`${prefix}skip`)) {
            skip(message, serverQueue);
            return;
        } else if (message.content.startsWith(`${prefix}stop`)) {
            stop(message, serverQueue);
            return;
        } else {
            message.channel.send("You need to enter a valid command!");
        };
        if(message.content.startsWith(`${prefix}queue`))
        {
            message.channel.send(queueEmbed)
        }
});

async function execute(message, serverQueue) {
    const args = message.content.split(" ");
  
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
    };
    if (!serverQueue) {
    const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
        };

        queue.set(message.guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
        } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
    }
    }else {
     serverQueue.songs.push(song);
     console.log(serverQueue.songs);
     return message.channel.send(`${song.title} has been added to the queue!`);
    }
  }
  

  function skip(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    if (!serverQueue)
      return message.channel.send("There is no song that I could skip!");
    serverQueue.connection.dispatcher.end();
  }
  
  function stop(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  }
  
  function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
  
    const dispatcher = serverQueue.connection
      .play(ytdl(song.url))
      .on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
  }

  



client.login(process.env.DISCORDJS_BOT_TOKEN);
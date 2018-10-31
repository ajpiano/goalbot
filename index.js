"use strict";

require("now-env");

const path = require('path');
const Commando = require('discord.js-commando');
const client = new Commando.Client({
  owner: process.env.DISCORD_OWNERID
});

client
.on('error', console.error)
.on('warn', console.warn)
.on('debug', console.log)
.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({ game: { name: 'FIFA 19, badly' }, status: 'playing' })
})
.on('disconnect', () => { console.warn('Disconnected!'); })
.on('reconnecting', () => { console.warn('Reconnecting...'); })
.on('commandError', (cmd, err) => {
  if(err instanceof Commando.FriendlyError) return;
  console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
})
.on('commandBlocked', (msg, reason) => {
  console.log(oneLine`
    Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
    blocked; ${reason}
  `);
})
.on('commandPrefixChange', (guild, prefix) => {
  console.log(oneLine`
    Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
    ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
  `);
})
.on('commandStatusChange', (guild, command, enabled) => {
  console.log(oneLine`
    Command ${command.groupID}:${command.memberName}
    ${enabled ? 'enabled' : 'disabled'}
    ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
  `);
})
.on('groupStatusChange', (guild, group, enabled) => {
  console.log(oneLine`
    Group ${group.id}
    ${enabled ? 'enabled' : 'disabled'}
    ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
  `);
});

client.registry .registerGroups([
  ['math', 'Math'],
  ['fut','FUT']
])
.registerDefaults()
.registerTypesIn(path.join(__dirname, 'types'))
.registerCommandsIn(path.join(__dirname, 'commands'));


client.login(process.env.DISCORD_TOKEN);

// Listen on port 3000 so that now.sh doesn't fail the deployment

require('http').createServer().listen(3000);


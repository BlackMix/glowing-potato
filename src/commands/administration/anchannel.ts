import { stripIndents } from 'common-tags';
import { Message, Role, TextChannel } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { join } from 'path';
import { GuildConfig } from '../../dataProviders/models/GuildConfig';

export default class ANChannelCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			name: 'anchannel',
			aliases: ['announcementchannel'],
			group: 'administration',
			memberName: 'anchannel',
			description: 'Enables or disables announcing new or left member, when a message is set up.',
			details: stripIndents`Sets or removes the channel for that purpose.
				Mention the same channel again to remove it.
      			Omit the channel parameter to show the current channel.`,
			examples: ['`anchannel #logs`'],
			guildOnly: true,
			args: [
				{
					key: 'channel',
					prompt: 'wich channel do you like to set or remove?\n',
					type: 'channel',
					default: 'show'
				}
			]
		});
	}

	public hasPermission(msg: CommandMessage): boolean {
		const adminRoles: string[] = this.client.provider.get(msg.guild.id, 'adminRoles', []);
		return msg.member.roles.some((r: Role) => adminRoles.includes(r.id)) || msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	public async run(msg: CommandMessage, args: { channel: TextChannel | String }): Promise<Message | Message[]> {
		const config: GuildConfig = (await GuildConfig.findOrCreate({ where: { guildID: msg.guild.id } }) as any)[0].dataValues;

		if (!(args.channel instanceof TextChannel)) {
			msg.say(config.anChannel ? `The announcement channel is ${msg.guild.channels.get(config.anChannel) || 'deleted'}.` : `No announcement channel set.`);
			return;
		}

		config.anChannel = args.channel.id === config.anChannel ? null : args.channel.id;

		let permissions: string = '';
		if (config.anChannel && !args.channel.permissionsFor(msg.guild.member(this.client.user) || await msg.guild.fetchMember(this.client.user)).hasPermission('SEND_MESSAGES')) {
			permissions = '**Note:** I don\'t have permissions to send messages to that channel.\n';
		}

		await GuildConfig.upsert(config);

		msg.say(`${permissions}The announcement channel ${config.anChannel ? `is now ${msg.guild.channels.get(config.anChannel)}` : 'has been removed'}!`);
	}
};
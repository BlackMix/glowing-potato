import { stripIndents } from 'common-tags';
import { Emoji, GuildChannel, GuildMember, Message, RichEmbed, Role, User } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as moment from 'moment';
moment.locale('de');

export default class ServerinfoCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			name: 'server-info',
			aliases: ['guild-info'],
			group: 'info',
			memberName: 'server-info',
			description: 'General informations about this guild.',
			guildOnly: true,
		});
	}

	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		return msg.embed(new RichEmbed()
			.setColor(0xffa500).setTitle('Informations about this guild.')
			.setThumbnail(msg.guild.iconURL)
			.addField('❯ Channel:', stripIndents`
      • \`${msg.guild.channels.filter((c: GuildChannel) => c.type === 'text').size}\` Textchannel
      • \`${msg.guild.channels.filter((c: GuildChannel) => c.type === 'voice').size}\` Voicechannel`, true)
			.addField('❯ Member:', `• \`${msg.guild.memberCount}\` Member\n• Owner is ${msg.guild.owner}`, true)
			.addField('❯ General:', stripIndents`
      • \`${msg.guild.roles.size}\` Roles
      • In ${this.capitalize(msg.guild.region)}`, true)
			.addField('\u200b', `• Created ${moment(msg.guild.createdAt).format('DD.MM.YYYY [\n   at:] hh:mm:ss')}`, true)
			.addField('❯ Emojis:', this.getRandomEmojis(msg))
		);
	}

	private capitalize(name: string): string {
		return name[0].toUpperCase() + name.slice(1);
	}

	private getRandomEmojis(msg: CommandMessage): string {
		const emojis: string[] = msg.guild.emojis.map((e: Emoji) => e.toString());
		let currentIndex: number = emojis.length;
		let temporaryValue: string;
		let randomIndex: number;
		while (currentIndex !== 0) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;
			temporaryValue = emojis[currentIndex];
			emojis[currentIndex] = emojis[randomIndex];
			emojis[randomIndex] = temporaryValue;
		}
		let response: string = '';
		for (const emoji of emojis) {
			if ((response.length + emoji.length) > 1021) {
				response += '...';
				break;
			} else { response += ` ${emoji}`; }
		}
		return response;
	}
};
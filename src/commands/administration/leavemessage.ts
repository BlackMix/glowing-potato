import { stripIndents } from 'common-tags';
import { Message, Role } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';

import GuildConfig from '../../dataProviders/models/GuildConfig';

export default class LeaveMessageCommand extends Command {
	public constructor(client: CommandoClient) {
		super(client, {
			name: 'leavemessage',
			aliases: ['leavemsg'],
			group: 'administration',
			memberName: 'leavemessage',
			description: 'Leave message configuration.',
			details: stripIndents`
				'Sets or removes the leave message for this guild.'
				You can use :guild: as placeholder for the guildname,
      			and :member: as placeholder for the joined member, this won't ping him/her, see the examples down there.`,
			examples: [
				stripIndents`
					\`leavemessage :member: has left us, what a sad day.\`
        			Will look like:
       				\`@space#0302\` has left us, what a sad day.\n\u200b`,
				stripIndents`
					\`joinmessage remove\`
        			Will disable that message.\n\u200b`],
			guildOnly: true,
			args: [
				{
					key: 'message',
					prompt: stripIndents`
						what shall that leave message be?
          				Respond with \`remove\` to disable that message.\n`,
					type: 'string',
					max: 1800,
					default: 'show',
				},
			]
		});
	}

	public hasPermission(msg: CommandMessage): boolean {
		const staffRoles: string[] = this.client.provider.get(msg.guild.id, 'adminRoles', []);
		return msg.member.roles.some((r: Role) => staffRoles.includes(r.id)) || msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	public async run(msg: CommandMessage, args: { message: string }): Promise<Message | Message[]> {
		const config: GuildConfig = await GuildConfig.findOrCreate({ where: { guildID: msg.guild.id } });
		if (args.message === 'show') {
			return msg.say(config.leaveMessage || 'No message set.');
		}

		config.leaveMessage = args.message === 'remove' ? null : args.message;

		await config.save();

		return msg.say(stripIndents`
		The leave message is now ${`\`${config.leaveMessage || 'disabled'}\``}!
		${config.anChannel || config.logChannel ? '' : 'Info: No channel to announce or log set up!'}`
		);
	}
}

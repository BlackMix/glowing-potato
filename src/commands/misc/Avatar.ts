import { Attachment, RichEmbed, User } from 'discord.js';
import { CommandDecorators, Message, Middleware } from 'yamdbf';

import { ReportError } from '../../decorators/ReportError';
import { Client } from '../../structures/Client';
import { Command, CommandResult } from '../../structures/Command';

const { clientPermissions, desc, group, guildOnly, name, usage, using } = CommandDecorators;
const { expect, resolve } = Middleware;

@clientPermissions('SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES')
@desc('Gets an user\'s avatar')
@name('avatar')
@group('misc')
@guildOnly
@usage('<prefix>avatar <User>')
export default class AvatarCommand extends Command<Client>
{
	@using(resolve({ '<User>': 'User' }))
	@using(expect({ '<User>': 'User' }))
	@ReportError
	public async action(message: Message, [user]: [User]): Promise<CommandResult>
	{
		message.channel.startTyping();

		const filename: string = (user.avatar && user.avatar.startsWith('a_'))
			? 'avatar.gif'
			: 'avatar.png';

		try
		{
			await message.channel.send(
				{
					embed:
						new RichEmbed()
							.setTitle(`${user.tag} (${user.id})`)
							.setColor(message.member.displayColor)
							.setImage(`attachment://${filename}`),
					files: [new Attachment(user.displayAvatarURL, filename)],
				},
			);
		}
		finally
		{
			message.channel.stopTyping();
		}

	}
}

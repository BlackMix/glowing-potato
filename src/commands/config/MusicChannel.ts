import { GuildChannel } from 'discord.js';
import { CommandDecorators, Message, Middleware, ResourceLoader } from 'yamdbf';

import { expectConfigOption, resolveConfigOption } from '../../decorators/configOptions';
import { ReportError } from '../../decorators/ReportError';
import { Client } from '../../structures/Client';
import { ConfigCommand } from '../../structures/ConfigCommand';
import { GuildConfigChannels, GuildConfigType } from '../../types/GuildConfigKeys';

const { aliases, callerPermissions, desc, group, guildOnly, name, usage, using, localizable } = CommandDecorators;
const { expect } = Middleware;
@aliases('music-channel', 'musicchannel', 'djchannel')
@callerPermissions('MANAGE_GUILD')
@desc('Sets, gets or resets the music channel, where music commands will be limited to if set up.')
@name('mchannel')
@group('config')
@guildOnly
@usage('<prefix>mchannel <option> [...channel]`\n\n'
	+ '`option` is one of `get`, `set`, `reset')
export default class AnChannelCommand extends ConfigCommand<Client>
{
	@using(expect({ '<option>': 'String' }))
	@using(resolveConfigOption(GuildConfigType.CHANNEL))
	@using(expectConfigOption(GuildConfigType.CHANNEL))
	@localizable
	@ReportError
	public async action(message: Message, [res, option, value]
		: [ResourceLoader, 'get' | 'set' | 'reset', GuildChannel | undefined]): Promise<void>
	{
		return this[option](message, res, GuildConfigChannels.MUSICCHANNEL, GuildConfigType.CHANNEL, value);
	}
}

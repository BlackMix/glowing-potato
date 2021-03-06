import { GuildChannel, Role } from 'discord.js';
import { Lang, Message, Middleware } from 'yamdbf';

import { BetterResourceProxy } from '../localization/LocalizationStrings';
import { Client } from '../structures/Client';
import { ConfigCommand } from '../structures/ConfigCommand';
import { GuildConfigType } from '../types/GuildConfigKeys';

const { expect, resolve } = Middleware;

export function expectConfigOption(type: GuildConfigType)
	: (message: Message, args: string[]) => Promise<[Message, [string, GuildChannel | Role | string | undefined]]>
{
	const [name, argType] = resolveArgType(type) as [string, string];
	return async function(this: ConfigCommand<Client>, message: Message, args: string[]):
		Promise<[Message, [string, GuildChannel | Role | string | undefined]]>
	{
		const res: BetterResourceProxy = Lang.createResourceProxy(
			await message.guild.storage.settings.get('lang')
			|| this.client.defaultLang,
		) as BetterResourceProxy;
		args[0] = args[0].toLowerCase();
		if (!['get', 'set', 'reset'].includes(args[0]))
		{
			throw new Error(res.EXPECT_ERR_INVALID_OPTION({
					arg: args[0],
					name: '<Option>',
					type: '`get`, `set`, `reset`',
					usage: this.usage,
				}),
			);
		}
		if (args[0] === 'set')
		{
			return expect({ '<Option>': 'String', [name]: argType }).call(this, message, args);
		}
		return [message, [args[0], undefined]];
	};
}

export function resolveConfigOption(type: GuildConfigType)
	: (message: Message, args: string[]) => [Message, [string, GuildChannel | Role | string | undefined]]
{
	const [name, argType] = resolveArgType(type) as [string, string];
	return function(message: Message, args: string[]): [Message, [string, GuildChannel | Role | string | undefined]]
	{
		if (args[0] === 'set')
		{
			return resolve({ '<Option>': 'String', [name]: argType }).call(this, message, args);
		}
		return [message, [args[0], undefined]];
	};
}

function resolveArgType(type: GuildConfigType): [string, string]
{
	switch (type)
	{
		case GuildConfigType.CHANNEL:
			return ['<Channel>', 'Channel'];
		case GuildConfigType.ROLE:
			return ['<...Role>', 'Role'];
		case GuildConfigType.STRING:
			return ['<...Message>', 'String'];
	}
}

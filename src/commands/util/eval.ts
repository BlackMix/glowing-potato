import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as moment from 'moment';
import { getUsedAlias } from '../../util/util.js';

export default class EvalCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			name: 'eval',
			aliases: ['async', 'await'],
			group: 'util',
			memberName: 'eval',
			description: 'Evaluates code in NodeJS.',
			guarded: true,
			args: [
				{
					key: 'code',
					prompt: 'what shall I evaluate?\n',
					type: 'string'
				}
			]
		});
	}

	public hasPermission(msg: CommandMessage): boolean {
		return this.client.isOwner(msg.author);
	}

	public async run(msg: CommandMessage, args: { code: string }): Promise<Message | Message[]> {
		const time: number = new Date().getTime();
		try {
			let evaled: any;
			if (getUsedAlias(msg) === 'async') args.code = `(async()=>{${args.code}})();`;
			evaled = await Promise.resolve(eval(args.code));
			const responseTypeof: string = typeof evaled;
			if (typeof evaled !== 'string') { evaled = require('util').inspect(evaled, false, 0); }
			if (evaled.includes(this.client.token)) {
				msg.say('The token doesn\'t belong in here. 👀');
				return;
			}
			msg.say(stripIndents`\`code:\`
      		\`\`\`js\n${args.code ? args.code.split(`\``).join(`´`) : 'falsy'}\`\`\`
      		\`evaled\\returned:\`
      		\`\`\`js\n${evaled ? evaled.split(`\``).join(`´`) : 'falsy'}\`\`\`
      		\`typeof:\`
      		\`\`\`js\n${responseTypeof}
      		\`\`\`\n
      		Took \`${new Date().getTime() - time}\`ms`)
				.catch((e: Error) => {
					msg.say(`Fehler beim Senden der Antwort:\n
          			\`\`\`js
          			${e.stack ? e.stack : e}
          			\`\`\``);
				});
		} catch (e) {
			msg.say(stripIndents`\`E-ROHR\`
			\`\`\`js
			${e}${e.response && e.response.res && e.response.res.text ? `\n${e.response.res.text}` : ''}
			\`\`\`\n
      Took \`${new Date().getTime() - time}\`ms`);
		}
	}

};

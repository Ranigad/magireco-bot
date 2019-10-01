
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { Logger } from '../services/Logger';
import { EmojiService } from '../services/EmojiService';
import { EmojiDatabaseService } from '../services/EmojiDatabaseService';
import * as Pagination from 'discord.js-pagination';

@Singleton
@AutoWired
export class EmojiCommand implements ICommand {

  help = 'Get Emoji usage data by server, user, or emoji';
  aliases = ['emoji', 'e'];
  private timeRegex = new RegExp('^([0-9]+)(s|m|w|h|d|y|mo)$');

  @Inject private logger: Logger;
  @Inject private emojiService: EmojiService;
  @Inject private emojiDatabaseService: EmojiDatabaseService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message } = cmdArgs;
    const args = cmdArgs.args.split(' ');

    // TODO: Fix this args check
    let queryType = args[0];
    let result = [];
    let time = new Date();

    // Check for time
    if (args.length && this.hasTime(args)) {
        let timeVal = args.pop();
        queryType = queryType.replace(timeVal, '');
        time = this.convertToSeconds(timeVal);
    }

    const isReaction = ['r', 're', 'ru'].includes(queryType) || queryType.includes('reaction');

    if (args.length === 1 && ['user', 'u', 'reactionuser', 'reactionsuser', 'ru', 'r', 'reaction', 'reactions'].includes(queryType)) {
        args.push(message.author.id);
    }

    if (args.length !== 2 && !['s', 'server', ''].includes(queryType)) {
        // incorrect format
        this.logger.log('Incorrect format');
        return;
    }

    switch (queryType) {
        case 'user': case 'u': case 'ru': case 'reactionuser': case 'reactionsuser': {
            // TODO: Validate username input [args[1] into username]
            this.logger.log('User lookup');
            result = await this.emojiDatabaseService.userLookup(args[1], message.guild.id, time, isReaction);
            // this.logger.log(await this.emojiDatabaseService.userLookup(args[1], message.guild.id, isReaction));
            break;
        }

        case 'emoji': case 'e': case 're': case 'reactionemoji': case 'reactionsemoji': {
            this.logger.log('Emoji lookup');
            result = await this.emojiDatabaseService.emojiLookup(args[1], message.guild.id, time, isReaction);
            // this.logger.log(await this.emojiDatabaseService.emojiLookup(args[1], message.guild.id, isReaction));
            break;
        }

        case 'server': case 's': case '': case 'reactions': case 'reaction': case 'r': {
            this.logger.log('Server lookup');
            result = await this.emojiDatabaseService.serverLookup(message.guild.id, time, isReaction);
            // this.logger.log(await this.emojiDatabaseService.serverLookup(message.guild.id, isReaction));
            break;
        }

        default: {
            this.logger.log('Invalid option');
            // Invalid option
            break;
        }
    }

    let formatResult = await this.formatEmojiData(result, queryType);

    if (formatResult.length) {
        this.paginateEmojiData(message, formatResult);
    } else {
        message.channel.send('No data found for specified query');
    }

    return {};
  }

  private paginateEmojiData(message, formattedResults) {
    const embed = Pagination(message, formattedResults);
  }

  private async formatEmojiData(emoji, queryType) {
    // TODO: use queryType to determine what to display
    let valueList = [];
    let value;

    while (emoji.length) {
        if (emoji.length === 1) {
            valueList.push({
               name: `${emoji[0].username || this.emojiService.getEmojiInstance(emoji[0].emojiname)}`,
               value: `${emoji[0].count}`
            });
            emoji.pop();
        } else if (emoji.length === 2) {
            valueList.push({
                name: `${emoji[0].username || this.emojiService.getEmojiInstance(emoji[0].emojiname)}: ${emoji[0].count}`,
                value: `${emoji[1].username || this.emojiService.getEmojiInstance(emoji[1].emojiname)}: ${emoji[1].count}`,
                inline: true
            });
            emoji.splice(0, 2);
        } else {
            if (emoji.length === 3) {
                value = `${emoji[2].username || this.emojiService.getEmojiInstance(emoji[2].emojiname)}: ${emoji[2].count}`;
            } else {
                value = `${emoji[2].username || this.emojiService.getEmojiInstance(emoji[2].emojiname)}: \
${emoji[2].count} || ${emoji[3].username || this.emojiService.getEmojiInstance(emoji[3].emojiname)}: \
${emoji[3].count}`;
            }
            valueList.push({
                name: `${emoji[0].username || this.emojiService.getEmojiInstance(emoji[0].emojiname)}: \
${emoji[0].count} || ${emoji[1].username || this.emojiService.getEmojiInstance(emoji[1].emojiname)}: \
${emoji[1].count}`,
                value,
                inline: true
            });
        }
        emoji.splice(0, 4);
    }

    let paginatedData = [];

    while (valueList.length) {
        paginatedData.push(this.makeEmbedFromField(valueList.splice(0, 25)));
    }

    return paginatedData;
  }

  private makeEmbedFromField(field): {} {
    const embed = new Discord.RichEmbed();
    embed.fields = field;
    return embed;
  }

  private hasTime(args) {
    // const timeRegex = /^([0-9]+)(s|m|w|h|d|y|mo)$/gm;
    return this.timeRegex.test(args[args.length - 1]);
  }

  private convertToSeconds(time) {
    const [ timeArg, q, key ] = this.timeRegex.exec(time);
    const quantity = parseInt(q, 10);
    let t = new Date();

    switch (key) {
        case 's':
            t.setSeconds(t.getSeconds() - quantity);
            break;
        case 'm':
            t.setMinutes(t.getMinutes() - quantity);
            break;
        case 'h':
            t.setHours(t.getHours() - quantity);
            break;
        case 'd':
            t.setDate(t.getDate() - quantity);
            break;
        case 'w':
            t.setDate(t.getDate() - (7 * quantity));
            break;
        case 'mo':
            t.setMonth(t.getMonth() - quantity);
            break;
        case 'y':
            t.setFullYear(t.getFullYear() - quantity);
            break;
        default:
            return new Date(0);
    }
    return t / 1000;
  }
}


import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { Logger } from '../services/Logger';
import { EmojiService } from '../services/EmojiService';
import { EmojiDatabaseService } from '../services/EmojiDatabaseService';

@Singleton
@AutoWired
export class EmojiCommand implements ICommand {

  help = 'Get Emoji usage data by server, user, or emoji';
  aliases = ['emoji', 'e'];

  @Inject private logger: Logger;
  @Inject private emojiService: EmojiService;
  @Inject private emojiDatabaseService: EmojiDatabaseService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message } = cmdArgs;
    const args = cmdArgs.args.split(' ');
    this.sendEmojiData(['a', 'b', 'c'], message);
    return;
    // TODO: Fix this args check
    const queryType = args[0];
    let result = [];
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
            // TODO: Validate username input
            result = await this.emojiDatabaseService.userLookup(args[1], message.guild.id, isReaction);
            // this.logger.log(await this.emojiDatabaseService.userLookup(args[1], message.guild.id, isReaction));
            break;
        }

        case 'emoji': case 'e': case 're': case 'reactionemoji': case 'reactionsemoji': {
            result = await this.emojiDatabaseService.emojiLookup(args[1], message.guild.id, isReaction);
            // this.logger.log(await this.emojiDatabaseService.emojiLookup(args[1], message.guild.id, isReaction));
            break;
        }

        case 'server': case 's': case '': case 'reactions': case 'reaction': case 'r': {
            result = await this.emojiDatabaseService.serverLookup(message.guild.id, isReaction);
            // this.logger.log(await this.emojiDatabaseService.serverLookup(message.guild.id, isReaction));
            break;
        }

        default: {
            this.logger.log('Invalid option');
            // Invalid option
            break;
        }
    }
    this.logger.log(result);
    let formatResult = await this.formatEmojiData(result);
    this.logger.log(formatResult);
    message.channel.send(formatResult[0]);
    return {};
  }

  private async sendEmojiData(formattedResults, message) {
        let channel = message.channel;
        let index = 0;
        const filter = (reaction, user) => reaction.emoji.name === '➡' || reaction.emoji.name === '⬅' && !user.bot;
        channel.send(formattedResults[index]);
  }

  private async editEmojiData(formattedResults, message, index) {
        return;
    }

  private async formatEmojiData(emoji) {
    this.logger.log(emoji);
    let valueList = [];
    let value;
    while (emoji.length) {
        if (emoji.length === 1) {
            valueList.push({
               name: `${emoji[0].username || this.emojiService.getEmojiInstance(emoji[0].emojiname)}`,
               value: `${emoji[0].count}`
            })
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
                value = `${emoji[2].username || this.emojiService.getEmojiInstance(emoji[2].emojiname)}: ${emoji[2].count} || ${emoji[3].username || this.emojiService.getEmojiInstance(emoji[3].emojiname)}: ${emoji[3].count}`;
            }
            valueList.push({
                name: `${emoji[0].username || this.emojiService.getEmojiInstance(emoji[0].emojiname)}: ${emoji[0].count} || ${emoji[1].username || this.emojiService.getEmojiInstance(emoji[1].emojiname)}: ${emoji[1].count}`,
                value: value,
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
    return {
        embed : {
            fields : field
        }
    };
  }
}

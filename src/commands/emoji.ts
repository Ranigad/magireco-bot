
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

    // TODO: Fix this args check
    const query_type = args[0];
    let result = [];
    const isReaction = ['r', 're', 'ru'].includes(query_type) || query_type.includes('reaction');

    if (args.length === 1 && ['user', 'u', 'reactionuser', 'reactionsuser', 'ru', 'r', 'reaction', 'reactions'].includes(query_type)) {
        args.push(message.author.id);
    }
    if (args.length !== 2 && !['s', 'server', ''].includes(query_type)) {
        // incorrect format
        this.logger.log('Incorrect format');
        return;
    }

    switch (query_type) {
        case 'user': case 'u': case 'ru': case 'reactionuser': case 'reactionsuser': {
            // TODO: Validate username input
            // result =
            this.logger.log(await this.emojiDatabaseService.userLookup(args[1], message.guild.id, isReaction));
            break;
        }

        case 'emoji': case 'e': case 're': case 'reactionemoji': case 'reactionsemoji': {
            // result =
            this.logger.log(await this.emojiDatabaseService.emojiLookup(args[1], message.guild.id, isReaction));
            break;
        }

        case 'server': case 's': case '': case 'reactions': case 'reaction': case 'r': {
            // result =
            this.logger.log(await this.emojiDatabaseService.serverLookup(message.guild.id, isReaction));
            break;
        }

        default: {
            this.logger.log('Invalid option');
            // Invalid option
            break;
        }
    }
    return {};
  }
}

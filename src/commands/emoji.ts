
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

    if (args) {
        const query_type = args[0];

        switch (query_type) {
            case 'user':
            case 'u': {
                // TODO: Lookup by user when we have db mapping
                if (args.length === 2) {
                    this.checkParamCount(args, 2, message);
                } else if (args.length === 1) {
                    this.checkParamCount(args, 1, message);
                    this.logger.log(await this.emojiDatabaseService.userLookup(message.author.id, message.guild.id));
                }
                break;
            }

            case 'server':
            case 's':
            case '': {
                this.logger.log(await this.emojiDatabaseService.serverLookup(message.guild.id));
                break;
            }

            case 'reactions':
            case 'reaction':
            case 'ru':
            case 'r': {
                // Reactions only
                if (args.includes('user') || query_type === 'ru') {
                    // Check for correct number of parameters + get userid
                    this.logger.log(await this.emojiDatabaseService.reactionLookup(message.guild.id));
                } else {
                    this.logger.log(await this.emojiDatabaseService.reactionLookup(message.guild.id));
                }
            }

            case 'emoji':
            case 'e':
            default: {
                // Shift required parameters down by one if default emoji command
                let required_params = 1;
                if (query_type === 'e' || query_type === 'emoji') {
                    required_params = 2;
                }

                if (args.length === required_params - 1) {
                    this.logger.log('Emoji name required.');
                } else if (args.length >= required_params + 1) {
                    this.logger.log('Too many arguments provided.');
                } else {
                    this.logger.log(await this.emojiDatabaseService.emojiLookup(args[required_params - 1], message.guild.id));
                }
                break;
            }
        }
    }
    return {};
  }

  async checkParamCount(args: string[], required_params: number, message: Discord.Message): string {
    // Check length of array against required params.
    if (args.length < required_params) {
        // Missing parameter
    } else if (args.length > required_params) {
        // Too many parameters
    } else {
        // Just right
    }
  }
}

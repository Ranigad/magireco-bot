
import * as Discord from 'discord.js';

import {AutoWired, Inject, Singleton} from 'typescript-ioc';
import { BaseService } from '../base/BaseService';
import { ErrorMessageService } from './ErrorMessageService';

@Singleton
@AutoWired
export class ReactService extends BaseService {

  @Inject private errorMessageService: ErrorMessageService;

  public async init(client) {
    await super.init(client);
  }

  /**
   * Temporarily react to a target message with a specific emoji.
   *
   * @param targetMessage The message to react to.
   * @param emoji The emoji to use for the reaction.
   * @param userCommandMessage The user command that instructed to apply the emoji.
   */
  async tempReactToMessage(targetMessage: Discord.Message, emoji: Discord.Emoji,
                           userCommandMessage: Discord.Message) {
    try {
      let reaction = await targetMessage.react(emoji);
      if (userCommandMessage.deletable) {
        await userCommandMessage.delete();
      }

      setTimeout(async () => {
        await reaction.remove();
      }, 20000);
      return true;
    } catch (ex) {
      await this.errorMessageService.sendErrorMessage(userCommandMessage.channel,
        'Sorry!  Could not apply the given emoji.');

      if (userCommandMessage.deletable) {
        await userCommandMessage.delete(10000);
      }
      return false;
    }
  }

}


import * as Discord from 'discord.js';

import { AutoWired, Singleton } from 'typescript-ioc';
import { BaseService } from '../base/BaseService';
import { DMChannel, GroupDMChannel, TextChannel } from 'discord.js';

@Singleton
@AutoWired
export class ErrorMessageService extends BaseService {

  public async init(client) {
    await super.init(client);
  }

  /**
   * Send an error message in a given channel and then delete the message after
   * a little while.
   *
   * @param channel The channel to send the message in.
   * @param errorText The text of the error message.
   */
  public async sendErrorMessage(channel: TextChannel | DMChannel | GroupDMChannel, errorText: string) {
    let errorMessage: Discord.Message | Discord.Message[] = await channel.send(errorText);

    if (errorMessage instanceof Discord.Message) {
      await this.deleteMessage(errorMessage);
    } else {
      errorMessage.forEach(async (errorMessagePart) => {
        await this.deleteMessage((errorMessagePart));
      });
    }

  }

  private async deleteMessage(message: Discord.Message) {
    await message.delete(2500);
  }

}

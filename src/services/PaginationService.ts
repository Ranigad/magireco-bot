// Taken from https://github.com/saanuregh/discord.js-pagination but for discord.js stable version
import { AutoWired, Singleton } from 'typescript-ioc';
import { BaseService } from '../base/BaseService';
import * as Discord from 'discord.js';

@Singleton
@AutoWired
export class PaginationService extends BaseService {

  public async embed(msg, pages, timeout = 1000, emojiList = ['⏪', '⏩']) {
    if (!msg && !msg.channel) { throw new Error('Channel is inaccessible.'); }
    if (!pages) { throw new Error('Pages are not given.'); }
    if (emojiList.length !== 2) { throw new Error('Need two emojis.'); }
    let page = 0;
    const curPage = await msg.channel.send(pages[page].setFooter(`Page ${page + 1} / ${pages.length}`));
    for (const emoji of emojiList) { await curPage.react(emoji); }
    const reactionCollector = curPage.createReactionCollector(
      (reaction, user) => emojiList.includes(reaction.emoji.name) && !user.bot,
      { time: timeout }
    );
    reactionCollector.on('collect', (reaction) => {
      // reaction.users.remove(msg.author);
      // reaction.remove();
      switch (reaction.emoji.name) {
        case emojiList[0]:
          page = page > 0 ? --page : pages.length - 1;
          break;
        case emojiList[1]:
          page = page + 1 < pages.length ? ++page : 0;
          break;
        default:
          break;
      }
      curPage.edit(pages[page].setFooter(`Page ${page + 1} / ${pages.length}`));
    });
    reactionCollector.on('end', () => curPage.clearReactions());
    return curPage;
  }
}

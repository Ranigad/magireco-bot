import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Emoji {

  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  emojiid: string;

  @Column()
  emojiname: string;

  @Column()
  username: string;

  @Column()
  userid: string;

  @Column()
  reaction: boolean;

  @Column()
  time: number;

  //@Column()
  //count: number;

  @Column()
  serverid: string;

  // @Column()
  // servername: string;

  @Column()
  messageid: string;
}

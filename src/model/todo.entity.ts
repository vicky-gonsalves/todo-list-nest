import { Entity, Column } from 'typeorm';
import { SharedEntity } from './shared.entity';

@Entity('todo')
export class TodoEntity extends SharedEntity {
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: false,
  })
  description: string;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  due: Date;

  @Column({
    type: 'boolean',
    default: false,
  })
  done: boolean;

  @Column({
    type: 'int',
    default: 2,
  })
  priority: number;
}

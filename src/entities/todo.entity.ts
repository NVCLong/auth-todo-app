import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';
import { Photo } from './photo.entity';

@Entity()
export class Todo {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({ default: false })
  isCompleted: boolean;

  @ManyToOne(() => User, (user) => user.todos)
  user: User;

  @Column({ default: false })
  isDeleted: boolean;

  @Column()
  title: string;

  @OneToMany(()=> Photo, (photo)=>photo.todo)
  photos:Photo[]
}

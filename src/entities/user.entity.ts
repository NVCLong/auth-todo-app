import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Todo } from "./todo.entity";
import { Exclude } from "class-transformer";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    username: string

    @Column()
    email: string

    @Exclude()
    @Column()
    password: string

    @Column()
    phone: number


    @OneToMany(()=> Todo, (todo)=> todo.user)
    todos: Todo[]

    
}
import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Todo } from "./todo.entity";

@Entity()
export class Photo{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url:string

    @ManyToOne(()=>Todo, (todo)=> todo.photos)
    todo:Todo;
    
}
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


export enum status{
    SUCCESS = 'success',
    PENDING = 'pending'
}

@Entity()
export class WinpayHistory {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    customerNo:string

    @Column({nullable : true})
    nisn:string

    @Column({nullable : true})
    bulan:string

    @Column({nullable : true})
    tahun:string

    @Column({nullable : true})
    jenis:string

    @Column({type:'text', nullable :true})
    payload:string

    @Column({type:'text', nullable :true})
    response:string

    @Column({ type: 'enum', enum: status, default: status.PENDING })
    status:status

}
import {MigrationInterface, QueryRunner} from "typeorm";

export class todoInit1604851671554 implements MigrationInterface {
    name = 'todoInit1604851671554'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "todo" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "title" character varying(100) NOT NULL, "description" character varying(500) NOT NULL, "due" TIMESTAMP WITH TIME ZONE, "done" boolean NOT NULL DEFAULT false, "priority" integer NOT NULL DEFAULT '2', CONSTRAINT "PK_d429b7114371f6a35c5cb4776a7" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "todo"`);
    }

}

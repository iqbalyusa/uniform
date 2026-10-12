// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const stock = sqliteTable('stock', {key:text('key').primaryKey(),quantity:integer('quantity').notNull().default(0),revision:integer('revision').notNull().default(0),lastChange:text('last_change')});
export const members=sqliteTable('members',{id:text('id').primaryKey(),email:text('email').notNull().unique(),userId:text('user_id').unique(),name:text('name').notNull(),role:text('role').notNull().default('staff'),active:integer('active').notNull().default(1)});
export const history=sqliteTable('history',{id:text('id').primaryKey(),key:text('key'),action:text('action').notNull(),actorId:text('actor_id').notNull(),actor:text('actor').notNull(),occurredAt:text('occurred_at').notNull(),date:text('date').notNull(),before:integer('before_qty'),after:integer('after_qty'),delta:integer('delta'),studentName:text('student_name').notNull().default(''),studentClass:text('student_class').notNull().default(''),note:text('note').notNull().default(''),source:text('source').notNull().default('app')});
export const settings=sqliteTable('settings',{id:integer('id').primaryKey(),lowLimit:integer('low_limit').notNull().default(5),revision:integer('revision').notNull().default(0)});
export const backups=sqliteTable('backups',{id:text('id').primaryKey().notNull(),createdAt:text('created_at').notNull(),actor:text('actor').notNull(),data:text('data').notNull()});

import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";

export const schoolProfileTable = pgTable("school_profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("SMA Nusantara"),
  tagline: text("tagline").notNull().default("Unggul, Berkarakter, Berprestasi"),
  description: text("description").notNull().default(""),
  address: text("address").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  website: text("website"),
  npsn: text("npsn"),
  accreditation: text("accreditation"),
  foundedYear: integer("founded_year"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  youtubeUrl: text("youtube_url"),
  logoUrl: text("logo_url"),
});

export type SchoolProfile = typeof schoolProfileTable.$inferSelect;

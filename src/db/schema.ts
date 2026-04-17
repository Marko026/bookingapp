import { relations } from "drizzle-orm";
import {
	boolean,
	date,
	doublePrecision,
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

export const apartments = pgTable(
	"apartments",
	{
		id: serial("id").primaryKey(),
		name: text("name").notNull(),
		nameEn: text("name_en"),
		description: text("description"),
		descriptionEn: text("description_en"),
		pricePerNight: integer("price_per_night").notNull(),
		capacity: integer("capacity").notNull(),
		imageUrl: text("image_url"), // Main cover image (kept for backward compatibility)
		latitude: doublePrecision("latitude"),
		longitude: doublePrecision("longitude"),
		createdAt: timestamp("created_at").defaultNow(),
	},
	(table) => ({
		nameIdx: uniqueIndex("apartments_name_idx").on(table.name),
	}),
);

// New table for apartment image gallery
export const apartmentImages = pgTable(
	"apartment_images",
	{
		id: serial("id").primaryKey(),
		apartmentId: integer("apartment_id")
			.references(() => apartments.id)
			.notNull(),
		imageUrl: text("image_url").notNull(), // Supabase Storage URL
		altText: text("alt_text"), // For SEO and accessibility
		displayOrder: integer("display_order").default(0), // Order in gallery
		isCover: boolean("is_cover").default(false), // Is this the cover image?
		width: integer("width"), // Original width (for aspect ratio)
		height: integer("height"), // Original height (for aspect ratio)
		createdAt: timestamp("created_at").defaultNow(),
	},
	(table) => ({
		apartmentIdIdx: index("apartment_images_apartment_id_idx").on(
			table.apartmentId,
		),
	}),
);

export const bookings = pgTable(
	"bookings",
	{
		id: serial("id").primaryKey(),
		apartmentId: integer("apartment_id")
			.references(() => apartments.id)
			.notNull(),
		guestName: text("guest_name").notNull(),
		guestEmail: text("guest_email").notNull(),
		checkIn: date("check_in").notNull(),
		checkOut: date("check_out").notNull(),
		totalPrice: integer("total_price").notNull(),
		status: text("status").default("pending").notNull(), // pending, confirmed, cancelled
		createdAt: timestamp("created_at").defaultNow(),
	},
	(table) => {
		return {
			overlapIdx: index("booking_overlap_idx").on(
				table.apartmentId,
				table.checkIn,
				table.checkOut,
			),
		};
	},
);

// NOTE: Add a database-level exclusion constraint via raw SQL migration:
// ALTER TABLE bookings ADD CONSTRAINT booking_no_overlap EXCLUDE
//   USING gist (apartment_id WITH =, daterange(check_in, check_out) WITH &&)
//   WHERE (status != 'cancelled');
// This prevents race-condition double-bookings that the application-level check alone cannot catch.

export const inquiries = pgTable("inquiries", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	message: text("message").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const attractions = pgTable("attractions", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	titleEn: text("title_en"),
	description: text("description"),
	descriptionEn: text("description_en"),
	longDescription: text("long_description"),
	longDescriptionEn: text("long_description_en"),
	distance: text("distance"),
	coords: text("coords"),
	latitude: doublePrecision("latitude"),
	longitude: doublePrecision("longitude"),
	slug: text("slug").unique().notNull(),
	image: text("image"), // Main image URL
	createdAt: timestamp("created_at").defaultNow(),
});

export const attractionImages = pgTable(
	"attraction_images",
	{
		id: serial("id").primaryKey(),
		attractionId: integer("attraction_id")
			.references(() => attractions.id)
			.notNull(),
		imageUrl: text("image_url").notNull(),
		displayOrder: integer("display_order").default(0),
		createdAt: timestamp("created_at").defaultNow(),
	},
	(table) => ({
		attractionIdIdx: index("attraction_images_attraction_id_idx").on(
			table.attractionId,
		),
	}),
);

export const adminUsers = pgTable(
	"admin_users",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id").notNull(), // References auth.users(id) - no FK constraint in Drizzle as it's in another schema usually or managed by Supabase
		email: text("email").notNull().unique(),
		role: text("role").default("admin").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index("admin_users_user_id_idx").on(table.userId),
	}),
);

// Relations
export const apartmentsRelations = relations(apartments, ({ many }) => ({
	images: many(apartmentImages),
	bookings: many(bookings),
}));

export const attractionRelations = relations(attractions, ({ many }) => ({
	images: many(attractionImages),
}));

export const attractionImagesRelations = relations(
	attractionImages,
	({ one }) => ({
		attraction: one(attractions, {
			fields: [attractionImages.attractionId],
			references: [attractions.id],
		}),
	}),
);

export const apartmentImagesRelations = relations(
	apartmentImages,
	({ one }) => ({
		apartment: one(apartments, {
			fields: [apartmentImages.apartmentId],
			references: [apartments.id],
		}),
	}),
);

export const bookingsRelations = relations(bookings, ({ one }) => ({
	apartment: one(apartments, {
		fields: [bookings.apartmentId],
		references: [apartments.id],
	}),
}));

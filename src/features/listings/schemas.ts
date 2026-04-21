import * as z from "zod";

export const apartmentImageSchema = z.object({
	url: z.string(),
	path: z.string(),
	width: z.number(),
	height: z.number(),
});

export const apartmentImageActionSchema = z.object({
	imageUrl: z.string(),
	altText: z.string().optional().nullable(),
	displayOrder: z.number().optional(),
	isCover: z.boolean().optional(),
	width: z.number().optional().nullable(),
	height: z.number().optional().nullable(),
});

export const apartmentFormSchema = z.object({
	name: z
		.string()
		.min(2, "Naziv mora imati bar 2 karaktera")
		.max(200, "Naziv je predugačak"),
	nameEn: z.string().max(200, "Naziv je predugačak").optional(),
	description: z.string().max(5000, "Opis je predugačak").optional(),
	descriptionEn: z.string().max(5000, "Opis je predugačak").optional(),
	pricePerNight: z.coerce.number().min(1, "Cena je obavezna"),
	capacity: z.coerce.number().min(1, "Kapacitet je obavezan"),
	beds: z.coerce.number().min(1, "Bar jedan krevet je obavezan"),
	latitude: z.number().nullable().optional(),
	longitude: z.number().nullable().optional(),
	images: z.array(apartmentImageSchema).min(1, "Bar jedna slika je obavezna"),
});

export type ApartmentFormValues = z.infer<typeof apartmentFormSchema>;

// Schema for Server Action (handling FormData strings)
export const createApartmentActionSchema = z.object({
	name: z.string().min(1).max(200),
	nameEn: z.string().max(200).optional(),
	description: z.string().max(5000).optional(),
	descriptionEn: z.string().max(5000).optional(),
	pricePerNight: z
		.string()
		.transform((val) => parseInt(val, 10))
		.or(z.number()),
	capacity: z
		.string()
		.transform((val) => parseInt(val, 10))
		.or(z.number()),
	beds: z
		.string()
		.transform((val) => parseInt(val, 10))
		.or(z.number()),
	imageUrl: z.string().optional(),
	latitude: z
		.string()
		.optional()
		.transform((val) => (val ? parseFloat(val) : null))
		.or(z.number().nullable().optional()),
	longitude: z
		.string()
		.optional()
		.transform((val) => (val ? parseFloat(val) : null))
		.or(z.number().nullable().optional()),
	images: z
		.string()
		.optional()
		.transform((val) => (val ? JSON.parse(val) : []))
		.pipe(z.array(apartmentImageActionSchema))
		.or(z.array(apartmentImageActionSchema)),
});

export const updateApartmentActionSchema = createApartmentActionSchema.extend({
	id: z.string().uuid(),
});

export const deleteApartmentActionSchema = z.object({
	id: z.string().uuid(),
});

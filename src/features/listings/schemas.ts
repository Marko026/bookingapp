import * as z from "zod";

export const apartmentFormSchema = z.object({
	name: z.string().min(2, "Naziv mora imati bar 2 karaktera"),
	nameEn: z.string().optional(),
	description: z.string().optional(),
	descriptionEn: z.string().optional(),
	pricePerNight: z.coerce.number().min(1, "Cena je obavezna"),
	capacity: z.coerce.number().min(1, "Kapacitet je obavezan"),
	latitude: z.number().nullable().optional(),
	longitude: z.number().nullable().optional(),
	images: z
		.array(
			z.object({
				url: z.string(),
				path: z.string(),
				width: z.number(),
				height: z.number(),
			}),
		)
		.min(1, "Bar jedna slika je obavezna"),
});

export type ApartmentFormValues = z.infer<typeof apartmentFormSchema>;

// Schema for Server Action (handling FormData strings)
export const createApartmentActionSchema = z.object({
	name: z.string().min(1),
	nameEn: z.string().optional(),
	description: z.string().optional(),
	descriptionEn: z.string().optional(),
	pricePerNight: z
		.string()
		.transform((val) => parseInt(val, 10))
		.or(z.number()),
	capacity: z
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
		.or(z.array(z.any())),
});

export const updateApartmentActionSchema = createApartmentActionSchema.extend({
	id: z.number(),
});

export const deleteApartmentActionSchema = z.object({
	id: z.number(),
});

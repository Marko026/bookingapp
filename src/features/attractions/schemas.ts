import { z } from "zod";

export const attractionFormSchema = z.object({
	title: z.string().min(2, "Naslov mora imati bar 2 karaktera").max(200),
	titleEn: z.string().max(200).optional(),
	description: z
		.string()
		.min(10, "Kratak opis mora imati bar 10 karaktera")
		.max(1000),
	descriptionEn: z.string().max(1000).optional(),
	longDescription: z
		.string()
		.min(20, "Dugačak opis mora imati bar 20 karaktera")
		.max(10000),
	longDescriptionEn: z.string().max(10000).optional(),
	distance: z.string().min(1, "Udaljenost je obavezna").max(100),
	coords: z.string().max(100).optional(),
	latitude: z.number().optional(),
	longitude: z.number().optional(),
	image: z.string().optional(),
	gallery: z
		.array(z.string())
		.min(1, "Galerija je obavezna - dodajte bar jednu sliku"),
});

export type AttractionFormValues = z.infer<typeof attractionFormSchema>;

export const createAttractionActionSchema = attractionFormSchema.extend({
	slug: z.string(),
});

export const updateAttractionActionSchema = createAttractionActionSchema.extend(
	{
		id: z.number(),
	},
);

export const deleteAttractionActionSchema = z.object({
	id: z.number(),
});

import { z } from "zod";

export const attractionFormSchema = z.object({
	title: z.string().min(2, "Naslov mora imati bar 2 karaktera"),
	titleEn: z.string().optional(),
	description: z.string().min(10, "Kratak opis mora imati bar 10 karaktera"),
	descriptionEn: z.string().optional(),
	longDescription: z
		.string()
		.min(20, "Dugačak opis mora imati bar 20 karaktera"),
	longDescriptionEn: z.string().optional(),
	distance: z.string().min(1, "Udaljenost je obavezna"),
	coords: z.string().optional(),
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

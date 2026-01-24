import { z } from "zod";

export const attractionFormSchema = z.object({
	title: z.string().min(2, "Naslov mora imati bar 2 karaktera"),
	titleEn: z.string().optional(),
	description: z.string().optional(),
	descriptionEn: z.string().optional(),
	longDescription: z.string().optional(),
	longDescriptionEn: z.string().optional(),
	distance: z.string().optional(),
	coords: z.string().optional(),
	latitude: z.number().nullable().optional(),
	longitude: z.number().nullable().optional(),
	image: z.string().optional(),
	gallery: z.array(z.string()).optional(),
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

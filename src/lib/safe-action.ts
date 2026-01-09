import { z } from "zod";

export type ActionState<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
};

/**
 * A lightweight wrapper for Server Actions to handle Zod validation and error catching.
 * @param schema Zod schema to validate the input (FormData or object)
 * @param handler The actual action logic
 */
export function createSafeAction<TInput, TOutput>(
  schema: z.Schema<TInput>,
  handler: (data: TInput) => Promise<TOutput>
): (prevState: ActionState<TOutput>, formData: FormData | TInput) => Promise<ActionState<TOutput>> {
  return async (_prevState: ActionState<TOutput>, formData: FormData | TInput): Promise<ActionState<TOutput>> => {
    try {
      // Handle both FormData and direct objects
      const rawData = formData instanceof FormData ? Object.fromEntries(formData) : formData;
      const validated = schema.safeParse(rawData);

      if (!validated.success) {
        return {
          success: false,
          errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
          message: "Validation failed",
        };
      }

      const data = await handler(validated.data);

      return {
        success: true,
        data,
        message: "Success",
      };
    } catch (error) {
      console.error("Action Error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      };
    }
  };
}

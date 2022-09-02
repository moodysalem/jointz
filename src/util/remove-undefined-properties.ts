import { JSONSchema7 } from "json-schema";

/**
 * Removes undefined properties from a JSON schema, s.t. the JSON matches the shape of the javascript object
 * @param schema the json schema
 */
export function removeUndefinedProperties(schema: JSONSchema7): JSONSchema7 {
  if (Array.isArray(schema)) {
    schema.forEach(removeUndefinedProperties);
  } else if (typeof schema === "object") {
    for (const k of Object.keys(schema)) {
      if ((schema as any)[k] === undefined) {
        delete (schema as any)[k];
      } else {
        removeUndefinedProperties((schema as any)[k]);
      }
    }
  }
  return schema;
}

import type { FormGridFieldHiddenType, FormGridFieldArrayType, FormGridFieldObjectType } from "./types";

const isHiddenType = (field: { type?: string }): field is FormGridFieldHiddenType => field.type === "hidden";

const isArrayType = (field: { type?: string }): field is FormGridFieldArrayType => field.type === "array";

const isObjectType = (field: { type?: string }): field is FormGridFieldObjectType => field.type === "object";

export { isHiddenType, isArrayType, isObjectType };

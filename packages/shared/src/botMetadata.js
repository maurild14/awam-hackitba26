const HOSTNAME_PATTERN =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
const ENV_VAR_PATTERN = /^[A-Z][A-Z0-9_]*$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const BOT_CREDENTIAL_INPUT_TYPES = Object.freeze([
  "text",
  "password",
  "textarea"
]);

/**
 * @param {string} message
 */
function createValidationError(message) {
  const error = new Error(message);
  error.name = "BotValidationError";
  return error;
}

/**
 * @param {unknown} value
 * @param {string} fieldName
 * @param {{ maxLength?: number, minLength?: number }} [options]
 */
function readRequiredString(value, fieldName, options = {}) {
  if (typeof value !== "string") {
    throw createValidationError(`El campo ${fieldName} es obligatorio.`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw createValidationError(`El campo ${fieldName} es obligatorio.`);
  }

  if (options.minLength && trimmed.length < options.minLength) {
    throw createValidationError(
      `El campo ${fieldName} debe tener al menos ${options.minLength} caracteres.`
    );
  }

  if (options.maxLength && trimmed.length > options.maxLength) {
    throw createValidationError(
      `El campo ${fieldName} debe tener como máximo ${options.maxLength} caracteres.`
    );
  }

  return trimmed;
}

/**
 * @param {unknown} value
 * @param {string} fieldName
 * @param {{ maxLength?: number }} [options]
 */
function readOptionalString(value, fieldName, options = {}) {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw createValidationError(`El campo ${fieldName} debe ser texto.`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (options.maxLength && trimmed.length > options.maxLength) {
    throw createValidationError(
      `El campo ${fieldName} debe tener como máximo ${options.maxLength} caracteres.`
    );
  }

  return trimmed;
}

/**
 * @param {unknown} value
 * @param {string} fieldName
 */
function readNonNegativeInteger(value, fieldName) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw createValidationError(
      `El campo ${fieldName} debe ser un número entero mayor o igual a 0.`
    );
  }

  return value;
}

/**
 * @param {unknown} value
 * @param {string} fieldName
 */
function readPositiveInteger(value, fieldName) {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw createValidationError(
      `El campo ${fieldName} debe ser un número entero positivo.`
    );
  }

  return value;
}

/**
 * @param {unknown} value
 * @param {string} fieldName
 */
function readPositiveNumber(value, fieldName) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw createValidationError(
      `El campo ${fieldName} debe ser un número positivo.`
    );
  }

  return Number(value.toFixed(2));
}

/**
 * @param {unknown} value
 * @param {string} fieldName
 */
function readArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw createValidationError(`El campo ${fieldName} debe ser una lista.`);
  }

  return value;
}

/**
 * @param {unknown} value
 * @param {string} fieldName
 */
function readObject(value, fieldName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw createValidationError(`El campo ${fieldName} debe ser un objeto.`);
  }

  return /** @type {Record<string, unknown>} */ (value);
}

/**
 * @param {unknown} value
 * @param {string} fieldName
 */
function readBoolean(value, fieldName) {
  if (typeof value !== "boolean") {
    throw createValidationError(`El campo ${fieldName} debe ser verdadero o falso.`);
  }

  return value;
}

/**
 * @param {string} value
 */
function normalizeHostname(value) {
  const trimmed = value.trim().toLowerCase();

  if (!trimmed) {
    throw createValidationError(
      "Cada dominio permitido debe ser un hostname sin protocolo ni paths."
    );
  }

  if (
    trimmed.includes("://") ||
    trimmed.includes("/") ||
    trimmed.includes("?") ||
    trimmed.includes("#") ||
    trimmed.includes(":")
  ) {
    throw createValidationError(
      "Cada dominio permitido debe ser un hostname sin protocolo ni paths."
    );
  }

  if (!HOSTNAME_PATTERN.test(trimmed)) {
    throw createValidationError(
      "Cada dominio permitido debe ser un hostname válido."
    );
  }

  return trimmed;
}

/**
 * @param {unknown} value
 */
export function normalizeAllowedDomains(value) {
  const items = readArray(value, "allowed_domains");
  const domains = items.map((item) => {
    if (typeof item !== "string") {
      throw createValidationError(
        "Cada dominio permitido debe ser texto plano."
      );
    }

    return normalizeHostname(item);
  });

  return [...new Set(domains)];
}

/**
 * @param {unknown} value
 */
export function normalizeCredentialSchema(value) {
  const items = readArray(value, "credential_schema");
  const seenEnvVars = new Set();

  return items.map((item, index) => {
    const credential = readObject(item, `credential_schema[${index}]`);
    const envVar = readRequiredString(
      credential.env_var,
      `credential_schema[${index}].env_var`,
      {
        maxLength: 64
      }
    );

    if (!ENV_VAR_PATTERN.test(envVar)) {
      throw createValidationError(
        "Cada env_var debe ser una variable de entorno válida en mayúsculas."
      );
    }

    if (seenEnvVars.has(envVar)) {
      throw createValidationError(
        "No puede haber credenciales repetidas con el mismo env_var."
      );
    }

    seenEnvVars.add(envVar);

    const type = readRequiredString(
      credential.type,
      `credential_schema[${index}].type`
    ).toLowerCase();

    if (!BOT_CREDENTIAL_INPUT_TYPES.includes(type)) {
      throw createValidationError(
        "Cada credencial debe usar un tipo válido: text, password o textarea."
      );
    }

    return {
      env_var: envVar,
      label: readRequiredString(
        credential.label,
        `credential_schema[${index}].label`,
        {
          minLength: 2,
          maxLength: 80
        }
      ),
      type,
      required: readBoolean(
        credential.required,
        `credential_schema[${index}].required`
      ),
      placeholder: readOptionalString(
        credential.placeholder,
        `credential_schema[${index}].placeholder`,
        {
          maxLength: 120
        }
      ),
      description: readOptionalString(
        credential.description,
        `credential_schema[${index}].description`,
        {
          maxLength: 220
        }
      )
    };
  });
}

/**
 * @param {unknown} value
 */
export function normalizeResources(value) {
  const resources = readObject(value, "resources");

  return {
    cpu: readPositiveNumber(resources.cpu, "resources.cpu"),
    memory_mb: readPositiveInteger(resources.memory_mb, "resources.memory_mb"),
    max_minutes: readPositiveInteger(
      resources.max_minutes,
      "resources.max_minutes"
    )
  };
}

/**
 * @param {unknown} value
 */
export function normalizeBotMutationInput(value) {
  const input = readObject(value, "body");
  const imageUri = readOptionalString(input.image_uri, "image_uri", {
    maxLength: 300
  });

  if (imageUri) {
    try {
      const parsedUrl = new URL(imageUri);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("unsupported");
      }
    } catch {
      throw createValidationError(
        "El campo image_uri debe ser una URL http o https válida."
      );
    }
  }

  return {
    title: readRequiredString(input.title, "title", {
      minLength: 3,
      maxLength: 120
    }),
    description: readRequiredString(input.description, "description", {
      minLength: 20,
      maxLength: 2400
    }),
    price_ars: readNonNegativeInteger(input.price_ars, "price_ars"),
    category: readRequiredString(input.category, "category", {
      minLength: 2,
      maxLength: 60
    }),
    image_uri: imageUri,
    credential_schema: normalizeCredentialSchema(input.credential_schema),
    allowed_domains: normalizeAllowedDomains(input.allowed_domains),
    resources: normalizeResources(input.resources)
  };
}

/**
 * @param {unknown} value
 */
export function isUuid(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

/**
 * @param {string} title
 */
export function slugifyBotTitle(title) {
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "bot";
}

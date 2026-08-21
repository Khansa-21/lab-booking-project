import 'dotenv/config';

function readNumber(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);

  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535.`);
  }

  return value;
}

function readRequired(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const value = process.env[name];

  if (value === undefined) return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;

  throw new Error(`${name} must be true or false.`);
}

export const environment = {
  port: readNumber('PORT', 3000),
  frontendOrigin: process.env['FRONTEND_ORIGIN'] ?? 'http://localhost:4200',
  database: {
    host: readRequired('DB_HOST'),
    port: readNumber('DB_PORT', 1433),
    name: readRequired('DB_NAME'),
    user: readRequired('DB_USER'),
    password: readRequired('DB_PASSWORD'),
    encrypt: readBoolean('DB_ENCRYPT', false),
    trustServerCertificate: readBoolean('DB_TRUST_SERVER_CERTIFICATE', true),
  },
  jwtSecret: readRequired('JWT_SECRET'),
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] ?? '1h',
  email: {
    brevoApiKey: readRequired('BREVO_API_KEY'),
    from: readRequired('BREVO_SENDER_EMAIL'),
    fromName: process.env['BREVO_SENDER_NAME']?.trim() || 'University Resource Hub',
  },
  isProduction: process.env['NODE_ENV'] === 'production',
} as const;

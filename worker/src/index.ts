import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { bindStore } from '../../shared/storage';
import {
  AppError,
  type ApiResponse,
  type AppData,
  type AuthRole,
  type ErrorCode,
} from '../../shared/types';
import {
  deleteAttendance,
  deleteEmployee,
  deleteInventoryItem,
  getData,
  patchInventoryQuantities,
  patchSettings,
  replaceData,
  upsertAttendance,
  upsertEmployees,
  upsertInventory,
  verifyPin,
} from '../../shared/domainService';
import { createKvStore } from './kvStorage';

type Env = {
  STORE: KVNamespace;
};

const app = new Hono<{ Bindings: Env }>();

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://chocokids.github.io',
];

app.use('*', async (c, next) => {
  bindStore(createKvStore(c.env.STORE));
  await next();
});

app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return ALLOWED_ORIGINS[0];
      if (ALLOWED_ORIGINS.includes(origin)) return origin;
      if (origin.endsWith('.github.io')) return origin;
      if (origin.startsWith('http://localhost:')) return origin;
      return ALLOWED_ORIGINS[0];
    },
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
);

function ok<T>(data: T, status = 200): Response {
  const body: ApiResponse<T> = { success: true, data };
  return Response.json(body, { status });
}

function fail(code: ErrorCode, message: string, status = 400): Response {
  const body: ApiResponse<never> = {
    success: false,
    error: { code, message },
  };
  return Response.json(body, { status });
}

function handleError(error: unknown): Response {
  if (error instanceof AppError) {
    const status =
      error.code === 'UNAUTHORIZED' || error.code === 'INVALID_PIN'
        ? 401
        : error.code === 'NOT_FOUND'
          ? 404
          : 400;
    return fail(error.code, error.message, status);
  }
  console.error(error);
  return fail('SERVER_ERROR', 'Server error', 500);
}

/** Strip PINs from responses to clients */
function publicData(data: AppData): AppData {
  return {
    ...data,
    settings: {
      bossPin: '',
      staffPin: '',
    },
  };
}

app.post('/api/auth', async (c) => {
  try {
    const body = (await c.req.json()) as { pin?: string; role?: AuthRole };
    if (!body.pin || !body.role) {
      return fail('INVALID_PIN', 'PIN and role required');
    }
    if (body.role !== 'boss' && body.role !== 'staff') {
      return fail('INVALID_REQUEST', 'Invalid role');
    }
    const valid = await verifyPin(body.role, body.pin);
    if (!valid) {
      return fail('INVALID_PIN', 'Incorrect PIN', 401);
    }
    return ok({ authenticated: true, role: body.role });
  } catch (error) {
    return handleError(error);
  }
});

app.get('/api/data', async () => {
  try {
    return ok(publicData(await getData()));
  } catch (error) {
    return handleError(error);
  }
});

app.put('/api/data', async (c) => {
  try {
    const body = (await c.req.json()) as AppData;
    // Preserve existing PINs if client sent empty (publicData stripped them)
    const current = await getData();
    const merged: AppData = {
      ...body,
      settings: {
        bossPin: body.settings?.bossPin || current.settings.bossPin,
        staffPin: body.settings?.staffPin || current.settings.staffPin,
      },
    };
    return ok(publicData(await replaceData(merged)));
  } catch (error) {
    return handleError(error);
  }
});

app.patch('/api/settings', async (c) => {
  try {
    const body = (await c.req.json()) as Partial<AppData['settings']>;
    return ok(publicData(await patchSettings(body)));
  } catch (error) {
    return handleError(error);
  }
});

app.patch('/api/inventory', async (c) => {
  try {
    const body = (await c.req.json()) as {
      quantities?: { id: number; quantity: number }[];
      items?: AppData['inventory'];
    };
    if (body.quantities) {
      return ok(publicData(await patchInventoryQuantities(body.quantities)));
    }
    if (body.items) {
      return ok(publicData(await upsertInventory(body.items)));
    }
    return fail('INVALID_REQUEST', 'quantities or items required');
  } catch (error) {
    return handleError(error);
  }
});

app.delete('/api/inventory/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    return ok(publicData(await deleteInventoryItem(id)));
  } catch (error) {
    return handleError(error);
  }
});

app.patch('/api/employees', async (c) => {
  try {
    const body = (await c.req.json()) as { employees: AppData['employees'] };
    return ok(publicData(await upsertEmployees(body.employees)));
  } catch (error) {
    return handleError(error);
  }
});

app.delete('/api/employees/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    return ok(publicData(await deleteEmployee(id)));
  } catch (error) {
    return handleError(error);
  }
});

app.post('/api/attendance', async (c) => {
  try {
    const body = (await c.req.json()) as Parameters<typeof upsertAttendance>[0];
    return ok(publicData(await upsertAttendance(body)));
  } catch (error) {
    return handleError(error);
  }
});

app.delete('/api/attendance/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    return ok(publicData(await deleteAttendance(id)));
  } catch (error) {
    return handleError(error);
  }
});

app.get('/api/backup', async () => {
  try {
    return ok(await getData());
  } catch (error) {
    return handleError(error);
  }
});

app.post('/api/backup', async (c) => {
  try {
    const body = (await c.req.json()) as AppData;
    return ok(await replaceData(body));
  } catch (error) {
    return handleError(error);
  }
});

app.get('/', (c) => c.text('Inventory Management API'));

app.all('*', (c) => fail('INVALID_REQUEST', `Not found: ${c.req.path}`, 404));

export default app;

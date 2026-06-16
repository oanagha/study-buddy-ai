import { API_URL } from "./config";

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
};

type ApiErrorBody = {
  status: "error";
  message: string;
  errors?: { field: string; message: string }[];
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export class ApiError extends Error {
  status: number;
  errors?: { field: string; message: string }[];

  constructor(status: number, message: string, errors?: { field: string; message: string }[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function postAuth<T>(path: string, payload: unknown, fallbackMessage: string): Promise<T> {
  const response = await fetch(`${API_URL}/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiErrorBody;
    throw new ApiError(
      response.status,
      error.message ?? fallbackMessage,
      error.errors,
    );
  }

  return data as T;
}

export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  const data = await postAuth<{ user: AuthUser }>("register", payload, "Registration failed");
  return data.user;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const data = await postAuth<{ token: string; user: AuthUser }>("login", payload, "Login failed");
  return { token: data.token, user: data.user };
}

export async function googleLogin(idToken: string): Promise<LoginResponse> {
  const data = await postAuth<{ token: string; user: AuthUser }>("google", { idToken }, "Google sign-in failed");
  return { token: data.token, user: data.user };
}

import { fetchJsonWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL = "/api/user";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface UserProfileResponse {
  user: UserProfile;
}

export interface UpdateUserProfileResponse {
  message: string;
  user: UserProfile;
}

export async function getCurrentUserProfile(): Promise<UserProfileResponse> {
  return await fetchJsonWithAuth<UserProfileResponse>(`${API_BASE_URL}/me`, {
    method: "GET",
    cache: "no-store",
  });
}

export async function updateCurrentUserProfile(data: {
  name?: string;
  phone?: string;
}): Promise<UpdateUserProfileResponse> {
  return await fetchJsonWithAuth<UpdateUserProfileResponse>(
    `${API_BASE_URL}/me`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export interface RoleDto {
  id: number;
  name: string;
  createdDate?: string; // Optional
  createdBy?: number; // Optional
  permanent?: boolean; // Optional
  endPoints?: EndPointDto[]; // Optional
}

export interface EndPointDto {
  id: number;
  url: string;
  name: string;
}

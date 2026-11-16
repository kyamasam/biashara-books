import { create } from "zustand";
import { axiosInstance } from "@/hooks/use-api";
import type { Paginated } from "@/types/common";
import type {
  Vehicle,
  VehicleClass,
  VehicleMake,
  VehicleModel,
  VehiclePayload,
} from "@/types/motor";

interface VehiclesState {
  vehicles: Paginated<Vehicle> | null;
  vehicleClasses: VehicleClass[];
  vehicleMakes: VehicleMake[];
  vehicleModels: VehicleModel[];

  isLoadingVehicles: boolean;
  isLoadingClasses: boolean;
  isLoadingMakes: boolean;
  isLoadingModels: boolean;
  isMutating: boolean;

  fetchVehicles: (params?: Record<string, unknown>) => Promise<void>;
  fetchVehicleClasses: () => Promise<void>;
  fetchVehicleMakes: () => Promise<void>;
  fetchVehicleModels: (makeId?: string | null) => Promise<void>;
  createVehicle: (payload: VehiclePayload) => Promise<Vehicle>;
  updateVehicle: (id: string, payload: Partial<VehiclePayload>) => Promise<Vehicle>;
  deleteVehicle: (id: string) => Promise<void>;
}

export const useVehiclesStore = create<VehiclesState>((set) => ({
  vehicles: null,
  vehicleClasses: [],
  vehicleMakes: [],
  vehicleModels: [],

  isLoadingVehicles: false,
  isLoadingClasses: false,
  isLoadingMakes: false,
  isLoadingModels: false,
  isMutating: false,

  fetchVehicles: async (params) => {
    set({ isLoadingVehicles: true });
    try {
      const { data } = await axiosInstance.get<Paginated<Vehicle>>("/motor/vehicles/", { params });
      set({ vehicles: data });
    } finally {
      set({ isLoadingVehicles: false });
    }
  },

  fetchVehicleClasses: async () => {
    set({ isLoadingClasses: true });
    try {
      const { data } = await axiosInstance.get<Paginated<VehicleClass>>("/motor/vehicle-classes/");
      set({ vehicleClasses: data.results });
    } finally {
      set({ isLoadingClasses: false });
    }
  },

  fetchVehicleMakes: async () => {
    set({ isLoadingMakes: true });
    try {
      const { data } = await axiosInstance.get<Paginated<VehicleMake>>("/motor/vehicle-makes/");
      set({ vehicleMakes: data.results });
    } finally {
      set({ isLoadingMakes: false });
    }
  },

  fetchVehicleModels: async (makeId) => {
    set({ isLoadingModels: true });
    try {
      const { data } = await axiosInstance.get<Paginated<VehicleModel>>("/motor/vehicle-models/", {
        params: makeId ? { vehicle_make: makeId } : undefined,
      });
      set({ vehicleModels: data.results });
    } finally {
      set({ isLoadingModels: false });
    }
  },

  createVehicle: async (payload) => {
    set({ isMutating: true });
    try {
      const { data } = await axiosInstance.post<Vehicle>("/motor/vehicles/", payload);
      return data;
    } finally {
      set({ isMutating: false });
    }
  },

  updateVehicle: async (id, payload) => {
    set({ isMutating: true });
    try {
      const { data } = await axiosInstance.patch<Vehicle>(`/motor/vehicles/${id}/`, payload);
      return data;
    } finally {
      set({ isMutating: false });
    }
  },

  deleteVehicle: async (id) => {
    set({ isMutating: true });
    try {
      await axiosInstance.delete(`/motor/vehicles/${id}/`);
    } finally {
      set({ isMutating: false });
    }
  },
}));

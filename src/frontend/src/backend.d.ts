import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface Record_ {
    id: string;
    cloudCover: number;
    latitude: number;
    predictedWeeklyOutput: number;
    precipitation: number;
    temperature: number;
    azimuthAngle: number;
    predictedYearlyOutput: number;
    predictedMonthlyOutput: number;
    zenithAngle: number;
    humidity: number;
    longitude: number;
    shortwaveRadiation: number;
    solarCapacity: number;
    timestamp: Timestamp;
    feasibilityStatus: FeasibilityStatus;
    locationName: string;
    predictedDailyOutput: number;
}
export interface CreatePredictionRequest {
    cloudCover: number;
    latitude: number;
    predictedWeeklyOutput: number;
    precipitation: number;
    temperature: number;
    azimuthAngle: number;
    predictedYearlyOutput: number;
    predictedMonthlyOutput: number;
    zenithAngle: number;
    humidity: number;
    longitude: number;
    shortwaveRadiation: number;
    solarCapacity: number;
    feasibilityStatus: FeasibilityStatus;
    locationName: string;
    predictedDailyOutput: number;
}
export enum FeasibilityStatus {
    good = "good",
    poor = "poor",
    moderate = "moderate",
    excellent = "excellent"
}
export interface backendInterface {
    addPrediction(request: CreatePredictionRequest): Promise<void>;
    clearAllPredictions(): Promise<void>;
    deletePrediction(id: string): Promise<void>;
    getAllPredictions(): Promise<Array<Record_>>;
}

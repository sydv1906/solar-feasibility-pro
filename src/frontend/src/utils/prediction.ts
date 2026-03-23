// Linear Regression simulation based on domain-knowledge coefficients
// Modeled after typical residential solar system (0–12 kW range)

export interface PredictionInput {
  temperature: number; // °C
  irradiance: number; // W/m²
  humidity: number; // %
}

export interface PredictionResult {
  powerOutput: number; // kW
  feasibilityStatus: "excellent" | "moderate" | "poor";
  feasibilityScore: number; // 0–100
  confidenceScore: number; // 0–100
  recommendation: string;
}

export function predictPowerOutput(input: PredictionInput): PredictionResult {
  const { temperature, irradiance, humidity } = input;
  let power =
    0.0085 * irradiance + 0.012 * temperature - 0.025 * humidity + 0.5;
  power = Math.max(0, Math.min(12, power));
  power = Math.round(power * 100) / 100;

  let feasibilityStatus: "excellent" | "moderate" | "poor";
  let feasibilityScore: number;
  let confidenceScore: number;
  let recommendation: string;

  if (power > 7) {
    feasibilityStatus = "excellent";
    feasibilityScore = Math.min(100, Math.round(80 + ((power - 7) / 5) * 20));
    confidenceScore = Math.round(88 + Math.random() * 8);
    recommendation =
      "This location is highly suitable for installing a solar power system. Excellent ROI expected.";
  } else if (power >= 4) {
    feasibilityStatus = "moderate";
    feasibilityScore = Math.round(50 + ((power - 4) / 3) * 29);
    confidenceScore = Math.round(76 + Math.random() * 10);
    recommendation =
      "This location has moderate solar potential. Installation is viable with standard efficiency panels.";
  } else {
    feasibilityStatus = "poor";
    feasibilityScore = Math.round((power / 4) * 49);
    confidenceScore = Math.round(65 + Math.random() * 12);
    recommendation =
      "This location is not ideal for solar installation due to low power generation potential.";
  }

  return {
    powerOutput: power,
    feasibilityStatus,
    feasibilityScore,
    confidenceScore: Math.min(99, confidenceScore),
    recommendation,
  };
}

export function generateScatterData(
  type: "irradiance" | "temperature" | "humidity",
  count = 60,
) {
  const data: { x: number; power: number }[] = [];
  for (let i = 0; i < count; i++) {
    let x: number;
    let power: number;
    if (type === "irradiance") {
      x = Math.round(100 + Math.random() * 1100);
      power = predictPowerOutput({
        temperature: 25,
        irradiance: x,
        humidity: 50,
      }).powerOutput;
    } else if (type === "temperature") {
      x = Math.round(-5 + Math.random() * 55);
      power = predictPowerOutput({
        temperature: x,
        irradiance: 700,
        humidity: 50,
      }).powerOutput;
    } else {
      x = Math.round(Math.random() * 100);
      power = predictPowerOutput({
        temperature: 25,
        irradiance: 700,
        humidity: x,
      }).powerOutput;
    }
    const noise = (Math.random() - 0.5) * 0.8;
    data.push({
      x,
      power: Math.max(0, Math.round((power + noise) * 100) / 100),
    });
  }
  return data.sort((a, b) => a.x - b.x);
}

export function generateDistributionData() {
  const bins = [
    { range: "0-2", count: 0 },
    { range: "2-4", count: 0 },
    { range: "4-6", count: 0 },
    { range: "6-8", count: 0 },
    { range: "8-10", count: 0 },
    { range: "10-12", count: 0 },
  ];
  for (let i = 0; i < 500; i++) {
    const irr = 100 + Math.random() * 1100;
    const temp = -5 + Math.random() * 55;
    const hum = Math.random() * 100;
    const p = predictPowerOutput({
      temperature: temp,
      irradiance: irr,
      humidity: hum,
    }).powerOutput;
    const idx = Math.min(5, Math.floor(p / 2));
    bins[idx].count++;
  }
  return bins;
}
